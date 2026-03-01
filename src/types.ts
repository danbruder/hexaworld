export type TileKind = string;

export interface TileData {
  q: number;
  r: number;
  color: number;
  kind: TileKind;
}

export interface BridgeData {
  fromKey: string;
  toKey: string;
  color: number;
}

export type Mode = "build" | "bridge" | "walk" | "delete";

export interface GameState {
  tiles: Map<string, TileData>;
  bridges: BridgeData[];
  mode: Mode;
  selectedColor: number;
  selectedKind: TileKind;
  characterPos: { q: number; r: number } | null;
  bridgeStart: string | null;
  currentLevel: string;
  selectedCharacter: string;
}
