export function register (app, updateSettings) {
    game.settings.register(app, 'displayCheckTargetNumbers', {
        name: game.i18n.localize('tokenActionHud.ds4.settings.displayCheckTargetNumbers.name'),
        hint: game.i18n.localize('tokenActionHud.ds4.settings.displayCheckTargetNumbers.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateSettings(value)
        }
    })
}
