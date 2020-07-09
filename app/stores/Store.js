import { createStore, combineReducers } from "redux";
import Animation from "./AnimationStore";
import Grid from "./GridStore";
import Renderer from "./RendererStore";
import App from "./AppStore";

const Combi = combineReducers({
  Renderer,
  App,
});

export const AnimationStore = createStore(Animation);
export const GridStore = createStore(Grid);

export default createStore(Combi);
