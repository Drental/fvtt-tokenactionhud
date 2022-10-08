import { Logger } from "./logger.js";
import { ItemMacroOptions } from "./settings/dnd5e/itemMacroOptions.js";
import { switchCSS } from "./utils.js";
export { Logger } from "./logger.js";

const updateFunc = (value) => {
  Logger.debug("Settings updated. Refreshing HUD");
  if (game.tokenActionHUD) game.tokenActionHUD.updateSettings();
};
let appName;

export const registerSettings = function (app, systemManager, rollHandlers) {
  appName = app;

  game.settings.register(appName, "rollHandler", {
    name: game.i18n.localize("tokenActionHud.settings.rollHandler.name"),
    hint: game.i18n.localize("tokenActionHud.settings.rollHandler.hint"),
    scope: "world",
    config: true,
    type: String,
    choices: rollHandlers,
    default: "core",
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "style", {
    name: game.i18n.localize("tokenActionHud.settings.style.name"),
    hint: game.i18n.localize("tokenActionHud.settings.style.hint"),
    scope: "client",
    config: true,
    type: String,
    default: "foundryVTT",
    choices: {
      foundryVTT: "Foundry VTT",
      dorakoUI: "Dorako UI"
    },
    onChange: (value) => {
      switchCSS(value);
    }
  });

  game.settings.register(appName, "scale", {
    name: game.i18n.localize("tokenActionHud.settings.scale.name"),
    hint: game.i18n.localize("tokenActionHud.settings.scale.hint"),
    scope: "client",
    config: true,
    type: Number,
    range: {
      min: 0.5,
      max: 2,
      step: 0.05,
    },
    default: 1,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  initColorSettings(appName);

  game.settings.register(appName, "enabledForUser", {
    name: game.i18n.localize("tokenActionHud.settings.enabledForUser.name"),
    hint: game.i18n.localize("tokenActionHud.settings.enabledForUser.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "playerPermission", {
    name: game.i18n.localize("tokenActionHud.settings.playerPermission.name"),
    hint: game.i18n.localize("tokenActionHud.settings.playerPermission.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "alwaysShowHud", {
    name: game.i18n.localize("tokenActionHud.settings.alwaysShowHud.name"),
    hint: game.i18n.localize("tokenActionHud.settings.alwaysShowHud.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showHudTitle", {
    name: game.i18n.localize("tokenActionHud.settings.showHudTitle.name"),
    hint: game.i18n.localize("tokenActionHud.settings.showHudTitle.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showIcons", {
    name: game.i18n.localize("tokenActionHud.settings.showIcons.name"),
    hint: game.i18n.localize("tokenActionHud.settings.showIcons.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "alwaysShowAdditionalCategories", {
    name: game.i18n.localize(
      "tokenActionHud.settings.alwaysShowAdditionalCategories.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.settings.alwaysShowAdditionalCategories.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "clickOpenCategory", {
    name: game.i18n.localize("tokenActionHud.settings.clickOpenCategory.name"),
    hint: game.i18n.localize("tokenActionHud.settings.clickOpenCategory.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });


  if (game.modules.get("itemacro")?.active) {
    game.settings.register(appName, "itemMacroReplace", {
      name: game.i18n.localize(
        "tokenActionHud.dnd5e.settings.itemMacroReplace.name"
      ),
      hint: game.i18n.localize(
        "tokenActionHud.dnd5e.settings.itemMacroReplace.hint"
      ),
      scope: "client",
      config: true,
      type: String,
      choices: {
        showBoth: game.i18n.localize(ItemMacroOptions.SHOW_BOTH),
        showItemMacro: game.i18n.localize(ItemMacroOptions.SHOW_ITEM_MACRO),
        showOriginal: game.i18n.localize(ItemMacroOptions.SHOW_ORIGINAL_ITEM),
      },
      default: "showBoth",
      onChange: (value) => {
        updateFunc(value);
      },
    });
  }

  game.settings.register(appName, "renderItemOnRightClick", {
    name: game.i18n.localize(
      "tokenActionHud.settings.renderItemOnRightClick.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.settings.renderItemOnRightClick.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "activeCssAsText", {
    name: game.i18n.localize("tokenActionHud.settings.activeCssAsText.name"),
    hint: game.i18n.localize("tokenActionHud.settings.activeCssAsText.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "dropdown", {
    name: game.i18n.localize("tokenActionHud.settings.dropdown.name"),
    hint: game.i18n.localize("tokenActionHud.settings.dropdown.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "onTokenHover", {
    name: game.i18n.localize("tokenActionHud.settings.onTokenHover.name"),
    hint: game.i18n.localize("tokenActionHud.settings.onTokenHover.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "debug", {
    name: game.i18n.localize("tokenActionHud.settings.debug.name"),
    hint: game.i18n.localize("tokenActionHud.settings.debug.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  systemManager.doRegisterSettings(appName, updateFunc);

  Logger.debug("available rollHandlers: ", rollHandlers);
};

export function get(key) {
  if (game.settings.settings.get(`${appName}.${key}`)) {
    return game.settings.get(appName, key);
  }
}

export function set(setting, value) {
  game.settings.set(appName, setting, value);
}

export function initColorSettings(appName) {
  // Determine color picker module
  let module = null;
  if (game.modules.get('lib-themer')?.active) {
    module = 'lib-themer';
  } else if (game.modules.get('color-picker')?.active) {
    module = 'color-picker';
  } else if (game.modules.get('colorsettings')?.active) {
    module = 'colorsettings';
  }

  // Register settings based on module
  switch (module) {
    case 'lib-themer':
      Hooks.once('lib-themer.Ready', (API) => {
        API.register({
          id: appName,
          title: game.modules.get(appName).title,
          '--tah-background': {
            "name": `tokenActionHud.settings.background.name`,
            "hint": `tokenActionHud.settings.background.hint`,
            "type": "color",
            "default": "#00000000"
          },
          '--tah-button': {
            "name": `tokenActionHud.settings.buttonBackgroundColor.name`,
            "hint": `tokenActionHud.settings.buttonBackgroundColor.hint`,
            "type": "color",
            "default": "#00000080",
            "colors": {
              "buttons": true
            }
          }
        });
      });
      break;
    case 'color-picker':
      if (typeof ColorPicker === 'object') {
        registerColorSettings(appName, module);
      } else {
        Hooks.once("colorPickerReady", () => { registerColorSettings(appName, module); });
      }
      break;
    case 'colorsettings':
      Hooks.once('ready', () => {
        try {
          window.Ardittristan.ColorSetting.tester;
          registerColorSettings(appName, module);
        } catch {}
      });
      break;
  }
}

function registerColorSettings(appName, module) {
  const backgroundColor = {
    key: "background",
    name: game.i18n.localize("tokenActionHud.settings.background.name"),
    hint: game.i18n.localize("tokenActionHud.settings.background.hint"),
    scope: "client",
    restricted: false,
    default: "#00000000",
    onChange: (value) => {
      document.querySelector(":root").style.setProperty('--tah-background', value);
      updateFunc(value);
    }
  }

  const buttonBackgroundColor = {
    key: "buttonBackgroundColor",
    name: game.i18n.localize("tokenActionHud.settings.buttonBackgroundColor.name"),
    hint: game.i18n.localize("tokenActionHud.settings.buttonBackgroundColor.hint"),
    scope: "client",
    restricted: true,
    default: "#00000080",
    onChange: (value) => {
      document.querySelector(":root").style.setProperty('--tah-button', value);
      updateFunc(value);
    }
  }

  const buttonBorderColor = {
    key: "buttonBorderColor",
    name: game.i18n.localize("tokenActionHud.settings.buttonBorderColor.name"),
    hint: game.i18n.localize("tokenActionHud.settings.buttonBorderColor.hint"),
    scope: "client",
    restricted: true,
    default: "#000000ff",
    onChange: (value) => {
      document.querySelector(":root").style.setProperty('--tah-button-outline', value);
      updateFunc(value);
    }
  }

  // Color Picker module
  if (module === 'color-picker') {

    const pickerOptions = {
      format: "hexa",
      alphaChannel: true
    }

    ColorPicker.register(
      appName, 
      backgroundColor.key,
      {
        name: backgroundColor.name,
        hint: backgroundColor.hint,
        scope: backgroundColor.scope,
        restricted: backgroundColor.restricted,
        default: backgroundColor.default,
        onChange: backgroundColor.onChange
      },
      pickerOptions
    );

    ColorPicker.register(
      appName, 
      buttonBackgroundColor.key,
      {
        name: buttonBackgroundColor.name,
        hint: buttonBackgroundColor.hint,
        scope: buttonBackgroundColor.scope,
        restricted: buttonBackgroundColor.restricted,
        default: buttonBackgroundColor.default,
        onChange: buttonBackgroundColor.onChange
      },
      pickerOptions
    );
    
    ColorPicker.register(
      appName, 
      buttonBorderColor.key,
      {
        name: buttonBorderColor.name,
        hint: buttonBorderColor.hint,
        scope: buttonBorderColor.scope,
        restricted: buttonBorderColor.restricted,
        default: buttonBorderColor.default,
        onChange: buttonBorderColor.onChange
      },
      pickerOptions
    );

  // Color Settings module
  } else if (module === 'colorsettings') {

    new window.Ardittristan.ColorSetting(
      appName, 
      backgroundColor.key,
      {
        name: backgroundColor.name,
        hint: backgroundColor.hint,
        scope: backgroundColor.scope,
        restricted: backgroundColor.restricted,
        defaultColor: backgroundColor.default,
        onChange: backgroundColor.onChange,
        insertAfter: `${appName}.scale`
      }
    );

    new window.Ardittristan.ColorSetting(
      appName, 
      buttonBackgroundColor.key,
      {
        name: buttonBackgroundColor.name,
        hint: buttonBackgroundColor.hint,
        scope: buttonBackgroundColor.scope,
        restricted: buttonBackgroundColor.restricted,
        defaultColor: buttonBackgroundColor.default,
        onChange: buttonBackgroundColor.onChange,
        insertAfter: `${appName}.${backgroundColor.key}`
      }
    );

    new window.Ardittristan.ColorSetting(
      appName, 
      buttonBorderColor.key,
      {
        name: buttonBorderColor.name,
        hint: buttonBorderColor.hint,
        scope: buttonBorderColor.scope,
        restricted: buttonBorderColor.restricted,
        defaultColor: buttonBorderColor.default,
        onChange: buttonBorderColor.onChange,
        insertAfter: `${appName}.${buttonBackgroundColor.key}`
      }
    );
  }
  
  Hooks.once('ready', () => {
      document.querySelector(":root").style.setProperty('--tah-background', game.settings.get(appName, 'background') ?? '#00000000');
      document.querySelector(":root").style.setProperty('--tah-button', game.settings.get(appName, 'buttonBackgroundColor') ?? '#00000080');
      document.querySelector(":root").style.setProperty('--tah-button-outline', game.settings.get(appName, 'buttonBorderColor') ?? '#000000ff');
  });
}