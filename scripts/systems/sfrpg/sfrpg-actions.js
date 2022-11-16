import { ActionHandler } from "../../core/actions/actionHandler.js";
import * as settings from "../../core/settings.js";

export class ActionHandlerSfrpg extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {

    if (!token) return actionList;

    let tokenId = token.id;

    actionList.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return actionList;

    actionList.actorId = actor.id;

    if (actor.type !== "starship") {
      this._buildItemCategory(token, actionList);
      this._buildSpellsCategory(token, actionList);
      this._buildFeatsCategory(token, actionList);
      this._buildSkillCategory(token, actor, actionList);
      this._buildAbilitiesCategory(token, actionList);
      this._buildSavesCategory(token, actionList);
    } else {
      this._addStarshipWeapons(token, actor, actionList);
      await this._addCrewActions(token, actor, actionList);
      this._addShields(token, actor, actionList);
    }
    this._buildUtilityCategory(token, actionList);

    settings.Logger.debug("SFRPG ActionList:", actionList);

    if (settings.get("showHudTitle")) actionList.hudTitle = token.name;

    return actionList;
  }

  _buildItemCategory(token, actionList) {
    var itemList = token.actor.items;
    let tokenId = token.id;

    var itemsCategoryName = this.i18n("tokenActionHud.equipment");
    var itemsActionType = "item";
    let itemsCategory = this.initializeEmptyCategory("equipment");

    itemsCategory = this._addSubcategoryByType(
      this.i18n("tokenActionHud.weapons"),
      "weapon",
      itemsActionType,
      itemList,
      tokenId,
      itemsCategory
    );
    itemsCategory = this._addSubcategoryByType(
      this.i18n("tokenActionHud.consumables"),
      "consumable",
      itemsActionType,
      itemList,
      tokenId,
      itemsCategory
    );

    this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
  }

  _buildFeatsCategory(token, actionList) {
    var itemList = token.actor.items.filter((item) => item.type == "feat");
    let tokenId = token.id;

    var itemsCategoryName = this.i18n("tokenActionHud.features");
    var itemsActionType = "feat";
    let itemsCategory = this.initializeEmptyCategory(itemsCategoryName);

    this._addSubcategoryByActionType(
      this.i18n("tokenActionHud.sfrpg.mwa"),
      "mwak",
      itemsActionType,
      itemList,
      tokenId,
      itemsCategory
    );
    this._addSubcategoryByActionType(
      this.i18n("tokenActionHud.sfrpg.rwa"),
      "rwak",
      itemsActionType,
      itemList,
      tokenId,
      itemsCategory
    );
    this._addSubcategoryByActionType(
      this.i18n("tokenActionHud.sfrpg.msa"),
      "msak",
      itemsActionType,
      itemList,
      tokenId,
      itemsCategory
    );
    this._addSubcategoryByActionType(
      this.i18n("tokenActionHud.sfrpg.rsa"),
      "rsak",
      itemsActionType,
      itemList,
      tokenId,
      itemsCategory
    );
    this._addSubcategoryByActionType(
      this.i18n("tokenActionHud.healing"),
      "heal",
      itemsActionType,
      itemList,
      tokenId,
      itemsCategory
    );

    if (settings.get("showMiscFeats")) {
      const miscFeats = itemList.filter(
        (i) =>
          !["mwak", "rwak", "msak", "rsak", "heal"].includes(i.system.actionType)
      );
      
      const activeFeats = miscFeats.filter(
        feat => feat.system.activation.type !== ""
      );
      this._addSubcategoryByItemList(
        this.i18n("tokenActionHud.sfrpg.activeFeats"),
        itemsActionType,
        activeFeats,
        tokenId,
        itemsCategory
      );

      const passiveFeats = miscFeats.filter(
        feat => feat.system.activation.type === ""
      );
      this._addSubcategoryByItemList(
        this.i18n("tokenActionHud.sfrpg.passiveFeats"),
        itemsActionType,
        passiveFeats,
        tokenId,
        itemsCategory
      );
    }

    this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
  }

  _buildSpellsCategory(token, actionList) {
    var itemList = token.actor.items.filter(
      (item) => item.type == "spell"
    );
    let tokenId = token.id;

    var categoryName = this.i18n("tokenActionHud.sfrpg.spellbook");
    var actionType = "spell";
    let category = this.initializeEmptyCategory(categoryName);

    var maxLevel = 6;

    for (let level = 0; level < maxLevel; level++) {
      category = this._addSubcategoryByLevel(
        `${this.i18n("tokenActionHud.level")} ` + level,
        level,
        actionType,
        itemList,
        tokenId,
        category
      );
    }

    this._combineCategoryWithList(actionList, categoryName, category);
  }

  /** @private */
  _buildSkillCategory(token, actor, actionList) {
    if (!actor.system.skills) return actionList;

    let category = this.initializeEmptyCategory("skills");
    let actionType = "skill";

    const actorSkills = Object.entries(actor.system.skills);
    const coreSkills = CONFIG.SFRPG.skills;

    let skillsActions = actorSkills
      .map((s) => {
        let key = s[0];
        let data = s[1];
        let name;
        if (key.startsWith("pro")) {
          name = coreSkills["pro"];
          if (!!data.subname) name += ` (${data.subname})`;
        } else {
          name = coreSkills[key];
        }

        let encodedValue = [actionType, token.id, key].join(
          this.delimiter
        );
        let icon = this._getClassSkillIcon(data.value);
        return { name: name, id: key, encodedValue: encodedValue, icon: icon };
      })
      .sort((a, b) => {
        return a.name
          .toUpperCase()
          .localeCompare(b.name.toUpperCase(), undefined, {
            sensitivity: "base",
          });
      });

    let skillsCategory = this.initializeEmptySubcategory();
    skillsCategory.actions = skillsActions;

    let skillsTitle = this.i18n("tokenActionHud.skills");
    this._combineSubcategoryWithCategory(category, skillsTitle, skillsCategory);
    this._combineCategoryWithList(actionList, skillsTitle, category);
  }

  /** @private */
  _buildAbilitiesCategory(token, actionList) {
    let category = this.initializeEmptyCategory("abilities");
    let actionType = "ability";

    let abilitiesActions = Object.entries(CONFIG.SFRPG.abilities).map((e) => {
      let name = e[1];
      let encodedValue = [actionType, token.id, e[0]].join(this.delimiter);
      return { name: name, id: e[0], encodedValue: encodedValue };
    });
    let abilitiesCategory = this.initializeEmptySubcategory();
    abilitiesCategory.actions = abilitiesActions;

    let abilitiesTitle = this.i18n("tokenActionHud.abilities");
    this._combineSubcategoryWithCategory(
      category,
      abilitiesTitle,
      abilitiesCategory
    );
    this._combineCategoryWithList(actionList, abilitiesTitle, category);
  }

  /** @private */
  _buildSavesCategory(token, actionList) {
    let category = this.initializeEmptyCategory("saves");
    let actionType = "save";

    let saveActions = Object.entries(CONFIG.SFRPG.saves).map((e) => {
      let name = e[1];
      let encodedValue = [actionType, token.id, e[0]].join(this.delimiter);
      return { name: name, id: e[0], encodedValue: encodedValue };
    });
    let savesCategory = this.initializeEmptySubcategory();
    savesCategory.actions = saveActions;

    let savesTitle = this.i18n("tokenActionHud.saves");
    this._combineSubcategoryWithCategory(category, savesTitle, savesCategory);
    this._combineCategoryWithList(actionList, savesTitle, category);
  }

  _buildUtilityCategory(token, actionList) {
    let category = this.initializeEmptyCategory("utility");
    let actionType = "utility";
    const utilityTitle = this.i18n("tokenActionHud.utility");
    const tokenId = token.id;

    // Combat Subcategory
    let combatSubcategory = this.initializeEmptySubcategory();

    // End Turn
    if (game.combat?.current?.tokenId === tokenId) {
      let endTurnValue = [actionType, tokenId, "endTurn"].join(this.delimiter);
      let endTurnAction = {
        id: "endTurn",
        encodedValue: endTurnValue,
        name: this.i18n("tokenActionHud.endTurn"),
      };
      combatSubcategory.actions.push(endTurnAction);
    }

    const combatTitle = this.i18n("tokenActionHud.combat");
    this._combineSubcategoryWithCategory(category, combatTitle, combatSubcategory);
    this._combineCategoryWithList(actionList, utilityTitle, category);
  }

  _addSubcategoryByActionType(
    subCategoryName,
    actionType,
    itemsActionType,
    itemList,
    tokenId,
    category
  ) {
    let subCategory = this.initializeEmptySubcategory();

    let itemsOfType = itemList.filter(
      (item) => item.system.actionType == actionType
    );
    subCategory.actions = itemsOfType.map((item) =>
      this._buildItemAction(tokenId, itemsActionType, item)
    );

    this._combineSubcategoryWithCategory(
      category,
      subCategoryName,
      subCategory
    );

    return category;
  }

  _addSubcategoryByItemList(
    subCategoryName,
    actionType,
    itemList,
    tokenId,
    category
  ) {
    let subCategory = this.initializeEmptySubcategory();

    subCategory.actions = itemList.map((item) =>
      this._buildItemAction(tokenId, actionType, item)
    );

    this._combineSubcategoryWithCategory(
      category,
      subCategoryName,
      subCategory
    );

    return category;
  }

  _addSubcategoryByType(
    subCategoryName,
    type,
    actionType,
    itemList,
    tokenId,
    category
  ) {
    let subCategory = this.initializeEmptySubcategory();

    let itemsOfType = itemList.filter((item) => item.type == type);
    subCategory.actions = itemsOfType.map((item) =>
      this._buildItemAction(tokenId, actionType, item)
    );

    this._combineSubcategoryWithCategory(
      category,
      subCategoryName,
      subCategory
    );

    return category;
  }

  _addSubcategoryByLevel(
    subCategoryName,
    level,
    actionType,
    itemList,
    tokenId,
    category
  ) {
    let subCategory = this.initializeEmptySubcategory();

    let itemsOfType = itemList.filter((item) => item.system.level === level);
    subCategory.actions = itemsOfType.map((item) => {
      let action = this._buildItemAction(tokenId, actionType, item);
      if (settings.get("showSpellInfo")) this._addSpellInfo(item, action);
      return action;
    });

    this._combineSubcategoryWithCategory(
      category,
      subCategoryName,
      subCategory
    );

    return category;
  }

  /** @private */
  _addSpellInfo(s, spell) {
    let data = s.data;

    if (data?.sr) spell.info2 += "Sr";

    if (data?.dismissible) spell.info2 += "D";

    if (data?.concentration) spell.info2 += "C";

    if (data?.save?.type) {
      let type = data.save.type;
      spell.info3 += type?.charAt(0).toUpperCase() + type?.slice(1);
    }
  }

  _buildItemAction(tokenId, actionType, item) {
    let encodedValue = [actionType, tokenId, item.id].join(this.delimiter);
    let img = this.getImage(item);
    let icon = this._getActionIcon(item.system.activation?.type);
    let result = {
      name: item.name,
      id: item.id,
      encodedValue: encodedValue,
      img: img,
      icon: icon,
    };

    result.info1 = this._getQuantityData(item);

    result.info2 = this._getUsesOrUsageData(item);

    result.info3 = this._getCapacityData(item);

    return result;
  }

  /** @private */
  _getQuantityData(item) {
    let result = "";
    if (item.system.quantity > 1) {
      result = item.system.quantity;
    }

    return result;
  }

  /** @private */
  _getUsesOrUsageData(item) {
    let result = "";

    let uses = item.system.uses;
    if (uses?.max || uses?.value) {
      result = uses.value ?? "";

      if (uses.max > 0) {
        result += `/${uses.max}`;
      }
      return result;
    }

    let usage = item.system.usage;
    if (usage?.value) {
      result = usage.value ?? "";

      if (usage.value > 0) {
        result += `/${usage.per}`;
      }
      return result;
    }

    return result;
  }

  /** @private */
  _getCapacityData(item) {
    let result = "";

    let capacity = item.system.capacity;
    if (!capacity) return result;

    result = capacity.value ?? "";
    if (!!capacity.max) result += `/${capacity.max}`;

    return result;
  }

  _getClassSkillIcon(level) {
    const icons = {
      3: '<i class="fas fa-check"></i>',
    };

    return icons[level];
  }

  _getActionIcon(action) {
    const icon = {
      //action: `<i class="fas fa-fist-raised"></i>`,
      move: `<i class="fas fa-shoe-prints"></i>`,
      swift: `<i class="fas fa-bolt"></i>`,
      full: `<i class="fas fa-circle"></i>`,
      other: `<i class="far fa-circle"></i>`,
      reaction: `<i class="fas fa-undo-alt"></i>`,
      special: `<i class="fas fa-atom"></i>`,
      min: `<i class="fas fa-hourglass-start"></i>`,
      hour: `<i class="fas fa-hourglass-half"></i>`,
      day: `<i class="fas fa-hourglass-end"></i>`,
    };
    return icon[action];
  }

  /** @private */
  _addStarshipWeapons(token, actor, actionList) {
    const itemType = "starshipWeapon";
    const weapons = actor.items.filter((i) => i.type === itemType); //.filter(w => w.system.mount.mounted && w.system.mount.activated);
    if (weapons.length === 0) return;

    const category = this.initializeEmptyCategory(itemType);

    const groupedWeapons = weapons.reduce((grouped, w) => {
      const groupName = w.system.mount.arc;
      if (!Object.hasOwn(grouped, groupName)) grouped[groupName] = [];

      grouped[groupName].push(w);

      return grouped;
    }, {});

    const actionType = "item";
    const order = ["forward", "starboard", "port", "aft", "turret"];
    order.forEach((mount) => {
      const groupWeapons = groupedWeapons[mount];
      if (!groupWeapons) return;

      const subcategory = this.initializeEmptySubcategory(mount);

      groupWeapons.forEach((a) => {
        const actionName = a.name;
        const encodedValue = [actionType, token.id, a.id].join(this.delimiter);
        const action = {
          name: actionName,
          encodedValue: encodedValue,
          id: a.id,
          img: this.getImage(a),
        };
        action.info1 = a.system.pcu ?? "";

        subcategory.actions.push(action);
      });

      const capitalMount = mount.charAt(0).toUpperCase() + mount.slice(1);
      const subName = this.i18n(
        "SFRPG.ShipSystems.StarshipArcs." + capitalMount
      );
      this._combineSubcategoryWithCategory(category, subName, subcategory);
    });

    var categoryName = this.i18n("tokenActionHud.weapons");
    this._combineCategoryWithList(actionList, categoryName, category);
  }

  /** @private */
  async _addCrewActions(token, actor, actionList) {
    if (!actor.useStarshipAction) return;

    const actionType = "crewAction";
    const category = this.initializeEmptyCategory(actionType);
    const actions = await game.packs
      .get("sfrpg.starship-actions")
      .getDocuments();

    const groupedActions = actions.reduce((grouped, a) => {
      const role = a.system.role;
      if (!Object.hasOwn(grouped, role)) grouped[role] = [];

      grouped[role].push(a);

      return grouped;
    }, {});

    const order = [
      "captain",
      "pilot",
      "gunner",
      "engineer",
      "scienceOfficer",
      "chiefMate",
      "magicOfficer",
      "openCrew",
      "minorCrew",
    ];

    order.forEach((role) => {
      const crew = actor.system.crew;
      const crewRole = crew[role];
      const npcRole = crew.npcData[role];

      if (!this._shouldShowCrewOptions(crew, crewRole, npcRole)) return;

      const groupActions = groupedActions[role];
      const subcategory = this.initializeEmptySubcategory(role);

      groupActions.forEach((a) => {
        const actionName = a.name;
        const encodedValue = [actionType, token.id, a.id].join(this.delimiter);
        const action = {
          name: actionName,
          encodedValue: encodedValue,
          id: a.id,
          img: this.getImage(a),
        };
        action.info1 = a.system.resolvePointCost ?? "";

        subcategory.actions.push(action);
      });

      if (crewRole) {
        if (crew.useNPCCrew) {
          subcategory.info1 = crew.npcData[role].numberOfUses;
        } else {
          subcategory.info1 =
            crewRole.limit > 0
              ? `${crewRole.actors.length}/${crewRole.limit}`
              : crewRole.actors.length;
        }
      }

      const capitalRole = role.charAt(0).toUpperCase() + role.slice(1);
      const subName = this.i18n("SFRPG.StarshipSheet.Role." + capitalRole);
      this._combineSubcategoryWithCategory(category, subName, subcategory);
    });

    const catName = this.i18n("tokenActionHud.sfrpg.crewActions");
    this._combineCategoryWithList(actionList, catName, category);
  }

  _shouldShowCrewOptions(crew, crewRole, npcRole) {
    if (!crewRole) return true;

    if (crewRole.actors?.length > 0 && !crew.useNPCCrew) return true;

    if (crew.useNPCCrew && npcRole?.numberOfUses > 0) return true;

    return false;
  }

  /** @private */
  _addShields(token, actor, actionList) {
    const actionType = "shields";
    const category = this.initializeEmptySubcategory(actionType);

    const shields = actor.system.attributes?.shields;
    if (!shields) return actionList;

    category.info1 = `${shields.value}/${shields.max}`;

    const sides = ["forward", "starboard", "aft", "port"];
    const amounts = [
      { name: "-10", value: "-10" },
      { name: "-5", value: "-5" },
      { name: "-1", value: "-1" },
      { name: "+1", value: "+1" },
      { name: "+5", value: "+5" },
      { name: "+10", value: "+10" },
    ];

    const quadrants = actor.system.quadrants;
    sides.forEach((side) => {
      const currShields = quadrants[side]["shields"];
      if (!currShields) return;

      const subcategory = this.initializeEmptySubcategory(side);
      subcategory.info1 = `${currShields.value}/${shields.limit}`;

      amounts.forEach((amount) => {
        const encodedValue = [
          actionType,
          token.id,
          `${side}.${amount.value}`,
        ].join(this.delimiter);
        const action = {
          name: amount.name,
          encodedValue: encodedValue,
          id: amount.value,
          cssClass: "shrink",
        };
        subcategory.actions.push(action);
      });

      const capitalSide = side.charAt(0).toUpperCase() + side.slice(1);
      const subName = this.i18n("SFRPG.StarshipSheet.Sides." + capitalSide);
      this._combineSubcategoryWithCategory(category, subName, subcategory);
    });

    const catName = this.i18n("tokenActionHud.sfrpg.shields");
    this._combineCategoryWithList(actionList, catName, category);
  }
}
