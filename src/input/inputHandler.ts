import { Container } from "pixi.js";
import { setupPanZoom } from "./panZoom";
import { setupBuildInput } from "./buildInput";
import { setupBridgeInput } from "./bridgeInput";
import { setupWalkInput } from "./walkInput";

export function setupInput(
  worldContainer: Container,
  canvas: HTMLCanvasElement
): void {
  setupPanZoom(worldContainer, canvas);
  setupBuildInput(worldContainer, canvas);
  setupBridgeInput(worldContainer, canvas);
  setupWalkInput(worldContainer, canvas);
}
