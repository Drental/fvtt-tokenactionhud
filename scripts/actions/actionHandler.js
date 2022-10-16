import { ActionList } from "../entities/actionList.js";
import { ActionCategory } from "../entities/actionCategory.js";
import { ActionSubcategory } from "../entities/actionSubcategory.js";
import { Action } from "../entities/action.js";
import * as settings from "../settings.js";
import { GenericActionHandler } from "./genericActionHandler.js";
import { CompendiumActionHandler } from "./compendiumActionHandler.js";
import { MacroActionHandler } from "./macroActionHandler.js";
import { getSubcategoriesById, getSubcategoryByNestId } from "../utils.js";

export class ActionHandler {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  furtherActionHandlers = [];
  delimiter = "|";

  constructor(character, categoryManager) {
    this.character = character;
    this.categoryManager = categoryManager;
    this.genericActionHandler = new GenericActionHandler(this);
    this.compendiumActionHandler = new CompendiumActionHandler(this);
    this.macroActionHandler = new MacroActionHandler(this);
    this.actionList = [];
    this.savedActionList = [];
  }

  /** @public */
  async buildActionList(character) {
    this.character = character;
    this.savedActionList = this.getSavedActionList(character);
    const emptyActionList = this.buildEmptyActionList(character);
    this.actionList = await this._buildSystemActions(emptyActionList, character);
    this._buildGenericActions(this.actionList, character);
    await this._buildCompendiumActions(this.actionList);
    await this._buildMacroActions(this.actionList);
    this.buildFurtherActions(this.actionList, character);
    await this.saveActionList(this.actionList, character);
    return this.actionList;
  }

  getSavedActionList(character) {
    const actor = character?.actor;
    if (!actor) return [];
    const categories = actor.getFlag("token-action-hud", "categories");
    if (!categories) return [];
    const savedActionList = categories;
    return savedActionList;
  }

  buildEmptyActionList(character) {
    let hudTitle = "";
    if (settings.get("showHudTitle")) hudTitle = character?.name ?? "Multiple";
    const tokenId = character?.token?.id ?? "multi";
    const actorId = character?.actor?.id ?? "multi";
    let emptyActionList = new ActionList(hudTitle, tokenId, actorId);

    const categories =
      game.user.flags["token-action-hud"]?.categories ??
      game.user.flags["token-action-hud"]?.default.categories;
    for (const category of Object.values(categories)) {
      emptyActionList.categories.push(
        new ActionCategory(category.id, category.title)
      );

      const subcategories = category.subcategories;
      if (subcategories) {
        for (const subcategory of Object.values(subcategories)) {
          emptyActionList.categories
            .find((c) => c.id === category.id)
            .subcategories.push(
              new ActionSubcategory(
                subcategory.id,
                category.id,
                subcategory.title,
                subcategory.type
              )
            );
        }
      }
    }
    return emptyActionList;
  }

  async _buildSystemActions(emptyActionList, character) {
    const actionList = emptyActionList;
    const subcategoryIds = Object.values(actionList.categories)
      .filter((category) => category.subcategories)
      .flatMap((category) =>
        Object.values(category.subcategories)
          .filter((subcategory) => subcategory.type === "system")
          .flatMap((subcategory) => subcategory.id)
      );
    await this.buildSystemActions(actionList, character, subcategoryIds);
    return actionList;
  }

  /** @public */
  async buildSystemActions(actionList, character, subcategoryIds) {}

  /** @protected */
  _buildGenericActions(actionList, character) {
    this.genericActionHandler.buildGenericActions(actionList, character);
  }

  /** @protected */
  async _buildCompendiumActions(actionList) {
    await this.compendiumActionHandler.buildCompendiumActions(actionList);
  }

  /** @protected */
  async _buildMacroActions(actionList) {
    await this.macroActionHandler.buildMacroActions(actionList);
  }

  /** @protected */
  buildFurtherActions(actionList, character) {
    this.furtherActionHandlers.forEach((handler) =>
      handler.extendActionList(actionList, character)
    );
  }

  getActionsAsTagifyEntries(nestId) {
    if (!this.actionList) return;
    const subcategory = getSubcategoryByNestId(
      this.actionList.categories,
      nestId
    );
    const actions = subcategory.actions.map((action) =>
      this.asTagifyEntry(action)
    );
    return actions;
  }

