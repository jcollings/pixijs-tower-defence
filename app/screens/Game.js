import { Container, Graphics } from "pixi.js";
import Store from "../stores/Store";
import Grid from "../grid/Grid";
import { AnimationStore } from "../stores/Store";

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

    this.tileSize = 50;
    this.tileX = 10;
    this.tileY = 10;

    this.tiles = [];
    this.enemies = [];
    this.towers = [];
    this.bullets = [];

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
  }

  addGrid() {
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
    let rectangle = new Graphics();
    // rectangle.lineStyle(1, 0xFF3300, 1);
    if (x % 2 == (y % 2 == 1 ? 0 : 1)) {
      rectangle.beginFill(0x000011);
    } else {
      rectangle.beginFill(0x111122);
    }

    rectangle.drawRect(0, 0, this.tileSize, this.tileSize);
    rectangle.endFill();
    rectangle.x = x * this.tileSize;
    rectangle.y = y * this.tileSize;

    // rectangle.on("mousedown", (e) => {
    //   console.log("clicked", x, y, this.grid.index(x, y));
    // });

    rectangle.interactive = true;

    this.tiles.push(rectangle);
    this.addChild(rectangle);
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
    var targets = [...path];
    const level = args.level ? args.level : 0;
    const width = 8 + level;
    const speed = args.speed ? args.speed : 2;
    const health = 5 + level;

    const { x, y } = targets.shift();

    let rectangle = new Graphics();
    rectangle.beginFill(0xccccff);
    rectangle.drawRect(-width * 0.5, -width * 0.5, width, width);
    // rectangle.drawRect(0, 0, width, width);
    rectangle.endFill();
    rectangle.interactive = true;
    // rectangle.pivot.set(0.5, width / 2);
    rectangle.x = x * this.tileSize + this.tileSize / 2;
    rectangle.y = y * this.tileSize + this.tileSize / 2;

    // rectangle.on("mousedown", (e) => {
    //   console.log("clicked", x, y, this.grid.index(x, y));
    // });

    let enemy = {
      sprite: rectangle,
      maxHealth: health,
      health: health,
      speed: speed,
      targets: targets,
    };

    this.enemies.push(enemy);
    this.addChild(enemy.sprite);

    const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
      const tick = AnimationStore.getState();

      if (enemy.health <= 0 || targets.length <= 0) {
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        enemy.sprite.destroy();
        cancelAnimationStoreSubscription();
        return;
      }

      const healthPercentage = enemy.health / enemy.maxHealth;

      if (healthPercentage < 0.3) {
        enemy.sprite.clear();
        enemy.sprite.beginFill(0xff0000);
        enemy.sprite.drawRect(-width * 0.5, -width * 0.5, width, width);
        enemy.sprite.endFill();
      } else if (healthPercentage < 0.5) {
        enemy.sprite.clear();
        enemy.sprite.beginFill(0x00ff00);
        enemy.sprite.drawRect(-width * 0.5, -width * 0.5, width, width);
        enemy.sprite.endFill();
      } else if (healthPercentage < 1) {
        enemy.sprite.clear();
        enemy.sprite.beginFill(0x0000ff);
        enemy.sprite.drawRect(-width * 0.5, -width * 0.5, width, width);
        enemy.sprite.endFill();
      }

      const targetX = targets[0].x;
      const targetY = targets[0].y;

      const move = this.moveTowards(
        enemy.sprite.x,
        enemy.sprite.y,
        targetX * this.tileSize + this.tileSize / 2,
        targetY * this.tileSize + this.tileSize / 2,
        speed
      );
      enemy.sprite.position.x += move.x;
      enemy.sprite.position.y += move.y;

      if (move.x == 0 && move.y == 0) {
        enemy.targets.shift();
      }
    });
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
    this.towers.push(tower);

    const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
      if (tower.delay > 0) {
        tower.delay--;
        return;
      }

      const enemyList = [...this.enemies];

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

      for (var i = 0; i < enemyList.length; i++) {
        const e = enemyList[i];

        const dist = this.distance(
          tower.sprite.x,
          tower.sprite.y,
          e.sprite.position.x,
          e.sprite.position.y
        );

        if (Math.abs(dist) < tower.lineOfSight) {
          if (this.shootPredictionBasedOnSetTime(tower, e)) {
            tower.delay = tower.maxDelay;

            if (tower.delay > 0) {
              break;
            }
          }
        }
      }
    });
  }

  moveTowards(x, y, tx, ty, distance) {
    const dx = tx - x;
    const dy = ty - y;
    const angle = Math.atan2(dy, dx);
    const maxDistance = this.distance(x, y, tx, ty);

    return {
      x: Math.min(maxDistance, distance * Math.cos(angle)),
      y: Math.min(maxDistance, distance * Math.sin(angle)),
    };
  }

  distance(x1, y1, x2, y2) {
    const a = x1 - x2;
    const b = y1 - y2;
    return Math.sqrt(a * a + b * b);
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

    this.bullets.push(bulletData);

    const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
      if (enemy.health <= 0) {
        this.bullets.splice(this.bullets.indexOf(bulletData), 1);
        bulletData.sprite.destroy();
        cancelAnimationStoreSubscription();
        tower.isShooting = false;
        return;
      }

      const move = this.moveTowards(
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
        this.bullets.splice(this.bullets.indexOf(bulletData), 1);
        bulletData.sprite.destroy();
        cancelAnimationStoreSubscription();
        tower.isShooting = false;
        return;
      }
    });
  }

  shootPredictionBasedOnSetTime(tower, enemy) {
    const distance = tower.distance;

    const width = Math.max(8, 1 * tower.damage);

    const bulletData = {
      sprite: null,
      target: enemy,
      targetX: -1,
      targetY: -1,
      distance: -1,
    };

    // 1. calculate where enemy will be in in X ms
    let found = false;
    let oldX = enemy.sprite.x;
    let oldY = enemy.sprite.y;
    let distanceTravelled = 0;

    for (let i = 0; i < bulletData.target.targets.length; i++) {
      const targetX =
        bulletData.target.targets[i].x * this.tileSize + this.tileSize / 2;
      const targetY =
        bulletData.target.targets[i].y * this.tileSize + this.tileSize / 2;

      let virtualMove = this.moveTowards(
        oldX,
        oldY,
        targetX,
        targetY,
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

    bulletData.targetX = oldX;
    bulletData.targetY = oldY;

    // Calculate distance between start and end
    const shootDistance = this.distance(
      tower.sprite.x,
      tower.sprite.y,
      bulletData.targetX,
      bulletData.targetY
    );

    if (shootDistance < tower.range) {
      let bullet = new Graphics();
      bullet.beginFill(0xccccff);
      switch (tower.type) {
        case 2:
          bullet.drawCircle(0, 0, width / 2);

          break;
        case 1:
          bullet
            .lineStyle(1, 0xccccff)
            .moveTo(0, -width / 2)
            .lineTo(-width / 2, width / 2);

          bullet
            .lineStyle(1, 0xccccff)
            .moveTo(0, -width / 2)
            .lineTo(width / 2, width / 2);

          bullet
            .lineStyle(1, 0xccccff)
            .moveTo(-width / 2, width / 2)
            .lineTo(width / 2, width / 2);
          break;
        default:
          bullet.drawRect(-width * 0.5, -width * 0.5, width, width);
          break;
      }
      bullet.endFill();

      bullet.x = tower.sprite.x;
      bullet.y = tower.sprite.y;

      bulletData.sprite = bullet;

      this.addChild(bulletData.sprite);
      this.bullets.push(bulletData);

      tower.isShooting = true;
      bulletData.distance = shootDistance / (distance / enemy.speed);

      // 2. Shoot at that position
      const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
        // if (enemy.health <= 0) {
        //   this.bullets.splice(this.bullets.indexOf(bulletData), 1);
        //   bulletData.sprite.destroy();
        //   cancelAnimationStoreSubscription();
        //   tower.isShooting = false;
        //   return;
        // }

        const maxDistance = this.distance(
          bulletData.sprite.x,
          bulletData.sprite.y,
          bulletData.targetX,
          bulletData.targetY
        );

        const move = this.moveTowards(
          bulletData.sprite.x,
          bulletData.sprite.y,
          bulletData.targetX,
          bulletData.targetY,
          Math.min(bulletData.distance, maxDistance)
        );

        bulletData.sprite.position.x += move.x;
        bulletData.sprite.position.y += move.y;

        if (move.x == 0 || move.y == 0) {
          if (tower.type == 2) {
            const splashRadius = (this.tileSize * 2.5) / 2;

            let splash = new Graphics();
            let splashData = {
              max: 5,
              counter: 5,
              x: bulletData.sprite.position.x,
              y: bulletData.sprite.position.y,
              radius: splashRadius,
            };
            this.addChild(splash);

            const cancelSplashAnimationStoreSubscription = AnimationStore.subscribe(
              () => {
                if (splashData.counter > 0) {
                  splashData.counter--;

                  splash.clear();
                  splash.beginFill(
                    0xeeeeff,
                    0.5 //Math.min(0.5, splashData.counter / splashData.max)
                  );
                  splash.drawCircle(
                    splashData.x,
                    splashData.y,
                    splashData.radius *
                      (1 - splashData.counter / splashData.max)
                  );
                  splash.endFill();
                  return;
                }

                splash.clear();
                splash.destroy();
                cancelSplashAnimationStoreSubscription();
              }
            );

            // splash radius
            for (
              let enemyIndex = 0;
              enemyIndex < this.enemies.length;
              enemyIndex++
            ) {
              if (
                this.isInCicle(
                  this.enemies[enemyIndex].sprite.x,
                  this.enemies[enemyIndex].sprite.y,
                  bulletData.sprite.position.x,
                  bulletData.sprite.position.y,
                  splashRadius
                )
              ) {
                this.enemies[enemyIndex].health -= tower.damage;
              }
            }
          } else {
            bulletData.target.health -= tower.damage;
          }

          // bulletData.target.health -= tower.damage;
          this.bullets.splice(this.bullets.indexOf(bulletData), 1);
          bulletData.sprite.clear();
          bulletData.sprite.destroy();
          cancelAnimationStoreSubscription();
          tower.isShooting = false;
          return;
        }
      });

      return true;
    }
  }

  isInCicle(a, b, x, y, r) {
    var dist_points = (a - x) * (a - x) + (b - y) * (b - y);
    r *= r;
    if (dist_points < r) {
      return true;
    }
    return false;
  }
}
