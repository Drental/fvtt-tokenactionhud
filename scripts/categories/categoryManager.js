import * as settings from "../settings.js";
import { SubcategoryType } from "../enums/subcategoryType.js";

export class CategoryManager {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  categories = [];
  user = null;

  constructor(user) {
    this.user = user;
  }

  // RESET
  async reset() {
    await game.user.unsetFlag("token-action-hud", "categories");
    this._registerDefaultCategories();
  }

  // INITIALISE
  async init() {
    let savedCategories = this.user.getFlag("token-action-hud", "categories");
    if (savedCategories) {
      settings.Logger.debug("saved categories:", savedCategories);
    } else {
      this._registerDefaultCategories();
    }
  }

  // REGISTER DEFAULT CATEGORIES
  async _registerDefaultCategories() {
    const defaultCategories = this.user.getFlag("token-action-hud", "default.categories");
    if (!defaultCategories) return;
    await game.user.update({ flags: { "token-action-hud": { categories: defaultCategories } } })
  }

  // SUBMIT CATEGORIES/SUBCATEGORIES
  async submitCategories(choices) {
    if (!choices) return;
    const categories = this.user.getFlag("token-action-hud", "categories");
    if (categories) await this.deleteCategoriesFlag();

    const chosenCategories = {};
    for (const choice of choices) {
      const categoryKey = choice.id;
      const category = Object.values(categories).find(c => c.id === categoryKey);
      const subcategories = category?.subcategories ?? null;
      chosenCategories[categoryKey] = {
        id: choice.id,
        title: choice.title,
        subcategories: subcategories
       }
    }
    const data = chosenCategories;
    if (data) await this.updateCategoriesFlag(data);
  }

  async submitSubcategories(categoryId, choices) {
    const categories = this.user.getFlag("token-action-hud", "categories");
    const category = Object.values(categories).find((c) => c.id === categoryId);
    if (!category) return;

    const categoryKey = categoryId;
    if (category.subcategories) await this.deleteSubcategoriesFlag(categoryKey);

    if (!choices) return;
   
    const chosenSubcategories = {};
    for (const choice of choices) {
      const subcategoryKey = `${categoryId}_${choice.id}`
      chosenSubcategories[subcategoryKey] = choice
    }
    const data = chosenSubcategories;
    await this.updateSubcategoriesFlag(categoryKey, data);
  }

  // UPDATE CATEGORIES/SUBCATEGORIES
  async updateCategoriesFlag(data) {
    await game.user.update(
      { 
        flags: { 
          "token-action-hud": { 
            categories: data 
          } 
        } 
      }
    );
  }

  async updateSubcategoriesFlag(categoryKey, data) {
    await game.user.update(
      { 
        flags: { 
          "token-action-hud": { 
            categories: { 
              [categoryKey]: {
                subcategories: data 
              } 
            } 
          } 
        }
      }
    );
  }

  // DELETE CATEGORIES/SUBCATEGORIES
  async deleteCategoriesFlag() {
    await game.user.update(
      {
        flags: {
          "token-action-hud": {
            "-=categories": null 
          } 
        } 
      }
    );
  }

  async deleteSubcategoriesFlag(categoryKey) {
    await game.user.update(
      {
        flags: {
          "token-action-hud": {
            categories: {
              [categoryKey]: {
                "-=subcategories": null
              }
            }
          } 
        } 
      }
    );
  }

  async deleteCategoryFlag(categoryId) {
    const categoryKey = categoryId;
    await game.user.setFlag("token-action-hud", "categories", {
      [`-=${categoryKey}`]: null,
    });
  }

  async deleteSubcategoryFlag(categoryId, subcategoryId) {
    const categoryKey = categoryId;
    const subcategoryKey = `${categoryId}_${subcategoryId}`
    if (categoryKey) {
      await game.user.setFlag(
        "token-action-hud",
        `categories.${categoryKey}.subcategories`,
        { [`-=${subcategoryKey}`]: null }
      );
    }
  }

  // GET CATEGORIES/SUBCATEGORIES
  getCategoriesAsTagifyEntries() {
    const categories = this.user.getFlag("token-action-hud", "categories");
    return Object.values(categories).filter((c) => !c.core).map(c => this.asTagifyEntry(c));
  }

  getSubcategoriesAsTagifyEntries(categoryId) {
    const categories = this.user.getFlag("token-action-hud", "categories");
    let category = Object.values(categories).find((c) => c.id === categoryId);
    if (!category.subcategories) return;
    return Object.values(category.subcategories).map(sc => this.asTagifyEntry(sc));
  }

  getDefaultSubcategoriesAsTagifyEntries(categoryId = null) {
    const defaultCategories = this.user.getFlag("token-action-hud", "default.categories");
    if (categoryId) {
      let category = Object.values(defaultCategories).find((c) => c.id === categoryId);
      if (!category.subcategories) return;
      return Object.values(category.subcategories).map(sc => this.asTagifyEntry(sc));
    } else {
      return Object.values(defaultCategories)
      .map(c => Object.values(c.subcategories))
      .flat()
      .map(sc => this.asTagifyEntry(sc));
    }
  }

  // OTHER
  isCompendiumCategory(id) {
    return this.categories.some((c) => c.id === id);
  }

  isLinkedCompendium(id) {
    return this.categories.some((c) =>
      c.subcategories?.some((c) => c.compendiumId === id)
    );
  }

  asTagifyEntry(data) {
    return { id: data.id, value: data.title };
  }
}
