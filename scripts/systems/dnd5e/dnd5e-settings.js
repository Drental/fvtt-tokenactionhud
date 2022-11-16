export function register (appName, updateFunc) {
    game.settings.register(appName, 'ignorePassiveFeats', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.ignorePassiveFeats.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.ignorePassiveFeats.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'showSpellInfo', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showSpellInfo.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showSpellInfo.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'showAllNonPreparableSpells', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showAllNonPreparableSpells.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showAllNonPreparableSpells.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'hideLongerActions', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.hideLongerActions.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.hideLongerActions.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'abbreviateSkills', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.abbreviateSkills.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.abbreviateSkills.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'splitAbilities', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.splitAbilities.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.splitAbilities.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'showAllNpcItems', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showAllNpcItems.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showAllNpcItems.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'showEmptyItems', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showEmptyItems.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showEmptyItems.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(appName, 'showItemsWithoutAction', {
        name: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showItemsWithoutAction.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dnd5e.settings.showItemsWithoutAction.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    if (game.modules.get('character-actions-list-5e')?.active) {
        game.settings.register(appName, 'useActionList', {
            name: game.i18n.localize('tokenActionHud.settings.useActionList.name'),
            hint: game.i18n.localize('tokenActionHud.settings.useActionList.hint'),
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                updateFunc(value)
            }
        })
    }
}
