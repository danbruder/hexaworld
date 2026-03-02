import { state, saveState } from "../state";
import { coordKey } from "../hex/hexUtils";
import { TileData, TileEffects } from "../types";

let panel: HTMLDivElement | null = null;
let currentTileKey: string | null = null; // null = template mode, string = editing a placed tile

// Template effects applied to newly placed tiles
const templateEffects: TileEffects = {};

export function getTemplateEffects(): TileEffects {
  // Return a copy so callers don't mutate the template
  const eff: TileEffects = {};
  if (templateEffects.speed !== undefined) eff.speed = templateEffects.speed;
  if (templateEffects.damage !== undefined) eff.damage = templateEffects.damage;
  if (templateEffects.instantKill) eff.instantKill = true;
  return Object.keys(eff).length > 0 ? eff : {};
}

/** Show the editor in template mode (for configuring the next tile to place) */
export function showTemplateEditor(): void {
  currentTileKey = null;
  buildPanel(templateEffects, "Tile Properties");
}

/** Show the editor in edit mode for an existing tile */
export function editTile(tile: TileData): void {
  currentTileKey = coordKey(tile.q, tile.r);
  const effects = tile.effects ?? {};
  buildPanel(effects, `Editing (${tile.q}, ${tile.r})`);
}

/** Close the editor panel entirely */
export function closeTileEditor(): void {
  if (panel) {
    panel.remove();
    panel = null;
  }
  currentTileKey = null;
}

/** Switch back to template mode without closing */
export function backToTemplate(): void {
  showTemplateEditor();
}

export function isTileEditorOpen(): boolean {
  return panel !== null;
}

function buildPanel(effects: TileEffects, titleText: string): void {
  // Remove old panel if present
  if (panel) {
    panel.remove();
    panel = null;
  }

  panel = document.createElement("div");
  panel.id = "tile-editor";

  // Title row
  const titleRow = document.createElement("div");
  titleRow.className = "tile-editor-title";
  titleRow.textContent = titleText;

  // If editing a placed tile, add a "back" button
  if (currentTileKey !== null) {
    const backBtn = document.createElement("button");
    backBtn.className = "tile-editor-back";
    backBtn.textContent = "\u2190";
    backBtn.title = "Back to template";
    backBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showTemplateEditor();
    });
    titleRow.prepend(backBtn);
  }

  panel.appendChild(titleRow);

  // Speed slider
  const speedGroup = document.createElement("div");
  speedGroup.className = "tile-editor-group";
  const speedLabel = document.createElement("label");
  speedLabel.textContent = "Speed (s)";
  const speedInput = document.createElement("input");
  speedInput.type = "range";
  speedInput.min = "0.05";
  speedInput.max = "5";
  speedInput.step = "0.05";
  speedInput.value = String(effects.speed ?? 0.15);
  const speedValue = document.createElement("span");
  speedValue.className = "tile-editor-value";
  speedValue.textContent = speedInput.value;
  speedInput.addEventListener("input", () => {
    speedValue.textContent = speedInput.value;
    applyEffect("speed", parseFloat(speedInput.value));
  });
  speedGroup.appendChild(speedLabel);
  speedGroup.appendChild(speedInput);
  speedGroup.appendChild(speedValue);
  panel.appendChild(speedGroup);

  // Damage input
  const dmgGroup = document.createElement("div");
  dmgGroup.className = "tile-editor-group";
  const dmgLabel = document.createElement("label");
  dmgLabel.textContent = "Damage";
  const dmgInput = document.createElement("input");
  dmgInput.type = "number";
  dmgInput.min = "0";
  dmgInput.max = "1000";
  dmgInput.step = "1";
  dmgInput.value = String(effects.damage ?? 0);
  dmgInput.className = "tile-editor-number";
  dmgInput.addEventListener("input", () => {
    applyEffect("damage", Math.max(0, parseInt(dmgInput.value) || 0));
  });
  dmgGroup.appendChild(dmgLabel);
  dmgGroup.appendChild(dmgInput);
  panel.appendChild(dmgGroup);

  // Instant kill toggle
  const killGroup = document.createElement("div");
  killGroup.className = "tile-editor-group tile-editor-check";
  const killLabel = document.createElement("label");
  killLabel.textContent = "Instant Kill";
  const toggleLabel = document.createElement("label");
  toggleLabel.className = "toggle-switch";
  const killInput = document.createElement("input");
  killInput.type = "checkbox";
  killInput.checked = effects.instantKill ?? false;
  killInput.addEventListener("change", () => {
    applyEffect("instantKill", killInput.checked);
  });
  const toggleSlider = document.createElement("span");
  toggleSlider.className = "toggle-slider";
  toggleLabel.appendChild(killInput);
  toggleLabel.appendChild(toggleSlider);
  killGroup.appendChild(killLabel);
  killGroup.appendChild(toggleLabel);
  panel.appendChild(killGroup);

  document.body.appendChild(panel);
}

function applyEffect(key: string, value: number | boolean): void {
  if (currentTileKey !== null) {
    // Editing an existing placed tile
    const tile = state.tiles.get(currentTileKey);
    if (!tile) return;
    if (!tile.effects) tile.effects = {};
    setEffectField(tile.effects, key, value);
    if (Object.keys(tile.effects).length === 0) delete tile.effects;
    saveState();
  } else {
    // Template mode — update template for next placement
    setEffectField(templateEffects, key, value);
  }
}

function setEffectField(effects: TileEffects, key: string, value: number | boolean): void {
  if (key === "speed") {
    const v = value as number;
    if (Math.abs(v - 0.15) < 0.001) delete effects.speed;
    else effects.speed = v;
  } else if (key === "damage") {
    const v = value as number;
    if (v === 0) delete effects.damage;
    else effects.damage = v;
  } else if (key === "instantKill") {
    if (value) effects.instantKill = true;
    else delete effects.instantKill;
  }
}
