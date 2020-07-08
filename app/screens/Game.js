import { Container, Graphics } from "pixi.js";
import Store from "../stores/Store";
import Grid from "../grid/Grid";
import { AnimationStore } from "../stores/Store";

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

    this.addGrid();

    this.addTower(3, 4);
    this.addTower(1, 3);
    this.addTower(6, 6);

    let timer = 0;
    let maxTime = 40;

    // this.spawnEnemy();

    AnimationStore.subscribe(() => {
      timer +=
        AnimationStore.getState().tick - AnimationStore.getState().previousTick;

      if (timer > maxTime) {
        timer -= maxTime;
        // maxTime -= 0.01;
        // maxTime = Math.max(maxTime, 0.5);
        this.spawnEnemy();
      }
    });
  }

  spawnEnemy() {
    this.addEnemy(0, 0, [
      { x: 2, y: 0 },
      { x: 2, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: 9 },
    ]);
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

  addEnemy(x, y, targets = []) {
    const width = 10;
    const speed = 2;

    let rectangle = new Graphics();
    rectangle.beginFill(0xffffff);
    rectangle.drawRect(-width * 0.5, -width * 0.5, width, width);
    // rectangle.drawRect(0, 0, width, width);
    rectangle.endFill();
    rectangle.interactive = true;
    rectangle.pivot.set(width / 2, width / 2);
    rectangle.x = x * this.tileSize + this.tileSize / 2;
    rectangle.y = y * this.tileSize + this.tileSize / 2;

    // rectangle.on("mousedown", (e) => {
    //   console.log("clicked", x, y, this.grid.index(x, y));
    // });

    const enemy = {
      sprite: rectangle,
      health: 100,
    };

    this.enemies.push(enemy);
    this.addChild(rectangle);

    const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
      const tick = AnimationStore.getState();

      if (enemy.health <= 0 || targets.length <= 0) {
        console.log("remove", enemy.health);
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        rectangle.destroy();
        cancelAnimationStoreSubscription();
        return;
      }

      if (enemy.health < 50) {
        rectangle.clear();
        rectangle.beginFill(0xff0000);
        rectangle.drawRect(0, 0, width, width);
        rectangle.endFill();
      } else if (enemy.health < 100) {
        rectangle.clear();
        rectangle.beginFill(0x00ff00);
        rectangle.drawRect(0, 0, width, width);
        rectangle.endFill();
      } else if (enemy.health < 150) {
        rectangle.clear();
        rectangle.beginFill(0x0000ff);
        rectangle.drawRect(0, 0, width, width);
        rectangle.endFill();
      }

      const targetX = targets[0].x;
      const targetY = targets[0].y;

      const move = this.moveTowards(
        rectangle.x,
        rectangle.y,
        targetX * this.tileSize + this.tileSize / 2,
        targetY * this.tileSize + this.tileSize / 2,
        speed
      );
      rectangle.position.x += move.x;
      rectangle.position.y += move.y;

      if (move.x == 0 && move.y == 0) {
        targets.shift();
      }
    });
  }

  addTower(x, y, type = 0) {
    const width = 30;

    const screenX = x * this.tileSize + this.tileSize / 2;
    const screenY = y * this.tileSize + this.tileSize / 2;

    let rectangle = new Graphics();
    switch (type) {
      case 2:
        rectangle.lineStyle(1, 0xffffff, 1);
        rectangle.drawCircle(
          screenX + width / 2,
          screenY + width / 2,
          width / 2
        );
        break;
      case 1:
        rectangle.lineStyle(1, 0xffffff, 1);
        // rectangle.drawRect(screenX, screenY, width, width);
        rectangle.drawStar(
          screenX + width / 2,
          screenY + width / 2,
          3,
          width / 2
        );
        break;
      default:
        rectangle.lineStyle(1, 0xffffff, 1);
        rectangle.drawRect(-width * 0.5, -width * 0.5, width, width);
        break;
    }

    rectangle.position.x = screenX;
    rectangle.position.y = screenY;

    const tower = {
      sprite: rectangle,
    };

    this.addChild(rectangle);
    this.towers.push(tower);

    const cancelAnimationStoreSubscription = AnimationStore.subscribe(() => {
      for (var i = 0; i < this.enemies.length; i++) {
        let e = this.enemies[i];

        const dist = this.distance(
          tower.sprite.x,
          tower.sprite.y,
          e.sprite.position.x,
          e.sprite.position.y
        );

        if (Math.abs(dist) < this.tileSize * 1.5 && e.health > 0) {
          e.health--;
          break;
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
}
