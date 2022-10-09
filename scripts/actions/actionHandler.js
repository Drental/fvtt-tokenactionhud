import { ActionList } from "./entities/actionList.js";
import { ActionCategory } from "./entities/actionCategory.js";
import { ActionSubcategory } from "./entities/actionSubcategory.js";
import { ActionSet } from "./entities/actionSet.js";
import { Action } from "./entities/action.js";
import * as settings from "../settings.js";
import { GenericActionHandler } from "./genericActionHandler.js";
import { CompendiumActionHandler } from "./compendiumActionHandler.js";
import { getSubcategoriesById, getSubcategoryByNestId } from "../utils.js";

export class ActionHandler {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  linkedCompendiumsGm = [];
  linkedCompendiumsPlayer = [];
  furtherActionHandlers = [];
  delimiter = "|";
  
  constructor(character, categoryManager) {
    this.character = character;
    this.categoryManager = categoryManager;
    this.genericActionHandler = new GenericActionHandler(this);
    this.compendiumActionHandler = new CompendiumActionHandler(this);
    this.actionList = [];
    this.savedActionList = [];
  }

  /** @public */
  async buildActionList(character) {
    this.character = character;
    this.savedActionList = this.getSavedActionList(character);
    const emptyActionList = this._buildEmptyActionList(character);
    this.actionList = await this.buildSystemActions(emptyActionList, character);
    this._buildGenericActions(this.actionList, character);
    await this._buildCompendiumActions(this.actionList);
    this.buildFurtherActions(this.actionList, character);
    this.saveActionList(this.actionList, character);
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

  getSuggestedActionsAsTagifyEntries(nestId) {
    if (!this.actionList) return;
    const subcategory = getSubcategoryByNestId(this.actionList.categories, nestId);
    const actions = subcategory.actions
      .map(action => this.asTagifyEntry(action));
    return actions;
  }

  getSelectedActionsAsTagifyEntries(nestId) {
    if (!this.actionList) return;
    const subcategory = getSubcategoryByNestId(this.actionList.categories, nestId);
    const actions = subcategory.actions
      .filter(action => action.selected === true)
      .map(action => this.asTagifyEntry(action));
    return actions;
  }

  _buildEmptyActionList(character) {
    let hudTitle = "";
    if (settings.get("showHudTitle")) hudTitle = character?.name ?? "Multiple";
    const tokenId = character.token?.id;
    const actorId = character.actor?.id;
    let emptyActionList = new ActionList(hudTitle, tokenId, actorId);

    const categories = game.user.flags["token-action-hud"]?.categories ?? 
      game.user.flags["token-action-hud"]?.default.categories;
    for (const category of Object.values(categories)) {
      emptyActionList.categories.push(new ActionCategory(category.id, category.title));

      const subcategories = category.subcategories;
      if (subcategories) {
        for (const subcategory of Object.values(subcategories)) {
          emptyActionList.categories.find(c => c.id === category.id)
            .subcategories.push(new ActionSubcategory(subcategory.id, category.id, subcategory.title, subcategory.type));
        }
      }
    }
    return emptyActionList;
  }

  /** @public */
  async registerDefaultCategories() {}

  /** @public */
  async buildSystemActions(actionList, character) {}
  
  // MAP SUBCATEGORIES/ACTIONS
  /** @public */
  _mapSubcategories(actionList, subcategories, subcategoryId) {
    // Clone subcategories
    const subcategoriesClone = structuredClone(subcategories);

    // Update action list
    Object.values(actionList.categories)
      .flatMap(category => category.subcategories)
      .filter(subcategory => subcategory.id === subcategoryId)
      .flatMap(subcategory => subcategory.subcategories = subcategoriesClone);
  }
  /** @public */
  _mapActions(actionList, actions, subcategoryId) {
    if (actions.length === 0) return;

    const subcategories = getSubcategoriesById(actionList.categories, subcategoryId);

    for (const subcategory of subcategories) {
      // Get saved subcategory
      const savedSubcategory = getSubcategoryByNestId(this.savedActionList, subcategory.nestId);

      // Clone actions
      const actionsClone = structuredClone(actions);

      for (const actionClone of actionsClone) {

        // Get selected value from saved action
        const action = (savedSubcategory?.actions)
          ? savedSubcategory.actions.find(action => action.encodedValue === actionClone.encodedValue)
          : { selected: true };
        const selected = action?.selected ?? true;
        
        actionClone.selected = selected;
      }

      // Update action list
      subcategory.actions = actionsClone;
    }
  } 

  // ADD CATEGORIES
  /** @protected */
  _buildGenericActions(actionList, character) {
    this.genericActionHandler.buildGenericActions(
      actionList,
      character
    );
  }

  /** @protected */
  async _buildCompendiumActions(actionList) {
    await this.compendiumActionHandler.buildCompendiumActions(
      actionList
    );
  }

  /** @protected */
  buildFurtherActions(actionList, character) {
    this.furtherActionHandlers.forEach((handler) =>
      handler.extendActionList(actionList, character)
    );
  }

  async saveActionList(actionList, character) {
    if (!character.actor) return;
    const actor = character.actor;
    game.tokenActionHUD.ignoreUpdateActor = true;
    await actor.unsetFlag("token-action-hud", "categories");
    game.tokenActionHUD.ignoreUpdateActor = true;
    await actor.setFlag("token-action-hud", "categories", actionList.categories);
  }

  async saveActions(nestId, selectedActions) {
    const subcategory = getSubcategoryByNestId(this.actionList.categories, nestId);
    const actions = subcategory.actions;

    const reorderedActions = [];
    
    for (const selectedAction of selectedActions) {
      const action = actions.find(action => action.encodedValue === selectedAction.id);
      if (action) {
        const actionClone = structuredClone(action);
        actionClone.selected = true;
        reorderedActions.push(actionClone);
      }
    }
    for (const action of actions) {
      const selectedAction = selectedActions.find(selectedAction => selectedAction.id === action.encodedValue);
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

  initializeEmptySubcategory(id = "", parentNestId = "", name = "", type = "", ) {
    let subcategory = new ActionSubcategory(id, parentNestId, name, type);
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

  asTagifyEntry(data) {
    return { id: data.encodedValue, value: data.name, type: data.type };
  }

  /** @protected */
  _foundrySort(a, b) {
    if (!(a?.sort || b?.sort)) return 0;

    return a.sort - b.sort;
  }

  getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";

    return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
  }
}
