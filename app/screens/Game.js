import { Container, Graphics } from "pixi.js";
import Store from "../stores/Store";
import Grid, {
  gridDistance,
  gridPosition,
  gridMoveTowards,
} from "../grid/Grid";
import { AnimationStore, GridStore } from "../stores/Store";
import {
  addEnemy,
  removeEnemy,
  addTower,
  addBullet,
  removeBullet,
  updateSize,
} from "../stores/GridStore";
import Enemy from "../displayobjects/Enemy/Enemy";
import Bullet from "../displayobjects/Bullet/Bullet";
import Tile from "../displayobjects/Tile/Tile";

const Targeting = {
  DEFAULT: Symbol("default"),
  LAST: Symbol("last"),
  STRONGEST: Symbol("strongest"),
  WEAKEST: Symbol("weakest"),
};

/**
 * Main Display Object
 *
 * @exports Game
 * @extends Container
 */
export default class Game extends Container {
  constructor(...args) {
    super(args);

    this.enemiesKilled = 0;
    this.enemiesTotal = 0;

    this.tileSize = 50;
    this.tileX = 10;
    this.tileY = 10;

    this.tiles = [];
    this.enemies = [];
    // this.towers = [];
    // this.bullets = [];

    // GridStore.subscribe(() => {
    //   console.log(GridStore.getState());
    // });

    this.addGrid();

    this.addTower(1, 3, { targeting: Targeting.WEAKEST, type: 0 });
    this.addTower(3, 3, { targeting: Targeting.DEFAULT, type: 0 });
    this.addTower(6, 6, { targeting: Targeting.WEAKEST, type: 0 });

    this.addTower(3, 4, { targeting: Targeting.STRONGEST, type: 1 });

    this.addTower(5, 2, { targeting: Targeting.DEFAULT, type: 2 });
    this.addTower(5, 3, { targeting: Targeting.WEAKEST, type: 2 });
    this.addTower(6, 2, { targeting: Targeting.LAST, type: 2 });
    this.addTower(6, 3, { targeting: Targeting.STRONGEST, type: 2 });

    let timer = 0;
    let maxTime = 10;
    let enemies = -1;
    const path = [
      { x: 2, y: 0 },
      { x: 2, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: 9 },
    ];

    this.drawPath(path);

    AnimationStore.subscribe(() => {
      // Update All Towers
      // this.enemies.forEach((enemy) => {
      //   enemy.update();
      // });
      // GridStore.getState().towers.forEach((tower) => {
      //   tower.update();
      // });
      // Update All Bullets
      GridStore.getState().bullets.forEach((bullet) => {
        bullet.update();

        if (bullet.isComplete()) {
          bullet.destroy();
          GridStore.dispatch(removeBullet(bullet));
        }
      });

      // Update All Enemies
      GridStore.getState().enemies.forEach((enemy) => {
        enemy.update();

        if (enemy.health <= 0 || enemy.targets.length <= 0) {
          enemy.destroy();
          GridStore.dispatch(removeEnemy(enemy));
        }
      });
    });

    const cancelStore = AnimationStore.subscribe(() => {
      if (enemies === 1) {
        cancelStore();
        return;
      }

      timer +=
        AnimationStore.getState().tick - AnimationStore.getState().previousTick;

      if (timer > maxTime) {
        timer -= maxTime;
        maxTime -= 0.5; //0.05;
        maxTime = Math.max(maxTime, 10);
        this.spawnEnemy(path, {
          level: Math.random() * 10,
          speed: Math.random() * 3 + 1,
        });
        if (enemies > -1) {
          enemies--;
        }
      }
    });
  }

  spawnEnemy(path, args = {}) {
    this.addEnemy(path, args);
    console.log("Score: " + this.enemiesKilled + "/" + this.enemiesTotal);
  }

  addGrid() {
    GridStore.dispatch(updateSize(10, 10, 50));

    this.grid = new Grid(this.tileX, this.tileY);

    for (let i = 0; i < this.grid.size(); i++) {
      const coord = this.grid.coord(i);
      this.addTile(coord.x, coord.y);
    }

    Store.subscribe(() => {
      const {
        width,
        height,
        canvasWidth,
        canvasHeight,
      } = Store.getState().Renderer;

      this.resizeGrid(width, height, canvasWidth, canvasHeight);
    });

    this.resizeGrid(window.innerWidth, window.innerHeight);
  }

  resizeGrid(width, height, tw = 1920, th = 1080) {
    this.position.x = width / 2 - (this.tileSize * this.tileX) / 2;
    this.position.y = height / 2 - (this.tileSize * this.tileY) / 2;
    this.width = this.tileX * this.tileSize;
    this.height = this.tileY * this.tileSize;
  }

  addTile(x, y) {
    const tile = new Tile(x, y);
    this.tiles.push(tile);
    this.addChild(tile);
  }

  drawPath(path) {
    for (var i = 1; i < path.length; i++) {
      let line = new Graphics();
      // line.position.set(
      //   path[i - 1].x * this.tileSize + this.tileSize / 2,
      //   path[i - 1].y * this.tileSize + this.tileSize / 2
      // );
      line
        .lineStyle(1, 0x333355)
        .moveTo(
          path[i - 1].x * this.tileSize + this.tileSize / 2,
          path[i - 1].y * this.tileSize + this.tileSize / 2
        )
        .lineTo(
          path[i].x * this.tileSize + this.tileSize / 2,
          path[i].y * this.tileSize + this.tileSize / 2
        );

      this.addChild(line);
    }
  }

