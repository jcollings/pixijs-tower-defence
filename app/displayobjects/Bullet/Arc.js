import { Graphics } from "pixi.js";
import {
  calculateAngle360,
  degreesToRadians,
  isInCircle,
  isInTriangle,
  gridDistance,
} from "../../grid/Grid";
import { GridStore } from "../../stores/Store";
import { enemyStats } from "../../constants/AppConstants";

export default class Arc extends Graphics {
  constructor(tower, args = {}) {
    super();

    this.tower = tower;
    this.damage = args.damage ? args.damage : 1;
    this.degrees = args.degrees ? args.degrees : 360;
    this.maxRange = args.range ? args.range : 100;
    this.distance = args.distance ? args.distance : 10;
    this.complete = false;
    this.range = 0;
  }

  setPath(x1, y1, x2, y2) {
    this.targetX = x2;
    this.targetY = y2;
    this.position.set(x1, y1);
    this.draw();
  }

  draw() {
    this.clear();
    this.beginFill(0xccccff);

    const x1 = 0,
      y1 = 0,
      x2 = this.targetX,
      y2 = this.targetY;

    const originalAngleInDegrees = calculateAngle360(x1, y1, x2, y2);
    let startDegrees = 0;
    let endDegrees = 360;

    if (this.degrees < 360) {
      startDegrees = originalAngleInDegrees - this.degrees / 2;
      endDegrees = originalAngleInDegrees + this.degrees / 2;
    }

    this.moveTo(0, 0);
    this.arc(
      0,
      0,
      this.range,
      degreesToRadians(startDegrees),
      degreesToRadians(endDegrees)
    );
    this.endFill();

    //
    // Debug: Draw Triangle Bounds
    //

    // const points = this.getTrianglePoints(x1, y1, x2, y2);
    // this.lineStyle(2, 0xff0000)
    //   .moveTo(points[0].x, points[0].y)
    //   .lineTo(points[1].x, points[1].y)
    //   .lineTo(points[2].x, points[2].y)
    //   .lineTo(points[0].x, points[0].y);
  }

  getTrianglePoints(x1, y1, x2, y2) {
    const lineDirection = Math.atan2(y2 - y1, x2 - x1);

    // move a coord along a vector direction x amount
    const tmpX = x1 + this.range * Math.cos(lineDirection);
    const tmpY = y1 + this.range * Math.sin(lineDirection);

    // calculate angle
    const angleA = this.degrees / 2;
    const sideB = gridDistance(x1, y1, tmpX, tmpY);
    const sideC = sideB / Math.cos((angleA * Math.PI) / 180);
    const sideA = Math.sqrt(Math.pow(sideC, 2) - Math.pow(sideB, 2));
    // TODO: use sideA , based of perpendicular lines we can calculate each side (+ and -)

    // use for perpendicular line
    var px = y1 - tmpY; // as vector at 90 deg to the line
    var py = tmpX - x1;
    const len = sideA / Math.hypot(px, py);
    px *= len;
    py *= len;

    return [
      { x: x1, y: y1 },
      { x: tmpX + px, y: tmpY + py },
      { x: tmpX - px, y: tmpY - py },
    ];
  }

  update() {
    if (this.range >= this.maxRange) {
      this.complete = true;
    }

    this.range = Math.min(this.range + this.distance, this.maxRange);
    this.draw();
  }

  isComplete() {
    // TODO:
    // 1. if no enemies are in full arc then we reduce range back to zero and then mark as complete
    // 2. if no enemies are in current arc, but enemies still exist in full arc we move towards them
    // 3. enemies in current arc take damage over time or some other effect

    // find enemies in cone
    let enemies = GridStore.getState().enemies.filter((enemy) => {
      const globalEnemyPosition = enemy.getGlobalPosition();
      const globalPosition = this.getGlobalPosition();
      const trianglePoints = this.getTrianglePoints(
        globalPosition.x,
        globalPosition.y,
        globalPosition.x + this.targetX,
        globalPosition.y + this.targetY
      );

      return isInTriangle(
        [globalEnemyPosition.x, globalEnemyPosition.y],
        [
          [trianglePoints[0].x, trianglePoints[0].y],
          [trianglePoints[1].x, trianglePoints[1].y],
          [trianglePoints[2].x, trianglePoints[2].y],
        ]
      );
    });

    if (enemies.length > 0) {
      console.log("take damage", this.damage);
      enemies.forEach((enemy) => (enemy.health -= this.damage)); // this.damage));
    }

    // find enemies in radius
    if (enemies.length == 0) {
      enemies = GridStore.getState().enemies.filter((enemy) => {
        const globalEnemyPosition = enemy.getGlobalPosition();
        const globalPosition = this.getGlobalPosition();

        return isInCircle(
          globalEnemyPosition.x,
          globalEnemyPosition.y,
          globalPosition.x,
          globalPosition.y,
          this.maxRange
        );
      });
    }

    if (enemies.length > 0) {
      enemies = this.tower.sortEnemyTargets(enemies);
      const enemyTarget = enemies[0];
      this.targetX = enemyTarget.position.x - this.position.x;
      this.targetY = enemyTarget.position.y - this.position.y;
    }

    return this.complete && enemies.length == 0;
  }

  isEnemyInSplashRadius() {}
}
