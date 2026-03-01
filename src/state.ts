import { COLORS } from "./constants";
import { GameState, TileData, BridgeData } from "./types";

const STORAGE_KEY = "hexaworld-save";
const PREFS_KEY = "hexaworld-prefs";

export const state: GameState = {
  tiles: new Map(),
  bridges: [],
  mode: "build",
  selectedColor: COLORS[0],
  selectedKind: "plain",
  characterPos: null,
  bridgeStart: null,
};

export function saveState(): void {
  const data = {
    tiles: Array.from(state.tiles.entries()),
    bridges: state.bridges,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadState(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const loadedTiles = new Map(data.tiles as [string, TileData][]);
    // Backfill kind for tiles saved before kind was added
    for (const [key, tile] of loadedTiles) {
      if (!tile.kind) tile.kind = "plain";
    }
    state.tiles = loadedTiles;
    state.bridges = data.bridges as BridgeData[];
  } catch {
    // Ignore corrupt saves
  }
}

export function savePrefs(): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify({
    selectedColor: state.selectedColor,
    selectedKind: state.selectedKind,
  }));
}

export function loadPrefs(): void {
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (typeof data.selectedColor === "number") state.selectedColor = data.selectedColor;
    if (typeof data.selectedKind === "string") state.selectedKind = data.selectedKind;
  } catch {
    // Ignore
  }
}

export function clearState(): void {
  state.tiles.clear();
  state.bridges = [];
  state.characterPos = null;
  state.bridgeStart = null;
  localStorage.removeItem(STORAGE_KEY);
}
