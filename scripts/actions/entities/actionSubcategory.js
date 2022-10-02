export class ActionSubcategory {
  constructor(id = "", name = "", type = "") {
    this.id = id;
    this.name = name;
    this.type = type;
    this.info1 = "";
    this.actions = [];
    this.subcategories = [];
    this.selected = true;
  }
}
