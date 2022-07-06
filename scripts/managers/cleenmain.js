import { SystemManager } from "./manager.js";
import { ActionHandlerCleenmain as ActionHandler } from "../actions/cleenmain/cleenmain-actions.js";
import { RollHandlerBaseCleenmain as Core } from "../rollHandlers/cleenmain/cleenmain-base.js";
import * as settings from "../settings/cleenmain-settings.js";

export class CleenmainSystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetActionHandler(filterManager, categoryManager) {
    console.log("startup");
    let actionHandler = new ActionHandler(filterManager, categoryManager);
    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let choices = { core: "Core Cle en main" };

    return choices;
  }

  /** @override */
  doGetRollHandler(handlerId) {
    return new Core();
  }

  /** @override */
  doRegisterSettings(appName, updateFunc) {
    settings.register(appName, updateFunc);
  }
}
