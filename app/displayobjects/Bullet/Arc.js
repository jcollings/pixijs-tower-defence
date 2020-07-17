import { Graphics } from "pixi.js";
import { calculateAngle360, degreesToRadians } from "../../grid/Grid";

export default class Arc extends Graphics {
  constructor(args = {}) {
    super();

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
  }

  update() {
    if (this.range >= this.maxRange) {
      this.complete = true;
      return;
    }

    this.range += this.distance;
    this.draw();
  }

  isComplete() {
    // TODO:
    // 1. if no enemies are in full arc then we reduce range back to zero and then mark as complete
    // 2. if no enemies are in current arc, but enemies still exist in full arc we move towards them
    // 3. enemies in current arc take damage over time or some other effect
    return this.complete;
  }

  isEnemyInSplashRadius() {}
}
