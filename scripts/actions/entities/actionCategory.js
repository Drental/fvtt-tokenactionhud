export class ActionCategory {
  constructor(id = "", name = "") {
    this.id = id;
    this.name = name;
    this.cssClass = "";
    this.subcategories = [];
  }
}
