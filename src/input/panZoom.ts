import { Container } from "pixi.js";
import { ZOOM_MIN, ZOOM_MAX, ZOOM_SPEED } from "../constants";

export function setupPanZoom(
  worldContainer: Container,
  canvas: HTMLCanvasElement
): void {
  let isPanning = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("pointerdown", (e) => {
    // Only pan on left-click (button 0)
    if (e.button !== 0) return;
    isPanning = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("pointermove", (e) => {
    if (!isPanning) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    worldContainer.x += dx;
    worldContainer.y += dy;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("pointerup", () => {
    isPanning = false;
    canvas.style.cursor = "default";
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();

    const oldScale = worldContainer.scale.x;
    const delta = -e.deltaY * ZOOM_SPEED;
    const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldScale + delta * oldScale));

    // Zoom toward cursor position
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - worldContainer.x) / oldScale;
    const worldY = (mouseY - worldContainer.y) / oldScale;

    worldContainer.scale.set(newScale);
    worldContainer.x = mouseX - worldX * newScale;
    worldContainer.y = mouseY - worldY * newScale;
  }, { passive: false });

  // Expose panning state for build/bridge input to check
  (canvas as any).__isPanning = () => isPanning;
}
