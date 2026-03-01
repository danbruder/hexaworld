import { Graphics } from "pixi.js";
import { getHexCorners, hexToPixel } from "../hex/hexUtils";
import { GHOST_COLOR } from "../constants";

export function drawGhost(g: Graphics, q: number, r: number): void {
  const corners = getHexCorners(q, r);

  // Dashed outline — draw each edge as a dashed line
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    drawDashedLine(g, a.x, a.y, b.x, b.y, 6, 4);
  }

  // Draw "+" at center
  const center = hexToPixel(q, r);
  const s = 8;
  g.moveTo(center.x - s, center.y);
  g.lineTo(center.x + s, center.y);
  g.moveTo(center.x, center.y - s);
  g.lineTo(center.x, center.y + s);
  g.stroke({ color: GHOST_COLOR, width: 2 });
}

function drawDashedLine(
  g: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashLen: number,
  gapLen: number
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  let pos = 0;
  let drawing = true;

  while (pos < dist) {
    const segLen = drawing ? dashLen : gapLen;
    const end = Math.min(pos + segLen, dist);
    if (drawing) {
      g.moveTo(x1 + ux * pos, y1 + uy * pos);
      g.lineTo(x1 + ux * end, y1 + uy * end);
      g.stroke({ color: GHOST_COLOR, width: 1.5 });
    }
    pos = end;
    drawing = !drawing;
  }
}
