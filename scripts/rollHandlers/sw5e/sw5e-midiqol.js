import { RollHandlerBaseSW5e } from "./sw5e-base.js";

export class RollHandlerMidiQolSW5e extends RollHandlerBaseSW5e {
  constructor() {
    super();
  }

  /** @override */
  rollItemMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(actorId, tokenId);
    let item = actor.items.get(itemId);

    if (this.needsRecharge(item)) {
      item.rollRecharge();
      return;
    }

    if (this.rightClick && this.ctrl) {
      item.rollAttack();
      return;
    }
    if (this.rightClick && this.alt) {
      item.rollDamage();
      return;
    }

    var versatile;
    if (item.system.properties?.ver) {
      versatile = this.rightClick;
    }

    MidiQOL.doCombinedRoll({ actor, item, event, versatile });
  }
}
