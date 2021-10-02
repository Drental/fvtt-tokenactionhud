import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerCo extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActionList(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let tokenId = token.data._id;

    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    let actorType = actor.data.type;
    if (actorType != "character") return result;

    result.actorId = actor.id;

    let characteristics = this._getCharacteristics(actor, tokenId);
    let combat = this._getCombat(actor,tokenId);
    let items = this._getItemsList(actor, tokenId);
    let capacities = this._getCapacities(actor, tokenId);

    this._combineCategoryWithList(result, this.i18n("tokenactionhud.characteristics"), characteristics);
    this._combineCategoryWithList(result, this.i18n("tokenactionhud.co.combat"), combat);
    this._combineCategoryWithList(result, this.i18n("tokenactionhud.inventory"), items);
    this._combineCategoryWithList(result, this.i18n("tokenactionhud.co.capacities"), capacities);
    
    if (settings.get("showHudTitle")) result.hudTitle = token.data?.name;

    return result;
  }

  /** @private */
  _getCharacteristics(actor, tokenId) {
    let result = this.initializeEmptyCategory("characteristics");

    // Characteristics
    let statsCategory = this.initializeEmptySubcategory();

    let stats = Object.entries(actor.data.data.stats);

    statsCategory.actions = stats.map((c) => {
      const statId = c[0];
      const name = game.cof.config.stats[statId];
      const macroType = "stat";
      let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: c[0] };
    });
    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.characteristics"), statsCategory);

    // Attacks
    let attacksCategory = this.initializeEmptySubcategory();

    let attacks = Object.entries(actor.data.data.attacks);

    attacksCategory.actions = attacks.map((c) => {
      const attackId = c[0];
      const name = game.cof.config.skills[attackId];
      const macroType = "skill";
      let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: c[0] };
    });

    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.co.attacks"), attacksCategory);

    return result;
  }

  /** @private */
  _getCombat(actor, tokenId) {
    let result = this.initializeEmptyCategory("combat");

    // Weapons
    let weaponsCategory = this.initializeEmptySubcategory();

    let weapons = actor.items.filter(item => item.data.type === "item" && (item.data.data.subtype === "melee" || item.data.data.subtype === "ranged") && item.data.data.worn);
    
    weaponsCategory.actions = weapons.map((w) =>
      this._buildEquipmentItem(tokenId, actor, "weapon", w)
    );
    
    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.weapons"), weaponsCategory);

    // Spells
    let spellsCategory = this.initializeEmptySubcategory();

    let spells = actor.items.filter(item => item.data.type === "item" && item.data.data.subtype === "spell" && (item.data.data.properties.weapon || item.data.data.properties.activable));
    
    spellsCategory.actions = spells.map((w) =>
      this._buildEquipmentItem(tokenId, actor, "spell", w)
    );
    
    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.spells"), spellsCategory);

    return result;
  }

  /** @private */
  _getItemsList(actor, tokenId) {
    let result = this.initializeEmptyCategory("inventory");

    // Weapons
    let weapons = actor.items.filter(item => item.data.type === "item" && (item.data.data.subtype === "melee" || item.data.data.subtype === "ranged"));
    let weaponActions = weapons.map((w) =>
      this._buildEquipmentItem(tokenId, actor, "item", w)
    );
    let weaponsCat = this.initializeEmptySubcategory();
    weaponsCat.actions = weaponActions;

    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.weapons"), weaponsCat);

    // Armors and shield
    let protections = actor.items.filter((item) => item.data?.type === "item" && (item.data.data.subtype === "armor" || item.data.data.subtype === "shield"));
    let protectionsActions = protections.map((p) =>
      this._buildEquipmentItem(tokenId, actor, "item", p)
    );
    let protectionsCat = this.initializeEmptySubcategory();
    protectionsCat.actions = protectionsActions;
    
    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.co.protections"), protectionsCat);

    // Consumables
    let consumables = actor.items.filter((item) => item.data?.type === "item" && item.data.data.subtype !== "spell" && item.data.data.properties.consumable && item.data.data.qty > 0);

    let consumablesActions = consumables.map((p) =>
      this._buildEquipmentItem(tokenId, actor, "item", p)
    );
    let consumablesCat = this.initializeEmptySubcategory();
    consumablesCat.actions = consumablesActions;
    
    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.consumables"), consumablesCat);

    // Spells
    let spells = actor.items.filter((item) => item.data?.type === "item" && item.data.data.subtype === "spell");

    let spellsActions = spells.map((s) =>
      this._buildEquipmentItem(tokenId, actor, "item", s)
    );
    let spellsCat = this.initializeEmptySubcategory();
    spellsCat.actions = spellsActions;
    
    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.spells"), spellsCat);

    // Other equipment
    let others = actor.items.filter((item) => item.data?.type === "item" && (item.data.data.subtype !== "armor" && item.data.data.subtype !== "shield" && item.data.data.subtype !== "melee" && item.data.data.subtype !== "ranged" && item.data.data.subtype !== "spell" && !item.data.data.properties.consumable));
    let othersActions = others.map((i) =>
      this._buildEquipmentItem(tokenId, actor, "item", i)
    );
    let othersCat = this.initializeEmptySubcategory();
    othersCat.actions = othersActions;
    
    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.equipment"), othersCat);

    return result;
  }

  /** @private */
  _getCapacities(actor, tokenId) {
    let result = this.initializeEmptyCategory("capacities");

    // Capacities
    let capacities = actor.items.filter(item => item.data?.type === "capacity");
    let capacitiesActions = capacities.map((w) =>
      this._buildItem(tokenId, actor, "capacity", w)
    );
    let capacitiesCat = this.initializeEmptySubcategory();
    capacitiesCat.actions = capacitiesActions;

    this._combineSubcategoryWithCategory(result, this.i18n("tokenactionhud.co.capacities"), capacitiesCat);
    return result;
  }

  /** @private */
  _buildEquipmentItem(tokenId, actor, macroType, item) {
    let action = this._buildItem(tokenId, actor, macroType, item);
    this._addItemInfo(actor, item, action);
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

  /** @private */
  _getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";

    return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
  }

  /** @private */
  _getIcon(item) {
    return item.data.data.worn ? '<i class="fas fa-shield-alt"></i>' : "";
  }

  /** @private */
  _addItemInfo(actor, item, action) {
    action.info1 = this._getQuantityData(item);
  }  

  /** @private */
  _getQuantityData(item) {
    let result = "";
    
    const consumable = item.data.data.properties.consumable;
    const quantity = item.data.data.qty;

    if (consumable) {
      if (quantity > 0) {
        result = quantity;
      }
    }
    else {
      if (quantity > 1) {
        result = quantity;
      }
    }
    return result;
  }

  /** @private */
  _buildCapacityItem(tokenId, actor, macroType, item) {
    let action = this._buildItem(tokenId, actor, macroType, item);
    return action;
  }
}
