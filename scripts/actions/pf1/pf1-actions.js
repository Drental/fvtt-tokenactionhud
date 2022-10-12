import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerPf1 extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  buildSystemActions(actionList, character, subcategoryIds) {
    let result = this.initializeEmptyActionList();

    if (multipleTokens) {
      this._buildMultipleTokenList(result);
      return result;
    }

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    result.actorId = actor.id;

    this._addAttacksList(result, actor, tokenId);
    this._addBuffsList(result, actor, tokenId);
    this._addItemsList(result, actor, tokenId);
    this._addSpellBooksList(result, actor, tokenId);
    this._addFeaturesList(result, actor, tokenId);
    this._addSkillsList(result, actor, tokenId);
    this._addSavesList(result, actor, tokenId);
    this._addChecksList(result, actor, tokenId);
    this._addConditionsList(result, actor, tokenId);
    this._addUtilityList(result, actor, tokenId);

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  _buildMultipleTokenList(list) {
    list.tokenId = "multi";
    list.actorId = "multi";

    const allowedTypes = ["npc", "character"];
    let actors = canvas.tokens.controlled
      .map((t) => t.actor)
      .filter((a) => allowedTypes.includes(a.type));

    const tokenId = list.tokenId;

    this._addMultiSkills(list, tokenId);

    let savesTitle = this.i18n("tokenActionHud.saves");
    let checksTitle = this.i18n("tokenActionHud.checks");

    this._addMultiSaves(list, tokenId, "saves", savesTitle, "abilitySave");
    this._addMultiAbilities(
      list,
      tokenId,
      "checks",
      checksTitle,
      "abilityCheck"
    );

    this._addMultiTokenUtilities(list, tokenId, actors);
  }

  _addAttacksList(result, actor, tokenId) {
    if (settings.get("showAttacksCategory") === false) return;
    let attacks = this._getAttacksList(actor, tokenId);
    let attackTitle = this.i18n("tokenActionHud.attack");
    this._combineCategoryWithList(result, attackTitle, attacks);
  }

  _addBuffsList(result, actor, tokenId) {
    if (settings.get("showBuffsCategory") === false) return;
    let buffs = this._getBuffsList(actor, tokenId);
    let buffsTitle = this.i18n("tokenActionHud.pf1.buffs");
    this._combineCategoryWithList(result, buffsTitle, buffs);
  }

  _addConditionsList(result, actor, tokenId) {
    if (settings.get("showConditionsCategory") === false) return;
    let conditionsTitle = this.i18n("tokenActionHud.conditions");
    let conditionsCategory = this._getConditionsList(
      tokenId,
      actor.system.attributes.conditions,
      "conditions",
      conditionsTitle,
      "condition"
    );
    this._combineCategoryWithList(result, conditionsTitle, conditionsCategory);
  }

  _addItemsList(result, actor, tokenId) {
    if (settings.get("showInventoryCategory") === false) return;
    let items = this._getItemList(actor, tokenId);
    let itemsTitle = this.i18n("tokenActionHud.inventory");
    this._combineCategoryWithList(result, itemsTitle, items);
  }

  _addSpellBooksList(result, actor, tokenId) {
    if (settings.get("showSpellsCategory") === false) return;
    let spells = this._getSpellsList(actor, tokenId);
    spells.forEach(s => {
      this._combineCategoryWithList(result, s.label, s.category);
    });
  }

  _addFeaturesList(result, actor, tokenId) {
    if (settings.get("showFeaturesCategory") === false) return;
    let feats = this._getFeaturesList(actor, tokenId);
    let featsTitle = this.i18n("tokenActionHud.features");
    this._combineCategoryWithList(result, featsTitle, feats);
  }

  _addSkillsList(result, actor, tokenId) {
    if (settings.get("showSkillsCategory") === false) return;
    let skills = this._getSkillsList(actor.system.skills, tokenId);
    let skillsTitle = this.i18n("tokenActionHud.skills");
    this._combineCategoryWithList(result, skillsTitle, skills);
  }

  _addSavesList(result, actor, tokenId) {
    if (settings.get("showSavesCategory") === false) return;
    let savesTitle = this.i18n("tokenActionHud.saves");
    let saves = this._getSavesList(
      tokenId,
      actor,
      "saves",
      savesTitle,
      "abilitySave"
    );
    this._combineCategoryWithList(result, savesTitle, saves);
  }

  _addChecksList(result, actor, tokenId) {
    if (settings.get("showChecksCategory") === false) return;
    let checksTitle = this.i18n("tokenActionHud.checks");
    let checks = this._getAbilityList(
      tokenId,
      actor.system.abilities,
      "checks",
      checksTitle,
      "abilityCheck"
    );
    this._combineCategoryWithList(result, checksTitle, checks);
  }

  _addUtilityList(result, actor, tokenId) {
    if (settings.get("showUtilityCategory") === false) return;
    let utility = this._getUtilityList(actor, tokenId);
    let utilityTitle = this.i18n("tokenActionHud.utility");
    this._combineCategoryWithList(result, utilityTitle, utility);
  }

  /** @private */
  _getAttacksList(actor, tokenId) {
    let validAttacks = actor.items.filter((i) => i.type === "attack");
    let sortedAttacks = this.sortItems(validAttacks);
    let actionType = "attack";

    let result = this.initializeEmptyCategory("attacks");

    let cmbMacro = "cmb";
    let cmbName = this.i18n("tokenActionHud.pf1e.cmb");
    let cmbValue = [cmbMacro, tokenId, cmbMacro].join(this.delimiter);
    let cmbAction = { name: cmbName, encodedValue: cmbValue, id: cmbMacro };

    let babMacro = "bab";
    let babName = this.i18n("tokenActionHud.pf1e.bab");
    let babValue = [babMacro, tokenId, babMacro].join(this.delimiter);
    let babAction = { name: babName, encodedValue: babValue, id: babMacro };

    let bonusCat = this.initializeEmptySubcategory();
    bonusCat.actions = Array.of(cmbAction, babAction);
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.pf1.bonuses"),
      bonusCat
    );

    let meleeMacro = "melee";
    let meleeName = this.i18n("tokenActionHud.melee");
    let meleeValue = [meleeMacro, tokenId, meleeMacro].join(this.delimiter);
    let meleeAction = {
      name: meleeName,
      encodedValue: meleeValue,
      id: meleeMacro,
    };

    let rangedMacro = "ranged";
    let rangedName = this.i18n("tokenActionHud.ranged");
    let rangedValue = [rangedMacro, tokenId, rangedMacro].join(this.delimiter);
    let rangedAction = {
      name: rangedName,
      encodedValue: rangedValue,
      id: rangedMacro,
    };

    let weaponActions = sortedAttacks.map((w) =>
      this._buildItem(tokenId, actor, actionType, w)
    );
    let weaponsCat = this.initializeEmptySubcategory();

    weaponActions.unshift(rangedAction);
    weaponActions.unshift(meleeAction);

    weaponsCat.actions = weaponActions;
    let weaponsTitle = this.i18n("tokenActionHud.attack");

    this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);

    return result;
  }

  /** @private */
  _getBuffsList(actor, tokenId) {
    let validBuff = actor.items
      .filter((i) => i.type === "buff");
    let sortedBuffs = this.sortItems(validBuff);
    let actionType = "buff";

    let buffActions = sortedBuffs.map((w) => {
      var action = this._buildItem(tokenId, actor, actionType, w);
      action.cssClass = w.isActive ? "active" : "";
      return action;
    });
    let buffCat = this.initializeEmptySubcategory();
    buffCat.actions = buffActions;
    let buffTitle = this.i18n("tokenActionHud.pf1.buffs");

    let result = this.initializeEmptyCategory("buffs");
    this._combineSubcategoryWithCategory(result, buffTitle, buffCat);

    return result;
  }

  /** ITEMS **/

  /** @private */
  _getItemList(actor, tokenId) {
    let validItems = actor.items
      .filter((i) => i.system.quantity > 0);
    let sortedItems = this.sortItems(validItems);
    let actionType = "item";

    let equipped = sortedItems.filter(
      (i) => i.type !== "consumable" && i.system.equipped
    );

    let weapons = equipped.filter((i) => i.type == "weapon");
    let weaponActions = weapons.map((w) =>
      this._buildItem(tokenId, actor, actionType, w)
    );
    let weaponsCat = this.initializeEmptySubcategory();
    weaponsCat.actions = weaponActions;

    let equipment = equipped.filter((i) => i.type == "equipment");
    let equipmentActions = equipment.map((e) =>
      this._buildItem(tokenId, actor, actionType, e)
    );
    let equipmentCat = this.initializeEmptySubcategory();
    equipmentCat.actions = equipmentActions;

    let other = equipped.filter(
      (i) => i.type != "weapon" && i.type != "equipment"
    );
    let otherActions = other.map((o) =>
      this._buildItem(tokenId, actor, actionType, o)
    );
    let otherCat = this.initializeEmptySubcategory();
    otherCat.actions = otherActions;

    let allConsumables = sortedItems.filter((i) => i.type == "consumable");

    let expendedFiltered = this._filterExpendedItems(allConsumables);
    let consumable = expendedFiltered.filter(
      (c) =>
        (c.system.uses?.value && c.system.uses?.value >= 0) ||
        (c.system.uses?.max && c.system.uses?.max >= 0)
    );
    let consumableActions = consumable.map((c) =>
      this._buildItem(tokenId, actor, actionType, c)
    );
    let consumablesCat = this.initializeEmptySubcategory();
    consumablesCat.actions = consumableActions;

    let inconsumable = allConsumables.filter(
      (c) =>
        !(c.system.uses?.max || c.system.uses?.value) &&
        c.system.consumableType != "ammo"
    );
    let incomsumableActions = inconsumable.map((i) =>
      this._buildItem(tokenId, actor, actionType, i)
    );
    let inconsumablesCat = this.initializeEmptySubcategory();
    inconsumablesCat.actions = incomsumableActions;

    let tools = validItems.filter((t) => t.type === "tool");
    let toolsActions = tools.map((i) =>
      this._buildItem(tokenId, actor, actionType, i)
    );
    let toolsCat = this.initializeEmptySubcategory();
    toolsCat.actions = toolsActions;

    let weaponsTitle = this.i18n("tokenActionHud.weapons");
    let equipmentTitle = this.i18n("tokenActionHud.equipment");
    let otherTitle = this.i18n("tokenActionHud.other");
    let consumablesTitle = this.i18n("tokenActionHud.consumables");
    let incomsumablesTitle = this.i18n("tokenActionHud.pf1.inconsumables");
    let toolsTitle = this.i18n("tokenActionHud.tools");

    let result = this.initializeEmptyCategory("inventory");

    this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
    this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);
    this._combineSubcategoryWithCategory(result, otherTitle, otherCat);
    this._combineSubcategoryWithCategory(
      result,
      consumablesTitle,
      consumablesCat
    );
    this._combineSubcategoryWithCategory(
      result,
      incomsumablesTitle,
      inconsumablesCat
    );
    this._combineSubcategoryWithCategory(result, toolsTitle, toolsCat);

    return result;
  }

  /** SPELLS **/

  /** @private */
  _getSpellsList(actor, tokenId) {
    let validSpells = actor.items
      .filter((i) => i.type === "spell");
    validSpells = this._filterExpendedItems(validSpells);

    let spells = this._categoriseSpells(actor, tokenId, validSpells);

    return spells;
  }

  /** @private */
  _categoriseSpells(actor, tokenId, spells) {
    let spellResults = [];
    const actionType = "spell";

    const spellbookIds = [...new Set(spells.map((i) => i.system.spellbook))].sort();

    spellbookIds.forEach((sbId) => {
      const currentSpellbookCategory = this.initializeEmptySubcategory(`spells-${sbId}`);
      const checksCategory = this.initializeEmptySubcategory("concentration", "tokenActionHud.checks");

      const spellbook = actor.system.attributes.spells.spellbooks[sbId];
      const isSpontaneous = spellbook.spontaneous;

      const toUpperFirstChar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

      // this follows the same logic as the spellbook display tab in PF1 - so this pairs the rolls/spells directly to the character sheet
      let spellbookName = spellbook.altName || toUpperFirstChar(spellbook.class) || toUpperFirstChar(sbId);

      checksCategory.actions.push(
        this._createConcentrationAction(tokenId, sbId, this.i18n("tokenActionHud.pf1.concentration"))
      );
      checksCategory.actions.push(
        this._createCasterlevelCheckAction(tokenId, sbId, this.i18n("tokenActionHud.pf1.casterlevel"))
      );

      const sbSpells = spells
        .filter((s) => s.system.spellbook === sbId)
        .sort((a, b) =>
          a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {
            sensitivity: "base",
          })
        )
        .sort((a, b) => a.system.level - b.system.level);

      const spellsByLevel = sbSpells.reduce((arr, s) => {
        if (!arr.hasOwnProperty(s.system.level)) arr[s.system.level] = [];

        arr[s.system.level].push(s);

        return arr;
      }, {});

      Object.entries(spellsByLevel).forEach((level) => {
        var category = this.initializeEmptySubcategory();

        var categoryName =
          level[0] > 0
            ? `${this.i18n("tokenActionHud.level")} ${level[0]}`
            : this.i18n("tokenActionHud.cantrips");
        var spellInfo =
          actor.system.attributes?.spells?.spellbooks[sbId]["spells"][
          "spell" + level[0]
          ];
        if (spellInfo && spellInfo.max > 0) {
          var categoryInfo = `${spellInfo.value}/${spellInfo.max}`;
          category.info1 = categoryInfo;
        }

        level[1].forEach((spell) => {
          if (!this._isSpellCastable(actor, spell)) return;

          let name = spell.name;
          name = name.charAt(0).toUpperCase() + name.slice(1);
          let id = spell._id;
          let encodedValue = [actionType, tokenId, id].join(this.delimiter);
          var action = {
            name,
            id,
            encodedValue,
            info2: "",
          };
          action.img = this.getImage(spell);
          this._addSpellInfo(spell, isSpontaneous, action);

          category.actions.push(action);
        });

        this._combineSubcategoryWithCategory(currentSpellbookCategory, categoryName, category);
      });

      if (checksCategory.actions?.length > 0) {
        currentSpellbookCategory.subcategories.unshift(checksCategory);
      }

      spellResults.push({ label: spellbookName, category: currentSpellbookCategory });
    });

    return spellResults;
  }

  /** @private */
  _addSpellInfo(spell, isSpontaneous, spellAction) {
    let c = spell.system.components;

    if (!isSpontaneous && spell.system.preparation) {
      let prep = spell.system.preparation;
      if (prep.maxAmount)
        spellAction.info1 = `${prep.preparedAmount}/${prep.maxAmount}`;
    }

    if (c?.verbal)
      spellAction.info2 += this.i18n("PF1.SpellComponentVerbal")
        .charAt(0)
        .toUpperCase();

    if (c?.somatic)
      spellAction.info2 += this.i18n("PF1.SpellComponentSomatic")
        .charAt(0)
        .toUpperCase();

    if (c?.material)
      spellAction.info2 += this.i18n("PF1.SpellComponentMaterial")
        .charAt(0)
        .toUpperCase();

    if (c?.focus)
      spellAction.info3 = this.i18n("PF1.SpellComponentFocus")
        .charAt(0)
        .toUpperCase();
  }

  /** @private */
  _isSpellCastable(actor, spell) {
    const spellbook = spell.system.spellbook;
    const isSpontaneous =
      actor.system.attributes.spells.spellbooks[spellbook].spontaneous;

    if (actor.type !== "character") return true;

    if (spell.system.atWill) return true;

    if (isSpontaneous) {
      if (spell.system.preparation.spontaneousPrepared) {
        return true;
      } else {
        return false;
      }
    } 

    if (spell.system.preparation.preparedAmount === 0) return false;

    return true;
  }

  _createCasterlevelCheckAction(tokenId, spellbookId, spellbookName) {
    let casterLevelMacro = "casterLevel";
    let encodedValue = [casterLevelMacro, tokenId, spellbookId.toLowerCase()].join(
      this.delimiter
    );
    return { name: spellbookName, encodedValue, id: casterLevelMacro };
  }

  _createConcentrationAction(tokenId, spellbookId, spellbookName) {
    let concentrationMacro = "concentration";
    let encodedValue = [concentrationMacro, tokenId, spellbookId.toLowerCase()].join(
      this.delimiter
    );
    return { name: spellbookName, encodedValue, id: concentrationMacro };
  }

  /** FEATS **/

  /** @private */
  _getFeaturesList(actor, tokenId) {
    let validFeats = actor.items.filter((i) => i.type == "feat");
    let sortedFeats = this.sortItems(validFeats);
    let feats = this._categoriseFeatures(tokenId, actor, sortedFeats);

    return feats;
  }

  /** @private */
  _categoriseFeatures(tokenId, actor, feats) {
    let active = this.initializeEmptySubcategory();
    let passive = this.initializeEmptySubcategory();
    let disabled = this.initializeEmptySubcategory();

    let dispose = feats.reduce(
      function (dispose, f) {
        const activationType = f.system.activation?.type ?? f.system.actions[0]?.activation.type;
        const actionType = "feat";

        let feat = this._buildItem(tokenId, actor, actionType, f);

        if (!f.isActive) {
          disabled.actions.push(feat);
          return;
        }

        if (
          !activationType ||
          activationType === "" ||
          activationType === "passive"
        ) {
          passive.actions.push(feat);
          return;
        }

        active.actions.push(feat);

        return;
      }.bind(this),
      {}
    );

    let result = this.initializeEmptyCategory("feats");

    let activeTitle = this.i18n("tokenActionHud.active");
    this._combineSubcategoryWithCategory(result, activeTitle, active);

    if (!settings.get("ignorePassiveFeats")) {
      let passiveTitle = this.i18n("tokenActionHud.passive");
      this._combineSubcategoryWithCategory(result, passiveTitle, passive);
    }

    if (!settings.get("ignoreDisabledFeats")) {
      let disabledTitle = this.i18n("tokenActionHud.pf1.disabled");
      this._combineSubcategoryWithCategory(result, disabledTitle, disabled);
    }

    return result;
  }

  /** @private */
  _getSkillsList(skills, tokenId) {
    let result = this.initializeEmptyCategory("skills");
    let actionType = "skill";

    let abbr = settings.get("abbreviateSkills");

    let allSkills = new Set();

    Object.entries(skills).forEach((s) => {
      if (s[0].startsWith("skill")) s[1].isCustomSkill = true;

      allSkills.add(s);

      if (s[1].subSkills) {
        Object.entries(s[1].subSkills).forEach((ss) => {
          ss[1].isCustomSkill = true;
          ss[1].mainSkill = s[0];
          allSkills.add(ss);
        });
      }
    });

    let skillsActions = [...allSkills]
      .map((e) => {
        let id = e[0];
        let data = e[1];

        // rt: requires training
        if (data.rt && !data.rank) {
          return null;
        }

        let name = abbr ? id : CONFIG.PF1.skills[id];

        if (data.isCustomSkill || !name) {
          name = data.name ?? "?";
          id = `${data.mainSkill}.subSkills.${id}`;
        }

        name = name.charAt(0).toUpperCase() + name.slice(1);
        let encodedValue = [actionType, tokenId, id].join(this.delimiter);
        let info1 = this._getSkillRankInfo(data.rank);
        return { name: name, id: id, encodedValue: encodedValue, info1: info1 };
      })
      .filter((s) => !!s);

    let skillsCategory = this.initializeEmptySubcategory();
    skillsCategory.actions = skillsActions;

    let skillsTitle = this.i18n("tokenActionHud.skills");
    this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);

    return result;
  }

  _getSkillRankInfo(rank) {
    if (rank <= 0) return "";

    return `R${rank}`;
  }

  _addMultiSkills(list, tokenId) {
    let result = this.initializeEmptyCategory("skills");
    let actionType = "skill";

    let abbr = settings.get("abbreviateSkills");

    let skillsActions = Object.entries(CONFIG.PF1.skills).map((e) => {
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

  /** @private */
  _getAbilityList(tokenId, abilities, categoryId, categoryName, actionType) {
    let result = this.initializeEmptyCategory(categoryId);

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(CONFIG.PF1.abilities).map((e) => {
      if (abilities[e[0]].value === 0) return;

      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);
      let icon;
      if (categoryId === "checks") icon = "";
      else icon = this._getProficiencyIcon(abilities[e[0]].proficient);

      return { name: name, id: e[0], encodedValue: encodedValue, icon: icon };
    });
    let abilityCategory = this.initializeEmptySubcategory();
    abilityCategory.actions = actions.filter((a) => !!a);

    this._combineSubcategoryWithCategory(result, categoryName, abilityCategory);

    return result;
  }

  /** @private */
  _getSavesList(tokenId, actor, categoryId, categoryName, actionType) {
    let result = this.initializeEmptyCategory(categoryId);

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(CONFIG.PF1.savingThrows).map((e) => {
      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);

      return { name: name, id: e[0], encodedValue: encodedValue };
    });
    let savesCategory = this.initializeEmptySubcategory();
    savesCategory.actions = actions.filter((a) => !!a);

    this._combineSubcategoryWithCategory(result, categoryName, savesCategory);

    let defensesCat = this.initializeEmptySubcategory();
    let defensesMacro = "defenses";
    let defensesName = this.i18n("tokenActionHud.defenses");
    let defensesValue = [defensesMacro, tokenId, defensesMacro].join(
      this.delimiter
    );
    let defensesAction = [
      { name: defensesName, encodedValue: defensesValue, id: defensesMacro },
    ];
    defensesCat.actions = defensesAction;
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.defenses"),
      defensesCat
    );

    return result;
  }

  _getConditionsList(tokenId, conditions, categoryId, categoryName, actionType) {
    if (!conditions) return;

    let result = this.initializeEmptyCategory(categoryId);
    let subcategory = this.initializeEmptySubcategory();
    const entries = Object.entries(conditions);

    entries.forEach((c) => {
      const key = c[0];
      const value = c[1];

      let name = CONFIG.PF1.conditions[key];
      let img;
      if (settings.get("showIcons")) img = CONFIG.PF1.conditionTextures[key];

      let encodedValue = [actionType, tokenId, key].join(this.delimiter);

      let action = {
        name: name,
        id: key,
        encodedValue: encodedValue,
        img: img,
      };
      action.cssClass = value ? "active" : "";

      subcategory.actions.push(action);
    });

    subcategory.actions = subcategory.actions.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    this._combineSubcategoryWithCategory(result, categoryName, subcategory);

    return result;
  }

  _addMultiAbilities(list, tokenId, categoryId, categoryName, actionType) {
    let cat = this.initializeEmptyCategory(categoryId);

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(CONFIG.PF1.abilities).map((e) => {
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

    let actions = Object.entries(CONFIG.PF1.savingThrows).map((e) => {
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
  _addCombatSubcategory(actionType, category, tokenId) {
    let combatSubcategory = this.initializeEmptySubcategory();

    // Roll Initiative
    const combat = game.combat;
    let combatant, currentInitiative;
    if (combat) {
      combatant = combat.combatants.find((c) => c.tokenId === tokenId);
      currentInitiative = combatant?.initiative;
    }
    let initiativeValue = [actionType, tokenId, "initiative"].join(this.delimiter);
    let initiativeAction = {
      id: "rollInitiative",
      encodedValue: initiativeValue,
      name: this.i18n("tokenActionHud.rollInitiative"),
    };

    if (currentInitiative) initiativeAction.info1 = currentInitiative;
    initiativeAction.cssClass = currentInitiative ? "active" : "";

    combatSubcategory.actions.push(initiativeAction);

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

    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.combat"),
      combatSubcategory
    );
  }

  /** @private */
  _addMultiCombatSubcategory(actionType, tokenId, category) {
    let combatSubcategory = this.initializeEmptySubcategory();

    // Roll Initiative
    const combat = game.combat;
    let initiativeValue = [actionType, tokenId, "initiative"].join(this.delimiter);
    let initiativeAction = {
      id: "rollInitiative",
      encodedValue: initiativeValue,
      name: this.i18n("tokenActionHud.rollInitiative"),
    };
    let isActive;
    if (combat) {
      let tokenIds = canvas.tokens.controlled.map((t) => t.id);
      let tokenCombatants = tokenIds.map((id) =>
        combat.combatants.find((c) => c.tokenId === id)
      );
      isActive = tokenCombatants.every((c) => !!c?.initiative);
    }
    initiativeAction.cssClass = isActive ? "active" : "";
    combatSubcategory.actions.push(initiativeAction);

    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.combat"),
      combatSubcategory
    );
  }

  /** @private */
  _getUtilityList(actor, tokenId) {
    let result = this.initializeEmptyCategory("utility");
    let actionType = "utility";

    this._addCombatSubcategory(actionType, result, tokenId);

    let rests = this.initializeEmptySubcategory();

    if (actor.type === "character") {
      let longRestValue = [actionType, tokenId, "rest"].join(this.delimiter);
      rests.actions.push({
        id: "rest",
        encodedValue: longRestValue,
        name: this.i18n("tokenActionHud.rest"),
      });
    }

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.rests"),
      rests
    );

    return result;
  }

  /** @private */
  _addMultiTokenUtilities(list, tokenId, actors) {
    let category = this.initializeEmptyCategory("utility");
    let actionType = "utility";

    this._addMultiCombatSubcategory(actionType, tokenId, category);

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
    this._combineCategoryWithList(
      list,
      this.i18n("tokenActionHud.utility"),
      category
    );
  }

  /** @private */
  _buildItem(tokenId, actor, actionType, item) {
    let encodedValue = [actionType, tokenId, item._id].join(this.delimiter);
    let img = this.getImage(item);
    let icon = this._getActionIcon(item.system.activation?.type);
    let name = this._getItemName(item);
    let result = {
      name: name,
      id: item._id,
      encodedValue: encodedValue,
      img: img,
      icon: icon,
    };

    if (
      item.system.recharge &&
      !item.system.recharge.charged &&
      item.system.recharge.value
    ) {
      result.name += ` (${this.i18n("tokenActionHud.recharge")})`;
    }

    result.info1 = this._getQuantityData(item);

    result.info2 = this._getUsesData(item);

    result.info3 = this._getConsumeData(item, actor);

    return result;
  }

  _getItemName(item) {
    let name;

    if (item.system.identified || game.user.isGM) name = item.system.identifiedName;
    else name = item.system.unidentified?.name;

    if (!name) name = item.name;

    return name;
  }

  /** @private */
  _getQuantityData(item) {
    let result = (item.system.quantity > 1) ? item.system.quantity : ""
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
      reaction: `<i class="fas fa-bolt"></i>`,
      free: `<i class="fas fa-plus"></i>`,
      swift: `<i class="fas fa-plus"></i>`,
      full: `<i class="far fa-circle"></i>`,
      round: `<i class="fas fa-hourglass-start"></i>`,
      minute: `<i class="fas fa-hourglass-half"></i>`,
      hour: `<i class="fas fa-hourglass-end"></i>`,
      special: `<i class="fas fa-star"></i>`,
    };
    return img[action];
  }
}
