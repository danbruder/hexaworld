import { state, savePrefs } from "../state";
import { COLORS } from "../constants";

export function setupColorPicker(): void {
  const container = document.getElementById("color-picker")!;

  const swatches: HTMLDivElement[] = [];

  for (const color of COLORS) {
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.backgroundColor = `#${color.toString(16).padStart(6, "0")}`;

    swatch.addEventListener("click", () => {
      state.selectedColor = color;
      savePrefs();
      updateActive();
    });

    swatches.push(swatch);
    container.appendChild(swatch);
  }

  function updateActive() {
    swatches.forEach((s, i) => {
      s.classList.toggle("active", COLORS[i] === state.selectedColor);
    });
  }

  updateActive();
}
