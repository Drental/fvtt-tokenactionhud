import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerBitD extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "actions"))
      this._buildActions(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "resistances"))
      this._buildResistances(actionList, character);

    return actionList;
  }

  _buildActions(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;const actionType = "action";
    const subcategoryId = "actions";
    let subcategoryList = [];
    const attributes = actor.system.attributes;
    attributes.map((attribute) => {
      const attributeSubcategoryId = attribute;
      const attributeSubcategoryName = this.i18n(
        actor.system.attributes[attribute].label
      );
      const subcategory = this.initializeEmptySubcategory(
        attributeSubcategoryId,
        subcategoryId,
        attributeSubcategoryName
      );
      const skills = actor.system.attributes[attribute].skills;
      const actions = skills.map((skill) => {
        const id = skillName;
        const name = this.i18n(skill.label);
        const encodedValue = [actionType, actorId, tokenId, id].join(
          this.delimiter
        );
        return {
          id: id,
          name: name,
          encodedValue: encodedValue,
          selected: true,
        };
      });
      this.addToSubcategoriesList(
        subcategoryList,
        attributeSubcategoryId,
        subcategory,
        actions
      );
    });
    this.addSubcategoriesToActionList(
      actionList,
      subcategoryList,
      subcategoryId
    );
  }

  _buildResistances(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;const actionType = "resistance";
    const subcategoryId = "resistances";
    const attributes = actor.system.attributes;
    const actions = attributes.map((attribute) => {
      const id = attribute;
      const name = this.i18n(actor.system.attributes[attribute].label);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      return {
        id: name,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      };
    });
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }
}
