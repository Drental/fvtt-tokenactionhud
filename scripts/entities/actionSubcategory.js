export class ActionSubcategory {
  constructor(
    id = "",
    parentNestId = "",
    name = "",
    type = ""
  ) {
    this.id = id;
    this.nestId = `${parentNestId}_${id}`;
    this.name = name;
    this.type = type;
    this.info1 = "";
    this.actions = [];
    this.subcategories = [];
  }
}
