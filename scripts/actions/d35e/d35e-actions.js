import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerD35E extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  buildSystemActions(actionList, character, subcategoryIds) {
    const actor = character?.actor;

    if (!actor) {
      this._buildMultipleTokenActions(actionList);
      return actionList;
    }

    const inventorySubcategoryIds = subcategoryIds.filter(
      (subcategoryId) =>
        subcategoryId === "weapons" ||
        subcategoryId === "protections" ||
        subcategoryId === "consumables" ||
        subcategoryId === "spells" ||
        subcategoryId === "other"
    );

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "attacks"))
      this._buildAttacks(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "buffs"))
      this._buildBuffs(actionList, character);
    if (inventorySubcategoryIds) this._buildInventory(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "spells"))
      this._buildSpells(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "features"))
      this._buildFeatures(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._buildSkills(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "saves"))
      this._buildSaves(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "defenses"))
      this._buildDefenses(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "checks"))
      this._buildChecks(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "utility"))
      this._buildUtility(actionList, character);

    return actionList;
  }

  _buildMultipleTokenActions(actionList) {
    const actorId = "multi";
    const tokenId = "multi";
    actionList.actorId = actorId;
    actionList.tokenId = tokenId;
    const allowedTypes = ["character", "npc"];
    const actors = canvas.tokens.controlled
      .map((token) => token.actor)
      .filter((actor) => allowedTypes.includes(actor.type));

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "abilities"))
      this._addMultiAbilities(
        actionList,
        actorId,
        tokenId,
        "abilityCheck",
        "checks"
      );
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "saves"))
      this._addMultiSaves(actionList, actorId, tokenId, "abilitySave", "saves");
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._addMultiSkills(actionList, actorId, tokenId);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "utility"))
      this._addMultiTokenUtilities(actionList, actorId, tokenId, actors);

    return actionList;
  }

  // ATTACKS

  _buildAttacks(actionList, character) {
    const actor = character?.actor;
    const actionType = "attack";
    const subcategoryId = "attacks";

    let actions = [];

    const cmbActionType = "cmb";
    const cmbId = "cmb";
    const cmbName = this.i18n("tokenActionHud.d35e.grapple");
    const cmbEncodedValue = [cmbActionType, actorId, tokenId, cmbId].join(
      this.delimiter
    );
    let cmbAction = {
      id: cmbId,
      name: cmbName,
      encodedValue: cmbEncodedValue,
      selected: true,
    };

    actions.push(cmbAction);

    // WEAPON ATTACKS
    const validAttacks = actor.items.filter((item) => item.type === "attack");
    const sortedAttacks = this.sortItems(validAttacks);
    const weaponActions = sortedAttacks.map((attack) =>
      this._getAction(character, actionType, attack)
    );

    actions.push(weaponActions);

    // FULL ATTACKS
    const validFullAttacks = actor.items.filter(
      (item) => item.type === "full-attack"
    );
    const sortedFullAttacks = this.sortItems(validFullAttacks);
    const fullAttackActions = sortedFullAttacks.map((fullAttack) =>
      this._getAction(character, actionType, fullAttack)
    );

    actions.push(fullAttackActions);

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  // BUFFS

  _buildBuffs(actionList, character) {
    const actor = character?.actor;
    const actionType = "buff";
    const subcategoryId = "buffs";

    const validBuffs = actor.items.filter((item) => item.type === "buff");
    const sortedBuffs = this.sortItems(validBuffs);
    const actions = sortedBuffs.map((buff) => {
      const action = this._getAction(character, actionType, buff);
      const active = buff.system.active ? " active" : "";
      action.cssClass = `toggle${active}`;
      return action;
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  // INVENTORY

  _buildInventory(actionList, character, inventorySubcategoryIds) {
    const actor = character?.actor;
    const validItems = actor.items.filter((item) => item.system.quantity > 0);
    const sortedItems = this.sortItems(validItems);
    const equippedItems = sortedItems.filter(
      (item) => item.type !== "consumable" && item.system.equipped
    );

    // WEAPONS
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "weapons"
      )
    ) {
      const weapons = equippedItems.filter((item) => item.type == "weapon");
      this._buildItems(actionList, character, weapons, "weapons");
    }
    // EQUIPMENT
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "equipment"
      )
    ) {
      const equipment = equippedItems.filter(
        (item) => item.type == "equipment"
      );
      this._buildItems(actionList, character, equipment, "equipment");
    }

    // OTHER
    if (
      inventorySubcategoryIds.some((subcategoryId) => subcategoryId === "other")
    ) {
      const other = equippedItems.filter(
        (item) => item.type != "weapon" && item.type != "equipment"
      );
      this._buildItems(actionList, character, other, "other");
    }

    const allConsumables = sortedItems.filter(
      (item) => item.type == "consumable"
    );

    // CONSUMABLES
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "consumables"
      )
    ) {
      const unexpendedConsumables = this._filterExpendedItems(allConsumables);
      const consumables = unexpendedConsumables.filter(
        (consumable) =>
          (consumable.system.uses?.value &&
            consumable.system.uses?.value >= 0) ||
          (consumable.system.uses?.max && consumable.system.uses?.max >= 0)
      );
      this._buildItems(actionList, character, consumables, "consumables");
    }

    // INCONSUMABLES
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "inconsumables"
      )
    ) {
      const inconsumables = allConsumables.filter(
        (consumable) =>
          !(consumable.system.uses?.max || consumable.system.uses?.value) &&
          consumable.system.consumableType != "ammo"
      );
      this._buildItems(actionList, character, inconsumables, "inconsumables");
    }

    // TOOLS
    if (
      inventorySubcategoryIds.some((subcategoryId) => subcategoryId === "tools")
    ) {
      const tools = validItems.filter((item) => item.type === "tool");
      this._buildItems(actionList, character, tools, "tools");
    }
  }

  // SPELLS

  _buildSpells(actionList, character) {
    const actor = character?.actor;
    let validSpells = actor.items.filter((item) => item.type === "spell");
    validSpells = this._filterExpendedItems(validSpells);

    this._categoriseSpells(actionList, character, validSpells);
  }

  /** @private */
  _categoriseSpells(actionList, character, spells) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actor = character?.actor;
    const actionType = "spell";
    const categoryId = "spells";

    let subcategoryList = [];

    // Get Spellbooks
    const spellbooks = [
      ...new Set(spells.map((spell) => spell.system.spellbook)),
    ].sort();

    // Build Concentration Actions
    let concentrationActions = [];
    const concentrationActionType = "concentration";
    spellbooks.forEach((spellbook) => {
      const id = spellbook;
      const name = spellbook.charAt(0).toUpperCase() + spellbook.slice(1);
      const encodedValue = [concentrationActionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const concentrationAction = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      };
      concentrationActions.push(concentrationAction);
    });

    // Create Concentration Subcategory
    const concentrationSubcategoryId = "concentration";
    const concentrationSubcategoryName = this.i18n(
      "tokenActionHud.d35e.concentration"
    );
    const concentrationSubcategory = this.initializeEmptySubcategory(
      concentrationSubcategoryId,
      categoryId,
      concentrationSubcategoryName
    );

    this.addToSubcategoriesList(
      subcategoryList,
      concentrationSubcategoryId,
      concentrationSubcategory,
      concentrationActions
    );

    // Build Spells
    spellbooks.forEach((spellbook) => {
      const isSpontaneous =
        actor.system.attributes.spells.spellbooks[spellbook].spontaneous;
      const spellbookName =
        spellbook.charAt(0).toUpperCase() + spellbook.slice(1);

      const spellbookSpells = spells
        .filter((spell) => spell.system.spellbook === spellbook)
        .sort((a, b) =>
          a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {
            sensitivity: "base",
          })
        )
        .sort((a, b) => a.system.level - b.system.level);

      const spellsByLevel = spellbookSpells.reduce((arr, spellbookSpell) => {
        if (!arr.hasOwnProperty(spellbookSpell.system.level)) {
          arr[spellbookSpell.system.level] = [];
        }
        arr[spellbookSpell.system.level].push(spellbookSpell);

        return arr;
      }, {});

      let firstLevelOfBook = true;

      Object.entries(spellsByLevel).forEach((level) => {
        const spellLevelId = `spells_${level[0]}`;
        let spellLevelName =
          level[0] > 0
            ? `${this.i18n("tokenActionHud.level")} ${level[0]}`
            : this.i18n("tokenActionHud.cantrips");

        if (firstLevelOfBook) {
          spellLevelName = `${spellbookName} - ${spellLevelName}`;
          firstLevelOfBook = false;
        }

        const subcategory = this.initializeEmptySubcategory(
          spellLevelId,
          categoryId,
          spellLevelName
        );

        // Add Spell Slots
        const spellInfo =
          actor.system.attributes?.spells?.spellbooks[spellbook]["spells"][
            "spell" + level[0]
          ];
        if (spellInfo && spellInfo.max > 0) {
          const categoryInfo = `${
            spellInfo.value ? spellInfo.value + "/" : ""
          }${spellInfo.max}`;
          subcategory.info1 = categoryInfo;
        }

        // Build Spell Actions
        let actions = [];
        level[1].forEach((spell) => {
          if (!this._isSpellCastable(actor, spell)) return;
          const id = spell.id;
          const name = spell.name.charAt(0).toUpperCase() + spell.name.slice(1);
          const encodedValue = [actionType, actorId, tokenId, id].join(
            this.delimiter
          );
          let action = {
            id: id,
            name: name,
            encodedValue: encodedValue,
            img: this.getImage(spell),
            info2: "",
          };
          this._addSpellInfo(spell, isSpontaneous, action);
          actions.push(action);
        });

        this.addToSubcategoriesList(
          subcategoryList,
          spellLevelId,
          subcategory,
          actions
        );
      });
    });

    this.addSubcategoriesToActionList(actionList, subcategoryList, "spells");
  }

  /** @private */
  _addSpellInfo(spell, isSpontaneous, spellAction) {
    let c = spell.system.components;

    if (!isSpontaneous && spell.system.preparation) {
      let prep = spell.system.preparation;
      if (prep.maxAmount || prep.preparedAmount)
        spellAction.info1 = `${prep.preparedAmount}/${prep.maxAmount}`;
    }

    if (c?.verbal)
      spellAction.info2 += this.i18n("D35E.SpellComponentVerbal")
        .charAt(0)
        .toUpperCase();

    if (c?.somatic)
      spellAction.info2 += this.i18n("D35E.SpellComponentSomatic")
        .charAt(0)
        .toUpperCase();

    if (c?.material)
      spellAction.info2 += this.i18n("D35E.SpellComponentMaterial")
        .charAt(0)
        .toUpperCase();

    if (c?.focus)
      spellAction.info3 = this.i18n("D35E.SpellComponentFocus")
        .charAt(0)
        .toUpperCase();
  }

  /** @private */
  _isSpellCastable(actor, spell) {
    const spellbook = spell.system.spellbook;
    const isSpontaneous =
      actor.system.attributes.spells.spellbooks[spellbook].spontaneous;

    if (spell.system.atWill) return true;

    if (isSpontaneous) return true;

    if (spell.system.preparation.preparedAmount === 0) return false;

    return true;
  }

  // FEATURES
  _buildFeatures(actionList, character) {
    const actor = character?.actor;
    let feats = actor.items.filter((item) => item.type == "feat");
    feats = this.sortItems(feats);
    this._categoriseFeatures(actionList, character, feats);
  }

  /** @private */
  _categoriseFeatures(actionList, character, feats) {
    const categoryId = "features";

    let subcategoryList = [];
    const activeId = "features_active";
    const passiveId = "features_passive";
    let activeSubcategory = this.initializeEmptySubcategory(
      activeId,
      categoryId,
      this.i18n("tokenActionHud.active")
    );
    let passiveSubcategory = this.initializeEmptySubcategory(
      passiveId,
      categoryId,
      this.i18n("tokenActionHud.passive")
    );
    let activeActions = [];
    let passiveActions = [];

    let dispose = feats.reduce(
      function (dispose, feat) {
        const activationType = feat.system.activation.type;
        const actionType = "feat";
        const action = this._getAction(character, actionType, feat);

        if (
          !activationType ||
          activationType === "" ||
          activationType === "passive"
        ) {
          passiveActions.push(feat);
          return;
        }

        activeActions.push(feat);

        return;
      }.bind(this),
      {}
    );

    this.addToSubcategoriesList(
      subcategoryList,
      activeId,
      activeSubcategory,
      activeActions
    );

    if (!settings.get("ignorePassiveFeats")) {
      this.addToSubcategoriesList(
        subcategoryList,
        passiveId,
        passiveSubcategory,
        passiveActions
      );
    }

    this.addSubcategoriesToActionList(
      actionList,
      subcategoryList,
      categoryId
    );
  }

  // SKILLS

  _buildSkills(actionList, character) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actor = character?.actor;
    const actionType = "skill";
    const subcategoryId = "skills";
    const abbr = settings.get("abbreviateSkills");
    const skills = actor.system.skills;

    let allSkills = new Set();

    Object.entries(skills).forEach((_skill) => {
      let skill = duplicate(_skill);
      if (skill[0].startsWith("skill")) skill[1].isCustomSkill = true;
      if (skill[1].rt && !skill[1].rank && !skill[1].subSkills) return;
      if (!skill[1].subSkills) allSkills.add(skill);

      if (skill[1].subSkills) {
        Object.entries(s[1].subSkills).forEach((subSkill) => {
          if (subSkill[1].rt && !subSkill[1].rank) return;
          subSkill[1].isCustomSkill = true;
          subSkill[1].mainSkill = s[0];
          subSkill[1].name = `${CONFIG.D35E.skills[skill[0]]} - ${
            subSkill[1].name
          }`;
          allSkills.add(subSkill);
        });
      }
    });

    let actions = [...allSkills].map((skill) => {
      let id = skill[0];
      let name = abbr ? id : CONFIG.D35E.skills[id];
      const data = skill[1];

      if (data.isCustomSkill || !name) {
        id = `${data.mainSkill}.subSkills.${id}`;
        name = data.name ?? "?";
      }

      name = name.charAt(0).toUpperCase() + name.slice(1);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const info1 = this._getSkillRankInfo(data.rank);
      const info2 = [data.rt ? "RT" : "", data.acp ? "ACP" : ""]
        .filter((a) => a !== "")
        .join(",");
      return {
        id: id,
        name: name,
        encodedValue: encodedValue,
        info1: info1,
        info2: info2,
        selected: true,
      };
    });

    actions = actions.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _getSkillRankInfo(rank) {
    if (rank <= 0) return "";

    return `R${rank}`;
  }

  // SAVES

  _buildSaves(actionList, character) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "abilitySave";
    const subcategoryId = "saves";
    const abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(CONFIG.D35E.savingThrows).map((savingThrow) => {
      const id = savingThrow[0];
      let name = abbr ? savingThrow[0] : savingThrow[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
      return { 
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true
      };
    });
    actions = actions.filter((a) => !!a);

    this.addActionsToActionList(actionList, actions, subcategoryId)
  }

  // DEFENSES

  _buildDefenses(actionList, character) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "defenses";
    const subcategoryId = "defenses";
    const id = "defenses";
    const name = this.i18n("tokenActionHud.defenses");
    const encodedValue = [actionType, actorId,  tokenId, id].join(
      this.delimiter
    );
    const actions = [
      {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true
      },
    ];
    
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  // CHECKS

  _buildChecks(actionList, character) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "abilityCheck";
    const subcategoryId = "checks";
    const abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(CONFIG.D35E.abilities).map((ability) => {
      if (abilities[ability[0]].value === 0) return;
      const id = ability[0];
      let name = abbr ? ability[0] : ability[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
      return { 
        id: id, 
        name: name,
        encodedValue: encodedValue,
        selected: tru
      };
    });
    actions = actions.filter((a) => !!a);

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildUtility(actionList, character) {
    const actor  = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "utility";
    const subcategoryId = "rests";

    let actions = [];

    if (actor.type === "character") {
      const id = "rest";
      const name = this.i18n("tokenActionHud.rest");
      const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true
      }
      actions.push(action);
    }

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _addMultiSkills(list, tokenId) {
    let result = this.initializeEmptyCategory("skills");
    let actionType = "skill";

    let abbr = settings.get("abbreviateSkills");

    let skillsActions = Object.entries(CONFIG.D35E.skills).map((e) => {
      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);
      return { name: name, id: e[0], encodedValue: encodedValue };
    });
    let skillsCategory = this.initializeEmptySubcategory();
    skillsCategory.actions = skillsActions;

    let skillsTitle = this.i18n("tokenActionHud.skills");
    this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);
    this._combineCategoryWithList(list, skillsTitle, result, true);
  }


  _addMultiAbilities(list, tokenId, categoryId, categoryName, actionType) {
    let cat = this.initializeEmptyCategory(categoryId);

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(CONFIG.D35E.abilities).map((e) => {
      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);

      return { name: name, id: e[0], encodedValue: encodedValue };
    });
    let abilityCategory = this.initializeEmptySubcategory();
    abilityCategory.actions = actions;

    this._combineSubcategoryWithCategory(cat, categoryName, abilityCategory);
    this._combineCategoryWithList(list, categoryName, cat, true);
  }

  _addMultiSaves(list, tokenId, categoryId, categoryName, actionType) {
    let cat = this.initializeEmptyCategory(categoryId);
    let savesCategory = this.initializeEmptySubcategory();

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(CONFIG.D35E.savingThrows).map((e) => {
      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);

      return { name: name, id: e[0], encodedValue: encodedValue };
    });

    savesCategory.actions = actions.filter((a) => !!a);

    this._combineSubcategoryWithCategory(cat, categoryName, savesCategory);
    this._combineCategoryWithList(list, categoryName, cat, true);
  }

  /** @private */
  _addMultiTokenUtilities(list, tokenId, actors) {
    let category = this.initializeEmptyCategory("utility");
    let actionType = "utility";

    let rests = this.initializeEmptySubcategory();

    if (actors.every((a) => a.type === "character")) {
      let longRestValue = [actionType, tokenId, "rest"].join(this.delimiter);
      rests.actions.push({
        id: "rest",
        encodedValue: longRestValue,
        name: this.i18n("tokenActionHud.rest"),
      });
    }

    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.rests"),
      rests
    );
  }

  /** @private */
  _buildItems(actionList, character, items, subcategoryId) {
    const actionType = "item";
    const actions = items.map((item) =>
      this._getAction(character, actionType, item)
    );

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** @private */
  _getAction(character, actionType, entity) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const id = entity.id;
    let name = this._getItemName(entity);
    if (
      entity?.system?.recharge &&
      !entity?.system?.recharge?.charged &&
      entity?.system?.recharge?.value
    ) {
      name += ` (${this.i18n("tokenActionHud.recharge")})`;
    }
    const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
    const img = this.getImage(entity);
    const icon = this._getActionIcon(entity?.data?.activation?.type);
    const info1 = this._getQuantityData(entity);
    const info2 = this._getUsesData(entity);
    const info3 = this._getConsumeData(entity, actor);
    const action = {
      id: id,
      name: name,
      encodedValue: encodedValue,
      icon: icon,
      img: img,
      info1: info1,
      info2: info2,
      info3: info3,
      selected: true
    };

    return action;
  }

  _getItemName(item) {
    let name;

    if (item.system.identified || game.user.isGM)
      name = item.system.identifiedName;
    else name = item.system.unidentified?.name;

    if (!name) name = item.name;

    return name;
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
  _getUsesData(item) {
    let result = "";

    let uses = item.system.uses;
    if (!uses) return result;

    if (!(uses.max || uses.value)) return result;

    result = uses.value ?? 0;

    if (uses.max > 0) {
      result += `/${uses.max}`;
    }

    return result;
  }

  /** @private */
  _getConsumeData(item, actor) {
    let result = "";

    let consumeType = item.system.consume?.type;
    if (consumeType && consumeType !== "") {
      let consumeId = item.system.consume.target;
      let parentId = consumeId.substr(0, consumeId.lastIndexOf("."));
      if (consumeType === "attribute") {
        let target = getProperty(actor, `system.${consumeId}`);

        if (target) {
          let parent = getProperty(actor, `system.${parentId}`);
          result = target;
          if (!!parent.max) result += `/${parent.max}`;
        }
      }

      if (consumeType === "charges") {
        let consumeId = item.system.consume.target;
        let target = actor.items.get(consumeId);
        let uses = target?.system.uses;
        if (uses?.value) {
          result = uses.value;
          if (uses.max) result += `/${uses.max}`;
        }
      }

      if (!(consumeType === "attribute" || consumeType === "charges")) {
        let consumeId = item.system.consume.target;
        let target = actor.items.get(consumeId);
        let quantity = target?.system.quantity;
        if (quantity) {
          result = quantity;
        }
      }
    }

    return result;
  }

  _filterExpendedItems(items) {
    if (settings.get("showEmptyItems")) return items;

    return items.filter((i) => {
      let uses = i.system.uses;
      // Assume something with no uses is unlimited in its use.
      if (!uses) return true;

      // if it has a max but value is 0, don't return.
      if (uses.max > 0 && !uses.value) return false;

      return true;
    });
  }

  /** @private */
  _getProficiencyIcon(level) {
    const icons = {
      0: "",
      0.5: '<i class="fas fa-adjust"></i>',
      1: '<i class="fas fa-check"></i>',
      2: '<i class="fas fa-check-double"></i>',
    };
    return icons[level];
  }

  _getActionIcon(action) {
    const img = {
      //standard: `<i class="fas fa-fist-raised"></i>`,
      immediate: `<i class="fas fa-bolt"></i>`,
      swift: `<i class="fas fa-plus"></i>`,
      full: `<i class="far fa-circle"></i>`,
      round: `<i class="fas fa-hourglass-start"></i>`,
      minute: `<i class="fas fa-hourglass-half"></i>`,
      hour: `<i class="fas fa-hourglass-end"></i>`,
    };
    return img[action];
  }
}
