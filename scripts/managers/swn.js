import { SystemManager } from "./manager.js";
import { ActionHandlerSWN as ActionHandler } from "../actions/swn/swn-actions.js";
import { RollHandlerBaseSWN as Core } from "../rollHandlers/swn/swn-base.js";
import * as settings from "../settings/swn-settings.js";

export class SWNSystemManager extends SystemManager {
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
    let choices = { core: "Core Star Without Number" };

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
