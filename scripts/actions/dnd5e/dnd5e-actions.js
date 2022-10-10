import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { Logger } from "../../logger.js";

export class ActionHandler5e extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(emptyActionList, character) {
    const actionList = emptyActionList;
    await this._buildActions(actionList, character);
    return actionList;
  }

  async _buildActions(actionList, character) {
    const actor = character?.actor;
    const subcategoryIds = Object.values(actionList.categories)
      .filter((category) => category.subcategories)
      .flatMap((category) =>
        Object.values(category.subcategories)
          .filter((subcategory) => subcategory.type === "system")
          .flatMap((subcategory) => subcategory.id)
      );
    const inventorySubcategoryIds = subcategoryIds.filter(
      (subcategoryId) =>
        subcategoryId === "weapons" ||
        subcategoryId === "equipment" ||
        subcategoryId === "consumables" ||
        subcategoryId === "tools"
    );

    if (actor?.type === "character" || actor?.type === "npc") {
      if (inventorySubcategoryIds)
        this._buildInventory(actionList, character, inventorySubcategoryIds);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "spells"))
        this._buildSpells(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "features"))
        this._buildFeatures(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "abilities"))
        this._buildAbilities(actionList, character, "abilities", "ability");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "checks"))
        this._buildAbilities(actionList, character, "checks", "abilityCheck");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "saves"))
        this._buildAbilities(actionList, character, "saves", "abilitySaves");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
        this._buildSkills(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "effects"))
        this._buildEffects(actionList, character);
      if (
        subcategoryIds.some((subcategoryId) => subcategoryId === "conditions")
      )
        this._buildConditions(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "combat"))
        this._buildCombat(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "rests"))
        this._buildRests(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "utility"))
        this._buildUtility(actionList, character);
    }
    if (actor?.type === "vehicle") {
      if (inventorySubcategoryIds)
        this._buildInventory(actionList, character, inventorySubcategoryIds);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "features"))
        this._buildFeatures(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "abilities"))
        this._buildAbilities(actionList, character, "abilities", "ability");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "checks"))
        this._buildAbilities(actionList, character, "checks", "abilityCheck");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "saves"))
        this._buildAbilities(actionList, character, "saves", "abilitySave");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "effects"))
        this._buildEffects(actionList, character);
      if (
        subcategoryIds.some((subcategoryId) => subcategoryId === "conditions")
      )
        this._buildConditions(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "combat"))
        this._buildCombat(actionList, character);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "utility"))
        this._buildUtility(actionList, character);
    }
    if (!actor) {
      const tokenId = "multi";
      actionList.tokenId = tokenId;
      actionList.actorId = "multi";
      const allowedTypes = ["npc", "character"];
      const actors = canvas.tokens.controlled
        .map((token) => token.actor)
        .filter((actor) => allowedTypes.includes(actor.type));
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "abilities"))
        this._buildMultiAbilities(actionList, tokenId, "abilities", "ability");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "checks"))
        this._buildMultiAbilities(
          actionList,
          tokenId,
          "checks",
          "abilityCheck"
        );
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "saves"))
        this._buildMultiAbilities(actionList, tokenId, "saves", "abilitySave");
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
        this._buildMultiSkills(actionList, tokenId);
      if (
        subcategoryIds.some((subcategoryId) => subcategoryId === "conditions")
      )
        this._buildMultiConditions(actionList, tokenId, actors);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "combat"))
        this._buildMultiCombat(actionList, tokenId);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "rests"))
        this._buildMultiRests(actionList, tokenId, actors);
      if (subcategoryIds.some((subcategoryId) => subcategoryId === "utility"))
        this._buildMultiUtility(actionList, tokenId, actors);
    }

    return actionList;
  }

  /** INVENTORY **/

  /** @private */
  _buildInventory(actionList, character, inventorySubcategoryIds) {
    const actor = character.actor;
    const validItems = this._filterLongerActions(
      actor.items.filter((item) => item.system.quantity > 0)
    );
    const sortedItems = this.sortItems(validItems);

    // EQUIPPED INVENTORY
    let equipped;
    if (actor?.type === "npc" && settings.get("showAllNpcItems")) {
      equipped = sortedItems.filter(
        (item) =>
          item.type !== "consumable" &&
          item.type !== "spell" &&
          item.type !== "feat"
      );
    } else {
      equipped = sortedItems.filter(
        (item) => item.type !== "consumable" && item.system.equipped
      );
    }
    const activeEquipped = this._getActiveEquipment(equipped);

    // WEAPONS
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "weapons"
      )
    ) {
      const weapons = activeEquipped.filter((item) => item.type == "weapon");
      this._buildItems(actionList, character, weapons, "weapons");
    }

    // EQUIPMENT
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "equipment"
      )
    ) {
      const equipment = activeEquipped.filter(
        (item) => item.type == "equipment"
      );
      this._buildItems(actionList, character, equipment, "equipment");
    }

    // CONSUMABLES
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "consumables"
      )
    ) {
      const allConsumables = this._getActiveEquipment(
        sortedItems.filter((item) => item.type == "consumable")
      );
      const expendedFiltered = this._filterExpendedItems(allConsumables);
      const consumables = expendedFiltered;
      this._buildItems(actionList, character, consumables, "consumables");
    }

    // TOOLS
    if (
      inventorySubcategoryIds.some((subcategoryId) => subcategoryId === "tools")
    ) {
      let tools = validItems.filter((item) => item.type === "tool");
      this._buildItems(actionList, character, tools, "tools");
    }
  }

  /** @private */
  _buildItems(actionList, character, items, subcategoryId) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const macroType = "item";
    const actions = items.map((item) =>
      this._buildEquipmentItem(actorId, tokenId, actor, macroType, item)
    );
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** @private */
  _getActiveEquipment(equipment) {
    let activeEquipment = [];
    if (!settings.get("showItemsWithoutAction")) {
      const activationTypes = Object.keys(
        game.dnd5e.config.abilityActivationTypes
      ).filter((at) => at !== "none");

      activeEquipment = equipment.filter((e) => {
        let activation = e.system.activation;
        if (!activation) return false;

        return activationTypes.includes(e.system.activation.type);
      });
    } else {
      activeEquipment = equipment;
    }

    return activeEquipment;
  }

  /** @private */
  _buildEquipmentItem(actorId, tokenId, actor, macroType, item) {
    let action = this._buildItem(actorId, tokenId, macroType, item);
    this._addItemInfo(actor, item, action);
    return action;
  }

  /** @private */
  _buildItem(actorId, tokenId, macroType, item) {
    const itemId = item.id;
    let encodedValue = [macroType, actorId, tokenId, itemId].join(
      this.delimiter
    );
    let img = this.getImage(item);
    let icon = this._getActionIcon(item.system.activation?.type);
    let result = {
      name: item.name,
      id: itemId,
      encodedValue: encodedValue,
      img: img,
      icon: icon,
      selected: true,
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

  /** SPELLS **/

  /** @private */
  _buildSpells(actionList, character) {
    const actor = character.actor;
    let validSpells = this._filterLongerActions(
      actor.items.filter((item) => item.type === "spell")
    );
    validSpells = this._filterExpendedItems(validSpells);

    if (actor.type === "character" || !settings.get("showAllNpcItems"))
      validSpells = this._filterNonpreparedSpells(validSpells);

    const spellsSorted = this._sortSpellsByLevel(validSpells);

    this._categoriseSpells(actionList, character, spellsSorted);
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
  _categoriseSpells(actionList, character, spells) {
    const macroType = "spell";
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;

    // Reverse sort spells by level
    const spellSlotInfo = Object.entries(actor.system.spells).sort((a, b) => {
      return b[0].toUpperCase().localeCompare(a[0].toUpperCase(), undefined, {
        sensitivity: "base",
      });
    });

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
    const spellLevelIds = [
      ...new Set(
        spells.map((spell) => {
          const prepId = spell.system.preparation.mode;
          const levelId = spell.system.level;
          const isPrep =
            prepId === "pact" || prepId === "atwill" || prepId === "innate"
              ? true
              : false;
          if (isPrep) {
            return prepId;
          } else {
            return levelId;
          }
        })
      ),
    ];

    // GET SPELL LEVELS
    const spellLevels = spellLevelIds.map((spellLevel) => {
      const isPrep =
        spellLevel === "pact" ||
        spellLevel === "atwill" ||
        spellLevel === "innate"
          ? true
          : false;
      const id = isPrep ? spellLevel : `spell${spellLevel}`;
      const name = isPrep
        ? game.dnd5e.config.spellPreparationModes[spellLevel]
        : spellLevel === 0
        ? this.i18n("tokenActionHud.cantrips")
        : `${this.i18n("tokenActionHud.level")} ${spellLevel}`;
      return [id, name];
    });

    // CREATE SUBCATEGORIES
    let subcategoriesList = [];

    for (const spellLevel of spellLevels) {
      const spellLevelId = `spells_${spellLevel[0]}`;
      const spellLevelName = spellLevel[1];
      const isPrep =
        spellLevelId === "pact" ||
        spellLevelId === "atwill" ||
        spellLevelId === "innate"
          ? true
          : false;
      const levelInfo = spellSlotInfo.find(
        (lvl) => lvl[0] === spellLevelId
      )?.[1];
      const slots = levelInfo?.value;
      const max = levelInfo?.max;
      const slotsAvailable = levelInfo?.slotsAvailable;
      const ignoreSlotsAvailable = settings.get("showEmptyItems");
      let subcategory = {};
      if ((max && slotsAvailable) || !max || ignoreSlotsAvailable) {
        subcategory = this.initializeEmptySubcategory(
          spellLevelId,
          "spells",
          spellLevelName
        );
        if (max > 0) subcategory.info1 = `${slots}/${max}`;
      }

      // CREATE ACTIONS
      let actions = [];
      for (const spell of spells) {
        const spellSpellLevelId = isPrep
          ? `spells_${spell.system.preparation.mode}`
          : `spells_spell${spell.system.level}`;

        if (spellSpellLevelId === spellLevelId) {
          let spellItem = this._buildItem(actorId, tokenId, macroType, spell);
          if (settings.get("showSpellInfo"))
            this._addSpellInfo(spell, spellItem);
          actions.push(spellItem);
        }
      }

      this.addToSubcategoriesList(
        subcategoriesList,
        spellLevelId,
        subcategory,
        actions
      );
    }
    this.addSubcategoriesToActionList(actionList, subcategoriesList, "spells");
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

  /** FEATURES **/

  /** @private */
  _buildFeatures(actionList, character) {
    const actor = character.actor;
    let validFeats = this._filterLongerActions(
      actor.items.filter((item) => item.type == "feat")
    );
    let sortedFeats = this.sortItems(validFeats);
    this._categoriseFeatures(actionList, character, sortedFeats);
  }

  /** @private */
  _categoriseFeatures(actionList, character, feats) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const parentNestId = "features";

    let subcategoriesList = [];
    const activeId = "features_active";
    const passiveId = "features_passive";
    const lairId = "features_lair";
    const legendaryId = "features_legendary";
    const actionsId = "features_actions";
    const featuresId = "features_features";
    const reactionsId = "features_reactions";
    let activeSubcategory = this.initializeEmptySubcategory(
      activeId,
      parentNestId,
      this.i18n("tokenActionHud.active")
    );
    let passiveSubcategory = this.initializeEmptySubcategory(
      passiveId,
      parentNestId,
      this.i18n("tokenActionHud.passive")
    );
    let lairSubcategory = this.initializeEmptySubcategory(
      lairId,
      parentNestId,
      this.i18n("tokenActionHud.dnd5e.lair")
    );
    let legendarySubcategory = this.initializeEmptySubcategory(
      legendaryId,
      parentNestId,
      this.i18n("tokenActionHud.dnd5e.legendary")
    );
    let actionsSubcategory = this.initializeEmptySubcategory(
      actionsId,
      parentNestId,
      this.i18n("tokenActionHud.actions")
    );
    let featuresSubcategory = this.initializeEmptySubcategory(
      featuresId,
      parentNestId,
      this.i18n("tokenActionHud.features")
    );
    let reactionsSubcategory = this.initializeEmptySubcategory(
      reactionsId,
      parentNestId,
      this.i18n("tokenActionHud.reactions")
    );
    let activeActions = [];
    let passiveActions = [];
    let lairActions = [];
    let legendaryActions = [];
    let actionsActions = [];
    let featuresActions = [];
    let reactionsActions = [];

    let dispose = feats.reduce(
      function (dispose, f) {
        const activationType = f.system.activation.type;
        const macroType = "feat";

        let feat = this._buildEquipmentItem(
          actorId,
          tokenId,
          actor,
          macroType,
          f
        );

        if (actor.type === "vehicle") {
          if (
            activationType &&
            activationType !== "none" &&
            activationType !== "reaction"
          ) {
            actionsActions.push(feat);
            return;
          }

          if (!activationType || activationType === "none") {
            featuresActions.push(feat);
            return;
          }

          if (activationType == "reaction") {
            reactionsActions.push(feat);
            return;
          }

          actionsActions.push(feat);
          return;
        }

        if (actor.type === "character" || actor.type === "npc") {
          if (!activationType || activationType === "") {
            passiveActions.push(feat);
            return;
          }

          if (activationType == "lair") {
            lairActions.push(feat);
            return;
          }

          if (activationType == "legendary") {
            legendaryActions.push(feat);
            return;
          }

          activeActions.push(feat);
          return;
        }
      }.bind(this),
      {}
    );

    this.addToSubcategoriesList(
      subcategoriesList,
      activeId,
      activeSubcategory,
      activeActions
    );
    
    if (!settings.get("ignorePassiveFeats")) {
      this.addToSubcategoriesList(
        subcategoriesList,
        passiveId,
        passiveSubcategory,
        passiveActions
      );
    }

    this.addToSubcategoriesList(
      subcategoriesList,
      lairId,
      lairSubcategory,
      lairActions
    );

    this.addToSubcategoriesList(
      subcategoriesList,
      legendaryId,
      legendarySubcategory,
      legendaryActions
    );
    
    this.addToSubcategoriesList(
      subcategoriesList,
      actionsId,
      actionsSubcategory,
      actionsActions
    );

    this.addToSubcategoriesList(
      subcategoriesList,
      featuresId,
      featuresSubcategory,
      featuresActions
    );

    this.addToSubcategoriesList(
      subcategoriesList,
      reactionsId,
      reactionsSubcategory,
      reactionsActions
    );

    this.addSubcategoriesToActionList(
      actionList,
      subcategoriesList,
      "features"
    );
  }

  /** ATTRIBUTES */

  /** @private */
  _buildAbilities(actionList, character, subcategoryId, macroType) {
    const actor = character.actor;
    const abilities = actor.system.abilities;
    let actions = this._getAbilityList(
      character,
      abilities,
      subcategoryId,
      macroType
    );
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** @private */
  _getAbilityList(character, abilities, subcategoryId, macroType) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const abbr = settings.get("abbreviateSkills");
    let actions = Object.entries(game.dnd5e.config.abilities).map((ability) => {
      const abilityId = ability[0];
      if (abilities[abilityId].value === 0) return;
      let name = abbr ? abilityId : ability[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [macroType, actorId, tokenId, abilityId].join(
        this.delimiter
      );
      let icon;
      if (subcategoryId === "checks") icon = "";
      else icon = this._getProficiencyIcon(abilities[abilityId].proficient);

      return {
        name: name,
        id: abilityId,
        encodedValue: encodedValue,
        icon: icon,
      };
    });

    return actions;
  }

  _buildMultiAbilities(actionList, tokenId, subcategoryId, macroType) {
    const abilities = game.dnd5e.config.abilities;
    const abbr = settings.get("abbreviateSkills");

    const actions = Object.entries(abilities).map((ability) => {
      const abilityId = ability[0];
      let name = abbr ? abilityId : ability[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      const encodedValue = [macroType, tokenId, abilityId].join(this.delimiter);

      return { name: name, id: abilityId, encodedValue: encodedValue };
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** SKILLS */

  /** @private */
  _buildSkills(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const skills = actor.system.skills;
    let macroType = "skill";

    let abbr = settings.get("abbreviateSkills");

    let actions = Object.entries(skills)
      .map((skill) => {
        try {
          let skillId = skill[0];
          let name = abbr ? skillId : game.dnd5e.config.skills[skillId].label;
          name = name.charAt(0).toUpperCase() + name.slice(1);
          let encodedValue = [macroType, actorId, tokenId, skillId].join(
            this.delimiter
          );
          let icon = this._getProficiencyIcon(skills[skillId].value);
          return {
            name: name,
            id: skillId,
            encodedValue: encodedValue,
            icon: icon,
          };
        } catch (error) {
          Logger.error(skill);
          return null;
        }
      })
      .filter((skill) => !!skill);

    this.addActionsToActionList(actionList, actions, "skills");
  }

  _buildMultiSkills(actionList, tokenId) {
    const skills = game.dnd5e.config.skills;
    const macroType = "skill";
    const abbr = settings.get("abbreviateSkills");
    const actions = Object.entries(skills).map((skill) => {
      const skillId = skill[0];
      let name = abbr ? skillId : skill[1].label;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      const encodedValue = [macroType, tokenId, skillId].join(this.delimiter);

      return { name: name, id: skillId, encodedValue: encodedValue };
    });

    this.addActionsToActionList(actionList, actions, "skills");
  }

  /** EFFECTS */

  /** @private */
  _buildEffects(actionList, character) {
    this._getEffects(actionList, character);
  }

  /** @private */
  _getEffects(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const parentNestId = "effects";
    const macroType = "effect";
    let subcategoriesList = [];
    const temporaryId = "effects_temporary-effects";
    const passiveId = "effects_passive-effects";
    let temporarySubcategory = this.initializeEmptySubcategory(
      temporaryId,
      parentNestId,
      this.i18n("tokenActionHud.temporary")
    );
    let passiveSubcategory = this.initializeEmptySubcategory(
      passiveId,
      parentNestId,
      this.i18n("tokenActionHud.passive")
    );
    let temporaryActions = [];
    let passiveActions = [];

    const effects =
      "find" in actor.effects.entries ? actor.effects.entries : actor.effects;

    effects.forEach((effect) => {
      const effectId = effect.id;
      const name = effect.label;
      const encodedValue = [macroType, actorId, tokenId, effectId].join(
        this.delimiter
      );
      const cssClass = effect.disabled ? "" : "active";
      const image = effect.icon;
      let action = {
        name: name,
        id: effectId,
        encodedValue: encodedValue,
        img: image,
        cssClass: cssClass,
      };

      effect.isTemporary
        ? temporaryActions.push(action)
        : passiveActions.push(action);
    });

    this.addToSubcategoriesList(
      subcategoriesList,
      temporaryId,
      temporarySubcategory,
      temporaryActions
    );
    this.addToSubcategoriesList(
      subcategoriesList,
      passiveId,
      passiveSubcategory,
      passiveActions
    );
    this.addSubcategoriesToActionList(actionList, subcategoriesList, "effects");
  }

  /** CONDITIONS */

  /** @private */
  _buildConditions(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const macroType = "condition";

    const availableConditions = CONFIG.statusEffects.filter(
      (condition) => condition.id !== ""
    );

    if (!availableConditions) return;

    let actions = [];
    availableConditions.forEach((condition) => {
      const conditionId = condition.id;
      const name = this.i18n(condition.label);
      const encodedValue = [macroType, actorId, tokenId, conditionId].join(
        this.delimiter
      );
      const effects =
        "some" in actor.effects.entries ? actor.effects.entries : actor.effects;
      const cssClass = effects.some(
        (effect) => effect.flags.core?.statusId === conditionId
      )
        ? "active"
        : "";
      const image = condition.icon;
      const action = {
        name: name,
        id: conditionId,
        encodedValue: encodedValue,
        img: image,
        cssClass: cssClass,
      };

      actions.push(action);
    });

    this.addActionsToActionList(actionList, actions, "conditions");
  }

  /** @private */
  _buildMultiConditions(actionList, tokenId, actors) {
    const macroType = "condition";
    let actions = [];
    const availableConditions = CONFIG.statusEffects.filter(
      (condition) => condition.id !== ""
    );
    if (!availableConditions) return;

    availableConditions.forEach((condition) => {
      const conditionId = condition.id;
      const name = this.i18n(condition.label);
      const encodedValue = [macroType, tokenId, conditionId].join(
        this.delimiter
      );
      const cssClass = actors.every((actor) => {
        const effects =
          "some" in actor.effects.entries
            ? actor.effects.entries
            : actor.effects;
        effects.some((effect) => effect.flags.core?.statusId === conditionId);
      })
        ? "active"
        : "";
      const image = condition.icon;
      const action = {
        name: name,
        id: conditionId,
        encodedValue: encodedValue,
        img: image,
        cssClass: cssClass,
      };

      actions.push(action);
    });

    this.addActionsToActionList(actionList, actions, "conditions");
  }

  /** COMBAT */

  /** @private */
  _buildCombat(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    if (!tokenId) return;
    let macroType = "utility";
    let actions = [];

    // Roll Initiative
    const combat = game.combat;
    let combatant, currentInitiative;
    if (combat) {
      combatant = combat.combatants.find(
        (combatant) => combatant.tokenId === tokenId
      );
      currentInitiative = combatant?.initiative;
    }
    let initiativeValue = [macroType, actorId, tokenId, "initiative"].join(
      this.delimiter
    );
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
      let endTurnValue = [macroType, actorId, tokenId, "endTurn"].join(
        this.delimiter
      );
      let endTurnAction = {
        id: "endTurn",
        encodedValue: endTurnValue,
        name: this.i18n("tokenActionHud.endTurn"),
      };

      actions.push(endTurnAction);
    }

    this.addActionsToActionList(actionList, actions, "combat");
  }

  /** @private */
  _buildMultiCombat(actionList, tokenId) {
    let macroType = "utility";
    let actions = [];

    // Roll Initiative
    const combat = game.combat;
    const initiativeValue = [macroType, tokenId, "initiative"].join(
      this.delimiter
    );
    let initiativeAction = {
      id: "rollInitiative",
      encodedValue: initiativeValue,
      name: this.i18n("tokenActionHud.rollInitiative"),
    };

    let isActive;
    if (combat) {
      const tokenIds = canvas.tokens.controlled.map((token) => token.id);
      const tokenCombatants = tokenIds.map((id) =>
        combat.combatants.find((combatant) => combatant.tokenId === id)
      );
      isActive = tokenCombatants.every((combatant) => !!combatant?.initiative);
    }
    initiativeAction.cssClass = isActive ? "active" : "";
    actions.push(initiativeAction);

    this.addActionsToActionList(actionList, actions, "combat");
  }

  /** RESTS */

  /** @private */
  _buildRests(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const macroType = "utility";
    let actions = [];

    if (actor.type === "character") {
      let shortRestValue = [macroType, actorId, tokenId, "shortRest"].join(
        this.delimiter
      );
      actions.push({
        id: "shortRest",
        encodedValue: shortRestValue,
        name: this.i18n("tokenActionHud.shortRest"),
      });
      let longRestValue = [macroType, actorId, tokenId, "longRest"].join(
        this.delimiter
      );
      actions.push({
        id: "longRest",
        encodedValue: longRestValue,
        name: this.i18n("tokenActionHud.longRest"),
      });
    }

    this.addActionsToActionList(actionList, actions, "rests");
  }

  /** @private */
  _buildMultiRests(actionList, tokenId, actors) {
    const macroType = "utility";
    let actions = [];

    if (actors.every((actor) => actor.type === "character")) {
      const shortRestValue = [macroType, tokenId, "shortRest"].join(
        this.delimiter
      );
      actions.push({
        id: "shortRest",
        encodedValue: shortRestValue,
        name: this.i18n("tokenActionHud.shortRest"),
      });
      const longRestValue = [macroType, tokenId, "longRest"].join(
        this.delimiter
      );
      actions.push({
        id: "longRest",
        encodedValue: longRestValue,
        name: this.i18n("tokenActionHud.longRest"),
      });
    }

    this.addActionsToActionList(actionList, actions, "rests");
  }

  /** UTILITY */

  /** @private */
  _buildUtility(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const macroType = "utility";

    let actions = [];
    if (actor.type === "character") {
      if (actor.system.attributes.hp.value <= 0) {
        let deathSaveValue = [macroType, actorId, tokenId, "deathSave"].join(
          this.delimiter
        );
        let deathSaveAction = {
          id: "deathSave",
          encodedValue: deathSaveValue,
          name: this.i18n("tokenActionHud.dnd5e.deathSave"),
        };
        actions.push(deathSaveAction);
      }

      let inspirationValue = [macroType, actorId, tokenId, "inspiration"].join(
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

    this.addActionsToActionList(actionList, actions, "utility");
  }

  /** @private */
  _buildMultiUtility(actionList, tokenId, actors) {
    const macroType = "utility";
    let actions = [];

    if (actors.every((actor) => actor.type === "character")) {
      let inspirationValue = [macroType, tokenId, "inspiration"].join(
        this.delimiter
      );
      let inspirationAction = {
        id: "inspiration",
        encodedValue: inspirationValue,
        name: this.i18n("tokenActionHud.inspiration"),
      };
      inspirationAction.cssClass = actors.every(
        (actor) => actor.system.attributes?.inspiration
      )
        ? "active"
        : "";
      actions.push(inspirationAction);
    }

    this.addActionsToActionList(actionList, actions, "utility");
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
      result = spells.filter((i) => i.system.preparation.prepared);
    }

    return result;
  }

  /** @private */
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

  /** @private */
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
