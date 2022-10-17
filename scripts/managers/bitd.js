import { SystemManager } from "./manager.js";
import { CategoryManager } from "../categories/categoryManager.js";
import { ActionHandlerBitD as ActionHandler } from "../actions/bitd/bitd-actions.js";
import { RollHandlerBaseBitD as Core } from "../rollHandlers/bitd/bitd-base.js";
import * as settings from "../settings/bitd-settings.js";

export class BitDSystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetCategoryManager(user) {
    const categoryManager = new CategoryManager(user);
    return categoryManager;
  }

  /** @override */
  doGetActionHandler(character, categoryManager) {
    let actionHandler = new ActionHandler(character, categoryManager);
    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let choices = { core: "Core BitD" };

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

  /** @override */
  async doRegisterDefaultFlags() {
    const defaults = {
      default: {
        categories: {
          actions: { 
            id: "actions",
            title: this.i18n("tokenActionHud.bitd.actions"),
            subcategories: {
              actions_actions: { 
                id: "actions" ,
                title: this.i18n("tokenActionHud.bitd.actions"),
                type: "system"
              }
            }
          },
          resistances: { 
            id: "resistances",
            title: this.i18n("tokenActionHud.bitd.resistances"),
            subcategories: {
              resistances_resistances: { 
                id: "resistances" ,
                title: this.i18n("tokenActionHud.bitd.resistances"),
                type: "system"
              }
            }
          },
          utility: { 
            id: "utility", 
            title: this.i18n("tokenActionHud.utility"),
            subcategories: {
              utility_combat: {
                id: "combat",
                title: this.i18n("tokenActionHud.combat"),
                type: "system"
              },
              utility_token: {
                id: "token",
                title: this.i18n("tokenActionHud.token"),
                type: "system"
              }
            }
          }
        },
        subcategories: [
          { id: "actions", title: this.i18n("tokenActionHud.bitd.actions"), type: "system" },
          { id: "resistances", title: this.i18n("tokenActionHud.bitd.resistances"), type: "system" },
          { id: "combat", title: this.i18n("tokenActionHud.combat"), type: "system" },
          { id: "token", title: this.i18n("tokenActionHud.token"), type: "system" }
        ]
      } 
    }
    await game.user.update({flags: {"token-action-hud": defaults}})
  }
}
