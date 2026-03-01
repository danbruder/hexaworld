import { state } from "../state";
import { TILE_KINDS } from "../constants";
import { TileKind } from "../types";

export function setupKindPicker(): void {
  const container = document.getElementById("kind-picker")!;

  const buttons: HTMLButtonElement[] = [];

  for (const kind of TILE_KINDS) {
    const btn = document.createElement("button");
    btn.textContent = kind.icon ? `${kind.icon} ${kind.label}` : kind.label;
    btn.className = "kind-btn";
    btn.addEventListener("click", () => {
      state.selectedKind = kind.id;
      updateActive();
    });
    buttons.push(btn);
    container.appendChild(btn);
  }

  function updateActive() {
    buttons.forEach((btn, i) => {
      btn.classList.toggle("active", TILE_KINDS[i].id === state.selectedKind);
    });
  }

  updateActive();
}
