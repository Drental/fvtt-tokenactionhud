import { SystemManager } from "./manager.js";
import { CategoryManager } from "../categories/categoryManager.js";
import { ActionHandlerCoC7 as ActionHandler } from "../actions/coc7/coc7-actions.js";
import { RollHandlerBaseCoC7 as Core } from "../rollHandlers/coc7/coc7-base.js";
import * as settings from "../settings/coc7-settings.js";

export class CoC7SystemManager extends SystemManager {
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

  /** @override */
  async doRegisterDefaultFlags() {
    const defaults = {
      default: {
        categories: {
          characteristics: { 
            id: "characteristics",
            title: this.i18n("tokenActionHud.coc7.characteristics"),
            subcategories: {
              characteristics_characteristics: { 
                id: "characteristics" ,
                title: this.i18n("tokenActionHud.coc7.characteristics"),
                type: "system"
              }
            }
          },
          attributes: { 
            id: "attributes",
            title: this.i18n("tokenActionHud.coc7.attributes"),
            subcategories: {
              attributes_attributes: { 
                id: "attributes" ,
                title: this.i18n("tokenActionHud.coc7.attributes"),
                type: "system"
              }
            }
          },
          weapons: { 
            id: "weapons",
            title: this.i18n("tokenActionHud.coc7.weapons"),
            subcategories: {
              weapons_weapons: { 
                id: "weapons" ,
                title: this.i18n("tokenActionHud.coc7.weapons"),
                type: "system"
              }
            }
          },
          skills: { 
            id: "skills",
            title: this.i18n("tokenActionHud.coc7.skills"),
            subcategories: {
              skills_skills: { 
                id: "skills" ,
                title: this.i18n("tokenActionHud.coc7.skills"),
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
          { id: "characteristics", title: this.i18n("tokenActionHud.coc7.characteristics"), type: "system" },
          { id: "attributes", title: this.i18n("tokenActionHud.coc7.attributes"), type: "system" },
          { id: "weapons", title: this.i18n("tokenActionHud.coc7.weapons"), type: "system" },
          { id: "skills", title: this.i18n("tokenActionHud.coc7.skills"), type: "system" },
          { id: "combat", title: this.i18n("tokenActionHud.combat"), type: "system" },
          { id: "token", title: this.i18n("tokenActionHud.token"), type: "system" }
        ]
      } 
    }
    await game.user.update({flags: {"token-action-hud": defaults}})
  } 
}
