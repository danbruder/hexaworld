import { state, clearState, saveState, exportLevels, importLevels, getWorldName } from "../state";
import { Mode } from "../types";
import { renderAll } from "../render/renderer";
import { coordKey } from "../hex/hexUtils";
import { COLORS } from "../constants";
import { closeTileEditor, showTemplateEditor } from "./tileEditor";
import { updateHpBar } from "./hpBar";

type ModeListener = (mode: Mode) => void;
const modeListeners: ModeListener[] = [];

export function onModeChange(fn: ModeListener): void {
  modeListeners.push(fn);
}

function setMode(mode: Mode): void {
  state.mode = mode;
  state.bridgeStart = null;
  state.movementAnim = null;

  // Show tile editor in build mode, close in other modes
  if (mode === "build") {
    showTemplateEditor();
  } else {
    closeTileEditor();
  }

  if (mode === "walk" && !state.characterPos && state.tiles.size > 0) {
    const firstTile = state.tiles.values().next().value!;
    state.characterPos = { q: firstTile.q, r: firstTile.r };
  }

  // Set/reset HP when entering/leaving walk mode
  if (mode === "walk") {
    state.currentHp = state.startingHp;
  } else {
    state.currentHp = null;
  }
  updateHpBar();

  renderAll();
  for (const fn of modeListeners) fn(mode);
}

export function setupToolbar(): void {
  const container = document.getElementById("toolbar")!;

  // Top-level: Build | Play
  const buildBtn = document.createElement("button");
  buildBtn.innerHTML = "\u270F\uFE0F Build";
  buildBtn.addEventListener("click", () => {
    setMode("build");
    updateActive();
  });
  container.appendChild(buildBtn);

  const playBtn = document.createElement("button");
  playBtn.innerHTML = "\u25B6 Play";
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
  bridgeBtn.innerHTML = "\u{1F309} Bridge";
  bridgeBtn.addEventListener("click", () => {
    setMode("bridge");
    updateActive();
  });
  subTools.appendChild(bridgeBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "\u{1F5D1}\uFE0F Delete";
  deleteBtn.addEventListener("click", () => {
    setMode("delete");
    updateActive();
  });
  subTools.appendChild(deleteBtn);

  const clearBtn = document.createElement("button");
  clearBtn.innerHTML = "\u{1F4A5} Clear";
  clearBtn.style.color = "#e55";
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear everything and start over?")) return;
    clearState();
    state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
    saveState();
    renderAll();
  });
  subTools.appendChild(clearBtn);

  // Menu button with dropdown for Export/Import
  const menuWrap = document.createElement("div");
  menuWrap.className = "toolbar-menu-wrap";
  subTools.appendChild(menuWrap);

  const menuBtn = document.createElement("button");
  menuBtn.textContent = "\u2699";
  menuBtn.title = "More options";
  menuBtn.className = "toolbar-menu-btn";
  menuWrap.appendChild(menuBtn);

  const menuDropdown = document.createElement("div");
  menuDropdown.className = "toolbar-dropdown";
  menuWrap.appendChild(menuDropdown);

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export";
  exportBtn.addEventListener("click", () => {
    exportLevels();
    menuDropdown.classList.remove("open");
  });
  menuDropdown.appendChild(exportBtn);

  const importBtn = document.createElement("button");
  importBtn.textContent = "Import";
  importBtn.addEventListener("click", () => {
    menuDropdown.classList.remove("open");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        try {
          const count = importLevels(text);
          import("./levelSelector").then((m) => m.rerenderLevelSelector());
          document.getElementById("world-title")!.textContent = getWorldName();
          renderAll();
          alert(`Imported ${count} level${count !== 1 ? "s" : ""}.`);
        } catch (e) {
          alert(`Import failed: ${(e as Error).message}`);
        }
      });
      input.remove();
    });
    document.body.appendChild(input);
    input.click();
  });
  menuDropdown.appendChild(importBtn);

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle("open");
  });
  document.addEventListener("click", () => {
    menuDropdown.classList.remove("open");
  });

  // Floating back button for play mode
  const backBtn = document.createElement("button");
  backBtn.id = "play-back-btn";
  backBtn.textContent = "\u2190 Build";
  backBtn.addEventListener("click", () => {
    setMode("build");
    updateActive();
  });
  document.body.appendChild(backBtn);

  function updateActive() {
    const isPlay = state.mode === "walk";
    buildBtn.classList.toggle("active", !isPlay);
    playBtn.classList.toggle("active", isPlay);
    subTools.style.display = isPlay ? "none" : "flex";

    // Sub-tool highlights
    bridgeBtn.classList.toggle("active", state.mode === "bridge");
    deleteBtn.classList.toggle("active", state.mode === "delete");

    // Hide/show build UI panels in play mode
    container.style.display = isPlay ? "none" : "flex";
    backBtn.style.display = isPlay ? "block" : "none";
    const kindPicker = document.getElementById("kind-picker");
    const levelSelector = document.getElementById("level-selector");
    const worldTitle = document.getElementById("world-title");
    if (kindPicker) kindPicker.style.display = isPlay ? "none" : "flex";
    if (levelSelector) levelSelector.style.display = isPlay ? "none" : "flex";
    if (worldTitle) worldTitle.style.display = isPlay ? "none" : "block";
  }

  updateActive();
}
