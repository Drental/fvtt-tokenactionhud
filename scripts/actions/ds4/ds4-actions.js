import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerDs4 extends ActionHandler {
  /** @override */
  doBuildActionList(token, multipleTokens) {
    if (token) {
      return this._buildSingleTokenList(token);
    } else if (multipleTokens) {
      return this._buildMultipleTokenList();
    }
    return this.initializeEmptyActionList();
  }

  _buildSingleTokenList(token) {
    const actionList = this.initializeEmptyActionList();
    actionList.tokenId = token?.id;
    actionList.actorId = token?.actor?.id;
    if (!actionList.tokenId || !actionList.actorId) {
      return actionList;
    }

    if (settings.get("showHudTitle")) {
      actionList.hudTitle = token.data?.name;
    }

    const categories = this._buildSingleTokenCategories(token);
    categories.forEach((category) => {
      this._combineCategoryWithList(actionList, category.name, category);
    });

    return actionList;
  }

  _buildSingleTokenCategories(token) {
    const tokenId = token.id;
    const actor = token.actor;
    return [
      this._buildChecksCategory(tokenId, actor),
      this._buildInventoryCategory(tokenId, actor),
      this._buildSpellsCategory(tokenId, actor),
    ].filter((category) => !!category);
  }

  _buildChecksCategory(tokenId, actor) {
    const checksCategory = this.initializeEmptyCategory("checks");
    const checksCategoryName = this.i18n("DS4.Checks");
    checksCategory.name = checksCategoryName;

    const checksSubcategory = this.initializeEmptySubcategory();
    const displayCheckTargetNumbers = !!actor && settings.get("displayCheckTargetNumbers");
    checksSubcategory.actions = Object.entries(CONFIG.DS4.i18n.checks).map(([id, name]) => ({
      id,
      name: displayCheckTargetNumbers ? `${name} (${actor.system.checks[id]})` : name,
      encodedValue: ["check", tokenId, id].join(this.delimiter),
      img: CONFIG.DS4.icons.checks[id],
    }));

    this._combineSubcategoryWithCategory(checksCategory, checksCategoryName, checksSubcategory);

    return checksCategory;
  }

  _buildInventoryCategory(tokenId, actor) {
    const inventoryCategory = this.initializeEmptyCategory("inventory");
    const inventoryCategoryName = this.i18n("DS4.HeadingInventory");
    inventoryCategory.name = inventoryCategoryName;

    const equippedItems = actor.items
      .filter((item) => item.system.equipped)
      .sort((a, b) => a.data.sort - b.data.sort);

    const weaponsSubcategory = this.initializeEmptySubcategory();
    weaponsSubcategory.actions = equippedItems
      .filter((item) => item.type === "weapon")
      .map((weapon) => this._buildItemAction(weapon, tokenId));

    this._combineSubcategoryWithCategory(inventoryCategory, this.i18n("DS4.ItemTypeWeaponPlural"), weaponsSubcategory);

    return inventoryCategory;
  }

  _buildSpellsCategory(tokenId, actor) {
    const spellsCategory = this.initializeEmptyCategory("spells");
    spellsCategory.name = this.i18n("DS4.HeadingSpells");

    const equippedItems = actor.items
      .filter((item) => item.system.equipped)
      .sort((a, b) => a.data.sort - b.data.sort);

    const spellsSubcategory = this.initializeEmptySubcategory();
    spellsSubcategory.actions = equippedItems
      .filter((item) => item.type === "spell")
      .map((weapon) => this._buildItemAction(weapon, tokenId));

    this._combineSubcategoryWithCategory(spellsCategory, this.i18n("DS4.ItemTypeSpellPlural"), spellsSubcategory);

    return spellsCategory;
  }

  _buildItemAction(item, tokenId) {
    return {
      id: item.id,
      name: item.name,
      encodedValue: [item.type, tokenId, item.id].join(this.delimiter),
      img: item.img,
    };
  }

  _buildMultipleTokenList() {
    const actionList = this.initializeEmptyActionList();

    const categories = this._buildMultipleTokenCategories();
    categories.forEach((category) => {
      this._combineCategoryWithList(actionList, category.name, category);
    });

    return actionList;
  }

  _buildMultipleTokenCategories() {
    return [this._buildChecksCategory("multi")].filter((category) => !!category);
  }
}
