export type TileKind = string;

export interface TileEffects {
  speed?: number;
  damage?: number;
  instantKill?: boolean;
}

export interface TileData {
  q: number;
  r: number;
  color: number;
  kind: TileKind;
  effects?: TileEffects;
}

export interface BridgeData {
  fromKey: string;
  toKey: string;
  color: number;
}

export type Mode = "build" | "bridge" | "walk" | "delete";

export interface MovementAnim {
  fromQ: number;
  fromR: number;
  toQ: number;
  toR: number;
  progress: number;
  duration: number;
}

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
  movementAnim: MovementAnim | null;
  startingHp: number;
  currentHp: number | null;
}
