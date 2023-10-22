import { Controller } from "@hotwired/stimulus";
import Choices from "choices.js";

export default class extends Controller {
  static targets = ["select"];
  initialize() {
    const choices = new Choices(this.selectTarget);
  }

  select() {}

  connect() {}
}
