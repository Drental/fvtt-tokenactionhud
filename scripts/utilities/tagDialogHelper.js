import { TagDialog } from "../tagDialog.js";
import { CompendiumHelper } from "../actions/categories/compendiumHelper.js";

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

  static async submitCategories(categoryManager, choices, push) {
    await categoryManager.submitCategories(choices, push);
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
    let indexChoice = filterManager.isBlocklist(subcategoryId) ? 1 : 0;

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
      indexChoice,
      title,
      hbsData,
      submitFunc
    );
  }

  static _showSubcategoryDialogue(categoryManager, categoryId, categoryName) {
    let suggestions = CompendiumHelper.getCompendiumChoicesAsTagifyEntries();
    let selected =
      categoryManager.getCategorySubcategoriesAsTagifyEntries(categoryId);

    let title =
      game.i18n.localize("tokenActionHud.subcategoryTagTitle") +
      ` (${categoryName})`;

    let hbsData = {
      topLabel: game.i18n.localize("tokenActionHud.subcategoryTagExplanation"),
      placeholder: game.i18n.localize("tokenActionHud.filterPlaceholder"),
      clearButtonText: game.i18n.localize("tokenActionHud.clearButton"),
      advancedCategoryOptions: game.user.getFlag("token-action-hud", `categories.${categoryId}.advancedCategoryOptions`)
    };

    let submitFunc = async (choices, indexValue, html) => {
      let subcats = choices.map((c) => {
        return { id: c.id, title: c.value, type: c.type };
      });
      await TagDialogHelper.submitSubcategories(
        categoryManager,
        categoryId,
        subcats
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
      null,
      title,
      hbsData,
      submitFunc
    );
  }

  static _showCategoryDialog(categoryManager) {
    let selected = categoryManager.getExistingCategories();
    let indexChoice = categoryManager.arePush() ? 1 : 0;
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

    let submitFunc = async (choices, indexValue) => {
      let push = parseInt(indexValue) != 0 ? true : false;
      await TagDialogHelper.submitCategories(categoryManager, choices, push);
    };

    TagDialog.showDialog(
      null,
      selected,
      indexChoice,
      title,
      hbsData,
      submitFunc
    );
  }
}
