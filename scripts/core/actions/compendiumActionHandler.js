import * as settings from '../settings.js'

export class CompendiumActionHandler {
    baseHandler

    constructor (baseHandler) {
        this.baseHandler = baseHandler
    }

    /** @override */
    async buildCompendiumActions (actionList) {
        const subcategoryIds = Object.values(actionList.categories)
            .filter((category) => category.subcategories)
            .flatMap((category) =>
                Object.values(category.subcategories)
                    .filter((subcategory) => subcategory.type === 'compendium')
                    .flatMap((subcategory) => subcategory.id)
            )
        const packIds = game.packs
            .filter((pack) => {
                const packTypes = ['JournalEntry', 'Macro', 'RollTable', 'Playlist']
                return packTypes.includes(pack.documentName)
            })
            .filter((pack) => game.user.isGM || !pack.private)
            .map((pack) => pack.metadata.id)
        for (const packId of packIds) {
            const subcategoryId = packId.replace('.', '-')
            if (subcategoryIds.includes(packId.replace('.', '-'))) {
                const actions = await this.getEntriesForActions(packId)
                this.baseHandler.addActionsToActionList(
                    actionList,
                    actions,
                    subcategoryId
                )
            }
        }
    }

    async getEntriesForActions (packKey) {
        const entries = await this.getCompendiumEntries(packKey)
        const actionType = this.getCompendiumActionType(packKey)
        return entries.map((entry) => {
            const encodedValue = [actionType, packKey, entry._id].join(
                this.baseHandler.delimiter
            )
            const img = this.baseHandler.getImage(entry)
            return {
                name: entry.name,
                encodedValue,
                id: entry._id,
                img
            }
        })
    }

    async getCompendiumEntries (packKey) {
        const pack = game.packs.get(packKey)
        if (!pack) return []

        const packEntries = pack.index.size > 0 ? pack.index : await pack.getIndex()

        if (pack.documentName === 'Playlist') {
            const entries = await this._getPlaylistEntries(pack)
            return entries
        }

        return packEntries
    }

    async _getPlaylistEntries (pack) {
        const playlists = await pack.getContent()
        return playlists.reduce((acc, playlist) => {
            playlist.sounds.forEach((sound) => {
                acc.push({ _id: `${playlist._id}>${sound._id}`, name: sound.name })
            })
            return acc
        }, [])
    }

    getCompendiumActionType (key) {
        const pack = game?.packs?.get(key)
        if (!pack) return ''
        const compendiumEntities = pack.documentName

        switch (compendiumEntities) {
        case 'Macro':
            return 'compendiumMacro'
        case 'Playlist':
            return 'compendiumPlaylist'
        default:
            return 'compendiumEntry'
        }
    }
}
