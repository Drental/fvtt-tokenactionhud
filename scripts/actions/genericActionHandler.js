import * as settings from "../settings.js";

export class GenericActionHandler {
  baseHandler;

  constructor(baseHandler) {
    this.baseHandler = baseHandler;
  }

  buildGenericActions(actionList, character) {
    this._addConditions(actionList, character);
    this._addUtilities(actionList, character);
  }

  /** @private */
  _addConditions(actionList, character) {}

  /** @private */
  _addUtilities(actionList, character) {
    if (!character) {
      const tokens = canvas.tokens.controlled;
      this._addMultiUtilities(actionList, tokens);
    } else {
      this._getUtilityList(actionList, character);
    }
  }

  /** @private */
  _getUtilityList(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    if (!tokenId) return;
    let macroType = "utility";

    let actions = [];
    // Toggle Combat
    const inCombat = canvas.tokens.placeables.find(token => token.id === tokenId).inCombat
    const name = (inCombat) 
      ? this.baseHandler.i18n("tokenActionHud.removeFromCombat")
      : this.baseHandler.i18n("tokenActionHud.addToCombat");
    let combatStateValue = [macroType, actorId, tokenId, "toggleCombat"].join(
      this.baseHandler.delimiter
    );
    let combatAction = {
      id: "toggleCombat",
      encodedValue: combatStateValue,
      name: name,
    };
    actions.push(combatAction);

    // Toggle Visibility
    if (game.user.isGM) {
      const hidden = canvas.tokens.placeables.find(token => token.id === tokenId).document.hidden
      const name = (hidden)
        ? this.baseHandler.i18n("tokenActionHud.makeVisible")
        : this.baseHandler.i18n("tokenActionHud.makeInvisible");
      let visbilityValue = [macroType, actorId, tokenId, "toggleVisibility"].join(
        this.baseHandler.delimiter
      );
      let visibilityAction = {
        id: "toggleVisibility",
        encodedValue: visbilityValue,
        name: name,
      };
      actions.push(visibilityAction);
    }

    this.baseHandler.addActionsToActionList(actionList, actions, "token");
  }

  /** @private */
  _addMultiUtilities(utilityCategory, tokens) {
    const macroType = "utility";
    const actorId = "multi";
    const tokenId = "multi";

    // Token Subcategory
    let tokenSubcategory = this.baseHandler.initializeEmptySubcategory();

    // Toggle Combat
    const inCombat = tokens.every(token => token.inCombat);
    const name = (inCombat) 
      ? this.baseHandler.i18n("tokenActionHud.removeFromCombat")
      : this.baseHandler.i18n("tokenActionHud.addToCombat");
    let combatStateValue = [macroType, actorId, tokenId, "toggleCombat"].join(
      this.baseHandler.delimiter
    );
    let combatAction = {
      id: "toggleCombat",
      encodedValue: combatStateValue,
      name: name,
    };
    tokenSubcategory.actions.push(combatAction);

    // Toggle Visibility
    if (game.user.isGM) {
      const hidden = tokens.every(token => !token.document.hidden);
      const name = (hidden)
      ? this.baseHandler.i18n("tokenActionHud.makeVisible")
      : this.baseHandler.i18n("tokenActionHud.makeInvisible");
      let visbilityValue = [macroType, actorId, tokenId, "toggleVisibility"].join(
        this.baseHandler.delimiter
      );
      let visibilityAction = {
        id: "toggleVisibility",
        encodedValue: visbilityValue,
        name: name,
      };
      tokenSubcategory.actions.push(visibilityAction);
    }

    const tokenTitle = this.baseHandler.i18n("tokenActionHud.token")
    this.baseHandler._combineSubcategoryWithCategory(utilityCategory, tokenTitle, tokenSubcategory);
  }
}
