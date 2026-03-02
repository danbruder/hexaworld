import { state } from "../state";

let barContainer: HTMLDivElement | null = null;
let barFill: HTMLDivElement | null = null;
let barLabel: HTMLSpanElement | null = null;

export function setupHpBar(): void {
  barContainer = document.createElement("div");
  barContainer.id = "hp-bar";
  barContainer.style.display = "none";

  barFill = document.createElement("div");
  barFill.className = "hp-bar-fill";

  barLabel = document.createElement("span");
  barLabel.className = "hp-bar-label";

  barContainer.appendChild(barFill);
  barContainer.appendChild(barLabel);
  document.body.appendChild(barContainer);
}

export function updateHpBar(): void {
  if (!barContainer || !barFill || !barLabel) return;

  if (state.currentHp === null || state.mode !== "walk") {
    barContainer.style.display = "none";
    return;
  }

  barContainer.style.display = "flex";
  const pct = Math.max(0, Math.min(100, (state.currentHp / state.startingHp) * 100));
  barFill.style.width = `${pct}%`;

  // Color based on health
  if (pct > 50) barFill.style.background = "#4a9e4a";
  else if (pct > 25) barFill.style.background = "#c9a030";
  else barFill.style.background = "#d4534a";

  // Pulse animation at low HP
  barContainer.classList.toggle("hp-low", pct <= 25 && pct > 0);

  barLabel.textContent = `\u2764\uFE0F ${Math.ceil(state.currentHp)} / ${state.startingHp}`;
}
