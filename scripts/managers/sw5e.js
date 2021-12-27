import { SystemManager } from "./manager.js";
import { ActionHandlerSW5e as ActionHandler } from "../actions/sw5e/sw5e-actions.js";
import { ActionHandlerSW5eGroupByType } from "../actions/sw5e/sw5e-actions-by-type.js";
import { MagicItemsPreRollHandler } from "../rollHandlers/sw5e/pre-magicItems.js";
import { MagicItemActionListExtender } from "../actions/magicItemsExtender.js";
import { RollHandlerBaseSW5e as Core } from "../rollHandlers/sw5e/sw5e-base.js";
import { RollHandlerMidiQolSW5e as MidiQolSW5e } from "../rollHandlers/sw5e/sw5e-midiqol.js";
import { RollHandlerObsidianSW5e as ObsidianSW5e } from "../rollHandlers/sw5e/sw5e-obsidian.js";
import * as settings from "../settings.js";
import * as systemSettings from "../settings/sw5e-settings.js";

export class SW5eSystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetActionHandler(filterManager, categoryManager) {
    let actionHandler;
    if (
      SystemManager.isModuleActive("character-actions-list-5e") &&
      settings.get("useActionList")
    ) {
      actionHandler = new ActionHandlerSW5eGroupByType(
        filterManager,
        categoryManager
      );
    } else {
      actionHandler = new ActionHandler(filterManager, categoryManager);
    }

    if (SystemManager.isModuleActive("magicitems"))
      actionHandler.addFurtherActionHandler(new MagicItemActionListExtender());

    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let coreTitle = "Core SW5e";

    if (SystemManager.isModuleActive("midi-qol"))
      coreTitle += ` [supports ${SystemManager.getModuleTitle("midi-qol")}]`;

    let choices = { core: coreTitle };
    SystemManager.addHandler(choices, "midi-qol");
    SystemManager.addHandler(choices, "obsidian");

    return choices;
  }

  /** @override */
  doGetRollHandler(handlerId) {
    let rollHandler;
    switch (handlerId) {
      case "midi-qol":
        rollHandler = new MidiQolSW5e();
        break;
      case "obsidian":
        rollHandler = new ObsidianSW5e();
        break;
      case "core":
      default:
        rollHandler = new Core();
        break;
    }

    if (SystemManager.isModuleActive("magicitems"))
      rollHandler.addPreRollHandler(new MagicItemsPreRollHandler());

    return rollHandler;
  }

  /** @override */
  doRegisterSettings(appName, updateFunc) {
    systemSettings.register(appName, updateFunc);
  }
}
