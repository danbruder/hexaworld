import { state, completeLevel } from "../state";
import { coordKey } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";
import { showOverlay } from "../ui/overlay";
import { updateHpBar } from "../ui/hpBar";

export function onTileArrival(q: number, r: number): void {
  const key = coordKey(q, r);
  const tile = state.tiles.get(key);
  if (!tile) return;

  // Flag → level complete
  if (tile.kind === "flag") {
    completeLevel(state.currentLevel);
    return;
  }

  // Skull or instantKill → death
  if (tile.kind === "skull" || tile.effects?.instantKill) {
    triggerDeath();
    return;
  }

  // Damage
  if (tile.effects?.damage && state.currentHp !== null) {
    state.currentHp = Math.max(0, state.currentHp - tile.effects.damage);
    updateHpBar();
    if (state.currentHp <= 0) {
      triggerDeath();
    }
  }
}

export function triggerDeath(): void {
  showOverlay({
    className: "overlay-death",
    title: "You Died!",
    topDecor: "&#128128;",
    bottomDecor: "&#128128; &#128128; &#128128;",
    duration: 2000,
  });
  // Respawn at origin
  state.characterPos = { q: 0, r: 0 };
  state.currentHp = state.startingHp;
  state.movementAnim = null;
  updateHpBar();
  renderAll();
}
