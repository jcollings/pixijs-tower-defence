import { GridStore } from "../stores/Store";
import { updateSize } from "../stores/GridStore";

export default class Grid {
  constructor(width, height, tileSize) {
    this._width = width;
    this._height = height;
    this._tileSize = tileSize;
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }

  size() {
    return this.width() * this.height();
  }

  index(x, y) {
    const width = this.width();
    const height = this.height();
    const index = x + width * y;
    if (this.inGrid(index) && x >= 0 && y >= 0 && x < width && y < height) {
      return index;
    }
    return -1;
  }

  coord(index) {
    const width = this.width();
    const height = this.height();
    return {
      x: index % width,
      y: Math.floor((index / width) % height),
    };
  }

  inGrid(index) {
    if (index < 0 || index >= this._width * this._height) {
      return false;
    }

    return true;
  }

  position(x, y) {
    return {
      x: x * this._tileSize + this._tileSize / 2,
      y: y * this._tileSize + this._tileSize / 2,
    };
  }
}

export const gridWidth = () => {
  return GridStore.getState().width;
};

export const gridHeight = () => {
  return GridStore.getState().height;
};

export const gridTileSize = () => {
  return GridStore.getState().tileSize;
};

export const gridPosition = (x, y) => {
  const tileSize = gridTileSize();
  return {
    x: x * tileSize + tileSize / 2,
    y: y * tileSize + tileSize / 2,
  };
};

export const gridMoveTowards = (x, y, tx, ty, distance) => {
  const dx = tx - x;
  const dy = ty - y;
  const angle = Math.atan2(dy, dx);
  const maxDistance = gridDistance(x, y, tx, ty);

  return {
    x: Math.min(maxDistance, distance * Math.cos(angle)),
    y: Math.min(maxDistance, distance * Math.sin(angle)),
  };
};

export const gridDistance = (x1, y1, x2, y2) => {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b);
};
