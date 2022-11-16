import { ActionHandler } from "../../core/actions/actionHandler.js";
import * as settings from "../../core/settings.js";
import { Logger } from "../../core/logger.js";

export class ActionHandlerT20 extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  buildSystemActions(actionList, character, subcategoryIds) {
    let result = this.initializeEmptyActionList();

    if (multipleTokens) {
      this._buildMultipleTokenActions(result);
      return result;
    }

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    result.actorId = actor.id;

    let items = this._getItemList(actor, tokenId);
    let spells = this._getSpellsList(actor, tokenId);
    let feats = this._getFeatsList(actor, tokenId);
    let abilities = this._getAbilityList(actor, tokenId);
    let skills = this._getSkillsList(actor.system.pericias, tokenId);
    let conditions = this._getConditionsList(actor, tokenId);
    // let effects = this._getEffectsList(actor, tokenId);

    let itemsTitle = this.i18n("tokenActionHud.inventory");
    let spellsTitle = this.i18n("tokenActionHud.spells");
    let featsTitle = this.i18n("tokenActionHud.features");
    let abilitiesTitle = this.i18n("tokenActionHud.abilities");
    let skillsTitle = this.i18n("tokenActionHud.skills");
    let conditionsTitle = this.i18n('tokenActionHud.conditions');
    // let effectsTitle = this.i18n('tokenActionHud.effects');

    this._combineCategoryWithList(result, itemsTitle, items);
    this._combineCategoryWithList(result, spellsTitle, spells);
    this._combineCategoryWithList(result, featsTitle, feats);
    this._combineCategoryWithList(result, abilitiesTitle, abilities);
    this._combineCategoryWithList(result, skillsTitle, skills);
    this._combineCategoryWithList(result, conditionsTitle, conditions);
    // this._combineCategoryWithList(result, effectsTitle, effects);

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  _buildMultipleTokenActions(list) {
    list.tokenId = "multi";
    list.actorId = "multi";

    const allowedTypes = ["npc", "character"];
    let actors = canvas.tokens.controlled
      .map((t) => t.actor)
      .filter((a) => allowedTypes.includes(a.type));

    const tokenId = list.tokenId;

    this._addMultiSkills(list, tokenId);

    let abilitiesTitle = this.i18n("tokenActionHud.abilities");
    this._addMultiAbilities(
      list,
      tokenId,
      "atributos",
      abilitiesTitle,
      "atributo"
    );

    // if (settings.get('showConditionsCategory'))
    // this._addMultiConditions(list, tokenId);
  }

  /** ITEMS **/

  /** @private */
  _getItemList(actor, tokenId) {
    let validItems = this._filterLongerActions(
      actor.items.filter((i) => i.system.qtd > 0)
    );
    let sortedItems = this.sortItems(validItems);
    let actionType = "item";

    let equipped;
    // if (actor.type === 'npc' && settings.get('showAllNpcItems')) {
    // equipped = sortedItems.filter(i => i.type !== 'consumivel' && i.type !== 'magia' && i.type !== 'poder');
    // } else {
    // equipped = sortedItems.filter(i => i.type !== 'consumivel' && i.system.equipped);
    // }
    equipped = sortedItems.filter((i) => i.type !== "consumivel");
    let activeEquipped = this._getActiveEquipment(equipped);

    let weapons = activeEquipped.filter((i) => i.type == "arma");
    let weaponActions = weapons.map((w) =>
      this._buildEquipmentItem(tokenId, actor, actionType, w)
    );
    let weaponsCat = this.initializeEmptySubcategory();
    weaponsCat.actions = weaponActions;

    let equipment = activeEquipped.filter((i) => i.type == "equip");
    let equipmentActions = equipment.map((e) =>
      this._buildEquipmentItem(tokenId, actor, actionType, e)
    );
    let equipmentCat = this.initializeEmptySubcategory();
    equipmentCat.actions = equipmentActions;

    let other = activeEquipped.filter(
      (i) => i.type !== "arma" && i.type !== "equip"
    );
    let otherActions = other.map((o) =>
      this._buildEquipmentItem(tokenId, actor, actionType, o)
    );
    let otherCat = this.initializeEmptySubcategory();
    otherCat.actions = otherActions;

    let allConsumables = this._getActiveEquipment(
      sortedItems.filter((i) => i.type == "consumivel")
    );

    let expendedFiltered = this._filterExpendedItems(allConsumables);
    let consumable = expendedFiltered;
    let consumableActions = consumable.map((c) =>
      this._buildEquipmentItem(tokenId, actor, actionType, c)
    );
    let consumablesCat = this.initializeEmptySubcategory();
    consumablesCat.actions = consumableActions;

    let tools = validItems.filter((t) => t.type === "tool");
    let toolsActions = tools.map((i) =>
      this._buildEquipmentItem(tokenId, actor, actionType, i)
    );
    let toolsCat = this.initializeEmptySubcategory();
    toolsCat.actions = toolsActions;

    let weaponsTitle = this.i18n("tokenActionHud.weapons");
    let equipmentTitle = this.i18n("tokenActionHud.equipment");
    let otherTitle = this.i18n("tokenActionHud.other");
    let consumablesTitle = this.i18n("tokenActionHud.consumables");
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
    this._combineSubcategoryWithCategory(result, toolsTitle, toolsCat);

    return result;
  }

