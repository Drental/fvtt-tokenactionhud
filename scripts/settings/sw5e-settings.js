export function register(appName, updateFunc) {
  game.settings.register(appName, "ignorePassiveFeats", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.ignorePassiveFeats.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.ignorePassiveFeats.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showPowerInfo", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showPowerInfo.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showPowerInfo.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showAllNonpreparablePowers", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showAllNonpreparablePowers.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showAllNonpreparablePowers.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "hideLongerActions", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.hideLongerActions.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.hideLongerActions.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "abbreviateSkills", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.abbreviateSkills.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.abbreviateSkills.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "splitAbilities", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.splitAbilities.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.splitAbilities.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showAllNpcItems", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showAllNpcItems.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showAllNpcItems.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showEmptyItems", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showEmptyItems.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showEmptyItems.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showConditionsCategory", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showConditionsCategory.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showConditionsCategory.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showItemsWithoutAction", {
    name: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showItemsWithoutAction.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.sw5e.showItemsWithoutAction.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  if (game.modules.get("character-actions-list-5e")?.active) {
    game.settings.register(appName, "useActionList", {
      name: game.i18n.localize("tokenactionhud.settings.useActionList.name"),
      hint: game.i18n.localize("tokenactionhud.settings.useActionList.hint"),
      scope: "client",
      config: true,
      type: Boolean,
      default: false,
      onChange: (value) => {
        updateFunc(value);
      },
    });
  }
}
