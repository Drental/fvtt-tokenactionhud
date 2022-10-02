import { CompendiumHelper } from "./compendiumHelper.js";
import { SubcategoryType } from "../enums/subcategoryType.js";
import { FilterSubcategory } from "./filterSubcategory.js";

export class CompendiumSubcategory extends FilterSubcategory {
  constructor(filterManager, categoryId, compendiumId, title) {
    super(filterManager, title);
    this.id = `${categoryId}_${compendiumId}`.slugify({
      replacement: "_",
      strict: true,
    });
    this.compendiumId = compendiumId;
    this.type = SubcategoryType.COMPENDIUM;
  }

  

  async saveActionsSuggestions() {
    let suggestions = await CompendiumHelper.getCompendiumEntriesForFilter(
      this.compendiumId
    );
    this.filterManager.setSuggestions(this.id, suggestions);
  }

  

  /** @override */
  getFlagContents() {
    return { id: this.compendiumId, title: this.title, type: this.type };
  }
}