  /** @private */
  _getActiveEquipment(equipment) {
    const activationTypes = Object.keys(
      game.tormenta20.config.listaAtivacao | {}
    ).filter((at) => at !== "none");
    const includeList = ["poder", "magia", "consumivel"];

    let activeEquipment = equipment.filter((e) => {
      if (!includeList.includes(e.type)) return true;
      let activation = e.system.ativacao;
      if (!activation) return false;

      return activationTypes.includes(e.system.ativacao.execucao);
    });

    return activeEquipment;
  }

  /** SPELLS **/

  /** @private */
  _getSpellsList(actor, tokenId) {
    let validSpells = this._filterLongerActions(
      actor.items.filter((i) => i.type === "magia")
    );
    validSpells = this._filterExpendedItems(validSpells);

    // if (actor.type === 'character' || !settings.get('showAllNpcItems'))
    // validSpells = this._filterNonpreparedSpells(validSpells);

    let spellsSorted = this._sortSpellsByLevel(validSpells);
    let spells = this._categoriseSpells(actor, tokenId, spellsSorted);

    return spells;
  }

  /** @private */
  _sortSpellsByLevel(spells) {
    let result = Object.values(spells);

    result.sort((a, b) => {
      if (a.system.circulo === b.system.circulo)
        return a.name
          .toUpperCase()
          .localeCompare(b.name.toUpperCase(), undefined, {
            sensitivity: "base",
          });
      return a.system.circulo - b.system.circulo;
    });

    return result;
  }

  /** @private */
  _categoriseSpells(actor, tokenId, spells) {
    const powers = this.initializeEmptySubcategory();
    const book = this.initializeEmptySubcategory();
    const actionType = "magia";

    let dispose = spells.reduce(
      function (dispose, s) {
        let prep = s.system.preparada;
        var level = s.system.circulo;

        var levelName, levelKey;

        if (prep) {
          levelKey = prep;
        } else {
          levelKey = "magia" + level;
          levelName = `${this.i18n("tokenActionHud.level")} ${level}`;
        }

        let spell = this._buildItem(tokenId, actor, actionType, s);

        // if (settings.get('showSpellInfo'))
        // this._addSpellInfo(s, spell);

        // Initialise subcategory if non-existant.
        let subcategory = book.subcategories.find(
          (cat) => cat.name === levelName
        );

        if (!subcategory) {
          subcategory = this.initializeEmptySubcategory();
          // subcategory.info1 = `${actor.system.attributes.pm.value}/${actor.system.attributes.pm.max}`;
        }

        subcategory.actions.push(spell);

        if (book.subcategories.indexOf(subcategory) < 0)
          this._combineSubcategoryWithCategory(book, levelName, subcategory);

        return dispose;
      }.bind(this),
      {}
    );

    let result = this.initializeEmptyCategory("magias");

    let powersTitle = this.i18n("tokenActionHud.powers");
    let booksTitle = this.i18n("tokenActionHud.books");

    this._combineSubcategoryWithCategory(result, powersTitle, powers);
    this._combineSubcategoryWithCategory(result, booksTitle, book);

    return result;
  }

  /** @private */
  _addSpellInfo(s, spell) {
    let c = s.system.duracao;

    spell.info1 = "";
    spell.info2 = "";
    spell.info3 = "";
    if (c?.unidade === "sust") spell.info1 += "S";
  }

  /** FEATS **/

