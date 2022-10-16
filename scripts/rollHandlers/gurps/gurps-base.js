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

      let actionType = payload[0];
      let actorId = payload[1];
    let tokenId = payload[2];
      let actionId = payload[2];
      let actor = super.getActor(tokenId, actorId);

      if (tokenId === 'multi') {
          for (let t of canvas.tokens.controlled) {
              actor = super.getActor(t.id);
              await this._handleMacros(event, actionType, actor, actionId);
          }
      } else {
          await this._handleMacros(event, actionType, actor, actionId);
      }
  }

  async _handleMacros(event, actionType, actor, actionId) {
      switch (actionType) {
          case 'otf':
              this.executeOTF(event, actor, actionId)
              break
          case 'dam':
              this.executeOTF(event, actor, actionId, true)
              break
      }
  }

  async executeOTF(event, actor, otf, rightClickDmg = false) {
    if (rightClickDmg && this.isRightClick(event)) {
      let action = GURPS.parselink(otf)
      action.action.calcOnly = true
      let formula = await GURPS.performAction(action.action, actor)
      let ev = {... event}
      ev.preventDefault = () => {}
      ev.currentTarget = {... ev.currentTarget}
      ev.currentTarget.innerText = formula
      GURPS.resolveDamageRoll(ev, actor, formula, '', game.user.isGM, true)
    } else {
      let saved = GURPS.LastActor
      GURPS.SetLastActor(actor)
      GURPS.executeOTF(otf).then(e => GURPS.SetLastActor(saved))
    }
  }
}