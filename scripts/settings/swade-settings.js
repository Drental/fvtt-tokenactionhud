export function register(app, updateSettings) {
  game.settings.register(app, "abbreviateAttributes", {
    name: game.i18n.localize(
      "tokenactionhud.settings.swade.abbreviateAttributes.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.swade.abbreviateAttributes.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  game.settings.register(app, "allowGiveBennies", {
    name: game.i18n.localize(
      "tokenactionhud.settings.swade.allowGiveBennies.name"
    ),
    hint: game.i18n.localize(
      "tokenactionhud.settings.swade.allowGiveBennies.hint"
    ),
    scope: "world",
    config: true,
    type: String,
    choices: {
      4: game.i18n.localize('tokenactionhud.settings.swade.allowGiveBennies.choices.4'),
      3: game.i18n.localize('tokenactionhud.settings.swade.allowGiveBennies.choices.3'),
      2: game.i18n.localize('tokenactionhud.settings.swade.allowGiveBennies.choices.2'),
      1: game.i18n.localize('tokenactionhud.settings.swade.allowGiveBennies.choices.1')
    },
    default: 1,
    onChange: (value) => {
      updateSettings(value);
    },
  });
}