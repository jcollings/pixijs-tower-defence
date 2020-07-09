const GRID_SIZE = "seed/grid/GRID_SIZE";
const ADD_ENEMY = "seed/grid/ADD_ENEMY";
const REMOVE_ENEMY = "seed/grid/REMOVE_ENEMY";
const ADD_TOWER = "seed/grid/ADD_TOWER";
const REMOVE_TOWER = "seed/grid/REMOVE_TOWER";
const ADD_BULLET = "seed/grid/ADD_BULLET";
const REMOVE_BULLET = "seed/grid/REMOVE_BULLET";

export default (
  state = {
    width: 10,
    height: 10,
    tileSize: 50,
    tiles: [],
    enemies: [],
    towers: [],
    bullets: [],
  },
  action = {}
) => {
  switch (action.type) {
    case GRID_SIZE:
      return {
        ...state,
        width: action.width,
        height: action.height,
        tileSize: action.tileSize,
      };
    case ADD_ENEMY:
      return {
        ...state,
        enemies: [...state.enemies, action.enemy],
      };
    case REMOVE_ENEMY:
      let enemies = [...state.enemies];
      const enemyIndex = enemies.indexOf(action.enemy);
      if (enemyIndex !== -1) {
        enemies.splice(enemyIndex, 1);
      }
      return {
        ...state,
        enemies: enemies,
      };
    case ADD_TOWER:
      return {
        ...state,
        towers: [...state.towers, action.tower],
      };
    case REMOVE_TOWER:
      let towers = [...state.towers];
      const towerIndex = towers.indexOf(action.tower);
      if (towerIndex !== -1) {
        towers.splice(towerIndex, 1);
      }
      return {
        ...state,
        towers: towers,
      };

    case ADD_BULLET:
      return {
        ...state,
        bullets: [...state.bullets, action.bullet],
      };
    case REMOVE_BULLET:
      let bullets = [...state.bullets];
      const bulletIndex = bullets.indexOf(action.bullet);
      if (bulletIndex !== -1) {
        bullets.splice(bulletIndex, 1);
      }
      return {
        ...state,
        bullets: bullets,
      };
    default:
      return state;
  }
};

export const updateSize = (width, height, tileSize) => ({
  type: GRID_SIZE,
  width,
  height,
  tileSize,
});

export const addEnemy = (enemy) => ({
  type: ADD_ENEMY,
  enemy,
});

export const removeEnemy = (enemy) => ({
  type: REMOVE_ENEMY,
  enemy,
});

export const addTower = (tower) => ({
  type: ADD_TOWER,
  tower,
});

export const removeTower = (tower) => ({
  type: REMOVE_TOWER,
  tower,
});

export const addBullet = (bullet) => ({
  type: ADD_BULLET,
  bullet,
});

export const removeBullet = (bullet) => ({
  type: REMOVE_BULLET,
  bullet,
});
