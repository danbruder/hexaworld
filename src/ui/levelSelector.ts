import { state, getLevels, switchLevel, createLevel, saveState } from "../state";
import { renderAll } from "../render/renderer";
import { COLORS } from "../constants";
import { coordKey } from "../hex/hexUtils";

export function setupLevelSelector(): void {
  const container = document.getElementById("level-selector")!;

  function render() {
    container.innerHTML = "";
    const levels = getLevels();

    for (const level of levels) {
      const btn = document.createElement("button");
      btn.textContent = level.name;
      if (level.id === state.currentLevel) btn.classList.add("active");

      btn.addEventListener("click", () => {
        if (level.id === state.currentLevel) return;
        switchLevel(level.id);
        // Ensure at least a seed tile
        if (state.tiles.size === 0) {
          state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
          saveState();
        }
        renderAll();
        render();
      });

      container.appendChild(btn);
    }

    // Add level button
    const addBtn = document.createElement("button");
    addBtn.className = "level-add";
    addBtn.textContent = "+";
    addBtn.title = "New level";
    addBtn.addEventListener("click", () => {
      createLevel();
      // Seed the new empty level
      state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
      saveState();
      renderAll();
      render();
    });
    container.appendChild(addBtn);
  }

  render();
}
