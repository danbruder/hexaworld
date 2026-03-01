import { Graphics } from "pixi.js";
import { state } from "../state";
import { getGhostPositions, parseKey } from "../hex/hexUtils";
import { drawHex } from "./drawHex";
import { drawGhost } from "./drawGhost";
import { drawBridge } from "./drawBridge";
import { drawCharacter } from "./drawCharacter";

let tileGraphics: Graphics;
let ghostGraphics: Graphics;
let bridgeGraphics: Graphics;
let characterGraphics: Graphics;
let highlightGraphics: Graphics;

export function initRenderer(): {
  tiles: Graphics;
  ghosts: Graphics;
  bridges: Graphics;
  character: Graphics;
  highlight: Graphics;
} {
  tileGraphics = new Graphics();
  ghostGraphics = new Graphics();
  bridgeGraphics = new Graphics();
  characterGraphics = new Graphics();
  highlightGraphics = new Graphics();

  return {
    tiles: tileGraphics,
    ghosts: ghostGraphics,
    bridges: bridgeGraphics,
    character: characterGraphics,
    highlight: highlightGraphics,
  };
}

export function renderAll(): void {
  // Tiles
  tileGraphics.clear();
  for (const [, tile] of state.tiles) {
    drawHex(tileGraphics, tile.q, tile.r, tile.color);
  }

  // Ghosts (only in build mode)
  ghostGraphics.clear();
  if (state.mode === "build") {
    const ghosts = getGhostPositions();
    for (const key of ghosts) {
      const { q, r } = parseKey(key);
      drawGhost(ghostGraphics, q, r);
    }
  }

  // Bridges
  bridgeGraphics.clear();
  for (const bridge of state.bridges) {
    const from = parseKey(bridge.fromKey);
    const to = parseKey(bridge.toKey);
    drawBridge(bridgeGraphics, from.q, from.r, to.q, to.r);
  }

  // Highlight (bridge start selection)
  highlightGraphics.clear();
  if (state.mode === "bridge" && state.bridgeStart) {
    const { q, r } = parseKey(state.bridgeStart);
    drawHex(highlightGraphics, q, r, 0xffff00);
    highlightGraphics.alpha = 0.3;
  } else {
    highlightGraphics.alpha = 0;
  }

  // Character
  characterGraphics.clear();
  if (state.characterPos) {
    drawCharacter(characterGraphics, state.characterPos.q, state.characterPos.r);
  }
}
