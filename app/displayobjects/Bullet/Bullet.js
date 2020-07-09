import { Graphics } from "pixi.js";
import {
  gridMoveTowards,
  gridDistance,
  gridTileSize,
  isInCicle,
} from "../../grid/Grid";
import { AnimationStore, GridStore } from "../../stores/Store";

export default class Bullet extends Graphics {
  constructor(args = {}) {
    super();

    this.type = args.type ? args.type : 0;
    this.enemy = args.enemy ? args.enemy : null;
    this.damage = args.damage ? args.damage : 1;
    this.distance = args.distance ? args.distance : 10;
    this.size = Math.max(8, 1 * this.damage);
    this.splashSize = args.splashSize ? args.splashSize : 0;
    this.complete = false;
    this.splashing = false;
  }

  drawBullet() {
    this.clear();
    this.beginFill(0xccccff);
    switch (this.type) {
      case 2:
        this.drawCircle(0, 0, this.size / 2);
        break;
      case 1:
        this.lineStyle(1, 0xccccff)
          .moveTo(0, -this.size / 2)
          .lineTo(-this.size / 2, this.size / 2);

        this.lineStyle(1, 0xccccff)
          .moveTo(0, -this.size / 2)
          .lineTo(this.size / 2, this.size / 2);

        this.lineStyle(1, 0xccccff)
          .moveTo(-this.size / 2, this.size / 2)
          .lineTo(this.size / 2, this.size / 2);
        break;
      default:
        this.drawRect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
        break;
    }
    this.endFill();
  }

  setPath(x1, y1, x2, y2) {
    this.targetX = x2;
    this.targetY = y2;
    this.position.set(x1, y1);
    this.drawBullet();
  }

  update() {
    if (this.isComplete()) {
      return;
    }

    const maxDistance = gridDistance(
      this.position.x,
      this.position.y,
      this.targetX,
      this.targetY
    );

    const move = gridMoveTowards(
      this.position.x,
      this.position.y,
      this.targetX,
      this.targetY,
      Math.min(this.distance, maxDistance)
    );

    this.position.x += move.x;
    this.position.y += move.y;
  }

  isComplete() {
    if (this.complete) {
      return true;
    }

    if (this.position.x == this.targetX && this.position.y == this.targetY) {
      if (this.splashSize > 0) {
        const splashRadius = this.splashSize;
        let splash = new Graphics();
        let splashData = {
          max: 5,
          counter: 5,
          x: this.position.x,
          y: this.position.y,
          radius: splashRadius,
        };
        this.parent.addChild(splash);

        const cancelSplashAnimationStoreSubscription = AnimationStore.subscribe(
          () => {
            if (splashData.counter > 0) {
              splashData.counter--;

              splash.clear();
              splash.beginFill(
                0xeeeeff,
                0.5 //Math.min(0.5, splashData.counter / splashData.max)
              );
              splash.drawCircle(
                splashData.x,
                splashData.y,
                splashData.radius * (1 - splashData.counter / splashData.max)
              );
              splash.endFill();
              return;
            }

            splash.destroy();
            cancelSplashAnimationStoreSubscription();
          }
        );

        // splash radius
        const enemies = GridStore.getState().enemies;
        for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
          if (
            isInCicle(
              enemies[enemyIndex].position.x,
              enemies[enemyIndex].position.y,
              splashData.x,
              splashData.y,
              splashRadius
            )
          ) {
            enemies[enemyIndex].health -= this.damage;
          }
        }
      } else {
        this.enemy.health -= this.damage;
      }

      this.complete = true;
      return true;
    }

    return false;
  }
}
