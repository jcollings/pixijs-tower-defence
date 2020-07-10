import { Graphics } from "pixi.js";
import { gridTileSize } from "../../grid/Grid";

export default class Tile extends Graphics {
  constructor(x, y, args = {}) {
    super();

    if (x % 2 == (y % 2 == 1 ? 0 : 1)) {
      this.beginFill(0x000011);
    } else {
      this.beginFill(0x111122);
    }

    const tileSize = gridTileSize();
    this.drawRect(0, 0, tileSize, tileSize);
    this.endFill();
    this.position.set(x * tileSize, y * tileSize);
  }
}
