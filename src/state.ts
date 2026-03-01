import { COLORS } from "./constants";
import { GameState, TileData, BridgeData } from "./types";

const LEVELS_KEY = "hexaworld-levels";
const PREFS_KEY = "hexaworld-prefs";

function levelStorageKey(id: string): string {
  return `hexaworld-level-${id}`;
}

export interface LevelEntry {
  id: string;
  name: string;
}

export const state: GameState = {
  tiles: new Map(),
  bridges: [],
  mode: "build",
  selectedColor: COLORS[0],
  selectedKind: "color",
  characterPos: null,
  bridgeStart: null,
  currentLevel: "1",
};

export function getLevels(): LevelEntry[] {
  const raw = localStorage.getItem(LEVELS_KEY);
  if (!raw) return [{ id: "1", name: "Level 1" }];
  try {
    return JSON.parse(raw) as LevelEntry[];
  } catch {
    return [{ id: "1", name: "Level 1" }];
  }
}

function saveLevels(levels: LevelEntry[]): void {
  localStorage.setItem(LEVELS_KEY, JSON.stringify(levels));
}

export function saveState(): void {
  const data = {
    tiles: Array.from(state.tiles.entries()),
    bridges: state.bridges,
  };
  localStorage.setItem(levelStorageKey(state.currentLevel), JSON.stringify(data));
}

export function loadState(): void {
  const raw = localStorage.getItem(levelStorageKey(state.currentLevel));
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const loadedTiles = new Map(data.tiles as [string, TileData][]);
    for (const [, tile] of loadedTiles) {
      if (!tile.kind || tile.kind === "plain") tile.kind = "color";
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
    currentLevel: state.currentLevel,
  }));
}

export function loadPrefs(): void {
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (typeof data.selectedColor === "number") state.selectedColor = data.selectedColor;
    if (typeof data.selectedKind === "string") state.selectedKind = data.selectedKind;
    if (typeof data.currentLevel === "string") state.currentLevel = data.currentLevel;
  } catch {
    // Ignore
  }
}

// Migrate old single-level save to level 1
export function migrateOldSave(): void {
  const oldKey = "hexaworld-save";
  const oldData = localStorage.getItem(oldKey);
  if (oldData && !localStorage.getItem(levelStorageKey("1"))) {
    localStorage.setItem(levelStorageKey("1"), oldData);
    localStorage.removeItem(oldKey);
  }
}

export function switchLevel(id: string): void {
  // Save current world
  saveState();
  // Switch
  state.currentLevel = id;
  state.tiles.clear();
  state.bridges = [];
  state.characterPos = null;
  state.bridgeStart = null;
  // Load new level
  loadState();
  savePrefs();
}

export function createLevel(): string {
  const levels = getLevels();
  const nextId = String(Math.max(...levels.map((l) => Number(l.id) || 0)) + 1);
  levels.push({ id: nextId, name: `Level ${nextId}` });
  saveLevels(levels);
  switchLevel(nextId);
  return nextId;
}

export function renameLevel(id: string, name: string): void {
  const levels = getLevels();
  const entry = levels.find((l) => l.id === id);
  if (entry) {
    entry.name = name;
    saveLevels(levels);
  }
}

export function deleteLevel(id: string): boolean {
  const levels = getLevels();
  if (levels.length <= 1) return false;
  const idx = levels.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  levels.splice(idx, 1);
  saveLevels(levels);
  localStorage.removeItem(levelStorageKey(id));
  // If deleting current level, switch to first available
  if (state.currentLevel === id) {
    switchLevel(levels[0].id);
  }
  return true;
}

export function clearState(): void {
  state.tiles.clear();
  state.bridges = [];
  state.characterPos = null;
  state.bridgeStart = null;
  localStorage.removeItem(levelStorageKey(state.currentLevel));
}
