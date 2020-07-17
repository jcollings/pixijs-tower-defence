export const canvasWidth = 1920;
export const canvasHeight = 1080;
export const Targeting = {
  DEFAULT: Symbol("default"),
  LAST: Symbol("last"),
  STRONGEST: Symbol("strongest"),
  WEAKEST: Symbol("weakest"),
};
export const towerBaseStats = [
  {
    delay: 30,
    distance: 0,
    range: 1.5,
    sight: 2,
    damage: 1,
    splash: 0,
    cost: 100,
    target: Targeting.DEFAULT,
    arc: 30,
  },
  {
    delay: 45,
    distance: 10,
    range: 2,
    sight: 3,
    damage: 2,
    splash: 0.4,
    cost: 125,
    target: Targeting.DEFAULT,
  },
  {
    delay: 60,
    distance: 0,
    range: 4,
    sight: 6,
    damage: 6,
    splash: 0,
    cost: 150,
    target: Targeting.STRONGEST,
  },
  {
    delay: 90,
    distance: 50,
    range: 5,
    sight: 7,
    damage: 4,
    splash: 0.5,
    cost: 200,
    target: Targeting.STRONGEST,
  },
];

export const towerUpgradeStats = [
  {
    damage: (tower) => {
      return tower.damage + (tower.level - 1); //Math.pow(2 * (tower.level - 1), 2);
    },
    // maxDelay: (tower) => {
    //   return tower.maxDelay - 5 * (tower.level - 1);
    // },
  },
  {
    damage: (tower) => {
      return tower.damage + tower.damage * (tower.level - 1);
    },
    // maxDelay: (tower) => {
    //   return tower.maxDelay - 5 * (tower.level - 1);
    // },
  },
  {
    damage: (tower) => {
      return tower.damage + tower.damage * (tower.level - 1);
    },
    // maxDelay: (tower) => {
    //   return tower.maxDelay - 5 * (tower.level - 1);
    // },
  },
  {
    damage: (tower) => {
      return tower.damage + tower.damage * (tower.level - 1);
    },
    // maxDelay: (tower) => {
    //   return tower.maxDelay - 5 * (tower.level - 1);
    // },
  },
];

export const enemyStats = [
  {
    level: 1,
    speed: 1,
  },
  {
    level: 1,
    speed: 2,
  },
  {
    level: 2,
    speed: 1,
  },
  {
    level: 3,
    speed: 1,
  },
  {
    level: 4,
    speed: 1,
  },
  {
    level: 5,
    speed: 1,
  },
  {
    level: 6,
    speed: 1,
  },
  {
    level: 7,
    speed: 1,
  },
  {
    level: 8,
    speed: 1,
  },
];
