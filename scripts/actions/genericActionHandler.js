import * as settings from "../settings.js";

export class GenericActionHandler {
  baseHandler;

  constructor(baseHandler) {
    this.baseHandler = baseHandler;
  }

  addGenericCategories(token, actionList, isMultipleTokens) {
    this._addConditions(token, actionList, isMultipleTokens);
    this._addUtilities(token, actionList, isMultipleTokens);
  }

  /** @private */
  _addConditions(token, actionList, isMultipleTokens) {}

  /** @private */
  _addUtilities(token, actionList, isMultipleTokens) {
    if (settings.get("showUtilityCategory") === false) return;
    
    let utilityCategory = actionList.categories.find((c) => c.id === "utility");
    if (!utilityCategory) {
      utilityCategory = this.baseHandler.initializeEmptyCategory("utility");
      utilityCategory.name = this.baseHandler.i18n("tokenActionHud.utility");
      actionList.categories.push(utilityCategory);
    }

    if (isMultipleTokens) {
      const tokens = canvas.tokens.controlled;
      this._addMultiUtilities(utilityCategory, tokens);
    } else {
      this._getUtilityList(utilityCategory, token.id);
    }
  }

  /** @private */
  _getUtilityList(utilityCategory, tokenId) {
    let macroType = "utility";

    // Token Subcategory
    let tokenSubcategory = this.baseHandler.initializeEmptySubcategory();

    // Toggle Combat
    const inCombat = canvas.tokens.placeables.find((t) => t.id === tokenId).inCombat
    const name = (inCombat) 
      ? this.baseHandler.i18n("tokenActionHud.removeFromCombat")
      : this.baseHandler.i18n("tokenActionHud.addToCombat");
    let combatStateValue = [macroType, tokenId, "toggleCombat"].join(
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
      const hidden = canvas.tokens.placeables.find((t) => t.id === tokenId).document.hidden
      const name = (hidden)
        ? this.baseHandler.i18n("tokenActionHud.makeVisible")
        : this.baseHandler.i18n("tokenActionHud.makeInvisible");
      let visbilityValue = [macroType, tokenId, "toggleVisibility"].join(
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

  /** @private */
  _addMultiUtilities(utilityCategory, tokens) {
    let macroType = "utility";
    let tokenId = "multi";

    // Token Subcategory
    let tokenSubcategory = this.baseHandler.initializeEmptySubcategory();

    // Toggle Combat
    const inCombat = tokens.every((t) => t.inCombat);
    const name = (inCombat) 
      ? this.baseHandler.i18n("tokenActionHud.removeFromCombat")
      : this.baseHandler.i18n("tokenActionHud.addToCombat");
    let combatStateValue = [macroType, tokenId, "toggleCombat"].join(
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
      const hidden = tokens.every((t) => !t.document.hidden);
      const name = (hidden)
      ? this.baseHandler.i18n("tokenActionHud.makeVisible")
      : this.baseHandler.i18n("tokenActionHud.makeInvisible");
      let visbilityValue = [macroType, tokenId, "toggleVisibility"].join(
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