  getSelectedActionsAsTagifyEntries(nestId) {
    if (!this.actionList) return;
    const subcategory = getSubcategoryByNestId(
      this.actionList.categories,
      nestId
    );
    const actions = subcategory.actions
      .filter((action) => action.selected === true)
      .map((action) => this.asTagifyEntry(action));
    return actions;
  }

  /** @public */
  async registerDefaultCategories() {}

  // ADD SUBCATEGORIES/ACTIONS

  /** @public */
  addToSubcategoriesList(subcategoryList, id, subcategory, actions) {
    if (actions.length > 0) {
      subcategoryList.push({
        id: id,
        subcategory: subcategory,
        actions: actions,
      });
    }
  }

  /** @public */
  addSubcategoriesToActionList(actionList, subcategoryList, subcategoryId) {
    // Clone subcategories
    const subcategoryListClone = structuredClone(subcategoryList);

    // Add subcategories
    const subcategories = subcategoryListClone.map(
      (subcategory) => subcategory.subcategory
    );

    Object.values(actionList.categories)
      .flatMap((category) => category.subcategories)
      .filter((subcategory) => subcategory.id === subcategoryId)
      .flatMap((subcategory) => (subcategory.subcategories = subcategories));

    // Add actions
    for (const subcategory of subcategoryListClone) {
      if (!subcategory.actions) return;
      this.addActionsToActionList(
        actionList,
        subcategory.actions,
        subcategory.id
      );
    }
  }

  /** @public */
  addActionsToActionList(actionList, actions, subcategoryId) {
    if (actions.length === 0) return;

    const subcategories = getSubcategoriesById(
      actionList.categories,
      subcategoryId
    );

    for (const subcategory of subcategories) {
      // Get saved subcategory
      const savedSubcategory = getSubcategoryByNestId(
        this.savedActionList,
        subcategory.nestId
      );

      // Clone actions
      const actionsClone = structuredClone(actions);

      for (const actionClone of actionsClone) {
        // Get selected value from saved action
        const action = savedSubcategory?.actions
          ? savedSubcategory.actions.find(
              (action) => action.encodedValue === actionClone.encodedValue
            )
          : null;
        const selected = action?.selected ?? actionClone.selected ?? true;

        actionClone.selected = selected;
      }

      // Update action list
      subcategory.actions = actionsClone;
    }
  }

  async saveActionList(actionList, character) {
    if (!character?.actor) return;
    const actor = character.actor;
    await actor.unsetFlag("token-action-hud", "categories");
    await actor.setFlag(
      "token-action-hud",
      "categories",
      actionList.categories
    );
  }

  async saveActions(nestId, selectedActions) {
    const subcategory = getSubcategoryByNestId(
      this.actionList.categories,
      nestId
    );
    const actions = subcategory.actions;

    const reorderedActions = [];

    for (const selectedAction of selectedActions) {
      const action = actions.find(
        (action) => action.encodedValue === selectedAction.id
      );
      if (action) {
        const actionClone = structuredClone(action);
        actionClone.selected = true;
        reorderedActions.push(actionClone);
      }
    }
    for (const action of actions) {
      const selectedAction = selectedActions.find(
        (selectedAction) => selectedAction.id === action.encodedValue
      );
      if (!selectedAction) {
        const actionClone = structuredClone(action);
        actionClone.selected = false;
        reorderedActions.push(actionClone);
      }
    }

    subcategory.actions = reorderedActions;

    await this.saveActionList(this.actionList, this.character);
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

  // Only used in lancer-actions.js
  /** @public */
  initializeEmptyAction() {
    return new Action();
  }

  /** @public */
  initializeEmptyCategory(categoryId) {
    const category = new ActionCategory();
    category.id = categoryId;
    return category;
  }

  initializeEmptySubcategory(id = "", parentNestId = "", name = "", type = "") {
    const subcategory = new ActionSubcategory(id, parentNestId, name, type);
    return subcategory;
  }

  asTagifyEntry(data) {
    return { id: data.encodedValue, value: data.name, type: data.type };
  }

  getImage(entity, defaultImages = []) {
    defaultImages.push("icons/svg/mystery-man.svg");
    let result = "";
    if (settings.get("showIcons")) result = entity.img ?? "";
    return !defaultImages.includes(result) ? result : "";
  }

  sortItems(items) {
    let result = Object.values(items);
    result.sort((a, b) => a.sort - b.sort);
    return result;
  }

  foundrySort(a, b) {
    if (!(a?.sort || b?.sort)) return 0;
    return a.sort - b.sort;
  }
}
