import { SystemManager } from "./manager.js";
import { ActionHandlerCoC7 as ActionHandler } from "../actions/coc7/coc7-actions.js";
import { RollHandlerBaseCoC7 as Core } from "../rollHandlers/coc7/coc7-base.js";
import * as settings from "../settings/coc7-settings.js";

export class CoC7SystemManager extends SystemManager {
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
    let choices = { core: "Core CoC7" };

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
