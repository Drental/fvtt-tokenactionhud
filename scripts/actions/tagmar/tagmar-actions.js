import { ActionHandler } from "../actionHandler.js";

export class TagmarActionHandler extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActionList(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;
    if (!actor) return result;

    if (actor.type == "Inventario") return result;

    result.actorId = actor.id;

    let combateCategory = this._buildCombateCategory(actor, tokenId);
    this._combineCategoryWithList(result, "Combate", combateCategory); // combines the inventory category with the list with the title given by the second argument.

    let habilidadesCategory = this._buildHabilidadesCategory(actor, tokenId);
    this._combineCategoryWithList(result, "Habilidades", habilidadesCategory);

    let testesCategory = this._buildTestesCategory(actor, tokenId);
    this._combineCategoryWithList(result, "Testes", testesCategory);

    return result;
  }

  _buildTestesCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("testes");
    result.name = "Testes";
    let macroType = "att";

    let testes = [
      { name: "Intelecto", id: "INT" },
      { name: "Aura", id: "AUR" },
      { name: "Carisma", id: "CAR" },
      { name: "Força", id: "FOR" },
      { name: "Físico", id: "FIS" },
      { name: "Agilidade", id: "AGI" },
      { name: "Percepção", id: "PER" },
    ];

    let resistencias = [
      { name: "R. Física", id: "Física" },
      { name: "R. Magía", id: "Magía" },
    ];

    let testesAction = this._produceMap(tokenId, testes, macroType);
    let testesSubCategory = this.initializeEmptySubcategory();
    testesSubCategory.actions = testesAction;
    this._combineSubcategoryWithCategory(
      result,
      "Atributos",
      testesSubCategory
    );

    let resistActions = this._produceMap(tokenId, resistencias, "resist");
    let resistSubCategory = this.initializeEmptySubcategory();
    resistSubCategory.actions = resistActions;
    this._combineSubcategoryWithCategory(
      result,
      "Resistência",
      resistSubCategory
    );

    if (actor.type == "NPC") {
      let moralAction = this._produceMap(
        tokenId,
        [{ name: "Moral", id: "Moral" }],
        "moral"
      );
      let moralSubCategory = this.initializeEmptySubcategory();
      moralSubCategory.actions = moralAction;
      this._combineSubcategoryWithCategory(result, "Moral", moralSubCategory);
    }

    return result;
  }

  _buildHabilidadesCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("habilidades");

    result.name = "Habilidades";
    let macroType = "item";

    let items = actor.items;

    let habilidades = items.filter((i) => i.type === "Habilidade");
    habilidades.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    let habActions = this._produceMap(tokenId, habilidades, macroType);
    let habSubcategory = this.initializeEmptySubcategory();
    habSubcategory.actions = habActions;
    this._combineSubcategoryWithCategory(result, "Habilidades", habSubcategory);

    return result;
  }

  _buildCombateCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("combate"); // string given is an ID not a title.

    result.name = "Combate";
    let macroType = "item";

    let items = actor.items;

    let weapons = items.filter((i) => i.type === "Combate");
    weapons.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    let weaponsActions = this._produceMap(tokenId, weapons, macroType);
    let weaponsSubcategory = this.initializeEmptySubcategory();
    weaponsSubcategory.actions = weaponsActions;
    this._combineSubcategoryWithCategory(result, "Ataques", weaponsSubcategory);

    let tecnicas = items.filter((i) => i.type === "TecnicasCombate");
    tecnicas.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    let tecnicasActions = this._produceMap(tokenId, tecnicas, macroType);
    let tecnicasSubCategory = this.initializeEmptySubcategory();
    tecnicasSubCategory.actions = tecnicasActions;
    this._combineSubcategoryWithCategory(
      result,
      "Técnicas de Combate",
      tecnicasSubCategory
    );

    return result;
  }

  /** @private */
  _produceMap(tokenId, itemSet, macroType) {
    return itemSet
      .filter((i) => !!i)
      .map((i) => {
        let encodedValue = [macroType, tokenId, i.id].join(this.delimiter);
        return { name: i.name, encodedValue: encodedValue, id: i.id };
      });
  }
}
