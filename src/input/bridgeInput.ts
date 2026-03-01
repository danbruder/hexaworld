import { Container } from "pixi.js";
import { state } from "../state";
import { pixelToHex, coordKey, parseKey, hexLineBetween } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";
import { BRIDGE_COLOR } from "../constants";

export function setupBridgeInput(
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
    if (state.mode !== "bridge") return;

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

    // Must click on an existing tile
    if (!state.tiles.has(key)) {
      state.bridgeStart = null;
      renderAll();
      return;
    }

    if (!state.bridgeStart) {
      // First click — select start
      state.bridgeStart = key;
      renderAll();
    } else {
      // Second click — create bridge
      if (key !== state.bridgeStart) {
        // Check for duplicate bridge
        const exists = state.bridges.some(
          (b) =>
            (b.fromKey === state.bridgeStart && b.toKey === key) ||
            (b.fromKey === key && b.toKey === state.bridgeStart)
        );
        // Check no tiles exist between the two endpoints
        const from = parseKey(state.bridgeStart);
        const to = parseKey(key);
        const between = hexLineBetween(from.q, from.r, to.q, to.r);
        const blocked = between.some((h) => state.tiles.has(coordKey(h.q, h.r)));

        if (!exists && !blocked) {
          state.bridges.push({
            fromKey: state.bridgeStart,
            toKey: key,
            color: BRIDGE_COLOR,
          });
        }
      }
      state.bridgeStart = null;
      renderAll();
    }
  });
}
