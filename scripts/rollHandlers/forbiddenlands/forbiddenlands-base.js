import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseForbiddenlands extends RollHandler {
  constructor() {
    super();
  }

  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split('|');
    if (payload.length != 4) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];
    let attributename = payload[3];
    let actor = super.getActor(tokenId);
    let charType;
    if (actor) charType = actor.type;
    let item = actionId ? actor.items.get(actionId) : null;

    let renderable = ['item', 'armor'];
    if (renderable.includes(macroType) && this.isRenderItem()) return this.doRenderItem(tokenId, actionId);

    if (tokenId === 'multi') {
      if (macroType === 'utility' && actionId.includes('toggle')) {
        this.performMultiToggleUtilityMacro(actionId);
      } else {
        canvas.tokens.controlled.forEach((t) => {
          let idToken = t.id;
          this._handleMacros(event, macroType, idToken, actionId, attributename);
        });
      }
    } else {
      let sharedActions = ['utility'];

      if (!sharedActions.includes(macroType)) {
        switch (charType) {
          case 'character':
          case 'monster':
            await this._handleUniqueActionsChar(macroType, event, tokenId, actor, actionId);
            break;
        }
      }
      switch (macroType) {
        case 'attribute':
          if (event.type === 'click') {
            actor.sheet.rollAttribute(actionId);
          }
          break;
        case 'skill':
          if (event.type === 'click') {
            actor.sheet.rollSkill(actionId);
          }
          break;
        case 'weapon':
          if (event.type === 'click') {
            actor.sheet.rollGear(actionId);
          }
          break;
        case 'item':
          actor.items.get(actionId).sendToChat()
          break;
        case 'armor':
          actor.sheet.rollSpecificArmor(actionId);
          break;
        case 'power':
          actor.sheet.rollSpell(actionId);
          break;
        case 'conditions':
          this.performConditionMacro(event, tokenId, actionId);
          break;
        case 'consumables':
          this.performConsumableMacro(tokenId, actionId);
          break;
        case 'utility':
          this.performUtilityMacro(event, tokenId, actionId);
        default:
          break;
      }
    }
  }

  /** @private */
  async _handleUniqueActionsChar(macroType, event, actor, actionId) {
    switch (macroType) {
      case 'stress':
        await this._adjustAttribute(event, actor, 'stress', 'value', actionId);
        break;
      case 'health':
        await this._adjustAttribute(event, actor, 'health', 'value', actionId);
        break;
      case 'monsterAttack':
        actor.sheet.rollSpecificAttack(actionId);
        break;
    }
  }

  async _adjustAttribute(event, actor, property, valueName, actionId) {
    let value = actor.system.header[property][valueName];
    let max = '10';

    if (this.rightClick) {
      if (value <= 0) return;
      value--;
    } else {
      if (value >= max) return;
      value++;
    }

    let update = { data: { header: { [property]: { [valueName]: value } } } };

    await actor.update(update);
  }

  async toggleConditionState(actor, property) {
    actor.toggleCondition(property);
  }

  performUtilityMacro(event, tokenId, actionId) {
    let actor = super.getActor(tokenId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case 'toggleVisibility':
        token.toggleVisibility();
        break;
      case 'toggleCombat':
        token.toggleCombat();
        Hooks.callAll('forceUpdateTokenActionHUD');
        break;
    }
  }

  async performMultiToggleUtilityMacro(actionId) {
    if (actionId === 'toggleVisibility') {
      const allVisible = canvas.tokens.controlled.every((t) => !t.document.hidden);
      canvas.tokens.controlled.forEach((t) => {
        if (allVisible) t.toggleVisibility();
        else if (t.document.hidden) t.toggleVisibility();
      });
    }

    if (actionId === 'toggleCombat') {
      const allInCombat = canvas.tokens.controlled.every((t) => t.inCombat);
      for (let t of canvas.tokens.controlled) {
        if (allInCombat) await t.toggleCombat();
        else if (!t.inCombat) await t.toggleCombat();
      }
      Hooks.callAll('forceUpdateTokenActionHUD');
    }
  }

  performConditionMacro(event, tokenId, actionId) {
    let actor = super.getActor(tokenId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case 'toggleHungry':
        this.toggleConditionState(actor, 'hungry');
        break;
      case 'toggleThirsty':
        this.toggleConditionState(actor, 'thirsty');
        break;
      case 'toggleCold':
        this.toggleConditionState(actor, 'cold');
        break;
      case 'toggleSleepy':
        this.toggleConditionState(actor, 'sleepy');
        break;
    }
  }

  performConsumableMacro(tokenId, actionId) {
    let actor = super.getActor(tokenId);
    if (!actor) return;
    actor.sheet.rollConsumable(actionId)
  }

  /** @private */
  _rollItem(actor, tokenId, actionId, macroType) {
    let item = actor.items.get(actionId);
    let renderable = ['item'];
    if (renderable.includes(macroType)) {
      return this.doRenderItem(tokenId, actionId);
    } else {
      console.warn('armor roll');
    }
  }
}
