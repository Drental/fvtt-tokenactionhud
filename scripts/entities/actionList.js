export class ActionList {
  constructor(hudTitle = "", tokenId = "", actorId = "") {
    this.hudTitle = hudTitle;
    this.tokenId = tokenId;
    this.actorId = actorId;
    this.categories = [];
  }
}
