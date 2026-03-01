import { Container } from "pixi.js";
import { state, completeLevel } from "../state";
import { coordKey, getNeighborKeys, parseKey } from "../hex/hexUtils";
import { hexToPixel } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";
import { showOverlay } from "../ui/overlay";

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
      state.characterPos = { q: pos.q, r: pos.r };
      renderAll();

      // Check tile effects
      const tile = state.tiles.get(bestKey);
      if (tile && tile.kind === "flag") {
        completeLevel(state.currentLevel);
      } else if (tile && tile.kind === "skull") {
        showOverlay({
          className: "overlay-death",
          title: "You Died!",
          topDecor: "&#128128;",
          bottomDecor: "&#128128; &#128128; &#128128;",
          duration: 2000,
        });
        // Respawn at seed tile (0,0)
        state.characterPos = { q: 0, r: 0 };
        renderAll();
      }
    }
  });
}

/** Lerp camera to center on character */
export function updateCamera(): void {
  if (state.mode !== "walk" || !state.characterPos) return;

  const target = hexToPixel(state.characterPos.q, state.characterPos.r);
  const scale = worldContainer.scale.x;

  const targetX = canvasWidth / 2 - target.x * scale;
  const targetY = canvasHeight / 2 - target.y * scale;

  worldContainer.x += (targetX - worldContainer.x) * 0.08;
  worldContainer.y += (targetY - worldContainer.y) * 0.08;
}

export function onResize(w: number, h: number): void {
  canvasWidth = w;
  canvasHeight = h;
}
