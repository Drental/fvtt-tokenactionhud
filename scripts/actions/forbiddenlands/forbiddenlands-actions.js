import { ActionHandler } from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerForbiddenlands extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActionList(token, multipleTokens) {
    let attributes = {};
    let skills = {};
    let weapons = {};
    let inventory = {};
    let talents = {};
    let consumables = {};
    let conditions = {};
    let attack = {};

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
      consumables = this._getConsumablesList(actor, tokenId);
      conditions = this._getConditionsList(actor, tokenId);
    } else if (actorType == 'monster') {
      attributes = this._getAttributes(actor, tokenId);
      talents = this._getMonsterTalentsList(actor, tokenId);
      attack = this._getAttackList(actor, tokenId);
    }
    // // console.log('ActionHandlerForbiddenLands -> doBuildActionList -> utility', utility);
    switch (actor.type) {
      case 'character':
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.skills'), skills);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.weapons'), weapons);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), inventory);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.talents'), talents);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.forbiddenlands.consumables'), consumables);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.forbiddenlands.conditions'), conditions);
        this._setFilterSuggestions(actor);
        if (settings.get('showHudTitle')) result.hudTitle = token.name;
        break;
      case 'monster':
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.talents'), talents);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.attack'), attack);
        this._setFilterSuggestions(actor);
        if (settings.get('showHudTitle')) result.hudTitle = token.name;
        break;

      default:
        break;
    }

    return result;
  }

  _getWeaponsList(actor, tokenId) {
    let macroType = 'weapon';
    let result = this.initializeEmptyCategory('items');

    let subcategory = this.initializeEmptySubcategory();
    subcategory.actions = this._produceMap(
      tokenId,
      actor.items.filter((i) => i.type == macroType),
      macroType
    );

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.weapons'), subcategory);

    return result;
  }

  _getItemsList(actor, tokenId) {
    let macroType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['item', 'armor'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);

    let armourList = items.filter((i) => i.type === 'armor');
    let armourActions = this._buildItemActions(tokenId, 'armor', armourList);
    let armour = this.initializeEmptySubcategory();
    armour.actions = armourActions;

    let itemList = items.filter((i) => i.type === 'item');
    let itemActions = this._buildItemActions(tokenId, macroType, itemList);
    let item = this.initializeEmptySubcategory();
    item.actions = itemActions;

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.armour'), armour);
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.equipment'), item);

    return result;
  }

  _getTalentsList(actor, tokenId) {
    let macroType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['talent'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);

    let talentList = items.filter((i) => i.type === 'talent');
    let talentActions = this._buildItemActions(tokenId, macroType, talentList);
    let talent = this.initializeEmptySubcategory();
    talent.actions = talentActions;
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.talents'), talent);

    return result;
  }

  _getConsumablesList(actor, tokenId) {
    let result = this.initializeEmptyCategory('consumables');
    let consumables = this.initializeEmptySubcategory();
    let powConsumables = this.initializeEmptySubcategory();
    let macroType = 'consumables';

    let rollableConsumables = Object.entries(actor.system.consumable);
    let consumablesMap = rollableConsumables.map((c) => {
      let name = this.i18n('tokenactionhud.settings.forbiddenlands.consumables' + c[0]);
      let id = c[0];
      let encodedValue = [macroType, tokenId, id, name].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });
    consumables.actions = this._produceMap(tokenId, consumablesMap, macroType);
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.forbiddenlands.consumables'), consumables);

    return result;
  }

  /** @private */
  _buildItemActions(tokenId, macroType, itemList, isPassive = false) {
    let result = this._produceMap(tokenId, itemList, macroType, isPassive);

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
      let result = this.initializeEmptyCategory('skills');
      let attributes = this.initializeEmptySubcategory();
      let macroType = 'skill';
      
      let rollableSkills = Object.entries(actor.system.skill);
    let skillMap = rollableSkills.map((c) => {
        let name = this.i18n('tokenactionhud.settings.forbiddenlands.skill' + c[0]);
        let id = c[0];
      let encodedValue = [macroType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });
    
    attributes.actions = this._produceMap(tokenId, skillMap, macroType);
    
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.skills'), attributes);
    
    return result;
}

  _getAttributes(actor, tokenId) {
    let result = this.initializeEmptyCategory('attributes');
    let attributes = this.initializeEmptySubcategory();
    let macroType = 'attribute';

    let rollableAttributes = Object.entries(actor.system.attribute);
    let attributesMap = rollableAttributes.map((c) => {
      let name = this.i18n('tokenactionhud.settings.forbiddenlands.attribute' + c[0]);
      let id = c[0];
      let encodedValue = [macroType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });

    attributes.actions = this._produceMap(tokenId, attributesMap, macroType);

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);

    return result;
  }

  _getMonsterTalentsList(actor, tokenId) {
    let macroType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['monsterTalent'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);

    let talentList = items.filter((i) => i.type === 'monsterTalent');
    let talentActions = this._buildItemActions(tokenId, macroType, talentList);
    let talent = this.initializeEmptySubcategory();
    talent.actions = talentActions;
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.talents'), talent);

    return result;
  }

  _getAttackList(actor, tokenId) {
      let macroType = 'monsterAttack';
    let result = this.initializeEmptyCategory('attack');
    let attack = this.initializeEmptySubcategory();
    let filter = ['monsterAttack'];

    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);

    let attackList = items.filter((i) => i.type === 'monsterAttack');
    let attackActions = this._buildItemActions(tokenId, macroType, attackList);
    attack.actions = attackActions;

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attack'), attack);

    return result;
  }

  _buildMultipleTokenList(list) {
    list.tokenId = 'multi';
    list.actorId = 'multi';

    const allowedTypes = ['monster', 'character'];
    let actors = canvas.tokens.controlled.map((t) => t.actor).filter((a) => allowedTypes.includes(a.data.type));
  }

  _getConditionsList(actor, tokenId) {
    let result = this.initializeEmptyCategory('conditions');
    let conditions = this.initializeEmptySubcategory();
    let macroType = 'conditions';

    if (actor.type === 'character') {
      let general = this.initializeEmptySubcategory();
      let generalActions = [];

      let hungryStateValue = [macroType, tokenId, 'toggleHungry', ''].join(this.delimiter);
      generalActions = { id: 'toggleHungry', encodedValue: hungryStateValue, name: this.i18n("CONDITION.HUNGRY") };
      generalActions.cssClass = actor.system.condition.hungry.value ? 'active' : '';
      general.actions.push(generalActions);
      
      let thirstyStateValue = [macroType, tokenId, 'toggleThirsty', ''].join(this.delimiter);
      generalActions = { id: 'toggleThirsty', encodedValue: thirstyStateValue, name: this.i18n("CONDITION.THIRSTY") };
      generalActions.cssClass = actor.system.condition.thirsty.value ? 'active' : '';
      general.actions.push(generalActions);
      
      let coldStateValue = [macroType, tokenId, 'toggleCold', ''].join(this.delimiter);
      generalActions = { id: 'toggleCold', encodedValue: coldStateValue, name: this.i18n("CONDITION.COLD") };
      generalActions.cssClass = actor.system.condition.cold.value ? 'active' : '';
      general.actions.push(generalActions);
      
      let sleepyStateValue = [macroType, tokenId, 'toggleSleepy', ''].join(this.delimiter);
      generalActions = { id: 'toggleSleepy', encodedValue: sleepyStateValue, name: this.i18n("CONDITION.SLEEPY") };
      generalActions.cssClass = actor.system.condition.sleepy.value ? 'active' : '';
      general.actions.push(generalActions);

      this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.forbiddenlands.conditions'), general);
    }
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.utility'), conditions);

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
      let img = this._getImage(i);
      let result = { name: i.name, encodedValue: encodedValue, id: i.id, img: img };

      return result;
    });
  }

  _getImage(item) {
    let result = '';
    if (settings.get('showIcons')) result = item.img ?? '';

    return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
  }
  
  /** @protected */
  _foundrySort(a, b) {
    if (!(a?.data?.sort || b?.data?.sort)) return 0;

    return a.data.sort - b.data.sort;
  }
}
