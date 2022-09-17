export function register(app, updateSettings) {
  const showCategorySettings = [
    'Characteristics',
    'Skills',
    'Talents',
    'Weapons',
    'Magic',
    'Religion',
    'Traits',
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
}
