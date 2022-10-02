import { RollHandler } from "../rollHandler.js";

// Could potentially handle rolls from exampleActionHandler ('../actions/exampleActionHandler.js')
export class TagmarHandler extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");

    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(characterId);

    switch (macroType) {
      case "item":
        this.rollItemMacro(event, actor, actionId);
        break;
      case "att":
        this.rollAtt(event, actor, actionId);
        break;
      case "resist":
        this._dialogResistencia(event, actor, actionId);
        break;
      case "moral":
        this.rollMoral(event, actor, actionId);
        break;
      default:
        break;
    }
  }

  rollMoral(event, actor, actionId) {
    actor._rollTeste({ name: "Moral" });
  }

  _dialogResistencia(event, actor, tipo) {
    let f_ataque;
    let rolar = false;
    let dialogContent = `
        <div class="mediaeval">
            <label for="forca-ataque">Força de Ataque:</label>
            <input type="number" name="forca-ataque" id="forca-ataque" value="1" style="width: 60px; text-align: center;"/>
        </div>`;
    let dialog = new Dialog({
      title: "Informe a força de ataque.",
      content: dialogContent,
      buttons: {
        Rolar: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: "Rolar Teste",
          callback: (html) => {
            f_ataque = html.find("#forca-ataque").val();
            if (f_ataque) {
              f_ataque = parseInt(f_ataque);
              rolar = true;
            }
          },
        },
        Cancelar: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancelar",
        },
      },
      default: "Cancelar",
      close: (html) => {
        if (rolar)
          actor._rollTeste({
            name: "Resistencia",
            id: tipo,
            f_ataque: f_ataque,
          });
      },
    });
    dialog.render(true);
  }

  rollAtt(event, actor, actionId) {
    actor._rollTeste({ name: "Atributo", id: actionId });
  }

  rollItemMacro(event, actor, actionId) {
    actor.items.find((i) => i.id === actionId).rollTagmarItem();
  }
}
