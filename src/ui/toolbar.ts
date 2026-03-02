import { state, clearState, saveState, exportLevels, importLevels } from "../state";
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

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export";
  exportBtn.addEventListener("click", () => {
    exportLevels();
  });
  subTools.appendChild(exportBtn);

  const importBtn = document.createElement("button");
  importBtn.textContent = "Import";
  importBtn.addEventListener("click", () => {
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
          // Dynamically import to avoid circular dependency
          import("./levelSelector").then((m) => m.rerenderLevelSelector());
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
  subTools.appendChild(importBtn);

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
