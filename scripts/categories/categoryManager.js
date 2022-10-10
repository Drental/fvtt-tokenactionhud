import * as settings from "../settings.js";
import { getSubcategoriesById, getSubcategoryByNestId } from "../utils.js";

export class CategoryManager {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  categories = [];
  user = null;

  constructor(user) {
    this.user = user;
  }

  // RESET CATEGORIES
  async reset() {
    await game.user.unsetFlag("token-action-hud", "categories");
    this._registerDefaultCategories();
  }

  // INITIALISE CATEGORIES
  async init() {
    let savedCategories = this.user.getFlag("token-action-hud", "categories");
    if (savedCategories) {
      settings.Logger.debug("Saved categories:", savedCategories);
    } else {
      this._registerDefaultCategories();
    }
  }

  // REGISTER DEFAULT CATEGORIES
  async _registerDefaultCategories() {
    const defaultCategories = this.user.getFlag(
      "token-action-hud",
      "default.categories"
    );
    if (!defaultCategories) return;
    await game.user.update({
      flags: { "token-action-hud": { categories: defaultCategories } },
    });
  }

  // SUBMIT CATEGORIES/SUBCATEGORIES
  async submitCategories(choices) {
    if (!choices) return;
    const categories = this.user.getFlag("token-action-hud", "categories");
    if (categories) await this.deleteCategoriesFlag();

    const chosenCategories = {};
    for (const choice of choices) {
      const categoryKey = choice.id;
      const category = Object.values(categories).find(
        (c) => c.id === categoryKey
      );
      const subcategories = category?.subcategories ?? null;
      chosenCategories[categoryKey] = {
        id: choice.id,
        title: choice.title,
        subcategories: subcategories,
      };
    }
    const data = chosenCategories;
    if (data) await this.updateCategoriesFlag(data);
  }

  async submitSubcategories(categoryId, choices) {
    const categories = this.user.getFlag("token-action-hud", "categories");
    const category = Object.values(categories).find(
      (category) => category.id === categoryId
    );
    if (!category) return;

    const categoryKey = categoryId;
    if (category.subcategories) await this.deleteSubcategoriesFlag(categoryKey);

    if (!choices) return;

    const chosenSubcategories = {};
    for (const choice of choices) {
      const subcategoryKey = `${categoryId}_${choice.id}`;
      chosenSubcategories[subcategoryKey] = choice;
    }
    const data = chosenSubcategories;
    await this.updateSubcategoriesFlag(categoryKey, data);
  }

  // UPDATE CATEGORIES/SUBCATEGORIES
  async updateCategoriesFlag(data) {
    await game.user.update({
      flags: {
        "token-action-hud": {
          categories: data,
        },
      },
    });
  }

  async updateSubcategoriesFlag(categoryKey, data) {
    await game.user.update({
      flags: {
        "token-action-hud": {
          categories: {
            [categoryKey]: {
              subcategories: data,
            },
          },
        },
      },
    });
  }

  // DELETE CATEGORIES/SUBCATEGORIES
  async deleteCategoriesFlag() {
    await game.user.update({
      flags: {
        "token-action-hud": {
          "-=categories": null,
        },
      },
    });
  }

  async deleteSubcategoriesFlag(categoryKey) {
    await game.user.update({
      flags: {
        "token-action-hud": {
          categories: {
            [categoryKey]: {
              "-=subcategories": null,
            },
          },
        },
      },
    });
  }

  async deleteCategoryFlag(categoryId) {
    const categoryKey = categoryId;
    await game.user.setFlag("token-action-hud", "categories", {
      [`-=${categoryKey}`]: null,
    });
  }

  async deleteSubcategoryFlag(categoryId, subcategoryId) {
    const categoryKey = categoryId;
    const subcategoryKey = `${categoryId}_${subcategoryId}`;
    if (categoryKey) {
      await game.user.setFlag(
        "token-action-hud",
        `categories.${categoryKey}.subcategories`,
        { [`-=${subcategoryKey}`]: null }
      );
    }
  }

  // GET CATEGORIES/SUBCATEGORIES
  // GET SELECTED SUBCATEGORIES
  getSelectedCategoriesAsTagifyEntries() {
    const categories = this.user.getFlag("token-action-hud", "categories");
    if (!categories) return;
    return Object.values(categories).map((category) =>
      this.asTagifyEntry(category)
    );
  }

  getSelectedSubcategoriesAsTagifyEntries(categoryId) {
    const categories = this.user.getFlag("token-action-hud", "categories");
    let category = Object.values(categories).find(
      (category) => category.id === categoryId
    );
    if (!category.subcategories) return;
    const subcategories = Object.values(category.subcategories).map(
      (subcategory) => this.asTagifyEntry(subcategory)
    );
    return subcategories;
  }

  // GET SUGGESTED SUBCATEGORIES
  getSystemSubcategoriesAsTagifyEntries() {
    const defaultSubcategories = this.user.getFlag(
      "token-action-hud",
      "default.subcategories"
    );
    return defaultSubcategories.map((sc) => this.asTagifyEntry(sc));
  }

  getCompendiumSubcategoriesAsTagifyEntries() {
    const packs = game.packs;
    return packs
      .filter((pack) => {
        const packTypes = ["JournalEntry", "Macro", "RollTable", "Playlist"];
        return packTypes.includes(pack.documentName);
      })
      .filter((pack) => game.user.isGM || !pack.private)
      .map((pack) => {
        const id = pack.metadata.id.replace(".", "-");
        const value = pack.metadata.label;
        return { id: id, value: value, type: "compendium" };
      });
  }

  // OTHER
  isLinkedCompendium(id) {
    return this.categories.some((c) =>
      c.subcategories?.some((c) => c.compendiumId === id)
    );
  }

  asTagifyEntry(data) {
    return { id: data.nestId, value: data.title, type: data.type };
  }
}
