import * as settings from "../../settings.js";

export class MacroHelper {
  constructor() {}

  static exists(key, macros) {
    if (!!macros) {
      return macros.some((m) => m._id === key);
    }

    const macroEntries =
      "some" in game.macros.entries ? game.macros.entries : game.macros;

    return !!macroEntries.some((m) => m._id === key);
  }

  static getEntriesForActions(delimiter) {
    let macroType = "macro";
    let entries = MacroHelper.getMacros();
    return entries.map((m) => {
      let encodedValue = [macroType, macroType, m._id].join(delimiter);
      let img = MacroHelper.getImage(m);
      return {
        name: m.name,
        encodedValue: encodedValue,
        id: m._id,
        img: img,
      };
    });
  }

  static getMacrosForFilter() {
    return MacroHelper.getMacros().map((m) => {
      return { id: m._id, value: m.name };
    });
  }

  static getMacros() {
    const macros =
      "filter" in game.macros.entries ? game.macros.entries : game.macros;

    return macros.filter((m) => {
      let permissions = m.ownership;
      if (permissions[game.userId]) return permissions[game.userId] > 0;

      return permissions.default > 0;
    });
  }

  static getImage(macro) {
    let result = "";
    if (settings.get("showIcons")) result = macro.img;

    return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
  }
}
