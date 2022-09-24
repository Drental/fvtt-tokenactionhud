export class ActionSubcategory {
  constructor(id = "", name = "") {
    this.id = id;
    this.name = name;
    this.info1 = "";
    this.canFilter = false;
    this.actions = [];
    this.subcategories = [];
  }
}
