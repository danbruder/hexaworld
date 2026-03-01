import { state } from "../state";
import { Mode } from "../types";
import { renderAll } from "../render/renderer";
import { coordKey } from "../hex/hexUtils";

export function setupToolbar(): void {
  const container = document.getElementById("toolbar")!;

  const modes: { label: string; mode: Mode }[] = [
    { label: "Build", mode: "build" },
    { label: "Bridge", mode: "bridge" },
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

  function updateActive() {
    buttons.forEach((btn, i) => {
      btn.classList.toggle("active", modes[i].mode === state.mode);
    });
  }

  updateActive();
}
