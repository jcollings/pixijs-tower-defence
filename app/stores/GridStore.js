const GRID_SIZE = "seed/grid/GRID_SIZE";
const ADD_ENEMY = "seed/grid/ADD_ENEMY";
const REMOVE_ENEMY = "seed/grid/REMOVE_ENEMY";
const ADD_TOWER = "seed/grid/ADD_TOWER";
const REMOVE_TOWER = "seed/grid/REMOVE_TOWER";
const ADD_BULLET = "seed/grid/ADD_BULLET";
const REMOVE_BULLET = "seed/grid/REMOVE_BULLET";
const UPDATE_SELECTION = "seed/grid/UPDATE_SELECTION";
const ADD_ENERGY = "seed/grid/ADD_ENERGY";
const UPDATE_ENERGY = "seed/grid/UPDATE_ENERGY";
const UPDATE_WAVE = "seed/grid/UPDATE_WAVE";

export default (
  state = {
    width: 10,
    height: 10,
    tileSize: 50,
    selection: 1,
    tiles: [],
    enemies: [],
    towers: new Array(10 * 10).fill(null),
    bullets: [],
    energy: 0,
    wave: 0,
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
      const tmpTowers = [...state.towers];
      if (tmpTowers[action.index] !== null) {
        tmpTowers[action.index].destroy();
      }
      tmpTowers[action.index] = action.tower;
      return {
        ...state,
        towers: tmpTowers,
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
    case UPDATE_SELECTION:
      return {
        ...state,
        selection: action.value,
      };
      break;
    case UPDATE_ENERGY:
      return {
        ...state,
        energy: action.value,
      };
      break;
    case ADD_ENERGY:
      return {
        ...state,
        energy: state.energy + action.value,
      };
      break;
    case UPDATE_WAVE:
      return {
        ...state,
        wave: action.value,
      };
      break;
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

export const addTower = (index, tower) => ({
  type: ADD_TOWER,
  index,
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

export const updateSelection = (value) => ({
  type: UPDATE_SELECTION,
  value,
});

export const addEnergy = (value) => ({
  type: ADD_ENERGY,
  value,
});

export const updateEnergy = (value) => ({
  type: UPDATE_ENERGY,
  value,
});

export const updateWave = (value) => ({
  type: UPDATE_WAVE,
  value,
});
