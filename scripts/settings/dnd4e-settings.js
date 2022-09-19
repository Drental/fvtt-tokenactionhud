export function register(appName, updateFunc) {
  const showCategorySettings = [
    'Abilities',
    'Skills',
    'Powers',
    'Features',
    'Inventory', 
    'Conditions',
    'Utility'
  ]

  for (const category of showCategorySettings) {
    game.settings.register(appName, `show${category}Category`, {
      name: game.i18n.localize(`tokenActionHud.settings.show${category}Category.name`),
      hint: game.i18n.localize(`tokenActionHud.settings.show${category}Category.hint`),
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: (value) => {
        updateFunc(value);
      },
    })
  }


  game.settings.register(appName, "abbreviateSkills", {
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
      updateFunc(value);
    },
  });

  game.settings.register(appName, "hideUsedPowers", {
    name: game.i18n.localize(
        "tokenActionHud.dnd4e.settings.hideUsedPowers.name"
    ),
    hint: game.i18n.localize(
        "tokenActionHud.dnd4e.settings.hideUsedPowers.hint"
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
        "tokenActionHud.dnd4e.settings.forcePowerColours.name"
    ),
    hint: game.i18n.localize(
        "tokenActionHud.dnd4e.settings.forcePowerColours.hint"
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
        "tokenActionHud.dnd4e.settings.hideUnequippedInventory.name"
    ),
    hint: game.i18n.localize(
        "tokenActionHud.dnd4e.settings.hideUnequippedInventory.hint"
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
        "tokenActionHud.dnd4e.settings.hideQuantityZero.name"
    ),
    hint: game.i18n.localize(
        "tokenActionHud.dnd4e.settings.hideQuantityZero.hint"
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
        "tokenActionHud.dnd4e.settings.equipmentCategoryList.name"
    ),
    hint: game.i18n.localize(
        "tokenActionHud.dnd4e.settings.equipmentCategoryList.hint"
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
