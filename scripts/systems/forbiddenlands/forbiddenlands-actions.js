import { ActionHandler } from '../../core/actions/actionHandler.js';
import * as settings from '../../core/settings.js';

export class ActionHandlerForbiddenlands extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    let attributes = {};
    let skills = {};
    let weapons = {};
    let inventory = {};
    let talents = {};
    let spells = {};
    let consumables = {};
    let conditions = {};
    let attack = {};
    let utility = {};

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

    let legitimateActors = ['character', 'monster'];
    let actorType = actor.type;
    if (!legitimateActors.includes(actorType)) return result;

    result.actorId = actor.id;
    if (actorType === 'character') {
      attributes = this._getAttributes(actor, tokenId);
      skills = this._getSkills(actor, tokenId);
      weapons = this._getWeaponsList(actor, tokenId);
      inventory = this._getItemsList(actor, tokenId);
      talents = this._getTalentsList(actor, tokenId);
      spells = this._getSpellsList(actor, tokenId);
      consumables = this._getConsumablesList(actor, tokenId);
      conditions = this._getConditionsList(actor, tokenId);
    } else if (actorType == 'monster') {
      attributes = this._getAttributes(actor, tokenId);
      skills = this._getSkills(actor, tokenId);
      talents = this._getMonsterTalentsList(actor, tokenId);
      attack = this._getAttacksList(actor, tokenId);
    }
    utility = this._getUtilityList(tokenId);

    // // console.log('ActionHandlerForbiddenLands -> buildSystemActions -> utility', utility);
    switch (actor.type) {
      case 'character':
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.skills'), skills);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.weapons'), weapons);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.inventory'), inventory);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.talents'), talents);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.spells'), spells);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.forbiddenLands.consumables'), consumables);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.forbiddenLands.conditions'), conditions);
        this._setFilterSuggestions(actor);
        if (settings.get('showHudTitle')) result.hudTitle = token.name;
        break;
      case 'monster':
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.skills'), skills);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.talents'), talents);
        this._combineCategoryWithList(result, this.i18n('tokenActionHud.attack'), attack);
        this._setFilterSuggestions(actor);
        if (settings.get('showHudTitle')) result.hudTitle = token.name;
        break;
      default:
        break;
    }
    this._combineCategoryWithList(result, this.i18n('tokenActionHud.utility'), utility);

    return result;
  }

  _getWeaponsList(actor, tokenId) {
    if (settings.get("showWeaponsCategory") === false) return;
    let actionType = 'weapon';
    let result = this.initializeEmptyCategory('items');

    let subcategory = this.initializeEmptySubcategory();
    subcategory.actions = this._produceMap(
      tokenId,
      actor.items.filter((i) => i.type == actionType),
      actionType
    );

    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.weapons'), subcategory);

    return result;
  }

  _getItemsList(actor, tokenId) {
    if (settings.get("showInventoryCategory") === false) return;
    let actionType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['item', 'armor'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this.foundrySort);

    let armourList = items.filter((i) => i.type === 'armor');
    let armourActions = this._buildItemActions(tokenId, 'armor', armourList);
    let armour = this.initializeEmptySubcategory();
    armour.actions = armourActions;

    let itemList = items.filter((i) => i.type === 'item');
    let itemActions = this._buildItemActions(tokenId, actionType, itemList);
    let item = this.initializeEmptySubcategory();
    item.actions = itemActions;

    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.armour'), armour);
    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.equipment'), item);

    return result;
  }

  _getTalentsList(actor, tokenId) {
    if (settings.get("showTalentsCategory") === false) return;
    let actionType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['talent'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this.foundrySort);

    let talentList = items.filter((i) => i.type === 'talent');
    let talentActions = this._buildItemActions(tokenId, actionType, talentList);
    let talent = this.initializeEmptySubcategory();
    talent.actions = talentActions;
    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.talents'), talent);

    return result;
  }

  _getSpellsList(actor, tokenId) {
    if (settings.get("showSpellsCategory") === false) return;
    let actionType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['spell'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this.foundrySort);

    let spellList = items.filter((i) => i.type === 'spell');
    let spellActions = this._buildItemActions(tokenId, actionType, spellList);
    let spell = this.initializeEmptySubcategory();
    spell.actions = spellActions;
    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.spells'), spell);

    return result;
  }

  _getConsumablesList(actor, tokenId) {
    if (settings.get("showConsumablesCategory") === false) return;
    let result = this.initializeEmptyCategory('consumables');
    let consumables = this.initializeEmptySubcategory();
    let powConsumables = this.initializeEmptySubcategory();
    let actionType = 'consumables';

    let rollableConsumables = Object.entries(actor.system.consumable);
    let consumablesMap = rollableConsumables.map((c) => {
      let name = this.i18n('tokenActionHud.forbiddenLands.' + c[0]);
      let id = c[0];
      let encodedValue = [actionType, tokenId, id, name].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });
    consumables.actions = this._produceMap(tokenId, consumablesMap, actionType);
    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.forbiddenLands.consumables'), consumables);

    return result;
  }

  /** @private */
  _buildItemActions(tokenId, actionType, itemList, isPassive = false) {
    let result = this._produceMap(tokenId, itemList, actionType, isPassive);

    result.forEach((i) =>
      this._addItemInfo(
        itemList.find((item) => item.id === i.id),
        i
      )
    );

    return result;
  }

  /** @private */
  _addItemInfo(item, itemAction) {
    itemAction.info1 = this._getQuantityData(item);
  }

  /** @private */
  _getQuantityData(item) {
    let result = '';
    let quantity = item.system.quantity?.value;
    if (quantity > 1) {
      result = quantity;
    }

    return result;
  }
  
  _getSkills(actor, tokenId) {
    if (settings.get("showSkillsCategory") === false) return;
    let result = this.initializeEmptyCategory('skills');
    let attributes = this.initializeEmptySubcategory();
    let actionType = 'skill';
    
    let rollableSkills = Object.entries(actor.system.skill);
    let skillMap = rollableSkills.map((c) => {
      let name = this.i18n('tokenActionHud.forbiddenLands.' + c[0]);
      let id = c[0];
      let encodedValue = [actionType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });
    
    attributes.actions = this._produceMap(tokenId, skillMap, actionType);
    
    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.skills'), attributes);
    
    return result;
}

  _getAttributes(actor, tokenId) {
    if (settings.get("showAttributesCategory") === false) return;
    let result = this.initializeEmptyCategory('attributes');
    let attributes = this.initializeEmptySubcategory();
    let actionType = 'attribute';

    let rollableAttributes = Object.entries(actor.system.attribute);
    let attributesMap = rollableAttributes.map((c) => {
      let name = this.i18n('tokenActionHud.forbiddenLands.' + c[0]);
      let id = c[0];
      let encodedValue = [actionType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });

    attributes.actions = this._produceMap(tokenId, attributesMap, actionType);

    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.attributes'), attributes);

    return result;
  }

  _getMonsterTalentsList(actor, tokenId) {
    let actionType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['monsterTalent'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this.foundrySort);

    let talentList = items.filter((i) => i.type === 'monsterTalent');
    let talentActions = this._buildItemActions(tokenId, actionType, talentList);
    let talent = this.initializeEmptySubcategory();
    talent.actions = talentActions;
    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.talents'), talent);

    return result;
  }

  _getAttacksList(actor, tokenId) {
    if (settings.get("showAttacksCategory") === false) return;
    let actionType = 'monsterAttack';
    let result = this.initializeEmptyCategory('attacks');
    let attacks = this.initializeEmptySubcategory();
    let filter = ['monsterAttack'];

    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this.foundrySort);

    let attacksList = items.filter((i) => i.type === 'monsterAttack');
    let attacksActions = this._buildItemActions(tokenId, actionType, attacksList);
    attacks.actions = attacksActions;

    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.attacks'), attacks);

    return result;
  }

  _buildMultipleTokenActions(list) {
    list.tokenId = 'multi';
    list.actorId = 'multi';

    const allowedTypes = ['monster', 'character'];
    let actors = canvas.tokens.controlled.map((t) => t.actor).filter((a) => allowedTypes.includes(a.type));
  }

  _getConditionsList(actor, tokenId) {
    if (settings.get("showConditionsCategory") === false) return;
    let result = this.initializeEmptyCategory('conditions');
    let conditions = this.initializeEmptySubcategory();
    let actionType = 'conditions';

    if (actor.type === 'character') {
      let general = this.initializeEmptySubcategory();
      let generalActions = [];

      let hungryStateValue = [actionType, tokenId, 'toggleHungry', ''].join(this.delimiter);
      generalActions = { id: 'toggleHungry', encodedValue: hungryStateValue, name: this.i18n("CONDITION.HUNGRY") };
      generalActions.cssClass = actor.system.condition.hungry.value ? 'active' : '';
      general.actions.push(generalActions);
      
      let thirstyStateValue = [actionType, tokenId, 'toggleThirsty', ''].join(this.delimiter);
      generalActions = { id: 'toggleThirsty', encodedValue: thirstyStateValue, name: this.i18n("CONDITION.THIRSTY") };
      generalActions.cssClass = actor.system.condition.thirsty.value ? 'active' : '';
      general.actions.push(generalActions);
      
      let coldStateValue = [actionType, tokenId, 'toggleCold', ''].join(this.delimiter);
      generalActions = { id: 'toggleCold', encodedValue: coldStateValue, name: this.i18n("CONDITION.COLD") };
      generalActions.cssClass = actor.system.condition.cold.value ? 'active' : '';
      general.actions.push(generalActions);
      
      let sleepyStateValue = [actionType, tokenId, 'toggleSleepy', ''].join(this.delimiter);
      generalActions = { id: 'toggleSleepy', encodedValue: sleepyStateValue, name: this.i18n("CONDITION.SLEEPY") };
      generalActions.cssClass = actor.system.condition.sleepy.value ? 'active' : '';
      general.actions.push(generalActions);

      this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.forbiddenLands.conditions'), general);
    }
    this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.utility'), conditions);

    return result;
  }

  _getUtilityList(tokenId) {
    if (settings.get("showUtilityCategory") === false) return;
    let result = this.initializeEmptyCategory('utility');

    // Combat Subcategory
    let combatSubcategory = this.initializeEmptySubcategory();
    let actionType = 'utility';
  
    // End Turn
    if (game.combat?.current?.tokenId === tokenId) {
      let endTurnValue = [actionType, tokenId, "endTurn", ''].join(this.delimiter);
      let endTurnAction = {
        id: "endTurn",
        encodedValue: endTurnValue,
        name: this.i18n("tokenActionHud.endTurn"),
      };

      combatSubcategory.actions.push(endTurnAction);
    }

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.combat"),
      combatSubcategory
    );

    return result;
  }

  /** @override */
  _setFilterSuggestions(id, items) {
    let suggestions = items?.map((s) => {
      return { id: s.id, value: s.name };
    });
    if (suggestions?.length > 0) this.filterManager.setSuggestions(id, suggestions);
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

  _produceMap(tokenId, itemSet, type) {
    return itemSet.map((i) => {
      let encodedValue = [type, tokenId, i.id, i.name.toLowerCase()].join(this.delimiter);
      let img = this.getImage(i);
      let result = { name: i.name, encodedValue: encodedValue, id: i.id, img: img };

      return result;
    });
  }
}
