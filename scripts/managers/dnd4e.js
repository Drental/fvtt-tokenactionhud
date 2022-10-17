import { SystemManager } from "./manager.js";
import {ActionHandlerDnD4e as ActionHandler} from "../actions/dnd4e/dnd4e-actions.js";
import {RollHandlerBaseDnD4e as Core} from "../rollHandlers/dnd4e/dnd4e-base.js";
import * as settings from "../settings/dnd4e-settings.js";

export class DnD4eSystemManager extends SystemManager {
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
    let choices = { core: "Core dnd4e" };

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
