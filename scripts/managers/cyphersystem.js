import { SystemManager } from "./manager.js";
import { ActionHandlerCypherSystem as ActionHandler } from "../actions/cyphersystem/cyphersystem-actions.js";
import { RollHandlerBaseCypherSystem as Core } from "../rollHandlers/cyphersystem/cyphersystem-base.js";
import * as settings from "../settings/cyphersystem-settings.js";

export class CypherSystemSystemManager extends SystemManager {
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
    let choices = { core: "Core Cypher System" };

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
