import { ActionList } from "./entities/actionList.js";
import { ActionCategory } from "./entities/actionCategory.js";
import { ActionSubcategory } from "./entities/actionSubcategory.js";
import { ActionSet } from "./entities/actionSet.js";
import { Action } from "./entities/action.js";
import * as settings from "../settings.js";
import { GenericActionHandler } from "./genericActionHandler.js";

export class ActionHandler {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  linkedCompendiumsGm = [];
  linkedCompendiumsPlayer = [];
  furtherActionHandlers = [];
  delimiter = "|";
  
  constructor(categoryManager) {
    this.categoryManager = categoryManager;
    this.genericActionHandler = new GenericActionHandler(this);
  }

  /** @public */
  async buildActionList(token, multipleTokens) {
    const emptyActionList = this._buildEmptyActionList(token, multipleTokens);
    const actionList = await this.doBuildActions(emptyActionList, token, multipleTokens);
    this._addGenericCategories(actionList, token, multipleTokens);
    this._doBuildFurtherActions(actionList, token, multipleTokens);
    return actionList;
  }

  _buildEmptyActionList(token, multipleTokens) {
    let hudTitle = "";
    if (settings.get("showHudTitle")) hudTitle = token?.name;
    const tokenId = token?.id;
    const actorId = token?.actor?.id;
    let emptyActionList = new ActionList(hudTitle, tokenId, actorId);

    const categories = game.user.flags["token-action-hud"]?.categories ?? 
      game.user.flags["token-action-hud"]?.default.categories;
    for (const category of Object.values(categories)) {
      emptyActionList.categories.push(new ActionCategory(category.id, category.title));

      const subcategories = category.subcategories;
      if (subcategories) {
        for (const subcategory of Object.values(subcategories)) {
          emptyActionList.categories.find(c => c.id === category.id)
            .subcategories.push(new ActionSubcategory(subcategory.id, subcategory.title));
        }
      }
    }
    return emptyActionList;
  }

  /** @public */
  async registerDefaultCategories() {}

  /** @public */
  doBuildActions(emptyActionList, token, multipleTokens) {}
  
  /** @public */
  _mapSubcategories(actionList, subcategories, subcategoryId) {
    Object.values(actionList.categories)
    .map(c => c.subcategories
      .filter(sc => sc.id === subcategoryId)
      .map(sc => sc.subcategories = subcategories)
    );
  }

  /** @public */
  _mapActions(actionList, actions, subcategoryId) {
    Object.values(actionList.categories)
    .filter(c => c.subcategories)
    .map(c => Object.values(c.subcategories)
      .filter(sc => sc.id === subcategoryId)
      .map(sc => sc.actions = actions)
    );
  }

  /** @protected */
  _addGenericCategories(actionList, token, multipleTokens) {
    if (token || multipleTokens)
      this.genericActionHandler.addGenericCategories(
        actionList,
        token,
        multipleTokens
      );
  }

  /** @protected */
  _doBuildFurtherActions(token, actionList, multipleTokens) {
    this.furtherActionHandlers.forEach((handler) =>
      handler.extendActionList(actionList, multipleTokens)
    );
  }

  /** @public */
  addFurtherActionHandler(handler) {
    settings.Logger.debug(
      `Adding further action handler: ${handler.constructor.name}`
    );
    this.furtherActionHandlers.push(handler);
  }

  /** @public */
  initializeEmptyActionList() {
    return new ActionList();
  }

  /** @public */
  initializeEmptyActionSet() {
    return new ActionSet();
  }

  /** @public */
  initializeEmptyAction() {
    return new Action();
  }

  /** @public */
  initializeEmptyCategory(categoryId) {
    let category = new ActionCategory();
    category.id = categoryId;
    return category;
  }

  initializeEmptySubcategory(id = "", name = "") {
    let subcategory = new ActionSubcategory(id, name);
    return subcategory;
  }

  /** @protected */
  _combineCategoryWithList(result, categoryName, category, push = true) {
    if (!category) return;

    if (categoryName?.length > 0) category.name = categoryName;

    if (push) result.categories.push(category);
    else result.categories.unshift(category);
  }

  /** @protected */
  _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
    if (!subcategory) return;

    if (subcategoryName?.length > 0) subcategory.name = subcategoryName;

    if (
      subcategory.subcategories.length > 0 ||
      subcategory.actions.length > 0 ||
      subcategory.canFilter
    )
      category.subcategories.push(subcategory);
    else
      settings.Logger.debug(
        "subcategory criteria not met, disposing of",
        subcategoryName
      );
  }

  /** @protected */
  _foundrySort(a, b) {
    if (!(a?.sort || b?.sort)) return 0;

    return a.sort - b.sort;
  }
}
