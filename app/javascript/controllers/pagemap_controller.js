import { Controller } from "@hotwired/stimulus";
import PageMap from "pagemap";

export default class extends Controller {
  static targets = ["canvas"];
  initialize() {
    console.log("pagemap_controller", this.canvasTarget);
    const map = new PageMap(this.canvasTarget);
  }

  connect() {}
}
