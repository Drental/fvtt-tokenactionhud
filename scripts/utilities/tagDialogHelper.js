import { TagDialog } from "../tagDialog.js";

export class TagDialogHelper {
  /** SHOW CATEGORY/SUBCATEGORY/ACTION DIALOGS */
  static showCategoryDialog(categoryManager) {
    TagDialogHelper._showCategoryDialog(categoryManager);
  }

  static _showCategoryDialog(categoryManager) {
    let selected = categoryManager.getSelectedCategoriesAsTagifyEntries();
    let title = game.i18n.localize("tokenActionHud.categoryTagTitle");

    let hbsData = {
      topLabel: game.i18n.localize("tokenActionHud.categoryTagExplanation"),
      placeholder: game.i18n.localize("tokenActionHud.filterPlaceholder"),
      clearButtonText: game.i18n.localize("tokenActionHud.clearButton"),
      indexExplanationLabel: game.i18n.localize(
        "tokenActionHud.pushLabelExplanation"
      )
    };

    let submitFunc = async (choices) => {
      await TagDialogHelper.submitCategories(categoryManager, choices);
    };

    TagDialog.showDialog(
      null,
      null,
      null,
      selected,
      title,
      hbsData,
      submitFunc
    );
  }

  static showSubcategoryDialog(categoryManager, categoryId, categoryName) {
    TagDialogHelper._showSubcategoryDialog(
      categoryManager,
      categoryId,
      categoryName
    );
  }

  static _showSubcategoryDialog(categoryManager, categoryId, categoryName) {
    const defaultSubcategories = categoryManager.getSuggestedSystemSubcategoriesAsTagifyEntries();
    let compendiumSubcategories = categoryManager.getSuggestedCompendiumSubcategoriesAsTagifyEntries();
    let suggestions = [];
    suggestions.push(...defaultSubcategories, ...compendiumSubcategories);
    
    let selected =
      categoryManager.getSelectedSubcategoriesAsTagifyEntries(categoryId);

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
      choices = choices.map(choice => {
        choice.id = choice.id ?? 
          choice.title.slugify({
            replacement: "_",
            strict: true,
          });
        choice.type = choice.type ?? "custom";
        return { id: choice.id, title: choice.title, type: choice.type };
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
      categoryId,
      null,
      suggestions,
      selected,
      title,
      hbsData,
      submitFunc
    );
  }

  static showActionDialog(actionHandler, categoryId, subcategoryId) {
    TagDialogHelper._showActionDialog(actionHandler, categoryId, subcategoryId);
  }

  static _showActionDialog(actionHandler, categoryId, subcategoryId) {
    let suggestions = actionHandler.getSuggestedActionsAsTagifyEntries(categoryId, subcategoryId);
    let selected = actionHandler.getSelectedActionsAsTagifyEntries(categoryId, subcategoryId);

    let title = game.i18n.localize("tokenActionHud.filterTitle");

    let hbsData = {
      topLabel: game.i18n.localize("tokenActionHud.filterTagExplanation"),
      placeholder: game.i18n.localize("tokenActionHud.filterPlaceholder"),
      clearButtonText: game.i18n.localize("tokenActionHud.clearButton"),
      indexExplanationLabel: game.i18n.localize(
        "tokenActionHud.blockListLabel"
      )
    };

    let submitFunc = async (choices) => {
      await TagDialogHelper.saveActions(
        actionHandler,
        categoryId,
        subcategoryId,
        choices
      );
    };

    TagDialog.showDialog(
      categoryId,
      subcategoryId,
      suggestions,
      selected,
      title,
      hbsData,
      submitFunc
    );
  }

  // SUBMIT CATEGORIES/SUBCATEGORIES/ACTIONS
  static async submitCategories(categoryManager, choices) {
    await categoryManager.submitCategories(choices);
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  static async submitSubcategories(categoryManager, categoryId, choices) {
    await categoryManager.submitSubcategories(categoryId, choices);
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  static async saveActions(actionHandler, categoryId, subcategoryId, choices) {
    await actionHandler.saveActions(categoryId, subcategoryId, choices);
    Hooks.callAll("forceUpdateTokenActionHUD");
  }
}
