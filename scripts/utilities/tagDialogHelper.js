import { TagDialog } from "../tagDialog.js";
import { CompendiumHelper } from "../categories/compendiumHelper.js";

export class TagDialogHelper {
  static showFilterDialog(filterManager, subcategoryId) {
    TagDialogHelper._showFilterDialog(filterManager, subcategoryId);
  }

  static showSubcategoryDialogue(categoryManager, categoryId, categoryName) {
    TagDialogHelper._showSubcategoryDialogue(
      categoryManager,
      categoryId,
      categoryName
    );
  }

  static showCategoryDialog(categoryManager) {
    TagDialogHelper._showCategoryDialog(categoryManager);
  }

  static async submitCategories(categoryManager, choices) {
    await categoryManager.submitCategories(choices);
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  static async submitSubcategories(categoryManager, categoryId, choices) {
    await categoryManager.submitSubcategories(categoryId, choices);
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  static async submitFilter(filterManager, categoryId, elements, isBlocklist) {
    await filterManager.setFilteredElements(categoryId, elements, isBlocklist);
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  static _showFilterDialog(filterManager, subcategoryId) {
    let suggestions = filterManager.getSuggestions(subcategoryId);
    let selected = filterManager.getFilteredElements(subcategoryId);

    let title = game.i18n.localize("tokenActionHud.filterTitle");

    let hbsData = {
      topLabel: game.i18n.localize("tokenActionHud.filterTagExplanation"),
      placeholder: game.i18n.localize("tokenActionHud.filterPlaceholder"),
      clearButtonText: game.i18n.localize("tokenActionHud.clearButton"),
      indexExplanationLabel: game.i18n.localize(
        "tokenActionHud.blockListLabel"
      ),
      index: [
        { value: 0, text: game.i18n.localize("tokenActionHud.allowlist") },
        { value: 1, text: game.i18n.localize("tokenActionHud.blockList") },
      ],
    };

    let submitFunc = async (choices, indexValue) => {
      let isBlocklist = parseInt(indexValue) != 0 ? true : false;
      await TagDialogHelper.submitFilter(
        filterManager,
        subcategoryId,
        choices,
        isBlocklist
      );
    };

    TagDialog.showDialog(
      suggestions,
      selected,
      title,
      hbsData,
      submitFunc
    );
  }

  static _showSubcategoryDialogue(categoryManager, categoryId, categoryName) {
    const defaultSubcategories = categoryManager.getDefaultSubcategoriesAsTagifyEntries();
    let compendiumSuggestions = CompendiumHelper.getCompendiumChoicesAsTagifyEntries();
    let suggestions = [];
    suggestions.push(...defaultSubcategories, ...compendiumSuggestions);
    
    let selected =
      categoryManager.getSubcategoriesAsTagifyEntries(categoryId);

    let title =
      game.i18n.localize("tokenActionHud.subcategoryTagTitle") +
      ` (${categoryName})`;

    let hbsData = {
      topLabel: game.i18n.localize("tokenActionHud.subcategoryTagExplanation"),
      placeholder: game.i18n.localize("tokenActionHud.filterPlaceholder"),
      clearButtonText: game.i18n.localize("tokenActionHud.clearButton"),
      advancedCategoryOptions: game.user.getFlag("token-action-hud", `categories.${categoryId}.advancedCategoryOptions`)
    };

    let submitFunc = async (choices, html) => {
      choices = choices.map((c) => {
        c.id = c.id ?? 
          c.title.slugify({
            replacement: "_",
            strict: true,
          });
        return { id: c.id, title: c.title, type: c.type };
      });
      await TagDialogHelper.submitSubcategories(
        categoryManager,
        categoryId,
        choices
      );
      
      const customWidth = parseInt(html.find(`input[name="custom-width"]`).val());
      const compactView = html.find(`input[name="compact-view"]`).prop("checked");
      const characterCount = parseInt(html.find(`input[name="character-count"]`).val());
      const advancedCategoryOptions = { customWidth, compactView, characterCount };
      await game.user.setFlag("token-action-hud", `categories.${categoryId}.advancedCategoryOptions`, advancedCategoryOptions);
    };

    TagDialog.showDialog(
      suggestions,
      selected,
      title,
      hbsData,
      submitFunc
    );
  }

  static _showCategoryDialog(categoryManager) {
    let selected = categoryManager.getCategoriesAsTagifyEntries();
    let title = game.i18n.localize("tokenActionHud.categoryTagTitle");

    let hbsData = {
      topLabel: game.i18n.localize("tokenActionHud.categoryTagExplanation"),
      placeholder: game.i18n.localize("tokenActionHud.filterPlaceholder"),
      clearButtonText: game.i18n.localize("tokenActionHud.clearButton"),
      indexExplanationLabel: game.i18n.localize(
        "tokenActionHud.pushLabelExplanation"
      ),
      index: [
        { value: 0, text: game.i18n.localize("tokenActionHud.unshift") },
        { value: 1, text: game.i18n.localize("tokenActionHud.push") },
      ],
    };

    let submitFunc = async (choices) => {
      await TagDialogHelper.submitCategories(categoryManager, choices);
    };

    TagDialog.showDialog(
      null,
      selected,
      title,
      hbsData,
      submitFunc
    );
  }
}
