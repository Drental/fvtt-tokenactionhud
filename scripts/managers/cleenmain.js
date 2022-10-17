import { SystemManager } from "./manager.js";
import { CategoryManager } from "../categories/categoryManager.js";
import { ActionHandlerCleenmain as ActionHandler } from "../actions/cleenmain/cleenmain-actions.js";
import { RollHandlerBaseCleenmain as Core } from "../rollHandlers/cleenmain/cleenmain-base.js";
import * as settings from "../settings/cleenmain-settings.js";

export class CleenmainSystemManager extends SystemManager {
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
    console.log("startup");
    let actionHandler = new ActionHandler(character, categoryManager);
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

  /** @override */
  async doRegisterDefaultFlags() {
    const defaults = {
      default: {
        categories: {
          weapons: { 
            id: "weapons",
            title: this.i18n("tokenActionHud.cleenmain.weapons"),
            subcategories: {
              weapons_weapons: { 
                id: "weapons" ,
                title: this.i18n("tokenActionHud.cleenmain.weapons"),
                type: "system"
              }
            }
          },
          skills: { 
            id: "skills",
            title: this.i18n("tokenActionHud.cleenmain.skills"),
            subcategories: {
              skills_skills: { 
                id: "skills" ,
                title: this.i18n("tokenActionHud.cleenmain.skills"),
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
          { id: "weapons", title: this.i18n("tokenActionHud.cleenmain.weapons"), type: "system" },
          { id: "skills", title: this.i18n("tokenActionHud.cleenmain.skills"), type: "system" },
          { id: "combat", title: this.i18n("tokenActionHud.combat"), type: "system" },
          { id: "token", title: this.i18n("tokenActionHud.token"), type: "system" }
        ]
      } 
    }
    await game.user.update({flags: {"token-action-hud": defaults}})
  }
}
