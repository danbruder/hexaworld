import { Grid, rectangle, Hex } from "honeycomb-grid";
import { HexTile } from "./HexTile";
import { state } from "../state";

// Reusable grid for coordinate conversion
const grid = new Grid(HexTile, rectangle({ width: 1, height: 1 }));

export function coordKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function parseKey(key: string): { q: number; r: number } {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
}

/** Flat-top hex neighbor offsets (axial coordinates) */
const NEIGHBOR_OFFSETS_EVEN_Q = [
  [+1, 0],
  [-1, 0],
  [0, -1],
  [0, +1],
  [+1, -1],
  [-1, -1],
];

const NEIGHBOR_OFFSETS_ODD_Q = [
  [+1, 0],
  [-1, 0],
  [0, -1],
  [0, +1],
  [+1, +1],
  [-1, +1],
];

export function getNeighborKeys(q: number, r: number): string[] {
  const offsets = q & 1 ? NEIGHBOR_OFFSETS_ODD_Q : NEIGHBOR_OFFSETS_EVEN_Q;
  return offsets.map(([dq, dr]) => coordKey(q + dq, r + dr));
}

/** Return keys of empty positions within `depth` steps of any existing tile */
export function getGhostPositions(depth: number = 3): string[] {
  const ghosts = new Set<string>();
  // BFS frontier: start from all existing tiles
  let frontier = new Set<string>();
  for (const key of state.tiles.keys()) {
    frontier.add(key);
  }

  for (let d = 0; d < depth; d++) {
    const nextFrontier = new Set<string>();
    for (const key of frontier) {
      const { q, r } = parseKey(key);
      for (const nk of getNeighborKeys(q, r)) {
        if (!state.tiles.has(nk) && !ghosts.has(nk)) {
          ghosts.add(nk);
          nextFrontier.add(nk);
        }
      }
    }
    frontier = nextFrontier;
  }

  return Array.from(ghosts);
}

/** Convert world-space pixel position to hex axial coords */
export function pixelToHex(wx: number, wy: number): { q: number; r: number } {
  const hex = grid.pointToHex({ x: wx, y: wy }, { allowOutside: true });
  if (!hex) return { q: 0, r: 0 };
  return { q: hex.q, r: hex.r };
}

/** Get pixel center of a hex at given axial coords */
export function hexToPixel(q: number, r: number): { x: number; y: number } {
  const hex = new HexTile({ q, r });
  return { x: hex.x, y: hex.y };
}

/** Get all hex positions along a line between two hexes (exclusive of endpoints) */
export function hexLineBetween(
  q1: number, r1: number,
  q2: number, r2: number
): { q: number; r: number }[] {
  // Convert offset coords to cube coords
  // For flat-top offset (even-q): cube_q = q, cube_r = r - (q + (q&1)) / 2, cube_s = -cube_q - cube_r
  function toCube(q: number, r: number) {
    const cq = q;
    const cr = r - (q - (q & 1)) / 2;
    const cs = -cq - cr;
    return { cq, cr, cs };
  }

  function toOffset(cq: number, cr: number) {
    const q = cq;
    const r = cr + (cq - (cq & 1)) / 2;
    return { q, r };
  }

  function cubeRound(fq: number, fr: number, fs: number) {
    let rq = Math.round(fq);
    let rr = Math.round(fr);
    let rs = Math.round(fs);
    const dq = Math.abs(rq - fq);
    const dr = Math.abs(rr - fr);
    const ds = Math.abs(rs - fs);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;
    else rs = -rq - rr;
    return { cq: rq, cr: rr, cs: rs };
  }

  const a = toCube(q1, r1);
  const b = toCube(q2, r2);
  const n = Math.max(
    Math.abs(b.cq - a.cq),
    Math.abs(b.cr - a.cr),
    Math.abs(b.cs - a.cs)
  );

  if (n <= 1) return []; // Adjacent or same — no hexes in between

  const results: { q: number; r: number }[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const fq = a.cq + (b.cq - a.cq) * t;
    const fr = a.cr + (b.cr - a.cr) * t;
    const fs = a.cs + (b.cs - a.cs) * t;
    const rounded = cubeRound(fq, fr, fs);
    const off = toOffset(rounded.cq, rounded.cr);
    results.push({ q: off.q, r: off.r });
  }
  return results;
}

/** Get the corner points for drawing a hex */
export function getHexCorners(q: number, r: number): { x: number; y: number }[] {
  const hex = new HexTile({ q, r });
  return hex.corners.map((c) => ({ x: c.x, y: c.y }));
}
