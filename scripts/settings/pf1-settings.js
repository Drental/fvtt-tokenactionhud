export function register(app, updateSettings) {
  const showCategorySettings = [
    'Attacks',
    'Buffs',
    'Inventory',
    'Spells',
    'Features',
    'Skills',
    'Saves',
    'Checks', 
    'Conditions',
    'Utility'
  ]

  for (const category of showCategorySettings) {
    game.settings.register(app, `show${category}Category`, {
      name: game.i18n.localize(`tokenactionhud.settings.show${category}Category.name`),
      hint: game.i18n.localize(`tokenactionhud.settings.show${category}Category.hint`),
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: (value) => {
        updateFunc(value);
      },
    })
  }

  game.settings.register(app, "ignorePassiveFeats", {
    name: game.i18n.localize(
      "tokenactionhud.settings.dnd5e.ignorePassiveFeats.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.dnd5e.ignorePassiveFeats.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  game.settings.register(app, "abbreviateSkills", {
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
      updateSettings(value);
    },
  });

  game.settings.register(app, "showEmptyItems", {
    name: game.i18n.localize(
      "tokenactionhud.settings.dnd5e.showEmptyItems.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.dnd5e.showEmptyItems.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  game.settings.register(app, "ignoreDisabledFeats", {
    name: game.i18n.localize("tokenactionhud.settings.pf1.showDisabled.name"),
    hint: game.i18n.localize("tokenactionhud.settings.pf1.showDisabled.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateSettings(value);
    },
  });
}
