import { SystemManager } from "./manager.js";
import { ActionHandlerDw as ActionHandler } from "../actions/dungeonworld/dw-actions.js";
import { RollHandlerBaseDw as Core } from "../rollHandlers/dungeonworld/dw-base.js";
import * as settings from "../settings/dungeonworld-settings.js";

export class DungeonWorldSystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetActionHandler(character, categoryManager) {
    let actionHandler = new ActionHandler(character, categoryManager);
    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let choices = { core: "Core DungeonWorld" };

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
