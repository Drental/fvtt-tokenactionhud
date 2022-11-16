import { RollHandler } from "../../core/rollHandler/rollHandler.js";

export class RollHandlerBaseLancer extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  getActor(actorId) {
    return game.actors.get(actorId);
  }

  /** @override */
  doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");

    if (payload.length !== 4 && payload.length !== 4) {
      super.throwInvalidValueErr();
    }

    let actionType = payload[0];
    let actorID = payload[1];
    let actionId = payload[3];
    let option = JSON.parse(payload[3]);

    let hasSheet = ["item"];
    if (this.isRenderItem() && hasSheet.includes(actionType))
      return this.doRenderItem(actorID, actionId);

    switch (actionType) {
      case "hase":
        this._rollHaseMacro(actorID, actionId);
        break;
      case "stat":
        if (actionId == "techattack") this._rollTechMacro(actorID, null);
        else this._rollStatMacro(actorID, actionId);
        break;
      case "item":
        this._rollWeaponOrFeatureMacro(actorID, actionId, option);
        break;
      case "coreBonus":
        this._rollCoreBonusMacro(option.pilot, actionId);
        break;
      case "coreActive":
        this._rollCoreActiveMacro(actorID);
        break;
      case "corePassive":
        this._rollCorePassiveMacro(actorID);
        break;
      case "activation":
        this._rollActivationMacro(actorID, actionId, option);
        break;
    }
  }

  _rollHaseMacro(actorID, action) {
    game.lancer.prepareStatMacro(actorID, `mm.${action}`);
  }

  _rollStatMacro(actorID, action) {
    game.lancer.prepareStatMacro(actorID, `mm.${action}`);
  }

  _rollTechMacro(actorID, action) {
    game.lancer.prepareTechMacro(actorID, null);
  }

  _rollWeaponOrFeatureMacro(actorID, itemId, option) {
    game.lancer.prepareItemMacro(actorID, itemId, option);
  }

  _rollCoreBonusMacro(pilotID, itemID) {
    game.lancer.prepareItemMacro(pilotID, itemID);
  }

  _rollCoreActiveMacro(actorID) {
    game.lancer.prepareCoreActiveMacro(actorID);
  }

  _rollCorePassiveMacro(actorID) {
    game.lancer.prepareCorePassiveMacro(actorID);
  }

  _rollActivationMacro(actorID, itemId, option) {
    game.lancer.prepareActivationMacro(
      actorID,
      itemId,
      option.Type,
      option.Index
    );
  }
}
