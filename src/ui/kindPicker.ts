import { state, savePrefs } from "../state";
import { TILE_KINDS, COLORS, COLOR_NAMES } from "../constants";

function colorToCSS(color: number | null): string {
  if (color === null) return "rgba(255,255,255,0.1)";
  return `#${color.toString(16).padStart(6, "0")}`;
}

export function setupKindPicker(): void {
  const container = document.getElementById("kind-picker")!;

  // Scrollable grid
  const list = document.createElement("div");
  list.className = "kind-list";
  container.appendChild(list);

  // Toggle button at bottom
  const toggle = document.createElement("button");
  toggle.className = "kind-toggle";
  toggle.textContent = "\u25BC Tiles";
  container.appendChild(toggle);

  const buttons: HTMLButtonElement[] = [];
  let colorSubMenu: HTMLDivElement | null = null;

  for (const kind of TILE_KINDS) {
    const btn = document.createElement("button");
    btn.className = "kind-btn";
    btn.title = kind.label;

    if (kind.id === "color") {
      // Color tile: show a colored square swatch instead of emoji
      btn.innerHTML = `<span class="kind-icon color-swatch" style="background:${colorToCSS(state.selectedColor)}"></span><span class="kind-label">${kind.label}</span>`;
    } else {
      btn.style.backgroundColor = colorToCSS(kind.color);
      btn.innerHTML = `<span class="kind-icon">${kind.icon || "\u2B1C"}</span><span class="kind-label">${kind.label}</span>`;
    }

    btn.addEventListener("click", () => {
      state.selectedKind = kind.id;
      savePrefs();
      updateActive();
      renderColorSubMenu();
    });
    buttons.push(btn);
    list.appendChild(btn);

    // Insert color sub-menu container right after the color button
    if (kind.id === "color") {
      colorSubMenu = document.createElement("div");
      colorSubMenu.className = "color-sub-menu";
      list.appendChild(colorSubMenu);
    }
  }

  function renderColorSubMenu() {
    if (!colorSubMenu) return;
    colorSubMenu.innerHTML = "";

    if (state.selectedKind !== "color") {
      colorSubMenu.style.display = "none";
      return;
    }

    colorSubMenu.style.display = "grid";

    for (let i = 0; i < COLORS.length; i++) {
      const swatch = document.createElement("button");
      swatch.className = "color-swatch-btn";
      if (COLORS[i] === state.selectedColor) swatch.classList.add("active");
      swatch.style.backgroundColor = colorToCSS(COLORS[i]);
      swatch.title = COLOR_NAMES[i];

      swatch.addEventListener("click", (e) => {
        e.stopPropagation();
        state.selectedColor = COLORS[i];
        savePrefs();
        renderColorSubMenu();
        updateColorButton();
      });
      colorSubMenu.appendChild(swatch);
    }
  }

  function updateColorButton() {
    // Update the color tile button's swatch to reflect selected color
    const colorBtn = buttons[0]; // Color is first entry
    const swatch = colorBtn.querySelector(".color-swatch") as HTMLElement;
    if (swatch) {
      swatch.style.background = colorToCSS(state.selectedColor);
    }
  }

  let collapsed = false;
  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    container.classList.toggle("collapsed", collapsed);
    toggle.textContent = collapsed ? "\u25B2 Tiles" : "\u25BC Tiles";
  });

  function updateActive() {
    buttons.forEach((btn, i) => {
      btn.classList.toggle("active", TILE_KINDS[i].id === state.selectedKind);
    });
  }

  updateActive();
  renderColorSubMenu();
}
