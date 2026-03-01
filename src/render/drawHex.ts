import { Graphics } from "pixi.js";
import { getHexCorners } from "../hex/hexUtils";

export function drawHex(g: Graphics, q: number, r: number, color: number): void {
  const corners = getHexCorners(q, r);
  g.poly(corners.map((c) => [c.x, c.y]).flat());
  g.fill({ color });
  g.stroke({ color: 0x000000, width: 2 });
}
