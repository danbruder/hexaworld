import { state, getLevels, switchLevel, createLevel, deleteLevel, renameLevel, saveState, onLevelComplete, updateLevelHp } from "../state";
import { renderAll } from "../render/renderer";
import { COLORS } from "../constants";
import { coordKey } from "../hex/hexUtils";
import { showOverlay } from "./overlay";
import { onModeChange } from "./toolbar";

export function setupLevelSelector(): void {
  const container = document.getElementById("level-selector")!;

  function startRename(level: { id: string; name: string }, tab: HTMLElement) {
    const input = document.createElement("input");
    input.className = "level-rename";
    input.value = level.name;
    input.size = Math.max(level.name.length, 4);

    tab.innerHTML = "";
    tab.appendChild(input);
    input.focus();
    input.select();

    function commit() {
      const trimmed = input.value.trim();
      if (trimmed) {
        renameLevel(level.id, trimmed);
      }
      render();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        // Revert — just re-render
        input.removeEventListener("blur", commit);
        render();
      }
    });
  }

  function render() {
    container.innerHTML = "";
    const levels = getLevels();

    for (const level of levels) {
      const tab = document.createElement("div");
      tab.className = "level-tab";
      if (level.id === state.currentLevel) tab.classList.add("active");

      const nameBtn = document.createElement("button");
      nameBtn.className = "level-name";
      nameBtn.textContent = (level.completed ? "\u2705 " : "") + level.name;

      // Click to switch
      nameBtn.addEventListener("click", () => {
        if (level.id === state.currentLevel) return;
        switchLevel(level.id);
        if (state.tiles.size === 0) {
          state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
          saveState();
        }
        renderAll();
        render();
      });

      // Double-click to rename
      nameBtn.addEventListener("dblclick", (e) => {
        e.preventDefault();
        startRename(level, tab);
      });

      tab.appendChild(nameBtn);

      // HP input for active level in build mode
      if (level.id === state.currentLevel && state.mode !== "walk") {
        const hpInput = document.createElement("input");
        hpInput.className = "level-hp-input";
        hpInput.type = "number";
        hpInput.min = "1";
        hpInput.max = "9999";
        hpInput.value = String(level.startingHp ?? 100);
        hpInput.title = "Starting HP";
        hpInput.addEventListener("change", () => {
          const hp = Math.max(1, parseInt(hpInput.value) || 100);
          hpInput.value = String(hp);
          updateLevelHp(level.id, hp);
          state.startingHp = hp;
        });
        hpInput.addEventListener("click", (e) => e.stopPropagation());
        tab.appendChild(hpInput);
      }

      // Delete button (only if more than one level)
      if (levels.length > 1) {
        const delBtn = document.createElement("button");
        delBtn.className = "level-delete";
        delBtn.textContent = "\u00D7";
        delBtn.title = "Delete level";
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!confirm(`Delete "${level.name}"?`)) return;
          deleteLevel(level.id);
          if (state.tiles.size === 0) {
            state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
            saveState();
          }
          renderAll();
          render();
        });
        tab.appendChild(delBtn);
      }

      container.appendChild(tab);
    }

    // Add level button
    const addBtn = document.createElement("button");
    addBtn.className = "level-add";
    addBtn.textContent = "+";
    addBtn.title = "New level";
    addBtn.addEventListener("click", () => {
      createLevel();
      state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
      saveState();
      renderAll();
      render();
    });
    container.appendChild(addBtn);
  }

  // Re-render on mode change (to show/hide HP input)
  onModeChange(() => render());

  // Listen for level completions
  onLevelComplete((_id, name) => {
    showOverlay({
      className: "overlay-win",
      title: "Level Complete!",
      subtitle: name,
      topDecor: "&#10024;",
      bottomDecor: "&#127881; &#127775; &#127881;",
    });
    render();
  });

  render();

  // Expose refresh for external callers (e.g. import)
  refreshLevelSelector = render;
}

let refreshLevelSelector: (() => void) | null = null;

export function rerenderLevelSelector(): void {
  if (refreshLevelSelector) refreshLevelSelector();
}
