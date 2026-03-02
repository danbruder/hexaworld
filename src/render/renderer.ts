import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { state } from "../state";
import { getGhostPositions, parseKey, hexToPixel } from "../hex/hexUtils";
import { drawHex } from "./drawHex";
import { drawGhost } from "./drawGhost";
import { drawBridge } from "./drawBridge";
import { TILE_KINDS, PLAYER_CHARACTERS } from "../constants";
import { onTileArrival } from "../game/tileEffects";

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
  fontFamily: "Fredoka",
});

// Pool of text objects for kind icons
const kindTexts: Text[] = [];

const characterStyle = new TextStyle({
  fontSize: 36,
  align: "center",
  fontFamily: "Fredoka",
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

  // Character — skip snap if animating
  if (state.characterPos && !state.movementAnim) {
    const charDef = PLAYER_CHARACTERS.find((c) => c.id === state.selectedCharacter);
    const center = hexToPixel(state.characterPos.q, state.characterPos.r);
    characterText.text = charDef?.icon ?? PLAYER_CHARACTERS[0].icon;
    characterText.x = center.x;
    characterBaseY = center.y;
    characterText.y = characterBaseY;
    characterContainer.visible = true;
  } else if (!state.characterPos) {
    characterContainer.visible = false;
  }
}

/** Ease-out cubic */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Advance movement animation; call each frame with dt in seconds */
export function updateMovement(dt: number): void {
  const anim = state.movementAnim;
  if (!anim) return;

  anim.progress += dt / anim.duration;

  const fromPixel = hexToPixel(anim.fromQ, anim.fromR);
  const toPixel = hexToPixel(anim.toQ, anim.toR);

  if (anim.progress >= 1) {
    // Animation complete — snap to destination
    characterText.x = toPixel.x;
    characterBaseY = toPixel.y;
    characterText.y = characterBaseY;
    characterContainer.visible = true;
    state.movementAnim = null;

    // Trigger tile arrival effects
    onTileArrival(anim.toQ, anim.toR);
  } else {
    const t = easeOut(anim.progress);
    characterText.x = fromPixel.x + (toPixel.x - fromPixel.x) * t;
    characterBaseY = fromPixel.y + (toPixel.y - fromPixel.y) * t;
    characterText.y = characterBaseY;
    characterContainer.visible = true;

    // Update character icon
    const charDef = PLAYER_CHARACTERS.find((c) => c.id === state.selectedCharacter);
    characterText.text = charDef?.icon ?? PLAYER_CHARACTERS[0].icon;
  }
}

/** Get current visual position of character (for camera tracking during animation) */
export function getCharacterVisualPos(): { x: number; y: number } | null {
  if (!state.characterPos) return null;

  const anim = state.movementAnim;
  if (anim) {
    const fromPixel = hexToPixel(anim.fromQ, anim.fromR);
    const toPixel = hexToPixel(anim.toQ, anim.toR);
    const t = easeOut(anim.progress);
    return {
      x: fromPixel.x + (toPixel.x - fromPixel.x) * t,
      y: fromPixel.y + (toPixel.y - fromPixel.y) * t,
    };
  }

  return hexToPixel(state.characterPos.q, state.characterPos.r);
}

/** Call each frame to animate the idle bob */
export function updateCharacterBob(): void {
  if (!characterContainer.visible) return;
  const bob = Math.sin(Date.now() / 400) * 3;
  characterText.y = characterBaseY + bob;
}
