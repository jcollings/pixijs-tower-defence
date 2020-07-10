import { Graphics, Container } from "pixi.js";
import { gridPosition, gridMoveTowards, gridTileSize } from "../../grid/Grid";

export default class Enemy extends Graphics {
  constructor(args = {}) {
    super();

    this.targets = null;
    this.level = args.level ? parseInt(args.level) : 0;
    this.size = 8 + this.level;
    this.speed = args.speed ? args.speed : 2;
    this.health = 5 + this.level;
    this.maxHealth = 0 + this.health;
    this.offsetX = (gridTileSize() - this.size) * Math.random();
    this.offsetY = ((gridTileSize() - this.size) * Math.random()) / 2;
    // this.offset = this.offset - this.offset / 2;
  }

  getEnergy() {
    return this.level;
  }

  drawEnemy(color = 0xffffff) {
    this.clear();
    this.beginFill(color);
    this.drawRect(
      -this.offsetX * 0.5,
      -this.offsetY * 0.5,
      this.size,
      this.size
    );
    this.endFill();
  }

  setPath(path = []) {
    this.targets = [...path];
    const { x, y } = this.targets.shift();
    const target = gridPosition(x, y);

    this.position.set(target.x, target.y);
    this.drawEnemy();
  }

  update() {
    if (this.targets.length <= 0) {
      return;
    }

    const healthPercentage = this.health / this.maxHealth;
    if (healthPercentage < 0.3) {
      this.drawEnemy(0xff0000);
    } else if (healthPercentage < 0.5) {
      this.drawEnemy(0xffff00);
    } else if (healthPercentage < 1) {
      this.drawEnemy(0x00ff00);
    }

    const { x, y } = this.targets[0];
    const target = gridPosition(x, y);

    const move = gridMoveTowards(
      this.position.x,
      this.position.y,
      target.x,
      target.y,
      this.speed
    );
    this.position.x += move.x;
    this.position.y += move.y;

    if (move.x == 0 && move.y == 0) {
      this.targets.shift();
    }
  }
}
