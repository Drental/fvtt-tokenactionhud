import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerCthack extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActionList(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    let actorType = actor.type;
    if (actorType != "character") return result;

    result.actorId = actor.id;

    let saves = this._getSaves(actor, tokenId);
    let attributes = this._getAttributes(actor, tokenId);
    let items = this._getItemList(actor, tokenId);
    let abilities = this._getAbilities(actor, tokenId);

    this._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.saves"),
      saves
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.attributes"),
      attributes
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.equipment"),
      items
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.features"),
      abilities
    );

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  /** @private */
  _getSaves(actor, tokenId) {
    let result = this.initializeEmptyCategory("saves");
    let attributesCategory = this.initializeEmptySubcategory();

    let saves = Object.entries(actor.system.saves);

    attributesCategory.actions = saves.map((c) => {
      const saveId = c[0];
      const name = game.cthack.config.saves[saveId];
      const macroType = "save";
      let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: c[0] };
    });
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenactionhud.saves"),
      attributesCategory
    );
    return result;
  }

  /** @private */
  _getAttributes(actor, tokenId) {
    let result = this.initializeEmptyCategory("attributes");
    let attributesCategory = this.initializeEmptySubcategory();
    let attributes = actor.getAvailableAttributes();

    attributesCategory.actions = attributes.map((c) => {
      const attributeId = c[0];

      // The name depends of the settings
      let name;
      if (
        attributeId === "miscellaneous" &&
        game.settings.get("cthack", "MiscellaneousResource") !== ""
      ) {
        name = game.settings.get("cthack", "MiscellaneousResource");
      } else name = game.cthack.config.attributes[attributeId];

      let macroType = "resource";

      if (attributeId === "armedDamage" || attributeId === "unarmedDamage") {
        macroType = "damage";
      }
      let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: c[0] };
    });
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenactionhud.attributes"),
      attributesCategory
    );
    return result;
  }

  /** @private */
  _getItemList(actor, tokenId) {
    let weapons = actor.items.filter((item) => item.type === "weapon");
    let weaponActions = weapons.map((w) =>
      this._buildEquipmentItem(tokenId, actor, "weapon", w)
    );
    let weaponsCat = this.initializeEmptySubcategory();
    weaponsCat.actions = weaponActions;

    let equipment = actor.items.filter((item) => item.type === "item");
    let equipmentActions = equipment.map((e) =>
      this._buildEquipmentItem(tokenId, actor, "item", e)
    );
    let equipmentCat = this.initializeEmptySubcategory();
    equipmentCat.actions = equipmentActions;

    let weaponsTitle = this.i18n("tokenactionhud.weapons");
    let equipmentTitle = this.i18n("tokenactionhud.equipment");

    let result = this.initializeEmptyCategory("inventory");

    this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
    this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);

    return result;
  }

  /** @private */
  _getAbilities(actor, tokenId) {
    let abilities = actor.items.filter((item) => item.type === "ability");
    let abilitiesActions = abilities.map((w) =>
      this._buildEquipmentItem(tokenId, actor, "ability", w)
    );
    let abilitiesCat = this.initializeEmptySubcategory();
    abilitiesCat.actions = abilitiesActions;

    let abilitiesTitle = this.i18n("tokenactionhud.features");

    let result = this.initializeEmptyCategory("inventory");

    this._combineSubcategoryWithCategory(result, abilitiesTitle, abilitiesCat);

    return result;
  }

  /** @private */
  _produceMap(tokenId, itemSet, macroType) {
    return itemSet
      .filter((i) => !!i)
      .map((i) => {
        let encodedValue = [macroType, tokenId, i._id].join(
          this.delimiter
        );
        let item = { name: i.name, encodedValue: encodedValue, id: i._id };
        return item;
      });
  }

  /** @private */
  _buildEquipmentItem(tokenId, actor, macroType, item) {
    let action = this._buildItem(tokenId, actor, macroType, item);
    return action;
  }

  /** @private */
  _buildItem(tokenId, actor, macroType, item) {
    let encodedValue = [macroType, tokenId, item.id].join(this.delimiter);
    let img = this._getImage(item);
    let icon = this._getIcon(item);

    let result = {
      name: item.name,
      id: item.id,
      encodedValue: encodedValue,
      img: img,
      icon: icon
    };

    return result;
  }

  _getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";

    return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
  }

 /** @private */
  _getIcon(item) {
    // Capacity activable
    if (item.type === "ability" && item.system.uses?.per !== "Permanent") {
      if (item.system.uses.value > 0) {
        return '<i class="fas fa-check"></i>';
      }
      else return '<i class="fas fa-times"></i>';      
    }    
    return "";
  } 

}
