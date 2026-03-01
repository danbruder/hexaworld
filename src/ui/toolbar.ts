import { state, clearState, saveState } from "../state";
import { Mode } from "../types";
import { renderAll } from "../render/renderer";
import { coordKey } from "../hex/hexUtils";
import { COLORS } from "../constants";

export function setupToolbar(): void {
  const container = document.getElementById("toolbar")!;

  const modes: { label: string; mode: Mode }[] = [
    { label: "Build", mode: "build" },
    { label: "Bridge", mode: "bridge" },
    { label: "Delete", mode: "delete" },
    { label: "Walk", mode: "walk" },
  ];

  const buttons: HTMLButtonElement[] = [];

  for (const { label, mode } of modes) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      state.mode = mode;
      state.bridgeStart = null;

      // When entering walk mode, place character on first tile if not placed
      if (mode === "walk" && !state.characterPos && state.tiles.size > 0) {
        const firstTile = state.tiles.values().next().value!;
        state.characterPos = { q: firstTile.q, r: firstTile.r };
      }

      updateActive();
      renderAll();
    });
    buttons.push(btn);
    container.appendChild(btn);
  }

  // Separator
  const sep = document.createElement("div");
  sep.style.width = "1px";
  sep.style.background = "rgba(255,255,255,0.2)";
  sep.style.margin = "4px 2px";
  container.appendChild(sep);

  // Clear button
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear";
  clearBtn.style.color = "#e55";
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear everything and start over?")) return;
    clearState();
    // Re-seed
    state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
    saveState();
    renderAll();
  });
  container.appendChild(clearBtn);

  function updateActive() {
    buttons.forEach((btn, i) => {
      btn.classList.toggle("active", modes[i].mode === state.mode);
    });
  }

  updateActive();
}
