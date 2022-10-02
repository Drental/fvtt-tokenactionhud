import { ActionHandler } from "./actionHandler.js";
import * as settings from "../settings.js";

export class CompendiumActionHandler {
  baseHandler;

  constructor(baseHandler) {
    this.baseHandler = baseHandler;
  }

  /** @override */
  async buildCompendiumActions(actionList) {
    const subcategories = Object.values(actionList.categories)
    .filter(c => c.subcategories)
      .flatMap(c => Object.values(c.subcategories)
         .filter(sc => sc.type === "compendium")
         .flatMap(sc => sc.id)
      );
    const packIds = game.packs
      .filter(pack => {
        const packTypes = ["JournalEntry", "Macro", "RollTable", "Playlist"];
        return packTypes.includes(pack.documentName);
      })
      .filter(pack => game.user.isGM || !pack.private)
      .map(pack => pack.metadata.id)
    for (const packId of packIds) {
      const subcategoryId = packId.replace(".", "-")
      if (subcategories.includes(packId.replace(".", "-"))) {
        const actions = await this.getEntriesForActions(packId);
        this.baseHandler._mapActions(actionList, actions, subcategoryId);
      }
    }
  }

  async getEntriesForActions(packKey) {
    let entries = await this.getCompendiumEntries(packKey);
    let macroType = this.getCompendiumMacroType(packKey);
    return entries.map(entry => {
      let encodedValue = [macroType, packKey, entry._id].join(this.baseHandler.delimiter);
      let img = this.baseHandler.getImage(entry);
      return { name: entry.name, encodedValue: encodedValue, id: entry._id, img: img };
    });
  }

  async getCompendiumEntries(packKey) {
    let pack = game.packs.get(packKey);
    if (!pack) return [];

    let packEntries =
      pack.index.size > 0 ? pack.index : await pack.getIndex();

    if (pack.documentName === "Playlist") {
      let entries = await this._getPlaylistEntries(pack);
      return entries;
    }

    return packEntries;
  }

  async _getPlaylistEntries(pack) {
    let playlists = await pack.getContent();
    return playlists.reduce((acc, playlist) => {
      playlist.sounds.forEach(sound => {
        acc.push({ _id: `${playlist._id}>${sound._id}`, name: sound.name });
      });
      return acc;
    }, []);
  }

  getCompendiumMacroType(key) {
   const pack = game?.packs?.get(key);
    if (!pack) return "";
    const compendiumEntities = pack.documentName;

    switch (compendiumEntities) {
      case "Macro":
        return "compendiumMacro";
      case "Playlist":
        return "compendiumPlaylist";
      default:
        return "compendiumEntry";
    }
  }
}
