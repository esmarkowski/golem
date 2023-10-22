import { Controller } from "@hotwired/stimulus";
import { LiteGraph } from "litegraph.js";

export default class extends Controller {
  initialize() {
    var graph = new LiteGraph.LGraph();

    var canvas = new LiteGraph.LGraphCanvas("#agent-graph", graph);

    var node_const = LiteGraph.createNode("basic/const");
    node_const.pos = [200, 200];
    graph.add(node_const);
    node_const.setValue(4.5);

    var node_watch = LiteGraph.createNode("basic/watch");
    node_watch.pos = [700, 200];
    graph.add(node_watch);

    node_const.connect(0, node_watch, 0);

    graph.start();
  }

  connect() {}
}
