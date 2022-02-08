export function register(appName, updateFunc) {
  game.settings.register(appName, "abbreviateSkills", {
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
      updateFunc(value);
    },
  });

  game.settings.register(appName, "showConditionsCategory", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd5e.showConditionsCategory.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd5e.showConditionsCategory.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "hideUsedPowers", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideUsedPowers.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideUsedPowers.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "forcePowerColours", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.forcePowerColours.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.forcePowerColours.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "hideUnequippedInventory", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideUnequippedInventory.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideUnequippedInventory.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "hideQuantityZero", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideQuantityZero.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.hideQuantityZero.hint"
    ),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      updateFunc(value);
    },
  });

  game.settings.register(appName, "equipmentCategoryList", {
    name: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.equipmentCategoryList.name"
    ),
    hint: game.i18n.localize(
        "tokenactionhud.settings.dnd4e.equipmentCategoryList.hint"
    ),
    scope: "client",
    config: true,
    type: String,
    default: "consumable, tool, alchemical, potion, poison, food, scroll, trinket",
    onChange: (value) => {
      updateFunc(value);
    },
  });
}
