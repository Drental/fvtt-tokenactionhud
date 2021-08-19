import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseLancer extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');

        if (payload.length != 3 && payload.length != 4) {
            super.throwInvalidValueErr();
        }

        let macroType = payload[0];
        let actorID = payload[1];
        let actionId = payload[2];
        let option = JSON.parse(payload[3]);

        //let actor = super.getActor(actorId);
        //console.log(actor);

        let hasSheet = ['item']
        if (this.isRenderItem() && hasSheet.includes(macroType))
            return this.doRenderItem(tokenId, actionId);

        switch (macroType) {
            case "hase":
                this._rollHaseMacro(actorID, actionId);
                break;
            case "stat":
                this._rollStatMacro(actorID, actionId);
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
        game.lancer.prepareStatMacro(actorID, `data.${action}`);
    }

    _rollStatMacro(actorID, action) {
        game.lancer.prepareStatMacro(actorID, `data.${action}`);
    }

    _rollWeaponOrFeatureMacro(actorID, itemId, option) {
        game.lancer.prepareItemMacro(actorID, itemId, option);
    }

    _rollCoreBonusMacro(pilotID, itemID){
      game.lancer.prepareItemMacro(pilotID, itemID);
    }

    _rollCoreActiveMacro(actorID) {
        game.lancer.prepareCoreActiveMacro(actorID);
    }

    _rollCorePassiveMacro(actorID) {
        game.lancer.prepareCorePassiveMacro(actorID);
    }

    _rollActivationMacro(actorID, itemId, option){
      game.lancer.prepareActivationMacro(actorID, itemId, option.Type, option.Index);
    }
}
