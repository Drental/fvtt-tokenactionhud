export function register(appName, updateFunc) {
  
    game.settings.register(appName, 'maxListSize', {
        name: "Max Skill/Spell list size",
        hint: "Split the Skill/Spell lists into multiple columns if they exceeed this length (minimum 10).  You may want to adjust this based on the HUD Scale and your screen size.",
        scope: "client",
        config: true,
        type: Number,
        default: 20,
        onChange: value => {
          if (value < 10) {
            value = 10
            game.settings.set(appName, 'maxListSize', value)
         }
          updateFunc(value);
        }
    });

}
