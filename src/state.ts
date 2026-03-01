import { COLORS } from "./constants";
import { GameState } from "./types";

export const state: GameState = {
  tiles: new Map(),
  bridges: [],
  mode: "build",
  selectedColor: COLORS[0],
  characterPos: null,
  bridgeStart: null,
};
