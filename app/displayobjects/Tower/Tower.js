import { Graphics } from "pixi.js";
import {
  gridPosition,
  gridTileSize,
  gridDistance,
  gridMoveTowards,
} from "../../grid/Grid";
import { GridStore } from "../../stores/Store";
import { Targeting } from "../../constants/AppConstants";
import Bullet from "../Bullet/Bullet";
import { addBullet } from "../../stores/GridStore";

export default class Tower extends Graphics {
  constructor(x, y, args = {}) {
    super();
    const tileSize = gridTileSize();
    const size = 30;
    this.type = args.type ? args.type : 0;
    this.range = tileSize * 1.5;
    this.lineOfSight = tileSize * 2;
    this.maxDelay = 10;
    this.damage = 2;
    this.distance = 10;
    this.delay = 0;

    const screenPos = gridPosition(x, y);
    const colour = 0xaaaaff;

    switch (this.type) {
      case 2:
        this.lineStyle(1, colour);
        this.drawCircle(0, 0, size / 2);

        this.damage = 10;
        this.maxDelay = 120;
        this.range = tileSize * 5;
        this.lineOfSight = tileSize * 7;
        this.distance = 50;
        break;
      case 1:
        this.lineStyle(1, colour)
          .moveTo(0, -size / 2)
          .lineTo(-size / 2, size / 2)
          .lineTo(size / 2, size / 2)
          .lineTo(0, -size / 2);
        this.maxDelay = 90;
        this.range = tileSize * 3;
        this.lineOfSight = tileSize * 5;
        this.damage = 5;
        this.distance = 20;
        break;
      default:
        this.lineStyle(1, colour);
        this.drawRect(-size * 0.5, -size * 0.5, size, size);
        break;
    }
    this.position.set(screenPos.x, screenPos.y);
  }

  update() {
    if (this.delay > 0) {
      this.delay--;
      return;
    }

    const enemyList = GridStore.getState().enemies;

    switch (this.targeting) {
      case Targeting.LAST:
        enemyList.reverse();
        break;
      case Targeting.STRONGEST:
        enemyList.sort((a, b) => {
          return b.maxHealth - a.maxHealth;
        });
        break;
      case Targeting.WEAKEST:
        enemyList.sort((a, b) => {
          return a.maxHealth - b.maxHealth;
        });
        break;
    }

    const enemies = GridStore.getState().enemies;
    for (var i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      const dist = gridDistance(
        this.position.x,
        this.position.y,
        enemy.position.x,
        enemy.position.y
      );
      if (Math.abs(dist) < this.lineOfSight) {
        if (this.isEnemyAlreadyDead(enemy)) {
          continue;
        }

        if (this.shoot(enemy)) {
          this.delay = this.maxDelay;

          if (this.delay > 0) {
            break;
          }
        }
      }
    }
  }

  /**
   * Check to see if existing bullets aimed at enemy is already killing it
   * @param {Enemy} enemy
   */
  isEnemyAlreadyDead(enemy) {
    const bullets = GridStore.getState().bullets;
    let preEnemyDamage = enemy.health;
    for (var b = 0; b < bullets.length; b++) {
      const bullet = bullets[b];
      if (bullet.enemy != enemy) {
        continue;
      }
      preEnemyDamage -= bullet.damage;
      if (preEnemyDamage <= 0) {
        return true;
      }
    }

    return false;
  }

  shoot(enemy) {
    const distance = this.distance;
    const tileSize = gridTileSize();

    // 1. calculate where enemy will be in in X ms
    let found = false;
    let oldX = enemy.position.x;
    let oldY = enemy.position.y;
    let distanceTravelled = 0;

    for (let i = 0; i < enemy.targets.length; i++) {
      const target = gridPosition(enemy.targets[i].x, enemy.targets[i].y);

      let virtualMove = gridMoveTowards(
        oldX,
        oldY,
        target.x,
        target.y,
        distance - distanceTravelled
      );

      distanceTravelled += Math.max(
        Math.abs(virtualMove.x),
        Math.abs(virtualMove.y)
      );

      oldX += virtualMove.x;
      oldY += virtualMove.y;

      // console.log(bullet.x, bullet.y, oldX, oldY);

      if (distanceTravelled >= distance) {
        found = true;
        break;
      }
    }

    if (false === found) {
      return false;
    }

    // Calculate distance between start and end
    const shootDistance = gridDistance(
      this.position.x,
      this.position.y,
      oldX,
      oldY
    );

    if (shootDistance < this.range) {
      const bullet = new Bullet({
        type: this.type,
        enemy: enemy,
        damage: this.damage,
        distance: shootDistance / (distance / enemy.speed),
        splashSize: this.type == 2 ? (tileSize * 2.5) / 2 : 0,
      });
      bullet.setPath(this.position.x, this.position.y, oldX, oldY);
      this.parent.addChild(bullet);
      GridStore.dispatch(addBullet(bullet));
      this.isShooting = true;
      return true;
    }
    return false;
  }
}
