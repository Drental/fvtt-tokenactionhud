export function register(app, updateSettings) {
  game.settings.register(app, "hideUnequippedInventory", {
    name: game.i18n.localize(
      "tokenActionHud.dnd4e.settings.hideUnequippedInventory.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.dnd4e.settings.hideUnequippedInventory.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    }
  });

  game.settings.register(app, "showAdditionalCombatActions", {
    name: game.i18n.localize(
      "tokenActionHud.demonLord.settings.showAdditionalCombatActions.name"
    ),
    hint: game.i18n.localize(
      "tokenActionHud.demonLord.settings.showAdditionalCombatActions.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateSettings(value);
    }
  });
}
