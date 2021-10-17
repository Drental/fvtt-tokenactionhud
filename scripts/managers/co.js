import { SystemManager } from "./manager.js";
import { ActionHandlerCo as ActionHandler } from "../actions/co/co-actions.js";
import { RollHandlerBaseCo as Core } from "../rollHandlers/co/co-base.js";
import * as settings from "../settings/co-settings.js";

export class CoSystemManager extends SystemManager {
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
    let choices = { core: "Core CO" };

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
