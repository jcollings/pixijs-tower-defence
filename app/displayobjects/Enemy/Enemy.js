import { Graphics, Container } from "pixi.js";
import { gridPosition, gridMoveTowards, gridTileSize } from "../../grid/Grid";

export default class Enemy extends Graphics {
  constructor(args = {}) {
    super();

    this.targets = null;
    this.level = args.level ? parseInt(args.level) : 1;
    this.size = 5 + this.level;
    this.speed = args.speed ? 1 + Math.abs((args.speed - 1) * 0.5) : 1;
    this.health = this.level;
    this.maxHealth = this.health;
    this.distanceTravelled = 0;
    // this.offsetX = (gridTileSize() - this.size) * Math.random();
    // this.offsetY = ((gridTileSize() - this.size) * Math.random()) / 2;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  getEnergy() {
    return Math.floor((this.level + this.speed) * 2);
  }

  drawEnemy(color = 0xffffff) {
    this.clear();
    this.beginFill(color);
    this.drawRect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
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
    this.distanceTravelled += Math.max(move.x, move.y);
    this.position.x += move.x;
    this.position.y += move.y;

    if (move.x == 0 && move.y == 0) {
      this.targets.shift();
    }
  }
}
