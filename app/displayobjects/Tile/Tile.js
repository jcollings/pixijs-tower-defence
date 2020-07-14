import { Graphics } from "pixi.js";
import Grid, { gridTileSize, gridIndex } from "../../grid/Grid";
import Tower from "../Tower/Tower";
import { Targeting } from "../../constants/AppConstants";
import { GridStore } from "../../stores/Store";
import { addTower, addEnergy } from "../../stores/GridStore";

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

    this.interactive = true;
    this.on("mouseup", (event) => {
      GridStore.getState().selection;

      let tower = null;
      const { selection, energy } = GridStore.getState();
      if (selection > 0) {
        const existingTower = GridStore.getState().towers[gridIndex(x, y)];
        const level = existingTower ? existingTower.level + 1 : 1;

        tower = new Tower(x, y, {
          targeting: Targeting.DEFAULT,
          type: selection - 1,
          level: level,
        });
        const cost = tower.getCost();
        if (cost <= energy) {
          this.parent.addChild(tower);
          GridStore.dispatch(addEnergy(-cost));
        } else {
          return;
        }
      }

      GridStore.dispatch(addTower(gridIndex(x, y), tower));
    });
  }
}
