import { Container, Graphics, Text } from "pixi.js";
import Grid from "../grid/Grid";
import Store, { AnimationStore, GridStore } from "../stores/Store";
import {
  addEnemy,
  removeEnemy,
  addTower,
  removeBullet,
  updateSize,
  updateSelection,
  addEnergy,
} from "../stores/GridStore";
import Enemy from "../displayobjects/Enemy/Enemy";
import Tile from "../displayobjects/Tile/Tile";
import Tower from "../displayobjects/Tower/Tower";
import { Targeting } from "../constants/AppConstants";
import { keyboard } from "../input/Keyboard";

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
    // this.towers = [];
    // this.bullets = [];

    // GridStore.subscribe(() => {
    //   console.log(GridStore.getState());
    // });

    this.addGrid();

    // this.addTower(1, 3, { targeting: Targeting.WEAKEST, type: 0 });
    // this.addTower(3, 3, { targeting: Targeting.DEFAULT, type: 0 });
    // this.addTower(6, 6, { targeting: Targeting.WEAKEST, type: 0 });

    // this.addTower(3, 4, { targeting: Targeting.STRONGEST, type: 1 });

    // this.addTower(5, 2, { targeting: Targeting.DEFAULT, type: 2 });
    // this.addTower(5, 3, { targeting: Targeting.WEAKEST, type: 2 });
    // this.addTower(6, 2, { targeting: Targeting.LAST, type: 2 });
    // this.addTower(6, 3, { targeting: Targeting.STRONGEST, type: 2 });

    let timer = 0;
    let maxTime = 40;
    let enemies = -1;
    const path = [
      { x: 2, y: 0 },
      { x: 2, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: 9 },
    ];

    this.drawPath(path);

    let keyZero = keyboard("0"),
      keyOne = keyboard("1"),
      keyTwo = keyboard("2"),
      keyThree = keyboard("3");

    keyZero.release = () => {
      GridStore.dispatch(updateSelection(0));
    };

    keyOne.release = () => {
      GridStore.dispatch(updateSelection(1));
    };

    keyTwo.release = () => {
      GridStore.dispatch(updateSelection(2));
    };

    keyThree.release = () => {
      GridStore.dispatch(updateSelection(3));
    };

    AnimationStore.subscribe(() => {
      // Update All Towers
      GridStore.getState()
        .towers.filter((tower) => tower !== null)
        .forEach((tower) => {
          tower.update();
        });

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
          if (enemy.health <= 0) {
            GridStore.dispatch(addEnergy(enemy.getEnergy()));
          }

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
        maxTime = Math.max(maxTime, 5);
        this.spawnEnemy(path, {
          level: Math.random() * 10,
          speed: Math.random() * 3 + 1,
        });
        if (enemies > -1) {
          enemies--;
        }
      }
    });

    const fontSize = 12;
    let text = new Text("Energy: 0\nWave: 0", {
      fontFamily: "Arial",
      fontSize: fontSize,
      lineHeight: fontSize * 1.2,
      fill: 0xffffff,
      align: "left",
    });

    text.anchor.set(0, 0);
    text.position.set(10, 10);
    this.addChild(text);

    GridStore.subscribe(() => {
      const { energy, wave } = GridStore.getState();
      text.text = "Energy: " + energy + "\nWave: " + wave;
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
    const tower = new Tower(x, y, args);

    this.addChild(tower);
    GridStore.dispatch(addTower(tower));
  }
}
