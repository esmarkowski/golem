import { Controller } from "@hotwired/stimulus";
import Hotkeys from "hotkeys-js";

export default class extends Controller {
  static SHORTCUTS = {
    toggleRightSidebar: "option+command+b",
    toggleLeftSidebar: "command+b",
    toggleBottomBar: "command+j",
    newGolem: "command+g",
  };

  initialize() {}

  connect() {
    const commands = Object.values(this.constructor.SHORTCUTS).join(",");

    const SHORTCUTS = this.constructor.SHORTCUTS;

    const self = this;

    Hotkeys(commands, function (event, handler) {
      switch (handler.key) {
        case SHORTCUTS.toggleRightSidebar:
          self.broadcast("toggleRightSidebar", {});
          break;
        case SHORTCUTS.toggleLeftSidebar:
          self.broadcast("toggleLeftSidebar", {});
          break;
        case SHORTCUTS.toggleBottomBar:
          self.broadcast("toggleBottomBar", {});
          break;
        case SHORTCUTS.newGolem:
          self.broadcast("newGolem", {});
          break;
        default:
          console.log(SHORTCUTS);
          alert(event);
      }

      event.preventDefault();
    });
  }

  broadcast(event, detail = {}) {
    this.dispatch(event, {
      bubbles: true,
      cancelable: true,
      detail,
    });
  }
}
