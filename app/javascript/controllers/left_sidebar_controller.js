import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["closeBtn"];

  initialize() {}

  connect() {
    console.log("left_sidebar_controller", this.element);
  }

  toggle() {
    if (this.element.classList.contains("show")) {
      this.close();
    } else {
      this.open();
    }
  }

  close() {
    this.element.classList.remove("show");
  }

  open() {
    this.element.classList.add("show");
  }
}
