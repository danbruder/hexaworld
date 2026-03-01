import { state, clearState, saveState } from "../state";
import { Mode } from "../types";
import { renderAll } from "../render/renderer";
import { coordKey } from "../hex/hexUtils";
import { COLORS } from "../constants";

type ModeListener = (mode: Mode) => void;
const modeListeners: ModeListener[] = [];

export function onModeChange(fn: ModeListener): void {
  modeListeners.push(fn);
}

function setMode(mode: Mode): void {
  state.mode = mode;
  state.bridgeStart = null;

  if (mode === "walk" && !state.characterPos && state.tiles.size > 0) {
    const firstTile = state.tiles.values().next().value!;
    state.characterPos = { q: firstTile.q, r: firstTile.r };
  }

  renderAll();
  for (const fn of modeListeners) fn(mode);
}

export function setupToolbar(): void {
  const container = document.getElementById("toolbar")!;

  // Top-level: Build | Play
  const buildBtn = document.createElement("button");
  buildBtn.textContent = "Build";
  buildBtn.addEventListener("click", () => {
    setMode("build");
    updateActive();
  });
  container.appendChild(buildBtn);

  const playBtn = document.createElement("button");
  playBtn.textContent = "Play";
  playBtn.addEventListener("click", () => {
    setMode("walk");
    updateActive();
  });
  container.appendChild(playBtn);

  // Separator
  const sep = document.createElement("div");
  sep.className = "toolbar-sep";
  container.appendChild(sep);

  // Build sub-tools
  const subTools = document.createElement("div");
  subTools.className = "toolbar-sub";
  container.appendChild(subTools);

  const bridgeBtn = document.createElement("button");
  bridgeBtn.textContent = "Bridge";
  bridgeBtn.addEventListener("click", () => {
    setMode("bridge");
    updateActive();
  });
  subTools.appendChild(bridgeBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    setMode("delete");
    updateActive();
  });
  subTools.appendChild(deleteBtn);

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear";
  clearBtn.style.color = "#e55";
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear everything and start over?")) return;
    clearState();
    state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
    saveState();
    renderAll();
  });
  subTools.appendChild(clearBtn);

  function updateActive() {
    const isPlay = state.mode === "walk";
    buildBtn.classList.toggle("active", !isPlay);
    playBtn.classList.toggle("active", isPlay);
    subTools.style.display = isPlay ? "none" : "flex";

    // Sub-tool highlights
    bridgeBtn.classList.toggle("active", state.mode === "bridge");
    deleteBtn.classList.toggle("active", state.mode === "delete");
  }

  updateActive();
}
