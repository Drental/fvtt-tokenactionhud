import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { Logger } from "../../logger.js";

export class ActionHandler5e extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  doBuildActions(emptyActionList, token, multipleTokens) {

    if (token) {
      return this._buildSingleTokenList(emptyActionList, token);
    }
    if (multipleTokens) {
      return this._buildMultipleTokenList(emptyActionList);
    }
    return emptyActionList;
  }
  
  async _buildSingleTokenList(emptyActionList, token) {
    const actionList = emptyActionList;
    await this._buildActions(actionList, token);
    return actionList;
  }

  _buildActions(actionList, token) {
    const actor = token.actor;
    const subcategories = Object.values(actionList.categories)
    .filter(c => c.subcategories)
      .flatMap(c => Object.values(c.subcategories)
         .filter(sc => sc)
         .flatMap(sc => [{ 
            categoryId: c.id,
            categoryTitle: c.title,
            subcategoryId: sc.id,
            subcategoryTitle: sc.title
      }]))
    
    if (actor.type === "character" || actor.type === "npc") {
        this._buildAllItems(actionList, token);
        this._buildSpells(actionList, token);
        this._buildFeatures(actionList, token);
        this._buildAbilities(actionList, token);
        this._buildSkills(actionList, token);
        this._buildChecks(actionList, token);
        this._buildSaves(actionList, token);
        this._buildEffects(actionList, token);
        this._buildConditions(actionList, token);
        this._buildCombat(actionList, token);
        this._buildRests(actionList, token);
        //this._buildToken(actionList, token);
        this._buildUtility(actionList, token);
    }
    if (actor.type === "vehicle") {
        this._buildAllItems(actionList, token);
        this._buildFeatures(actionList, token);
        this._buildAbilities(actionList, token);
        this._buildChecks(actionList, token);
        this._buildSaves(actionList, token);
        this._buildEffects(actionList, token);
        this._buildConditions(actionList, token);
        this._buildCombat(actionList, token);
        this._buildUtility(actionList, token);
    }
    
    return actionList
  }

  _buildAbilities(actionList, token) {
    const actor = token.actor;
    const abilities = actor.system.abilities;
    let actions = this._getAbilityList(
      token.id,
      abilities,
      "abilities",
      this.i18n("tokenActionHud.dnd5e.abilities"),
      "ability"
    );
    this._mapActions(actionList, actions, "abilities");
  }

  _buildChecks(actionList, token) {
    const actor = token.actor;
    const abilities = actor.system.abilities;
    let actions = this._getAbilityList(
      token.id,
      abilities,
      "checks",
      this.i18n("tokenActionHud.dnd5e.checks"),
      "abilityCheck"
    );
    this._mapActions(actionList, actions, "checks");
  }

  _buildSaves(actionList, token) {
    const actor = token.actor;
    const abilities = actor.system.abilities;
    let actions = this._getAbilityList(
      token.id,
      abilities,
      "saves",
      this.i18n("tokenActionHud.dnd5e.saves"),
      "abilitySave"
    );
    this._mapActions(actionList, actions, "saves");
  }

  _buildMultipleTokenList() {
    const list = this.initializeEmptyActionList();
    list.tokenId = "multi";
    list.actorId = "multi";

    const allowedTypes = ["npc", "character"];
    let actors = canvas.tokens.controlled
      .map((t) => t.actor)
      .filter((a) => allowedTypes.includes(a.type));

    const tokenId = list.tokenId;

    this._addMultiSkills(list, tokenId);

    if (settings.get("splitAbilities")) {
      let savesTitle = this.i18n("tokenActionHud.dnd5e.saves");
      let checksTitle = this.i18n("tokenActionHud.dnd5e.checks");
      this._addMultiAbilities(
        list,
        tokenId,
        "saves",
        savesTitle,
        "abilitySave"
      );
      this._addMultiAbilities(
        list,
        tokenId,
        "checks",
        checksTitle,
        "abilityCheck"
      );
    } else {
      let abilitiesTitle = this.i18n("tokenActionHud.dnd5e.abilities");
      this._addMultiAbilities(
        list,
        tokenId,
        "abilities",
        abilitiesTitle,
        "ability"
      );
    }

    if (settings.get("showConditionsCategory"))
      this._addMultiConditions(list, tokenId);

    this._addMultiUtilities(list, tokenId, actors);

    return list;
  }

  /** ITEMS **/

  /** @private */
  _buildAllItems(actionList, token) {
    const actor = token.actor;

    const validItems = this._filterLongerActions(
      actor.items.filter((i) => i.system.quantity > 0)
    );
    const sortedItems = this._sortByItemSort(validItems);

    let equipped;
    if (actor.type === "npc" && settings.get("showAllNpcItems")) {
      equipped = sortedItems.filter(
        (i) =>
          i.type !== "consumable" && i.type !== "spell" && i.type !== "feat"
      );
    } else {
      equipped = sortedItems.filter(
        (i) => i.type !== "consumable" && i.system.equipped
      );
    }
    let activeEquipped = this._getActiveEquipment(equipped);

    // Weapons
    let weapons = activeEquipped.filter((i) => i.type == "weapon");
    this._buildItems(actionList, token, weapons, "weapons");

    // Equipment
    let equipment = activeEquipped.filter((i) => i.type == "equipment");
    this._buildItems(actionList, token, equipment, "equipment");

    // Other Items
    let other = activeEquipped.filter(
      (i) => i.type != "weapon" && i.type != "equipment" && i.type != "tool" 
    );
    this._buildItems(actionList, token, other, "other-items");

    // Consumables
    let allConsumables = this._getActiveEquipment(
      sortedItems.filter((i) => i.type == "consumable")
    );
    let expendedFiltered = this._filterExpendedItems(allConsumables);
    let consumables = expendedFiltered;
    this._buildItems(actionList, token, consumables, "consumables");

    // Tools
    let tools = validItems.filter((t) => t.type === "tool");
    this._buildItems(actionList, token, tools, "tools");
  }

  /** ITEMS **/

  /** @private */
  _buildItems(actionList, token, items, subcategoryId) {
    const actor = token.actor;
    const tokenId = token.id;
    const macroType = "item";
    let actions = items.map((item) =>
      this._buildEquipmentItem(tokenId, actor, macroType, item)
    );
    this._mapActions(actionList, actions, subcategoryId);
  }

  /** @private */
  _getActiveEquipment(equipment) {
    let activeEquipment = []
    if (!settings.get("showItemsWithoutAction")) {
      const activationTypes = Object.keys(
        game.dnd5e.config.abilityActivationTypes
      ).filter((at) => at !== "none");

      activeEquipment = equipment.filter((e) => {
        let activation = e.system.activation;
        if (!activation) return false;

        return activationTypes.includes(e.system.activation.type);
      });
    }
    else {
      activeEquipment = equipment;
    }

    return activeEquipment;
  }

  /** SPELLS **/

  /** @private */
  _buildSpells(actionList, token) {
    const actor = token.actor;
    if (actor.type === "vehicle") return;
  
    let validSpells = this._filterLongerActions(
      actor.items.filter((i) => i.type === "spell")
    );
    validSpells = this._filterExpendedItems(validSpells);

    if (actor.type === "character" || !settings.get("showAllNpcItems"))
      validSpells = this._filterNonpreparedSpells(validSpells);

    let spellsSorted = this._sortSpellsByLevel(validSpells);

    this._categoriseSpells(actionList, token, spellsSorted);
  }

  /** @private */
  _sortSpellsByLevel(spells) {
    let result = Object.values(spells);

    result.sort((a, b) => {
      if (a.system.level === b.system.level)
        return a.name
          .toUpperCase()
          .localeCompare(b.name.toUpperCase(), undefined, {
            sensitivity: "base",
          });
      return a.system.level - b.system.level;
    });

    return result;
  }

  /** @private */
  _categoriseSpells(actionList, token, spells) {
    const tokenId = token.id;
    const actor = token.actor;
    const macroType = "spell";

    // Reverse sort spells by level
    const spellSlotInfo = Object.entries(actor.system.spells).sort(
      (a, b) => {
        return b[0].toUpperCase().localeCompare(a[0].toUpperCase(), undefined, {
          sensitivity: "base",
        });
      }
    );

    // Go through spells and if higher available slots exist, mark spell slots available at lower levels.
    let pactInfo = spellSlotInfo.find((s) => s[0] === "pact");

    let slotsAvailable = false;
    spellSlotInfo.forEach((s) => {
      if (s[0].startsWith("spell")) {
        if (!slotsAvailable && s[1].max > 0 && s[1].value > 0)
          slotsAvailable = true;

        if (!slotsAvailable && s[0] === "spell" + pactInfo[1]?.level) {
          if (pactInfo[1].max > 0 && pactInfo[1].value > 0)
            slotsAvailable = true;
        }

        s[1].slotsAvailable = slotsAvailable;
      } else {
        if (!s[1]) s[1] = {};

        s[1].slotsAvailable = !s[1].max || s[1].value > 0;
      }
    });

    let pactIndex = spellSlotInfo.findIndex((p) => p[0] === "pact");
    if (!spellSlotInfo[pactIndex][1].slotsAvailable) {
      let pactSpellEquivalent = spellSlotInfo.findIndex(
        (s) => s[0] === "spell" + pactInfo[1].level
      );
      spellSlotInfo[pactIndex][1].slotsAvailable =
        spellSlotInfo[pactSpellEquivalent][1].slotsAvailable;
    }

    // GET DISTINCT MODES/LEVELS
    const spellLevelIds = [...new Set(spells.map(s => 
      {
        const prepId = s.system.preparation.mode;
        const levelId = s.system.level;
        const isPrep = (prepId === "pact" || prepId === "atwill" || prepId === "innate") ? true : false;
        if (isPrep) {
          return prepId
        } else {
          return levelId
        }
      }
    ))]

    // GET SPELL LEVELS
    const spellLevels = spellLevelIds.map(sl =>
      {
        const isPrep = (sl === "pact" || sl === "atwill" || sl === "innate") ? true : false;
        const id = (isPrep) ? sl : `spell${sl}`;
        const name = (isPrep) ? 
          game.dnd5e.config.spellPreparationModes[sl] :
          sl === 0 ? this.i18n("tokenActionHud.cantrips") : `${this.i18n("tokenActionHud.level")} ${sl}`;
        return [id, name]
      }
    )

    // CREATE SUBCATEGORIES
    let subcategories = [];
    for (const spellLevel of spellLevels) {
      const spellLevelId = spellLevel[0];
      const spellLevelName = spellLevel[1];
      const isPrep = (spellLevelId === "pact" || spellLevelId === "atwill" || spellLevelId === "innate") ? true : false;
      const levelInfo = spellSlotInfo.find((lvl) => lvl[0] === spellLevelId)?.[1];
      const slots = levelInfo?.value;
      const max = levelInfo?.max;
      const slotsAvailable = levelInfo?.slotsAvailable;
      const ignoreSlotsAvailable = settings.get("showEmptyItems");
      let subcategory = {};
      if ((max && slotsAvailable) || !max || ignoreSlotsAvailable) {
        subcategory = this.initializeEmptySubcategory(spellLevelId, spellLevelName);
        if (max > 0) subcategory.info1 = `${slots}/${max}`
    
        // CREATE ACTIONS
        for (const spell of spells) {
          const spellSpellLevelId = (isPrep) ? spell.system.preparation.mode : `spell${spell.system.level}`;

          if (spellSpellLevelId === spellLevelId) {
            let spellItem = this._buildItem(tokenId, actor, macroType, spell);
            if (settings.get("showSpellInfo")) this._addSpellInfo(spell, spellItem);
            subcategory.actions.push(spellItem);
          }
        }
      }
      subcategories.push(subcategory);
    }
    this._mapSubcategories(actionList, subcategories, "spells");
  }

  /** @private */
  _addSpellInfo(s, spell) {
    let c = s.system.components;

    spell.info1 = "";
    spell.info2 = "";
    spell.info3 = "";
    if (c?.vocal)
      spell.info1 += this.i18n("DND5E.ComponentVerbal").charAt(0).toUpperCase();

    if (c?.somatic)
      spell.info1 += this.i18n("DND5E.ComponentSomatic")
        .charAt(0)
        .toUpperCase();

    if (c?.material)
      spell.info1 += this.i18n("DND5E.ComponentMaterial")
        .charAt(0)
        .toUpperCase();

    if (c?.concentration)
      spell.info2 += this.i18n("DND5E.Concentration").charAt(0).toUpperCase();

    if (c?.ritual)
      spell.info3 += this.i18n("DND5E.Ritual").charAt(0).toUpperCase();
  }

  /** FEATS **/

  /** @private */
  _buildFeatures(actionList, token) {
    let validFeats = this._filterLongerActions(
      token.actor.items.filter((i) => i.type == "feat")
    );
    let sortedFeats = this._sortByItemSort(validFeats);
    this._categoriseFeats(actionList, token, sortedFeats);
  }

  /** @private */
  _categoriseFeats(actionList, token, feats) {
    const tokenId = token.id;
    const actor = token.actor;

    let subcategories = [];
    let activeId = this.i18n("tokenActionHud.active");
    let passiveId = this.i18n("tokenActionHud.passive");
    let legendaryId = this.i18n("tokenActionHud.dnd5e.legendary");
    let lairId = this.i18n("tokenActionHud.dnd5e.lair");
    let actionsId = this.i18n("tokenActionHud.actions");
    let featuresId = this.i18n("tokenActionHud.features");
    let reactionsId = this.i18n("tokenActionHud.reactions");
    let activeTitle = this.i18n("tokenActionHud.active");
    let passiveTitle = this.i18n("tokenActionHud.passive");
    let legendaryTitle = this.i18n("tokenActionHud.dnd5e.legendary");
    let lairTitle = this.i18n("tokenActionHud.dnd5e.lair");
    let actionsTitle = this.i18n("tokenActionHud.actions");
    let featuresTitle = this.i18n("tokenActionHud.features");
    let reactionsTitle = this.i18n("tokenActionHud.reactions");
    let active = this.initializeEmptySubcategory(activeId, activeTitle);
    let passive = this.initializeEmptySubcategory(passiveId, passiveTitle);
    let lair = this.initializeEmptySubcategory(lairId, lairTitle);
    let legendary = this.initializeEmptySubcategory(legendaryId, legendaryTitle);
    let actions = this.initializeEmptySubcategory(actionsId, actionsTitle);
    let features = this.initializeEmptySubcategory(featuresId, featuresTitle);
    let reactions = this.initializeEmptySubcategory(reactionsId, reactionsTitle);
    
    let dispose = feats.reduce(
      function (dispose, f) {
        const activationType = f.system.activation.type;
        const macroType = "feat";

        let feat = this._buildEquipmentItem(tokenId, actor, macroType, f);

        if (actor.type === "vehicle") {
          if (activationType && activationType !== "none" && activationType !== "reaction") {
            actions.actions.push(feat);
            return;
          }

          if (!activationType || activationType === "none") {
            features.actions.push(feat);
            return;
          }

          if (activationType == "reaction") {
            reactions.actions.push(feat);
            return;
          }

          actions.actions.push(feat);
          return
        }

        if (actor.type === "character" || actor.type === "npc") {
          if (!activationType || activationType === "") {
            passive.actions.push(feat);
            return;
          }
  
          if (activationType == "lair") {
            lair.actions.push(feat);
            return;
          }
  
          if (activationType == "legendary") {
            legendary.actions.push(feat);
            return;
          }
  
          active.actions.push(feat);
          return;
        }
      }.bind(this),
      {}
    );

    subcategories.push(active);
    if (!settings.get("ignorePassiveFeats")) subcategories.push(passive);
    subcategories.push(lair);
    subcategories.push(legendary);
    subcategories.push(actions);
    subcategories.push(features);
    subcategories.push(reactions);

    this._mapSubcategories(actionList, subcategories, "features");
  }

  /** @private */
  _buildSkills(actionList, token) {
    const actor = token.actor;
    const skills = actor.system.skills;
    let macroType = "skill";

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(skills)
      .map((e) => {
        try {
          let skillId = e[0];
          let name = abbr ? skillId : game.dnd5e.config.skills[skillId].label;
          name = name.charAt(0).toUpperCase() + name.slice(1);
          let encodedValue = [macroType, token.id, e[0]].join(this.delimiter);
          let icon = this._getProficiencyIcon(skills[skillId].value);
          return {
            name: name,
            id: e[0],
            encodedValue: encodedValue,
            icon: icon,
          };
        } catch (error) {
          Logger.error(e);
          return null;
        }
      })
      .filter((s) => !!s);
    
    this._mapActions(actionList, actions, "skills");
  }

  _addMultiSkills(list, tokenId) {
    let result = this.initializeEmptyCategory("skills");
    let macroType = "skill";

    let abbr = settings.get("abbreviateSkills");
    let skillsActions = Object.entries(game.dnd5e.config.skills).map((e) => {
      let name = abbr ? e[0] : e[1].label;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
      return { name: name, id: e[0], encodedValue: encodedValue };
    });
    let skillsCategory = this.initializeEmptySubcategory();
    skillsCategory.actions = skillsActions;

    let skillsTitle = this.i18n("tokenActionHud.dnd5e.skills");
    this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);
    this._combineCategoryWithList(list, skillsTitle, result, true);
  }

  /** @private */
  _getAbilityList(tokenId, abilities, categoryId, categoryName, macroType) {
    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(game.dnd5e.config.abilities).map((e) => {
      if (abilities[e[0]].value === 0) return;

      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
      let icon;
      if (categoryId === "checks") icon = "";
      else icon = this._getProficiencyIcon(abilities[e[0]].proficient);

      return { name: name, id: e[0], encodedValue: encodedValue, icon: icon };
    });

    return actions;
  }

  _addMultiAbilities(list, tokenId, categoryId, categoryName, macroType) {
    let cat = this.initializeEmptyCategory(categoryId);

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(game.dnd5e.config.abilities).map((e) => {
      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);

      return { name: name, id: e[0], encodedValue: encodedValue };
    });
    let abilityCategory = this.initializeEmptySubcategory();
    abilityCategory.actions = actions;

    this._combineSubcategoryWithCategory(cat, categoryName, abilityCategory);
    this._combineCategoryWithList(list, categoryName, cat, true);
  }

  _buildRests(actionList, token) {
    const actor = token.actor;

    let macroType = "rests";

    let actions = [];
    if (actor.type === "character") {
      let shortRestValue = [macroType, token.id, "shortRest"].join(
        this.delimiter
      );
      actions.push({
        id: "shortRest",
        encodedValue: shortRestValue,
        name: this.i18n("tokenActionHud.shortRest"),
      });
      let longRestValue = [macroType, token.id, "longRest"].join(
        this.delimiter
      );
      actions.push({
        id: "longRest",
        encodedValue: longRestValue,
        name: this.i18n("tokenActionHud.longRest"),
      });
    }

    this._mapActions(actionList, actions, "rests");
  }

  /** @private */
  _buildUtility(actionList, token) {
    const actor = token.actor;

    let macroType = "utility";

    let actions = [];
    if (actor.type === "character") {
      if (actor.system.attributes.hp.value <= 0) {
        let deathSaveValue = [macroType, token.id, "deathSave"].join(
          this.delimiter
        );
        let deathSaveAction = {
          id: "deathSave",
          encodedValue: deathSaveValue,
          name: this.i18n("tokenActionHud.dnd5e.deathSave"),
        };
        actions.push(deathSaveAction);
      }

      let inspirationValue = [macroType, token.id, "inspiration"].join(
        this.delimiter
      );
      let inspirationAction = {
        id: "inspiration",
        encodedValue: inspirationValue,
        name: this.i18n("tokenActionHud.inspiration"),
      };
      inspirationAction.cssClass = actor.system.attributes?.inspiration
        ? "active"
        : "";
      actions.push(inspirationAction);
    }

    this._mapActions(actionList, actions, "utility");
  }

  /** @private */
  _buildCombat(actionList, token) {
    const tokenId = token.id;
    let actions = [];
    let macroType = "utility";
    // Roll Initiative
    const combat = game.combat;
    let combatant, currentInitiative;
    if (combat) {
      combatant = combat.combatants.find((c) => c.tokenId === tokenId);
      currentInitiative = combatant?.initiative;
    }
    let initiativeValue = [macroType, tokenId, "initiative"].join(this.delimiter);
    let initiativeAction = {
      id: "rollInitiative",
      encodedValue: initiativeValue,
      name: this.i18n("tokenActionHud.rollInitiative"),
    };

    if (currentInitiative) initiativeAction.info1 = currentInitiative;
    initiativeAction.cssClass = currentInitiative ? "active" : "";

    actions.push(initiativeAction);

    // End Turn
    if (game.combat?.current?.tokenId === tokenId) {
      let endTurnValue = [macroType, tokenId, "endTurn"].join(this.delimiter);
      let endTurnAction = {
        id: "endTurn",
        encodedValue: endTurnValue,
        name: this.i18n("tokenActionHud.endTurn"),
      };

      actions.push(endTurnAction);
    }

    this._mapActions(actionList, actions, "combat");
  }

  /** @private */
  _addMultiCombatSubcategory(macroType, tokenId, category) {
    let combatSubcategory = this.initializeEmptySubcategory();

    // Roll Initiative
    const combat = game.combat;
    let initiativeValue = [macroType, tokenId, "initiative"].join(this.delimiter);
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
  _buildEffects(actionList, token) {
    this._getEffects(actionList, token);
  }

  /** @private */
  _getEffects(actionList, token) {
    const tokenId = token.id;
    const actor = token.actor;
    const macroType = "effect";
    let subcategories = [];
    const temporaryId = "temporary-effects";
    const passiveId = "passive-effects";
    const temporaryTitle = this.i18n("tokenActionHud.temporary");
    const passiveTitle = this.i18n("tokenActionHud.passive");
    let temporarySubcategory = this.initializeEmptySubcategory(temporaryId, temporaryTitle);
    let passiveSubcategory = this.initializeEmptySubcategory(passiveId, passiveTitle);

    const effects =
      "find" in actor.effects.entries ? actor.effects.entries : actor.effects;

    effects.forEach(e => {
      const name = e.label;
      const encodedValue = [macroType, tokenId, e.id].join(this.delimiter);
      const cssClass = e.disabled ? "" : "active";
      const image = e.icon;
      let action = {
        name: name,
        id: e.id,
        encodedValue: encodedValue,
        img: image,
        cssClass: cssClass,
      };

      e.isTemporary
        ? temporarySubcategory.actions.push(action)
        : passiveSubcategory.actions.push(action);
    });

    subcategories.push(temporarySubcategory);
    subcategories.push(passiveSubcategory);

    this._mapSubcategories(actionList, subcategories, "effects");
  }

  /** @private */
  _buildConditions(actionList, token) {
    const tokenId = token.id;
    const actor = token.actor;
    const macroType = "condition";

    const availableConditions = CONFIG.statusEffects.filter(
      (condition) => condition.id !== ""
    );

    if (!availableConditions) return;

    let actions = [];
    availableConditions.forEach((c) => {
      const name = this.i18n(c.label);
      const encodedValue = [macroType, tokenId, c.id].join(this.delimiter);
      const effects =
        "some" in actor.effects.entries ? actor.effects.entries : actor.effects;
      const cssClass = effects.some((e) => e.flags.core?.statusId === c.id)
        ? "active"
        : "";
      const image = c.icon;
      const action = {
        name: name,
        id: c.id,
        encodedValue: encodedValue,
        img: image,
        cssClass: cssClass,
      };

      actions.push(action);
    });

    this._mapActions(actionList, actions, "conditions");
  }

  /** @private */
  _addMultiConditions(list, tokenId) {
    const category = this.initializeEmptyCategory("conditions");
    const macroType = "condition";

    const availableConditions = CONFIG.statusEffects.filter(
      (condition) => condition.id !== ""
    );
    const actors = canvas.tokens.controlled
      .filter((t) => !!t.actor)
      .map((t) => t.actor);

    if (!availableConditions) return;

    let conditions = this.initializeEmptySubcategory();

    availableConditions.forEach((c) => {
      const name = this.i18n(c.label);
      const encodedValue = [macroType, tokenId, c.id].join(this.delimiter);
      const cssClass = actors.every((actor) => {
        const effects =
          "some" in actor.effects.entries
            ? actor.effects.entries
            : actor.effects;
        effects.some((e) => e.flags.core?.statusId === c.id);
      })
        ? "active"
        : "";
      const image = c.icon;
      const action = {
        name: name,
        id: c.id,
        encodedValue: encodedValue,
        img: image,
        cssClass: cssClass,
      };

      conditions.actions.push(action);
    });

    const conName = this.i18n("tokenActionHud.conditions");
    this._combineSubcategoryWithCategory(category, conName, conditions);
    this._combineCategoryWithList(list, conName, category);
  }

  /** @private */
  _addMultiUtilities(list, tokenId, actors) {
    let category = this.initializeEmptyCategory("utility");
    let macroType = "utility";

    this._addMultiCombatSubcategory(macroType, tokenId, category);

    let rests = this.initializeEmptySubcategory();
    let utility = this.initializeEmptySubcategory();

    if (actors.every((a) => a.type === "character")) {
      let shortRestValue = [macroType, tokenId, "shortRest"].join(
        this.delimiter
      );
      rests.actions.push({
        id: "shortRest",
        encodedValue: shortRestValue,
        name: this.i18n("tokenActionHud.shortRest"),
      });
      let longRestValue = [macroType, tokenId, "longRest"].join(this.delimiter);
      rests.actions.push({
        id: "longRest",
        encodedValue: longRestValue,
        name: this.i18n("tokenActionHud.longRest"),
      });

      let inspirationValue = [macroType, tokenId, "inspiration"].join(
        this.delimiter
      );
      let inspirationAction = {
        id: "inspiration",
        encodedValue: inspirationValue,
        name: this.i18n("tokenActionHud.inspiration"),
      };
      inspirationAction.cssClass = actors.every(
        (a) => a.system.attributes?.inspiration
      )
        ? "active"
        : "";
      utility.actions.push(inspirationAction);
    }

    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.rests"),
      rests
    );
    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.utility"),
      utility
    );
    this._combineCategoryWithList(
      list,
      this.i18n("tokenActionHud.utility"),
      category
    );
  }

  /** @private */
  _buildEquipmentItem(tokenId, actor, macroType, item) {
    let action = this._buildItem(tokenId, actor, macroType, item);
    this._addItemInfo(actor, item, action);
    return action;
  }

  /** @private */
  _buildItem(tokenId, actor, macroType, item) {
    const itemId = item.id;
    let encodedValue = [macroType, tokenId, itemId].join(this.delimiter);
    let img = this._getImage(item);
    let icon = this._getActionIcon(item.system.activation?.type);
    let result = {
      name: item.name,
      id: itemId,
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

    return result;
  }

  /** @private */
  _addItemInfo(actor, item, action) {
    action.info1 = this._getQuantityData(item);

    action.info2 = this._getUsesData(item);

    action.info3 = this._getConsumeData(item, actor);
  }

  _getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";

    return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
  }

  /** @private */
  _getQuantityData(item) {
    let result = "";
    let quantity = item.system.quantity;
    if (quantity > 1) {
      result = quantity;
    }

    return result;
  }

  /** @private */
  _getUsesData(item) {
    let result = "";

    let uses = item.system.uses;
    if (!uses) return result;

    result = uses.value === 0 && uses.max ? "0" : uses.value;

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
        let target = getProperty(actor, `system.${parentId}`);

        if (target) {
          result = target.value ?? 0;
          if (!!target.max) result += `/${target.max}`;
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

  /** @private */
  _filterLongerActions(items) {
    var result;

    if (settings.get("hideLongerActions"))
      result = items.filter((i) => {
        return (
          !i.system.activation ||
          !(
            i.system.activation.type === "minute" ||
            i.system.activation.type === "hour" ||
            i.system.activation.type === "day"
          )
        );
      });

    return result ? result : items;
  }

  /** @private */
  _filterNonpreparedSpells(spells) {
    const nonpreparableSpells = Object.keys(
      game.dnd5e.config.spellPreparationModes
    ).filter((p) => p != "prepared");
    let result = spells;

    if (settings.get("showAllNonpreparableSpells")) {
      result = spells.filter((i) => {
        return (
          i.system.preparation.prepared ||
          nonpreparableSpells.includes(i.system.preparation.mode) ||
          i.system.level === 0
        );
      });
    } else {
      result = spells.filter(
        (i) => i.system.preparation.prepared
      );
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
  _sortByItemSort(items) {
    let result = Object.values(items);

    result.sort((a, b) => a.sort - b.sort);

    return result;
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
      //action: `<i class="fas fa-fist-raised"></i>`,
      bonus: `<i class="fas fa-plus"></i>`,
      crew: `<i class="fas fa-users"></i>`,
      legendary: `<i class="fas fa-dragon"></i>`,
      reaction: `<i class="fas fa-bolt"></i>`,
      //none: `<i class="far fa-circle"></i>`,
      special: `<i class="fas fa-star"></i>`,
      lair: `<i class="fas fa-home"></i>`,
      minute: `<i class="fas fa-hourglass-start"></i>`,
      hour: `<i class="fas fa-hourglass-half"></i>`,
      day: `<i class="fas fa-hourglass-end"></i>`,
    };
    return img[action];
  }
}
