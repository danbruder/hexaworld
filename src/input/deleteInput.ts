import { Container } from "pixi.js";
import { state, saveState } from "../state";
import { pixelToHex, coordKey, hexToPixel } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";

export function setupDeleteInput(
  worldContainer: Container,
  canvas: HTMLCanvasElement
): void {
  let downX = 0;
  let downY = 0;

  canvas.addEventListener("pointerdown", (e) => {
    downX = e.clientX;
    downY = e.clientY;
  });

  canvas.addEventListener("pointerup", (e) => {
    if (state.mode !== "delete") return;

    // Ignore drags
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = (screenX - worldContainer.x) / worldContainer.scale.x;
    const worldY = (screenY - worldContainer.y) / worldContainer.scale.y;

    const { q, r } = pixelToHex(worldX, worldY);
    const key = coordKey(q, r);

    // Try deleting a tile
    if (state.tiles.has(key)) {
      state.tiles.delete(key);
      // Also remove any bridges connected to this tile
      state.bridges = state.bridges.filter(
        (b) => b.fromKey !== key && b.toKey !== key
      );
      // Clear character if it was on this tile
      if (state.characterPos && coordKey(state.characterPos.q, state.characterPos.r) === key) {
        state.characterPos = null;
      }
      saveState();
      renderAll();
      return;
    }

    // Try deleting a bridge (find the closest bridge to click point)
    let closestIdx = -1;
    let closestDist = 20; // max click distance in world units
    for (let i = 0; i < state.bridges.length; i++) {
      const b = state.bridges[i];
      const from = state.tiles.get(b.fromKey);
      const to = state.tiles.get(b.toKey);
      if (!from || !to) continue;
      const fp = hexToPixel(from.q, from.r);
      const tp = hexToPixel(to.q, to.r);
      const dist = pointToSegmentDist(worldX, worldY, fp.x, fp.y, tp.x, tp.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx >= 0) {
      state.bridges.splice(closestIdx, 1);
      saveState();
      renderAll();
    }
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
