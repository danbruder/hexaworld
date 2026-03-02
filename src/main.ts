import { Application, Container } from "pixi.js";
import { BACKGROUND_COLOR, COLORS } from "./constants";
import { state, loadState, loadPrefs, migrateOldSave, getWorldName, setWorldName } from "./state";
import { coordKey } from "./hex/hexUtils";
import { initRenderer, renderAll, updateCharacterBob, updateMovement } from "./render/renderer";
import { setupInput } from "./input/inputHandler";
import { updateCamera, onResize } from "./input/walkInput";
import { setupToolbar } from "./ui/toolbar";
import { setupKindPicker } from "./ui/kindPicker";
import { setupLevelSelector } from "./ui/levelSelector";
import { setupHpBar } from "./ui/hpBar";

async function main() {
  const app = new Application();
  await app.init({
    background: BACKGROUND_COLOR,
    resizeTo: window,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const container = document.getElementById("game-container")!;
  container.appendChild(app.canvas);

  // World container — all game graphics live here; we pan/zoom this
  const world = new Container();
  app.stage.addChild(world);

  // Center the world initially
  world.x = app.screen.width / 2;
  world.y = app.screen.height / 2;

  // Init render layers (order matters for z-indexing)
  const layers = initRenderer();
  world.addChild(layers.bridges);
  world.addChild(layers.ghosts);
  world.addChild(layers.tiles);
  world.addChild(layers.kinds);
  world.addChild(layers.highlight);
  world.addChild(layers.character);

  // Migrate old single-save format, then load preferences and level
  migrateOldSave();
  loadPrefs();
  loadState();
  if (state.tiles.size === 0) {
    state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "color" });
  }

  // Initial render
  renderAll();

  // Setup input handlers
  setupInput(world, app.canvas as HTMLCanvasElement);

  // Setup world title
  setupWorldTitle();

  // Setup UI
  setupToolbar();
  setupLevelSelector();
  setupKindPicker();
  setupHpBar();

  // Game loop — camera follow + movement animation
  app.ticker.add(() => {
    const dt = app.ticker.deltaMS / 1000;
    updateMovement(dt);
    updateCamera();
    updateCharacterBob();
  });

  // Handle resize
  window.addEventListener("resize", () => {
    onResize(app.screen.width, app.screen.height);
  });
  onResize(app.screen.width, app.screen.height);
}

function setupWorldTitle(): void {
  const el = document.getElementById("world-title")!;
  el.textContent = getWorldName();

  el.addEventListener("dblclick", () => {
    const input = document.createElement("input");
    input.className = "world-title-input";
    input.value = getWorldName();
    el.textContent = "";
    el.appendChild(input);
    input.focus();
    input.select();

    function commit() {
      const trimmed = input.value.trim();
      if (trimmed) {
        setWorldName(trimmed);
      }
      el.textContent = getWorldName();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        input.removeEventListener("blur", commit);
        el.textContent = getWorldName();
      }
    });
  });
}

main();
