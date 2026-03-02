import { Container } from "pixi.js";
import { state, saveState } from "../state";
import { pixelToHex, coordKey, getGhostPositions } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";
import { blockPan } from "./panZoom";
import { editTile, backToTemplate, getTemplateEffects } from "../ui/tileEditor";

export function setupBuildInput(
  worldContainer: Container,
  canvas: HTMLCanvasElement
): void {
  let painting = false;
  let placed = false;

  function screenToHexKey(clientX: number, clientY: number): string | null {
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const worldX = (screenX - worldContainer.x) / worldContainer.scale.x;
    const worldY = (screenY - worldContainer.y) / worldContainer.scale.y;
    const { q, r } = pixelToHex(worldX, worldY);
    return coordKey(q, r);
  }

  function tryPlace(key: string): boolean {
    if (state.tiles.has(key)) return false;
    const ghosts = getGhostPositions();
    if (!ghosts.includes(key)) return false;
    const [q, r] = key.split(",").map(Number);
    const effects = getTemplateEffects();
    const tile = { q, r, color: state.selectedColor, kind: state.selectedKind, ...(Object.keys(effects).length > 0 ? { effects } : {}) };
    state.tiles.set(key, tile);
    return true;
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (state.mode !== "build" || e.button !== 0) return;

    const key = screenToHexKey(e.clientX, e.clientY);
    if (!key) return;

    // Check if clicking on an existing tile → edit its effects
    if (state.tiles.has(key)) {
      const tile = state.tiles.get(key)!;
      blockPan();
      editTile(tile);
      return;
    }

    // Clicking on a ghost → switch back to template mode + paint
    backToTemplate();

    // Check if we're clicking on a ghost — if so, start painting
    const ghosts = getGhostPositions();
    if (ghosts.includes(key)) {
      painting = true;
      blockPan();
      placed = tryPlace(key);
      if (placed) renderAll();
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (!painting || state.mode !== "build") return;

    const key = screenToHexKey(e.clientX, e.clientY);
    if (!key) return;

    if (tryPlace(key)) {
      placed = true;
      renderAll();
    }
  });

  window.addEventListener("pointerup", () => {
    if (painting && placed) {
      saveState();
    }
    painting = false;
    placed = false;
  });
}
