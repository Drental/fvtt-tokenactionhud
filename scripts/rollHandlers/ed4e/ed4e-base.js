import { RollHandler } from '../rollHandler.js';
import {Logger} from "../../logger.js";

export class RollHandlerBaseED4e extends RollHandler {



    constructor() {
        super();
    }


    async doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');

        if (payload.length !== 3) {
            super.throwInvalidValueErr();
        }

        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        if (tokenId === 'multi') {
            for (let t of canvas.tokens.controlled) {
                let idToken = t.id;
                await this._handleMacros(event, macroType, idToken, actionId);
            }
        } else {
            await this._handleMacros(event, macroType, tokenId, actionId);
        }
    }

    async _handleMacros(event, macroType, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        switch (macroType) {
            case 'skill':
                // fall through
            case 'talent':
                this.rollTalentMacro(event, tokenId, actionId);
                break;
            case 'attack':
                // fall through
            case 'power':
                // fall through
            case 'maneuver':
                this.handleCreatureActionMacro(event, tokenId, actionId);
                break;
            case 'inventory':
                this.rollInventoryMacro(event, tokenId, actionId);
                break;
            case 'toggle':
                this.toggleDataProperty(event, tokenId, actionId);
                break;
            case 'attribute':
                this.rollAttributeMacro(event, tokenId, actionId);
                break;
            case 'recovery':
                actor.recoveryTest();
                break;
            case 'newday':
                actor.newDay();
                break;
            case 'halfmagic':
                actor.halfMagic();
                break;
            case 'matrixAttune':
                actor.attuneMatrix(actor.items.get(actionId));
                break;
            case 'matrixWeave':
                actor.weaveThread(actor.items.get(actionId));
                break;
            case 'matrixCast':
                actor.castSpell(actor.items.get(actionId));
                break;
            case 'matrixClear':
                actor.clearMatrix(actor.items.get(actionId));
                break;
        }
    }

    rollAttributeMacro(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);
        actor.rollPrep({ attribute: `${actionId.split('.').slice(-1)}Step`, name: actionId });
    }

    rollTalentMacro(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);
        actor.rollPrep({ talentID: actionId});
    }

    rollInventoryMacro(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);
        const item = actor.items.get(actionId);
        if (item.type === 'weapon') {
            actor.rollPrep({weaponID: actionId, rolltype: 'attack'});
        } else if (item.type === 'equipment') {
            ui.notifications.info("This is not clickable, sorry")
        } else {
            //problem
            Logger.error(item.type, " is not a valid actionId for rolling an inventory item")
        }
    }

    toggleDataProperty(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);
        if (actionId.includes("tactics")) {
            const tactic = actionId.split('.')[1];
            actor.update({
                data: {
                    "tactics": {
                        [tactic]: !actor.data.data.tactics[tactic]
                    }
                }
            })
        } else {
            const currentValue = actor.data.data[actionId];
            const valueType = typeof currentValue;
            let newValue = valueType === "string" ? this._toggleBooleanString(currentValue) : !currentValue;
            actor.update({
                data: {
                    [actionId]: newValue
                }
            })
        }
    }

    _toggleBooleanString(val) {
        if (val.toLowerCase().includes("true")) return "false";
        if (val.toLowerCase().includes("false")) return "true";
        return "false";
    }

    handleCreatureActionMacro(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);
        const item = actor.items.get(actionId);

        if (item.data.data.attackstep !== 0) {
            const modifier = 0;
            const strain = item.data.data.strain ? item.data.data.strain : 0;
            const karma = 0;

            let type = (item.data.data.powerType === "Attack") ? "attack" : (item.data.data.attackstep > 0) ? "test" : "";
            const parameters = {
                itemID: actionId,
                steps: item.data.data.attackstep,
                talent: item.name,
                strain: strain,
                type: type,
                karma: karma,
                modifier: modifier,
            };
            actor.NPCtest(parameters);
        } else {
            actor.items.get(actionId).sheet.render(true);
        }
    }
}