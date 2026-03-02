import { Graphics } from "pixi.js";
import { getHexCorners } from "../hex/hexUtils";
import { GHOST_COLOR } from "../constants";

export function drawGhost(g: Graphics, q: number, r: number, alpha: number): void {
  const corners = getHexCorners(q, r);

  // Subtle solid outline
  g.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) {
    g.lineTo(corners[i].x, corners[i].y);
  }
  g.closePath();
  g.stroke({ color: GHOST_COLOR, width: 1, alpha });
}
