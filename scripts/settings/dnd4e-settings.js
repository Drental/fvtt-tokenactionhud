export function register(appName, updateFunc) {
  game.settings.register(appName, "abbreviateSkills", {
    name: game.i18n.localize(
      "tokenactionhud.settings.dnd5e.abbreviateSkills.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.dnd5e.abbreviateSkills.hint"
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
        "tokenactionhud.settings.dnd5e.showConditionsCategory.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd5e.showConditionsCategory.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "hideUsedPowers", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideUsedPowers.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideUsedPowers.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "forcePowerColours", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.forcePowerColours.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.forcePowerColours.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });
}
