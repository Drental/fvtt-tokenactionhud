import { RollHandler } from "../rollHandler.js";

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
    let payload = encodedValue.split("|");

    if (payload.length != 3 && payload.length != 4) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let actorID = payload[1];
    let actionId = payload[2];
    let option = JSON.parse(payload[3]);

    let hasSheet = ["item"];
    if (this.isRenderItem() && hasSheet.includes(macroType))
      return this.doRenderItem(actorID, actionId);

    switch (macroType) {
      case "hase":
        this._rollHaseMacro(actorID, actionId);
        break;
      case "stat":
        if (actionId == "TechAttack") {
          this._rollTechMacro(actorID);
        } else if (actionId == "BasicAttack") {
          this._rollBasicAttackMacro();
        } else {
          this._rollStatMacro(actorID, actionId);
        }
        break;
      case "frame":
        if (actionId == "Stabilize") {
          this._promptStabilizeMacro(actorID);
        } else {
          this._rollOverchargeMacro(actorID);
        }

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

  _rollTechMacro(actorID) {
    game.lancer.prepareTechMacro(actorID, null);
  }

  _rollBasicAttackMacro() {
    game.lancer.prepareEncodedAttackMacro();
  }

  _promptStabilizeMacro(actorID) {
    game.lancer.stabilizeMacro(actorID);
  }

  _rollOverchargeMacro(actorID) {
    game.lancer.prepareOverchargeMacro(actorID);
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
