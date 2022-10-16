import { RollHandlerBaseSW5e } from "./sw5e-base.js";

export class RollHandlerObsidianSW5e extends RollHandlerBaseSW5e {
  constructor() {
    super();
  }

  /** @override */
  rollAbilityCheckMacro(event, actorId, tokenId, checkId) {
    let actor = super.getActor(tokenId, actorId);
    OBSIDIAN.Items.roll(actor, { roll: "abl", abl: checkId });
  }

  /** @override */
  rollAbilitySaveMacro(event, actorId, tokenId, checkId) {
    let actor = super.getActor(tokenId, actorId);
    OBSIDIAN.Items.roll(actor, { roll: "save", save: checkId });
  }

  /** @override */
  rollSkillMacro(event, actorId, tokenId, checkId) {
    let actor = super.getActor(tokenId, actorId);
    OBSIDIAN.Items.roll(actor, { roll: "skl", skl: checkId });
  }

  /** @override */
  rollItemMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(tokenId, actorId);
    OBSIDIAN.Items.roll(actor, { roll: "item", id: itemId });
  }
}
