export function register(app, updateSettings) {
  game.settings.register(app, "allowGiveBennies", {
    name: game.i18n.localize(
      "tokenActionHud.swade.settings.allowGiveBennies.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.swade.settings.allowGiveBennies.hint"
    ),
    scope: "world",
    config: true,
    type: String,
    choices: {
      4: game.i18n.localize("USER.RoleGamemaster"),
      3: game.i18n.localize("USER.RoleAssistant"),
      2: game.i18n.localize("USER.RoleTrusted"),
      1: game.i18n.localize("Jogador"),
    },
    default: 1,
    onChange: (value) => {
      updateSettings(value);
    },
  });
  game.settings.register(app, "abbreviateAttributes", {
    name: game.i18n.localize(
      "tokenActionHud.swade.settings.abbreviateAttributes.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.swade.settings.abbreviateAttributes.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    },
  });

  const showCategorySettings = ["WoundsFatigue", "Actions", "Status", "Bennies", "Attributes", "Skills", "EdgesHindrances", "SpecialAbilities", "Powers", "Gear", "Utility"];

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