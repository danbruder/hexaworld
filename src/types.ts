export interface TileData {
  q: number;
  r: number;
  color: number;
}

export interface BridgeData {
  fromKey: string;
  toKey: string;
  color: number;
}

export type Mode = "build" | "bridge" | "walk";

export interface GameState {
  tiles: Map<string, TileData>;
  bridges: BridgeData[];
  mode: Mode;
  selectedColor: number;
  characterPos: { q: number; r: number } | null;
  bridgeStart: string | null;
}
