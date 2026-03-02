import { state, completeLevel } from "../state";
import { coordKey } from "../hex/hexUtils";
import { renderAll } from "../render/renderer";
import { showOverlay } from "../ui/overlay";
import { updateHpBar } from "../ui/hpBar";
import { TILE_KINDS } from "../constants";

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

  // Determine damage: explicit effect overrides default, otherwise use kind default
  if (state.currentHp !== null) {
    const explicitDamage = tile.effects?.damage;
    let damage: number;
    if (explicitDamage !== undefined) {
      damage = explicitDamage;
    } else {
      const kindDef = TILE_KINDS.find((k) => k.id === tile.kind);
      damage = kindDef?.defaultDamage ?? 0;
    }

    if (damage !== 0) {
      // Positive = damage, negative = healing (capped at startingHp)
      state.currentHp = Math.max(0, Math.min(state.startingHp, state.currentHp - damage));
      updateHpBar();
      if (state.currentHp <= 0) {
        triggerDeath();
      }
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
