export function register(app, updateSettings) {
  game.settings.register(app, "displayCheckTargetNumbers", {
    name: game.i18n.localize("tokenactionhud.settings.ds4.displayCheckTargetNumbers.name"),
    hint: game.i18n.localize("tokenactionhud.settings.ds4.displayCheckTargetNumbers.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateSettings(value);
    },
  });
}
