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
    if (actor) charType = actor.data.type;
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
      let rData = [];
      switch (macroType) {
        case 'attribute':
          rData = { roll: actor.system.attribute[actionId].value, label: actor.system.attribute[actionId].label };
          if (event.type === 'click') {
            actor.sheet.rollAttribute(game.i18n.localize(rData.label).toLowerCase());
          }
          break;
        case 'skill':
          rData = { roll: actor.system.skill[actionId].mod, label: actor.system.skill[actionId].label };
          if (event.type === 'click') {
            actor.sheet.rollSkill(game.i18n.localize(rData.label).toLowerCase());
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

        case 'utility':
          this.performUtilityMacro(event, tokenId, actionId);
        default:
          break;
      }
    }
  }

  /** @private */
  async _handleUniqueActionsChar(macroType, event, tokenId, actor, actionId) {
    let rData = 0;
    switch (macroType) {
      case 'stress':
        await this._adjustAttribute(event, actor, 'stress', 'value', actionId);
        break;
      case 'rollStress':
        if (actor.data.type === 'character') {
          rData = { panicroll: actor.system.header.stress };
        } else {
          rData = { panicroll: { value: 0, label: 'Stress' } };
        }
        if (event.type === 'click') {
          actor.rollAbility(actor, rData);
        } else {
          actor.rollAbilityMod(actor, rData);
        }
        break;
      case 'health':
        await this._adjustAttribute(event, actor, 'health', 'value', actionId);
        break;
      case 'creatureAttack':
        let rAttData = { atttype: actor.system.rTables };
        actor.creatureAttackRoll(actor, rAttData);
        break;
      case 'acidSplash':
        let aSplashData = { roll: actor.system.general.acidSplash.value, label: actor.system.general.acidSplash.label };
        actor.creatureAcidRoll(actor, aSplashData);
        break;
      case 'rollCrit':
        actor.rollCrit(actor.data.type);
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

  async togggleConditionState(event, actor, property, valueName, actionId) {
    let value = actor.system.general[property][valueName];
    let max = '1';

    if (this.rightClick) {
      if (value <= 0) return;
      value--;
      if (property === 'panic') {
        actor.checkAndEndPanic(actor);
      }
    } else {
      if (value >= max) return;
      value++;
      if (property === 'panic') {
        actor.checkAndEndPanic(actor);
      }
    }

    let update = { data: { general: { [property]: { [valueName]: value } } } };
    await actor.update(update);
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
      const allVisible = canvas.tokens.controlled.every((t) => !t.data.hidden);
      canvas.tokens.controlled.forEach((t) => {
        if (allVisible) t.toggleVisibility();
        else if (t.data.hidden) t.toggleVisibility();
      });
    }

    if (actionId === 'toggleCombat') {
      const allInCombat = canvas.tokens.controlled.every((t) => t.data.inCombat);
      for (let t of canvas.tokens.controlled) {
        if (allInCombat) await t.toggleCombat();
        else if (!t.data.inCombat) await t.toggleCombat();
      }
      Hooks.callAll('forceUpdateTokenActionHUD');
    }
  }

  performConditionMacro(event, tokenId, actionId) {
    let actor = super.getActor(tokenId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case 'toggleStarving':
        this.togggleConditionState(event, actor, 'starving', 'value');
        break;
      case 'toggleDehydrated':
        this.togggleConditionState(event, actor, 'dehydrated', 'value');
        break;
      case 'toggleExhausted':
        this.togggleConditionState(event, actor, 'exhausted', 'value');
        break;
      case 'toggleFreezing':
        this.togggleConditionState(event, actor, 'freezing', 'value');
        break;
      case 'togglePanic':
        this.togggleConditionState(event, actor, 'panic', 'value');
        break;
    }
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