  addEnemy(path = [], args = {}) {
    this.enemiesTotal++;

    const enemy = new Enemy(args);
    this.addChild(enemy);

    enemy.setPath([...path]);
    GridStore.dispatch(addEnemy(enemy));
  }

  addTower(x, y, args = {}) {
    const width = 30;
    const type = args.type ? args.type : 0;
    let range = this.tileSize * 1.5;
    let lineOfSight = this.tileSize * 2;
    let delay = 10;
    let damage = 2;
    let distance = 10;

    const screenX = x * this.tileSize + this.tileSize / 2;
    const screenY = y * this.tileSize + this.tileSize / 2;

    let rectangle = new Graphics();
    switch (type) {
      case 2:
        rectangle.lineStyle(1, 0xccccff);
        rectangle.drawCircle(0, 0, width / 2);

        damage = 10;
        delay = 120;
        range = this.tileSize * 5;
        lineOfSight = this.tileSize * 7;
        distance = 50;
        break;
      case 1:
        rectangle
          .lineStyle(1, 0xccccff)
          .moveTo(0, -width / 2)
          .lineTo(-width / 2, width / 2);

        rectangle
          .lineStyle(1, 0xccccff)
          .moveTo(0, -width / 2)
          .lineTo(width / 2, width / 2);

        rectangle
          .lineStyle(1, 0xccccff)
          .moveTo(-width / 2, width / 2)
          .lineTo(width / 2, width / 2);
        delay = 90;
        range = this.tileSize * 3;
        lineOfSight = this.tileSize * 5;
        damage = 5;
        distance = 20;
        break;
      default:
        rectangle.lineStyle(1, 0xaaaaff);
        rectangle.drawRect(-width * 0.5, -width * 0.5, width, width);
        break;
    }

    rectangle.position.x = screenX;
    rectangle.position.y = screenY;

    const tower = {
      sprite: rectangle,
      distance: distance,
      delay: 0,
      maxDelay: delay,
      range: range,
      lineOfSight: lineOfSight,
      isShooting: false,
      damage: damage,
      type: type,
      targeting: args.targeting ? args.targeting : Targeting.DEFAULT,
    };

    this.addChild(rectangle);
    GridStore.dispatch(addTower(tower));
    // this.towers.push(tower);

    const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
      if (tower.delay > 0) {
        tower.delay--;
        return;
      }

      const enemyList = GridStore.getState().enemies;

      switch (tower.targeting) {
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

      // TODO: Switch to new enemy format

      const enemies = GridStore.getState().enemies;
      for (var i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const dist = gridDistance(
          tower.sprite.x,
          tower.sprite.y,
          enemy.position.x,
          enemy.position.y
        );
        if (Math.abs(dist) < tower.lineOfSight) {
          if (this.shootPredictionBasedOnSetTime(tower, enemy)) {
            tower.delay = tower.maxDelay;

            if (tower.delay > 0) {
              break;
            }
          }
        }
      }
    });
  }

  shootFollow(tower, enemy) {
    // console.log(tower, enemy);
    tower.isShooting = true;

    const width = 5;

    let bullet = new Graphics();
    bullet.beginFill(0xccccff);
    bullet.drawRect(-width * 0.5, -width * 0.5, width, width);
    // bullet.drawRect(0, 0, width, width);
    bullet.endFill();
    bullet.interactive = true;
    // bullet.pivot.set(width / 2, width / 2);
    bullet.x = tower.sprite.x;
    bullet.y = tower.sprite.y;

    const bulletData = {
      sprite: bullet,
      target: enemy,
    };

    this.addChild(bulletData.sprite);

    GridStore.dispatch(addBullet(bulletData));
    // this.bullets.push(bulletData);

    const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
      // const bullets = GridStore.getState().bullets;

      if (enemy.health <= 0) {
        bulletData.sprite.destroy();
        GridStore.dispatch(removeBullet(bulletData));
        cancelAnimationStoreSubscription();
        tower.isShooting = false;
        return;
      }

      const move = gridMoveTowards(
        bulletData.sprite.x,
        bulletData.sprite.y,
        bulletData.target.sprite.x,
        bulletData.target.sprite.y,
        4
      );
      bulletData.sprite.position.x += move.x;
      bulletData.sprite.position.y += move.y;

      if (
        bulletData.sprite.position.x >=
          bulletData.target.sprite.x - bulletData.target.sprite.width / 2 &&
        bulletData.sprite.position.x <=
          bulletData.target.sprite.x + bulletData.target.sprite.width / 2
      ) {
        bulletData.target.health--;
        bulletData.sprite.destroy();
        GridStore.dispatch(removeBullet(bulletData));
        cancelAnimationStoreSubscription();
        tower.isShooting = false;
        return;
      }
    });
  }

  shootPredictionBasedOnSetTime(tower, enemy) {
    const distance = tower.distance;

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
      tower.sprite.x,
      tower.sprite.y,
      oldX,
      oldY
    );

    if (shootDistance < tower.range) {
      const bullet = new Bullet({
        type: tower.type,
        enemy: enemy,
        damage: tower.damage,
        distance: shootDistance / (distance / enemy.speed),
        splashSize: tower.type == 2 ? (this.tileSize * 2.5) / 2 : 0,
      });
      bullet.setPath(tower.sprite.x, tower.sprite.y, oldX, oldY);
      this.addChild(bullet);
      GridStore.dispatch(addBullet(bullet));
      tower.isShooting = true;

      return true;
    }
  }
}
