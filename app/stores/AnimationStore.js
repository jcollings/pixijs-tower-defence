// template : https://github.com/erikras/ducks-modular-redux

const TICK = 'seed/animation/TICK';

const defaultState = {
  tick: 1,
  previousTick: 0,
  startTime: window.performance.now(),
  deltaTime: 0,
  currentTime: window.performance.now()
};

export default (state = defaultState, action = {}) => {
  switch (action.type) {
    case TICK:
      return {
        ...state,
        tick: state.tick + 1,
        previousTick: state.tick,
        deltaTime: (window.performance.now() - state.currentTime)/1000,
        currentTime: window.performance.now()
      };
    default:
      return state;
  }
};

export const tick = () => ({ type: TICK });
