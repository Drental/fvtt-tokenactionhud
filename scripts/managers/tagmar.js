import { SystemManager } from "./manager.js";
import { TagmarActionHandler as ActionHandler } from "../actions/tagmar/tagmar-actions.js";
import { TagmarHandler as Core } from "../rollHandlers/tagmar/tagmar-base.js";

export class TagmarSystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetActionHandler(filterManager, categoryManager) {
    let actionHandler = new ActionHandler(filterManager, categoryManager);

    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let coreTitle = "Tagmar RPG";

    let choices = { core: coreTitle };

    return choices;
  }

  /** @override */
  doGetRollHandler(handlerId) {
    let rollHandler;
    switch (handlerId) {
      case "core":
      default:
        rollHandler = new Core();
        break;
    }

    return rollHandler;
  }

  /** @override */
  doRegisterSettings(appName, updateFunc) {
    // settings.register(appName, updateFunc);
  }
}
