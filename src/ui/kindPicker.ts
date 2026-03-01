import { state } from "../state";
import { TILE_KINDS } from "../constants";

export function setupKindPicker(): void {
  const container = document.getElementById("kind-picker")!;

  // Scrollable list
  const list = document.createElement("div");
  list.className = "kind-list";
  container.appendChild(list);

  // Toggle button at bottom
  const toggle = document.createElement("button");
  toggle.className = "kind-toggle";
  toggle.textContent = "\u{25BC} Tiles";
  container.appendChild(toggle);

  const buttons: HTMLButtonElement[] = [];

  for (const kind of TILE_KINDS) {
    const btn = document.createElement("button");
    btn.className = "kind-btn";
    if (kind.icon) {
      btn.innerHTML = `<span class="kind-icon">${kind.icon}</span><span class="kind-label">${kind.label}</span>`;
    } else {
      btn.innerHTML = `<span class="kind-label">${kind.label}</span>`;
    }
    btn.title = kind.label;
    btn.addEventListener("click", () => {
      state.selectedKind = kind.id;
      updateActive();
    });
    buttons.push(btn);
    list.appendChild(btn);
  }

  let collapsed = false;
  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    container.classList.toggle("collapsed", collapsed);
    toggle.textContent = collapsed ? "\u{25B2} Tiles" : "\u{25BC} Tiles";
  });

  function updateActive() {
    buttons.forEach((btn, i) => {
      btn.classList.toggle("active", TILE_KINDS[i].id === state.selectedKind);
    });
  }

  updateActive();
}
