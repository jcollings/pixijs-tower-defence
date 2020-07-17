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

export const gridInGrid = (index) => {
  if (index < 0 || index >= gridWidth() * gridHeight()) {
    return false;
  }

  return true;
};

export const gridIndex = (x, y) => {
  const width = gridWidth();
  const height = gridWidth();
  const index = x + width * y;
  if (gridInGrid(index) && x >= 0 && y >= 0 && x < width && y < height) {
    return index;
  }
  return -1;
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

export const pointInTriangle = (point, triangle) => {
  //compute vectors & dot products
  var cx = point[0],
    cy = point[1],
    t0 = triangle[0],
    t1 = triangle[1],
    t2 = triangle[2],
    v0x = t2[0] - t0[0],
    v0y = t2[1] - t0[1],
    v1x = t1[0] - t0[0],
    v1y = t1[1] - t0[1],
    v2x = cx - t0[0],
    v2y = cy - t0[1],
    dot00 = v0x * v0x + v0y * v0y,
    dot01 = v0x * v1x + v0y * v1y,
    dot02 = v0x * v2x + v0y * v2y,
    dot11 = v1x * v1x + v1y * v1y,
    dot12 = v1x * v2x + v1y * v2y;

  // Compute barycentric coordinates
  var b = dot00 * dot11 - dot01 * dot01,
    inv = b === 0 ? 0 : 1 / b,
    u = (dot11 * dot02 - dot01 * dot12) * inv,
    v = (dot00 * dot12 - dot01 * dot02) * inv;
  return u >= 0 && v >= 0 && u + v < 1;
};

export const calculateAngle = (cx, cy, ex, ey) => {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  return theta;
};
export const calculateAngle360 = (cx, cy, ex, ey) => {
  var theta = calculateAngle(cx, cy, ex, ey); // range (-180, 180]
  if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
};

export const degreesToRadians = (degrees) => {
  var pi = Math.PI;
  return degrees * (pi / 180);
};
