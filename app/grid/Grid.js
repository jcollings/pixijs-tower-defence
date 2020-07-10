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

export const isInCicle = (a, b, x, y, r) => {
  var dist_points = (a - x) * (a - x) + (b - y) * (b - y);
  r *= r;
  if (dist_points < r) {
    return true;
  }
  return false;
};

/**
 * Predict where enemy will be in x amount of ticks
 *
 * @param {Enemy} enemy
 * @param {int} ticks
 */
export const predictEnemyPosition = (enemy, distance) => {
  let found = false;
  let oldX = enemy.position.x;
  let oldY = enemy.position.y;
  let distanceTravelled = 0;

  for (let i = 0; i < enemy.targets.length; i++) {
    const target = gridPosition(enemy.targets[i].x, enemy.targets[i].y);

    let virtualMove = gridMoveTowards(
      oldX,
      oldY,
      target.x,
      target.y,
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

  return {
    x: oldX,
    y: oldY,
  };
};
