import { Container, Graphics, Text } from "pixi.js";
import Grid, { gridIndex } from "../grid/Grid";
import Store, { AnimationStore, GridStore } from "../stores/Store";
import {
  addEnemy,
  removeEnemy,
  addTower,
  removeBullet,
  updateSize,
  updateSelection,
  addEnergy,
  addWave,
} from "../stores/GridStore";
import Enemy from "../displayobjects/Enemy/Enemy";
import Tile from "../displayobjects/Tile/Tile";
import Tower from "../displayobjects/Tower/Tower";
import { keyboard } from "../input/Keyboard";
import { enemyStats } from "../constants/AppConstants";

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

    this.addGrid();

    const path = [
      { x: 2, y: 0 },
      { x: 2, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: 9 },
    ];

    this.drawPath(path);

    // this.addTower(3, 4, {
    //   type: 2,
    //   level: 1,
    // });

    let keyZero = keyboard("0"),
      keyOne = keyboard("1"),
      keyTwo = keyboard("2"),
      keyThree = keyboard("3"),
      keyFour = keyboard("4");

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

    keyFour.release = () => {
      GridStore.dispatch(updateSelection(4));
    };

    let energyTick = 0;

    AnimationStore.subscribe(() => {
      // Add energy every second
      energyTick--;
      if (energyTick <= 0) {
        GridStore.dispatch(addEnergy(1));
        energyTick = 60;
      }

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

    this.spawnEnemies(path);

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

  spawnEnemies(path) {
    let maxTime = 80;
    let enemyTimer = 0;
    let availablePoints = 1;
    let maxSpawnTimer = 10;
    let spawnTimer = 0;

    let enemySequence = [1];
    let lastGroup = -1;

    AnimationStore.subscribe(() => {
      // spawn enemies from list
      spawnTimer++;
      if (this.enemies.length > 0) {
        if (spawnTimer > maxSpawnTimer) {
          const { level, speed, group } = this.enemies.shift();
          this.addEnemy(path, {
            level: level,
            speed: speed,
          });
          spawnTimer = 0;
          if (lastGroup !== group) {
            lastGroup = group;
            availablePoints++;
          }
        }
        return;
      }

      // generate new wave of enemies

      enemyTimer++;
      if (enemyTimer > maxTime) {
        // maxTime -= 0.5; //0.05;
        // maxTime = Math.max(maxTime, 10);
        enemyTimer = 0;

        this.spawnEnemyQueue01();

        let pointsSpent = 0;
        // 1,3,7
        const currentEnemySequenceIndex = enemySequence.length - 1;
        if (enemySequence[currentEnemySequenceIndex] <= availablePoints) {
          enemySequence.push(enemySequence[currentEnemySequenceIndex] * 2 + 1);
          console.log("sequence", enemySequence);
        }

        // console.log(
        //   "check",
        //   enemySequence[currentEnemySequenceIndex],
        //   availablePoints
        // );

        let spawnedEnemyLevels = [];
        let lastPointIndex = enemySequence.length - 1;
        let groupCounter = 0;
        while (pointsSpent < availablePoints) {
          while (
            enemySequence[lastPointIndex] >
            availablePoints - pointsSpent
          ) {
            lastPointIndex--;
          }

          // if (enemyStats.length - 1 < lastPointIndex) {
          //   lastPointIndex = enemyStats.length - 1;
          // }

          const cost = lastPointIndex + 1; //enemySequence[lastPointIndex];
          // const enemyData = enemyStats[lastPointIndex];

          const level = lastPointIndex + 1;
          const speed = 1;

          // const enemyQuantity = Math.max(
          //   enemySequence.length - 1 - lastPointIndex,
          //   1
          // );
          const enemyQuantity = 1;
          for (let i = 0; i < enemyQuantity; i++) {
            this.enemies.push({
              level: level,
              speed: speed,
              group: groupCounter,
            });
          }

          spawnedEnemyLevels.push([level, enemyQuantity]);

          pointsSpent += cost;
          groupCounter++;
        }

        GridStore.dispatch(addWave(1));

        // console.log("spawned", spawnedEnemyLevels);
      }
    });
  }

  spawnEnemyQueue01() {}

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
    GridStore.dispatch(addTower(gridIndex(x, y), tower));
  }
}
