import { Graphics } from "pixi.js";
import { hexToPixel } from "../hex/hexUtils";
import { BRIDGE_COLOR } from "../constants";

export function drawBridge(
  g: Graphics,
  fromQ: number,
  fromR: number,
  toQ: number,
  toR: number
): void {
  const from = hexToPixel(fromQ, fromR);
  const to = hexToPixel(toQ, toR);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;

  // Perpendicular
  const px = -uy;
  const py = ux;
  const halfWidth = 6;

  // Two parallel rails
  g.moveTo(from.x + px * halfWidth, from.y + py * halfWidth);
  g.lineTo(to.x + px * halfWidth, to.y + py * halfWidth);
  g.stroke({ color: BRIDGE_COLOR, width: 3 });

  g.moveTo(from.x - px * halfWidth, from.y - py * halfWidth);
  g.lineTo(to.x - px * halfWidth, to.y - py * halfWidth);
  g.stroke({ color: BRIDGE_COLOR, width: 3 });

  // Rungs
  const rungCount = Math.max(2, Math.floor(dist / 16));
  for (let i = 0; i <= rungCount; i++) {
    const t = i / rungCount;
    const cx = from.x + dx * t;
    const cy = from.y + dy * t;
    g.moveTo(cx + px * halfWidth, cy + py * halfWidth);
    g.lineTo(cx - px * halfWidth, cy - py * halfWidth);
    g.stroke({ color: BRIDGE_COLOR, width: 2 });
  }
}
