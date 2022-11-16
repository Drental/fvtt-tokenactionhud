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
      name: game.i18n.localize(`tokenActionHud.settings.show${category}Category.name`),
      hint: game.i18n.localize(`tokenActionHud.settings.show${category}Category.hint`),
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
      "tokenActionHud.pf2e.settings.ignorePassiveActions.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.pf2e.settings.ignorePassiveActions.hint"
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
      "tokenActionHud.pf2e.settings.separateTogglesCategory.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.pf2e.settings.separateTogglesCategory.hint"
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
      "tokenActionHud.pf2e.settings.calculateAttackPenalty.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.pf2e.settings.calculateAttackPenalty.hint"
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
      "tokenActionHud.pf2e.settings.abbreviateSkills.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.pf2e.settings.abbreviateSkills.hint"
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
