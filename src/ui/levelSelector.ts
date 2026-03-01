import { state, getLevels, switchLevel, createLevel, deleteLevel, renameLevel, saveState, onLevelComplete } from "../state";
import { renderAll } from "../render/renderer";
import { COLORS } from "../constants";
import { coordKey } from "../hex/hexUtils";

function showCelebration(levelName: string): void {
  const overlay = document.createElement("div");
  overlay.className = "celebration-overlay";

  overlay.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-stars">&#10024;</div>
      <div class="celebration-title">Level Complete!</div>
      <div class="celebration-level">${levelName}</div>
      <div class="celebration-stars">&#127881; &#127775; &#127881;</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger animation on next frame
  requestAnimationFrame(() => overlay.classList.add("show"));

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    setTimeout(() => overlay.remove(), 500);
  }, 3000);

  // Click to dismiss early
  overlay.addEventListener("click", () => {
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    setTimeout(() => overlay.remove(), 500);
  });
}

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

  // Listen for level completions
  onLevelComplete((_id, name) => {
    showCelebration(name);
    render();
  });

  render();
}
