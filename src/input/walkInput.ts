import { Container } from "pixi.js";
import { state } from "../state";
import { coordKey, getNeighborKeys, parseKey } from "../hex/hexUtils";
import { hexToPixel } from "../hex/hexUtils";
import { renderAll, getCharacterVisualPos } from "../render/renderer";

let worldContainer: Container;
let canvasWidth = 0;
let canvasHeight = 0;

export function setupWalkInput(
  wc: Container,
  canvas: HTMLCanvasElement
): void {
  worldContainer = wc;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  window.addEventListener("keydown", (e) => {
    if (state.mode !== "walk" || !state.characterPos) return;

    // Block input while animating
    if (state.movementAnim) return;

    const { q, r } = state.characterPos;
    const currentKey = coordKey(q, r);

    // Get all reachable positions: adjacent tiles + bridge endpoints
    const reachable = new Set<string>();

    // Adjacent tiles
    for (const nk of getNeighborKeys(q, r)) {
      if (state.tiles.has(nk)) {
        reachable.add(nk);
      }
    }

    // Bridge endpoints
    for (const bridge of state.bridges) {
      if (bridge.fromKey === currentKey) reachable.add(bridge.toKey);
      if (bridge.toKey === currentKey) reachable.add(bridge.fromKey);
    }

    if (reachable.size === 0) return;

    // Find the reachable tile closest to the direction pressed
    const currentPixel = hexToPixel(q, r);
    let dirX = 0;
    let dirY = 0;

    switch (e.key) {
      case "ArrowUp":
      case "w":
        dirY = -1;
        break;
      case "ArrowDown":
      case "s":
        dirY = 1;
        break;
      case "ArrowLeft":
      case "a":
        dirX = -1;
        break;
      case "ArrowRight":
      case "d":
        dirX = 1;
        break;
      default:
        return;
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

      // Dot product with direction
      const score = (dx * dirX + dy * dirY) / dist;
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestKey = rk;
      }
    }

    if (bestKey) {
      const pos = parseKey(bestKey);
      const destTile = state.tiles.get(bestKey);
      const duration = destTile?.effects?.speed ?? 0.15;

      // Start movement animation
      state.movementAnim = {
        fromQ: q,
        fromR: r,
        toQ: pos.q,
        toR: pos.r,
        progress: 0,
        duration,
      };

      // Set logical position to destination immediately
      state.characterPos = { q: pos.q, r: pos.r };
      // Don't call renderAll — the animation loop handles visuals
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
