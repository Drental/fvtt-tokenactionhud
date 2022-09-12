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
    let utilityCat = actionList.categories.find((c) => c.id === "utility");
    if (!utilityCat) {
      utilityCat = this.baseHandler.initializeEmptyCategory("utility");
      utilityCat.name = this.baseHandler.i18n("tokenactionhud.utility");
      actionList.categories.push(utilityCat);
    }

    if (isMultipleTokens) {
      const tokens = canvas.tokens.controlled;
      this._addMultiUtilities(utilityCat, tokens);
    } else {
      this._getUtilityList(utilityCat, token.id);
    }
  }

  /** @private */
  _getUtilityList(utilityCat, tokenId) {
    let macroType = "utility";
    let utility = this.baseHandler.initializeEmptySubcategory();

    // Toggle Combat
    const inCombat = canvas.tokens.placeables.find((t) => t.id === tokenId).inCombat
    const name = (inCombat) 
      ? this.baseHandler.i18n("tokenactionhud.removeFromCombat")
      : this.baseHandler.i18n("tokenactionhud.addToCombat");
    let combatStateValue = [macroType, tokenId, "toggleCombat"].join(
      this.baseHandler.delimiter
    );
    let combatAction = {
      id: "toggleCombat",
      encodedValue: combatStateValue,
      name: name,
    };
    utility.actions.push(combatAction);

    // Toggle Visibility
    if (game.user.isGM) {
      const hidden = canvas.tokens.placeables.find((t) => t.id === tokenId).document.hidden
      const name = (hidden)
        ? this.baseHandler.i18n("tokenactionhud.makeVisible")
        : this.baseHandler.i18n("tokenactionhud.makeInvisible");
      let visbilityValue = [macroType, tokenId, "toggleVisibility"].join(
        this.baseHandler.delimiter
      );
      let visibilityAction = {
        id: "toggleVisibility",
        encodedValue: visbilityValue,
        name: name,
      };
      utility.actions.push(visibilityAction);

      this.baseHandler._combineSubcategoryWithCategory(
        utilityCat,
        this.baseHandler.i18n("tokenactionhud.token"),
        utility
      );
    }
  }

  /** @private */
  _addMultiUtilities(utilityCat, tokens) {
    let macroType = "utility";
    let tokenId = "multi";

    let utility = this.baseHandler.initializeEmptySubcategory();

    // Toggle Combat
    const inCombat = tokens.every((t) => t.inCombat);
    const name = (inCombat) 
      ? this.baseHandler.i18n("tokenactionhud.removeFromCombat")
      : this.baseHandler.i18n("tokenactionhud.addToCombat");
    let combatStateValue = [macroType, tokenId, "toggleCombat"].join(
      this.baseHandler.delimiter
    );
    let combatAction = {
      id: "toggleCombat",
      encodedValue: combatStateValue,
      name: name,
    };
    utility.actions.push(combatAction);

    // Toggle Visibility
    if (game.user.isGM) {
      const hidden = tokens.every((t) => !t.document.hidden);
      const name = (hidden)
      ? this.baseHandler.i18n("tokenactionhud.makeVisible")
      : this.baseHandler.i18n("tokenactionhud.makeInvisible");
      let visbilityValue = [macroType, tokenId, "toggleVisibility"].join(
        this.baseHandler.delimiter
      );
      let visibilityAction = {
        id: "toggleVisibility",
        encodedValue: visbilityValue,
        name: name,
      };
      utility.actions.push(visibilityAction);
    }

    this.baseHandler._combineSubcategoryWithCategory(
      utilityCat,
      this.baseHandler.i18n("tokenactionhud.token"),
      utility
    );
  }
}
