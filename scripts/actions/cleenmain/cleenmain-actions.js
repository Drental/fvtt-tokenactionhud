import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

const systemDefaultImages = ["systems/cleenmain/assets/image/default.png"];

export class ActionHandlerCleenmain extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "weapons"))
      this._buildWeapons(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._buildSkills(actionList, character);

    return actionList;
  }

  _buildWeapons(actionList, character) {
    const actor = character?.actor;
    const actionType = "weapon";
    const subcategoryId = "actorWeapons";
    const weapons = actor.items.filter((item) => item.type === actionType);
    this._buildActions(
      actionList,
      character,
      weapons,
      actionType,
      subcategoryId
    );
  }

  _buildSkills(actionList, character) {
    const actor = character?.actor;
    const actionType = "skill";
    const subcategoryId = "actorSkills";
    const skills = actor.items
      .filter((item) => item.type == actionType)
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    this._buildActions(
      actionList,
      character,
      skills,
      actionType,
      subcategoryId
    );
  }

  _buildActions(actionList, character, entities, actionType, subcategoryId) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actions = entities.map((entity) => {
      const id = entity.id;
      const name = entity.name;
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const img = this.getImage(entity, systemDefaultImages);
      return {
        id: id,
        name: name,
        encodedValue: encodedValue,
        img: img,
        selected: true,
      };
    });
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }
}
