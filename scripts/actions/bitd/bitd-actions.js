import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerBitD extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
    this.filterManager.createOrGetFilter("skills");
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

    let actions = this._getActions(actor, tokenId);
    let resistances = this._getResistances(actor, tokenId);

    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.actions"),
      actions
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.bitd.resistance"),
      resistances
    );

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  _getActions(actor, tokenId) {
    let result = this.initializeEmptyCategory("actions");

    for (let attribute in actor.system.attributes) {
      let attributeCategory = this.initializeEmptySubcategory();
      for (let skill_name in actor.system.attributes[attribute].skills) {
        let skill = actor.system.attributes[attribute].skills[skill_name];
        let name = this.i18n(skill.label);
        let encodedValue = ["action", tokenId, skill_name].join(this.delimiter);

        attributeCategory.actions.push({
          name: name,
          encodedValue: encodedValue,
        });
      }
      let attributeTitle = this.i18n(
        actor.system.attributes[attribute].label
      );
      this._combineSubcategoryWithCategory(
        result,
        attributeTitle,
        attributeCategory
      );
    }
    return result;
  }

  _getResistances(actor, tokenId) {
    let result = this.initializeEmptyCategory("actions");

    let resistanceCategory = this.initializeEmptySubcategory();
    for (let attribute in actor.system.attributes) {
      let name = this.i18n(actor.system.attributes[attribute].label);
      let encodedValue = ["resistance", tokenId, attribute].join(
        this.delimiter
      );
      resistanceCategory.actions.push({
        name: name,
        encodedValue: encodedValue,
      });
    }

    let resistanceTitle = this.i18n("tokenActionHud.bitd.resistance");
    this._combineSubcategoryWithCategory(
      result,
      resistanceTitle,
      resistanceCategory
    );

    return result;
  }
}
