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
      let actor = super.getActor(tokenId);

      if (tokenId === 'multi') {
          for (let t of canvas.tokens.controlled) {
              actor = super.getActor(t.id);
              await this._handleMacros(event, macroType, actor, actionId);
          }
      } else {
          await this._handleMacros(event, macroType, actor, actionId);
      }
  }

  async _handleMacros(event, macroType, actor, actionId) {
      switch (macroType) {
          case 'otf':
              this.executeOTF(event, actor, actionId)
              break
      }
  }

  async executeOTF(event, actor, otf) {
    let saved = GURPS.LastActor
    GURPS.SetLastActor(actor)
    GURPS.executeOTF(otf).then(e => GURPS.SetLastActor(saved))
  }
}