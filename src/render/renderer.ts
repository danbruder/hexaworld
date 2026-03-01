import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { state } from "../state";
import { getGhostPositions, parseKey, hexToPixel } from "../hex/hexUtils";
import { drawHex } from "./drawHex";
import { drawGhost } from "./drawGhost";
import { drawBridge } from "./drawBridge";
import { TILE_KINDS, PLAYER_CHARACTERS } from "../constants";

let tileGraphics: Graphics;
let ghostGraphics: Graphics;
let bridgeGraphics: Graphics;
let characterContainer: Container;
let characterText: Text;
let highlightGraphics: Graphics;
let kindContainer: Container;

const kindIconStyle = new TextStyle({
  fontSize: 24,
  align: "center",
});

// Pool of text objects for kind icons
const kindTexts: Text[] = [];

const characterStyle = new TextStyle({
  fontSize: 36,
  align: "center",
});

let characterBaseY = 0;

export function initRenderer(): {
  tiles: Graphics;
  ghosts: Graphics;
  bridges: Graphics;
  character: Container;
  highlight: Graphics;
  kinds: Container;
} {
  tileGraphics = new Graphics();
  ghostGraphics = new Graphics();
  bridgeGraphics = new Graphics();
  characterContainer = new Container();
  characterText = new Text({ text: "", style: characterStyle });
  characterText.anchor.set(0.5);
  characterContainer.addChild(characterText);
  highlightGraphics = new Graphics();
  kindContainer = new Container();

  return {
    tiles: tileGraphics,
    ghosts: ghostGraphics,
    bridges: bridgeGraphics,
    character: characterContainer,
    highlight: highlightGraphics,
    kinds: kindContainer,
  };
}

export function renderAll(): void {
  // Tiles
  tileGraphics.clear();
  for (const [, tile] of state.tiles) {
    const kind = tile.kind || "color";
    const kindDef = kind !== "color" ? TILE_KINDS.find((k) => k.id === kind) : null;
    const color = kindDef?.color ?? tile.color;
    drawHex(tileGraphics, tile.q, tile.r, color);
  }

  // Kind icons
  // Hide all existing texts
  for (const t of kindTexts) {
    t.visible = false;
  }
  let textIdx = 0;
  for (const [, tile] of state.tiles) {
    const kind = tile.kind || "color";
    if (kind === "color") continue;

    const kindDef = TILE_KINDS.find((k) => k.id === kind);
    if (!kindDef || !kindDef.icon) continue;

    const center = hexToPixel(tile.q, tile.r);

    // Reuse or create text
    let text: Text;
    if (textIdx < kindTexts.length) {
      text = kindTexts[textIdx];
      text.visible = true;
    } else {
      text = new Text({ text: "", style: kindIconStyle });
      text.anchor.set(0.5);
      kindContainer.addChild(text);
      kindTexts.push(text);
    }
    text.text = kindDef.icon;
    text.x = center.x;
    text.y = center.y;
    textIdx++;
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
  if (state.characterPos) {
    const charDef = PLAYER_CHARACTERS.find((c) => c.id === state.selectedCharacter);
    const center = hexToPixel(state.characterPos.q, state.characterPos.r);
    characterText.text = charDef?.icon ?? PLAYER_CHARACTERS[0].icon;
    characterText.x = center.x;
    characterBaseY = center.y;
    characterText.y = characterBaseY;
    characterContainer.visible = true;
  } else {
    characterContainer.visible = false;
  }
}

/** Call each frame to animate the idle bob */
export function updateCharacterBob(): void {
  if (!characterContainer.visible) return;
  const bob = Math.sin(Date.now() / 400) * 3;
  characterText.y = characterBaseY + bob;
}
