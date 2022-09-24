import * as settings from "../settings.js";
import { Logger } from "../logger.js";
import { CategoryManager } from "../categories/categoryManager.js";
import { ItemMacroActionListExtender } from "../actions/itemMacroExtender.js";
import { CompendiumMacroPreHandler } from "../rollHandlers/compendiumMacroPreHandler.js";
import { ItemMacroPreRollHandler } from "../rollHandlers/pre-itemMacro.js";

export class SystemManager {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  appName;
  constructor(appName) {
    this.appName = appName;
  }

  doGetCategoryManager() {}

  /** ACTION HANDLERS */
    /** OVERRIDDEN BY SYSTEM */

    doGetActionHandler() {}
    doGetRollHandler(handlerId) {}
    getAvailableRollHandlers() {}
    doRegisterSettings(appName, updateFunc) {}
    async doRegisterDefaultFlags() {}

  async registerDefaultFlags() {
    await this.doRegisterDefaultFlags();
  }

  async getActionHandler(user) {
    let actionHandler = this.doGetActionHandler(
      this.categoryManager
    );
    this.addActionExtenders(actionHandler);
    return actionHandler;
  }

  addActionExtenders(actionHandler) {
    if (SystemManager.isModuleActive("itemacro"))
      actionHandler.addFurtherActionHandler(new ItemMacroActionListExtender());
  }

  categoryManager;
  async getCategoryManager(user) {
    let categoryManager = this.doGetCategoryManager(user);
    await categoryManager.init();
    return categoryManager
  }

  /** ROLL HANDLERS */

  getRollHandler() {
    let rollHandlerId = settings.get("rollHandler");

    if (
      !(rollHandlerId === "core" || SystemManager.isModuleActive(rollHandlerId))
    ) {
      Logger.error(rollHandlerId, this.i18n("tokenActionHud.handlerNotFound"));
      rollHandlerId = "core";
      settings.set("rollHandler", rollHandlerId);
    }

    let rollHandler = this.doGetRollHandler(rollHandlerId);
    this.addPreHandlers(rollHandler);
    return rollHandler;
  }

  doGetRollHandler(handlerId) {}

  addPreHandlers(rollHandler) {
    rollHandler.addPreRollHandler(new CompendiumMacroPreHandler());

    if (SystemManager.isModuleActive("itemacro"))
      rollHandler.addPreRollHandler(new ItemMacroPreRollHandler());
  }

  getAvailableRollHandlers() {}

  /** SETTINGS */

  registerSettings() {
    let rollHandlers = this.getAvailableRollHandlers();
    settings.registerSettings(this.appName, this, rollHandlers);
    settings.initColorSettings(this.appName);
  }

  /** UTILITY */

  static addHandler(choices, id) {
    if (SystemManager.isModuleActive(id)) {
      let title = SystemManager.getModuleTitle(id);
      mergeObject(choices, { [id]: title });
    }
  }

  static isModuleActive(id) {
    let module = game.modules.get(id);
    return module && module.active;
  }

  static getModuleTitle(id) {
    return game.modules.get(id)?.title ?? "";
  }
}
