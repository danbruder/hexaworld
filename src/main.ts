import { Application, Container } from "pixi.js";
import { BACKGROUND_COLOR, COLORS } from "./constants";
import { state, loadState, loadPrefs } from "./state";
import { coordKey } from "./hex/hexUtils";
import { initRenderer, renderAll } from "./render/renderer";
import { setupInput } from "./input/inputHandler";
import { updateCamera, onResize } from "./input/walkInput";
import { setupToolbar } from "./ui/toolbar";
import { setupColorPicker } from "./ui/colorPicker";
import { setupKindPicker } from "./ui/kindPicker";

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

  // Load saved state and preferences
  loadState();
  loadPrefs();
  if (state.tiles.size === 0) {
    state.tiles.set(coordKey(0, 0), { q: 0, r: 0, color: COLORS[0], kind: "plain" });
  }

  // Initial render
  renderAll();

  // Setup input handlers
  setupInput(world, app.canvas as HTMLCanvasElement);

  // Setup UI
  setupToolbar();
  setupColorPicker();
  setupKindPicker();

  // Game loop — just for camera follow in walk mode
  app.ticker.add(() => {
    updateCamera();
  });

  // Handle resize
  window.addEventListener("resize", () => {
    onResize(app.screen.width, app.screen.height);
  });
  onResize(app.screen.width, app.screen.height);
}

main();
