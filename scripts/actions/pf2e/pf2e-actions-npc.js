import * as settings from "../../settings.js";

export class NpcActionHandlerPf2e {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  constructor(actionHandlerpf2e) {
    this.baseHandler = actionHandlerpf2e;
  }

  buildActionList(result, tokenId, actor) {
    let strikes = this._getStrikesListNpc(actor, tokenId);
    let actions = this.baseHandler._getActionsList(actor, tokenId);
    let items = this.baseHandler._getItemsList(actor, tokenId);
    let spells = this.baseHandler._getSpellsList(actor, tokenId);
    let feats = this.baseHandler._getFeatsList(actor, tokenId);
    let skills = this.baseHandler._getSkillsList(actor, tokenId);
    let saves = this.baseHandler._getSaveList(actor, tokenId);
    let attributes = this._getAttributeListNpc(actor, tokenId);
    let effects = this.baseHandler._getEffectsList(actor, tokenId);
    let utilities = this.baseHandler._getUtilityList(actor, tokenId);

    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.strikes"),
      strikes
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.actions"),
      actions
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.effects"),
      effects
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.inventory"),
      items
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.spells"),
      spells
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.features"),
      feats
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.skills"),
      skills
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.saves"),
      saves
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.attributes"),
      attributes
    );
    this.baseHandler._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.utility"),
      utilities
    );
  }

  /** @private */
  _getStrikesListNpc(actor, tokenId) {
    let result = this.baseHandler.initializeEmptyCategory("strikes");
    result.cssClass = "oneLine";

    if (!settings.get("separateTogglesCategory"))
      this._addTogglesCategories(actor, tokenId, result);

    this.baseHandler._addStrikesCategories(actor, tokenId, result);

    return result;
  }

  /** @private */
  _addTogglesCategories(actor, tokenId, category) {
    const macroType = "toggle";
    const toggles = actor.data.data.toggles;

    if (!toggles.length) return;

    let subcategory = this.baseHandler.initializeEmptySubcategory();
    subcategory.actionsClass = "excludeFromWidthCalculation";

    toggles.forEach((t) => {
      const id = [t.domain, t.option].join(".");
      const { delimiter } = this.baseHandler;
      const encodedValue = [macroType, tokenId, JSON.stringify(t)].join(delimiter);
      const name = game.i18n.localize(t.label);
      const cssClass = t.checked ? "active" : "";

      subcategory.actions.push({ id, encodedValue, name, cssClass });
    });

    this.baseHandler._combineSubcategoryWithCategory(
      category,
      this.baseHandler.i18n("tokenactionhud.toggles"),
      subcategory
    );
  }

  /** @private */
  _getAttributeListNpc(actor, tokenId) {
    let macroType = "attribute";
    let result = this.baseHandler.initializeEmptyCategory("attributes");
    let attributes = this.baseHandler.initializeEmptySubcategory();

    let attributesMap = [
      { id: "perception", name: "Perception" },
      { id: "initiative", name: "Initiative" },
    ];

    attributes.actions = this.baseHandler._produceActionMap(
      tokenId,
      attributesMap,
      macroType
    );

    this.baseHandler._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenactionhud.attributes"),
      attributes
    );

    return result;
  }

  /** @protected */
  _foundrySort(a, b) {
    if (!(a?.data?.sort || b?.data?.sort)) return 0;

    return a.data.sort - b.data.sort;
  }
}
