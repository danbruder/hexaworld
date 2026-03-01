import { Container } from "pixi.js";
import { state, saveState } from "../state";
import { pixelToHex, coordKey, getGhostPositions } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";

export function setupBuildInput(
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
    if (state.mode !== "build") return;

    // Ignore if it was a drag (pan)
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return;

    // Convert screen → world → hex
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = (screenX - worldContainer.x) / worldContainer.scale.x;
    const worldY = (screenY - worldContainer.y) / worldContainer.scale.y;

    const { q, r } = pixelToHex(worldX, worldY);
    const key = coordKey(q, r);

    // Only place on ghost positions
    const ghosts = getGhostPositions();
    if (!ghosts.includes(key)) return;

    state.tiles.set(key, { q, r, color: state.selectedColor, kind: state.selectedKind });
    saveState();
    renderAll();
  });
}
