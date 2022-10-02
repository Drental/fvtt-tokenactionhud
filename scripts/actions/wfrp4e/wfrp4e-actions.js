import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerWfrp extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
    this.filterManager.createOrGetFilter("skills");
  }

  /** @override */
  async buildSystemActions(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    result.actorId = actor.id;

    let characteristics = this._getCharacteristics(actor, tokenId);
    let skills = this._getSkills(actor, tokenId);
    let talents = this._getTalents(actor, tokenId);
    let weapons = this._getItemsList(actor, tokenId, "weapon");
    let magic = this._getSpells(actor, tokenId);
    let prayers = this._getPrayers(actor, tokenId);
    let traits = this._getTraits(actor, tokenId);
    let utility = this._getUtility(tokenId);

    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.characteristics"),
      characteristics
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.skills"),
      skills
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.talents"),
      talents
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.weapons"),
      weapons
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.magic"),
      magic
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.wfrp.religion"),
      prayers
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.traits"),
      traits
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.utility"),
      utility
    );

    this._setFilterSuggestions(actor);

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  _getItemsList(actor, tokenId, type) {
    if (settings.get("showWeaponsCategory") === false) return;
    let types = type + "s";
    let result = this.initializeEmptyCategory("items");

    let basicSubcategory = this._getBasicActions(actor, tokenId);
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.basic"),
      basicSubcategory
    );

    let subcategory = this.initializeEmptySubcategory();
    let items = actor.getItemTypes(type);
    let filtered =
      actor.type === "character"
        ? items.filter((i) => i.system.equipped)
        : items;
    subcategory.actions = this._produceMap(tokenId, filtered, type);

    this._combineSubcategoryWithCategory(result, types, subcategory);

    return result;
  }

  _getBasicActions(actor, tokenId) {
    let basicActions = this.initializeEmptySubcategory();

    let unarmed = ["unarmed", tokenId, "unarmed"].join(this.delimiter);
    const unarmedAction = {
      id: "unarmed",
      name: this.i18n("tokenActionHud.wfrp.unarmed"),
      encodedValue: unarmed,
    };
    basicActions.actions.push(unarmedAction);

    let stompValue = ["stomp", tokenId, "stomp"].join(this.delimiter);
    const stompAction = {
      id: "stomp",
      name: this.i18n("tokenActionHud.wfrp.stomp"),
      encodedValue: stompValue,
    };
    basicActions.actions.push(stompAction);

    let improvisedValue = ["improvise", tokenId, "improvise"].join(
      this.delimiter
    );
    const improvisedAction = {
      id: "improvise",
      name: this.i18n("tokenActionHud.wfrp.improvisedWeapon"),
      encodedValue: improvisedValue,
    };
    basicActions.actions.push(improvisedAction);

    let dodgeValue = ["dodge", tokenId, "dodge"].join(this.delimiter);
    const dodgeAction = {
      id: "dodge",
      name: this.i18n("tokenActionHud.wfrp.dodge"),
      encodedValue: dodgeValue,
    };
    basicActions.actions.push(dodgeAction);

    return basicActions;
  }

  _getCharacteristics(actor, tokenId) {
    if (settings.get("showCharacteristicsCategory") === false) return;
    let result = this.initializeEmptyCategory("characteristics");
    let macroType = "characteristic";

    let characteristics = Object.entries(actor.characteristics);
    let characteristicsCategory = this.initializeEmptySubcategory();
    characteristicsCategory.actions = characteristics.map((c) => {
      let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
      return {
        name: this.i18n(c[1].abrev),
        encodedValue: encodedValue,
        id: c[0],
      };
    });

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.characteristics"),
      characteristicsCategory
    );

    return result;
  }

  _getSkills(actor, tokenId) {
    if (settings.get("showSkillsCategory") === false) return;
    let categoryId = "skills";
    let macroType = "skill";

    let result = this.initializeEmptyCategory(categoryId);
    let skills = actor.getItemTypes("skill").filter((i) => i.id);

    result.choices = skills.length;

    let transMelee = game.i18n.localize("tokenActionHud.wfrp.melee");
    let transRanged = game.i18n.localize(
      "tokenActionHud.wfrp.ranged"
    );

    let meleeSkills = skills.filter((s) => s.name.startsWith(transMelee));
    let meleeId = `${categoryId}_melee`;
    this._setFilterSuggestions(meleeId, meleeSkills);
    let meleeCat = this.initializeEmptySubcategory(meleeId);
    meleeCat.canFilter = meleeSkills.length > 0 ? true : false;
    let filteredMeleeSkills = this._filterElements(meleeId, meleeSkills);
    meleeCat.actions = this._produceMap(
      tokenId,
      filteredMeleeSkills,
      macroType
    );

    let rangedSkills = skills.filter((s) =>
      s.name.startsWith(transRanged)
    );
    let rangedId = `${categoryId}_ranged`;
    this._setFilterSuggestions(rangedId, rangedSkills);
    let rangedCat = this.initializeEmptySubcategory(rangedId);
    rangedCat.canFilter = rangedSkills.length > 0 ? true : false;
    let filteredRangedSkills = this._filterElements(rangedId, rangedSkills);
    rangedCat.actions = this._produceMap(
      tokenId,
      filteredRangedSkills,
      macroType
    );

    let basicSkills = skills.filter(
      (s) =>
        !(
          s.name.startsWith(transMelee) ||
          s.name.startsWith(transRanged)
        ) && s.system.advanced.value !== "adv"
    );
    let basicId = `${categoryId}_basic`;
    this._setFilterSuggestions(basicId, basicSkills);
    let basicSkillsCat = this.initializeEmptySubcategory(basicId);
    let filteredBasicSkills = this._filterElements(basicId, basicSkills);
    basicSkillsCat.canFilter = basicSkills.length > 0 ? true : false;
    basicSkillsCat.actions = this._produceMap(
      tokenId,
      filteredBasicSkills,
      macroType
    );

    let advancedSkills = skills.filter(
      (s) =>
        !(
          s.name.startsWith(transMelee) ||
          s.name.startsWith(transRanged)
        ) && s.system.advanced.value === "adv"
    );
    let advancedId = `${categoryId}_advanced`;
    this._setFilterSuggestions(advancedId, advancedSkills);
    let advancedSkillsCat = this.initializeEmptySubcategory(advancedId);
    advancedSkillsCat.canFilter = advancedSkills.length > 0 ? true : false;
    let filteredAdvancedSkills = this._filterElements(
      advancedId,
      advancedSkills
    );
    advancedSkillsCat.actions = this._produceMap(
      tokenId,
      filteredAdvancedSkills,
      macroType
    );

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.melee"),
      meleeCat
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.ranged"),
      rangedCat
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.basic"),
      basicSkillsCat
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.advanced"),
      advancedSkillsCat
    );

    return result;
  }

  /** @override */
  _setFilterSuggestions(id, items) {
    let suggestions = items?.map((s) => {
      return { id: s.id, value: s.name };
    });
    if (suggestions?.length > 0)
      this.filterManager.setSuggestions(id, suggestions);
  }

  _filterElements(categoryId, skills) {
    let filteredNames = this.filterManager.getFilteredNames(categoryId);
    let result = skills.filter((s) => !!s);
    if (filteredNames.length > 0) {
      if (this.filterManager.isBlocklist(categoryId)) {
        result = skills.filter((s) => !filteredNames.includes(s.name));
      } else {
        result = skills.filter((s) => filteredNames.includes(s.name));
      }
    }

    return result;
  }

  _getSpells(actor, tokenId) {
    if (settings.get("showMagicCategory") === false) return;
    let macroType = "spell";
    let result = this.initializeEmptyCategory("spells");

    let spells = actor.getItemTypes("spell");

    let petties = spells.filter((i) => i.system.lore.value === "petty");
    let pettyCategory = this.initializeEmptySubcategory();
    pettyCategory.actions = this._produceMap(tokenId, petties, macroType);

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.petty"),
      pettyCategory
    );

    let lores = spells.filter((i) => i.system.lore.value !== "petty");
    let loresCategorised = lores.reduce((output, spell) => {
      let loreType = spell.system.lore.value;
      if (!output.hasOwnProperty(loreType)) {
        output[loreType] = [];
      }

      output[loreType].push(spell);

      return output;
    }, {});

    Object.entries(loresCategorised).forEach((loreCategory) => {
      let subcategory = this.initializeEmptySubcategory();
      subcategory.actions = this._produceMap(
        tokenId,
        loreCategory[1],
        macroType
      );
      this._combineSubcategoryWithCategory(
        result,
        loreCategory[0],
        subcategory
      );
    });

    return result;
  }

  _getPrayers(actor, tokenId) {
    if (settings.get("showReligionCategory") === false) return;
    let macroType = "prayer";
    let result = this.initializeEmptyCategory("prayers");

    let prayers = actor.getItemTypes("prayer");

    let blessings = prayers.filter((i) => i.type.value === "blessing");
    let blessingCategory = this.initializeEmptySubcategory();
    blessingCategory.actions = this._produceMap(tokenId, blessings, macroType);

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.blessing"),
      blessingCategory
    );

    let miracles = prayers.filter((i) => i.type.value !== "blessing");
    let miraclesCategorised = miracles.reduce((output, prayer) => {
      let miracleType = prayer.system.type.value;
      if (!output.hasOwnProperty(miracleType)) {
        output[miracleType] = [];
      }

      output[miracleType].push(prayer);

      return output;
    }, {});

    Object.entries(miraclesCategorised).forEach((miracleCategory) => {
      let subcategory = this.initializeEmptySubcategory();
      subcategory.actions = this._produceMap(
        tokenId,
        miracleCategory[1],
        macroType
      );
      this._combineSubcategoryWithCategory(
        result,
        miracleCategory[0],
        subcategory
      );
    });

    return result;
  }

  _getTalents(actor, tokenId) {
    if (settings.get("showTalentsCategory") === false) return;
    let macroType = "talent";
    let result = this.initializeEmptyCategory("talents");

    let talents = actor.getItemTypes("talent");

    let rollableTalents = talents.filter((t) => t.rollable?.value);
    let rollableCategory = this.initializeEmptySubcategory();
    rollableCategory.actions = this._produceMap(
      tokenId,
      rollableTalents,
      macroType
    );

    let unrollableTalents = talents.filter((t) => !t.rollable?.value);
    let unrollableCategory = this.initializeEmptySubcategory();
    unrollableCategory.actions = this._produceMap(
      tokenId,
      unrollableTalents,
      macroType
    );

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.rollable"),
      rollableCategory
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.unrollable"),
      unrollableCategory
    );

    return result;
  }

  _getTraits(actor, tokenId) {
    if (settings.get("showTraitsCategory") === false) return;
    let macroType = "trait";
    let result = this.initializeEmptyCategory("traits");

    let traits = actor.getItemTypes("trait").filter((i) => i.included);

    let rollableTraits = traits.filter((t) => t.rollable?.value);
    let rollableCategory = this.initializeEmptySubcategory();
    rollableCategory.actions = this._produceMap(
      tokenId,
      rollableTraits,
      macroType
    );

    let unrollableTraits = traits.filter((t) => !t.rollable?.value);
    let unrollableCategory = this.initializeEmptySubcategory();
    unrollableCategory.actions = this._produceMap(
      tokenId,
      unrollableTraits,
      macroType
    );

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.rollable"),
      rollableCategory
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.wfrp.unrollable"),
      unrollableCategory
    );

    return result;
  }

  _getUtility(tokenId) {
    if (settings.get("showUtilityCategory") === false) return;
    let result = this.initializeEmptyCategory("utility");
    let macroType = "utility";

    // Combat Subcategory
    let combatSubcategory = this.initializeEmptySubcategory();
  
    // End Turn
    if (game.combat?.current?.tokenId === tokenId) {
      let endTurnValue = [macroType, tokenId, "endTurn"].join(this.delimiter);
      let endTurnAction = {
        id: "endTurn",
        encodedValue: endTurnValue,
        name: this.i18n("tokenActionHud.endTurn"),
      };

      combatSubcategory.actions.push(endTurnAction);
    }

    const combatTitle = this.i18n("tokenActionHud.combat")
    this._combineSubcategoryWithCategory(
      result,
      combatTitle,
      combatSubcategory
    );

    return result;
  }

  _produceMap(tokenId, itemSet, type) {
    return itemSet.map((i) => {
      let encodedValue = [type, tokenId, i.id].join(this.delimiter);
      let img = this._getImage(i);
      return { name: i.name, encodedValue: encodedValue, id: i.id, img: img };
    })
    .sort((a, b) => {
      return a.name
        .toUpperCase()
        .localeCompare(b.name.toUpperCase(), undefined, {
          sensitivity: "base",
        });
    });
  }

  _getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";

    return result?.includes("icons/svg/mystery-man.svg") ||
      result?.includes("systems/wfrp4e/icons/blank.png")
      ? ""
      : result;
  }
}
