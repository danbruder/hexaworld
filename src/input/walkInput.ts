import { Container } from "pixi.js";
import { state } from "../state";
import { coordKey, getNeighborKeys, parseKey, pixelToHex } from "../hex/hexUtils";
import { hexToPixel } from "../hex/hexUtils";
import { renderAll, getCharacterVisualPos } from "../render/renderer";
import { TILE_KINDS } from "../constants";

let worldContainer: Container;
let canvasWidth = 0;
let canvasHeight = 0;

function getReachable(): Set<string> {
  if (!state.characterPos) return new Set();
  const { q, r } = state.characterPos;
  const currentKey = coordKey(q, r);
  const reachable = new Set<string>();

  for (const nk of getNeighborKeys(q, r)) {
    if (state.tiles.has(nk)) reachable.add(nk);
  }
  for (const bridge of state.bridges) {
    if (bridge.fromKey === currentKey) reachable.add(bridge.toKey);
    if (bridge.toKey === currentKey) reachable.add(bridge.fromKey);
  }
  return reachable;
}

function moveToTile(targetKey: string): void {
  if (!state.characterPos) return;
  const { q, r } = state.characterPos;
  const pos = parseKey(targetKey);
  const destTile = state.tiles.get(targetKey);
  let duration: number;
  if (destTile?.effects?.speed !== undefined) {
    duration = destTile.effects.speed;
  } else {
    const kindDef = destTile ? TILE_KINDS.find((k) => k.id === destTile.kind) : null;
    duration = kindDef?.defaultSpeed ?? 0.15;
  }

  state.movementAnim = {
    fromQ: q,
    fromR: r,
    toQ: pos.q,
    toR: pos.r,
    progress: 0,
    duration,
  };
  state.characterPos = { q: pos.q, r: pos.r };
}

export function setupWalkInput(
  wc: Container,
  canvas: HTMLCanvasElement
): void {
  worldContainer = wc;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  // Keyboard movement
  window.addEventListener("keydown", (e) => {
    if (state.mode !== "walk" || !state.characterPos) return;
    if (state.movementAnim) return;

    const reachable = getReachable();
    if (reachable.size === 0) return;

    const currentPixel = hexToPixel(state.characterPos.q, state.characterPos.r);
    let dirX = 0;
    let dirY = 0;

    switch (e.key) {
      case "ArrowUp": case "w": dirY = -1; break;
      case "ArrowDown": case "s": dirY = 1; break;
      case "ArrowLeft": case "a": dirX = -1; break;
      case "ArrowRight": case "d": dirX = 1; break;
      default: return;
    }

    e.preventDefault();

    let bestKey: string | null = null;
    let bestScore = -Infinity;

    for (const rk of reachable) {
      const pos = parseKey(rk);
      const pixel = hexToPixel(pos.q, pos.r);
      const dx = pixel.x - currentPixel.x;
      const dy = pixel.y - currentPixel.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) continue;
      const score = (dx * dirX + dy * dirY) / dist;
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestKey = rk;
      }
    }

    if (bestKey) moveToTile(bestKey);
  });

  // Tap-to-move
  canvas.addEventListener("pointerup", (e) => {
    if (state.mode !== "walk" || !state.characterPos) return;
    if (state.movementAnim) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = (screenX - worldContainer.x) / worldContainer.scale.x;
    const worldY = (screenY - worldContainer.y) / worldContainer.scale.y;
    const { q, r } = pixelToHex(worldX, worldY);
    const tappedKey = coordKey(q, r);

    if (!state.tiles.has(tappedKey)) return;

    const reachable = getReachable();
    if (reachable.has(tappedKey)) {
      moveToTile(tappedKey);
    }
  });
}

/** Lerp camera to center on character (tracks interpolated position during animation) */
export function updateCamera(): void {
  if (state.mode !== "walk" || !state.characterPos) return;

  const visualPos = getCharacterVisualPos();
  if (!visualPos) return;

  const scale = worldContainer.scale.x;

  const targetX = canvasWidth / 2 - visualPos.x * scale;
  const targetY = canvasHeight / 2 - visualPos.y * scale;

  worldContainer.x += (targetX - worldContainer.x) * 0.08;
  worldContainer.y += (targetY - worldContainer.y) * 0.08;
}

export function onResize(w: number, h: number): void {
  canvasWidth = w;
  canvasHeight = h;
}