  /** @private */
  _getFeatsList(actor, tokenId) {
    let validFeats = this._filterLongerActions(
      actor.items.filter((i) => i.type == "poder")
    );
    let sortedFeats = this.sortItems(validFeats);
    let feats = this._categoriseFeatures(tokenId, actor, sortedFeats);

    return feats;
  }

  /** @private */
  _categoriseFeatures(tokenId, actor, feats) {
    let active = this.initializeEmptySubcategory();
    let passive = this.initializeEmptySubcategory();
    let lair = this.initializeEmptySubcategory();
    let legendary = this.initializeEmptySubcategory();

    let dispose = feats.reduce(
      function (dispose, f) {
        const activationType = f.system.ativacao.execucao;
        const actionType = "poder";

        let feat = this._buildEquipmentItem(tokenId, actor, actionType, f);

        if (
          !activationType ||
          activationType === "" ||
          activationType === "Livre"
        ) {
          passive.actions.push(feat);
          return;
        }

        active.actions.push(feat);

        return;
      }.bind(this),
      {}
    );

    let result = this.initializeEmptyCategory("poderes");

    let activeTitle = this.i18n("tokenActionHud.active");
    this._combineSubcategoryWithCategory(result, activeTitle, active);

    // if (!settings.get('ignorePassiveFeats')) {
    let passiveTitle = this.i18n("tokenActionHud.passive");
    this._combineSubcategoryWithCategory(result, passiveTitle, passive);
    // }

    return result;
  }

