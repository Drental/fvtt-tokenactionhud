export function register(app, updateSettings) {
  game.settings.register(app, "showSpellInfo", {
    name: game.i18n.localize(
      "tokenActionHud.sfrpg.settings.showSpellInfo.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sfrpg.settings.showSpellInfo.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  game.settings.register(app, "showMiscFeats", {
    name: game.i18n.localize(
      "tokenActionHud.sfrpg.settings.showMiscFeats.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.sfrpg.settings.showMiscFeats.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateSettings(value);
    },
  });
}
