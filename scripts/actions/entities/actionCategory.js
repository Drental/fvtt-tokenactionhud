export class ActionCategory {
  constructor(id = "", name = "") {
    this.id = id;
    this.nestId = id;
    this.name = name;
    //this.cssClass = "tah-hidden";
    this.cssClass = "";
    this.subcategories = [];
  }
}
