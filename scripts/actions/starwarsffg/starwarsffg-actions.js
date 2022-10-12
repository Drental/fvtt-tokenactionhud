import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerStarWarsFFG extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
    this.filterManager.createOrGetFilter("skills");
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;
    if (!actor) return result;

    result.actorId = actor.id;

    let weapons = this._getItemsList(actor, tokenId, "weapon");
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.weapons"),
      weapons
    );

    let forcePowers = this._getItemsList(actor, tokenId, "forcepower");
    this._combineCategoryWithList(
      result,
      this.i18n("SWFFG.ForcePower"),
      forcePowers
    );

    const system = actor.system;

    system.skilltypes.forEach((type) => {
      let skills = this._getSkills(type, system, tokenId);
      this._combineCategoryWithList(result, type.label, skills);
    });

    if (game.user.isGM) {
      this._combineCategoryWithList(
        result,
        "utility",
        this._getGMList(multipleTokens)
      );
    }

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  /** @private */
  _getGMList(multipleTokens) {
    let result = this.initializeEmptyCategory("utility");
    let subcategory = this.initializeEmptySubcategory();
    let items = [
      {
        name: "Destiny Pool Init",
        encodedValue: "gm|destiny|destiny",
        id: "gm_destiny",
      },
    ];
    subcategory.actions = items;

    this._combineSubcategoryWithCategory(result, "GM", subcategory);

    return result;
  }

  /** @private */
  _getItemsList(actor, tokenId, type) {
    let result = this.initializeEmptyCategory(type);

    let subcategory = this.initializeEmptySubcategory();

    let items = actor.items.filter((i) => i.type === type);
    subcategory.actions = this._produceItemMap(tokenId, items, type);

    this._combineSubcategoryWithCategory(result, "", subcategory);

    return result;
  }

  /** @private */
  _getSkills(type, system, tokenId) {
    let categoryId = "skills";
    let actionType = "skill";

    let result = this.initializeEmptyCategory(categoryId);

    const skills = Object.keys(system.skills)
      .filter((s) => system.skills[s].type === type.type)
      .sort((a, b) => {
        let comparison = 0;
        if (a.toLowerCase() > b.toLowerCase()) {
          comparison = 1;
        } else if (a.toLowerCase() < b.toLowerCase()) {
          comparison = -1;
        }
        return comparison;
      });
    settings.Logger.debug(skills);
    let skillCat = this.initializeEmptySubcategory();
    skillCat.actions = this._produceSkillMap(tokenId, system, skills, actionType);

    this._combineSubcategoryWithCategory(result, "", skillCat);

    return result;
  }

  /** @private */
  _produceItemMap(tokenId, itemSet, type) {
    return itemSet.map((i) => {
      let encodedValue = [type, tokenId, i.id].join(this.delimiter);
      return { name: i.name, encodedValue: encodedValue, id: i.id };
    });
  }

  /** @private */
  _produceSkillMap(tokenId, system, skills, type) {
    return skills.map((i) => {
      let encodedValue = [type, tokenId, i].join(this.delimiter);
      return { name: system.skills[i].label, encodedValue: encodedValue, id: i };
    });
  }
}