  /** @private */
  _getSkillsList(skills, tokenId) {
    let result = this.initializeEmptyCategory("pericia");
    let actionType = "pericia";

    let abbr = false; //settings.get('abbreviateSkills');

    let skillsActions = Object.entries(skills)
      .filter((s) => Object.keys(game.tormenta20.config.pericias).includes(s[0]))
      .map((e) => {
        try {
          let skillId = e[0];
          let skillName =  game.tormenta20.config.pericias[skillId] ?? e[1].label ?? e[1].name;
          let name = abbr ? skillId : skillName;
          name = name.charAt(0).toUpperCase() + name.slice(1);
          let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);
          let icon = this._getProficiencyIcon(skills[skillId].treinado);
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
    let skillsCategory = this.initializeEmptySubcategory();
    skillsCategory.actions = skillsActions;

    let skillsTitle = this.i18n("tokenActionHud.skills");
    this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);

    return result;
  }

  _addMultiSkills(list, tokenId) {
    let result = this.initializeEmptyCategory("pericia");
    let actionType = "pericia";

    let abbr = false; //settings.get('abbreviateSkills');

    let skillsActions = Object.entries(game.tormenta20.config.pericias).map(
      (e) => {
        let name = abbr ? e[0] : e[1];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);
        return { name: name, id: e[0], encodedValue: encodedValue };
      }
    );
    let skillsCategory = this.initializeEmptySubcategory();
    skillsCategory.actions = skillsActions;

    let skillsTitle = this.i18n("tokenActionHud.skills");
    this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);
    this._combineCategoryWithList(list, skillsTitle, result, true);
  }

  /** @private */
  _getAbilityList(actor, tokenId) {
    const actionType = "atributo";
    let abilityCategory = this.initializeEmptyCategory("atributos");
    let abilitySubcategory = this.initializeEmptySubcategory();
    const abilitySubcategoryName = this.i18n("tokenActionHud.abilities");
    
    let abbr = false; //settings.get('abbreviateSkills');

    const abilities = actor.system.atributos;
    
    let actions = Object.entries(game.tormenta20.config.atributos).map((e) => {
      if (abilities[e[0]].value === 0) return;

      let name = abbr ? e[0] : e[1];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);
      let icon = "";

      return { name: name, id: e[0], encodedValue: encodedValue, icon: icon };
    });
    
    abilitySubcategory.actions = actions.filter((a) => !!a);

    this._combineSubcategoryWithCategory(
      abilityCategory,
      abilitySubcategoryName,
      abilitySubcategory);

    return abilityCategory;
  }

  _addMultiAbilities(list, tokenId, categoryId, categoryName, actionType) {
    let cat = this.initializeEmptyCategory(categoryId);

    let abbr = false; //settings.get('abbreviateSkills');

    let actions = Object.entries(game.tormenta20.config.atributos).map((e) => {
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

  /** @private */
  _getEffectsList(actor, tokenId) {
    let result = this.initializeEmptyCategory("effects");

    this._addEffectsSubcategories(actor, tokenId, result);

    return result;
  }

  /** @private */
  _getConditionsList(actor, tokenId) {
    let result = this.initializeEmptyCategory("conditions");
    this._addConditionsSubcategory(actor, tokenId, result);
    return result;
  }

  /** @private */
  _addEffectsSubcategories(actor, tokenId, category) {
    const actionType = "effect";

    const effects = actor.effects.entries;

    let tempCategory = this.initializeEmptySubcategory();
    let passiveCategory = this.initializeEmptySubcategory();

    effects.forEach((e) => {
      const name = e.system.label;
      const encodedValue = [actionType, tokenId, e.id].join(this.delimiter);
      const cssClass = e.system.disabled ? "" : "active";
      const image = e.system.icon;
      let action = {
        name: name,
        id: e.id,
        encodedValue: encodedValue,
        img: image,
        cssClass: cssClass,
      };

      e.isTemporary
        ? tempCategory.actions.push(action)
        : passiveCategory.actions.push(action);
    });

    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.temporary"),
      tempCategory
    );
    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.passive"),
      passiveCategory
    );
  }

  /** @private */
  _addMultiConditions(list, tokenId) {
    const category = this.initializeEmptyCategory("conditions");
    const actionType = "condition";

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
      const encodedValue = [actionType, tokenId, c.id].join(this.delimiter);
      const cssClass = actors.every((actor) =>
        actor.effects.entries.some((e) => e.flags.core?.statusId === c.id)
      )
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
  _addConditionsSubcategory(actor, tokenId, category) {
    const actionType = "condition";

    const availableConditions = CONFIG.statusEffects.filter(
      (condition) => condition.id !== ""
    );

    if (!availableConditions) return;

    let conditions = this.initializeEmptySubcategory();

    availableConditions.forEach((c) => {
      const name = this.i18n(c.label);
      const encodedValue = [actionType, tokenId, c.id].join(this.delimiter);
      const cssClass = actor.effects.some(
        (e) => e.flags.core?.statusId === c.id
      )
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

    this._combineSubcategoryWithCategory(
      category,
      this.i18n("tokenActionHud.conditions"),
      conditions
    );
  }

  /** @private */
  _addCombatSubcategory(actionType, category, tokenId) {
    let combatSubcategory = this.initializeEmptySubcategory();

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
  _buildEquipmentItem(tokenId, actor, actionType, item) {
    let action = this._buildItem(tokenId, actor, actionType, item);
    this._addItemInfo(actor, item, action);
    return action;
  }

  /** @private */
  _buildItem(tokenId, actor, actionType, item) {
    let encodedValue = [actionType, tokenId, item.id].join(this.delimiter);
    let img = this.getImage(item);
    let icon = this._getActionIcon(item.system?.ativacao?.execucao);
    let result = {
      name: item.name,
      id: item.id,
      encodedValue: encodedValue,
      img: img,
      icon: icon,
    };

    return result;
  }

  /** @private */
  _addItemInfo(actor, item, action) {
    action.info1 = this._getQuantityData(item);

    action.info2 = "";

    action.info3 = "";
  }

  /** @private */
  _getQuantityData(item) {
    let result = "";
    let quantity = item.system.qtd;
    if (quantity > 1) {
      result = quantity;
    }

    return result;
  }

  /** @private */
  _filterLongerActions(items) {
    var result;

    // if (settings.get('hideLongerActions'))
    // result = items.filter(i => !i.system.ativacao);

    return result ? result : items;
  }

  /** @private */
  _filterNonpreparedSpells(spells) {
    let result = spells.filter((i) => i.system.preparada);

    return result;
  }

  _filterExpendedItems(items) {
    // if (settings.get('showEmptyItems'))
    // return items;

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
      1: '<i class="fas fa-check"></i>',
    };
    return icons[level];
  }

  _getActionIcon(action) {
    const img = {
      //padrao: `<i class="fas fa-fist-raised"></i>`,
      movimento: `<i class="fas fa-plus"></i>`,
      reacao: `<i class="fas fa-bolt"></i>`,
      livre: `<i class="far fa-circle"></i>`,
      completa: `<i class="fas fa-star"></i>`,
      duasRodadas: `<i class="fas fa-hourglass-start"></i>`,
      verTexto: `<i class="fas fa-book"></i>`,
    };
    return img[action];
  }
}
