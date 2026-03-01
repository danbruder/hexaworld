import { Container } from "pixi.js";
import { state, saveState } from "../state";
import { pixelToHex, coordKey, hexToPixel } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";
import { blockPan } from "./panZoom";

export function setupDeleteInput(
  worldContainer: Container,
  canvas: HTMLCanvasElement
): void {
  let erasing = false;
  let deleted = false;

  function screenToWorld(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    return {
      x: (screenX - worldContainer.x) / worldContainer.scale.x,
      y: (screenY - worldContainer.y) / worldContainer.scale.y,
    };
  }

  function tryDeleteAt(clientX: number, clientY: number): boolean {
    const world = screenToWorld(clientX, clientY);
    const { q, r } = pixelToHex(world.x, world.y);
    const key = coordKey(q, r);

    // Try deleting a tile (but not the last one)
    if (state.tiles.has(key) && state.tiles.size > 1) {
      state.tiles.delete(key);
      state.bridges = state.bridges.filter(
        (b) => b.fromKey !== key && b.toKey !== key
      );
      if (state.characterPos && coordKey(state.characterPos.q, state.characterPos.r) === key) {
        state.characterPos = null;
      }
      return true;
    }

    // Try deleting a bridge (only on initial click, not drag)
    if (!erasing) {
      let closestIdx = -1;
      let closestDist = 20;
      for (let i = 0; i < state.bridges.length; i++) {
        const b = state.bridges[i];
        const from = state.tiles.get(b.fromKey);
        const to = state.tiles.get(b.toKey);
        if (!from || !to) continue;
        const fp = hexToPixel(from.q, from.r);
        const tp = hexToPixel(to.q, to.r);
        const dist = pointToSegmentDist(world.x, world.y, fp.x, fp.y, tp.x, tp.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }
      if (closestIdx >= 0) {
        state.bridges.splice(closestIdx, 1);
        return true;
      }
    }

    return false;
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (state.mode !== "delete" || e.button !== 0) return;

    const world = screenToWorld(e.clientX, e.clientY);
    const { q, r } = pixelToHex(world.x, world.y);
    const key = coordKey(q, r);

    // Start erasing if clicking on a tile
    if (state.tiles.has(key)) {
      erasing = true;
      blockPan();
      deleted = tryDeleteAt(e.clientX, e.clientY);
      if (deleted) renderAll();
    } else {
      // Try bridge delete on click (non-drag)
      // handled in pointerup for single clicks
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (!erasing || state.mode !== "delete") return;

    if (tryDeleteAt(e.clientX, e.clientY)) {
      deleted = true;
      renderAll();
    }
  });

  window.addEventListener("pointerup", (e) => {
    if (state.mode === "delete" && !erasing) {
      // Single click — try bridge delete
      if (tryDeleteAt(e.clientX, e.clientY)) {
        saveState();
        renderAll();
      }
    }
    if (erasing && deleted) {
      saveState();
    }
    erasing = false;
    deleted = false;
  });
}

function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}
