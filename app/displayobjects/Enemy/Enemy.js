import { Graphics, Container } from "pixi.js";

export default class Enemy extends Graphics {
  constructor(args = {}) {
    super();
  }

  setup() {
    this.beginFill(0xffffff);
    this.drawRect(-8 * 0.5, -8 * 0.5, 8, 8);
    this.endFill();
  }

  setPath(path = []) {
    const { x, y } = targets.shift();
  }

  update() {}
}
