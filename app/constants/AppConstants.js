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
    delay: 10,
    distance: 10,
    range: 1.5,
    sight: 2,
    damage: 1,
    splash: 0,
    cost: 100,
  },
  {
    delay: 20,
    distance: 10,
    range: 3,
    sight: 5,
    damage: 5,
    splash: 0.4,
    cost: 150,
  },
  {
    delay: 90,
    distance: 50,
    range: 5,
    sight: 7,
    damage: 10,
    splash: 1.5,
    cost: 200,
  },
];

export const towerUpgradeStats = [
  {
    damage: 2,
  },
  {
    damage: 10,
  },
  {
    damage: 20,
  },
];
