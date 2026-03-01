import { Graphics } from "pixi.js";
import { hexToPixel } from "../hex/hexUtils";
import { CHARACTER_COLOR } from "../constants";

export function drawCharacter(g: Graphics, q: number, r: number): void {
  const center = hexToPixel(q, r);

  // Simple circle marker
  g.circle(center.x, center.y, 10);
  g.fill({ color: CHARACTER_COLOR });
  g.stroke({ color: 0x000000, width: 2 });

  // Small inner dot
  g.circle(center.x, center.y, 4);
  g.fill({ color: 0x333333 });
}
