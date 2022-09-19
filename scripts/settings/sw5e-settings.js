export function register(appName, updateFunc) {
  game.settings.register(appName, "ignorePassiveFeats", {
    name: game.i18n.localize(
      "tokenActionHud.sw5e.settings.ignorePassiveFeats.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.ignorePassiveFeats.hint"
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
      "tokenActionHud.sw5e.settings.showPowerInfo.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.showPowerInfo.hint"
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
      "tokenActionHud.sw5e.settings.showAllNonpreparablePowers.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.showAllNonpreparablePowers.hint"
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
      "tokenActionHud.sw5e.settings.hideLongerActions.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.hideLongerActions.hint"
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
      "tokenActionHud.sw5e.settings.abbreviateSkills.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.abbreviateSkills.hint"
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
      "tokenActionHud.sw5e.settings.splitAbilities.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.splitAbilities.hint"
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
      "tokenActionHud.sw5e.settings.showAllNpcItems.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.showAllNpcItems.hint"
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
      "tokenActionHud.sw5e.settings.showEmptyItems.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.showEmptyItems.hint"
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
      "tokenActionHud.sw5e.settings.showConditionsCategory.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.showConditionsCategory.hint"
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
      "tokenActionHud.sw5e.settings.showItemsWithoutAction.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sw5e.settings.showItemsWithoutAction.hint"
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
      name: game.i18n.localize("tokenActionHud.settings.useActionList.name"),
      hint: game.i18n.localize("tokenActionHud.settings.useActionList.hint"),
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
