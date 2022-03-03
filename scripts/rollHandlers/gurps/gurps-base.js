import { RollHandler } from '../rollHandler.js';
import {Logger} from "../../logger.js";

export class RollHandlerBaseGURPS extends RollHandler {
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
        switch (macroType) {
            case 'attribute':
                 this.rollAttributeMacro(event, tokenId, actionId);
                break;
            case 'blindroll':
                this.rollAttributeMacro(event, tokenId, actionId);
                break;
        }
    }

    rollAttributeMacro(event, tokenId, actionId) {
     
      console.log(GURPS.objToString(event))
      console.log(tokenId)
      console.log(actionId) 
    }
}