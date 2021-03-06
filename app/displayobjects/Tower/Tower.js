import { Graphics, Text } from "pixi.js";
import {
  gridPosition,
  gridTileSize,
  gridDistance,
  predictEnemyPosition,
  calculateAngle360,
  degreesToRadians,
} from "../../grid/Grid";
import { GridStore } from "../../stores/Store";
import {
  Targeting,
  towerBaseStats,
  towerUpgradeStats,
} from "../../constants/AppConstants";
import Bullet from "../Bullet/Bullet";
import { addBullet } from "../../stores/GridStore";
import Arc from "../Bullet/Arc";

export default class Tower extends Graphics {
  constructor(x, y, args = {}) {
    super();
    const screenPos = gridPosition(x, y);
    this.type = args.type ? args.type : 0;
    this.level = args.level ? args.level : 1;
    this.bullets = [];

    const colour = 0xaaaaff;
    const fontSize = 12;
    this.text = new Text(this.level, {
      fontFamily: "Arial",
      fontSize: fontSize,
      lineHeight: fontSize * 1.2,
      fill: colour,
      align: "center",
    });
    this.text.anchor.set(0.5, 0.5);
    this.addChild(this.text);

    this.applyStats();
    this.position.set(screenPos.x, screenPos.y);
  }

  applyStats() {
    const stats = towerBaseStats;
    if (this.level === 1) {
      this.delay = 0;
    }
    this.range = stats[this.type].range ? stats[this.type].range : 1;
    this.sight = stats[this.type].sight ? stats[this.type].sight : 1;
    this.damage = stats[this.type].damage ? stats[this.type].damage : 1;
    this.maxDelay = stats[this.type].delay ? stats[this.type].delay : 10;
    this.splash = stats[this.type].splash ? stats[this.type].splash : 0;
    this.arc = stats[this.type].arc ? stats[this.type].arc : 0;
    this.distance = stats[this.type].distance ? stats[this.type].distance : 10;
    this.cost = stats[this.type].cost ? stats[this.type].cost : 100;
    this.targeting = stats[this.type].targeting
      ? stats[this.type].targeting
      : Targeting.DEFAULT;
    this.maxBullets = stats[this.type].maxBullets
      ? stats[this.type].maxBullets
      : 0;

    // console.log(this.level);
    for (const [key, value] of Object.entries(towerUpgradeStats[this.type])) {
      this[key] = value(this);
      console.log(this.level, key, this[key]);
    }

    const size = 30;
    const colour = 0xaaaaff;

    switch (this.type) {
      case 3:
        this.lineStyle(1, colour);
        this.drawCircle(0, 0, size / 2);
        break;
      case 2:
        this.lineStyle(1, colour)
          .moveTo(0, -size / 2) // 0, -15
          .lineTo(size / 2, 0) // 15, 0
          .lineTo(0, size / 2) // 0, 15
          .lineTo(-size / 2, 0) // -15, 0
          .lineTo(0, -size / 2);
        break;
      case 1:
        this.lineStyle(1, colour)
          .moveTo(0, -size / 2)
          .lineTo(-size / 2, size / 2)
          .lineTo(size / 2, size / 2)
          .lineTo(0, -size / 2);
        break;
      default:
        this.lineStyle(1, colour);
        this.drawRect(-size * 0.5, -size * 0.5, size, size);
        break;
    }

    // write text
    this.text.text = this.level;
    // this.addChild(text);
  }

  getCost() {
    return this.cost * Math.pow(2, this.level - 1); //  Math.max(this.cost, this.cost * this.level);
  }

  update() {
    // apply active bullet limit
    if (this.maxBullets > 0 && this.bullets.length >= this.maxBullets) {
      return;
    }

    // console.log(this.delay, this.maxDelay);

    if (this.delay > 0) {
      this.delay--;
      return;
    }

    const targets = this.getEnemyTargets();
    if (targets.length > 0) {
      for (let i = 0; i < targets.length; i++) {
        const enemy = targets[i];
        if (this.shoot(enemy)) {
          this.delay = this.maxDelay;

          if (this.delay > 0) {
            break;
          }
        }
      }
    }
  }

  sortEnemyTargets(enemies) {
    const enemyList = [...enemies];
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
      default:
        enemyList.sort((a, b) => {
          return b.distanceTravelled - a.distanceTravelled;
        });
        break;
    }

    return enemyList;
  }

  getEnemyTargets(single = false) {
    let targets = [];
    const enemyList = this.sortEnemyTargets(GridStore.getState().enemies);

    // const enemies = GridStore.getState().enemies;
    for (var i = 0; i < enemyList.length; i++) {
      const enemy = enemyList[i];
      const dist = gridDistance(
        this.position.x,
        this.position.y,
        enemy.position.x,
        enemy.position.y
      );

      if (Math.abs(dist) < this.getSight()) {
        if (this.isEnemyAlreadyDead(enemy)) {
          continue;
        }

        targets.push(enemy);
        if (single) {
          break;
        }
      }
    }

    return targets;
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
      if (
        bullet.enemy != enemy &&
        !bullet.isEnemyInSplashRadius(
          bullet.targetX,
          bullet.targetY,
          this.getSplash(),
          enemy
        )
      ) {
        continue;
      }
      preEnemyDamage -= bullet.damage;
      if (preEnemyDamage <= 0) {
        return true;
      }
    }

    return false;
  }

  getRange() {
    const tileSize = gridTileSize();
    return this.range * tileSize;
  }

  getSight() {
    const tileSize = gridTileSize();
    return this.sight * tileSize;
  }

  getSplash() {
    const tileSize = gridTileSize();
    return this.splash * tileSize;
  }

  shoot(enemy) {
    const distance = this.distance;

    // 1. calculate where enemy will be in in X ms
    const prediction = predictEnemyPosition(enemy, distance);
    if (!prediction) {
      return false;
    }

    // Calculate distance between start and end
    const shootDistance = gridDistance(
      this.position.x,
      this.position.y,
      prediction.x,
      prediction.y
    );

    if (shootDistance < this.getRange()) {
      if (this.arc > 0) {
        const arc = new Arc(this, {
          degrees: this.arc,
          range: this.getRange(),
          damage: this.damage,
          distance: shootDistance / (distance / enemy.speed),
        });
        arc.setPath(
          this.position.x,
          this.position.y,
          prediction.x - this.position.x,
          prediction.y - this.position.y
        );

        this.bullets.push(arc);
        this.parent.addChild(arc);
        GridStore.dispatch(addBullet(arc));
      } else {
        const bullet = new Bullet(this, {
          type: this.type,
          enemy: enemy,
          damage: this.damage,
          distance: shootDistance / (distance / enemy.speed),
          splash: this.getSplash(),
        });
        bullet.setPath(
          this.position.x,
          this.position.y,
          prediction.x,
          prediction.y
        );

        this.bullets.push(bullet);
        this.parent.addChild(bullet);
        GridStore.dispatch(addBullet(bullet));
      }

      this.isShooting = true;
      return true;
    }
    return false;
  }
}
