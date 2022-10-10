import * as settings from "../settings.js";

export class MacroActionHandler {
  baseHandler;

  constructor(baseHandler) {
    this.baseHandler = baseHandler;
  }

  /** @override */
  async buildMacroActions(actionList) {
    const subcategoryIds = Object.values(actionList.categories)
      .filter((category) => category.subcategories)
      .flatMap((category) =>
        Object.values(category.subcategories)
          .filter((subcategory) => subcategory.type === "custom")
          .flatMap((subcategory) => subcategory.id)
      );
    if (!subcategoryIds) return;

    const actions = await this.getEntriesForActions();
    for (const subcategoryId of subcategoryIds) {
      this.baseHandler.addActionsToActionList(
        actionList,
        actions,
        subcategoryId
      );
    }
  }

  async getEntriesForActions() {
    const macroType = "macro";
    const macros = game.macros.filter((macro) => {
      let permissions = macro.ownership;
      if (permissions[game.userId]) return permissions[game.userId] > 0;
      return permissions.default > 0;
    });
    return macros.map((macro) => {
      let encodedValue = [macroType, macro.id].join(this.baseHandler.delimiter);
      let img = this.baseHandler.getImage(macro);
      return {
        name: macro.name,
        encodedValue: encodedValue,
        id: macro.id,
        img: img,
        selected: false
      };
    });
  }
}
