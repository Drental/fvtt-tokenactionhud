import { SystemManager } from "./manager.js";
import { ActionHandlerDs4 as ActionHandler } from "../actions/ds4/ds4-actions.js";
import { RollHandlerBaseDs4 as Core } from "../rollHandlers/ds4/ds4-base.js";
import * as settings from "../settings/dungeonworld-settings.js";

export class Ds4SystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetActionHandler(filterManager, categoryManager) {
    return new ActionHandler(filterManager, categoryManager);
  }

  /** @override */
  getAvailableRollHandlers() {
    return { core: "Core DS4" };
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
