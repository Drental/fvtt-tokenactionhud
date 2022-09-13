export function register(app, updateSettings) {
  const showCategorySettings = [
    'Strikes',
    'Actions',
    'Inventory',
    'Spells',
    'Features',
    'Skills',
    'Attributes',
    'Saves',
    'Effects', 
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
        updateSettings(value);
      },
    })
  }

  game.settings.register(app, "ignorePassiveActions", {
    name: game.i18n.localize(
      "tokenactionhud.settings.pf2e.ignorePassiveActions.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.pf2e.ignorePassiveActions.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  game.settings.register(app, "separateTogglesCategory", {
    name: game.i18n.localize(
      "tokenactionhud.settings.pf2e.separateTogglesCategory.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.pf2e.separateTogglesCategory.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  game.settings.register(app, "calculateAttackPenalty", {
    name: game.i18n.localize(
      "tokenactionhud.settings.pf2e.calculateAttackPenalty.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.pf2e.calculateAttackPenalty.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  game.settings.register(app, "abbreviateSkills", {
    name: game.i18n.localize(
      "tokenactionhud.settings.pf2e.abbreviateSkills.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.pf2e.abbreviateSkills.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    },
  });
}
