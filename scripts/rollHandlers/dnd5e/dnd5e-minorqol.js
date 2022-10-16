import { RollHandlerBase5e } from "./dnd5e-base.js";

export class RollHandlerMinorQol5e extends RollHandlerBase5e {
  constructor() {
    super();
  }

  /** @override */
  rollItemMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(tokenId, actorId);
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

    MinorQOL.doCombinedRoll({ actor, item, event, versatile });
  }
}
