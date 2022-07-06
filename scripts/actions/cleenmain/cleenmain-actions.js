import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerCleenmain extends ActionHandler {
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

    let actorType = actor.data.type;

    let weapons = this._getWeapons(actor, tokenId);
    let armors = this._getSkills(actor, tokenId);

    this._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.skills"),
      skills
    );
    this._combineCategoryWithList(
      result,
      this.i18n("tokenactionhud.weapons"),
      weapons
    );

    if (settings.get("showHudTitle")) result.hudTitle = token.data?.name;

    return result;
  }

  _getSkills(actor, tokenId) {
    let filteredItems = actor.items.filter(item => item.type == "skill").sort(function (a, b) {return a.name.localeCompare(b.name);});
    let result = this.initializeEmptyCategory("actorSkills");
    let abilitiesCategory = this.initializeEmptySubcategory();
    abilitiesCategory.actions = this._produceMap(
      tokenId,
      filteredItems,
      "skill"
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenactionhud.roll"),
      skillsCategory
    );
    return result;
  }

  _getWeapons(actor, tokenId) {
    let filteredItems = actor.items.filter((item) => item.type === "weapon");
    let result = this.initializeEmptyCategory("actorWeapons");
    let weaponsCategory = this.initializeEmptySubcategory();
    weaponsCategory.actions = this._produceMap(
      tokenId,
      filteredItems,
      "weapon"
    );

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenactionhud.roll"),
      weaponsCategory
    );
    return result;
  }

  _produceMap(tokenId, itemSet, type) {
    return itemSet.map((i) => {
      let encodedValue = [type, tokenId, i.id].join(this.delimiter);
      let img = this._getImage(i);
      let result = {
        name: i.name,
        encodedValue: encodedValue,
        id: i.id,
        img: img,
      };
      return result;
    });
  }

  _getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";
    return !result?.includes("systems/cleenmain/assets/image/default.png")
      ? result
      : "";
  }
}
