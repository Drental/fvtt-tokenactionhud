export function register(app, updateSettings) {
  game.settings.register(app, "ignorePassiveFeats", {
    name: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.ignorePassiveFeats.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.ignorePassiveFeats.hint"
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
      "tokenActionHud.dnd5e.settings.abbreviateSkills.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.abbreviateSkills.hint"
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
      "tokenActionHud.dnd5e.settings.showEmptyItems.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd5e.settings.showEmptyItems.hint"
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
