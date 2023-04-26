import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerSwade extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActionList(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    result.actorId = actor.id;

    this._addWoundsAndFatigue(result, tokenId, actor);
    this._addStatuses(result, tokenId, actor);
    if (actor.type === "character" || actor.type === "npc") {
      this._addBennies(result, tokenId, actor);
      this._addAttributes(result, tokenId, actor);
      this._addSkills(result, tokenId, actor);
      this._addEdgesAndHinderances(result, tokenId, actor);
      this._addSpecialAbilities(result, tokenId, actor);
      this._addPowers(result, tokenId, actor);
    }
    if (actor.type === "vehicle") {

    }
    this._addGear(result, tokenId, actor);
    this._addUtilities(result, tokenId, actor);

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  /** @private */
  _addAttributes(list, tokenId, actor) {
    if (settings.get("showAttributesCategory") === false) return;
    const attr = actor.system.attributes;
    if (!attr) return;
    const macroType = "attribute";

    const subcat = this.initializeEmptySubcategory("attributes");
    Object.entries(attr).forEach((a) => {
      const key = a[0];
      const data = a[1];

      const nameData = CONFIG.SWADE.attributes[key];

      let name;
      if (settings.get("abbreviateAttributes"))
        name = this.i18n(nameData.short);
      else name = this.i18n(nameData.long);

      const encodedValue = [macroType, tokenId, key].join(this.delimiter);
      const action = { name: name, encodedValue: encodedValue, id: key };

      const mod = this._buildDieString(data.die, data["wild-die"]);
      action.info1 = mod;

      subcat.actions.push(action);
    });
    
    const catName = this.i18n("SWADE.Attributes");
    let cat = this.initializeEmptyCategory("attributes");

    const subcatName = this.i18n("SWADE.Attributes");
    this._combineSubcategoryWithCategory(cat, subcatName, subcat);

    const derivedStatsSubcatName = this.i18n("SWADE.Derived");
    const derivedStatsSubcat = this._getDerivedStatsSubcategory(tokenId, actor);
    this._combineSubcategoryWithCategory(cat, derivedStatsSubcatName, derivedStatsSubcat);

    this._combineCategoryWithList(list, catName, cat);
  }

  /** @private */
  _getDerivedStatsSubcategory(tokenId, actor) {
    const subcat = this.initializeEmptySubcategory("derivedStats");
    
    // Running Die
    const runningDieMacroType = "runningDie";
    const runningDieId = "runningDie";
    const runningDieName = game.i18n.localize("SWADE.RunningDie")
    const runningDieEncodedValue = [runningDieMacroType, tokenId, runningDieId].join(this.delimiter);
    const runningDieAction = { name: runningDieName, encodedValue: runningDieEncodedValue, id: runningDieId };
    const runningDieValue = actor.system.stats.speed.runningDie
    runningDieAction.info1 = `d${runningDieValue}`;

    subcat.actions.push(runningDieAction);

    return subcat;
  }

  /** @private */
  _addSkills(list, tokenId, actor) {
    if (settings.get("showSkillsCategory") === false) return;
    const cat = this.initializeEmptyCategory("skills");
    const macroType = "skill";
    const skills = actor.items.filter((i) => i.type === macroType);

    const subcat = this.initializeEmptySubcategory("skills");
    skills.forEach((s) => {
      const encodedValue = [macroType, tokenId, s.id].join(this.delimiter);
      const action = { name: s.name, img: s.img, encodedValue: encodedValue, id: s.id };

      let mod = this._parseDie(s.system.die, s.system["wild-die"]);
      action.info1 = mod;

      subcat.actions.push(action);
    });

    const skillName = this.i18n("SWADE.Skills");
    this._combineSubcategoryWithCategory(cat, skillName, subcat);
    this._combineCategoryWithList(list, skillName, cat);
  }

  /** @private */
  _addPowers(list, tokenId, actor) {
    if (settings.get("showPowersCategory") === false) return;
    const powers = actor.items.filter((i) => i.type === "power");
    if (powers.length === 0) return;

    const macroType = "powerPoints";
    const cat = this.initializeEmptyCategory(macroType);

    const noPowerPoints = game.settings.get("swade", "noPowerPoints");
    const powerPointPools = (noPowerPoints) 
      ? Object.entries(actor.system.powerPoints)
      .filter((powerPointPool) => powerPointPool[0] === 'general')
      : Object.entries(actor.system.powerPoints)
      .filter((powerPointPool) => powerPointPool[1].value >= 0)

    powerPointPools.forEach((powerPointPool) => {
      const arcane = powerPointPool[0] === 'general' ? '' : powerPointPool[0];
      if (!noPowerPoints && powers.some((power) => power.system.arcane === arcane)) {
        const name = powerPointPool[0].charAt(0).toUpperCase() + powerPointPool[0].slice(1);
        const pp = powerPointPool[1];
        pp.value = pp.value ?? 0;
        pp.max = pp.max ?? 0;
  
        if (powerPointPools.length === 0) {
          cat.info1 = `${pp.value}/${pp.max}`;
        }

        this._addCounterSubcategory(
          cat,
          tokenId,
          pp,
          name,
          macroType,
          powerPointPool[0]
        );
      }

      const poolPowers = (noPowerPoints) 
        ? powers
        : powers.filter((power) => power.system.arcane === arcane);
      
      const groupedPowers = this._groupPowers(poolPowers);

      Object.entries(groupedPowers).forEach((g) => {
        const key = g[0];
        const groupPowers = g[1];
        this._addPowersSubcategory(tokenId, key, groupPowers, macroType, cat);
      });

    })

    const powersName = this.i18n("tokenActionHud.powers");
    this._combineCategoryWithList(list, powersName, cat); 
  }

  /** @private */
  _groupPowers(powers) {
    const powerTypes = [...new Set(powers.map((i) => i.system.rank))];

    return powerTypes.reduce((grouped, p) => {
      let powerName = p;
      if (powerName === "") powerName = "No rank";

      if (!grouped.hasOwnProperty(p)) grouped[powerName] = [];

      grouped[powerName].push(...powers.filter((i) => i.system.rank === p));

      return grouped;
    }, {});
  }

  /** @private */
  _addGear(list, tokenId, actor) {
    if (settings.get("showGearCategory") === false) return;
    const cat = this.initializeEmptyCategory("gear");

    let items = actor.items;

    if (actor.type === "character" || actor.type === "vehicle") {
      items = items.filter((i) => ![0, 1].includes(i.system.equipStatus));
    }
    
    const weapons = items.filter((i) => i.type === "weapon");
    const weaponsName = this.i18n("tokenActionHud.weapons");
    this._addItemSubcategory(tokenId, weaponsName, weapons, "weapons", cat);

    const armour = items.filter((i) => i.type === "armor");
    const armourName = this.i18n("tokenActionHud.armour");
    this._addItemSubcategory(tokenId, armourName, armour, "armour", cat);

    const shields = items.filter((i) => i.type === "shield");
    const shieldsName = this.i18n("tokenActionHud.swade.shields");
    this._addItemSubcategory(tokenId, shieldsName, shields, "shields", cat);

    const misc = items.filter((i) => i.type === "misc" || (actor.type !== "vehicle" && i.type === "gear"));
    const miscName = this.i18n("tokenActionHud.swade.misc");
    this._addItemSubcategory(tokenId, miscName, misc, "misc", cat);

    const mods = items.filter((i) => actor.type === "vehicle" && i.type === "gear");
    const modsName = this.i18n("tokenActionHud.swade.mods");
    this._addItemSubcategory(tokenId, modsName, mods, "mods", cat);

    this._combineCategoryWithList(
      list,
      this.i18n("tokenActionHud.swade.gear"),
      cat
    );
  }

  /** @private */
  _addWoundsAndFatigue(list, tokenId, actor) {
    if (settings.get("showWoundsFatigueCategory") === false) return;
    let woundsCategory = this.initializeEmptyCategory("wounds");

    // Wounds Subcategory
    const woundsName = this.i18n("tokenActionHud.swade.wounds");
    this._addCounterSubcategory(
      woundsCategory,
      tokenId,
      actor.system.wounds,
      woundsName,
      "wounds"
    );
    
    // Fatigue Subcategory
    if (actor.type !== "vehicle") {
      const fatigueName = this.i18n("tokenActionHud.swade.fatigue");
      this._addCounterSubcategory(
        woundsCategory,
        tokenId,
        actor.system.fatigue,
        fatigueName,
        "fatigue"
      );
    }
    
    const woundsAndFatigueName = (actor.type === "vehicle")
      ? this.i18n("tokenActionHud.swade.wounds") 
      : this.i18n("tokenActionHud.swade.woundsAndFatigue");
    this._combineCategoryWithList(
      list,
      woundsAndFatigueName,
      woundsCategory
    );
  }

  /** @private */
  _addCounterSubcategory(category, tokenId, countItem, name, macroType, id = null) {
    if (!countItem || (countItem.max < 1 && countItem.value < 1)) return;

    const actionId = (id) ? `>${id}` : '';
    const decreaseValue = [macroType, tokenId, `decrease${actionId}`].join(this.delimiter);
    const decreaseAction = {
      name: "-",
      encodedValue: decreaseValue,
      id: `${id}_${macroType}Decrease`,
      cssClass: "shrink",
    };

    const increaseValue = [macroType, tokenId, `increase${actionId}`].join(this.delimiter);
    const increaseAction = {
      name: "+",
      encodedValue: increaseValue,
      id: `${id}_${macroType}Increase`,
      cssClass: "shrink",
    };

    const subcat = this.initializeEmptySubcategory(macroType);
    subcat.info1 = `${countItem.value}/${countItem.max}`;
    subcat.actions.push(decreaseAction);
    subcat.actions.push(increaseAction);

    this._combineSubcategoryWithCategory(category, name, subcat);
  }

  /** @private */
  _addEdgesAndHinderances(list, tokenId, actor) {
    if (settings.get("showEdgesHindrancesCategory") === false) return;
    const cat = this.initializeEmptyCategory("edges");

    const edges = actor.items.filter((i) => i.type === "edge");
    const edgesName = this.i18n("tokenActionHud.swade.edges");
    this._addItemSubcategory(tokenId, edgesName, edges, "edges", cat);

    const hindrances = actor.items.filter((i) => i.type === "hindrance");
    const hindName = this.i18n("tokenActionHud.swade.hindrances");
    this._addItemSubcategory(tokenId, hindName, hindrances, "hindrances", cat);

    this._combineCategoryWithList(
      list,
      this.i18n("tokenActionHud.swade.edgesAndHindrances"),
      cat
    );
  }

  _addSpecialAbilities(list, tokenId, actor) {
    if (settings.get("showSpecialAbilitiesCategory") === false) return;
    const cat = this.initializeEmptyCategory("abilities");

    const specialAbilities = actor.items.filter((i) => i.type === "ability");
    const abilityName = this.i18n("tokenActionHud.abilities");
    this._addItemSubcategory(tokenId, abilityName, specialAbilities, "abilities", cat);

    this._combineCategoryWithList(
      list,
      this.i18n("tokenActionHud.swade.specialAbilities"),
      cat
    );
  }

  /** @private */
  _addPowersSubcategory(tokenId, subcatName, items, itemType, category) {
    const macroType = "item";
    const subcat = this.initializeEmptySubcategory(itemType);

    items
      .filter((i) => i.name !== "-")
      .forEach((i) => {
        const action = this._buildPowerAction(tokenId, i);
        subcat.actions.push(action);
      });

    this._combineSubcategoryWithCategory(category, subcatName, subcat);
  }

  /** @private */
  _addItemSubcategory(tokenId, subcatName, items, itemType, category) {
    const macroType = "item";
    const subcat = this.initializeEmptySubcategory(itemType);

    items
      .filter((i) => i.name !== "-")
      .forEach((i) => {
        const action = this._buildItemAction(tokenId, i);
        subcat.actions.push(action);
      });

    this._combineSubcategoryWithCategory(category, subcatName, subcat);
  }

  /** @private */
  _addStatuses(list, tokenId, actor) {
    if (settings.get("showStatusCategory") === false) return;
    const cat = this.initializeEmptyCategory("status");
    const macroType = "status";
    const statuses = actor.system.status;

    const subcat = this.initializeEmptySubcategory("status");
    Object.entries(statuses).forEach((s) => {
      const key = s[0];
      const value = s[1];

      const name = key.slice(2).split(/(?=[A-Z])/).join(" ");
      const id = name.toLowerCase();
      const encodedValue = [macroType, tokenId, id].join(this.delimiter);
      const action = { name: name, id: name, encodedValue: encodedValue };
      action.cssClass = value ? "active" : "";

      subcat.actions.push(action);
    });

    const statusesName = this.i18n("tokenActionHud.swade.status");
    this._combineSubcategoryWithCategory(cat, statusesName, subcat);
    this._combineCategoryWithList(list, statusesName, cat);
  }

  /** @private */
  _addBennies(list, tokenId, actor) {
    if (settings.get("showBenniesCategory") === false) return;
    const bennies = actor.system.bennies;
    if (!bennies) return;

    const cat = this.initializeEmptyCategory("bennies");
    const macroType = "benny";
    const benniesName = this.i18n("tokenActionHud.swade.bennies");

    // Spend Bennies
    const spendName = this.i18n("tokenActionHud.swade.spend");
    const spendValue = [macroType, tokenId, "spend"].join(this.delimiter);
    const spendAction = {
      name: spendName,
      encodedValue: spendValue,
      id: `bennySpend`,
    };

    const tokenSubcat = this.initializeEmptySubcategory(macroType);
    tokenSubcat.name = benniesName;
    tokenSubcat.info1 = bennies.value.toString();
    cat.info1 = bennies.value.toString();

    tokenSubcat.actions.push(spendAction);

    // Give Bennies
    const giveName = this.i18n("tokenActionHud.swade.give");
    if (this._checkGiveBennies(game.user.role)) {
      const giveValue = [macroType, tokenId, "give"].join(this.delimiter);
      const giveAction = { name: giveName, encodedValue: giveValue, id: `bennyGive` };
      tokenSubcat.actions.push(giveAction);
    }
    
    this._combineSubcategoryWithCategory(cat, benniesName, tokenSubcat);

    if (game.user.isGM) {
      const gmBennies = game.user.getFlag("swade", "bennies") ?? 0;
      if (gmBennies !== null) {
        const gmMacroType = "gmBenny";
        const gmSpend = [gmMacroType, tokenId, "spend"].join(this.delimiter);
        const gmSpendAction = {
          name: spendName,
          encodedValue: gmSpend,
          id: `gmBennySpend`,
        };

        const gmGive = [gmMacroType, tokenId, "give"].join(this.delimiter);
        const gmGiveAction = {
          name: giveName,
          encodedValue: gmGive,
          id: `gmBennyGive`,
        };

        const gmSubcat = this.initializeEmptySubcategory(gmMacroType);
        gmSubcat.actions.push(gmSpendAction);
        gmSubcat.actions.push(gmGiveAction);
        const gmName = `${this.i18n("tokenActionHud.swade.gm")} ${benniesName}`;
        gmSubcat.info2 = gmBennies.toString();
        cat.info2 = gmBennies.toString();
        this._combineSubcategoryWithCategory(cat, gmName, gmSubcat);
      }
    }

    this._combineCategoryWithList(list, benniesName, cat);
  }

   /** @private */
   _checkGiveBennies (userRole) {
    const allowGiveBennies = settings.get("allowGiveBennies")
    if (userRole >= allowGiveBennies) return true
    return false
  }

  /** @private */
  _addUtilities(list, tokenId, actor) {
    if (settings.get("showUtilityCategory") === false) return;
    let cat = this.initializeEmptyCategory("utility");
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

    const utilityName = this.i18n("tokenActionHud.utility");
    const combatName = this.i18n("tokenActionHud.combat");
    this._combineSubcategoryWithCategory(cat, combatName, combatSubcategory);
    this._combineCategoryWithList(list, utilityName, cat);
  }

  /** @private */
  _parseDie(die, wild) {
    let dieMod = this._buildDieString(die);

    if (!wild) return dieMod;

    let wildMod = this._buildDieString(wild);
    if (
      dieMod.toUpperCase().localeCompare(wildMod.toUpperCase(), undefined, {
        sensitivity: "base",
      }) === 0
    )
      return dieMod;

    return `${dieMod}/${wildMod}`;
  }

  /** @private */
  _buildDieString(die) {
    if (!die) return "";

    let result = `d${die.sides}`;

    const mod = parseInt(die.modifier);
    if (!die.modifier || mod === 0) return result;

    let dieMod = mod > 0 ? `+${mod}` : `${mod}`;

    result += dieMod;

    return result;
  }

  /** @private */
  _buildItemAction(tokenId, item) {
    const macroType = "item";
    const id = item.id;
    const name = item.name;
    const encodedValue = [macroType, tokenId, id].join(this.delimiter);
    const action = { name: name, id: id, encodedValue: encodedValue };

    action.info1 = this._getItemQuantity(item);
    action.info2 = this._getItemShots(item);

    action.img = item.img;

    return action;
  }

  /** @private */
  _getItemQuantity(item) {
    if (item.system.quantity !== 1) return item.system.quantity;

    return "";
  }

  /** @private */
  _getItemShots(item) {
    const curr = item.system.currentShots;
    const shots = item.system.shots;

    if (!curr) return;

    let result = "";
    if (curr != 0 || shots != 0) result += curr;

    if (shots > 0) result += `/${shots}`;

    return result;
  }

  /** @private */
  _buildPowerAction(tokenId, item) {
    const macroType = "item";
    const id = item.id;
    const name = item.name;
    const encodedValue = [macroType, tokenId, id].join(this.delimiter);
    const action = { name: name, id: id, encodedValue: encodedValue };

    action.info1 = this._getPowerPoints(item);

    action.img = item.img;

    return action;
  }

  /** @private */
  _getPowerPoints(item) {
    const pp = item.system.pp;
    if (pp.toString().toLowerCase() === "special") return "*";

    const points = parseInt(pp.toString());

    if (points === NaN) return "";

    return points;
  }
}
