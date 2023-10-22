import _process from "process";
var _global =
  "undefined" !== typeof globalThis
    ? globalThis
    : "undefined" !== typeof self
    ? self
    : global;
var exports = {};
var process = _process;
(function (global) {
  var LiteGraph = (global.LiteGraph = {
    VERSION: 0.4,
    CANVAS_GRID_SIZE: 10,
    NODE_TITLE_HEIGHT: 30,
    NODE_TITLE_TEXT_Y: 20,
    NODE_SLOT_HEIGHT: 20,
    NODE_WIDGET_HEIGHT: 20,
    NODE_WIDTH: 140,
    NODE_MIN_WIDTH: 50,
    NODE_COLLAPSED_RADIUS: 10,
    NODE_COLLAPSED_WIDTH: 80,
    NODE_TITLE_COLOR: "#999",
    NODE_SELECTED_TITLE_COLOR: "#FFF",
    NODE_TEXT_SIZE: 14,
    NODE_TEXT_COLOR: "#AAA",
    NODE_SUBTEXT_SIZE: 12,
    NODE_DEFAULT_COLOR: "#333",
    NODE_DEFAULT_BGCOLOR: "#353535",
    NODE_DEFAULT_BOXCOLOR: "#666",
    NODE_DEFAULT_SHAPE: "box",
    NODE_BOX_OUTLINE_COLOR: "#FFF",
    DEFAULT_SHADOW_COLOR: "rgba(0,0,0,0.5)",
    DEFAULT_GROUP_FONT: 24,
    WIDGET_BGCOLOR: "#222",
    WIDGET_OUTLINE_COLOR: "#666",
    WIDGET_TEXT_COLOR: "#DDD",
    WIDGET_SECONDARY_TEXT_COLOR: "#999",
    LINK_COLOR: "#9A9",
    EVENT_LINK_COLOR: "#A86",
    CONNECTING_LINK_COLOR: "#AFA",
    MAX_NUMBER_OF_NODES: 1e3,
    DEFAULT_POSITION: [100, 100],
    VALID_SHAPES: ["default", "box", "round", "card"],
    BOX_SHAPE: 1,
    ROUND_SHAPE: 2,
    CIRCLE_SHAPE: 3,
    CARD_SHAPE: 4,
    ARROW_SHAPE: 5,
    GRID_SHAPE: 6,
    INPUT: 1,
    OUTPUT: 2,
    EVENT: -1,
    ACTION: -1,
    NODE_MODES: ["Always", "On Event", "Never", "On Trigger"],
    NODE_MODES_COLORS: ["#666", "#422", "#333", "#224", "#626"],
    ALWAYS: 0,
    ON_EVENT: 1,
    NEVER: 2,
    ON_TRIGGER: 3,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    CENTER: 5,
    LINK_RENDER_MODES: ["Straight", "Linear", "Spline"],
    STRAIGHT_LINK: 0,
    LINEAR_LINK: 1,
    SPLINE_LINK: 2,
    NORMAL_TITLE: 0,
    NO_TITLE: 1,
    TRANSPARENT_TITLE: 2,
    AUTOHIDE_TITLE: 3,
    VERTICAL_LAYOUT: "vertical",
    proxy: null,
    node_images_path: "",
    debug: false,
    catch_exceptions: true,
    throw_errors: true,
    allow_scripts: false,
    registered_node_types: {},
    node_types_by_file_extension: {},
    Nodes: {},
    Globals: {},
    searchbox_extras: {},
    auto_sort_node_types: false,
    node_box_coloured_when_on: false,
    node_box_coloured_by_mode: false,
    dialog_close_on_mouse_leave: true,
    dialog_close_on_mouse_leave_delay: 500,
    shift_click_do_break_link_from: false,
    click_do_break_link_to: false,
    search_hide_on_mouse_leave: true,
    search_filter_enabled: false,
    search_show_all_on_open: true,
    auto_load_slot_types: false,
    registered_slot_in_types: {},
    registered_slot_out_types: {},
    slot_types_in: [],
    slot_types_out: [],
    slot_types_default_in: [],
    slot_types_default_out: [],
    alt_drag_do_clone_nodes: false,
    do_add_triggers_slots: false,
    allow_multi_output_for_events: true,
    middle_click_slot_add_default_node: false,
    release_link_on_empty_shows_menu: false,
    pointerevents_method: "mouse",
    ctrl_shift_v_paste_connect_unselected_outputs: false,
    /**
     * Register a node class so it can be listed when the user wants to create a new one
     * @method registerNodeType
     * @param {String} type name of the node and path
     * @param {Class} base_class class containing the structure of a node
     */
    registerNodeType: function (t, e) {
      if (!e.prototype)
        throw "Cannot register a simple object, it must be a class with a prototype";
      e.type = t;
      LiteGraph.debug && console.log("Node registered: " + t);
      const a = e.name;
      const o = t.lastIndexOf("/");
      e.category = t.substring(0, o);
      e.title || (e.title = a);
      for (var r in LGraphNode.prototype)
        e.prototype[r] || (e.prototype[r] = LGraphNode.prototype[r]);
      const l = (this || _global).registered_node_types[t];
      l && console.log("replacing node type: " + t);
      if (!Object.prototype.hasOwnProperty.call(e.prototype, "shape")) {
        Object.defineProperty(e.prototype, "shape", {
          set: function (t) {
            switch (t) {
              case "default":
                delete (this || _global)._shape;
                break;
              case "box":
                (this || _global)._shape = LiteGraph.BOX_SHAPE;
                break;
              case "round":
                (this || _global)._shape = LiteGraph.ROUND_SHAPE;
                break;
              case "circle":
                (this || _global)._shape = LiteGraph.CIRCLE_SHAPE;
                break;
              case "card":
                (this || _global)._shape = LiteGraph.CARD_SHAPE;
                break;
              default:
                (this || _global)._shape = t;
            }
          },
          get: function () {
            return (this || _global)._shape;
          },
          enumerable: true,
          configurable: true,
        });
        if (e.supported_extensions)
          for (let t in e.supported_extensions) {
            const a = e.supported_extensions[t];
            a &&
              a.constructor === String &&
              ((this || _global).node_types_by_file_extension[a.toLowerCase()] =
                e);
          }
      }
      (this || _global).registered_node_types[t] = e;
      e.constructor.name && ((this || _global).Nodes[a] = e);
      LiteGraph.onNodeTypeRegistered && LiteGraph.onNodeTypeRegistered(t, e);
      l &&
        LiteGraph.onNodeTypeReplaced &&
        LiteGraph.onNodeTypeReplaced(t, e, l);
      e.prototype.onPropertyChange &&
        console.warn(
          "LiteGraph node class " +
            t +
            " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
        );
      (this || _global).auto_load_slot_types && new e(e.title || "tmpnode");
    },
    /**
     * removes a node type from the system
     * @method unregisterNodeType
     * @param {String|Object} type name of the node or the node constructor itself
     */
    unregisterNodeType: function (t) {
      const e =
        t.constructor === String
          ? (this || _global).registered_node_types[t]
          : t;
      if (!e) throw "node type not found: " + t;
      delete (this || _global).registered_node_types[e.type];
      e.constructor.name && delete (this || _global).Nodes[e.constructor.name];
    },
    /**
     * Save a slot type and his node
     * @method registerSlotType
     * @param {String|Object} type name of the node or the node constructor itself
     * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
     */
    registerNodeAndSlotType: function (t, e, a) {
      a = a || false;
      const o =
        t.constructor === String &&
        "anonymous" !== (this || _global).registered_node_types[t]
          ? (this || _global).registered_node_types[t]
          : t;
      const r = o.constructor.type;
      let l = [];
      l =
        "string" === typeof e
          ? e.split(",")
          : e == (this || _global).EVENT || e == (this || _global).ACTION
          ? ["_event_"]
          : ["*"];
      for (let t = 0; t < l.length; ++t) {
        let e = l[t];
        "" === e && (e = "*");
        const o = a ? "registered_slot_out_types" : "registered_slot_in_types";
        void 0 === (this || _global)[o][e] &&
          ((this || _global)[o][e] = { nodes: [] });
        (this || _global)[o][e].nodes.includes(r) ||
          (this || _global)[o][e].nodes.push(r);
        if (a) {
          if (!(this || _global).slot_types_out.includes(e.toLowerCase())) {
            (this || _global).slot_types_out.push(e.toLowerCase());
            (this || _global).slot_types_out.sort();
          }
        } else if (!(this || _global).slot_types_in.includes(e.toLowerCase())) {
          (this || _global).slot_types_in.push(e.toLowerCase());
          (this || _global).slot_types_in.sort();
        }
      }
    },
    /**
     * Create a new nodetype by passing a function, it wraps it with a proper class and generates inputs according to the parameters of the function.
     * Useful to wrap simple methods that do not require properties, and that only process some input to generate an output.
     * @method wrapFunctionAsNode
     * @param {String} name node name with namespace (p.e.: 'math/sum')
     * @param {Function} func
     * @param {Array} param_types [optional] an array containing the type of every parameter, otherwise parameters will accept any type
     * @param {String} return_type [optional] string with the return type, otherwise it will be generic
     * @param {Object} properties [optional] properties to be configurable
     */
    wrapFunctionAsNode: function (t, e, a, o, r) {
      var l = Array(e.length);
      var n = "";
      var s = LiteGraph.getParameterNames(e);
      for (var u = 0; u < s.length; ++u)
        n +=
          "this.addInput('" +
          s[u] +
          "'," +
          (a && a[u] ? "'" + a[u] + "'" : "0") +
          ");\n";
      n += "this.addOutput('out'," + (o ? "'" + o + "'" : 0) + ");\n";
      r && (n += "this.properties = " + JSON.stringify(r) + ";\n");
      var h = Function(n);
      h.title = t.split("/").pop();
      h.desc = "Generated from " + e.name;
      h.prototype.onExecute = function onExecute() {
        for (var t = 0; t < l.length; ++t) l[t] = this.getInputData(t);
        var a = e.apply(this || _global, l);
        this.setOutputData(0, a);
      };
      this.registerNodeType(t, h);
    },
    clearRegisteredTypes: function () {
      (this || _global).registered_node_types = {};
      (this || _global).node_types_by_file_extension = {};
      (this || _global).Nodes = {};
      (this || _global).searchbox_extras = {};
    },
    /**
     * Adds this method to all nodetypes, existing and to be created
     * (You can add it to LGraphNode.prototype but then existing node types wont have it)
     * @method addNodeMethod
     * @param {Function} func
     */
    addNodeMethod: function (t, e) {
      LGraphNode.prototype[t] = e;
      for (var a in (this || _global).registered_node_types) {
        var o = (this || _global).registered_node_types[a];
        o.prototype[t] && (o.prototype["_" + t] = o.prototype[t]);
        o.prototype[t] = e;
      }
    },
    /**
     * Create a node of a given type with a name. The node is not attached to any graph yet.
     * @method createNode
     * @param {String} type full name of the node class. p.e. "math/sin"
     * @param {String} name a name to distinguish from other nodes
     * @param {Object} options to set options
     */
    createNode: function (t, e, a) {
      var o = (this || _global).registered_node_types[t];
      if (!o) {
        LiteGraph.debug &&
          console.log('GraphNode type "' + t + '" not registered.');
        return null;
      }
      o.prototype;
      e = e || o.title || t;
      var r = null;
      if (LiteGraph.catch_exceptions)
        try {
          r = new o(e);
        } catch (t) {
          console.error(t);
          return null;
        }
      else r = new o(e);
      r.type = t;
      !r.title && e && (r.title = e);
      r.properties || (r.properties = {});
      r.properties_info || (r.properties_info = []);
      r.flags || (r.flags = {});
      r.size || (r.size = r.computeSize());
      r.pos || (r.pos = LiteGraph.DEFAULT_POSITION.concat());
      r.mode || (r.mode = LiteGraph.ALWAYS);
      if (a) for (var l in a) r[l] = a[l];
      r.onNodeCreated && r.onNodeCreated();
      return r;
    },
    /**
     * Returns a registered node type with a given name
     * @method getNodeType
     * @param {String} type full name of the node class. p.e. "math/sin"
     * @return {Class} the node class
     */
    getNodeType: function (t) {
      return (this || _global).registered_node_types[t];
    },
    /**
     * Returns a list of node types matching one category
     * @method getNodeType
     * @param {String} category category name
     * @return {Array} array with all the node classes
     */
    getNodeTypesInCategory: function (t, e) {
      var a = [];
      for (var o in (this || _global).registered_node_types) {
        var r = (this || _global).registered_node_types[o];
        r.filter == e &&
          ("" == t
            ? null == r.category && a.push(r)
            : r.category == t && a.push(r));
      }
      (this || _global).auto_sort_node_types &&
        a.sort(function (t, e) {
          return t.title.localeCompare(e.title);
        });
      return a;
    },
    /**
     * Returns a list with all the node type categories
     * @method getNodeTypesCategories
     * @param {String} filter only nodes with ctor.filter equal can be shown
     * @return {Array} array with all the names of the categories
     */
    getNodeTypesCategories: function (t) {
      var e = { "": 1 };
      for (var a in (this || _global).registered_node_types) {
        var o = (this || _global).registered_node_types[a];
        if (o.category && !o.skip_list) {
          if (o.filter != t) continue;
          e[o.category] = 1;
        }
      }
      var r = [];
      for (var a in e) r.push(a);
      return (this || _global).auto_sort_node_types ? r.sort() : r;
    },
    reloadNodes: function (t) {
      var e = document.getElementsByTagName("script");
      var a = [];
      for (var o = 0; o < e.length; o++) a.push(e[o]);
      var r = document.getElementsByTagName("head")[0];
      t = document.location.href + t;
      for (o = 0; o < a.length; o++) {
        var l = a[o].src;
        if (l && l.substr(0, t.length) == t)
          try {
            LiteGraph.debug && console.log("Reloading: " + l);
            var n = document.createElement("script");
            n.type = "text/javascript";
            n.src = l;
            r.appendChild(n);
            r.removeChild(a[o]);
          } catch (t) {
            if (LiteGraph.throw_errors) throw t;
            LiteGraph.debug && console.log("Error while reloading " + l);
          }
      }
      LiteGraph.debug && console.log("Nodes reloaded");
    },
    cloneObject: function (t, e) {
      if (null == t) return null;
      var a = JSON.parse(JSON.stringify(t));
      if (!e) return a;
      for (var o in a) e[o] = a[o];
      return e;
    },
    /**
     * Returns if the types of two slots are compatible (taking into account wildcards, etc)
     * @method isValidConnection
     * @param {String} type_a
     * @param {String} type_b
     * @return {Boolean} true if they can be connected
     */
    isValidConnection: function (t, e) {
      ("" != t && "*" !== t) || (t = 0);
      ("" != e && "*" !== e) || (e = 0);
      if (!t || !e || t == e || (t == LiteGraph.EVENT && e == LiteGraph.ACTION))
        return true;
      t = String(t);
      e = String(e);
      t = t.toLowerCase();
      e = e.toLowerCase();
      if (-1 == t.indexOf(",") && -1 == e.indexOf(",")) return t == e;
      var a = t.split(",");
      var o = e.split(",");
      for (var r = 0; r < a.length; ++r)
        for (var l = 0; l < o.length; ++l)
          if (this.isValidConnection(a[r], o[l])) return true;
      return false;
    },
    /**
     * Register a string in the search box so when the user types it it will recommend this node
     * @method registerSearchboxExtra
     * @param {String} node_type the node recommended
     * @param {String} description text to show next to it
     * @param {Object} data it could contain info of how the node should be configured
     * @return {Boolean} true if they can be connected
     */
    registerSearchboxExtra: function (t, e, a) {
      (this || _global).searchbox_extras[e.toLowerCase()] = {
        type: t,
        desc: e,
        data: a,
      };
    },
    /**
     * Wrapper to load files (from url using fetch or from file using FileReader)
     * @method fetchFile
     * @param {String|File|Blob} url the url of the file (or the file itself)
     * @param {String} type an string to know how to fetch it: "text","arraybuffer","json","blob"
     * @param {Function} on_complete callback(data)
     * @param {Function} on_error in case of an error
     * @return {FileReader|Promise} returns the object used to
     */
    fetchFile: function (t, e, a, o) {
      if (!t) return null;
      e = e || "text";
      if (t.constructor === String) {
        "http" == t.substr(0, 4) &&
          LiteGraph.proxy &&
          (t = LiteGraph.proxy + t.substr(t.indexOf(":") + 3));
        return fetch(t)
          .then(function (t) {
            if (!t.ok) throw new Error("File not found");
            return "arraybuffer" == e
              ? t.arrayBuffer()
              : "text" == e || "string" == e
              ? t.text()
              : "json" == e
              ? t.json()
              : "blob" == e
              ? t.blob()
              : void 0;
          })
          .then(function (t) {
            a && a(t);
          })
          .catch(function (e) {
            console.error("error fetching file:", t);
            o && o(e);
          });
      }
      if (t.constructor === File || t.constructor === Blob) {
        var r = new FileReader();
        r.onload = function (t) {
          var o = t.target.result;
          "json" == e && (o = JSON.parse(o));
          a && a(o);
        };
        if ("arraybuffer" == e) return r.readAsArrayBuffer(t);
        if ("text" == e || "json" == e) return r.readAsText(t);
        if ("blob" == e) return r.readAsBinaryString(t);
      }
      return null;
    },
  });
  "undefined" != typeof performance
    ? (LiteGraph.getTime = performance.now.bind(performance))
    : "undefined" != typeof Date && Date.now
    ? (LiteGraph.getTime = Date.now.bind(Date))
    : (LiteGraph.getTime =
        "undefined" != typeof process
          ? function () {
              var t = process.hrtime();
              return 0.001 * t[0] + 1e-6 * t[1];
            }
          : function getTime() {
              return new Date().getTime();
            });
  /**
   * LGraph is the class that contain a full graph. We instantiate one and add nodes to it, and then we can run the execution loop.
  * supported callbacks:
  + onNodeAdded: when a new node is added to the graph
  + onNodeRemoved: when a node inside this graph is removed
  + onNodeConnectionChange: some connection has changed in the graph (connected or disconnected)
   *
   * @class LGraph
   * @constructor
   * @param {Object} o data from previous serialization [optional]
   */ function LGraph(t) {
    LiteGraph.debug && console.log("Graph created");
    (this || _global).list_of_graphcanvas = null;
    this.clear();
    t && this.configure(t);
  }
  global.LGraph = LiteGraph.LGraph = LGraph;
  LGraph.supported_types = ["number", "string", "boolean"];
  LGraph.prototype.getSupportedTypes = function () {
    return (this || _global).supported_types || LGraph.supported_types;
  };
  LGraph.STATUS_STOPPED = 1;
  LGraph.STATUS_RUNNING = 2;
  LGraph.prototype.clear = function () {
    this.stop();
    (this || _global).status = LGraph.STATUS_STOPPED;
    (this || _global).last_node_id = 0;
    (this || _global).last_link_id = 0;
    (this || _global)._version = -1;
    if ((this || _global)._nodes)
      for (var t = 0; t < (this || _global)._nodes.length; ++t) {
        var e = (this || _global)._nodes[t];
        e.onRemoved && e.onRemoved();
      }
    (this || _global)._nodes = [];
    (this || _global)._nodes_by_id = {};
    (this || _global)._nodes_in_order = [];
    (this || _global)._nodes_executable = null;
    (this || _global)._groups = [];
    (this || _global).links = {};
    (this || _global).iteration = 0;
    (this || _global).config = {};
    (this || _global).vars = {};
    (this || _global).extra = {};
    (this || _global).globaltime = 0;
    (this || _global).runningtime = 0;
    (this || _global).fixedtime = 0;
    (this || _global).fixedtime_lapse = 0.01;
    (this || _global).elapsed_time = 0.01;
    (this || _global).last_update_time = 0;
    (this || _global).starttime = 0;
    (this || _global).catch_errors = true;
    (this || _global).nodes_executing = [];
    (this || _global).nodes_actioning = [];
    (this || _global).nodes_executedAction = [];
    (this || _global).inputs = {};
    (this || _global).outputs = {};
    this.change();
    this.sendActionToCanvas("clear");
  };
  /**
   * Attach Canvas to this graph
   * @method attachCanvas
   * @param {GraphCanvas} graph_canvas
   */ LGraph.prototype.attachCanvas = function (t) {
    if (t.constructor != LGraphCanvas)
      throw "attachCanvas expects a LGraphCanvas instance";
    t.graph && t.graph != (this || _global) && t.graph.detachCanvas(t);
    t.graph = this || _global;
    (this || _global).list_of_graphcanvas ||
      ((this || _global).list_of_graphcanvas = []);
    (this || _global).list_of_graphcanvas.push(t);
  };
  /**
   * Detach Canvas from this graph
   * @method detachCanvas
   * @param {GraphCanvas} graph_canvas
   */ LGraph.prototype.detachCanvas = function (t) {
    if ((this || _global).list_of_graphcanvas) {
      var e = (this || _global).list_of_graphcanvas.indexOf(t);
      if (-1 != e) {
        t.graph = null;
        (this || _global).list_of_graphcanvas.splice(e, 1);
      }
    }
  };
  /**
   * Starts running this graph every interval milliseconds.
   * @method start
   * @param {number} interval amount of milliseconds between executions, if 0 then it renders to the monitor refresh rate
   */ LGraph.prototype.start = function (t) {
    if ((this || _global).status != LGraph.STATUS_RUNNING) {
      (this || _global).status = LGraph.STATUS_RUNNING;
      (this || _global).onPlayEvent && this.onPlayEvent();
      this.sendEventToAllNodes("onStart");
      (this || _global).starttime = LiteGraph.getTime();
      (this || _global).last_update_time = (this || _global).starttime;
      t = t || 0;
      var e = this || _global;
      if (
        0 == t &&
        "undefined" != typeof window &&
        window.requestAnimationFrame
      ) {
        function on_frame() {
          if (-1 == e.execution_timer_id) {
            window.requestAnimationFrame(on_frame);
            e.onBeforeStep && e.onBeforeStep();
            e.runStep(1, !e.catch_errors);
            e.onAfterStep && e.onAfterStep();
          }
        }
        (this || _global).execution_timer_id = -1;
        on_frame();
      } else
        (this || _global).execution_timer_id = setInterval(function () {
          e.onBeforeStep && e.onBeforeStep();
          e.runStep(1, !e.catch_errors);
          e.onAfterStep && e.onAfterStep();
        }, t);
    }
  };
  LGraph.prototype.stop = function () {
    if ((this || _global).status != LGraph.STATUS_STOPPED) {
      (this || _global).status = LGraph.STATUS_STOPPED;
      (this || _global).onStopEvent && this.onStopEvent();
      if (null != (this || _global).execution_timer_id) {
        -1 != (this || _global).execution_timer_id &&
          clearInterval((this || _global).execution_timer_id);
        (this || _global).execution_timer_id = null;
      }
      this.sendEventToAllNodes("onStop");
    }
  };
  /**
   * Run N steps (cycles) of the graph
   * @method runStep
   * @param {number} num number of steps to run, default is 1
   * @param {Boolean} do_not_catch_errors [optional] if you want to try/catch errors
   * @param {number} limit max number of nodes to execute (used to execute from start to a node)
   */ LGraph.prototype.runStep = function (t, e, a) {
    t = t || 1;
    var o = LiteGraph.getTime();
    (this || _global).globaltime = 0.001 * (o - (this || _global).starttime);
    var r = (this || _global)._nodes_executable
      ? (this || _global)._nodes_executable
      : (this || _global)._nodes;
    if (r) {
      a = a || r.length;
      if (e) {
        for (var l = 0; l < t; l++) {
          for (var n = 0; n < a; ++n) {
            var s = r[n];
            s.mode == LiteGraph.ALWAYS && s.onExecute && s.doExecute();
          }
          (this || _global).fixedtime += (this || _global).fixedtime_lapse;
          (this || _global).onExecuteStep && this.onExecuteStep();
        }
        (this || _global).onAfterExecute && this.onAfterExecute();
      } else
        try {
          for (l = 0; l < t; l++) {
            for (n = 0; n < a; ++n) {
              s = r[n];
              s.mode == LiteGraph.ALWAYS && s.onExecute && s.onExecute();
            }
            (this || _global).fixedtime += (this || _global).fixedtime_lapse;
            (this || _global).onExecuteStep && this.onExecuteStep();
          }
          (this || _global).onAfterExecute && this.onAfterExecute();
          (this || _global).errors_in_execution = false;
        } catch (t) {
          (this || _global).errors_in_execution = true;
          if (LiteGraph.throw_errors) throw t;
          LiteGraph.debug && console.log("Error during execution: " + t);
          this.stop();
        }
      var u = LiteGraph.getTime();
      var h = u - o;
      0 == h && (h = 1);
      (this || _global).execution_time = 0.001 * h;
      (this || _global).globaltime += 0.001 * h;
      (this || _global).iteration += 1;
      (this || _global).elapsed_time =
        0.001 * (u - (this || _global).last_update_time);
      (this || _global).last_update_time = u;
      (this || _global).nodes_executing = [];
      (this || _global).nodes_actioning = [];
      (this || _global).nodes_executedAction = [];
    }
  };
  LGraph.prototype.updateExecutionOrder = function () {
    (this || _global)._nodes_in_order = this.computeExecutionOrder(false);
    (this || _global)._nodes_executable = [];
    for (var t = 0; t < (this || _global)._nodes_in_order.length; ++t)
      (this || _global)._nodes_in_order[t].onExecute &&
        (this || _global)._nodes_executable.push(
          (this || _global)._nodes_in_order[t]
        );
  };
  LGraph.prototype.computeExecutionOrder = function (t, e) {
    var a = [];
    var o = [];
    var r = {};
    var l = {};
    var n = {};
    for (var s = 0, u = (this || _global)._nodes.length; s < u; ++s) {
      var h = (this || _global)._nodes[s];
      if (!t || h.onExecute) {
        r[h.id] = h;
        var p = 0;
        if (h.inputs)
          for (var _ = 0, g = h.inputs.length; _ < g; _++)
            h.inputs[_] && null != h.inputs[_].link && (p += 1);
        if (0 == p) {
          o.push(h);
          e && (h._level = 1);
        } else {
          e && (h._level = 0);
          n[h.id] = p;
        }
      }
    }
    while (true) {
      if (0 == o.length) break;
      h = o.shift();
      a.push(h);
      delete r[h.id];
      if (h.outputs)
        for (s = 0; s < h.outputs.length; s++) {
          var d = h.outputs[s];
          if (null != d && null != d.links && 0 != d.links.length)
            for (_ = 0; _ < d.links.length; _++) {
              var c = d.links[_];
              var b = (this || _global).links[c];
              if (b && !l[b.id]) {
                var f = this.getNodeById(b.target_id);
                if (null != f) {
                  e &&
                    (!f._level || f._level <= h._level) &&
                    (f._level = h._level + 1);
                  l[b.id] = true;
                  n[f.id] -= 1;
                  0 == n[f.id] && o.push(f);
                } else l[b.id] = true;
              }
            }
        }
    }
    for (var s in r) a.push(r[s]);
    a.length != (this || _global)._nodes.length &&
      LiteGraph.debug &&
      console.warn("something went wrong, nodes missing");
    u = a.length;
    for (s = 0; s < u; ++s) a[s].order = s;
    a = a.sort(function (t, e) {
      var a = t.constructor.priority || t.priority || 0;
      var o = e.constructor.priority || e.priority || 0;
      return a == o ? t.order - e.order : a - o;
    });
    for (s = 0; s < u; ++s) a[s].order = s;
    return a;
  };
  LGraph.prototype.getAncestors = function (t) {
    var e = [];
    var a = [t];
    var o = {};
    while (a.length) {
      var r = a.shift();
      if (r.inputs) {
        if (!o[r.id] && r != t) {
          o[r.id] = true;
          e.push(r);
        }
        for (var l = 0; l < r.inputs.length; ++l) {
          var n = r.getInputNode(l);
          n && -1 == e.indexOf(n) && a.push(n);
        }
      }
    }
    e.sort(function (t, e) {
      return t.order - e.order;
    });
    return e;
  };
  LGraph.prototype.arrange = function (t, e) {
    t = t || 100;
    const a = this.computeExecutionOrder(false, true);
    const o = [];
    for (let t = 0; t < a.length; ++t) {
      const e = a[t];
      const r = e._level || 1;
      o[r] || (o[r] = []);
      o[r].push(e);
    }
    let r = t;
    for (let a = 0; a < o.length; ++a) {
      const l = o[a];
      if (!l) continue;
      let n = 100;
      let s = t + LiteGraph.NODE_TITLE_HEIGHT;
      for (let a = 0; a < l.length; ++a) {
        const o = l[a];
        o.pos[0] = e == LiteGraph.VERTICAL_LAYOUT ? s : r;
        o.pos[1] = e == LiteGraph.VERTICAL_LAYOUT ? r : s;
        const u = e == LiteGraph.VERTICAL_LAYOUT ? 1 : 0;
        o.size[u] > n && (n = o.size[u]);
        const h = e == LiteGraph.VERTICAL_LAYOUT ? 0 : 1;
        s += o.size[h] + t + LiteGraph.NODE_TITLE_HEIGHT;
      }
      r += n + t;
    }
    this.setDirtyCanvas(true, true);
  };
  LGraph.prototype.getTime = function () {
    return (this || _global).globaltime;
  };
  LGraph.prototype.getFixedTime = function () {
    return (this || _global).fixedtime;
  };
  LGraph.prototype.getElapsedTime = function () {
    return (this || _global).elapsed_time;
  };
  /**
   * Sends an event to all the nodes, useful to trigger stuff
   * @method sendEventToAllNodes
   * @param {String} eventname the name of the event (function to be called)
   * @param {Array} params parameters in array format
   */ LGraph.prototype.sendEventToAllNodes = function (t, e, a) {
    a = a || LiteGraph.ALWAYS;
    var o = (this || _global)._nodes_in_order
      ? (this || _global)._nodes_in_order
      : (this || _global)._nodes;
    if (o)
      for (var r = 0, l = o.length; r < l; ++r) {
        var n = o[r];
        n.constructor !== LiteGraph.Subgraph || "onExecute" == t
          ? n[t] &&
            n.mode == a &&
            (void 0 === e
              ? n[t]()
              : e && e.constructor === Array
              ? n[t].apply(n, e)
              : n[t](e))
          : n.mode == a && n.sendEventToAllNodes(t, e, a);
      }
  };
  LGraph.prototype.sendActionToCanvas = function (t, e) {
    if ((this || _global).list_of_graphcanvas)
      for (var a = 0; a < (this || _global).list_of_graphcanvas.length; ++a) {
        var o = (this || _global).list_of_graphcanvas[a];
        o[t] && o[t].apply(o, e);
      }
  };
  /**
   * Adds a new node instance to this graph
   * @method add
   * @param {LGraphNode} node the instance of the node
   */ LGraph.prototype.add = function (t, e) {
    if (t) {
      if (t.constructor !== LGraphGroup) {
        if (-1 != t.id && null != (this || _global)._nodes_by_id[t.id]) {
          console.warn(
            "LiteGraph: there is already a node with this ID, changing it"
          );
          t.id = ++(this || _global).last_node_id;
        }
        if ((this || _global)._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES)
          throw "LiteGraph: max number of nodes in a graph reached";
        null == t.id || -1 == t.id
          ? (t.id = ++(this || _global).last_node_id)
          : (this || _global).last_node_id < t.id &&
            ((this || _global).last_node_id = t.id);
        t.graph = this || _global;
        (this || _global)._version++;
        (this || _global)._nodes.push(t);
        (this || _global)._nodes_by_id[t.id] = t;
        t.onAdded && t.onAdded(this || _global);
        (this || _global).config.align_to_grid && t.alignToGrid();
        e || this.updateExecutionOrder();
        (this || _global).onNodeAdded && this.onNodeAdded(t);
        this.setDirtyCanvas(true);
        this.change();
        return t;
      }
      (this || _global)._groups.push(t);
      this.setDirtyCanvas(true);
      this.change();
      t.graph = this || _global;
      (this || _global)._version++;
    }
  };
  /**
   * Removes a node from the graph
   * @method remove
   * @param {LGraphNode} node the instance of the node
   */ LGraph.prototype.remove = function (t) {
    if (t.constructor !== LiteGraph.LGraphGroup) {
      if (null != (this || _global)._nodes_by_id[t.id] && !t.ignore_remove) {
        this.beforeChange();
        if (t.inputs)
          for (var e = 0; e < t.inputs.length; e++) {
            var a = t.inputs[e];
            null != a.link && t.disconnectInput(e);
          }
        if (t.outputs)
          for (e = 0; e < t.outputs.length; e++) {
            a = t.outputs[e];
            null != a.links && a.links.length && t.disconnectOutput(e);
          }
        t.onRemoved && t.onRemoved();
        t.graph = null;
        (this || _global)._version++;
        if ((this || _global).list_of_graphcanvas)
          for (e = 0; e < (this || _global).list_of_graphcanvas.length; ++e) {
            var o = (this || _global).list_of_graphcanvas[e];
            o.selected_nodes[t.id] && delete o.selected_nodes[t.id];
            o.node_dragged == t && (o.node_dragged = null);
          }
        var r = (this || _global)._nodes.indexOf(t);
        -1 != r && (this || _global)._nodes.splice(r, 1);
        delete (this || _global)._nodes_by_id[t.id];
        (this || _global).onNodeRemoved && this.onNodeRemoved(t);
        this.sendActionToCanvas("checkPanels");
        this.setDirtyCanvas(true, true);
        this.afterChange();
        this.change();
        this.updateExecutionOrder();
      }
    } else {
      var l = (this || _global)._groups.indexOf(t);
      -1 != l && (this || _global)._groups.splice(l, 1);
      t.graph = null;
      (this || _global)._version++;
      this.setDirtyCanvas(true, true);
      this.change();
    }
  };
  /**
   * Returns a node by its id.
   * @method getNodeById
   * @param {Number} id
   */ LGraph.prototype.getNodeById = function (t) {
    return null == t ? null : (this || _global)._nodes_by_id[t];
  };
  /**
   * Returns a list of nodes that matches a class
   * @method findNodesByClass
   * @param {Class} classObject the class itself (not an string)
   * @return {Array} a list with all the nodes of this type
   */ LGraph.prototype.findNodesByClass = function (t, e) {
    e = e || [];
    e.length = 0;
    for (var a = 0, o = (this || _global)._nodes.length; a < o; ++a)
      (this || _global)._nodes[a].constructor === t &&
        e.push((this || _global)._nodes[a]);
    return e;
  };
  /**
   * Returns a list of nodes that matches a type
   * @method findNodesByType
   * @param {String} type the name of the node type
   * @return {Array} a list with all the nodes of this type
   */ LGraph.prototype.findNodesByType = function (t, e) {
    t = t.toLowerCase();
    e = e || [];
    e.length = 0;
    for (var a = 0, o = (this || _global)._nodes.length; a < o; ++a)
      (this || _global)._nodes[a].type.toLowerCase() == t &&
        e.push((this || _global)._nodes[a]);
    return e;
  };
  /**
   * Returns the first node that matches a name in its title
   * @method findNodeByTitle
   * @param {String} name the name of the node to search
   * @return {Node} the node or null
   */ LGraph.prototype.findNodeByTitle = function (t) {
    for (var e = 0, a = (this || _global)._nodes.length; e < a; ++e)
      if ((this || _global)._nodes[e].title == t)
        return (this || _global)._nodes[e];
    return null;
  };
  /**
   * Returns a list of nodes that matches a name
   * @method findNodesByTitle
   * @param {String} name the name of the node to search
   * @return {Array} a list with all the nodes with this name
   */ LGraph.prototype.findNodesByTitle = function (t) {
    var e = [];
    for (var a = 0, o = (this || _global)._nodes.length; a < o; ++a)
      (this || _global)._nodes[a].title == t &&
        e.push((this || _global)._nodes[a]);
    return e;
  };
  /**
   * Returns the top-most node in this position of the canvas
   * @method getNodeOnPos
   * @param {number} x the x coordinate in canvas space
   * @param {number} y the y coordinate in canvas space
   * @param {Array} nodes_list a list with all the nodes to search from, by default is all the nodes in the graph
   * @return {LGraphNode} the node at this position or null
   */ LGraph.prototype.getNodeOnPos = function (t, e, a, o) {
    a = a || (this || _global)._nodes;
    var r = null;
    for (var l = a.length - 1; l >= 0; l--) {
      var n = a[l];
      if (n.isPointInside(t, e, o)) return n;
    }
    return r;
  };
  /**
   * Returns the top-most group in that position
   * @method getGroupOnPos
   * @param {number} x the x coordinate in canvas space
   * @param {number} y the y coordinate in canvas space
   * @return {LGraphGroup} the group or null
   */ LGraph.prototype.getGroupOnPos = function (t, e) {
    for (var a = (this || _global)._groups.length - 1; a >= 0; a--) {
      var o = (this || _global)._groups[a];
      if (o.isPointInside(t, e, 2, true)) return o;
    }
    return null;
  };
  LGraph.prototype.checkNodeTypes = function () {
    for (var t = 0; t < (this || _global)._nodes.length; t++) {
      var e = (this || _global)._nodes[t];
      var a = LiteGraph.registered_node_types[e.type];
      if (e.constructor != a) {
        console.log("node being replaced by newer version: " + e.type);
        var o = LiteGraph.createNode(e.type);
        true;
        (this || _global)._nodes[t] = o;
        o.configure(e.serialize());
        o.graph = this || _global;
        (this || _global)._nodes_by_id[o.id] = o;
        e.inputs && (o.inputs = e.inputs.concat());
        e.outputs && (o.outputs = e.outputs.concat());
      }
    }
    this.updateExecutionOrder();
  };
  LGraph.prototype.onAction = function (t, e, a) {
    (this || _global)._input_nodes = this.findNodesByClass(
      LiteGraph.GraphInput,
      (this || _global)._input_nodes
    );
    for (var o = 0; o < (this || _global)._input_nodes.length; ++o) {
      var r = (this || _global)._input_nodes[o];
      if (r.properties.name == t) {
        r.actionDo(t, e, a);
        break;
      }
    }
  };
  LGraph.prototype.trigger = function (t, e) {
    (this || _global).onTrigger && this.onTrigger(t, e);
  };
  /**
   * Tell this graph it has a global graph input of this type
   * @method addGlobalInput
   * @param {String} name
   * @param {String} type
   * @param {*} value [optional]
   */ LGraph.prototype.addInput = function (t, e, a) {
    var o = (this || _global).inputs[t];
    if (!o) {
      this.beforeChange();
      (this || _global).inputs[t] = { name: t, type: e, value: a };
      (this || _global)._version++;
      this.afterChange();
      (this || _global).onInputAdded && this.onInputAdded(t, e);
      (this || _global).onInputsOutputsChange && this.onInputsOutputsChange();
    }
  };
  /**
   * Assign a data to the global graph input
   * @method setGlobalInputData
   * @param {String} name
   * @param {*} data
   */ LGraph.prototype.setInputData = function (t, e) {
    var a = (this || _global).inputs[t];
    a && (a.value = e);
  };
  /**
   * Returns the current value of a global graph input
   * @method getInputData
   * @param {String} name
   * @return {*} the data
   */ LGraph.prototype.getInputData = function (t) {
    var e = (this || _global).inputs[t];
    return e ? e.value : null;
  };
  /**
   * Changes the name of a global graph input
   * @method renameInput
   * @param {String} old_name
   * @param {String} new_name
   */ LGraph.prototype.renameInput = function (t, e) {
    if (e != t) {
      if (!(this || _global).inputs[t]) return false;
      if ((this || _global).inputs[e]) {
        console.error("there is already one input with that name");
        return false;
      }
      (this || _global).inputs[e] = (this || _global).inputs[t];
      delete (this || _global).inputs[t];
      (this || _global)._version++;
      (this || _global).onInputRenamed && this.onInputRenamed(t, e);
      (this || _global).onInputsOutputsChange && this.onInputsOutputsChange();
    }
  };
  /**
   * Changes the type of a global graph input
   * @method changeInputType
   * @param {String} name
   * @param {String} type
   */ LGraph.prototype.changeInputType = function (t, e) {
    if (!(this || _global).inputs[t]) return false;
    if (
      !(this || _global).inputs[t].type ||
      String((this || _global).inputs[t].type).toLowerCase() !=
        String(e).toLowerCase()
    ) {
      (this || _global).inputs[t].type = e;
      (this || _global)._version++;
      (this || _global).onInputTypeChanged && this.onInputTypeChanged(t, e);
    }
  };
  /**
   * Removes a global graph input
   * @method removeInput
   * @param {String} name
   * @param {String} type
   */ LGraph.prototype.removeInput = function (t) {
    if (!(this || _global).inputs[t]) return false;
    delete (this || _global).inputs[t];
    (this || _global)._version++;
    (this || _global).onInputRemoved && this.onInputRemoved(t);
    (this || _global).onInputsOutputsChange && this.onInputsOutputsChange();
    return true;
  };
  /**
   * Creates a global graph output
   * @method addOutput
   * @param {String} name
   * @param {String} type
   * @param {*} value
   */ LGraph.prototype.addOutput = function (t, e, a) {
    (this || _global).outputs[t] = { name: t, type: e, value: a };
    (this || _global)._version++;
    (this || _global).onOutputAdded && this.onOutputAdded(t, e);
    (this || _global).onInputsOutputsChange && this.onInputsOutputsChange();
  };
  /**
   * Assign a data to the global output
   * @method setOutputData
   * @param {String} name
   * @param {String} value
   */ LGraph.prototype.setOutputData = function (t, e) {
    var a = (this || _global).outputs[t];
    a && (a.value = e);
  };
  /**
   * Returns the current value of a global graph output
   * @method getOutputData
   * @param {String} name
   * @return {*} the data
   */ LGraph.prototype.getOutputData = function (t) {
    var e = (this || _global).outputs[t];
    return e ? e.value : null;
  };
  /**
   * Renames a global graph output
   * @method renameOutput
   * @param {String} old_name
   * @param {String} new_name
   */ LGraph.prototype.renameOutput = function (t, e) {
    if (!(this || _global).outputs[t]) return false;
    if ((this || _global).outputs[e]) {
      console.error("there is already one output with that name");
      return false;
    }
    (this || _global).outputs[e] = (this || _global).outputs[t];
    delete (this || _global).outputs[t];
    (this || _global)._version++;
    (this || _global).onOutputRenamed && this.onOutputRenamed(t, e);
    (this || _global).onInputsOutputsChange && this.onInputsOutputsChange();
  };
  /**
   * Changes the type of a global graph output
   * @method changeOutputType
   * @param {String} name
   * @param {String} type
   */ LGraph.prototype.changeOutputType = function (t, e) {
    if (!(this || _global).outputs[t]) return false;
    if (
      !(this || _global).outputs[t].type ||
      String((this || _global).outputs[t].type).toLowerCase() !=
        String(e).toLowerCase()
    ) {
      (this || _global).outputs[t].type = e;
      (this || _global)._version++;
      (this || _global).onOutputTypeChanged && this.onOutputTypeChanged(t, e);
    }
  };
  /**
   * Removes a global graph output
   * @method removeOutput
   * @param {String} name
   */ LGraph.prototype.removeOutput = function (t) {
    if (!(this || _global).outputs[t]) return false;
    delete (this || _global).outputs[t];
    (this || _global)._version++;
    (this || _global).onOutputRemoved && this.onOutputRemoved(t);
    (this || _global).onInputsOutputsChange && this.onInputsOutputsChange();
    return true;
  };
  LGraph.prototype.triggerInput = function (t, e) {
    var a = this.findNodesByTitle(t);
    for (var o = 0; o < a.length; ++o) a[o].onTrigger(e);
  };
  LGraph.prototype.setCallback = function (t, e) {
    var a = this.findNodesByTitle(t);
    for (var o = 0; o < a.length; ++o) a[o].setTrigger(e);
  };
  LGraph.prototype.beforeChange = function (t) {
    (this || _global).onBeforeChange && this.onBeforeChange(this || _global, t);
    this.sendActionToCanvas("onBeforeChange", this || _global);
  };
  LGraph.prototype.afterChange = function (t) {
    (this || _global).onAfterChange && this.onAfterChange(this || _global, t);
    this.sendActionToCanvas("onAfterChange", this || _global);
  };
  LGraph.prototype.connectionChange = function (t, e) {
    this.updateExecutionOrder();
    (this || _global).onConnectionChange && this.onConnectionChange(t);
    (this || _global)._version++;
    this.sendActionToCanvas("onConnectionChange");
  };
  LGraph.prototype.isLive = function () {
    if (!(this || _global).list_of_graphcanvas) return false;
    for (var t = 0; t < (this || _global).list_of_graphcanvas.length; ++t) {
      var e = (this || _global).list_of_graphcanvas[t];
      if (e.live_mode) return true;
    }
    return false;
  };
  LGraph.prototype.clearTriggeredSlots = function () {
    for (var t in (this || _global).links) {
      var e = (this || _global).links[t];
      e && e._last_time && (e._last_time = 0);
    }
  };
  LGraph.prototype.change = function () {
    LiteGraph.debug && console.log("Graph changed");
    this.sendActionToCanvas("setDirty", [true, true]);
    (this || _global).on_change && this.on_change(this || _global);
  };
  LGraph.prototype.setDirtyCanvas = function (t, e) {
    this.sendActionToCanvas("setDirty", [t, e]);
  };
  /**
   * Destroys a link
   * @method removeLink
   * @param {Number} link_id
   */ LGraph.prototype.removeLink = function (t) {
    var e = (this || _global).links[t];
    if (e) {
      var a = this.getNodeById(e.target_id);
      a && a.disconnectInput(e.target_slot);
    }
  };
  LGraph.prototype.serialize = function () {
    var t = [];
    for (var e = 0, a = (this || _global)._nodes.length; e < a; ++e)
      t.push((this || _global)._nodes[e].serialize());
    var o = [];
    for (var e in (this || _global).links) {
      var r = (this || _global).links[e];
      if (!r.serialize) {
        console.warn(
          "weird LLink bug, link info is not a LLink but a regular object"
        );
        var l = new LLink();
        for (var n in r) l[n] = r[n];
        (this || _global).links[e] = l;
        r = l;
      }
      o.push(r.serialize());
    }
    var s = [];
    for (e = 0; e < (this || _global)._groups.length; ++e)
      s.push((this || _global)._groups[e].serialize());
    var u = {
      last_node_id: (this || _global).last_node_id,
      last_link_id: (this || _global).last_link_id,
      nodes: t,
      links: o,
      groups: s,
      config: (this || _global).config,
      extra: (this || _global).extra,
      version: LiteGraph.VERSION,
    };
    (this || _global).onSerialize && this.onSerialize(u);
    return u;
  };
  /**
   * Configure a graph from a JSON string
   * @method configure
   * @param {String} str configure a graph from a JSON string
   * @param {Boolean} returns if there was any error parsing
   */ LGraph.prototype.configure = function (t, e) {
    if (t) {
      e || this.clear();
      var a = t.nodes;
      if (t.links && t.links.constructor === Array) {
        var o = [];
        for (var r = 0; r < t.links.length; ++r) {
          var l = t.links[r];
          if (l) {
            var n = new LLink();
            n.configure(l);
            o[n.id] = n;
          } else
            console.warn(
              "serialized graph link data contains errors, skipping."
            );
        }
        t.links = o;
      }
      for (var r in t)
        "nodes" != r && "groups" != r && ((this || _global)[r] = t[r]);
      var s = false;
      (this || _global)._nodes = [];
      if (a) {
        r = 0;
        for (var u = a.length; r < u; ++r) {
          var h = a[r];
          var p = LiteGraph.createNode(h.type, h.title);
          if (!p) {
            LiteGraph.debug &&
              console.log("Node not found or has errors: " + h.type);
            p = new LGraphNode();
            p.last_serialization = h;
            p.has_errors = true;
            s = true;
          }
          p.id = h.id;
          this.add(p, true);
        }
        for (r = 0, u = a.length; r < u; ++r) {
          h = a[r];
          p = this.getNodeById(h.id);
          p && p.configure(h);
        }
      }
      (this || _global)._groups.length = 0;
      if (t.groups)
        for (r = 0; r < t.groups.length; ++r) {
          var _ = new LiteGraph.LGraphGroup();
          _.configure(t.groups[r]);
          this.add(_);
        }
      this.updateExecutionOrder();
      (this || _global).extra = t.extra || {};
      (this || _global).onConfigure && this.onConfigure(t);
      (this || _global)._version++;
      this.setDirtyCanvas(true, true);
      return s;
    }
  };
  LGraph.prototype.load = function (t, e) {
    var a = this || _global;
    if (t.constructor !== File && t.constructor !== Blob) {
      var o = new XMLHttpRequest();
      o.open("GET", t, true);
      o.send(null);
      o.onload = function (t) {
        if (200 === o.status) {
          var r = JSON.parse(o.response);
          a.configure(r);
          e && e();
        } else console.error("Error loading graph:", o.status, o.response);
      };
      o.onerror = function (t) {
        console.error("Error loading graph:", t);
      };
    } else {
      var r = new FileReader();
      r.addEventListener("load", function (t) {
        var o = JSON.parse(t.target.result);
        a.configure(o);
        e && e();
      });
      r.readAsText(t);
    }
  };
  LGraph.prototype.onNodeTrace = function (t, e, a) {};
  function LLink(t, e, a, o, r, l) {
    (this || _global).id = t;
    (this || _global).type = e;
    (this || _global).origin_id = a;
    (this || _global).origin_slot = o;
    (this || _global).target_id = r;
    (this || _global).target_slot = l;
    (this || _global)._data = null;
    (this || _global)._pos = new Float32Array(2);
  }
  LLink.prototype.configure = function (t) {
    if (t.constructor === Array) {
      (this || _global).id = t[0];
      (this || _global).origin_id = t[1];
      (this || _global).origin_slot = t[2];
      (this || _global).target_id = t[3];
      (this || _global).target_slot = t[4];
      (this || _global).type = t[5];
    } else {
      (this || _global).id = t.id;
      (this || _global).type = t.type;
      (this || _global).origin_id = t.origin_id;
      (this || _global).origin_slot = t.origin_slot;
      (this || _global).target_id = t.target_id;
      (this || _global).target_slot = t.target_slot;
    }
  };
  LLink.prototype.serialize = function () {
    return [
      (this || _global).id,
      (this || _global).origin_id,
      (this || _global).origin_slot,
      (this || _global).target_id,
      (this || _global).target_slot,
      (this || _global).type,
    ];
  };
  LiteGraph.LLink = LLink;
  /**
   * Base Class for all the node type classes
   * @class LGraphNode
   * @param {String} name a name for the node
   */ function LGraphNode(t) {
    this._ctor(t);
  }
  global.LGraphNode = LiteGraph.LGraphNode = LGraphNode;
  LGraphNode.prototype._ctor = function (t) {
    (this || _global).title = t || "Unnamed";
    (this || _global).size = [LiteGraph.NODE_WIDTH, 60];
    (this || _global).graph = null;
    (this || _global)._pos = new Float32Array(10, 10);
    Object.defineProperty(this || _global, "pos", {
      set: function (t) {
        if (t && !(t.length < 2)) {
          (this || _global)._pos[0] = t[0];
          (this || _global)._pos[1] = t[1];
        }
      },
      get: function () {
        return (this || _global)._pos;
      },
      enumerable: true,
    });
    (this || _global).id = -1;
    (this || _global).type = null;
    (this || _global).inputs = [];
    (this || _global).outputs = [];
    (this || _global).connections = [];
    (this || _global).properties = {};
    (this || _global).properties_info = [];
    (this || _global).flags = {};
  };
  LGraphNode.prototype.configure = function (t) {
    (this || _global).graph && (this || _global).graph._version++;
    for (var e in t)
      if ("properties" != e)
        null != t[e] &&
          ("object" == typeof t[e]
            ? (this || _global)[e] && (this || _global)[e].configure
              ? (this || _global)[e].configure(t[e])
              : ((this || _global)[e] = LiteGraph.cloneObject(
                  t[e],
                  (this || _global)[e]
                ))
            : ((this || _global)[e] = t[e]));
      else
        for (var a in t.properties) {
          (this || _global).properties[a] = t.properties[a];
          (this || _global).onPropertyChanged &&
            this.onPropertyChanged(a, t.properties[a]);
        }
    t.title || ((this || _global).title = (this || _global).constructor.title);
    if ((this || _global).inputs)
      for (var o = 0; o < (this || _global).inputs.length; ++o) {
        var r = (this || _global).inputs[o];
        var l = (this || _global).graph
          ? (this || _global).graph.links[r.link]
          : null;
        (this || _global).onConnectionsChange &&
          this.onConnectionsChange(LiteGraph.INPUT, o, true, l, r);
        (this || _global).onInputAdded && this.onInputAdded(r);
      }
    if ((this || _global).outputs)
      for (o = 0; o < (this || _global).outputs.length; ++o) {
        var n = (this || _global).outputs[o];
        if (n.links) {
          for (e = 0; e < n.links.length; ++e) {
            l = (this || _global).graph
              ? (this || _global).graph.links[n.links[e]]
              : null;
            (this || _global).onConnectionsChange &&
              this.onConnectionsChange(LiteGraph.OUTPUT, o, true, l, n);
          }
          (this || _global).onOutputAdded && this.onOutputAdded(n);
        }
      }
    if ((this || _global).widgets) {
      for (o = 0; o < (this || _global).widgets.length; ++o) {
        var s = (this || _global).widgets[o];
        s &&
          s.options &&
          s.options.property &&
          (this || _global).properties[s.options.property] &&
          (s.value = JSON.parse(
            JSON.stringify((this || _global).properties[s.options.property])
          ));
      }
      if (t.widgets_values)
        for (o = 0; o < t.widgets_values.length; ++o)
          (this || _global).widgets[o] &&
            ((this || _global).widgets[o].value = t.widgets_values[o]);
    }
    (this || _global).onConfigure && this.onConfigure(t);
  };
  LGraphNode.prototype.serialize = function () {
    var t = {
      id: (this || _global).id,
      type: (this || _global).type,
      pos: (this || _global).pos,
      size: (this || _global).size,
      flags: LiteGraph.cloneObject((this || _global).flags),
      order: (this || _global).order,
      mode: (this || _global).mode,
    };
    if (
      (this || _global).constructor === LGraphNode &&
      (this || _global).last_serialization
    )
      return (this || _global).last_serialization;
    (this || _global).inputs && (t.inputs = (this || _global).inputs);
    if ((this || _global).outputs) {
      for (var e = 0; e < (this || _global).outputs.length; e++)
        delete (this || _global).outputs[e]._data;
      t.outputs = (this || _global).outputs;
    }
    (this || _global).title &&
      (this || _global).title != (this || _global).constructor.title &&
      (t.title = (this || _global).title);
    (this || _global).properties &&
      (t.properties = LiteGraph.cloneObject((this || _global).properties));
    if ((this || _global).widgets && (this || _global).serialize_widgets) {
      t.widgets_values = [];
      for (e = 0; e < (this || _global).widgets.length; ++e)
        (this || _global).widgets[e]
          ? (t.widgets_values[e] = (this || _global).widgets[e].value)
          : (t.widgets_values[e] = null);
    }
    t.type || (t.type = (this || _global).constructor.type);
    (this || _global).color && (t.color = (this || _global).color);
    (this || _global).bgcolor && (t.bgcolor = (this || _global).bgcolor);
    (this || _global).boxcolor && (t.boxcolor = (this || _global).boxcolor);
    (this || _global).shape && (t.shape = (this || _global).shape);
    (this || _global).onSerialize &&
      this.onSerialize(t) &&
      console.warn(
        "node onSerialize shouldnt return anything, data should be stored in the object pass in the first parameter"
      );
    return t;
  };
  LGraphNode.prototype.clone = function () {
    var t = LiteGraph.createNode((this || _global).type);
    if (!t) return null;
    var e = LiteGraph.cloneObject(this.serialize());
    if (e.inputs)
      for (var a = 0; a < e.inputs.length; ++a) e.inputs[a].link = null;
    if (e.outputs)
      for (a = 0; a < e.outputs.length; ++a)
        e.outputs[a].links && (e.outputs[a].links.length = 0);
    delete e.id;
    t.configure(e);
    return t;
  };
  LGraphNode.prototype.toString = function () {
    return JSON.stringify(this.serialize());
  };
  LGraphNode.prototype.getTitle = function () {
    return (this || _global).title || (this || _global).constructor.title;
  };
  /**
   * sets the value of a property
   * @method setProperty
   * @param {String} name
   * @param {*} value
   */ LGraphNode.prototype.setProperty = function (t, e) {
    (this || _global).properties || ((this || _global).properties = {});
    if (e !== (this || _global).properties[t]) {
      var a = (this || _global).properties[t];
      (this || _global).properties[t] = e;
      (this || _global).onPropertyChanged &&
        false === this.onPropertyChanged(t, e, a) &&
        ((this || _global).properties[t] = a);
      if ((this || _global).widgets)
        for (var o = 0; o < (this || _global).widgets.length; ++o) {
          var r = (this || _global).widgets[o];
          if (r && r.options.property == t) {
            r.value = e;
            break;
          }
        }
    }
  };
  /**
   * sets the output data
   * @method setOutputData
   * @param {number} slot
   * @param {*} data
   */ LGraphNode.prototype.setOutputData = function (t, e) {
    if (
      (this || _global).outputs &&
      !(-1 == t || t >= (this || _global).outputs.length)
    ) {
      var a = (this || _global).outputs[t];
      if (a) {
        a._data = e;
        if ((this || _global).outputs[t].links)
          for (var o = 0; o < (this || _global).outputs[t].links.length; o++) {
            var r = (this || _global).outputs[t].links[o];
            var l = (this || _global).graph.links[r];
            l && (l.data = e);
          }
      }
    }
  };
  /**
   * sets the output data type, useful when you want to be able to overwrite the data type
   * @method setOutputDataType
   * @param {number} slot
   * @param {String} datatype
   */ LGraphNode.prototype.setOutputDataType = function (t, e) {
    if (
      (this || _global).outputs &&
      !(-1 == t || t >= (this || _global).outputs.length)
    ) {
      var a = (this || _global).outputs[t];
      if (a) {
        a.type = e;
        if ((this || _global).outputs[t].links)
          for (var o = 0; o < (this || _global).outputs[t].links.length; o++) {
            var r = (this || _global).outputs[t].links[o];
            (this || _global).graph.links[r].type = e;
          }
      }
    }
  };
  /**
   * Retrieves the input data (data traveling through the connection) from one slot
   * @method getInputData
   * @param {number} slot
   * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
   * @return {*} data or if it is not connected returns undefined
   */ LGraphNode.prototype.getInputData = function (t, e) {
    if (
      (this || _global).inputs &&
      !(
        t >= (this || _global).inputs.length ||
        null == (this || _global).inputs[t].link
      )
    ) {
      var a = (this || _global).inputs[t].link;
      var o = (this || _global).graph.links[a];
      if (!o) return null;
      if (!e) return o.data;
      var r = (this || _global).graph.getNodeById(o.origin_id);
      if (!r) return o.data;
      r.updateOutputData
        ? r.updateOutputData(o.origin_slot)
        : r.onExecute && r.onExecute();
      return o.data;
    }
  };
  /**
   * Retrieves the input data type (in case this supports multiple input types)
   * @method getInputDataType
   * @param {number} slot
   * @return {String} datatype in string format
   */ LGraphNode.prototype.getInputDataType = function (t) {
    if (!(this || _global).inputs) return null;
    if (
      t >= (this || _global).inputs.length ||
      null == (this || _global).inputs[t].link
    )
      return null;
    var e = (this || _global).inputs[t].link;
    var a = (this || _global).graph.links[e];
    if (!a) return null;
    var o = (this || _global).graph.getNodeById(a.origin_id);
    if (!o) return a.type;
    var r = o.outputs[a.origin_slot];
    return r ? r.type : null;
  };
  /**
   * Retrieves the input data from one slot using its name instead of slot number
   * @method getInputDataByName
   * @param {String} slot_name
   * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
   * @return {*} data or if it is not connected returns null
   */ LGraphNode.prototype.getInputDataByName = function (t, e) {
    var a = this.findInputSlot(t);
    return -1 == a ? null : this.getInputData(a, e);
  };
  /**
   * tells you if there is a connection in one input slot
   * @method isInputConnected
   * @param {number} slot
   * @return {boolean}
   */ LGraphNode.prototype.isInputConnected = function (t) {
    return (
      !!(this || _global).inputs &&
      t < (this || _global).inputs.length &&
      null != (this || _global).inputs[t].link
    );
  };
  /**
   * tells you info about an input connection (which node, type, etc)
   * @method getInputInfo
   * @param {number} slot
   * @return {Object} object or null { link: id, name: string, type: string or 0 }
   */ LGraphNode.prototype.getInputInfo = function (t) {
    return (this || _global).inputs && t < (this || _global).inputs.length
      ? (this || _global).inputs[t]
      : null;
  };
  /**
   * Returns the link info in the connection of an input slot
   * @method getInputLink
   * @param {number} slot
   * @return {LLink} object or null
   */ LGraphNode.prototype.getInputLink = function (t) {
    if (!(this || _global).inputs) return null;
    if (t < (this || _global).inputs.length) {
      var e = (this || _global).inputs[t];
      return (this || _global).graph.links[e.link];
    }
    return null;
  };
  /**
   * returns the node connected in the input slot
   * @method getInputNode
   * @param {number} slot
   * @return {LGraphNode} node or null
   */ LGraphNode.prototype.getInputNode = function (t) {
    if (!(this || _global).inputs) return null;
    if (t >= (this || _global).inputs.length) return null;
    var e = (this || _global).inputs[t];
    if (!e || null === e.link) return null;
    var a = (this || _global).graph.links[e.link];
    return a ? (this || _global).graph.getNodeById(a.origin_id) : null;
  };
  /**
   * returns the value of an input with this name, otherwise checks if there is a property with that name
   * @method getInputOrProperty
   * @param {string} name
   * @return {*} value
   */ LGraphNode.prototype.getInputOrProperty = function (t) {
    if (!(this || _global).inputs || !(this || _global).inputs.length)
      return (this || _global).properties
        ? (this || _global).properties[t]
        : null;
    for (var e = 0, a = (this || _global).inputs.length; e < a; ++e) {
      var o = (this || _global).inputs[e];
      if (t == o.name && null != o.link) {
        var r = (this || _global).graph.links[o.link];
        if (r) return r.data;
      }
    }
    return (this || _global).properties[t];
  };
  /**
   * tells you the last output data that went in that slot
   * @method getOutputData
   * @param {number} slot
   * @return {Object}  object or null
   */ LGraphNode.prototype.getOutputData = function (t) {
    if (!(this || _global).outputs) return null;
    if (t >= (this || _global).outputs.length) return null;
    var e = (this || _global).outputs[t];
    return e._data;
  };
  /**
   * tells you info about an output connection (which node, type, etc)
   * @method getOutputInfo
   * @param {number} slot
   * @return {Object}  object or null { name: string, type: string, links: [ ids of links in number ] }
   */ LGraphNode.prototype.getOutputInfo = function (t) {
    return (this || _global).outputs && t < (this || _global).outputs.length
      ? (this || _global).outputs[t]
      : null;
  };
  /**
   * tells you if there is a connection in one output slot
   * @method isOutputConnected
   * @param {number} slot
   * @return {boolean}
   */ LGraphNode.prototype.isOutputConnected = function (t) {
    return (
      !!(this || _global).outputs &&
      t < (this || _global).outputs.length &&
      (this || _global).outputs[t].links &&
      (this || _global).outputs[t].links.length
    );
  };
  LGraphNode.prototype.isAnyOutputConnected = function () {
    if (!(this || _global).outputs) return false;
    for (var t = 0; t < (this || _global).outputs.length; ++t)
      if (
        (this || _global).outputs[t].links &&
        (this || _global).outputs[t].links.length
      )
        return true;
    return false;
  };
  /**
   * retrieves all the nodes connected to this output slot
   * @method getOutputNodes
   * @param {number} slot
   * @return {array}
   */ LGraphNode.prototype.getOutputNodes = function (t) {
    if (!(this || _global).outputs || 0 == (this || _global).outputs.length)
      return null;
    if (t >= (this || _global).outputs.length) return null;
    var e = (this || _global).outputs[t];
    if (!e.links || 0 == e.links.length) return null;
    var a = [];
    for (var o = 0; o < e.links.length; o++) {
      var r = e.links[o];
      var l = (this || _global).graph.links[r];
      if (l) {
        var n = (this || _global).graph.getNodeById(l.target_id);
        n && a.push(n);
      }
    }
    return a;
  };
  LGraphNode.prototype.addOnTriggerInput = function () {
    var t = this.findInputSlot("onTrigger");
    if (-1 == t) {
      this.addInput("onTrigger", LiteGraph.EVENT, {
        optional: true,
        nameLocked: true,
      });
      return this.findInputSlot("onTrigger");
    }
    return t;
  };
  LGraphNode.prototype.addOnExecutedOutput = function () {
    var t = this.findOutputSlot("onExecuted");
    if (-1 == t) {
      this.addOutput("onExecuted", LiteGraph.ACTION, {
        optional: true,
        nameLocked: true,
      });
      return this.findOutputSlot("onExecuted");
    }
    return t;
  };
  LGraphNode.prototype.onAfterExecuteNode = function (t, e) {
    var a = this.findOutputSlot("onExecuted");
    -1 != a && this.triggerSlot(a, t, null, e);
  };
  LGraphNode.prototype.changeMode = function (t) {
    switch (t) {
      case LiteGraph.ON_EVENT:
        break;
      case LiteGraph.ON_TRIGGER:
        this.addOnTriggerInput();
        this.addOnExecutedOutput();
        break;
      case LiteGraph.NEVER:
        break;
      case LiteGraph.ALWAYS:
        break;
      case LiteGraph.ON_REQUEST:
        break;
      default:
        return false;
    }
    (this || _global).mode = t;
    return true;
  };
  /**
   * Triggers the node code execution, place a boolean/counter to mark the node as being executed
   * @method execute
   * @param {*} param
   * @param {*} options
   */ LGraphNode.prototype.doExecute = function (t, e) {
    e = e || {};
    if ((this || _global).onExecute) {
      e.action_call ||
        (e.action_call =
          (this || _global).id + "_exec_" + Math.floor(9999 * Math.random()));
      (this || _global).graph.nodes_executing[(this || _global).id] = true;
      this.onExecute(t, e);
      (this || _global).graph.nodes_executing[(this || _global).id] = false;
      (this || _global).exec_version = (this || _global).graph.iteration;
      if (e && e.action_call) {
        (this || _global).action_call = e.action_call;
        (this || _global).graph.nodes_executedAction[(this || _global).id] =
          e.action_call;
      }
    }
    (this || _global).execute_triggered = 2;
    (this || _global).onAfterExecuteNode && this.onAfterExecuteNode(t, e);
  };
  /**
   * Triggers an action, wrapped by logics to control execution flow
   * @method actionDo
   * @param {String} action name
   * @param {*} param
   */ LGraphNode.prototype.actionDo = function (t, e, a) {
    a = a || {};
    if ((this || _global).onAction) {
      a.action_call ||
        (a.action_call =
          (this || _global).id +
          "_" +
          (t || "action") +
          "_" +
          Math.floor(9999 * Math.random()));
      (this || _global).graph.nodes_actioning[(this || _global).id] =
        t || "actioning";
      this.onAction(t, e, a);
      (this || _global).graph.nodes_actioning[(this || _global).id] = false;
      if (a && a.action_call) {
        (this || _global).action_call = a.action_call;
        (this || _global).graph.nodes_executedAction[(this || _global).id] =
          a.action_call;
      }
    }
    (this || _global).action_triggered = 2;
    (this || _global).onAfterExecuteNode && this.onAfterExecuteNode(e, a);
  };
  /**
   * Triggers an event in this node, this will trigger any output with the same name
   * @method trigger
   * @param {String} event name ( "on_play", ... ) if action is equivalent to false then the event is send to all
   * @param {*} param
   */ LGraphNode.prototype.trigger = function (t, e, a) {
    if ((this || _global).outputs && (this || _global).outputs.length) {
      (this || _global).graph &&
        ((this || _global).graph._last_trigger_time = LiteGraph.getTime());
      for (var o = 0; o < (this || _global).outputs.length; ++o) {
        var r = (this || _global).outputs[o];
        !r ||
          r.type !== LiteGraph.EVENT ||
          (t && r.name != t) ||
          this.triggerSlot(o, e, null, a);
      }
    }
  };
  /**
   * Triggers a slot event in this node: cycle output slots and launch execute/action on connected nodes
   * @method triggerSlot
   * @param {Number} slot the index of the output slot
   * @param {*} param
   * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
   */ LGraphNode.prototype.triggerSlot = function (t, e, a, o) {
    o = o || {};
    if ((this || _global).outputs)
      if (null != t) {
        t.constructor !== Number &&
          console.warn(
            "slot must be a number, use node.trigger('name') if you want to use a string"
          );
        var r = (this || _global).outputs[t];
        if (r) {
          var l = r.links;
          if (l && l.length) {
            (this || _global).graph &&
              ((this || _global).graph._last_trigger_time =
                LiteGraph.getTime());
            for (var n = 0; n < l.length; ++n) {
              var s = l[n];
              if (null == a || a == s) {
                var u = (this || _global).graph.links[l[n]];
                if (u) {
                  u._last_time = LiteGraph.getTime();
                  var h = (this || _global).graph.getNodeById(u.target_id);
                  if (h) {
                    var p = h.inputs[u.target_slot];
                    if (h.mode === LiteGraph.ON_TRIGGER) {
                      o.action_call ||
                        (o.action_call =
                          (this || _global).id +
                          "_trigg_" +
                          Math.floor(9999 * Math.random()));
                      h.onExecute && h.doExecute(e, o);
                    } else if (h.onAction) {
                      o.action_call ||
                        (o.action_call =
                          (this || _global).id +
                          "_act_" +
                          Math.floor(9999 * Math.random()));
                      p = h.inputs[u.target_slot];
                      h.actionDo(p.name, e, o);
                    }
                  }
                }
              }
            }
          }
        }
      } else console.error("slot must be a number");
  };
  /**
   * clears the trigger slot animation
   * @method clearTriggeredSlot
   * @param {Number} slot the index of the output slot
   * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
   */ LGraphNode.prototype.clearTriggeredSlot = function (t, e) {
    if ((this || _global).outputs) {
      var a = (this || _global).outputs[t];
      if (a) {
        var o = a.links;
        if (o && o.length)
          for (var r = 0; r < o.length; ++r) {
            var l = o[r];
            if (null == e || e == l) {
              var n = (this || _global).graph.links[o[r]];
              n && (n._last_time = 0);
            }
          }
      }
    }
  };
  /**
   * changes node size and triggers callback
   * @method setSize
   * @param {vec2} size
   */ LGraphNode.prototype.setSize = function (t) {
    (this || _global).size = t;
    (this || _global).onResize && this.onResize((this || _global).size);
  };
  /**
   * add a new property to this node
   * @method addProperty
   * @param {string} name
   * @param {*} default_value
   * @param {string} type string defining the output type ("vec3","number",...)
   * @param {Object} extra_info this can be used to have special properties of the property (like values, etc)
   */ LGraphNode.prototype.addProperty = function (t, e, a, o) {
    var r = { name: t, type: a, default_value: e };
    if (o) for (var l in o) r[l] = o[l];
    (this || _global).properties_info ||
      ((this || _global).properties_info = []);
    (this || _global).properties_info.push(r);
    (this || _global).properties || ((this || _global).properties = {});
    (this || _global).properties[t] = e;
    return r;
  };
  /**
   * add a new output slot to use in this node
   * @method addOutput
   * @param {string} name
   * @param {string} type string defining the output type ("vec3","number",...)
   * @param {Object} extra_info this can be used to have special properties of an output (label, special color, position, etc)
   */ LGraphNode.prototype.addOutput = function (t, e, a) {
    var o = { name: t, type: e, links: null };
    if (a) for (var r in a) o[r] = a[r];
    (this || _global).outputs || ((this || _global).outputs = []);
    (this || _global).outputs.push(o);
    (this || _global).onOutputAdded && this.onOutputAdded(o);
    LiteGraph.auto_load_slot_types &&
      LiteGraph.registerNodeAndSlotType(this || _global, e, true);
    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
    return o;
  };
  /**
   * add a new output slot to use in this node
   * @method addOutputs
   * @param {Array} array of triplets like [[name,type,extra_info],[...]]
   */ LGraphNode.prototype.addOutputs = function (t) {
    for (var e = 0; e < t.length; ++e) {
      var a = t[e];
      var o = { name: a[0], type: a[1], link: null };
      if (t[2]) for (var r in a[2]) o[r] = a[2][r];
      (this || _global).outputs || ((this || _global).outputs = []);
      (this || _global).outputs.push(o);
      (this || _global).onOutputAdded && this.onOutputAdded(o);
      LiteGraph.auto_load_slot_types &&
        LiteGraph.registerNodeAndSlotType(this || _global, a[1], true);
    }
    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
  };
  /**
   * remove an existing output slot
   * @method removeOutput
   * @param {number} slot
   */ LGraphNode.prototype.removeOutput = function (t) {
    this.disconnectOutput(t);
    (this || _global).outputs.splice(t, 1);
    for (var e = t; e < (this || _global).outputs.length; ++e)
      if ((this || _global).outputs[e] && (this || _global).outputs[e].links) {
        var a = (this || _global).outputs[e].links;
        for (var o = 0; o < a.length; ++o) {
          var r = (this || _global).graph.links[a[o]];
          r && (r.origin_slot -= 1);
        }
      }
    this.setSize(this.computeSize());
    (this || _global).onOutputRemoved && this.onOutputRemoved(t);
    this.setDirtyCanvas(true, true);
  };
  /**
   * add a new input slot to use in this node
   * @method addInput
   * @param {string} name
   * @param {string} type string defining the input type ("vec3","number",...), it its a generic one use 0
   * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
   */ LGraphNode.prototype.addInput = function (t, e, a) {
    e = e || 0;
    var o = { name: t, type: e, link: null };
    if (a) for (var r in a) o[r] = a[r];
    (this || _global).inputs || ((this || _global).inputs = []);
    (this || _global).inputs.push(o);
    this.setSize(this.computeSize());
    (this || _global).onInputAdded && this.onInputAdded(o);
    LiteGraph.registerNodeAndSlotType(this || _global, e);
    this.setDirtyCanvas(true, true);
    return o;
  };
  /**
   * add several new input slots in this node
   * @method addInputs
   * @param {Array} array of triplets like [[name,type,extra_info],[...]]
   */ LGraphNode.prototype.addInputs = function (t) {
    for (var e = 0; e < t.length; ++e) {
      var a = t[e];
      var o = { name: a[0], type: a[1], link: null };
      if (t[2]) for (var r in a[2]) o[r] = a[2][r];
      (this || _global).inputs || ((this || _global).inputs = []);
      (this || _global).inputs.push(o);
      (this || _global).onInputAdded && this.onInputAdded(o);
      LiteGraph.registerNodeAndSlotType(this || _global, a[1]);
    }
    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
  };
  /**
   * remove an existing input slot
   * @method removeInput
   * @param {number} slot
   */ LGraphNode.prototype.removeInput = function (t) {
    this.disconnectInput(t);
    var e = (this || _global).inputs.splice(t, 1);
    for (var a = t; a < (this || _global).inputs.length; ++a)
      if ((this || _global).inputs[a]) {
        var o = (this || _global).graph.links[(this || _global).inputs[a].link];
        o && (o.target_slot -= 1);
      }
    this.setSize(this.computeSize());
    (this || _global).onInputRemoved && this.onInputRemoved(t, e[0]);
    this.setDirtyCanvas(true, true);
  };
  /**
   * add an special connection to this node (used for special kinds of graphs)
   * @method addConnection
   * @param {string} name
   * @param {string} type string defining the input type ("vec3","number",...)
   * @param {[x,y]} pos position of the connection inside the node
   * @param {string} direction if is input or output
   */ LGraphNode.prototype.addConnection = function (t, e, a, o) {
    var r = { name: t, type: e, pos: a, direction: o, links: null };
    (this || _global).connections.push(r);
    return r;
  };
  /**
   * computes the minimum size of a node according to its inputs and output slots
   * @method computeSize
   * @param {number} minHeight
   * @return {number} the total size
   */ LGraphNode.prototype.computeSize = function (t) {
    if ((this || _global).constructor.size)
      return (this || _global).constructor.size.concat();
    var e = Math.max(
      (this || _global).inputs ? (this || _global).inputs.length : 1,
      (this || _global).outputs ? (this || _global).outputs.length : 1
    );
    var a = t || new Float32Array([0, 0]);
    e = Math.max(e, 1);
    var o = LiteGraph.NODE_TEXT_SIZE;
    var r = compute_text_size((this || _global).title);
    var l = 0;
    var n = 0;
    if ((this || _global).inputs)
      for (var s = 0, u = (this || _global).inputs.length; s < u; ++s) {
        var h = (this || _global).inputs[s];
        var p = h.label || h.name || "";
        var _ = compute_text_size(p);
        l < _ && (l = _);
      }
    if ((this || _global).outputs)
      for (s = 0, u = (this || _global).outputs.length; s < u; ++s) {
        var g = (this || _global).outputs[s];
        p = g.label || g.name || "";
        _ = compute_text_size(p);
        n < _ && (n = _);
      }
    a[0] = Math.max(l + n + 10, r);
    a[0] = Math.max(a[0], LiteGraph.NODE_WIDTH);
    (this || _global).widgets &&
      (this || _global).widgets.length &&
      (a[0] = Math.max(a[0], 1.5 * LiteGraph.NODE_WIDTH));
    a[1] =
      ((this || _global).constructor.slot_start_y || 0) +
      e * LiteGraph.NODE_SLOT_HEIGHT;
    var d = 0;
    if ((this || _global).widgets && (this || _global).widgets.length) {
      for (s = 0, u = (this || _global).widgets.length; s < u; ++s)
        (this || _global).widgets[s].computeSize
          ? (d += (this || _global).widgets[s].computeSize(a[0])[1] + 4)
          : (d += LiteGraph.NODE_WIDGET_HEIGHT + 4);
      d += 8;
    }
    (this || _global).widgets_up
      ? (a[1] = Math.max(a[1], d))
      : null != (this || _global).widgets_start_y
      ? (a[1] = Math.max(a[1], d + (this || _global).widgets_start_y))
      : (a[1] += d);
    function compute_text_size(t) {
      return t ? o * t.length * 0.6 : 0;
    }
    (this || _global).constructor.min_height &&
      a[1] < (this || _global).constructor.min_height &&
      (a[1] = (this || _global).constructor.min_height);
    a[1] += 6;
    return a;
  };
  /**
   * returns all the info available about a property of this node.
   *
   * @method getPropertyInfo
   * @param {String} property name of the property
   * @return {Object} the object with all the available info
   */ LGraphNode.prototype.getPropertyInfo = function (t) {
    var e = null;
    if ((this || _global).properties_info)
      for (var a = 0; a < (this || _global).properties_info.length; ++a)
        if ((this || _global).properties_info[a].name == t) {
          e = (this || _global).properties_info[a];
          break;
        }
    (this || _global).constructor["@" + t] &&
      (e = (this || _global).constructor["@" + t]);
    (this || _global).constructor.widgets_info &&
      (this || _global).constructor.widgets_info[t] &&
      (e = (this || _global).constructor.widgets_info[t]);
    !e &&
      (this || _global).onGetPropertyInfo &&
      (e = this.onGetPropertyInfo(t));
    e || (e = {});
    e.type || (e.type = typeof (this || _global).properties[t]);
    "combo" == e.widget && (e.type = "enum");
    return e;
  };
  /**
   * Defines a widget inside the node, it will be rendered on top of the node, you can control lots of properties
   *
   * @method addWidget
   * @param {String} type the widget type (could be "number","string","combo"
   * @param {String} name the text to show on the widget
   * @param {String} value the default value
   * @param {Function|String} callback function to call when it changes (optionally, it can be the name of the property to modify)
   * @param {Object} options the object that contains special properties of this widget
   * @return {Object} the created widget object
   */ LGraphNode.prototype.addWidget = function (t, e, a, o, r) {
    (this || _global).widgets || ((this || _global).widgets = []);
    if (!r && o && o.constructor === Object) {
      r = o;
      o = null;
    }
    r && r.constructor === String && (r = { property: r });
    if (o && o.constructor === String) {
      r || (r = {});
      r.property = o;
      o = null;
    }
    if (o && o.constructor !== Function) {
      console.warn("addWidget: callback must be a function");
      o = null;
    }
    var l = {
      type: t.toLowerCase(),
      name: e,
      value: a,
      callback: o,
      options: r || {},
    };
    void 0 !== l.options.y && (l.y = l.options.y);
    o ||
      l.options.callback ||
      l.options.property ||
      console.warn(
        "LiteGraph addWidget(...) without a callback or property assigned"
      );
    if ("combo" == t && !l.options.values)
      throw "LiteGraph addWidget('combo',...) requires to pass values in options: { values:['red','blue'] }";
    (this || _global).widgets.push(l);
    this.setSize(this.computeSize());
    return l;
  };
  LGraphNode.prototype.addCustomWidget = function (t) {
    (this || _global).widgets || ((this || _global).widgets = []);
    (this || _global).widgets.push(t);
    return t;
  };
  LGraphNode.prototype.getBounding = function (t) {
    t = t || new Float32Array(4);
    t[0] = (this || _global).pos[0] - 4;
    t[1] = (this || _global).pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
    t[2] = (this || _global).size[0] + 4;
    t[3] = (this || _global).flags.collapsed
      ? LiteGraph.NODE_TITLE_HEIGHT
      : (this || _global).size[1] + LiteGraph.NODE_TITLE_HEIGHT;
    (this || _global).onBounding && this.onBounding(t);
    return t;
  };
  /**
   * checks if a point is inside the shape of a node
   * @method isPointInside
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */ LGraphNode.prototype.isPointInside = function (t, e, a, o) {
    a = a || 0;
    var r =
      (this || _global).graph && (this || _global).graph.isLive()
        ? 0
        : LiteGraph.NODE_TITLE_HEIGHT;
    o && (r = 0);
    if ((this || _global).flags && (this || _global).flags.collapsed) {
      if (
        isInsideRectangle(
          t,
          e,
          (this || _global).pos[0] - a,
          (this || _global).pos[1] - LiteGraph.NODE_TITLE_HEIGHT - a,
          ((this || _global)._collapsed_width ||
            LiteGraph.NODE_COLLAPSED_WIDTH) +
            2 * a,
          LiteGraph.NODE_TITLE_HEIGHT + 2 * a
        )
      )
        return true;
    } else if (
      (this || _global).pos[0] - 4 - a < t &&
      (this || _global).pos[0] + (this || _global).size[0] + 4 + a > t &&
      (this || _global).pos[1] - r - a < e &&
      (this || _global).pos[1] + (this || _global).size[1] + a > e
    )
      return true;
    return false;
  };
  /**
   * checks if a point is inside a node slot, and returns info about which slot
   * @method getSlotInPosition
   * @param {number} x
   * @param {number} y
   * @return {Object} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
   */ LGraphNode.prototype.getSlotInPosition = function (t, e) {
    var a = new Float32Array(2);
    if ((this || _global).inputs)
      for (var o = 0, r = (this || _global).inputs.length; o < r; ++o) {
        var l = (this || _global).inputs[o];
        this.getConnectionPos(true, o, a);
        if (isInsideRectangle(t, e, a[0] - 10, a[1] - 5, 20, 10))
          return { input: l, slot: o, link_pos: a };
      }
    if ((this || _global).outputs)
      for (o = 0, r = (this || _global).outputs.length; o < r; ++o) {
        var n = (this || _global).outputs[o];
        this.getConnectionPos(false, o, a);
        if (isInsideRectangle(t, e, a[0] - 10, a[1] - 5, 20, 10))
          return { output: n, slot: o, link_pos: a };
      }
    return null;
  };
  /**
   * returns the input slot with a given name (used for dynamic slots), -1 if not found
   * @method findInputSlot
   * @param {string} name the name of the slot
   * @param {boolean} returnObj if the obj itself wanted
   * @return {number_or_object} the slot (-1 if not found)
   */ LGraphNode.prototype.findInputSlot = function (t, e) {
    if (!(this || _global).inputs) return -1;
    for (var a = 0, o = (this || _global).inputs.length; a < o; ++a)
      if (t == (this || _global).inputs[a].name)
        return e ? (this || _global).inputs[a] : a;
    return -1;
  };
  /**
   * returns the output slot with a given name (used for dynamic slots), -1 if not found
   * @method findOutputSlot
   * @param {string} name the name of the slot
   * @param {boolean} returnObj if the obj itself wanted
   * @return {number_or_object} the slot (-1 if not found)
   */ LGraphNode.prototype.findOutputSlot = function (t, e) {
    e = e || false;
    if (!(this || _global).outputs) return -1;
    for (var a = 0, o = (this || _global).outputs.length; a < o; ++a)
      if (t == (this || _global).outputs[a].name)
        return e ? (this || _global).outputs[a] : a;
    return -1;
  };
  /**
   * returns the first free input slot
   * @method findInputSlotFree
   * @param {object} options
   * @return {number_or_object} the slot (-1 if not found)
   */ LGraphNode.prototype.findInputSlotFree = function (t) {
    t = t || {};
    var e = { returnObj: false, typesNotAccepted: [] };
    var a = Object.assign(e, t);
    if (!(this || _global).inputs) return -1;
    for (var o = 0, r = (this || _global).inputs.length; o < r; ++o)
      if (
        (!(this || _global).inputs[o].link ||
          null == (this || _global).inputs[o].link) &&
        !(
          a.typesNotAccepted &&
          a.typesNotAccepted.includes &&
          a.typesNotAccepted.includes((this || _global).inputs[o].type)
        )
      )
        return a.returnObj ? (this || _global).inputs[o] : o;
    return -1;
  };
  /**
   * returns the first output slot free
   * @method findOutputSlotFree
   * @param {object} options
   * @return {number_or_object} the slot (-1 if not found)
   */ LGraphNode.prototype.findOutputSlotFree = function (t) {
    t = t || {};
    var e = { returnObj: false, typesNotAccepted: [] };
    var a = Object.assign(e, t);
    if (!(this || _global).outputs) return -1;
    for (var o = 0, r = (this || _global).outputs.length; o < r; ++o)
      if (
        (!(this || _global).outputs[o].links ||
          null == (this || _global).outputs[o].links) &&
        !(
          a.typesNotAccepted &&
          a.typesNotAccepted.includes &&
          a.typesNotAccepted.includes((this || _global).outputs[o].type)
        )
      )
        return a.returnObj ? (this || _global).outputs[o] : o;
    return -1;
  };
  LGraphNode.prototype.findInputSlotByType = function (t, e, a, o) {
    return this.findSlotByType(true, t, e, a, o);
  };
  LGraphNode.prototype.findOutputSlotByType = function (t, e, a, o) {
    return this.findSlotByType(false, t, e, a, o);
  };
  /**
   * returns the output (or input) slot with a given type, -1 if not found
   * @method findSlotByType
   * @param {boolean} input uise inputs instead of outputs
   * @param {string} type the type of the slot
   * @param {boolean} returnObj if the obj itself wanted
   * @param {boolean} preferFreeSlot if we want a free slot (if not found, will return the first of the type anyway)
   * @return {number_or_object} the slot (-1 if not found)
   */ LGraphNode.prototype.findSlotByType = function (t, e, a, o, r) {
    t = t || false;
    a = a || false;
    o = o || false;
    r = r || false;
    var l = t ? (this || _global).inputs : (this || _global).outputs;
    if (!l) return -1;
    ("" != e && "*" != e) || (e = 0);
    for (var n = 0, s = l.length; n < s; ++n) {
      var u = (e + "").toLowerCase().split(",");
      var h = "0" == l[n].type || "*" == l[n].type ? "0" : l[n].type;
      h = (h + "").toLowerCase().split(",");
      for (var p = 0; p < u.length; p++)
        for (var _ = 0; _ < h.length; _++) {
          "_event_" == u[p] && (u[p] = LiteGraph.EVENT);
          "_event_" == h[p] && (h[p] = LiteGraph.EVENT);
          "*" == u[p] && (u[p] = 0);
          "*" == h[p] && (h[p] = 0);
          if (u[p] == h[_]) {
            if (o && l[n].links && null !== l[n].links) continue;
            return a ? l[n] : n;
          }
        }
    }
    if (o && !r)
      for (n = 0, s = l.length; n < s; ++n) {
        u = (e + "").toLowerCase().split(",");
        h = "0" == l[n].type || "*" == l[n].type ? "0" : l[n].type;
        h = (h + "").toLowerCase().split(",");
        for (p = 0; p < u.length; p++)
          for (_ = 0; _ < h.length; _++) {
            "*" == u[p] && (u[p] = 0);
            "*" == h[p] && (h[p] = 0);
            if (u[p] == h[_]) return a ? l[n] : n;
          }
      }
    return -1;
  };
  /**
   * connect this node output to the input of another node BY TYPE
   * @method connectByType
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {string} target_type the input slot type of the target node
   * @return {Object} the link_info is created, otherwise null
   */ LGraphNode.prototype.connectByType = function (t, e, a, o) {
    o = o || {};
    var r = {
      createEventInCase: true,
      firstFreeIfOutputGeneralInCase: true,
      generalTypeInCase: true,
    };
    var l = Object.assign(r, o);
    e &&
      e.constructor === Number &&
      (e = (this || _global).graph.getNodeById(e));
    var n = e.findInputSlotByType(a, false, true);
    if (n >= 0 && null !== n) return this.connect(t, e, n);
    if (l.createEventInCase && a == LiteGraph.EVENT)
      return this.connect(t, e, -1);
    if (l.generalTypeInCase) {
      n = e.findInputSlotByType(0, false, true, true);
      if (n >= 0) return this.connect(t, e, n);
    }
    if (l.firstFreeIfOutputGeneralInCase && (0 == a || "*" == a || "" == a)) {
      n = e.findInputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
      if (n >= 0) return this.connect(t, e, n);
    }
    console.debug("no way to connect type: ", a, " to targetNODE ", e);
    return null;
  };
  /**
   * connect this node input to the output of another node BY TYPE
   * @method connectByType
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {string} target_type the output slot type of the target node
   * @return {Object} the link_info is created, otherwise null
   */ LGraphNode.prototype.connectByTypeOutput = function (t, e, a, o) {
    o = o || {};
    var r = {
      createEventInCase: true,
      firstFreeIfInputGeneralInCase: true,
      generalTypeInCase: true,
    };
    var l = Object.assign(r, o);
    e &&
      e.constructor === Number &&
      (e = (this || _global).graph.getNodeById(e));
    var n = e.findOutputSlotByType(a, false, true);
    if (n >= 0 && null !== n) return e.connect(n, this || _global, t);
    if (l.generalTypeInCase) {
      n = e.findOutputSlotByType(0, false, true, true);
      if (n >= 0) return e.connect(n, this || _global, t);
    }
    if (
      l.createEventInCase &&
      a == LiteGraph.EVENT &&
      LiteGraph.do_add_triggers_slots
    ) {
      n = e.addOnExecutedOutput();
      return e.connect(n, this || _global, t);
    }
    if (l.firstFreeIfInputGeneralInCase && (0 == a || "*" == a || "" == a)) {
      n = e.findOutputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
      if (n >= 0) return e.connect(n, this || _global, t);
    }
    console.debug("no way to connect byOUT type: ", a, " to sourceNODE ", e);
    return null;
  };
  /**
   * connect this node output to the input of another node
   * @method connect
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot, or -1 to connect a trigger)
   * @return {Object} the link_info is created, otherwise null
   */ LGraphNode.prototype.connect = function (t, e, a) {
    a = a || 0;
    if (!(this || _global).graph) {
      console.log(
        "Connect: Error, node doesn't belong to any graph. Nodes must be added first to a graph before connecting them."
      );
      return null;
    }
    if (t.constructor === String) {
      t = this.findOutputSlot(t);
      if (-1 == t) {
        LiteGraph.debug && console.log("Connect: Error, no slot of name " + t);
        return null;
      }
    } else if (
      !(this || _global).outputs ||
      t >= (this || _global).outputs.length
    ) {
      LiteGraph.debug && console.log("Connect: Error, slot number not found");
      return null;
    }
    e &&
      e.constructor === Number &&
      (e = (this || _global).graph.getNodeById(e));
    if (!e) throw "target node is null";
    if (e == (this || _global)) return null;
    if (a.constructor === String) {
      a = e.findInputSlot(a);
      if (-1 == a) {
        LiteGraph.debug && console.log("Connect: Error, no slot of name " + a);
        return null;
      }
    } else if (a === LiteGraph.EVENT) {
      if (!LiteGraph.do_add_triggers_slots) return null;
      e.changeMode(LiteGraph.ON_TRIGGER);
      a = e.findInputSlot("onTrigger");
    } else if (!e.inputs || a >= e.inputs.length) {
      LiteGraph.debug && console.log("Connect: Error, slot number not found");
      return null;
    }
    var o = false;
    var r = e.inputs[a];
    var l = null;
    var n = (this || _global).outputs[t];
    if (!(this || _global).outputs[t]) return null;
    e.onBeforeConnectInput && (a = e.onBeforeConnectInput(a));
    if (
      false === a ||
      null === a ||
      !LiteGraph.isValidConnection(n.type, r.type)
    ) {
      this.setDirtyCanvas(false, true);
      o && (this || _global).graph.connectionChange(this || _global, l);
      return null;
    }
    if (
      e.onConnectInput &&
      false === e.onConnectInput(a, n.type, n, this || _global, t)
    )
      return null;
    if (
      (this || _global).onConnectOutput &&
      false === this.onConnectOutput(t, r.type, r, e, a)
    )
      return null;
    if (e.inputs[a] && null != e.inputs[a].link) {
      (this || _global).graph.beforeChange();
      e.disconnectInput(a, { doProcessChange: false });
      o = true;
    }
    if (null !== n.links && n.links.length)
      switch (n.type) {
        case LiteGraph.EVENT:
          if (!LiteGraph.allow_multi_output_for_events) {
            (this || _global).graph.beforeChange();
            this.disconnectOutput(t, false, { doProcessChange: false });
            o = true;
          }
          break;
        default:
          break;
      }
    l = new LLink(
      ++(this || _global).graph.last_link_id,
      r.type || n.type,
      (this || _global).id,
      t,
      e.id,
      a
    );
    (this || _global).graph.links[l.id] = l;
    null == n.links && (n.links = []);
    n.links.push(l.id);
    e.inputs[a].link = l.id;
    (this || _global).graph && (this || _global).graph._version++;
    (this || _global).onConnectionsChange &&
      this.onConnectionsChange(LiteGraph.OUTPUT, t, true, l, n);
    e.onConnectionsChange &&
      e.onConnectionsChange(LiteGraph.INPUT, a, true, l, r);
    if (
      (this || _global).graph &&
      (this || _global).graph.onNodeConnectionChange
    ) {
      (this || _global).graph.onNodeConnectionChange(
        LiteGraph.INPUT,
        e,
        a,
        this || _global,
        t
      );
      (this || _global).graph.onNodeConnectionChange(
        LiteGraph.OUTPUT,
        this || _global,
        t,
        e,
        a
      );
    }
    this.setDirtyCanvas(false, true);
    (this || _global).graph.afterChange();
    (this || _global).graph.connectionChange(this || _global, l);
    return l;
  };
  /**
   * disconnect one output to an specific node
   * @method disconnectOutput
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
   * @return {boolean} if it was disconnected successfully
   */ LGraphNode.prototype.disconnectOutput = function (t, e) {
    if (t.constructor === String) {
      t = this.findOutputSlot(t);
      if (-1 == t) {
        LiteGraph.debug && console.log("Connect: Error, no slot of name " + t);
        return false;
      }
    } else if (
      !(this || _global).outputs ||
      t >= (this || _global).outputs.length
    ) {
      LiteGraph.debug && console.log("Connect: Error, slot number not found");
      return false;
    }
    var a = (this || _global).outputs[t];
    if (!a || !a.links || 0 == a.links.length) return false;
    if (e) {
      e.constructor === Number && (e = (this || _global).graph.getNodeById(e));
      if (!e) throw "Target Node not found";
      for (var o = 0, r = a.links.length; o < r; o++) {
        var l = a.links[o];
        var n = (this || _global).graph.links[l];
        if (n.target_id == e.id) {
          a.links.splice(o, 1);
          var s = e.inputs[n.target_slot];
          s.link = null;
          delete (this || _global).graph.links[l];
          (this || _global).graph && (this || _global).graph._version++;
          e.onConnectionsChange &&
            e.onConnectionsChange(LiteGraph.INPUT, n.target_slot, false, n, s);
          (this || _global).onConnectionsChange &&
            this.onConnectionsChange(LiteGraph.OUTPUT, t, false, n, a);
          (this || _global).graph &&
            (this || _global).graph.onNodeConnectionChange &&
            (this || _global).graph.onNodeConnectionChange(
              LiteGraph.OUTPUT,
              this || _global,
              t
            );
          if (
            (this || _global).graph &&
            (this || _global).graph.onNodeConnectionChange
          ) {
            (this || _global).graph.onNodeConnectionChange(
              LiteGraph.OUTPUT,
              this || _global,
              t
            );
            (this || _global).graph.onNodeConnectionChange(
              LiteGraph.INPUT,
              e,
              n.target_slot
            );
          }
          break;
        }
      }
    } else {
      for (o = 0, r = a.links.length; o < r; o++) {
        l = a.links[o];
        n = (this || _global).graph.links[l];
        if (n) {
          e = (this || _global).graph.getNodeById(n.target_id);
          s = null;
          (this || _global).graph && (this || _global).graph._version++;
          if (e) {
            s = e.inputs[n.target_slot];
            s.link = null;
            e.onConnectionsChange &&
              e.onConnectionsChange(
                LiteGraph.INPUT,
                n.target_slot,
                false,
                n,
                s
              );
            (this || _global).graph &&
              (this || _global).graph.onNodeConnectionChange &&
              (this || _global).graph.onNodeConnectionChange(
                LiteGraph.INPUT,
                e,
                n.target_slot
              );
          }
          delete (this || _global).graph.links[l];
          (this || _global).onConnectionsChange &&
            this.onConnectionsChange(LiteGraph.OUTPUT, t, false, n, a);
          if (
            (this || _global).graph &&
            (this || _global).graph.onNodeConnectionChange
          ) {
            (this || _global).graph.onNodeConnectionChange(
              LiteGraph.OUTPUT,
              this || _global,
              t
            );
            (this || _global).graph.onNodeConnectionChange(
              LiteGraph.INPUT,
              e,
              n.target_slot
            );
          }
        }
      }
      a.links = null;
    }
    this.setDirtyCanvas(false, true);
    (this || _global).graph.connectionChange(this || _global);
    return true;
  };
  /**
   * disconnect one input
   * @method disconnectInput
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @return {boolean} if it was disconnected successfully
   */ LGraphNode.prototype.disconnectInput = function (t) {
    if (t.constructor === String) {
      t = this.findInputSlot(t);
      if (-1 == t) {
        LiteGraph.debug && console.log("Connect: Error, no slot of name " + t);
        return false;
      }
    } else if (
      !(this || _global).inputs ||
      t >= (this || _global).inputs.length
    ) {
      LiteGraph.debug && console.log("Connect: Error, slot number not found");
      return false;
    }
    var e = (this || _global).inputs[t];
    if (!e) return false;
    var a = (this || _global).inputs[t].link;
    if (null != a) {
      (this || _global).inputs[t].link = null;
      var o = (this || _global).graph.links[a];
      if (o) {
        var r = (this || _global).graph.getNodeById(o.origin_id);
        if (!r) return false;
        var l = r.outputs[o.origin_slot];
        if (!l || !l.links || 0 == l.links.length) return false;
        for (var n = 0, s = l.links.length; n < s; n++)
          if (l.links[n] == a) {
            l.links.splice(n, 1);
            break;
          }
        delete (this || _global).graph.links[a];
        (this || _global).graph && (this || _global).graph._version++;
        (this || _global).onConnectionsChange &&
          this.onConnectionsChange(LiteGraph.INPUT, t, false, o, e);
        r.onConnectionsChange &&
          r.onConnectionsChange(LiteGraph.OUTPUT, n, false, o, l);
        if (
          (this || _global).graph &&
          (this || _global).graph.onNodeConnectionChange
        ) {
          (this || _global).graph.onNodeConnectionChange(
            LiteGraph.OUTPUT,
            r,
            n
          );
          (this || _global).graph.onNodeConnectionChange(
            LiteGraph.INPUT,
            this || _global,
            t
          );
        }
      }
    }
    this.setDirtyCanvas(false, true);
    (this || _global).graph &&
      (this || _global).graph.connectionChange(this || _global);
    return true;
  };
  /**
   * returns the center of a connection point in canvas coords
   * @method getConnectionPos
   * @param {boolean} is_input true if if a input slot, false if it is an output
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {vec2} out [optional] a place to store the output, to free garbage
   * @return {[x,y]} the position
   **/ LGraphNode.prototype.getConnectionPos = function (t, e, a) {
    a = a || new Float32Array(2);
    var o = 0;
    t && (this || _global).inputs && (o = (this || _global).inputs.length);
    !t && (this || _global).outputs && (o = (this || _global).outputs.length);
    var r = 0.5 * LiteGraph.NODE_SLOT_HEIGHT;
    if ((this || _global).flags.collapsed) {
      var l =
        (this || _global)._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH;
      if ((this || _global).horizontal) {
        a[0] = (this || _global).pos[0] + 0.5 * l;
        a[1] = t
          ? (this || _global).pos[1] - LiteGraph.NODE_TITLE_HEIGHT
          : (this || _global).pos[1];
      } else {
        a[0] = t ? (this || _global).pos[0] : (this || _global).pos[0] + l;
        a[1] = (this || _global).pos[1] - 0.5 * LiteGraph.NODE_TITLE_HEIGHT;
      }
      return a;
    }
    if (t && -1 == e) {
      a[0] = (this || _global).pos[0] + 0.5 * LiteGraph.NODE_TITLE_HEIGHT;
      a[1] = (this || _global).pos[1] + 0.5 * LiteGraph.NODE_TITLE_HEIGHT;
      return a;
    }
    if (t && o > e && (this || _global).inputs[e].pos) {
      a[0] = (this || _global).pos[0] + (this || _global).inputs[e].pos[0];
      a[1] = (this || _global).pos[1] + (this || _global).inputs[e].pos[1];
      return a;
    }
    if (!t && o > e && (this || _global).outputs[e].pos) {
      a[0] = (this || _global).pos[0] + (this || _global).outputs[e].pos[0];
      a[1] = (this || _global).pos[1] + (this || _global).outputs[e].pos[1];
      return a;
    }
    if ((this || _global).horizontal) {
      a[0] =
        (this || _global).pos[0] + (e + 0.5) * ((this || _global).size[0] / o);
      a[1] = t
        ? (this || _global).pos[1] - LiteGraph.NODE_TITLE_HEIGHT
        : (this || _global).pos[1] + (this || _global).size[1];
      return a;
    }
    a[0] = t
      ? (this || _global).pos[0] + r
      : (this || _global).pos[0] + (this || _global).size[0] + 1 - r;
    a[1] =
      (this || _global).pos[1] +
      (e + 0.7) * LiteGraph.NODE_SLOT_HEIGHT +
      ((this || _global).constructor.slot_start_y || 0);
    return a;
  };
  LGraphNode.prototype.alignToGrid = function () {
    (this || _global).pos[0] =
      LiteGraph.CANVAS_GRID_SIZE *
      Math.round((this || _global).pos[0] / LiteGraph.CANVAS_GRID_SIZE);
    (this || _global).pos[1] =
      LiteGraph.CANVAS_GRID_SIZE *
      Math.round((this || _global).pos[1] / LiteGraph.CANVAS_GRID_SIZE);
  };
  LGraphNode.prototype.trace = function (t) {
    (this || _global).console || ((this || _global).console = []);
    (this || _global).console.push(t);
    (this || _global).console.length > LGraphNode.MAX_CONSOLE &&
      (this || _global).console.shift();
    (this || _global).graph.onNodeTrace &&
      (this || _global).graph.onNodeTrace(this || _global, t);
  };
  LGraphNode.prototype.setDirtyCanvas = function (t, e) {
    (this || _global).graph &&
      (this || _global).graph.sendActionToCanvas("setDirty", [t, e]);
  };
  LGraphNode.prototype.loadImage = function (t) {
    var e = new Image();
    e.src = LiteGraph.node_images_path + t;
    e.ready = false;
    var a = this || _global;
    e.onload = function () {
      (this || _global).ready = true;
      a.setDirtyCanvas(true);
    };
    return e;
  };
  LGraphNode.prototype.captureInput = function (t) {
    if (
      (this || _global).graph &&
      (this || _global).graph.list_of_graphcanvas
    ) {
      var e = (this || _global).graph.list_of_graphcanvas;
      for (var a = 0; a < e.length; ++a) {
        var o = e[a];
        (t || o.node_capturing_input == (this || _global)) &&
          (o.node_capturing_input = t ? this || _global : null);
      }
    }
  };
  LGraphNode.prototype.collapse = function (t) {
    (this || _global).graph._version++;
    if (false !== (this || _global).constructor.collapsable || t) {
      (this || _global).flags.collapsed
        ? ((this || _global).flags.collapsed = false)
        : ((this || _global).flags.collapsed = true);
      this.setDirtyCanvas(true, true);
    }
  };
  LGraphNode.prototype.pin = function (t) {
    (this || _global).graph._version++;
    (this || _global).flags.pinned =
      void 0 === t ? !(this || _global).flags.pinned : t;
  };
  LGraphNode.prototype.localToScreen = function (t, e, a) {
    return [
      (t + (this || _global).pos[0]) * a.scale + a.offset[0],
      (e + (this || _global).pos[1]) * a.scale + a.offset[1],
    ];
  };
  function LGraphGroup(t) {
    this._ctor(t);
  }
  global.LGraphGroup = LiteGraph.LGraphGroup = LGraphGroup;
  LGraphGroup.prototype._ctor = function (t) {
    (this || _global).title = t || "Group";
    (this || _global).font_size = 24;
    (this || _global).color = LGraphCanvas.node_colors.pale_blue
      ? LGraphCanvas.node_colors.pale_blue.groupcolor
      : "#AAA";
    (this || _global)._bounding = new Float32Array([10, 10, 140, 80]);
    (this || _global)._pos = (this || _global)._bounding.subarray(0, 2);
    (this || _global)._size = (this || _global)._bounding.subarray(2, 4);
    (this || _global)._nodes = [];
    (this || _global).graph = null;
    Object.defineProperty(this || _global, "pos", {
      set: function (t) {
        if (t && !(t.length < 2)) {
          (this || _global)._pos[0] = t[0];
          (this || _global)._pos[1] = t[1];
        }
      },
      get: function () {
        return (this || _global)._pos;
      },
      enumerable: true,
    });
    Object.defineProperty(this || _global, "size", {
      set: function (t) {
        if (t && !(t.length < 2)) {
          (this || _global)._size[0] = Math.max(140, t[0]);
          (this || _global)._size[1] = Math.max(80, t[1]);
        }
      },
      get: function () {
        return (this || _global)._size;
      },
      enumerable: true,
    });
  };
  LGraphGroup.prototype.configure = function (t) {
    (this || _global).title = t.title;
    (this || _global)._bounding.set(t.bounding);
    (this || _global).color = t.color;
    (this || _global).font = t.font;
  };
  LGraphGroup.prototype.serialize = function () {
    var t = (this || _global)._bounding;
    return {
      title: (this || _global).title,
      bounding: [
        Math.round(t[0]),
        Math.round(t[1]),
        Math.round(t[2]),
        Math.round(t[3]),
      ],
      color: (this || _global).color,
      font: (this || _global).font,
    };
  };
  LGraphGroup.prototype.move = function (t, e, a) {
    (this || _global)._pos[0] += t;
    (this || _global)._pos[1] += e;
    if (!a)
      for (var o = 0; o < (this || _global)._nodes.length; ++o) {
        var r = (this || _global)._nodes[o];
        r.pos[0] += t;
        r.pos[1] += e;
      }
  };
  LGraphGroup.prototype.recomputeInsideNodes = function () {
    (this || _global)._nodes.length = 0;
    var t = (this || _global).graph._nodes;
    var e = new Float32Array(4);
    for (var a = 0; a < t.length; ++a) {
      var o = t[a];
      o.getBounding(e);
      overlapBounding((this || _global)._bounding, e) &&
        (this || _global)._nodes.push(o);
    }
  };
  LGraphGroup.prototype.isPointInside = LGraphNode.prototype.isPointInside;
  LGraphGroup.prototype.setDirtyCanvas = LGraphNode.prototype.setDirtyCanvas;
  function DragAndScale(t, e) {
    (this || _global).offset = new Float32Array([0, 0]);
    (this || _global).scale = 1;
    (this || _global).max_scale = 10;
    (this || _global).min_scale = 0.1;
    (this || _global).onredraw = null;
    (this || _global).enabled = true;
    (this || _global).last_mouse = [0, 0];
    (this || _global).element = null;
    (this || _global).visible_area = new Float32Array(4);
    if (t) {
      (this || _global).element = t;
      e || this.bindEvents(t);
    }
  }
  LiteGraph.DragAndScale = DragAndScale;
  DragAndScale.prototype.bindEvents = function (t) {
    (this || _global).last_mouse = new Float32Array(2);
    (this || _global)._binded_mouse_callback = (this || _global).onMouse.bind(
      this || _global
    );
    LiteGraph.pointerListenerAdd(
      t,
      "down",
      (this || _global)._binded_mouse_callback
    );
    LiteGraph.pointerListenerAdd(
      t,
      "move",
      (this || _global)._binded_mouse_callback
    );
    LiteGraph.pointerListenerAdd(
      t,
      "up",
      (this || _global)._binded_mouse_callback
    );
    t.addEventListener(
      "mousewheel",
      (this || _global)._binded_mouse_callback,
      false
    );
    t.addEventListener(
      "wheel",
      (this || _global)._binded_mouse_callback,
      false
    );
  };
  DragAndScale.prototype.computeVisibleArea = function (t) {
    if ((this || _global).element) {
      var e = (this || _global).element.width;
      var a = (this || _global).element.height;
      var o = -(this || _global).offset[0];
      var r = -(this || _global).offset[1];
      if (t) {
        o += t[0] / (this || _global).scale;
        r += t[1] / (this || _global).scale;
        e = t[2];
        a = t[3];
      }
      var l = o + e / (this || _global).scale;
      var n = r + a / (this || _global).scale;
      (this || _global).visible_area[0] = o;
      (this || _global).visible_area[1] = r;
      (this || _global).visible_area[2] = l - o;
      (this || _global).visible_area[3] = n - r;
    } else
      (this || _global).visible_area[0] =
        (this || _global).visible_area[1] =
        (this || _global).visible_area[2] =
        (this || _global).visible_area[3] =
          0;
  };
  DragAndScale.prototype.onMouse = function (t) {
    if ((this || _global).enabled) {
      var e = (this || _global).element;
      var a = e.getBoundingClientRect();
      var o = t.clientX - a.left;
      var r = t.clientY - a.top;
      t.canvasx = o;
      t.canvasy = r;
      t.dragging = (this || _global).dragging;
      var l =
        !(this || _global).viewport ||
        ((this || _global).viewport &&
          o >= (this || _global).viewport[0] &&
          o < (this || _global).viewport[0] + (this || _global).viewport[2] &&
          r >= (this || _global).viewport[1] &&
          r < (this || _global).viewport[1] + (this || _global).viewport[3]);
      var n = false;
      (this || _global).onmouse && (n = this.onmouse(t));
      if (t.type == LiteGraph.pointerevents_method + "down" && l) {
        (this || _global).dragging = true;
        LiteGraph.pointerListenerRemove(
          e,
          "move",
          (this || _global)._binded_mouse_callback
        );
        LiteGraph.pointerListenerAdd(
          document,
          "move",
          (this || _global)._binded_mouse_callback
        );
        LiteGraph.pointerListenerAdd(
          document,
          "up",
          (this || _global)._binded_mouse_callback
        );
      } else if (t.type == LiteGraph.pointerevents_method + "move") {
        if (!n) {
          var s = o - (this || _global).last_mouse[0];
          var u = r - (this || _global).last_mouse[1];
          (this || _global).dragging && this.mouseDrag(s, u);
        }
      } else if (t.type == LiteGraph.pointerevents_method + "up") {
        (this || _global).dragging = false;
        LiteGraph.pointerListenerRemove(
          document,
          "move",
          (this || _global)._binded_mouse_callback
        );
        LiteGraph.pointerListenerRemove(
          document,
          "up",
          (this || _global)._binded_mouse_callback
        );
        LiteGraph.pointerListenerAdd(
          e,
          "move",
          (this || _global)._binded_mouse_callback
        );
      } else if (
        l &&
        ("mousewheel" == t.type ||
          "wheel" == t.type ||
          "DOMMouseScroll" == t.type)
      ) {
        t.eventType = "mousewheel";
        "wheel" == t.type
          ? (t.wheel = -t.deltaY)
          : (t.wheel = null != t.wheelDeltaY ? t.wheelDeltaY : -60 * t.detail);
        t.delta = t.wheelDelta
          ? t.wheelDelta / 40
          : t.deltaY
          ? -t.deltaY / 3
          : 0;
        this.changeDeltaScale(1 + 0.05 * t.delta);
      }
      (this || _global).last_mouse[0] = o;
      (this || _global).last_mouse[1] = r;
      if (l) {
        t.preventDefault();
        t.stopPropagation();
        return false;
      }
    }
  };
  DragAndScale.prototype.toCanvasContext = function (t) {
    t.scale((this || _global).scale, (this || _global).scale);
    t.translate((this || _global).offset[0], (this || _global).offset[1]);
  };
  DragAndScale.prototype.convertOffsetToCanvas = function (t) {
    return [
      (t[0] + (this || _global).offset[0]) * (this || _global).scale,
      (t[1] + (this || _global).offset[1]) * (this || _global).scale,
    ];
  };
  DragAndScale.prototype.convertCanvasToOffset = function (t, e) {
    e = e || [0, 0];
    e[0] = t[0] / (this || _global).scale - (this || _global).offset[0];
    e[1] = t[1] / (this || _global).scale - (this || _global).offset[1];
    return e;
  };
  DragAndScale.prototype.mouseDrag = function (t, e) {
    (this || _global).offset[0] += t / (this || _global).scale;
    (this || _global).offset[1] += e / (this || _global).scale;
    (this || _global).onredraw && this.onredraw(this || _global);
  };
  DragAndScale.prototype.changeScale = function (t, e) {
    t < (this || _global).min_scale
      ? (t = (this || _global).min_scale)
      : t > (this || _global).max_scale && (t = (this || _global).max_scale);
    if (t != (this || _global).scale && (this || _global).element) {
      var a = (this || _global).element.getBoundingClientRect();
      if (a) {
        e = e || [0.5 * a.width, 0.5 * a.height];
        var o = this.convertCanvasToOffset(e);
        (this || _global).scale = t;
        Math.abs((this || _global).scale - 1) < 0.01 &&
          ((this || _global).scale = 1);
        var r = this.convertCanvasToOffset(e);
        var l = [r[0] - o[0], r[1] - o[1]];
        (this || _global).offset[0] += l[0];
        (this || _global).offset[1] += l[1];
        (this || _global).onredraw && this.onredraw(this || _global);
      }
    }
  };
  DragAndScale.prototype.changeDeltaScale = function (t, e) {
    this.changeScale((this || _global).scale * t, e);
  };
  DragAndScale.prototype.reset = function () {
    (this || _global).scale = 1;
    (this || _global).offset[0] = 0;
    (this || _global).offset[1] = 0;
  };
  /**
   * This class is in charge of rendering one graph inside a canvas. And provides all the interaction required.
   * Valid callbacks are: onNodeSelected, onNodeDeselected, onShowNodePanel, onNodeDblClicked
   *
   * @class LGraphCanvas
   * @constructor
   * @param {HTMLCanvas} canvas the canvas where you want to render (it accepts a selector in string format or the canvas element itself)
   * @param {LGraph} graph [optional]
   * @param {Object} options [optional] { skip_rendering, autoresize, viewport }
   */ function LGraphCanvas(t, e, a) {
    (this || _global).options = a = a || {};
    (this || _global).background_image = LGraphCanvas.DEFAULT_BACKGROUND_IMAGE;
    t && t.constructor === String && (t = document.querySelector(t));
    (this || _global).ds = new DragAndScale();
    (this || _global).zoom_modify_alpha = true;
    (this || _global).title_text_font = LiteGraph.NODE_TEXT_SIZE + "px Arial";
    (this || _global).inner_text_font =
      "normal " + LiteGraph.NODE_SUBTEXT_SIZE + "px Arial";
    (this || _global).node_title_color = LiteGraph.NODE_TITLE_COLOR;
    (this || _global).default_link_color = LiteGraph.LINK_COLOR;
    (this || _global).default_connection_color = {
      input_off: "#778",
      input_on: "#7F7",
      output_off: "#778",
      output_on: "#7F7",
    };
    (this || _global).default_connection_color_byType = {};
    (this || _global).default_connection_color_byTypeOff = {};
    (this || _global).highquality_render = true;
    (this || _global).use_gradients = false;
    (this || _global).editor_alpha = 1;
    (this || _global).pause_rendering = false;
    (this || _global).clear_background = true;
    (this || _global).clear_background_color = "#222";
    (this || _global).read_only = false;
    (this || _global).render_only_selected = true;
    (this || _global).live_mode = false;
    (this || _global).show_info = true;
    (this || _global).allow_dragcanvas = true;
    (this || _global).allow_dragnodes = true;
    (this || _global).allow_interaction = true;
    (this || _global).multi_select = false;
    (this || _global).allow_searchbox = true;
    (this || _global).allow_reconnect_links = true;
    (this || _global).align_to_grid = false;
    (this || _global).drag_mode = false;
    (this || _global).dragging_rectangle = null;
    (this || _global).filter = null;
    (this || _global).set_canvas_dirty_on_mouse_event = true;
    (this || _global).always_render_background = false;
    (this || _global).render_shadows = true;
    (this || _global).render_canvas_border = true;
    (this || _global).render_connections_shadows = false;
    (this || _global).render_connections_border = true;
    (this || _global).render_curved_connections = false;
    (this || _global).render_connection_arrows = false;
    (this || _global).render_collapsed_slots = true;
    (this || _global).render_execution_order = false;
    (this || _global).render_title_colored = true;
    (this || _global).render_link_tooltip = true;
    (this || _global).links_render_mode = LiteGraph.SPLINE_LINK;
    (this || _global).mouse = [0, 0];
    (this || _global).graph_mouse = [0, 0];
    (this || _global).canvas_mouse = (this || _global).graph_mouse;
    (this || _global).onSearchBox = null;
    (this || _global).onSearchBoxSelection = null;
    (this || _global).onMouse = null;
    (this || _global).onDrawBackground = null;
    (this || _global).onDrawForeground = null;
    (this || _global).onDrawOverlay = null;
    (this || _global).onDrawLinkTooltip = null;
    (this || _global).onNodeMoved = null;
    (this || _global).onSelectionChange = null;
    (this || _global).onConnectingChange = null;
    (this || _global).onBeforeChange = null;
    (this || _global).onAfterChange = null;
    (this || _global).connections_width = 3;
    (this || _global).round_radius = 8;
    (this || _global).current_node = null;
    (this || _global).node_widget = null;
    (this || _global).over_link_center = null;
    (this || _global).last_mouse_position = [0, 0];
    (this || _global).visible_area = (this || _global).ds.visible_area;
    (this || _global).visible_links = [];
    (this || _global).viewport = a.viewport || null;
    e && e.attachCanvas(this || _global);
    this.setCanvas(t, a.skip_events);
    this.clear();
    a.skip_render || this.startRendering();
    (this || _global).autoresize = a.autoresize;
  }
  global.LGraphCanvas = LiteGraph.LGraphCanvas = LGraphCanvas;
  LGraphCanvas.DEFAULT_BACKGROUND_IMAGE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII=";
  LGraphCanvas.link_type_colors = {
    "-1": LiteGraph.EVENT_LINK_COLOR,
    number: "#AAA",
    node: "#DCA",
  };
  LGraphCanvas.gradients = {};
  LGraphCanvas.prototype.clear = function () {
    (this || _global).frame = 0;
    (this || _global).last_draw_time = 0;
    (this || _global).render_time = 0;
    (this || _global).fps = 0;
    (this || _global).dragging_rectangle = null;
    (this || _global).selected_nodes = {};
    (this || _global).selected_group = null;
    (this || _global).visible_nodes = [];
    (this || _global).node_dragged = null;
    (this || _global).node_over = null;
    (this || _global).node_capturing_input = null;
    (this || _global).connecting_node = null;
    (this || _global).highlighted_links = {};
    (this || _global).dragging_canvas = false;
    (this || _global).dirty_canvas = true;
    (this || _global).dirty_bgcanvas = true;
    (this || _global).dirty_area = null;
    (this || _global).node_in_panel = null;
    (this || _global).node_widget = null;
    (this || _global).last_mouse = [0, 0];
    (this || _global).last_mouseclick = 0;
    (this || _global).pointer_is_down = false;
    (this || _global).pointer_is_double = false;
    (this || _global).visible_area.set([0, 0, 0, 0]);
    (this || _global).onClear && this.onClear();
  };
  /**
   * assigns a graph, you can reassign graphs to the same canvas
   *
   * @method setGraph
   * @param {LGraph} graph
   */ LGraphCanvas.prototype.setGraph = function (t, e) {
    if ((this || _global).graph != t) {
      e || this.clear();
      if (t || !(this || _global).graph) {
        t.attachCanvas(this || _global);
        (this || _global)._graph_stack &&
          ((this || _global)._graph_stack = null);
        this.setDirty(true, true);
      } else (this || _global).graph.detachCanvas(this || _global);
    }
  };
  LGraphCanvas.prototype.getTopGraph = function () {
    return (this || _global)._graph_stack.length
      ? (this || _global)._graph_stack[0]
      : (this || _global).graph;
  };
  /**
   * opens a graph contained inside a node in the current graph
   *
   * @method openSubgraph
   * @param {LGraph} graph
   */ LGraphCanvas.prototype.openSubgraph = function (t) {
    if (!t) throw "graph cannot be null";
    if ((this || _global).graph == t) throw "graph cannot be the same";
    this.clear();
    if ((this || _global).graph) {
      (this || _global)._graph_stack || ((this || _global)._graph_stack = []);
      (this || _global)._graph_stack.push((this || _global).graph);
    }
    t.attachCanvas(this || _global);
    this.checkPanels();
    this.setDirty(true, true);
  };
  /**
   * closes a subgraph contained inside a node
   *
   * @method closeSubgraph
   * @param {LGraph} assigns a graph
   */ LGraphCanvas.prototype.closeSubgraph = function () {
    if (
      (this || _global)._graph_stack &&
      0 != (this || _global)._graph_stack.length
    ) {
      var t = (this || _global).graph._subgraph_node;
      var e = (this || _global)._graph_stack.pop();
      (this || _global).selected_nodes = {};
      (this || _global).highlighted_links = {};
      e.attachCanvas(this || _global);
      this.setDirty(true, true);
      if (t) {
        this.centerOnNode(t);
        this.selectNodes([t]);
      }
      (this || _global).ds.offset = [0, 0];
      (this || _global).ds.scale = 1;
    }
  };
  LGraphCanvas.prototype.getCurrentGraph = function () {
    return (this || _global).graph;
  };
  /**
   * assigns a canvas
   *
   * @method setCanvas
   * @param {Canvas} assigns a canvas (also accepts the ID of the element (not a selector)
   */ LGraphCanvas.prototype.setCanvas = function (t, e) {
    if (t && t.constructor === String) {
      t = document.getElementById(t);
      if (!t) throw "Error creating LiteGraph canvas: Canvas not found";
    }
    if (t !== (this || _global).canvas) {
      !t && (this || _global).canvas && (e || this.unbindEvents());
      (this || _global).canvas = t;
      (this || _global).ds.element = t;
      if (t) {
        t.className += " lgraphcanvas";
        t.data = this || _global;
        t.tabindex = "1";
        (this || _global).bgcanvas = null;
        if (!(this || _global).bgcanvas) {
          (this || _global).bgcanvas = document.createElement("canvas");
          (this || _global).bgcanvas.width = (this || _global).canvas.width;
          (this || _global).bgcanvas.height = (this || _global).canvas.height;
        }
        if (null == t.getContext) {
          if ("canvas" != t.localName)
            throw (
              "Element supplied for LGraphCanvas must be a <canvas> element, you passed a " +
              t.localName
            );
          throw "This browser doesn't support Canvas";
        }
        var a = ((this || _global).ctx = t.getContext("2d"));
        if (null == a) {
          t.webgl_enabled ||
            console.warn(
              "This canvas seems to be WebGL, enabling WebGL renderer"
            );
          this.enableWebGL();
        }
        e || this.bindEvents();
      }
    }
  };
  LGraphCanvas.prototype._doNothing = function doNothing(t) {
    t.preventDefault();
    return false;
  };
  LGraphCanvas.prototype._doReturnTrue = function doNothing(t) {
    t.preventDefault();
    return true;
  };
  LGraphCanvas.prototype.bindEvents = function () {
    if ((this || _global)._events_binded)
      console.warn("LGraphCanvas: events already binded");
    else {
      var t = (this || _global).canvas;
      var e = this.getCanvasWindow();
      var a = e.document;
      (this || _global)._mousedown_callback = (
        this || _global
      ).processMouseDown.bind(this || _global);
      (this || _global)._mousewheel_callback = (
        this || _global
      ).processMouseWheel.bind(this || _global);
      (this || _global)._mousemove_callback = (
        this || _global
      ).processMouseMove.bind(this || _global);
      (this || _global)._mouseup_callback = (
        this || _global
      ).processMouseUp.bind(this || _global);
      LiteGraph.pointerListenerAdd(
        t,
        "down",
        (this || _global)._mousedown_callback,
        true
      );
      t.addEventListener(
        "mousewheel",
        (this || _global)._mousewheel_callback,
        false
      );
      LiteGraph.pointerListenerAdd(
        t,
        "up",
        (this || _global)._mouseup_callback,
        true
      );
      LiteGraph.pointerListenerAdd(
        t,
        "move",
        (this || _global)._mousemove_callback
      );
      t.addEventListener("contextmenu", (this || _global)._doNothing);
      t.addEventListener(
        "DOMMouseScroll",
        (this || _global)._mousewheel_callback,
        false
      );
      (this || _global)._key_callback = (this || _global).processKey.bind(
        this || _global
      );
      t.addEventListener("keydown", (this || _global)._key_callback, true);
      a.addEventListener("keyup", (this || _global)._key_callback, true);
      (this || _global)._ondrop_callback = (this || _global).processDrop.bind(
        this || _global
      );
      t.addEventListener("dragover", (this || _global)._doNothing, false);
      t.addEventListener("dragend", (this || _global)._doNothing, false);
      t.addEventListener("drop", (this || _global)._ondrop_callback, false);
      t.addEventListener("dragenter", (this || _global)._doReturnTrue, false);
      (this || _global)._events_binded = true;
    }
  };
  LGraphCanvas.prototype.unbindEvents = function () {
    if ((this || _global)._events_binded) {
      var t = this.getCanvasWindow();
      var e = t.document;
      LiteGraph.pointerListenerRemove(
        (this || _global).canvas,
        "move",
        (this || _global)._mousedown_callback
      );
      LiteGraph.pointerListenerRemove(
        (this || _global).canvas,
        "up",
        (this || _global)._mousedown_callback
      );
      LiteGraph.pointerListenerRemove(
        (this || _global).canvas,
        "down",
        (this || _global)._mousedown_callback
      );
      (this || _global).canvas.removeEventListener(
        "mousewheel",
        (this || _global)._mousewheel_callback
      );
      (this || _global).canvas.removeEventListener(
        "DOMMouseScroll",
        (this || _global)._mousewheel_callback
      );
      (this || _global).canvas.removeEventListener(
        "keydown",
        (this || _global)._key_callback
      );
      e.removeEventListener("keyup", (this || _global)._key_callback);
      (this || _global).canvas.removeEventListener(
        "contextmenu",
        (this || _global)._doNothing
      );
      (this || _global).canvas.removeEventListener(
        "drop",
        (this || _global)._ondrop_callback
      );
      (this || _global).canvas.removeEventListener(
        "dragenter",
        (this || _global)._doReturnTrue
      );
      (this || _global)._mousedown_callback = null;
      (this || _global)._mousewheel_callback = null;
      (this || _global)._key_callback = null;
      (this || _global)._ondrop_callback = null;
      (this || _global)._events_binded = false;
    } else console.warn("LGraphCanvas: no events binded");
  };
  LGraphCanvas.getFileExtension = function (t) {
    var e = t.indexOf("?");
    -1 != e && (t = t.substr(0, e));
    var a = t.lastIndexOf(".");
    return -1 == a ? "" : t.substr(a + 1).toLowerCase();
  };
  LGraphCanvas.prototype.enableWebGL = function () {
    if (void 0 === typeof GL)
      throw "litegl.js must be included to use a WebGL canvas";
    if (void 0 === typeof enableWebGLCanvas)
      throw "webglCanvas.js must be included to use this feature";
    (this || _global).gl = (this || _global).ctx = enableWebGLCanvas(
      (this || _global).canvas
    );
    (this || _global).ctx.webgl = true;
    (this || _global).bgcanvas = (this || _global).canvas;
    (this || _global).bgctx = (this || _global).gl;
    (this || _global).canvas.webgl_enabled = true;
  };
  /**
   * marks as dirty the canvas, this way it will be rendered again
   *
   * @class LGraphCanvas
   * @method setDirty
   * @param {bool} fgcanvas if the foreground canvas is dirty (the one containing the nodes)
   * @param {bool} bgcanvas if the background canvas is dirty (the one containing the wires)
   */ LGraphCanvas.prototype.setDirty = function (t, e) {
    t && ((this || _global).dirty_canvas = true);
    e && ((this || _global).dirty_bgcanvas = true);
  };
  LGraphCanvas.prototype.getCanvasWindow = function () {
    if (!(this || _global).canvas) return window;
    var t = (this || _global).canvas.ownerDocument;
    return t.defaultView || t.parentWindow;
  };
  LGraphCanvas.prototype.startRendering = function () {
    if (!(this || _global).is_rendering) {
      (this || _global).is_rendering = true;
      renderFrame.call(this || _global);
    }
    function renderFrame() {
      (this || _global).pause_rendering || this.draw();
      var t = this.getCanvasWindow();
      (this || _global).is_rendering &&
        t.requestAnimationFrame(renderFrame.bind(this || _global));
    }
  };
  LGraphCanvas.prototype.stopRendering = function () {
    (this || _global).is_rendering = false;
  };
  LGraphCanvas.prototype.blockClick = function () {
    (this || _global).block_click = true;
    (this || _global).last_mouseclick = 0;
  };
  LGraphCanvas.prototype.processMouseDown = function (t) {
    (this || _global).set_canvas_dirty_on_mouse_event &&
      ((this || _global).dirty_canvas = true);
    if ((this || _global).graph) {
      this.adjustMouseEvent(t);
      var e = this.getCanvasWindow();
      e.document;
      LGraphCanvas.active_canvas = this || _global;
      var a = this || _global;
      var o = t.clientX;
      var r = t.clientY;
      (this || _global).ds.viewport = (this || _global).viewport;
      var l =
        !(this || _global).viewport ||
        ((this || _global).viewport &&
          o >= (this || _global).viewport[0] &&
          o < (this || _global).viewport[0] + (this || _global).viewport[2] &&
          r >= (this || _global).viewport[1] &&
          r < (this || _global).viewport[1] + (this || _global).viewport[3]);
      if (!(this || _global).options.skip_events) {
        LiteGraph.pointerListenerRemove(
          (this || _global).canvas,
          "move",
          (this || _global)._mousemove_callback
        );
        LiteGraph.pointerListenerAdd(
          e.document,
          "move",
          (this || _global)._mousemove_callback,
          true
        );
        LiteGraph.pointerListenerAdd(
          e.document,
          "up",
          (this || _global)._mouseup_callback,
          true
        );
      }
      if (l) {
        var n = (this || _global).graph.getNodeOnPos(
          t.canvasX,
          t.canvasY,
          (this || _global).visible_nodes,
          5
        );
        var s = false;
        var u = LiteGraph.getTime();
        var h = void 0 === t.isPrimary || !t.isPrimary;
        var p = u - (this || _global).last_mouseclick < 300 && h;
        (this || _global).mouse[0] = t.clientX;
        (this || _global).mouse[1] = t.clientY;
        (this || _global).graph_mouse[0] = t.canvasX;
        (this || _global).graph_mouse[1] = t.canvasY;
        (this || _global).last_click_position = [
          (this || _global).mouse[0],
          (this || _global).mouse[1],
        ];
        (this || _global).pointer_is_down && h
          ? ((this || _global).pointer_is_double = true)
          : ((this || _global).pointer_is_double = false);
        (this || _global).pointer_is_down = true;
        (this || _global).canvas.focus();
        LiteGraph.closeAllContextMenus(e);
        if (!(this || _global).onMouse || true != this.onMouse(t)) {
          if (1 != t.which || (this || _global).pointer_is_double) {
            if (2 == t.which) {
              if (
                LiteGraph.middle_click_slot_add_default_node &&
                n &&
                (this || _global).allow_interaction &&
                !s &&
                !(this || _global).read_only &&
                !(this || _global).connecting_node &&
                !n.flags.collapsed &&
                !(this || _global).live_mode
              ) {
                var _ = false;
                var g = false;
                var d = false;
                if (n.outputs)
                  for (L = 0, G = n.outputs.length; L < G; ++L) {
                    T = n.outputs[L];
                    I = n.getConnectionPos(false, L);
                    if (
                      isInsideRectangle(
                        t.canvasX,
                        t.canvasY,
                        I[0] - 15,
                        I[1] - 10,
                        30,
                        20
                      )
                    ) {
                      _ = T;
                      g = L;
                      d = true;
                      break;
                    }
                  }
                if (n.inputs)
                  for (L = 0, G = n.inputs.length; L < G; ++L) {
                    E = n.inputs[L];
                    I = n.getConnectionPos(true, L);
                    if (
                      isInsideRectangle(
                        t.canvasX,
                        t.canvasY,
                        I[0] - 15,
                        I[1] - 10,
                        30,
                        20
                      )
                    ) {
                      _ = E;
                      g = L;
                      d = false;
                      break;
                    }
                  }
                if (_ && false !== g) {
                  var c =
                    0.5 - (g + 1) / (d ? n.outputs.length : n.inputs.length);
                  var b = n.getBounding();
                  var f = [d ? b[0] + b[2] : b[0], t.canvasY - 80];
                  this.createDefaultNodeForSlot({
                    nodeFrom: d ? n : null,
                    slotFrom: d ? g : null,
                    nodeTo: d ? null : n,
                    slotTo: d ? null : g,
                    position: f,
                    nodeType: "AUTO",
                    posAdd: [d ? 30 : -30, 130 * -c],
                    posSizeFix: [d ? 0 : -1, 0],
                  });
                }
              }
            } else if (
              (3 == t.which || (this || _global).pointer_is_double) &&
              (this || _global).allow_interaction &&
              !s &&
              !(this || _global).read_only
            ) {
              n &&
                (Object.keys((this || _global).selected_nodes).length &&
                ((this || _global).selected_nodes[n.id] ||
                  t.shiftKey ||
                  t.ctrlKey ||
                  t.metaKey)
                  ? (this || _global).selected_nodes[n.id] ||
                    this.selectNodes([n], true)
                  : this.selectNodes([n]));
              this.processContextMenu(n, t);
            }
          } else {
            if (t.ctrlKey) {
              (this || _global).dragging_rectangle = new Float32Array(4);
              (this || _global).dragging_rectangle[0] = t.canvasX;
              (this || _global).dragging_rectangle[1] = t.canvasY;
              (this || _global).dragging_rectangle[2] = 1;
              (this || _global).dragging_rectangle[3] = 1;
              s = true;
            }
            if (
              LiteGraph.alt_drag_do_clone_nodes &&
              t.altKey &&
              n &&
              (this || _global).allow_interaction &&
              !s &&
              !(this || _global).read_only &&
              (_global.cloned = n.clone())
            ) {
              cloned.pos[0] += 5;
              cloned.pos[1] += 5;
              (this || _global).graph.add(cloned, false, { doCalcSize: false });
              n = cloned;
              s = true;
              if (!S) {
                if ((this || _global).allow_dragnodes) {
                  (this || _global).graph.beforeChange();
                  (this || _global).node_dragged = n;
                }
                (this || _global).selected_nodes[n.id] ||
                  this.processNodeSelected(n, t);
              }
            }
            var m = false;
            if (
              n &&
              (this || _global).allow_interaction &&
              !s &&
              !(this || _global).read_only
            ) {
              (this || _global).live_mode ||
                n.flags.pinned ||
                this.bringToFront(n);
              if (
                !(this || _global).connecting_node &&
                !n.flags.collapsed &&
                !(this || _global).live_mode
              )
                if (
                  !s &&
                  false !== n.resizable &&
                  isInsideRectangle(
                    t.canvasX,
                    t.canvasY,
                    n.pos[0] + n.size[0] - 5,
                    n.pos[1] + n.size[1] - 5,
                    10,
                    10
                  )
                ) {
                  (this || _global).graph.beforeChange();
                  (this || _global).resizing_node = n;
                  (this || _global).canvas.style.cursor = "se-resize";
                  s = true;
                } else {
                  if (n.outputs)
                    for (var L = 0, G = n.outputs.length; L < G; ++L) {
                      var T = n.outputs[L];
                      var I = n.getConnectionPos(false, L);
                      if (
                        isInsideRectangle(
                          t.canvasX,
                          t.canvasY,
                          I[0] - 15,
                          I[1] - 10,
                          30,
                          20
                        )
                      ) {
                        (this || _global).connecting_node = n;
                        (this || _global).connecting_output = T;
                        (this || _global).connecting_output.slot_index = L;
                        (this || _global).connecting_pos = n.getConnectionPos(
                          false,
                          L
                        );
                        (this || _global).connecting_slot = L;
                        LiteGraph.shift_click_do_break_link_from &&
                          t.shiftKey &&
                          n.disconnectOutput(L);
                        p
                          ? n.onOutputDblClick && n.onOutputDblClick(L, t)
                          : n.onOutputClick && n.onOutputClick(L, t);
                        s = true;
                        break;
                      }
                    }
                  if (n.inputs)
                    for (var L = 0, G = n.inputs.length; L < G; ++L) {
                      var E = n.inputs[L];
                      var I = n.getConnectionPos(true, L);
                      if (
                        isInsideRectangle(
                          t.canvasX,
                          t.canvasY,
                          I[0] - 15,
                          I[1] - 10,
                          30,
                          20
                        )
                      ) {
                        p
                          ? n.onInputDblClick && n.onInputDblClick(L, t)
                          : n.onInputClick && n.onInputClick(L, t);
                        if (null !== E.link) {
                          var D = (this || _global).graph.links[E.link];
                          if (LiteGraph.click_do_break_link_to) {
                            n.disconnectInput(L);
                            (this || _global).dirty_bgcanvas = true;
                            s = true;
                          }
                          if (
                            (this || _global).allow_reconnect_links ||
                            t.shiftKey
                          ) {
                            LiteGraph.click_do_break_link_to ||
                              n.disconnectInput(L);
                            (this || _global).connecting_node = (
                              this || _global
                            ).graph._nodes_by_id[D.origin_id];
                            (this || _global).connecting_slot = D.origin_slot;
                            (this || _global).connecting_output = (
                              this || _global
                            ).connecting_node.outputs[
                              (this || _global).connecting_slot
                            ];
                            (this || _global).connecting_pos = (
                              this || _global
                            ).connecting_node.getConnectionPos(
                              false,
                              (this || _global).connecting_slot
                            );
                            (this || _global).dirty_bgcanvas = true;
                            s = true;
                          }
                        }
                        if (!s) {
                          (this || _global).connecting_node = n;
                          (this || _global).connecting_input = E;
                          (this || _global).connecting_input.slot_index = L;
                          (this || _global).connecting_pos = n.getConnectionPos(
                            true,
                            L
                          );
                          (this || _global).connecting_slot = L;
                          (this || _global).dirty_bgcanvas = true;
                          s = true;
                        }
                      }
                    }
                }
              if (!s) {
                var S = false;
                var C = [t.canvasX - n.pos[0], t.canvasY - n.pos[1]];
                var O = this.processNodeWidgets(
                  n,
                  (this || _global).graph_mouse,
                  t
                );
                if (O) {
                  S = true;
                  (this || _global).node_widget = [n, O];
                }
                if (p && (this || _global).selected_nodes[n.id]) {
                  n.onDblClick && n.onDblClick(t, C, this || _global);
                  this.processNodeDblClicked(n);
                  S = true;
                }
                if (n.onMouseDown && n.onMouseDown(t, C, this || _global))
                  S = true;
                else {
                  if (
                    n.subgraph &&
                    !n.skip_subgraph_button &&
                    !n.flags.collapsed &&
                    C[0] > n.size[0] - LiteGraph.NODE_TITLE_HEIGHT &&
                    C[1] < 0
                  ) {
                    a = this || _global;
                    setTimeout(function () {
                      a.openSubgraph(n.subgraph);
                    }, 10);
                  }
                  if ((this || _global).live_mode) {
                    m = true;
                    S = true;
                  }
                }
                if (S) n.is_selected || this.processNodeSelected(n, t);
                else {
                  if ((this || _global).allow_dragnodes) {
                    (this || _global).graph.beforeChange();
                    (this || _global).node_dragged = n;
                  }
                  this.processNodeSelected(n, t);
                }
                (this || _global).dirty_canvas = true;
              }
            } else if (!s) {
              if (!(this || _global).read_only)
                for (
                  var L = 0;
                  L < (this || _global).visible_links.length;
                  ++L
                ) {
                  var N = (this || _global).visible_links[L];
                  var A = N._pos;
                  if (
                    !(
                      !A ||
                      t.canvasX < A[0] - 4 ||
                      t.canvasX > A[0] + 4 ||
                      t.canvasY < A[1] - 4 ||
                      t.canvasY > A[1] + 4
                    )
                  ) {
                    this.showLinkMenu(N, t);
                    (this || _global).over_link_center = null;
                    break;
                  }
                }
              (this || _global).selected_group = (
                this || _global
              ).graph.getGroupOnPos(t.canvasX, t.canvasY);
              (this || _global).selected_group_resizing = false;
              if (
                (this || _global).selected_group &&
                !(this || _global).read_only
              ) {
                t.ctrlKey && ((this || _global).dragging_rectangle = null);
                var M = distance(
                  [t.canvasX, t.canvasY],
                  [
                    (this || _global).selected_group.pos[0] +
                      (this || _global).selected_group.size[0],
                    (this || _global).selected_group.pos[1] +
                      (this || _global).selected_group.size[1],
                  ]
                );
                M * (this || _global).ds.scale < 10
                  ? ((this || _global).selected_group_resizing = true)
                  : (this || _global).selected_group.recomputeInsideNodes();
              }
              if (
                p &&
                !(this || _global).read_only &&
                (this || _global).allow_searchbox
              ) {
                this.showSearchBox(t);
                t.preventDefault();
                t.stopPropagation();
              }
              m = true;
            }
            !s &&
              m &&
              (this || _global).allow_dragcanvas &&
              ((this || _global).dragging_canvas = true);
          }
          (this || _global).last_mouse[0] = t.clientX;
          (this || _global).last_mouse[1] = t.clientY;
          (this || _global).last_mouseclick = LiteGraph.getTime();
          (this || _global).last_mouse_dragging = true;
          (this || _global).graph.change();
          (!e.document.activeElement ||
            ("input" != e.document.activeElement.nodeName.toLowerCase() &&
              "textarea" != e.document.activeElement.nodeName.toLowerCase())) &&
            t.preventDefault();
          t.stopPropagation();
          (this || _global).onMouseDown && this.onMouseDown(t);
          return false;
        }
      }
    }
  };
  LGraphCanvas.prototype.processMouseMove = function (t) {
    (this || _global).autoresize && this.resize();
    (this || _global).set_canvas_dirty_on_mouse_event &&
      ((this || _global).dirty_canvas = true);
    if ((this || _global).graph) {
      LGraphCanvas.active_canvas = this || _global;
      this.adjustMouseEvent(t);
      var e = [t.clientX, t.clientY];
      (this || _global).mouse[0] = e[0];
      (this || _global).mouse[1] = e[1];
      var a = [
        e[0] - (this || _global).last_mouse[0],
        e[1] - (this || _global).last_mouse[1],
      ];
      (this || _global).last_mouse = e;
      (this || _global).graph_mouse[0] = t.canvasX;
      (this || _global).graph_mouse[1] = t.canvasY;
      if ((this || _global).block_click) {
        t.preventDefault();
        return false;
      }
      t.dragging = (this || _global).last_mouse_dragging;
      if ((this || _global).node_widget) {
        this.processNodeWidgets(
          (this || _global).node_widget[0],
          (this || _global).graph_mouse,
          t,
          (this || _global).node_widget[1]
        );
        (this || _global).dirty_canvas = true;
      }
      if ((this || _global).dragging_rectangle) {
        (this || _global).dragging_rectangle[2] =
          t.canvasX - (this || _global).dragging_rectangle[0];
        (this || _global).dragging_rectangle[3] =
          t.canvasY - (this || _global).dragging_rectangle[1];
        (this || _global).dirty_canvas = true;
      } else if (
        (this || _global).selected_group &&
        !(this || _global).read_only
      ) {
        if ((this || _global).selected_group_resizing)
          (this || _global).selected_group.size = [
            t.canvasX - (this || _global).selected_group.pos[0],
            t.canvasY - (this || _global).selected_group.pos[1],
          ];
        else {
          var o = a[0] / (this || _global).ds.scale;
          var r = a[1] / (this || _global).ds.scale;
          (this || _global).selected_group.move(o, r, t.ctrlKey);
          (this || _global).selected_group._nodes.length &&
            ((this || _global).dirty_canvas = true);
        }
        (this || _global).dirty_bgcanvas = true;
      } else if ((this || _global).dragging_canvas) {
        (this || _global).ds.offset[0] += a[0] / (this || _global).ds.scale;
        (this || _global).ds.offset[1] += a[1] / (this || _global).ds.scale;
        (this || _global).dirty_canvas = true;
        (this || _global).dirty_bgcanvas = true;
      } else if (
        (this || _global).allow_interaction &&
        !(this || _global).read_only
      ) {
        (this || _global).connecting_node &&
          ((this || _global).dirty_canvas = true);
        var l = (this || _global).graph.getNodeOnPos(
          t.canvasX,
          t.canvasY,
          (this || _global).visible_nodes
        );
        for (var n = 0, s = (this || _global).graph._nodes.length; n < s; ++n)
          if (
            (this || _global).graph._nodes[n].mouseOver &&
            l != (this || _global).graph._nodes[n]
          ) {
            (this || _global).graph._nodes[n].mouseOver = false;
            (this || _global).node_over &&
              (this || _global).node_over.onMouseLeave &&
              (this || _global).node_over.onMouseLeave(t);
            (this || _global).node_over = null;
            (this || _global).dirty_canvas = true;
          }
        if (l) {
          l.redraw_on_mouse && ((this || _global).dirty_canvas = true);
          if (!l.mouseOver) {
            l.mouseOver = true;
            (this || _global).node_over = l;
            (this || _global).dirty_canvas = true;
            l.onMouseEnter && l.onMouseEnter(t);
          }
          l.onMouseMove &&
            l.onMouseMove(
              t,
              [t.canvasX - l.pos[0], t.canvasY - l.pos[1]],
              this || _global
            );
          if ((this || _global).connecting_node)
            if ((this || _global).connecting_output) {
              var u = (this || _global)._highlight_input || [0, 0];
              if (this.isOverNodeBox(l, t.canvasX, t.canvasY));
              else {
                var h = this.isOverNodeInput(l, t.canvasX, t.canvasY, u);
                if (-1 != h && l.inputs[h]) {
                  var p = l.inputs[h].type;
                  if (
                    LiteGraph.isValidConnection(
                      (this || _global).connecting_output.type,
                      p
                    )
                  ) {
                    (this || _global)._highlight_input = u;
                    (this || _global)._highlight_input_slot = l.inputs[h];
                  }
                } else {
                  (this || _global)._highlight_input = null;
                  (this || _global)._highlight_input_slot = null;
                }
              }
            } else if ((this || _global).connecting_input) {
              u = (this || _global)._highlight_output || [0, 0];
              if (this.isOverNodeBox(l, t.canvasX, t.canvasY));
              else {
                h = this.isOverNodeOutput(l, t.canvasX, t.canvasY, u);
                if (-1 != h && l.outputs[h]) {
                  p = l.outputs[h].type;
                  LiteGraph.isValidConnection(
                    (this || _global).connecting_input.type,
                    p
                  ) && ((this || _global)._highlight_output = u);
                } else (this || _global)._highlight_output = null;
              }
            }
          (this || _global).canvas &&
            (isInsideRectangle(
              t.canvasX,
              t.canvasY,
              l.pos[0] + l.size[0] - 5,
              l.pos[1] + l.size[1] - 5,
              5,
              5
            )
              ? ((this || _global).canvas.style.cursor = "se-resize")
              : ((this || _global).canvas.style.cursor = "crosshair"));
        } else {
          var _ = null;
          for (n = 0; n < (this || _global).visible_links.length; ++n) {
            var g = (this || _global).visible_links[n];
            var d = g._pos;
            if (
              !(
                !d ||
                t.canvasX < d[0] - 4 ||
                t.canvasX > d[0] + 4 ||
                t.canvasY < d[1] - 4 ||
                t.canvasY > d[1] + 4
              )
            ) {
              _ = g;
              break;
            }
          }
          if (_ != (this || _global).over_link_center) {
            (this || _global).over_link_center = _;
            (this || _global).dirty_canvas = true;
          }
          (this || _global).canvas &&
            ((this || _global).canvas.style.cursor = "");
        }
        (this || _global).node_capturing_input &&
          (this || _global).node_capturing_input != l &&
          (this || _global).node_capturing_input.onMouseMove &&
          (this || _global).node_capturing_input.onMouseMove(
            t,
            [
              t.canvasX - (this || _global).node_capturing_input.pos[0],
              t.canvasY - (this || _global).node_capturing_input.pos[1],
            ],
            this || _global
          );
        if ((this || _global).node_dragged && !(this || _global).live_mode) {
          for (var n in (this || _global).selected_nodes) {
            var c = (this || _global).selected_nodes[n];
            c.pos[0] += a[0] / (this || _global).ds.scale;
            c.pos[1] += a[1] / (this || _global).ds.scale;
            c.is_selected || this.processNodeSelected(c, t);
          }
          (this || _global).dirty_canvas = true;
          (this || _global).dirty_bgcanvas = true;
        }
        if ((this || _global).resizing_node && !(this || _global).live_mode) {
          var b = [
            t.canvasX - (this || _global).resizing_node.pos[0],
            t.canvasY - (this || _global).resizing_node.pos[1],
          ];
          var f = (this || _global).resizing_node.computeSize();
          b[0] = Math.max(f[0], b[0]);
          b[1] = Math.max(f[1], b[1]);
          (this || _global).resizing_node.setSize(b);
          (this || _global).canvas.style.cursor = "se-resize";
          (this || _global).dirty_canvas = true;
          (this || _global).dirty_bgcanvas = true;
        }
      }
      t.preventDefault();
      return false;
    }
  };
  LGraphCanvas.prototype.processMouseUp = function (t) {
    var e = void 0 === t.isPrimary || t.isPrimary;
    if (!e) return false;
    (this || _global).set_canvas_dirty_on_mouse_event &&
      ((this || _global).dirty_canvas = true);
    if ((this || _global).graph) {
      var a = this.getCanvasWindow();
      var o = a.document;
      LGraphCanvas.active_canvas = this || _global;
      if (!(this || _global).options.skip_events) {
        LiteGraph.pointerListenerRemove(
          o,
          "move",
          (this || _global)._mousemove_callback,
          true
        );
        LiteGraph.pointerListenerAdd(
          (this || _global).canvas,
          "move",
          (this || _global)._mousemove_callback,
          true
        );
        LiteGraph.pointerListenerRemove(
          o,
          "up",
          (this || _global)._mouseup_callback,
          true
        );
      }
      this.adjustMouseEvent(t);
      var r = LiteGraph.getTime();
      t.click_time = r - (this || _global).last_mouseclick;
      (this || _global).last_mouse_dragging = false;
      (this || _global).last_click_position = null;
      (this || _global).block_click && ((this || _global).block_click = false);
      if (1 == t.which) {
        (this || _global).node_widget &&
          this.processNodeWidgets(
            (this || _global).node_widget[0],
            (this || _global).graph_mouse,
            t
          );
        (this || _global).node_widget = null;
        if ((this || _global).selected_group) {
          var l =
            (this || _global).selected_group.pos[0] -
            Math.round((this || _global).selected_group.pos[0]);
          var n =
            (this || _global).selected_group.pos[1] -
            Math.round((this || _global).selected_group.pos[1]);
          (this || _global).selected_group.move(l, n, t.ctrlKey);
          (this || _global).selected_group.pos[0] = Math.round(
            (this || _global).selected_group.pos[0]
          );
          (this || _global).selected_group.pos[1] = Math.round(
            (this || _global).selected_group.pos[1]
          );
          (this || _global).selected_group._nodes.length &&
            ((this || _global).dirty_canvas = true);
          (this || _global).selected_group = null;
        }
        (this || _global).selected_group_resizing = false;
        var s = (this || _global).graph.getNodeOnPos(
          t.canvasX,
          t.canvasY,
          (this || _global).visible_nodes
        );
        if ((this || _global).dragging_rectangle) {
          if ((this || _global).graph) {
            var u = (this || _global).graph._nodes;
            var h = new Float32Array(4);
            var p = Math.abs((this || _global).dragging_rectangle[2]);
            var _ = Math.abs((this || _global).dragging_rectangle[3]);
            var g =
              (this || _global).dragging_rectangle[2] < 0
                ? (this || _global).dragging_rectangle[0] - p
                : (this || _global).dragging_rectangle[0];
            var d =
              (this || _global).dragging_rectangle[3] < 0
                ? (this || _global).dragging_rectangle[1] - _
                : (this || _global).dragging_rectangle[1];
            (this || _global).dragging_rectangle[0] = g;
            (this || _global).dragging_rectangle[1] = d;
            (this || _global).dragging_rectangle[2] = p;
            (this || _global).dragging_rectangle[3] = _;
            if (!s || (p > 10 && _ > 10)) {
              var c = [];
              for (var b = 0; b < u.length; ++b) {
                var f = u[b];
                f.getBounding(h);
                overlapBounding((this || _global).dragging_rectangle, h) &&
                  c.push(f);
              }
              c.length && this.selectNodes(c, t.shiftKey);
            } else this.selectNodes([s], t.shiftKey || t.ctrlKey);
          }
          (this || _global).dragging_rectangle = null;
        } else if ((this || _global).connecting_node) {
          (this || _global).dirty_canvas = true;
          (this || _global).dirty_bgcanvas = true;
          var m =
            (this || _global).connecting_output ||
            (this || _global).connecting_input;
          var L = m.type;
          if (s) {
            if ((this || _global).connecting_output) {
              var G = this.isOverNodeInput(s, t.canvasX, t.canvasY);
              -1 != G
                ? (this || _global).connecting_node.connect(
                    (this || _global).connecting_slot,
                    s,
                    G
                  )
                : (this || _global).connecting_node.connectByType(
                    (this || _global).connecting_slot,
                    s,
                    L
                  );
            } else if ((this || _global).connecting_input) {
              G = this.isOverNodeOutput(s, t.canvasX, t.canvasY);
              -1 != G
                ? s.connect(
                    G,
                    (this || _global).connecting_node,
                    (this || _global).connecting_slot
                  )
                : (this || _global).connecting_node.connectByTypeOutput(
                    (this || _global).connecting_slot,
                    s,
                    L
                  );
            }
          } else
            LiteGraph.release_link_on_empty_shows_menu &&
              (t.shiftKey && (this || _global).allow_searchbox
                ? (this || _global).connecting_output
                  ? this.showSearchBox(t, {
                      node_from: (this || _global).connecting_node,
                      slot_from: (this || _global).connecting_output,
                      type_filter_in: (this || _global).connecting_output.type,
                    })
                  : (this || _global).connecting_input &&
                    this.showSearchBox(t, {
                      node_to: (this || _global).connecting_node,
                      slot_from: (this || _global).connecting_input,
                      type_filter_out: (this || _global).connecting_input.type,
                    })
                : (this || _global).connecting_output
                ? this.showConnectionMenu({
                    nodeFrom: (this || _global).connecting_node,
                    slotFrom: (this || _global).connecting_output,
                    e: t,
                  })
                : (this || _global).connecting_input &&
                  this.showConnectionMenu({
                    nodeTo: (this || _global).connecting_node,
                    slotTo: (this || _global).connecting_input,
                    e: t,
                  }));
          (this || _global).connecting_output = null;
          (this || _global).connecting_input = null;
          (this || _global).connecting_pos = null;
          (this || _global).connecting_node = null;
          (this || _global).connecting_slot = -1;
        } else if ((this || _global).resizing_node) {
          (this || _global).dirty_canvas = true;
          (this || _global).dirty_bgcanvas = true;
          (this || _global).graph.afterChange((this || _global).resizing_node);
          (this || _global).resizing_node = null;
        } else if ((this || _global).node_dragged) {
          s = (this || _global).node_dragged;
          s &&
            t.click_time < 300 &&
            isInsideRectangle(
              t.canvasX,
              t.canvasY,
              s.pos[0],
              s.pos[1] - LiteGraph.NODE_TITLE_HEIGHT,
              LiteGraph.NODE_TITLE_HEIGHT,
              LiteGraph.NODE_TITLE_HEIGHT
            ) &&
            s.collapse();
          (this || _global).dirty_canvas = true;
          (this || _global).dirty_bgcanvas = true;
          (this || _global).node_dragged.pos[0] = Math.round(
            (this || _global).node_dragged.pos[0]
          );
          (this || _global).node_dragged.pos[1] = Math.round(
            (this || _global).node_dragged.pos[1]
          );
          ((this || _global).graph.config.align_to_grid ||
            (this || _global).align_to_grid) &&
            (this || _global).node_dragged.alignToGrid();
          (this || _global).onNodeMoved &&
            this.onNodeMoved((this || _global).node_dragged);
          (this || _global).graph.afterChange((this || _global).node_dragged);
          (this || _global).node_dragged = null;
        } else {
          s = (this || _global).graph.getNodeOnPos(
            t.canvasX,
            t.canvasY,
            (this || _global).visible_nodes
          );
          !s && t.click_time < 300 && this.deselectAllNodes();
          (this || _global).dirty_canvas = true;
          (this || _global).dragging_canvas = false;
          (this || _global).node_over &&
            (this || _global).node_over.onMouseUp &&
            (this || _global).node_over.onMouseUp(
              t,
              [
                t.canvasX - (this || _global).node_over.pos[0],
                t.canvasY - (this || _global).node_over.pos[1],
              ],
              this || _global
            );
          (this || _global).node_capturing_input &&
            (this || _global).node_capturing_input.onMouseUp &&
            (this || _global).node_capturing_input.onMouseUp(t, [
              t.canvasX - (this || _global).node_capturing_input.pos[0],
              t.canvasY - (this || _global).node_capturing_input.pos[1],
            ]);
        }
      } else if (2 == t.which) {
        (this || _global).dirty_canvas = true;
        (this || _global).dragging_canvas = false;
      } else if (3 == t.which) {
        (this || _global).dirty_canvas = true;
        (this || _global).dragging_canvas = false;
      }
      if (e) {
        (this || _global).pointer_is_down = false;
        (this || _global).pointer_is_double = false;
      }
      (this || _global).graph.change();
      t.stopPropagation();
      t.preventDefault();
      return false;
    }
  };
  LGraphCanvas.prototype.processMouseWheel = function (t) {
    if ((this || _global).graph && (this || _global).allow_dragcanvas) {
      var e = null != t.wheelDeltaY ? t.wheelDeltaY : -60 * t.detail;
      this.adjustMouseEvent(t);
      var a = t.clientX;
      var o = t.clientY;
      var r =
        !(this || _global).viewport ||
        ((this || _global).viewport &&
          a >= (this || _global).viewport[0] &&
          a < (this || _global).viewport[0] + (this || _global).viewport[2] &&
          o >= (this || _global).viewport[1] &&
          o < (this || _global).viewport[1] + (this || _global).viewport[3]);
      if (r) {
        var l = (this || _global).ds.scale;
        e > 0 ? (l *= 1.1) : e < 0 && (l *= 1 / 1.1);
        (this || _global).ds.changeScale(l, [t.clientX, t.clientY]);
        (this || _global).graph.change();
        t.preventDefault();
        return false;
      }
    }
  };
  LGraphCanvas.prototype.isOverNodeBox = function (t, e, a) {
    var o = LiteGraph.NODE_TITLE_HEIGHT;
    return !!isInsideRectangle(
      e,
      a,
      t.pos[0] + 2,
      t.pos[1] + 2 - o,
      o - 4,
      o - 4
    );
  };
  LGraphCanvas.prototype.isOverNodeInput = function (t, e, a, o) {
    if (t.inputs)
      for (var r = 0, l = t.inputs.length; r < l; ++r) {
        t.inputs[r];
        var n = t.getConnectionPos(true, r);
        var s = false;
        s = t.horizontal
          ? isInsideRectangle(e, a, n[0] - 5, n[1] - 10, 10, 20)
          : isInsideRectangle(e, a, n[0] - 10, n[1] - 5, 40, 10);
        if (s) {
          if (o) {
            o[0] = n[0];
            o[1] = n[1];
          }
          return r;
        }
      }
    return -1;
  };
  LGraphCanvas.prototype.isOverNodeOutput = function (t, e, a, o) {
    if (t.outputs)
      for (var r = 0, l = t.outputs.length; r < l; ++r) {
        t.outputs[r];
        var n = t.getConnectionPos(false, r);
        var s = false;
        s = t.horizontal
          ? isInsideRectangle(e, a, n[0] - 5, n[1] - 10, 10, 20)
          : isInsideRectangle(e, a, n[0] - 10, n[1] - 5, 40, 10);
        if (s) {
          if (o) {
            o[0] = n[0];
            o[1] = n[1];
          }
          return r;
        }
      }
    return -1;
  };
  LGraphCanvas.prototype.processKey = function (t) {
    if ((this || _global).graph) {
      var e = false;
      if ("input" != t.target.localName) {
        if ("keydown" == t.type) {
          if (32 == t.keyCode) {
            (this || _global).dragging_canvas = true;
            e = true;
          }
          if (27 == t.keyCode) {
            (this || _global).node_panel &&
              (this || _global).node_panel.close();
            (this || _global).options_panel &&
              (this || _global).options_panel.close();
            e = true;
          }
          if (65 == t.keyCode && t.ctrlKey) {
            this.selectNodes();
            e = true;
          }
          if (
            "KeyC" == t.code &&
            (t.metaKey || t.ctrlKey) &&
            !t.shiftKey &&
            (this || _global).selected_nodes
          ) {
            this.copyToClipboard();
            e = true;
          }
          "KeyV" == t.code &&
            (t.metaKey || t.ctrlKey) &&
            this.pasteFromClipboard(t.shiftKey);
          if (
            (46 == t.keyCode || 8 == t.keyCode) &&
            "input" != t.target.localName &&
            "textarea" != t.target.localName
          ) {
            this.deleteSelectedNodes();
            e = true;
          }
          if ((this || _global).selected_nodes)
            for (var a in (this || _global).selected_nodes)
              (this || _global).selected_nodes[a].onKeyDown &&
                (this || _global).selected_nodes[a].onKeyDown(t);
        } else if ("keyup" == t.type) {
          32 == t.keyCode && ((this || _global).dragging_canvas = false);
          if ((this || _global).selected_nodes)
            for (var a in (this || _global).selected_nodes)
              (this || _global).selected_nodes[a].onKeyUp &&
                (this || _global).selected_nodes[a].onKeyUp(t);
        }
        (this || _global).graph.change();
        if (e) {
          t.preventDefault();
          t.stopImmediatePropagation();
          return false;
        }
      }
    }
  };
  LGraphCanvas.prototype.copyToClipboard = function () {
    var t = { nodes: [], links: [] };
    var e = 0;
    var a = [];
    for (var o in (this || _global).selected_nodes) {
      var r = (this || _global).selected_nodes[o];
      r._relative_id = e;
      a.push(r);
      e += 1;
    }
    for (o = 0; o < a.length; ++o) {
      r = a[o];
      var l = r.clone();
      if (l) {
        t.nodes.push(l.serialize());
        if (r.inputs && r.inputs.length)
          for (var n = 0; n < r.inputs.length; ++n) {
            var s = r.inputs[n];
            if (s && null != s.link) {
              var u = (this || _global).graph.links[s.link];
              if (u) {
                var h = (this || _global).graph.getNodeById(u.origin_id);
                h &&
                  t.links.push([
                    h._relative_id,
                    u.origin_slot,
                    r._relative_id,
                    u.target_slot,
                    h.id,
                  ]);
              }
            }
          }
      } else console.warn("node type not found: " + r.type);
    }
    localStorage.setItem("litegrapheditor_clipboard", JSON.stringify(t));
  };
  LGraphCanvas.prototype.pasteFromClipboard = function (t = false) {
    if (LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs || !t) {
      var e = localStorage.getItem("litegrapheditor_clipboard");
      if (e) {
        (this || _global).graph.beforeChange();
        var a = JSON.parse(e);
        var o = false;
        var r = false;
        for (var l = 0; l < a.nodes.length; ++l)
          if (o) {
            if (o[0] > a.nodes[l].pos[0]) {
              o[0] = a.nodes[l].pos[0];
              r[0] = l;
            }
            if (o[1] > a.nodes[l].pos[1]) {
              o[1] = a.nodes[l].pos[1];
              r[1] = l;
            }
          } else {
            o = [a.nodes[l].pos[0], a.nodes[l].pos[1]];
            r = [l, l];
          }
        var n = [];
        for (l = 0; l < a.nodes.length; ++l) {
          var s = a.nodes[l];
          var u = LiteGraph.createNode(s.type);
          if (u) {
            u.configure(s);
            u.pos[0] += (this || _global).graph_mouse[0] - o[0];
            u.pos[1] += (this || _global).graph_mouse[1] - o[1];
            (this || _global).graph.add(u, { doProcessChange: false });
            n.push(u);
          }
        }
        for (l = 0; l < a.links.length; ++l) {
          var h = a.links[l];
          var p;
          var _ = h[0];
          if (null != _) p = n[_];
          else if (
            LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs &&
            t
          ) {
            var g = h[4];
            g && (p = (this || _global).graph.getNodeById(g));
          }
          var d = n[h[2]];
          p && d
            ? p.connect(h[1], d, h[3])
            : console.warn("Warning, nodes missing on pasting");
        }
        this.selectNodes(n);
        (this || _global).graph.afterChange();
      }
    }
  };
  LGraphCanvas.prototype.processDrop = function (t) {
    t.preventDefault();
    this.adjustMouseEvent(t);
    var e = t.clientX;
    var a = t.clientY;
    var o =
      !(this || _global).viewport ||
      ((this || _global).viewport &&
        e >= (this || _global).viewport[0] &&
        e < (this || _global).viewport[0] + (this || _global).viewport[2] &&
        a >= (this || _global).viewport[1] &&
        a < (this || _global).viewport[1] + (this || _global).viewport[3]);
    if (o) {
      var r = [t.canvasX, t.canvasY];
      var l = (this || _global).graph
        ? (this || _global).graph.getNodeOnPos(r[0], r[1])
        : null;
      if (l) {
        if (l.onDropFile || l.onDropData) {
          var n = t.dataTransfer.files;
          if (n && n.length)
            for (var s = 0; s < n.length; s++) {
              var u = t.dataTransfer.files[0];
              var h = u.name;
              LGraphCanvas.getFileExtension(h);
              l.onDropFile && l.onDropFile(u);
              if (l.onDropData) {
                var p = new FileReader();
                p.onload = function (t) {
                  var e = t.target.result;
                  l.onDropData(e, h, u);
                };
                var _ = u.type.split("/")[0];
                "text" == _ || "" == _
                  ? p.readAsText(u)
                  : "image" == _
                  ? p.readAsDataURL(u)
                  : p.readAsArrayBuffer(u);
              }
            }
        }
        return (
          !(!l.onDropItem || !l.onDropItem(event)) ||
          (!!(this || _global).onDropItem && this.onDropItem(event))
        );
      }
      var g = null;
      (this || _global).onDropItem && (g = this.onDropItem(event));
      g || this.checkDropItem(t);
    }
  };
  LGraphCanvas.prototype.checkDropItem = function (t) {
    if (t.dataTransfer.files.length) {
      var e = t.dataTransfer.files[0];
      var a = LGraphCanvas.getFileExtension(e.name).toLowerCase();
      var o = LiteGraph.node_types_by_file_extension[a];
      if (o) {
        (this || _global).graph.beforeChange();
        var r = LiteGraph.createNode(o.type);
        r.pos = [t.canvasX, t.canvasY];
        (this || _global).graph.add(r);
        r.onDropFile && r.onDropFile(e);
        (this || _global).graph.afterChange();
      }
    }
  };
  LGraphCanvas.prototype.processNodeDblClicked = function (t) {
    (this || _global).onShowNodePanel
      ? this.onShowNodePanel(t)
      : this.showShowNodePanel(t);
    (this || _global).onNodeDblClicked && this.onNodeDblClicked(t);
    this.setDirty(true);
  };
  LGraphCanvas.prototype.processNodeSelected = function (t, e) {
    this.selectNode(
      t,
      e && (e.shiftKey || e.ctrlKey || (this || _global).multi_select)
    );
    (this || _global).onNodeSelected && this.onNodeSelected(t);
  };
  LGraphCanvas.prototype.selectNode = function (t, e) {
    null == t ? this.deselectAllNodes() : this.selectNodes([t], e);
  };
  LGraphCanvas.prototype.selectNodes = function (t, e) {
    e || this.deselectAllNodes();
    t = t || (this || _global).graph._nodes;
    "string" == typeof t && (t = [t]);
    for (var a in t) {
      var o = t[a];
      if (o.is_selected) this.deselectNode(o);
      else {
        !o.is_selected && o.onSelected && o.onSelected();
        o.is_selected = true;
        (this || _global).selected_nodes[o.id] = o;
        if (o.inputs)
          for (var r = 0; r < o.inputs.length; ++r)
            (this || _global).highlighted_links[o.inputs[r].link] = true;
        if (o.outputs)
          for (r = 0; r < o.outputs.length; ++r) {
            var l = o.outputs[r];
            if (l.links)
              for (var n = 0; n < l.links.length; ++n)
                (this || _global).highlighted_links[l.links[n]] = true;
          }
      }
    }
    (this || _global).onSelectionChange &&
      this.onSelectionChange((this || _global).selected_nodes);
    this.setDirty(true);
  };
  LGraphCanvas.prototype.deselectNode = function (t) {
    if (t.is_selected) {
      t.onDeselected && t.onDeselected();
      t.is_selected = false;
      (this || _global).onNodeDeselected && this.onNodeDeselected(t);
      if (t.inputs)
        for (var e = 0; e < t.inputs.length; ++e)
          delete (this || _global).highlighted_links[t.inputs[e].link];
      if (t.outputs)
        for (e = 0; e < t.outputs.length; ++e) {
          var a = t.outputs[e];
          if (a.links)
            for (var o = 0; o < a.links.length; ++o)
              delete (this || _global).highlighted_links[a.links[o]];
        }
    }
  };
  LGraphCanvas.prototype.deselectAllNodes = function () {
    if ((this || _global).graph) {
      var t = (this || _global).graph._nodes;
      for (var e = 0, a = t.length; e < a; ++e) {
        var o = t[e];
        if (o.is_selected) {
          o.onDeselected && o.onDeselected();
          o.is_selected = false;
          (this || _global).onNodeDeselected && this.onNodeDeselected(o);
        }
      }
      (this || _global).selected_nodes = {};
      (this || _global).current_node = null;
      (this || _global).highlighted_links = {};
      (this || _global).onSelectionChange &&
        this.onSelectionChange((this || _global).selected_nodes);
      this.setDirty(true);
    }
  };
  LGraphCanvas.prototype.deleteSelectedNodes = function () {
    (this || _global).graph.beforeChange();
    for (var t in (this || _global).selected_nodes) {
      var e = (this || _global).selected_nodes[t];
      if (!e.block_delete) {
        if (
          e.inputs &&
          e.inputs.length &&
          e.outputs &&
          e.outputs.length &&
          LiteGraph.isValidConnection(e.inputs[0].type, e.outputs[0].type) &&
          e.inputs[0].link &&
          e.outputs[0].links &&
          e.outputs[0].links.length
        ) {
          var a = e.graph.links[e.inputs[0].link];
          var o = e.graph.links[e.outputs[0].links[0]];
          var r = e.getInputNode(0);
          var l = e.getOutputNodes(0)[0];
          r && l && r.connect(a.origin_slot, l, o.target_slot);
        }
        (this || _global).graph.remove(e);
        (this || _global).onNodeDeselected && this.onNodeDeselected(e);
      }
    }
    (this || _global).selected_nodes = {};
    (this || _global).current_node = null;
    (this || _global).highlighted_links = {};
    this.setDirty(true);
    (this || _global).graph.afterChange();
  };
  LGraphCanvas.prototype.centerOnNode = function (t) {
    (this || _global).ds.offset[0] =
      -t.pos[0] -
      0.5 * t.size[0] +
      (0.5 * (this || _global).canvas.width) / (this || _global).ds.scale;
    (this || _global).ds.offset[1] =
      -t.pos[1] -
      0.5 * t.size[1] +
      (0.5 * (this || _global).canvas.height) / (this || _global).ds.scale;
    this.setDirty(true, true);
  };
  LGraphCanvas.prototype.adjustMouseEvent = function (t) {
    var e = 0;
    var a = 0;
    if ((this || _global).canvas) {
      var o = (this || _global).canvas.getBoundingClientRect();
      e = t.clientX - o.left;
      a = t.clientY - o.top;
    } else {
      e = t.clientX;
      a = t.clientY;
    }
    (this || _global).last_mouse_position[0] = e;
    (this || _global).last_mouse_position[1] = a;
    t.canvasX = e / (this || _global).ds.scale - (this || _global).ds.offset[0];
    t.canvasY = a / (this || _global).ds.scale - (this || _global).ds.offset[1];
  };
  LGraphCanvas.prototype.setZoom = function (t, e) {
    (this || _global).ds.changeScale(t, e);
    (this || _global).dirty_canvas = true;
    (this || _global).dirty_bgcanvas = true;
  };
  LGraphCanvas.prototype.convertOffsetToCanvas = function (t, e) {
    return (this || _global).ds.convertOffsetToCanvas(t, e);
  };
  LGraphCanvas.prototype.convertCanvasToOffset = function (t, e) {
    return (this || _global).ds.convertCanvasToOffset(t, e);
  };
  LGraphCanvas.prototype.convertEventToCanvasOffset = function (t) {
    var e = (this || _global).canvas.getBoundingClientRect();
    return this.convertCanvasToOffset([t.clientX - e.left, t.clientY - e.top]);
  };
  LGraphCanvas.prototype.bringToFront = function (t) {
    var e = (this || _global).graph._nodes.indexOf(t);
    if (-1 != e) {
      (this || _global).graph._nodes.splice(e, 1);
      (this || _global).graph._nodes.push(t);
    }
  };
  LGraphCanvas.prototype.sendToBack = function (t) {
    var e = (this || _global).graph._nodes.indexOf(t);
    if (-1 != e) {
      (this || _global).graph._nodes.splice(e, 1);
      (this || _global).graph._nodes.unshift(t);
    }
  };
  var temp = new Float32Array(4);
  LGraphCanvas.prototype.computeVisibleNodes = function (t, e) {
    var a = e || [];
    a.length = 0;
    t = t || (this || _global).graph._nodes;
    for (var o = 0, r = t.length; o < r; ++o) {
      var l = t[o];
      (!(this || _global).live_mode ||
        l.onDrawBackground ||
        l.onDrawForeground) &&
        overlapBounding((this || _global).visible_area, l.getBounding(temp)) &&
        a.push(l);
    }
    return a;
  };
  LGraphCanvas.prototype.draw = function (t, e) {
    if (
      (this || _global).canvas &&
      0 != (this || _global).canvas.width &&
      0 != (this || _global).canvas.height
    ) {
      var a = LiteGraph.getTime();
      (this || _global).render_time =
        0.001 * (a - (this || _global).last_draw_time);
      (this || _global).last_draw_time = a;
      (this || _global).graph &&
        (this || _global).ds.computeVisibleArea((this || _global).viewport);
      ((this || _global).dirty_bgcanvas ||
        e ||
        (this || _global).always_render_background ||
        ((this || _global).graph &&
          (this || _global).graph._last_trigger_time &&
          a - (this || _global).graph._last_trigger_time < 1e3)) &&
        this.drawBackCanvas();
      ((this || _global).dirty_canvas || t) && this.drawFrontCanvas();
      (this || _global).fps = (this || _global).render_time
        ? 1 / (this || _global).render_time
        : 0;
      (this || _global).frame += 1;
    }
  };
  LGraphCanvas.prototype.drawFrontCanvas = function () {
    (this || _global).dirty_canvas = false;
    (this || _global).ctx ||
      ((this || _global).ctx = (this || _global).bgcanvas.getContext("2d"));
    var t = (this || _global).ctx;
    if (t) {
      var e = (this || _global).canvas;
      if (t.start2D && !(this || _global).viewport) {
        t.start2D();
        t.restore();
        t.setTransform(1, 0, 0, 1, 0, 0);
      }
      var a = (this || _global).viewport || (this || _global).dirty_area;
      if (a) {
        t.save();
        t.beginPath();
        t.rect(a[0], a[1], a[2], a[3]);
        t.clip();
      }
      (this || _global).clear_background &&
        (a
          ? t.clearRect(a[0], a[1], a[2], a[3])
          : t.clearRect(0, 0, e.width, e.height));
      (this || _global).bgcanvas == (this || _global).canvas
        ? this.drawBackCanvas()
        : t.drawImage((this || _global).bgcanvas, 0, 0);
      (this || _global).onRender && this.onRender(e, t);
      (this || _global).show_info &&
        this.renderInfo(t, a ? a[0] : 0, a ? a[1] : 0);
      if ((this || _global).graph) {
        t.save();
        (this || _global).ds.toCanvasContext(t);
        var o = 0;
        var r = this.computeVisibleNodes(null, (this || _global).visible_nodes);
        for (var l = 0; l < r.length; ++l) {
          var n = r[l];
          t.save();
          t.translate(n.pos[0], n.pos[1]);
          this.drawNode(n, t);
          o += 1;
          t.restore();
        }
        (this || _global).render_execution_order && this.drawExecutionOrder(t);
        (this || _global).graph.config.links_ontop &&
          ((this || _global).live_mode || this.drawConnections(t));
        if (null != (this || _global).connecting_pos) {
          t.lineWidth = (this || _global).connections_width;
          var s = null;
          var u =
            (this || _global).connecting_output ||
            (this || _global).connecting_input;
          var h = u.type;
          var p = u.dir;
          null == p &&
            (p = (this || _global).connecting_output
              ? (this || _global).connecting_node.horizontal
                ? LiteGraph.DOWN
                : LiteGraph.RIGHT
              : (this || _global).connecting_node.horizontal
              ? LiteGraph.UP
              : LiteGraph.LEFT);
          var _ = u.shape;
          switch (h) {
            case LiteGraph.EVENT:
              s = LiteGraph.EVENT_LINK_COLOR;
              break;
            default:
              s = LiteGraph.CONNECTING_LINK_COLOR;
          }
          this.renderLink(
            t,
            (this || _global).connecting_pos,
            [
              (this || _global).graph_mouse[0],
              (this || _global).graph_mouse[1],
            ],
            null,
            false,
            null,
            s,
            p,
            LiteGraph.CENTER
          );
          t.beginPath();
          if (h === LiteGraph.EVENT || _ === LiteGraph.BOX_SHAPE) {
            t.rect(
              (this || _global).connecting_pos[0] - 6 + 0.5,
              (this || _global).connecting_pos[1] - 5 + 0.5,
              14,
              10
            );
            t.fill();
            t.beginPath();
            t.rect(
              (this || _global).graph_mouse[0] - 6 + 0.5,
              (this || _global).graph_mouse[1] - 5 + 0.5,
              14,
              10
            );
          } else if (_ === LiteGraph.ARROW_SHAPE) {
            t.moveTo(
              (this || _global).connecting_pos[0] + 8,
              (this || _global).connecting_pos[1] + 0.5
            );
            t.lineTo(
              (this || _global).connecting_pos[0] - 4,
              (this || _global).connecting_pos[1] + 6 + 0.5
            );
            t.lineTo(
              (this || _global).connecting_pos[0] - 4,
              (this || _global).connecting_pos[1] - 6 + 0.5
            );
            t.closePath();
          } else {
            t.arc(
              (this || _global).connecting_pos[0],
              (this || _global).connecting_pos[1],
              4,
              0,
              2 * Math.PI
            );
            t.fill();
            t.beginPath();
            t.arc(
              (this || _global).graph_mouse[0],
              (this || _global).graph_mouse[1],
              4,
              0,
              2 * Math.PI
            );
          }
          t.fill();
          t.fillStyle = "#ffcc00";
          if ((this || _global)._highlight_input) {
            t.beginPath();
            var g = (this || _global)._highlight_input_slot.shape;
            if (g === LiteGraph.ARROW_SHAPE) {
              t.moveTo(
                (this || _global)._highlight_input[0] + 8,
                (this || _global)._highlight_input[1] + 0.5
              );
              t.lineTo(
                (this || _global)._highlight_input[0] - 4,
                (this || _global)._highlight_input[1] + 6 + 0.5
              );
              t.lineTo(
                (this || _global)._highlight_input[0] - 4,
                (this || _global)._highlight_input[1] - 6 + 0.5
              );
              t.closePath();
            } else
              t.arc(
                (this || _global)._highlight_input[0],
                (this || _global)._highlight_input[1],
                6,
                0,
                2 * Math.PI
              );
            t.fill();
          }
          if ((this || _global)._highlight_output) {
            t.beginPath();
            if (g === LiteGraph.ARROW_SHAPE) {
              t.moveTo(
                (this || _global)._highlight_output[0] + 8,
                (this || _global)._highlight_output[1] + 0.5
              );
              t.lineTo(
                (this || _global)._highlight_output[0] - 4,
                (this || _global)._highlight_output[1] + 6 + 0.5
              );
              t.lineTo(
                (this || _global)._highlight_output[0] - 4,
                (this || _global)._highlight_output[1] - 6 + 0.5
              );
              t.closePath();
            } else
              t.arc(
                (this || _global)._highlight_output[0],
                (this || _global)._highlight_output[1],
                6,
                0,
                2 * Math.PI
              );
            t.fill();
          }
        }
        if ((this || _global).dragging_rectangle) {
          t.strokeStyle = "#FFF";
          t.strokeRect(
            (this || _global).dragging_rectangle[0],
            (this || _global).dragging_rectangle[1],
            (this || _global).dragging_rectangle[2],
            (this || _global).dragging_rectangle[3]
          );
        }
        (this || _global).over_link_center &&
        (this || _global).render_link_tooltip
          ? this.drawLinkTooltip(t, (this || _global).over_link_center)
          : (this || _global).onDrawLinkTooltip &&
            this.onDrawLinkTooltip(t, null);
        (this || _global).onDrawForeground &&
          this.onDrawForeground(t, (this || _global).visible_rect);
        t.restore();
      }
      (this || _global)._graph_stack &&
        (this || _global)._graph_stack.length &&
        this.drawSubgraphPanel(t);
      (this || _global).onDrawOverlay && this.onDrawOverlay(t);
      a && t.restore();
      t.finish2D && t.finish2D();
    }
  };
  LGraphCanvas.prototype.drawSubgraphPanel = function (t) {
    var e = (this || _global).graph;
    var a = e._subgraph_node;
    if (a) {
      this.drawSubgraphPanelLeft(e, a, t);
      this.drawSubgraphPanelRight(e, a, t);
    } else console.warn("subgraph without subnode");
  };
  LGraphCanvas.prototype.drawSubgraphPanelLeft = function (t, e, a) {
    var o = e.inputs ? e.inputs.length : 0;
    var r = 200;
    var l = Math.floor(1.6 * LiteGraph.NODE_SLOT_HEIGHT);
    a.fillStyle = "#111";
    a.globalAlpha = 0.8;
    a.beginPath();
    a.roundRect(10, 10, r, (o + 1) * l + 50, [8]);
    a.fill();
    a.globalAlpha = 1;
    a.fillStyle = "#888";
    a.font = "14px Arial";
    a.textAlign = "left";
    a.fillText("Graph Inputs", 20, 34);
    if (this.drawButton(r - 20, 20, 20, 20, "X", "#151515"))
      this.closeSubgraph();
    else {
      var n = 50;
      a.font = "14px Arial";
      if (e.inputs)
        for (var s = 0; s < e.inputs.length; ++s) {
          var u = e.inputs[s];
          if (!u.not_subgraph_input) {
            if (this.drawButton(20, n + 2, r - 20, l - 2)) {
              var h = e.constructor.input_node_type || "graph/input";
              (this || _global).graph.beforeChange();
              var p = LiteGraph.createNode(h);
              if (p) {
                t.add(p);
                (this || _global).block_click = false;
                (this || _global).last_click_position = null;
                this.selectNodes([p]);
                (this || _global).node_dragged = p;
                (this || _global).dragging_canvas = false;
                p.setProperty("name", u.name);
                p.setProperty("type", u.type);
                (this || _global).node_dragged.pos[0] =
                  (this || _global).graph_mouse[0] - 5;
                (this || _global).node_dragged.pos[1] =
                  (this || _global).graph_mouse[1] - 5;
                (this || _global).graph.afterChange();
              } else console.error("graph input node not found:", h);
            }
            a.fillStyle = "#9C9";
            a.beginPath();
            a.arc(r - 16, n + 0.5 * l, 5, 0, 2 * Math.PI);
            a.fill();
            a.fillStyle = "#AAA";
            a.fillText(u.name, 30, n + 0.75 * l);
            a.fillStyle = "#777";
            a.fillText(u.type, 130, n + 0.75 * l);
            n += l;
          }
        }
      this.drawButton(20, n + 2, r - 20, l - 2, "+", "#151515", "#222") &&
        this.showSubgraphPropertiesDialog(e);
    }
  };
  LGraphCanvas.prototype.drawSubgraphPanelRight = function (t, e, a) {
    var o = e.outputs ? e.outputs.length : 0;
    var r = (this || _global).bgcanvas.width;
    var l = 200;
    var n = Math.floor(1.6 * LiteGraph.NODE_SLOT_HEIGHT);
    a.fillStyle = "#111";
    a.globalAlpha = 0.8;
    a.beginPath();
    a.roundRect(r - l - 10, 10, l, (o + 1) * n + 50, [8]);
    a.fill();
    a.globalAlpha = 1;
    a.fillStyle = "#888";
    a.font = "14px Arial";
    a.textAlign = "left";
    var s = "Graph Outputs";
    var u = a.measureText(s).width;
    a.fillText(s, r - u - 20, 34);
    if (this.drawButton(r - l, 20, 20, 20, "X", "#151515"))
      this.closeSubgraph();
    else {
      var h = 50;
      a.font = "14px Arial";
      if (e.outputs)
        for (var p = 0; p < e.outputs.length; ++p) {
          var _ = e.outputs[p];
          if (!_.not_subgraph_input) {
            if (this.drawButton(r - l, h + 2, l - 20, n - 2)) {
              var g = e.constructor.output_node_type || "graph/output";
              (this || _global).graph.beforeChange();
              var d = LiteGraph.createNode(g);
              if (d) {
                t.add(d);
                (this || _global).block_click = false;
                (this || _global).last_click_position = null;
                this.selectNodes([d]);
                (this || _global).node_dragged = d;
                (this || _global).dragging_canvas = false;
                d.setProperty("name", _.name);
                d.setProperty("type", _.type);
                (this || _global).node_dragged.pos[0] =
                  (this || _global).graph_mouse[0] - 5;
                (this || _global).node_dragged.pos[1] =
                  (this || _global).graph_mouse[1] - 5;
                (this || _global).graph.afterChange();
              } else console.error("graph input node not found:", g);
            }
            a.fillStyle = "#9C9";
            a.beginPath();
            a.arc(r - l + 16, h + 0.5 * n, 5, 0, 2 * Math.PI);
            a.fill();
            a.fillStyle = "#AAA";
            a.fillText(_.name, r - l + 30, h + 0.75 * n);
            a.fillStyle = "#777";
            a.fillText(_.type, r - l + 130, h + 0.75 * n);
            h += n;
          }
        }
      this.drawButton(r - l, h + 2, l - 20, n - 2, "+", "#151515", "#222") &&
        this.showSubgraphPropertiesDialogRight(e);
    }
  };
  LGraphCanvas.prototype.drawButton = function (t, e, a, o, r, l, n, s) {
    var u = (this || _global).ctx;
    l = l || LiteGraph.NODE_DEFAULT_COLOR;
    n = n || "#555";
    s = s || LiteGraph.NODE_TEXT_COLOR;
    var h = e + LiteGraph.NODE_TITLE_HEIGHT + 2;
    var p = (this || _global).mouse;
    var _ = LiteGraph.isInsideRectangle(p[0], p[1], t, h, a, o);
    p = (this || _global).last_click_position;
    var g = p && LiteGraph.isInsideRectangle(p[0], p[1], t, h, a, o);
    u.fillStyle = _ ? n : l;
    g && (u.fillStyle = "#AAA");
    u.beginPath();
    u.roundRect(t, e, a, o, [4]);
    u.fill();
    if (null != r && r.constructor == String) {
      u.fillStyle = s;
      u.textAlign = "center";
      u.font = ((0.65 * o) | 0) + "px Arial";
      u.fillText(r, t + 0.5 * a, e + 0.75 * o);
      u.textAlign = "left";
    }
    var d = g && !(this || _global).block_click;
    g && this.blockClick();
    return d;
  };
  LGraphCanvas.prototype.isAreaClicked = function (t, e, a, o, r) {
    var l = (this || _global).mouse;
    LiteGraph.isInsideRectangle(l[0], l[1], t, e, a, o);
    l = (this || _global).last_click_position;
    var n = l && LiteGraph.isInsideRectangle(l[0], l[1], t, e, a, o);
    var s = n && !(this || _global).block_click;
    n && r && this.blockClick();
    return s;
  };
  LGraphCanvas.prototype.renderInfo = function (t, e, a) {
    e = e || 10;
    a = a || (this || _global).canvas.height - 80;
    t.save();
    t.translate(e, a);
    t.font = "10px Arial";
    t.fillStyle = "#888";
    t.textAlign = "left";
    if ((this || _global).graph) {
      t.fillText(
        "T: " + (this || _global).graph.globaltime.toFixed(2) + "s",
        5,
        13
      );
      t.fillText("I: " + (this || _global).graph.iteration, 5, 26);
      t.fillText(
        "N: " +
          (this || _global).graph._nodes.length +
          " [" +
          (this || _global).visible_nodes.length +
          "]",
        5,
        39
      );
      t.fillText("V: " + (this || _global).graph._version, 5, 52);
      t.fillText("FPS:" + (this || _global).fps.toFixed(2), 5, 65);
    } else t.fillText("No graph selected", 5, 13);
    t.restore();
  };
  LGraphCanvas.prototype.drawBackCanvas = function () {
    var t = (this || _global).bgcanvas;
    if (
      t.width != (this || _global).canvas.width ||
      t.height != (this || _global).canvas.height
    ) {
      t.width = (this || _global).canvas.width;
      t.height = (this || _global).canvas.height;
    }
    (this || _global).bgctx ||
      ((this || _global).bgctx = (this || _global).bgcanvas.getContext("2d"));
    var e = (this || _global).bgctx;
    e.start && e.start();
    var a = (this || _global).viewport || [
      0,
      0,
      e.canvas.width,
      e.canvas.height,
    ];
    (this || _global).clear_background && e.clearRect(a[0], a[1], a[2], a[3]);
    if (
      (this || _global)._graph_stack &&
      (this || _global)._graph_stack.length
    ) {
      e.save();
      (this || _global)._graph_stack[(this || _global)._graph_stack.length - 1];
      var o = (this || _global).graph._subgraph_node;
      e.strokeStyle = o.bgcolor;
      e.lineWidth = 10;
      e.strokeRect(1, 1, t.width - 2, t.height - 2);
      e.lineWidth = 1;
      e.font = "40px Arial";
      e.textAlign = "center";
      e.fillStyle = o.bgcolor || "#AAA";
      var r = "";
      for (var l = 1; l < (this || _global)._graph_stack.length; ++l)
        r +=
          (this || _global)._graph_stack[l]._subgraph_node.getTitle() + " >> ";
      e.fillText(r + o.getTitle(), 0.5 * t.width, 40);
      e.restore();
    }
    var n = false;
    (this || _global).onRenderBackground && (n = this.onRenderBackground(t, e));
    if (!(this || _global).viewport) {
      e.restore();
      e.setTransform(1, 0, 0, 1, 0, 0);
    }
    (this || _global).visible_links.length = 0;
    if ((this || _global).graph) {
      e.save();
      (this || _global).ds.toCanvasContext(e);
      if (
        (this || _global).ds.scale < 1.5 &&
        !n &&
        (this || _global).clear_background_color
      ) {
        e.fillStyle = (this || _global).clear_background_color;
        e.fillRect(
          (this || _global).visible_area[0],
          (this || _global).visible_area[1],
          (this || _global).visible_area[2],
          (this || _global).visible_area[3]
        );
      }
      if (
        (this || _global).background_image &&
        (this || _global).ds.scale > 0.5 &&
        !n
      ) {
        (this || _global).zoom_modify_alpha
          ? (e.globalAlpha =
              (1 - 0.5 / (this || _global).ds.scale) *
              (this || _global).editor_alpha)
          : (e.globalAlpha = (this || _global).editor_alpha);
        e.imageSmoothingEnabled = e.imageSmoothingEnabled = false;
        if (
          !(this || _global)._bg_img ||
          (this || _global)._bg_img.name != (this || _global).background_image
        ) {
          (this || _global)._bg_img = new Image();
          (this || _global)._bg_img.name = (this || _global).background_image;
          (this || _global)._bg_img.src = (this || _global).background_image;
          var s = this || _global;
          (this || _global)._bg_img.onload = function () {
            s.draw(true, true);
          };
        }
        var u = null;
        if (
          null == (this || _global)._pattern &&
          (this || _global)._bg_img.width > 0
        ) {
          u = e.createPattern((this || _global)._bg_img, "repeat");
          (this || _global)._pattern_img = (this || _global)._bg_img;
          (this || _global)._pattern = u;
        } else u = (this || _global)._pattern;
        if (u) {
          e.fillStyle = u;
          e.fillRect(
            (this || _global).visible_area[0],
            (this || _global).visible_area[1],
            (this || _global).visible_area[2],
            (this || _global).visible_area[3]
          );
          e.fillStyle = "transparent";
        }
        e.globalAlpha = 1;
        e.imageSmoothingEnabled = e.imageSmoothingEnabled = true;
      }
      (this || _global).graph._groups.length &&
        !(this || _global).live_mode &&
        this.drawGroups(t, e);
      (this || _global).onDrawBackground &&
        this.onDrawBackground(e, (this || _global).visible_area);
      if ((this || _global).onBackgroundRender) {
        console.error(
          "WARNING! onBackgroundRender deprecated, now is named onDrawBackground "
        );
        (this || _global).onBackgroundRender = null;
      }
      if ((this || _global).render_canvas_border) {
        e.strokeStyle = "#235";
        e.strokeRect(0, 0, t.width, t.height);
      }
      if ((this || _global).render_connections_shadows) {
        e.shadowColor = "#000";
        e.shadowOffsetX = 0;
        e.shadowOffsetY = 0;
        e.shadowBlur = 6;
      } else e.shadowColor = "rgba(0,0,0,0)";
      (this || _global).live_mode || this.drawConnections(e);
      e.shadowColor = "rgba(0,0,0,0)";
      e.restore();
    }
    e.finish && e.finish();
    (this || _global).dirty_bgcanvas = false;
    (this || _global).dirty_canvas = true;
  };
  var temp_vec2 = new Float32Array(2);
  LGraphCanvas.prototype.drawNode = function (t, e) {
    (this || _global).current_node = t;
    var a = t.color || t.constructor.color || LiteGraph.NODE_DEFAULT_COLOR;
    var o =
      t.bgcolor || t.constructor.bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR;
    t.mouseOver && true;
    var r = (this || _global).ds.scale < 0.6;
    if ((this || _global).live_mode) {
      if (!t.flags.collapsed) {
        e.shadowColor = "transparent";
        t.onDrawForeground &&
          t.onDrawForeground(e, this || _global, (this || _global).canvas);
      }
    } else {
      var l = (this || _global).editor_alpha;
      e.globalAlpha = l;
      if ((this || _global).render_shadows && !r) {
        e.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR;
        e.shadowOffsetX = 2 * (this || _global).ds.scale;
        e.shadowOffsetY = 2 * (this || _global).ds.scale;
        e.shadowBlur = 3 * (this || _global).ds.scale;
      } else e.shadowColor = "transparent";
      if (
        !t.flags.collapsed ||
        !t.onDrawCollapsed ||
        true != t.onDrawCollapsed(e, this || _global)
      ) {
        var n = t._shape || LiteGraph.BOX_SHAPE;
        var s = temp_vec2;
        temp_vec2.set(t.size);
        var u = t.horizontal;
        if (t.flags.collapsed) {
          e.font = (this || _global).inner_text_font;
          var h = t.getTitle ? t.getTitle() : t.title;
          if (null != h) {
            t._collapsed_width = Math.min(
              t.size[0],
              e.measureText(h).width + 2 * LiteGraph.NODE_TITLE_HEIGHT
            );
            s[0] = t._collapsed_width;
            s[1] = 0;
          }
        }
        if (t.clip_area) {
          e.save();
          e.beginPath();
          n == LiteGraph.BOX_SHAPE
            ? e.rect(0, 0, s[0], s[1])
            : n == LiteGraph.ROUND_SHAPE
            ? e.roundRect(0, 0, s[0], s[1], [10])
            : n == LiteGraph.CIRCLE_SHAPE &&
              e.arc(0.5 * s[0], 0.5 * s[1], 0.5 * s[0], 0, 2 * Math.PI);
          e.clip();
        }
        t.has_errors && (o = "red");
        this.drawNodeShape(t, e, s, a, o, t.is_selected, t.mouseOver);
        e.shadowColor = "transparent";
        t.onDrawForeground &&
          t.onDrawForeground(e, this || _global, (this || _global).canvas);
        e.textAlign = u ? "center" : "left";
        e.font = (this || _global).inner_text_font;
        var p = !r;
        var _ = (this || _global).connecting_output;
        var g = (this || _global).connecting_input;
        e.lineWidth = 1;
        var d = 0;
        var c = new Float32Array(2);
        if (t.flags.collapsed) {
          if ((this || _global).render_collapsed_slots) {
            var b = null;
            var f = null;
            if (t.inputs)
              for (G = 0; G < t.inputs.length; G++) {
                T = t.inputs[G];
                if (null != T.link) {
                  b = T;
                  break;
                }
              }
            if (t.outputs)
              for (G = 0; G < t.outputs.length; G++) {
                T = t.outputs[G];
                T.links && T.links.length && (f = T);
              }
            if (b) {
              var m = 0;
              var L = -0.5 * LiteGraph.NODE_TITLE_HEIGHT;
              if (u) {
                m = 0.5 * t._collapsed_width;
                L = -LiteGraph.NODE_TITLE_HEIGHT;
              }
              e.fillStyle = "#686";
              e.beginPath();
              if (T.type === LiteGraph.EVENT || T.shape === LiteGraph.BOX_SHAPE)
                e.rect(m - 7 + 0.5, L - 4, 14, 8);
              else if (T.shape === LiteGraph.ARROW_SHAPE) {
                e.moveTo(m + 8, L);
                e.lineTo(m + -4, L - 4);
                e.lineTo(m + -4, L + 4);
                e.closePath();
              } else e.arc(m, L, 4, 0, 2 * Math.PI);
              e.fill();
            }
            if (f) {
              m = t._collapsed_width;
              L = -0.5 * LiteGraph.NODE_TITLE_HEIGHT;
              if (u) {
                m = 0.5 * t._collapsed_width;
                L = 0;
              }
              e.fillStyle = "#686";
              e.strokeStyle = "black";
              e.beginPath();
              if (T.type === LiteGraph.EVENT || T.shape === LiteGraph.BOX_SHAPE)
                e.rect(m - 7 + 0.5, L - 4, 14, 8);
              else if (T.shape === LiteGraph.ARROW_SHAPE) {
                e.moveTo(m + 6, L);
                e.lineTo(m - 6, L - 4);
                e.lineTo(m - 6, L + 4);
                e.closePath();
              } else e.arc(m, L, 4, 0, 2 * Math.PI);
              e.fill();
            }
          }
        } else {
          if (t.inputs)
            for (var G = 0; G < t.inputs.length; G++) {
              var T = t.inputs[G];
              var I = T.type;
              var E = T.shape;
              e.globalAlpha = l;
              (this || _global).connecting_output &&
                !LiteGraph.isValidConnection(T.type, _.type) &&
                (e.globalAlpha = 0.4 * l);
              e.fillStyle =
                null != T.link
                  ? T.color_on ||
                    (this || _global).default_connection_color_byType[I] ||
                    (this || _global).default_connection_color.input_on
                  : T.color_off ||
                    (this || _global).default_connection_color_byTypeOff[I] ||
                    (this || _global).default_connection_color_byType[I] ||
                    (this || _global).default_connection_color.input_off;
              var D = t.getConnectionPos(true, G, c);
              D[0] -= t.pos[0];
              D[1] -= t.pos[1];
              d < D[1] + 0.5 * LiteGraph.NODE_SLOT_HEIGHT &&
                (d = D[1] + 0.5 * LiteGraph.NODE_SLOT_HEIGHT);
              e.beginPath();
              "array" == I && (E = LiteGraph.GRID_SHAPE);
              var S = true;
              if (T.type === LiteGraph.EVENT || T.shape === LiteGraph.BOX_SHAPE)
                u
                  ? e.rect(D[0] - 5 + 0.5, D[1] - 8 + 0.5, 10, 14)
                  : e.rect(D[0] - 6 + 0.5, D[1] - 5 + 0.5, 14, 10);
              else if (E === LiteGraph.ARROW_SHAPE) {
                e.moveTo(D[0] + 8, D[1] + 0.5);
                e.lineTo(D[0] - 4, D[1] + 6 + 0.5);
                e.lineTo(D[0] - 4, D[1] - 6 + 0.5);
                e.closePath();
              } else if (E === LiteGraph.GRID_SHAPE) {
                e.rect(D[0] - 4, D[1] - 4, 2, 2);
                e.rect(D[0] - 1, D[1] - 4, 2, 2);
                e.rect(D[0] + 2, D[1] - 4, 2, 2);
                e.rect(D[0] - 4, D[1] - 1, 2, 2);
                e.rect(D[0] - 1, D[1] - 1, 2, 2);
                e.rect(D[0] + 2, D[1] - 1, 2, 2);
                e.rect(D[0] - 4, D[1] + 2, 2, 2);
                e.rect(D[0] - 1, D[1] + 2, 2, 2);
                e.rect(D[0] + 2, D[1] + 2, 2, 2);
                S = false;
              } else
                r
                  ? e.rect(D[0] - 4, D[1] - 4, 8, 8)
                  : e.arc(D[0], D[1], 4, 0, 2 * Math.PI);
              e.fill();
              if (p) {
                var C = null != T.label ? T.label : T.name;
                if (C) {
                  e.fillStyle = LiteGraph.NODE_TEXT_COLOR;
                  u || T.dir == LiteGraph.UP
                    ? e.fillText(C, D[0], D[1] - 10)
                    : e.fillText(C, D[0] + 10, D[1] + 5);
                }
              }
            }
          e.textAlign = u ? "center" : "right";
          e.strokeStyle = "black";
          if (t.outputs)
            for (var G = 0; G < t.outputs.length; G++) {
              var T = t.outputs[G];
              I = T.type;
              E = T.shape;
              (this || _global).connecting_input &&
                !LiteGraph.isValidConnection(I, g.type) &&
                (e.globalAlpha = 0.4 * l);
              D = t.getConnectionPos(false, G, c);
              D[0] -= t.pos[0];
              D[1] -= t.pos[1];
              d < D[1] + 0.5 * LiteGraph.NODE_SLOT_HEIGHT &&
                (d = D[1] + 0.5 * LiteGraph.NODE_SLOT_HEIGHT);
              e.fillStyle =
                T.links && T.links.length
                  ? T.color_on ||
                    (this || _global).default_connection_color_byType[I] ||
                    (this || _global).default_connection_color.output_on
                  : T.color_off ||
                    (this || _global).default_connection_color_byTypeOff[I] ||
                    (this || _global).default_connection_color_byType[I] ||
                    (this || _global).default_connection_color.output_off;
              e.beginPath();
              "array" == I && (E = LiteGraph.GRID_SHAPE);
              S = true;
              if (I === LiteGraph.EVENT || E === LiteGraph.BOX_SHAPE)
                u
                  ? e.rect(D[0] - 5 + 0.5, D[1] - 8 + 0.5, 10, 14)
                  : e.rect(D[0] - 6 + 0.5, D[1] - 5 + 0.5, 14, 10);
              else if (E === LiteGraph.ARROW_SHAPE) {
                e.moveTo(D[0] + 8, D[1] + 0.5);
                e.lineTo(D[0] - 4, D[1] + 6 + 0.5);
                e.lineTo(D[0] - 4, D[1] - 6 + 0.5);
                e.closePath();
              } else if (E === LiteGraph.GRID_SHAPE) {
                e.rect(D[0] - 4, D[1] - 4, 2, 2);
                e.rect(D[0] - 1, D[1] - 4, 2, 2);
                e.rect(D[0] + 2, D[1] - 4, 2, 2);
                e.rect(D[0] - 4, D[1] - 1, 2, 2);
                e.rect(D[0] - 1, D[1] - 1, 2, 2);
                e.rect(D[0] + 2, D[1] - 1, 2, 2);
                e.rect(D[0] - 4, D[1] + 2, 2, 2);
                e.rect(D[0] - 1, D[1] + 2, 2, 2);
                e.rect(D[0] + 2, D[1] + 2, 2, 2);
                S = false;
              } else
                r
                  ? e.rect(D[0] - 4, D[1] - 4, 8, 8)
                  : e.arc(D[0], D[1], 4, 0, 2 * Math.PI);
              e.fill();
              !r && S && e.stroke();
              if (p) {
                C = null != T.label ? T.label : T.name;
                if (C) {
                  e.fillStyle = LiteGraph.NODE_TEXT_COLOR;
                  u || T.dir == LiteGraph.DOWN
                    ? e.fillText(C, D[0], D[1] - 8)
                    : e.fillText(C, D[0] - 10, D[1] + 5);
                }
              }
            }
          e.textAlign = "left";
          e.globalAlpha = 1;
          if (t.widgets) {
            var O = d;
            (u || t.widgets_up) && (O = 2);
            null != t.widgets_start_y && (O = t.widgets_start_y);
            this.drawNodeWidgets(
              t,
              O,
              e,
              (this || _global).node_widget &&
                (this || _global).node_widget[0] == t
                ? (this || _global).node_widget[1]
                : null
            );
          }
        }
        t.clip_area && e.restore();
        e.globalAlpha = 1;
      }
    }
  };
  LGraphCanvas.prototype.drawLinkTooltip = function (t, e) {
    var a = e._pos;
    t.fillStyle = "black";
    t.beginPath();
    t.arc(a[0], a[1], 3, 0, 2 * Math.PI);
    t.fill();
    if (
      null != e.data &&
      (!(this || _global).onDrawLinkTooltip ||
        true != this.onDrawLinkTooltip(t, e, this || _global))
    ) {
      var o = e.data;
      var r = null;
      r =
        o.constructor === Number
          ? o.toFixed(2)
          : o.constructor === String
          ? '"' + o + '"'
          : o.constructor === Boolean
          ? String(o)
          : o.toToolTip
          ? o.toToolTip()
          : "[" + o.constructor.name + "]";
      if (null != r) {
        r = r.substr(0, 30);
        t.font = "14px Courier New";
        var l = t.measureText(r);
        var n = l.width + 20;
        var s = 24;
        t.shadowColor = "black";
        t.shadowOffsetX = 2;
        t.shadowOffsetY = 2;
        t.shadowBlur = 3;
        t.fillStyle = "#454";
        t.beginPath();
        t.roundRect(a[0] - 0.5 * n, a[1] - 15 - s, n, s, [3]);
        t.moveTo(a[0] - 10, a[1] - 15);
        t.lineTo(a[0] + 10, a[1] - 15);
        t.lineTo(a[0], a[1] - 5);
        t.fill();
        t.shadowColor = "transparent";
        t.textAlign = "center";
        t.fillStyle = "#CEC";
        t.fillText(r, a[0], a[1] - 15 - 0.3 * s);
      }
    }
  };
  var tmp_area = new Float32Array(4);
  LGraphCanvas.prototype.drawNodeShape = function (t, e, a, o, r, l, n) {
    e.strokeStyle = o;
    e.fillStyle = r;
    var s = LiteGraph.NODE_TITLE_HEIGHT;
    var u = (this || _global).ds.scale < 0.5;
    var h = t._shape || t.constructor.shape || LiteGraph.ROUND_SHAPE;
    var p = t.constructor.title_mode;
    var _ = true;
    p == LiteGraph.TRANSPARENT_TITLE || p == LiteGraph.NO_TITLE
      ? (_ = false)
      : p == LiteGraph.AUTOHIDE_TITLE && n && (_ = true);
    var g = tmp_area;
    g[0] = 0;
    g[1] = _ ? -s : 0;
    g[2] = a[0] + 1;
    g[3] = _ ? a[1] + s : a[1];
    var d = e.globalAlpha;
    e.beginPath();
    h == LiteGraph.BOX_SHAPE || u
      ? e.fillRect(g[0], g[1], g[2], g[3])
      : h == LiteGraph.ROUND_SHAPE || h == LiteGraph.CARD_SHAPE
      ? e.roundRect(
          g[0],
          g[1],
          g[2],
          g[3],
          h == LiteGraph.CARD_SHAPE
            ? [
                (this || _global).round_radius,
                (this || _global).round_radius,
                0,
                0,
              ]
            : [(this || _global).round_radius]
        )
      : h == LiteGraph.CIRCLE_SHAPE &&
        e.arc(0.5 * a[0], 0.5 * a[1], 0.5 * a[0], 0, 2 * Math.PI);
    e.fill();
    if (!t.flags.collapsed && _) {
      e.shadowColor = "transparent";
      e.fillStyle = "rgba(0,0,0,0.2)";
      e.fillRect(0, -1, g[2], 2);
    }
    e.shadowColor = "transparent";
    t.onDrawBackground &&
      t.onDrawBackground(
        e,
        this || _global,
        (this || _global).canvas,
        (this || _global).graph_mouse
      );
    if (_ || p == LiteGraph.TRANSPARENT_TITLE) {
      if (t.onDrawTitleBar)
        t.onDrawTitleBar(e, s, a, (this || _global).ds.scale, o);
      else if (
        p != LiteGraph.TRANSPARENT_TITLE &&
        (t.constructor.title_color || (this || _global).render_title_colored)
      ) {
        var c = t.constructor.title_color || o;
        t.flags.collapsed && (e.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR);
        if ((this || _global).use_gradients) {
          var b = LGraphCanvas.gradients[c];
          if (!b) {
            b = LGraphCanvas.gradients[c] = e.createLinearGradient(
              0,
              0,
              400,
              0
            );
            b.addColorStop(0, c);
            b.addColorStop(1, "#000");
          }
          e.fillStyle = b;
        } else e.fillStyle = c;
        e.beginPath();
        h == LiteGraph.BOX_SHAPE || u
          ? e.rect(0, -s, a[0] + 1, s)
          : (h != LiteGraph.ROUND_SHAPE && h != LiteGraph.CARD_SHAPE) ||
            e.roundRect(
              0,
              -s,
              a[0] + 1,
              s,
              t.flags.collapsed
                ? [(this || _global).round_radius]
                : [
                    (this || _global).round_radius,
                    (this || _global).round_radius,
                    0,
                    0,
                  ]
            );
        e.fill();
        e.shadowColor = "transparent";
      }
      var f = false;
      LiteGraph.node_box_coloured_by_mode &&
        LiteGraph.NODE_MODES_COLORS[t.mode] &&
        (f = LiteGraph.NODE_MODES_COLORS[t.mode]);
      LiteGraph.node_box_coloured_when_on &&
        (f = t.action_triggered ? "#FFF" : t.execute_triggered ? "#AAA" : f);
      var m = 10;
      if (t.onDrawTitleBox)
        t.onDrawTitleBox(e, s, a, (this || _global).ds.scale);
      else if (
        h == LiteGraph.ROUND_SHAPE ||
        h == LiteGraph.CIRCLE_SHAPE ||
        h == LiteGraph.CARD_SHAPE
      ) {
        if (u) {
          e.fillStyle = "black";
          e.beginPath();
          e.arc(0.5 * s, -0.5 * s, 0.5 * m + 1, 0, 2 * Math.PI);
          e.fill();
        }
        e.fillStyle = t.boxcolor || f || LiteGraph.NODE_DEFAULT_BOXCOLOR;
        if (u) e.fillRect(0.5 * s - 0.5 * m, -0.5 * s - 0.5 * m, m, m);
        else {
          e.beginPath();
          e.arc(0.5 * s, -0.5 * s, 0.5 * m, 0, 2 * Math.PI);
          e.fill();
        }
      } else {
        if (u) {
          e.fillStyle = "black";
          e.fillRect(0.5 * (s - m) - 1, -0.5 * (s + m) - 1, m + 2, m + 2);
        }
        e.fillStyle = t.boxcolor || f || LiteGraph.NODE_DEFAULT_BOXCOLOR;
        e.fillRect(0.5 * (s - m), -0.5 * (s + m), m, m);
      }
      e.globalAlpha = d;
      t.onDrawTitleText &&
        t.onDrawTitleText(
          e,
          s,
          a,
          (this || _global).ds.scale,
          (this || _global).title_text_font,
          l
        );
      if (!u) {
        e.font = (this || _global).title_text_font;
        var L = String(t.getTitle());
        if (L) {
          e.fillStyle = l
            ? LiteGraph.NODE_SELECTED_TITLE_COLOR
            : t.constructor.title_text_color ||
              (this || _global).node_title_color;
          if (t.flags.collapsed) {
            e.textAlign = "left";
            e.measureText(L);
            e.fillText(L.substr(0, 20), s, LiteGraph.NODE_TITLE_TEXT_Y - s);
            e.textAlign = "left";
          } else {
            e.textAlign = "left";
            e.fillText(L, s, LiteGraph.NODE_TITLE_TEXT_Y - s);
          }
        }
      }
      if (!t.flags.collapsed && t.subgraph && !t.skip_subgraph_button) {
        var G = LiteGraph.NODE_TITLE_HEIGHT;
        var T = t.size[0] - G;
        var I = LiteGraph.isInsideRectangle(
          (this || _global).graph_mouse[0] - t.pos[0],
          (this || _global).graph_mouse[1] - t.pos[1],
          T + 2,
          2 - G,
          G - 4,
          G - 4
        );
        e.fillStyle = I ? "#888" : "#555";
        if (h == LiteGraph.BOX_SHAPE || u)
          e.fillRect(T + 2, 2 - G, G - 4, G - 4);
        else {
          e.beginPath();
          e.roundRect(T + 2, 2 - G, G - 4, G - 4, [4]);
          e.fill();
        }
        e.fillStyle = "#333";
        e.beginPath();
        e.moveTo(T + 0.2 * G, 0.6 * -G);
        e.lineTo(T + 0.8 * G, 0.6 * -G);
        e.lineTo(T + 0.5 * G, 0.3 * -G);
        e.fill();
      }
      t.onDrawTitle && t.onDrawTitle(e);
    }
    if (l) {
      t.onBounding && t.onBounding(g);
      if (p == LiteGraph.TRANSPARENT_TITLE) {
        g[1] -= s;
        g[3] += s;
      }
      e.lineWidth = 1;
      e.globalAlpha = 0.8;
      e.beginPath();
      h == LiteGraph.BOX_SHAPE
        ? e.rect(-6 + g[0], -6 + g[1], 12 + g[2], 12 + g[3])
        : h == LiteGraph.ROUND_SHAPE ||
          (h == LiteGraph.CARD_SHAPE && t.flags.collapsed)
        ? e.roundRect(-6 + g[0], -6 + g[1], 12 + g[2], 12 + g[3], [
            2 * (this || _global).round_radius,
          ])
        : h == LiteGraph.CARD_SHAPE
        ? e.roundRect(-6 + g[0], -6 + g[1], 12 + g[2], 12 + g[3], [
            2 * (this || _global).round_radius,
            2,
            2 * (this || _global).round_radius,
            2,
          ])
        : h == LiteGraph.CIRCLE_SHAPE &&
          e.arc(0.5 * a[0], 0.5 * a[1], 0.5 * a[0] + 6, 0, 2 * Math.PI);
      e.strokeStyle = LiteGraph.NODE_BOX_OUTLINE_COLOR;
      e.stroke();
      e.strokeStyle = o;
      e.globalAlpha = 1;
    }
    t.execute_triggered > 0 && t.execute_triggered--;
    t.action_triggered > 0 && t.action_triggered--;
  };
  var margin_area = new Float32Array(4);
  var link_bounding = new Float32Array(4);
  var tempA = new Float32Array(2);
  var tempB = new Float32Array(2);
  LGraphCanvas.prototype.drawConnections = function (t) {
    var e = LiteGraph.getTime();
    var a = (this || _global).visible_area;
    margin_area[0] = a[0] - 20;
    margin_area[1] = a[1] - 20;
    margin_area[2] = a[2] + 40;
    margin_area[3] = a[3] + 40;
    t.lineWidth = (this || _global).connections_width;
    t.fillStyle = "#AAA";
    t.strokeStyle = "#AAA";
    t.globalAlpha = (this || _global).editor_alpha;
    var o = (this || _global).graph._nodes;
    for (var r = 0, l = o.length; r < l; ++r) {
      var n = o[r];
      if (n.inputs && n.inputs.length)
        for (var s = 0; s < n.inputs.length; ++s) {
          var u = n.inputs[s];
          if (u && null != u.link) {
            var h = u.link;
            var p = (this || _global).graph.links[h];
            if (p) {
              var _ = (this || _global).graph.getNodeById(p.origin_id);
              if (null != _) {
                var g = p.origin_slot;
                var d = null;
                d =
                  -1 == g
                    ? [_.pos[0] + 10, _.pos[1] + 10]
                    : _.getConnectionPos(false, g, tempA);
                var c = n.getConnectionPos(true, s, tempB);
                link_bounding[0] = d[0];
                link_bounding[1] = d[1];
                link_bounding[2] = c[0] - d[0];
                link_bounding[3] = c[1] - d[1];
                if (link_bounding[2] < 0) {
                  link_bounding[0] += link_bounding[2];
                  link_bounding[2] = Math.abs(link_bounding[2]);
                }
                if (link_bounding[3] < 0) {
                  link_bounding[1] += link_bounding[3];
                  link_bounding[3] = Math.abs(link_bounding[3]);
                }
                if (overlapBounding(link_bounding, margin_area)) {
                  var b = _.outputs[g];
                  var f = n.inputs[s];
                  if (b && f) {
                    var m =
                      b.dir ||
                      (_.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT);
                    var L =
                      f.dir || (n.horizontal ? LiteGraph.UP : LiteGraph.LEFT);
                    this.renderLink(t, d, c, p, false, 0, null, m, L);
                    if (p && p._last_time && e - p._last_time < 1e3) {
                      var G = 2 - 0.002 * (e - p._last_time);
                      var T = t.globalAlpha;
                      t.globalAlpha = T * G;
                      this.renderLink(t, d, c, p, true, G, "white", m, L);
                      t.globalAlpha = T;
                    }
                  }
                }
              }
            }
          }
        }
    }
    t.globalAlpha = 1;
  };
  /**
   * draws a link between two points
   * @method renderLink
   * @param {vec2} a start pos
   * @param {vec2} b end pos
   * @param {Object} link the link object with all the link info
   * @param {boolean} skip_border ignore the shadow of the link
   * @param {boolean} flow show flow animation (for events)
   * @param {string} color the color for the link
   * @param {number} start_dir the direction enum
   * @param {number} end_dir the direction enum
   * @param {number} num_sublines number of sublines (useful to represent vec3 or rgb)
   **/ LGraphCanvas.prototype.renderLink = function (
    t,
    e,
    a,
    o,
    r,
    l,
    n,
    s,
    u,
    h
  ) {
    o && (this || _global).visible_links.push(o);
    !n && o && (n = o.color || LGraphCanvas.link_type_colors[o.type]);
    n || (n = (this || _global).default_link_color);
    null != o && (this || _global).highlighted_links[o.id] && (n = "#FFF");
    s = s || LiteGraph.RIGHT;
    u = u || LiteGraph.LEFT;
    var p = distance(e, a);
    (this || _global).render_connections_border &&
      (this || _global).ds.scale > 0.6 &&
      (t.lineWidth = (this || _global).connections_width + 4);
    t.lineJoin = "round";
    h = h || 1;
    h > 1 && (t.lineWidth = 0.5);
    t.beginPath();
    for (var _ = 0; _ < h; _ += 1) {
      var g = 5 * (_ - 0.5 * (h - 1));
      if ((this || _global).links_render_mode == LiteGraph.SPLINE_LINK) {
        t.moveTo(e[0], e[1] + g);
        var d = 0;
        var c = 0;
        var b = 0;
        var f = 0;
        switch (s) {
          case LiteGraph.LEFT:
            d = -0.25 * p;
            break;
          case LiteGraph.RIGHT:
            d = 0.25 * p;
            break;
          case LiteGraph.UP:
            c = -0.25 * p;
            break;
          case LiteGraph.DOWN:
            c = 0.25 * p;
            break;
        }
        switch (u) {
          case LiteGraph.LEFT:
            b = -0.25 * p;
            break;
          case LiteGraph.RIGHT:
            b = 0.25 * p;
            break;
          case LiteGraph.UP:
            f = -0.25 * p;
            break;
          case LiteGraph.DOWN:
            f = 0.25 * p;
            break;
        }
        t.bezierCurveTo(
          e[0] + d,
          e[1] + c + g,
          a[0] + b,
          a[1] + f + g,
          a[0],
          a[1] + g
        );
      } else if ((this || _global).links_render_mode == LiteGraph.LINEAR_LINK) {
        t.moveTo(e[0], e[1] + g);
        d = 0;
        c = 0;
        b = 0;
        f = 0;
        switch (s) {
          case LiteGraph.LEFT:
            d = -1;
            break;
          case LiteGraph.RIGHT:
            d = 1;
            break;
          case LiteGraph.UP:
            c = -1;
            break;
          case LiteGraph.DOWN:
            c = 1;
            break;
        }
        switch (u) {
          case LiteGraph.LEFT:
            b = -1;
            break;
          case LiteGraph.RIGHT:
            b = 1;
            break;
          case LiteGraph.UP:
            f = -1;
            break;
          case LiteGraph.DOWN:
            f = 1;
            break;
        }
        var m = 15;
        t.lineTo(e[0] + d * m, e[1] + c * m + g);
        t.lineTo(a[0] + b * m, a[1] + f * m + g);
        t.lineTo(a[0], a[1] + g);
      } else {
        if ((this || _global).links_render_mode != LiteGraph.STRAIGHT_LINK)
          return;
        t.moveTo(e[0], e[1]);
        var L = e[0];
        var G = e[1];
        var T = a[0];
        var I = a[1];
        s == LiteGraph.RIGHT ? (L += 10) : (G += 10);
        u == LiteGraph.LEFT ? (T -= 10) : (I -= 10);
        t.lineTo(L, G);
        t.lineTo(0.5 * (L + T), G);
        t.lineTo(0.5 * (L + T), I);
        t.lineTo(T, I);
        t.lineTo(a[0], a[1]);
      }
    }
    if (
      (this || _global).render_connections_border &&
      (this || _global).ds.scale > 0.6 &&
      !r
    ) {
      t.strokeStyle = "rgba(0,0,0,0.5)";
      t.stroke();
    }
    t.lineWidth = (this || _global).connections_width;
    t.fillStyle = t.strokeStyle = n;
    t.stroke();
    var E = this.computeConnectionPoint(e, a, 0.5, s, u);
    if (o && o._pos) {
      o._pos[0] = E[0];
      o._pos[1] = E[1];
    }
    if (
      (this || _global).ds.scale >= 0.6 &&
      (this || _global).highquality_render &&
      u != LiteGraph.CENTER
    ) {
      if ((this || _global).render_connection_arrows) {
        var D = this.computeConnectionPoint(e, a, 0.25, s, u);
        var S = this.computeConnectionPoint(e, a, 0.26, s, u);
        var C = this.computeConnectionPoint(e, a, 0.75, s, u);
        var O = this.computeConnectionPoint(e, a, 0.76, s, u);
        var N = 0;
        var A = 0;
        if ((this || _global).render_curved_connections) {
          N = -Math.atan2(S[0] - D[0], S[1] - D[1]);
          A = -Math.atan2(O[0] - C[0], O[1] - C[1]);
        } else A = N = a[1] > e[1] ? 0 : Math.PI;
        t.save();
        t.translate(D[0], D[1]);
        t.rotate(N);
        t.beginPath();
        t.moveTo(-5, -3);
        t.lineTo(0, 7);
        t.lineTo(5, -3);
        t.fill();
        t.restore();
        t.save();
        t.translate(C[0], C[1]);
        t.rotate(A);
        t.beginPath();
        t.moveTo(-5, -3);
        t.lineTo(0, 7);
        t.lineTo(5, -3);
        t.fill();
        t.restore();
      }
      t.beginPath();
      t.arc(E[0], E[1], 5, 0, 2 * Math.PI);
      t.fill();
    }
    if (l) {
      t.fillStyle = n;
      for (_ = 0; _ < 5; ++_) {
        var M = (0.001 * LiteGraph.getTime() + 0.2 * _) % 1;
        E = this.computeConnectionPoint(e, a, M, s, u);
        t.beginPath();
        t.arc(E[0], E[1], 5, 0, 2 * Math.PI);
        t.fill();
      }
    }
  };
  LGraphCanvas.prototype.computeConnectionPoint = function (t, e, a, o, r) {
    o = o || LiteGraph.RIGHT;
    r = r || LiteGraph.LEFT;
    var l = distance(t, e);
    var n = t;
    var s = [t[0], t[1]];
    var u = [e[0], e[1]];
    var h = e;
    switch (o) {
      case LiteGraph.LEFT:
        s[0] += -0.25 * l;
        break;
      case LiteGraph.RIGHT:
        s[0] += 0.25 * l;
        break;
      case LiteGraph.UP:
        s[1] += -0.25 * l;
        break;
      case LiteGraph.DOWN:
        s[1] += 0.25 * l;
        break;
    }
    switch (r) {
      case LiteGraph.LEFT:
        u[0] += -0.25 * l;
        break;
      case LiteGraph.RIGHT:
        u[0] += 0.25 * l;
        break;
      case LiteGraph.UP:
        u[1] += -0.25 * l;
        break;
      case LiteGraph.DOWN:
        u[1] += 0.25 * l;
        break;
    }
    var p = (1 - a) * (1 - a) * (1 - a);
    var _ = (1 - a) * (1 - a) * 3 * a;
    var g = 3 * (1 - a) * (a * a);
    var d = a * a * a;
    var c = p * n[0] + _ * s[0] + g * u[0] + d * h[0];
    var b = p * n[1] + _ * s[1] + g * u[1] + d * h[1];
    return [c, b];
  };
  LGraphCanvas.prototype.drawExecutionOrder = function (t) {
    t.shadowColor = "transparent";
    t.globalAlpha = 0.25;
    t.textAlign = "center";
    t.strokeStyle = "white";
    t.globalAlpha = 0.75;
    var e = (this || _global).visible_nodes;
    for (var a = 0; a < e.length; ++a) {
      var o = e[a];
      t.fillStyle = "black";
      t.fillRect(
        o.pos[0] - LiteGraph.NODE_TITLE_HEIGHT,
        o.pos[1] - LiteGraph.NODE_TITLE_HEIGHT,
        LiteGraph.NODE_TITLE_HEIGHT,
        LiteGraph.NODE_TITLE_HEIGHT
      );
      0 == o.order &&
        t.strokeRect(
          o.pos[0] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
          o.pos[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
          LiteGraph.NODE_TITLE_HEIGHT,
          LiteGraph.NODE_TITLE_HEIGHT
        );
      t.fillStyle = "#FFF";
      t.fillText(
        o.order,
        o.pos[0] + -0.5 * LiteGraph.NODE_TITLE_HEIGHT,
        o.pos[1] - 6
      );
    }
    t.globalAlpha = 1;
  };
  LGraphCanvas.prototype.drawNodeWidgets = function (t, e, a, o) {
    if (!t.widgets || !t.widgets.length) return 0;
    var r = t.size[0];
    var l = t.widgets;
    e += 2;
    var n = LiteGraph.NODE_WIDGET_HEIGHT;
    var s = (this || _global).ds.scale > 0.5;
    a.save();
    a.globalAlpha = (this || _global).editor_alpha;
    var u = LiteGraph.WIDGET_OUTLINE_COLOR;
    var h = LiteGraph.WIDGET_BGCOLOR;
    var p = LiteGraph.WIDGET_TEXT_COLOR;
    var _ = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR;
    var g = 15;
    for (var d = 0; d < l.length; ++d) {
      var c = l[d];
      var b = e;
      c.y && (b = c.y);
      c.last_y = b;
      a.strokeStyle = u;
      a.fillStyle = "#222";
      a.textAlign = "left";
      c.disabled && (a.globalAlpha *= 0.5);
      var f = c.width || r;
      switch (c.type) {
        case "button":
          if (c.clicked) {
            a.fillStyle = "#AAA";
            c.clicked = false;
            (this || _global).dirty_canvas = true;
          }
          a.fillRect(g, b, f - 2 * g, n);
          s && !c.disabled && a.strokeRect(g, b, f - 2 * g, n);
          if (s) {
            a.textAlign = "center";
            a.fillStyle = p;
            a.fillText(c.name, 0.5 * f, b + 0.7 * n);
          }
          break;
        case "toggle":
          a.textAlign = "left";
          a.strokeStyle = u;
          a.fillStyle = h;
          a.beginPath();
          s
            ? a.roundRect(g, b, f - 2 * g, n, [0.5 * n])
            : a.rect(g, b, f - 2 * g, n);
          a.fill();
          s && !c.disabled && a.stroke();
          a.fillStyle = c.value ? "#89A" : "#333";
          a.beginPath();
          a.arc(f - 2 * g, b + 0.5 * n, 0.36 * n, 0, 2 * Math.PI);
          a.fill();
          if (s) {
            a.fillStyle = _;
            null != c.name && a.fillText(c.name, 2 * g, b + 0.7 * n);
            a.fillStyle = c.value ? p : _;
            a.textAlign = "right";
            a.fillText(
              c.value ? c.options.on || "true" : c.options.off || "false",
              f - 40,
              b + 0.7 * n
            );
          }
          break;
        case "slider":
          a.fillStyle = h;
          a.fillRect(g, b, f - 2 * g, n);
          var m = c.options.max - c.options.min;
          var L = (c.value - c.options.min) / m;
          L < 0 && (L = 0);
          L > 1 && (L = 1);
          a.fillStyle = c.options.hasOwnProperty("slider_color")
            ? c.options.slider_color
            : o == c
            ? "#89A"
            : "#678";
          a.fillRect(g, b, L * (f - 2 * g), n);
          s && !c.disabled && a.strokeRect(g, b, f - 2 * g, n);
          if (c.marker) {
            var G = (c.marker - c.options.min) / m;
            G < 0 && (G = 0);
            G > 1 && (G = 1);
            a.fillStyle = c.options.hasOwnProperty("marker_color")
              ? c.options.marker_color
              : "#AA9";
            a.fillRect(g + G * (f - 2 * g), b, 2, n);
          }
          if (s) {
            a.textAlign = "center";
            a.fillStyle = p;
            a.fillText(
              c.name + "  " + Number(c.value).toFixed(3),
              0.5 * f,
              b + 0.7 * n
            );
          }
          break;
        case "number":
        case "combo":
          a.textAlign = "left";
          a.strokeStyle = u;
          a.fillStyle = h;
          a.beginPath();
          s
            ? a.roundRect(g, b, f - 2 * g, n, [0.5 * n])
            : a.rect(g, b, f - 2 * g, n);
          a.fill();
          if (s) {
            c.disabled || a.stroke();
            a.fillStyle = p;
            if (!c.disabled) {
              a.beginPath();
              a.moveTo(g + 16, b + 5);
              a.lineTo(g + 6, b + 0.5 * n);
              a.lineTo(g + 16, b + n - 5);
              a.fill();
              a.beginPath();
              a.moveTo(f - g - 16, b + 5);
              a.lineTo(f - g - 6, b + 0.5 * n);
              a.lineTo(f - g - 16, b + n - 5);
              a.fill();
            }
            a.fillStyle = _;
            a.fillText(c.name, 2 * g + 5, b + 0.7 * n);
            a.fillStyle = p;
            a.textAlign = "right";
            if ("number" == c.type)
              a.fillText(
                Number(c.value).toFixed(
                  void 0 !== c.options.precision ? c.options.precision : 3
                ),
                f - 2 * g - 20,
                b + 0.7 * n
              );
            else {
              var T = c.value;
              if (c.options.values) {
                var I = c.options.values;
                I.constructor === Function && (I = I());
                I && I.constructor !== Array && (T = I[c.value]);
              }
              a.fillText(T, f - 2 * g - 20, b + 0.7 * n);
            }
          }
          break;
        case "string":
        case "text":
          a.textAlign = "left";
          a.strokeStyle = u;
          a.fillStyle = h;
          a.beginPath();
          s
            ? a.roundRect(g, b, f - 2 * g, n, [0.5 * n])
            : a.rect(g, b, f - 2 * g, n);
          a.fill();
          if (s) {
            c.disabled || a.stroke();
            a.save();
            a.beginPath();
            a.rect(g, b, f - 2 * g, n);
            a.clip();
            a.fillStyle = _;
            null != c.name && a.fillText(c.name, 2 * g, b + 0.7 * n);
            a.fillStyle = p;
            a.textAlign = "right";
            a.fillText(String(c.value).substr(0, 30), f - 2 * g, b + 0.7 * n);
            a.restore();
          }
          break;
        default:
          c.draw && c.draw(a, t, f, b, n);
          break;
      }
      e += (c.computeSize ? c.computeSize(f)[1] : n) + 4;
      a.globalAlpha = (this || _global).editor_alpha;
    }
    a.restore();
    a.textAlign = "left";
  };
  LGraphCanvas.prototype.processNodeWidgets = function (
    node,
    pos,
    event,
    active_widget
  ) {
    if (!node.widgets || !node.widgets.length) return null;
    var x = pos[0] - node.pos[0];
    var y = pos[1] - node.pos[1];
    var width = node.size[0];
    var that = this || _global;
    var ref_window = this.getCanvasWindow();
    for (var i = 0; i < node.widgets.length; ++i) {
      var w = node.widgets[i];
      if (w && !w.disabled) {
        var widget_height = w.computeSize
          ? w.computeSize(width)[1]
          : LiteGraph.NODE_WIDGET_HEIGHT;
        var widget_width = w.width || width;
        if (
          w == active_widget ||
          !(
            x < 6 ||
            x > widget_width - 12 ||
            y < w.last_y ||
            y > w.last_y + widget_height ||
            void 0 === w.last_y
          )
        ) {
          var old_value = w.value;
          switch (w.type) {
            case "button":
              if (event.type === LiteGraph.pointerevents_method + "down") {
                w.callback &&
                  setTimeout(function () {
                    w.callback(w, that, node, pos, event);
                  }, 20);
                w.clicked = true;
                (this || _global).dirty_canvas = true;
              }
              break;
            case "slider":
              var range = w.options.max - w.options.min;
              var nvalue = Math.clamp((x - 15) / (widget_width - 30), 0, 1);
              if (w.options.read_only) break;
              w.value =
                w.options.min + (w.options.max - w.options.min) * nvalue;
              w.callback &&
                setTimeout(function () {
                  inner_value_change(w, w.value);
                }, 20);
              (this || _global).dirty_canvas = true;
              break;
            case "number":
            case "combo":
              var old_value = w.value;
              if (
                event.type == LiteGraph.pointerevents_method + "move" &&
                "number" == w.type
              ) {
                event.deltaX &&
                  (w.value += 0.1 * event.deltaX * (w.options.step || 1));
                null != w.options.min &&
                  w.value < w.options.min &&
                  (w.value = w.options.min);
                null != w.options.max &&
                  w.value > w.options.max &&
                  (w.value = w.options.max);
              } else if (
                event.type ==
                LiteGraph.pointerevents_method + "down"
              ) {
                var values = w.options.values;
                values &&
                  values.constructor === Function &&
                  (values = w.options.values(w, node));
                var values_list = null;
                "number" != w.type &&
                  (values_list =
                    values.constructor === Array
                      ? values
                      : Object.keys(values));
                var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
                if ("number" == w.type) {
                  w.value += 0.1 * delta * (w.options.step || 1);
                  null != w.options.min &&
                    w.value < w.options.min &&
                    (w.value = w.options.min);
                  null != w.options.max &&
                    w.value > w.options.max &&
                    (w.value = w.options.max);
                } else if (delta) {
                  var index = -1;
                  (this || _global).last_mouseclick = 0;
                  index =
                    values.constructor === Object
                      ? values_list.indexOf(String(w.value)) + delta
                      : values_list.indexOf(w.value) + delta;
                  index >= values_list.length &&
                    (index = values_list.length - 1);
                  index < 0 && (index = 0);
                  values.constructor === Array
                    ? (w.value = values[index])
                    : (w.value = index);
                } else {
                  var text_values =
                    values != values_list ? Object.values(values) : values;
                  var menu = new LiteGraph.ContextMenu(
                    text_values,
                    {
                      scale: Math.max(1, (this || _global).ds.scale),
                      event: event,
                      className: "dark",
                      callback: inner_clicked.bind(w),
                    },
                    ref_window
                  );
                  function inner_clicked(t, e, a) {
                    values != values_list && (t = text_values.indexOf(t));
                    (this || _global).value = t;
                    inner_value_change(this || _global, t);
                    that.dirty_canvas = true;
                    return false;
                  }
                }
              } else if (
                event.type == LiteGraph.pointerevents_method + "up" &&
                "number" == w.type
              ) {
                var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
                event.click_time < 200 &&
                  0 == delta &&
                  this.prompt(
                    "Value",
                    w.value,
                    function (v) {
                      if (/^[0-9+\-*/()\s]+$/.test(v))
                        try {
                          v = eval(v);
                        } catch (t) {}
                      (this || _global).value = Number(v);
                      inner_value_change(
                        this || _global,
                        (this || _global).value
                      );
                    }.bind(w),
                    event
                  );
              }
              old_value != w.value &&
                setTimeout(
                  function () {
                    inner_value_change(
                      this || _global,
                      (this || _global).value
                    );
                  }.bind(w),
                  20
                );
              (this || _global).dirty_canvas = true;
              break;
            case "toggle":
              if (event.type == LiteGraph.pointerevents_method + "down") {
                w.value = !w.value;
                setTimeout(function () {
                  inner_value_change(w, w.value);
                }, 20);
              }
              break;
            case "string":
            case "text":
              event.type == LiteGraph.pointerevents_method + "down" &&
                this.prompt(
                  "Value",
                  w.value,
                  function (t) {
                    inner_value_change(this || _global, t);
                  }.bind(w),
                  event,
                  !!w.options && w.options.multiline
                );
              break;
            default:
              w.mouse &&
                ((this || _global).dirty_canvas = w.mouse(event, [x, y], node));
              break;
          }
          if (old_value != w.value) {
            node.onWidgetChanged &&
              node.onWidgetChanged(w.name, w.value, old_value, w);
            node.graph._version++;
          }
          return w;
        }
      }
    }
    function inner_value_change(t, e) {
      "number" == t.type && (e = Number(e));
      t.value = e;
      t.options &&
        t.options.property &&
        void 0 !== node.properties[t.options.property] &&
        node.setProperty(t.options.property, e);
      t.callback && t.callback(t.value, that, node, pos, event);
    }
    return null;
  };
  LGraphCanvas.prototype.drawGroups = function (t, e) {
    if ((this || _global).graph) {
      var a = (this || _global).graph._groups;
      e.save();
      e.globalAlpha = 0.5 * (this || _global).editor_alpha;
      for (var o = 0; o < a.length; ++o) {
        var r = a[o];
        if (overlapBounding((this || _global).visible_area, r._bounding)) {
          e.fillStyle = r.color || "#335";
          e.strokeStyle = r.color || "#335";
          var l = r._pos;
          var n = r._size;
          e.globalAlpha = 0.25 * (this || _global).editor_alpha;
          e.beginPath();
          e.rect(l[0] + 0.5, l[1] + 0.5, n[0], n[1]);
          e.fill();
          e.globalAlpha = (this || _global).editor_alpha;
          e.stroke();
          e.beginPath();
          e.moveTo(l[0] + n[0], l[1] + n[1]);
          e.lineTo(l[0] + n[0] - 10, l[1] + n[1]);
          e.lineTo(l[0] + n[0], l[1] + n[1] - 10);
          e.fill();
          var s = r.font_size || LiteGraph.DEFAULT_GROUP_FONT_SIZE;
          e.font = s + "px Arial";
          e.textAlign = "left";
          e.fillText(r.title, l[0] + 4, l[1] + s);
        }
      }
      e.restore();
    }
  };
  LGraphCanvas.prototype.adjustNodesSize = function () {
    var t = (this || _global).graph._nodes;
    for (var e = 0; e < t.length; ++e) t[e].size = t[e].computeSize();
    this.setDirty(true, true);
  };
  LGraphCanvas.prototype.resize = function (t, e) {
    if (!t && !e) {
      var a = (this || _global).canvas.parentNode;
      t = a.offsetWidth;
      e = a.offsetHeight;
    }
    if (
      (this || _global).canvas.width != t ||
      (this || _global).canvas.height != e
    ) {
      (this || _global).canvas.width = t;
      (this || _global).canvas.height = e;
      (this || _global).bgcanvas.width = (this || _global).canvas.width;
      (this || _global).bgcanvas.height = (this || _global).canvas.height;
      this.setDirty(true, true);
    }
  };
  LGraphCanvas.prototype.switchLiveMode = function (t) {
    if (t) {
      var e = this || _global;
      var a = (this || _global).live_mode ? 1.1 : 0.9;
      if ((this || _global).live_mode) {
        (this || _global).live_mode = false;
        (this || _global).editor_alpha = 0.1;
      }
      var o = setInterval(function () {
        e.editor_alpha *= a;
        e.dirty_canvas = true;
        e.dirty_bgcanvas = true;
        if (a < 1 && e.editor_alpha < 0.01) {
          clearInterval(o);
          a < 1 && (e.live_mode = true);
        }
        if (a > 1 && e.editor_alpha > 0.99) {
          clearInterval(o);
          e.editor_alpha = 1;
        }
      }, 1);
    } else {
      (this || _global).live_mode = !(this || _global).live_mode;
      (this || _global).dirty_canvas = true;
      (this || _global).dirty_bgcanvas = true;
    }
  };
  LGraphCanvas.prototype.onNodeSelectionChange = function (t) {};
  LGraphCanvas.onGroupAdd = function (t, e, a) {
    var o = LGraphCanvas.active_canvas;
    o.getCanvasWindow();
    var r = new LiteGraph.LGraphGroup();
    r.pos = o.convertEventToCanvasOffset(a);
    o.graph.add(r);
  };
  LGraphCanvas.onMenuAdd = function (t, e, a, o, r) {
    var l = LGraphCanvas.active_canvas;
    var n = l.getCanvasWindow();
    var s = l.graph;
    if (s) {
      inner_onMenuAdded("", o);
      return false;
    }
    function inner_onMenuAdded(t, e) {
      var o = LiteGraph.getNodeTypesCategories(l.filter || s.filter).filter(
        function (e) {
          return e.startsWith(t);
        }
      );
      var u = [];
      o.map(function (e) {
        if (e) {
          var a = new RegExp("^(" + t + ")");
          var o = e.replace(a, "").split("/")[0];
          var r = "" === t ? o + "/" : t + o + "/";
          var l = o;
          -1 != l.indexOf("::") && (l = l.split("::")[1]);
          var n = u.findIndex(function (t) {
            return t.value === r;
          });
          -1 === n &&
            u.push({
              value: r,
              content: l,
              has_submenu: true,
              callback: function (t, e, a, o) {
                inner_onMenuAdded(t.value, o);
              },
            });
        }
      });
      var h = LiteGraph.getNodeTypesInCategory(
        t.slice(0, -1),
        l.filter || s.filter
      );
      h.map(function (t) {
        if (!t.skip_list) {
          var e = {
            value: t.type,
            content: t.title,
            has_submenu: false,
            callback: function (t, e, a, o) {
              var n = o.getFirstEvent();
              l.graph.beforeChange();
              var s = LiteGraph.createNode(t.value);
              if (s) {
                s.pos = l.convertEventToCanvasOffset(n);
                l.graph.add(s);
              }
              r && r(s);
              l.graph.afterChange();
            },
          };
          u.push(e);
        }
      });
      new LiteGraph.ContextMenu(u, { event: a, parentMenu: e }, n);
    }
  };
  LGraphCanvas.onMenuCollapseAll = function () {};
  LGraphCanvas.onMenuNodeEdit = function () {};
  LGraphCanvas.showMenuNodeOptionalInputs = function (t, e, a, o, r) {
    if (r) {
      var l = this || _global;
      var n = LGraphCanvas.active_canvas;
      var s = n.getCanvasWindow();
      e = r.optional_inputs;
      r.onGetInputs && (e = r.onGetInputs());
      var u = [];
      if (e)
        for (var h = 0; h < e.length; h++) {
          var p = e[h];
          if (p) {
            var _ = p[0];
            p[2] || (p[2] = {});
            p[2].label && (_ = p[2].label);
            p[2].removable = true;
            var g = { content: _, value: p };
            p[1] == LiteGraph.ACTION && (g.className = "event");
            u.push(g);
          } else u.push(null);
        }
      if (r.onMenuNodeInputs) {
        var d = r.onMenuNodeInputs(u);
        d && (u = d);
      }
      if (u.length) {
        new LiteGraph.ContextMenu(
          u,
          { event: a, callback: inner_clicked, parentMenu: o, node: r },
          s
        );
        return false;
      }
      console.log("no input entries");
    }
    function inner_clicked(t, e, a) {
      if (r) {
        t.callback && t.callback.call(l, r, t, e, a);
        if (t.value) {
          r.graph.beforeChange();
          r.addInput(t.value[0], t.value[1], t.value[2]);
          r.onNodeInputAdd && r.onNodeInputAdd(t.value);
          r.setDirtyCanvas(true, true);
          r.graph.afterChange();
        }
      }
    }
  };
  LGraphCanvas.showMenuNodeOptionalOutputs = function (t, e, a, o, r) {
    if (r) {
      var l = this || _global;
      var n = LGraphCanvas.active_canvas;
      var s = n.getCanvasWindow();
      e = r.optional_outputs;
      r.onGetOutputs && (e = r.onGetOutputs());
      var u = [];
      if (e)
        for (var h = 0; h < e.length; h++) {
          var p = e[h];
          if (p) {
            if (
              !r.flags ||
              !r.flags.skip_repeated_outputs ||
              -1 == r.findOutputSlot(p[0])
            ) {
              var _ = p[0];
              p[2] || (p[2] = {});
              p[2].label && (_ = p[2].label);
              p[2].removable = true;
              var g = { content: _, value: p };
              p[1] == LiteGraph.EVENT && (g.className = "event");
              u.push(g);
            }
          } else u.push(null);
        }
      (this || _global).onMenuNodeOutputs && (u = this.onMenuNodeOutputs(u));
      LiteGraph.do_add_triggers_slots &&
        -1 == r.findOutputSlot("onExecuted") &&
        u.push({
          content: "On Executed",
          value: ["onExecuted", LiteGraph.EVENT, { nameLocked: true }],
          className: "event",
        });
      if (r.onMenuNodeOutputs) {
        var d = r.onMenuNodeOutputs(u);
        d && (u = d);
      }
      if (u.length) {
        new LiteGraph.ContextMenu(
          u,
          { event: a, callback: inner_clicked, parentMenu: o, node: r },
          s
        );
        return false;
      }
    }
    function inner_clicked(t, e, a) {
      if (r) {
        t.callback && t.callback.call(l, r, t, e, a);
        if (t.value) {
          var n = t.value[1];
          if (n && (n.constructor === Object || n.constructor === Array)) {
            var s = [];
            for (var u in n) s.push({ content: u, value: n[u] });
            new LiteGraph.ContextMenu(s, {
              event: e,
              callback: inner_clicked,
              parentMenu: o,
              node: r,
            });
            return false;
          }
          r.graph.beforeChange();
          r.addOutput(t.value[0], t.value[1], t.value[2]);
          r.onNodeOutputAdd && r.onNodeOutputAdd(t.value);
          r.setDirtyCanvas(true, true);
          r.graph.afterChange();
        }
      }
    }
  };
  LGraphCanvas.onShowMenuNodeProperties = function (t, e, a, o, r) {
    if (r && r.properties) {
      var l = LGraphCanvas.active_canvas;
      var n = l.getCanvasWindow();
      var s = [];
      for (var u in r.properties) {
        t = void 0 !== r.properties[u] ? r.properties[u] : " ";
        "object" == typeof t && (t = JSON.stringify(t));
        var h = r.getPropertyInfo(u);
        ("enum" != h.type && "combo" != h.type) ||
          (t = LGraphCanvas.getPropertyPrintableValue(t, h.values));
        t = LGraphCanvas.decodeHTML(t);
        s.push({
          content:
            "<span class='property_name'>" +
            (h.label ? h.label : u) +
            "</span><span class='property_value'>" +
            t +
            "</span>",
          value: u,
        });
      }
      if (s.length) {
        new LiteGraph.ContextMenu(
          s,
          {
            event: a,
            callback: inner_clicked,
            parentMenu: o,
            allow_html: true,
            node: r,
          },
          n
        );
        return false;
      }
    }
    function inner_clicked(t, e, a, o) {
      if (r) {
        var n = this.getBoundingClientRect();
        l.showEditPropertyValue(r, t.value, { position: [n.left, n.top] });
      }
    }
  };
  LGraphCanvas.decodeHTML = function (t) {
    var e = document.createElement("div");
    e.innerText = t;
    return e.innerHTML;
  };
  LGraphCanvas.onMenuResizeNode = function (t, e, a, o, r) {
    if (r) {
      var fApplyMultiNode = function (t) {
        t.size = t.computeSize();
        t.onResize && t.onResize(t.size);
      };
      var l = LGraphCanvas.active_canvas;
      if (!l.selected_nodes || Object.keys(l.selected_nodes).length <= 1)
        fApplyMultiNode(r);
      else for (var n in l.selected_nodes) fApplyMultiNode(l.selected_nodes[n]);
      r.setDirtyCanvas(true, true);
    }
  };
  LGraphCanvas.prototype.showLinkMenu = function (t, e) {
    var a = this || _global;
    var o = a.graph.getNodeById(t.origin_id);
    var r = a.graph.getNodeById(t.target_id);
    var l = false;
    o &&
      o.outputs &&
      o.outputs[t.origin_slot] &&
      (l = o.outputs[t.origin_slot].type);
    var n = false;
    r &&
      r.outputs &&
      r.outputs[t.target_slot] &&
      (n = r.inputs[t.target_slot].type);
    var s = ["Add Node", null, "Delete", null];
    var u = new LiteGraph.ContextMenu(s, {
      event: e,
      title: null != t.data ? t.data.constructor.name : null,
      callback: inner_clicked,
    });
    function inner_clicked(e, s, h) {
      switch (e) {
        case "Add Node":
          LGraphCanvas.onMenuAdd(null, null, h, u, function (e) {
            if (
              e.inputs &&
              e.inputs.length &&
              e.outputs &&
              e.outputs.length &&
              o.connectByType(t.origin_slot, e, l)
            ) {
              e.connectByType(t.target_slot, r, n);
              e.pos[0] -= 0.5 * e.size[0];
            }
          });
          break;
        case "Delete":
          a.graph.removeLink(t.id);
          break;
        default:
      }
    }
    return false;
  };
  LGraphCanvas.prototype.createDefaultNodeForSlot = function (t) {
    t = t || {};
    var e = Object.assign(
      {
        nodeFrom: null,
        slotFrom: null,
        nodeTo: null,
        slotTo: null,
        position: [],
        nodeType: null,
        posAdd: [0, 0],
        posSizeFix: [0, 0],
      },
      t
    );
    var a = this || _global;
    var o = e.nodeFrom && null !== e.slotFrom;
    var r = !o && e.nodeTo && null !== e.slotTo;
    if (!o && !r) {
      console.warn(
        "No data passed to createDefaultNodeForSlot " +
          e.nodeFrom +
          " " +
          e.slotFrom +
          " " +
          e.nodeTo +
          " " +
          e.slotTo
      );
      return false;
    }
    if (!e.nodeType) {
      console.warn("No type to createDefaultNodeForSlot");
      return false;
    }
    var l = o ? e.nodeFrom : e.nodeTo;
    var n = o ? e.slotFrom : e.slotTo;
    var s = false;
    switch (typeof n) {
      case "string":
        s = o ? l.findOutputSlot(n, false) : l.findInputSlot(n, false);
        n = o ? l.outputs[n] : l.inputs[n];
        break;
      case "object":
        s = o ? l.findOutputSlot(n.name) : l.findInputSlot(n.name);
        break;
      case "number":
        s = n;
        n = o ? l.outputs[n] : l.inputs[n];
        break;
      case "undefined":
      default:
        console.warn("Cant get slot information " + n);
        return false;
    }
    (false !== n && false !== s) ||
      console.warn("createDefaultNodeForSlot bad slotX " + n + " " + s);
    var u = n.type == LiteGraph.EVENT ? "_event_" : n.type;
    var h = o
      ? LiteGraph.slot_types_default_out
      : LiteGraph.slot_types_default_in;
    if (h && h[u]) {
      null !== n.link;
      _global.nodeNewType = false;
      if ("object" == typeof h[u] || "array" == typeof h[u]) {
        for (var p in h[u])
          if (e.nodeType == h[u][p] || "AUTO" == e.nodeType) {
            _global.nodeNewType = h[u][p];
            break;
          }
      } else
        (e.nodeType != h[u] && "AUTO" != e.nodeType) ||
          (_global.nodeNewType = h[u]);
      if (nodeNewType) {
        var _ = false;
        if ("object" == typeof nodeNewType && nodeNewType.node) {
          _ = nodeNewType;
          _global.nodeNewType = nodeNewType.node;
        }
        var g = LiteGraph.createNode(nodeNewType);
        if (g) {
          if (_) {
            if (_.properties)
              for (var d in _.properties) g.addProperty(d, _.properties[d]);
            if (_.inputs) {
              g.inputs = [];
              for (var d in _.inputs)
                g.addOutput(_.inputs[d][0], _.inputs[d][1]);
            }
            if (_.outputs) {
              g.outputs = [];
              for (var d in _.outputs)
                g.addOutput(_.outputs[d][0], _.outputs[d][1]);
            }
            _.title && (g.title = _.title);
            _.json && g.configure(_.json);
          }
          a.graph.add(g);
          g.pos = [
            e.position[0] +
              e.posAdd[0] +
              (e.posSizeFix[0] ? e.posSizeFix[0] * g.size[0] : 0),
            e.position[1] +
              e.posAdd[1] +
              (e.posSizeFix[1] ? e.posSizeFix[1] * g.size[1] : 0),
          ];
          o
            ? e.nodeFrom.connectByType(s, g, u)
            : e.nodeTo.connectByTypeOutput(s, g, u);
          o && r;
          return true;
        }
        console.log("failed creating " + nodeNewType);
      }
    }
    return false;
  };
  LGraphCanvas.prototype.showConnectionMenu = function (t) {
    t = t || {};
    var e = Object.assign(
      { nodeFrom: null, slotFrom: null, nodeTo: null, slotTo: null, e: null },
      t
    );
    var a = this || _global;
    var o = e.nodeFrom && e.slotFrom;
    var r = !o && e.nodeTo && e.slotTo;
    if (!o && !r) {
      console.warn("No data passed to showConnectionMenu");
      return false;
    }
    var l = o ? e.nodeFrom : e.nodeTo;
    var n = o ? e.slotFrom : e.slotTo;
    var s = false;
    switch (typeof n) {
      case "string":
        s = o ? l.findOutputSlot(n, false) : l.findInputSlot(n, false);
        n = o ? l.outputs[n] : l.inputs[n];
        break;
      case "object":
        s = o ? l.findOutputSlot(n.name) : l.findInputSlot(n.name);
        break;
      case "number":
        s = n;
        n = o ? l.outputs[n] : l.inputs[n];
        break;
      default:
        console.warn("Cant get slot information " + n);
        return false;
    }
    var u = ["Add Node", null];
    if (a.allow_searchbox) {
      u.push("Search");
      u.push(null);
    }
    var h = n.type == LiteGraph.EVENT ? "_event_" : n.type;
    var p = o
      ? LiteGraph.slot_types_default_out
      : LiteGraph.slot_types_default_in;
    if (p && p[h])
      if ("object" == typeof p[h] || "array" == typeof p[h])
        for (var _ in p[h]) u.push(p[h][_]);
      else u.push(p[h]);
    var g = new LiteGraph.ContextMenu(u, {
      event: e.e,
      title:
        (n && "" != n.name ? n.name + (h ? " | " : "") : "") +
        (n && h ? h : ""),
      callback: inner_clicked,
    });
    function inner_clicked(t, r, l) {
      switch (t) {
        case "Add Node":
          LGraphCanvas.onMenuAdd(null, null, l, g, function (t) {
            o
              ? e.nodeFrom.connectByType(s, t, h)
              : e.nodeTo.connectByTypeOutput(s, t, h);
          });
          break;
        case "Search":
          o
            ? a.showSearchBox(l, {
                node_from: e.nodeFrom,
                slot_from: n,
                type_filter_in: h,
              })
            : a.showSearchBox(l, {
                node_to: e.nodeTo,
                slot_from: n,
                type_filter_out: h,
              });
          break;
        default:
          var u = a.createDefaultNodeForSlot(
            Object.assign(e, {
              position: [e.e.canvasX, e.e.canvasY],
              nodeType: t,
            })
          );
          u;
          break;
      }
    }
    return false;
  };
  LGraphCanvas.onShowPropertyEditor = function (t, e, a, o, r) {
    var l = t.property || "title";
    var n = r[l];
    var s = document.createElement("div");
    s.is_modified = false;
    s.className = "graphdialog";
    s.innerHTML =
      "<span class='name'></span><input autofocus type='text' class='value'/><button>OK</button>";
    s.close = function () {
      s.parentNode && s.parentNode.removeChild(s);
    };
    var u = s.querySelector(".name");
    u.innerText = l;
    var h = s.querySelector(".value");
    if (h) {
      h.value = n;
      h.addEventListener("blur", function (t) {
        this.focus();
      });
      h.addEventListener("keydown", function (t) {
        s.is_modified = true;
        if (27 == t.keyCode) s.close();
        else if (13 == t.keyCode) inner();
        else if (13 != t.keyCode && "textarea" != t.target.localName) return;
        t.preventDefault();
        t.stopPropagation();
      });
    }
    var p = LGraphCanvas.active_canvas;
    var _ = p.canvas;
    var g = _.getBoundingClientRect();
    var d = -20;
    var c = -20;
    if (g) {
      d -= g.left;
      c -= g.top;
    }
    if (event) {
      s.style.left = event.clientX + d + "px";
      s.style.top = event.clientY + c + "px";
    } else {
      s.style.left = 0.5 * _.width + d + "px";
      s.style.top = 0.5 * _.height + c + "px";
    }
    var b = s.querySelector("button");
    b.addEventListener("click", inner);
    _.parentNode.appendChild(s);
    h && h.focus();
    var f = null;
    s.addEventListener("mouseleave", function (t) {
      LiteGraph.dialog_close_on_mouse_leave &&
        !s.is_modified &&
        LiteGraph.dialog_close_on_mouse_leave &&
        (f = setTimeout(s.close, LiteGraph.dialog_close_on_mouse_leave_delay));
    });
    s.addEventListener("mouseenter", function (t) {
      LiteGraph.dialog_close_on_mouse_leave && f && clearTimeout(f);
    });
    function inner() {
      h && setValue(h.value);
    }
    function setValue(e) {
      "Number" == t.type
        ? (e = Number(e))
        : "Boolean" == t.type && (e = Boolean(e));
      r[l] = e;
      s.parentNode && s.parentNode.removeChild(s);
      r.setDirtyCanvas(true, true);
    }
  };
  LGraphCanvas.prototype.prompt = function (t, e, a, o, r) {
    var l = this || _global;
    t = t || "";
    var n = document.createElement("div");
    n.is_modified = false;
    n.className = "graphdialog rounded";
    n.innerHTML = r
      ? "<span class='name'></span> <textarea autofocus class='value'></textarea><button class='rounded'>OK</button>"
      : "<span class='name'></span> <input autofocus type='text' class='value'/><button class='rounded'>OK</button>";
    n.close = function () {
      l.prompt_box = null;
      n.parentNode && n.parentNode.removeChild(n);
    };
    var s = LGraphCanvas.active_canvas;
    var u = s.canvas;
    u.parentNode.appendChild(n);
    (this || _global).ds.scale > 1 &&
      (n.style.transform = "scale(" + (this || _global).ds.scale + ")");
    var h = null;
    var p = false;
    LiteGraph.pointerListenerAdd(n, "leave", function (t) {
      p ||
        (LiteGraph.dialog_close_on_mouse_leave &&
          !n.is_modified &&
          LiteGraph.dialog_close_on_mouse_leave &&
          (h = setTimeout(
            n.close,
            LiteGraph.dialog_close_on_mouse_leave_delay
          )));
    });
    LiteGraph.pointerListenerAdd(n, "enter", function (t) {
      LiteGraph.dialog_close_on_mouse_leave && h && clearTimeout(h);
    });
    var _ = n.querySelectorAll("select");
    _ &&
      _.forEach(function (t) {
        t.addEventListener("click", function (t) {
          p++;
        });
        t.addEventListener("blur", function (t) {
          p = 0;
        });
        t.addEventListener("change", function (t) {
          p = -1;
        });
      });
    l.prompt_box && l.prompt_box.close();
    l.prompt_box = n;
    var g = n.querySelector(".name");
    g.innerText = t;
    var d = n.querySelector(".value");
    d.value = e;
    var c = d;
    c.addEventListener("keydown", function (t) {
      n.is_modified = true;
      if (27 == t.keyCode) n.close();
      else {
        if (13 != t.keyCode || "textarea" == t.target.localName) return;
        a && a((this || _global).value);
        n.close();
      }
      t.preventDefault();
      t.stopPropagation();
    });
    var b = n.querySelector("button");
    b.addEventListener("click", function (t) {
      a && a(c.value);
      l.setDirty(true);
      n.close();
    });
    var f = u.getBoundingClientRect();
    var m = -20;
    var L = -20;
    if (f) {
      m -= f.left;
      L -= f.top;
    }
    if (o) {
      n.style.left = o.clientX + m + "px";
      n.style.top = o.clientY + L + "px";
    } else {
      n.style.left = 0.5 * u.width + m + "px";
      n.style.top = 0.5 * u.height + L + "px";
    }
    setTimeout(function () {
      c.focus();
    }, 10);
    return n;
  };
  LGraphCanvas.search_limit = -1;
  LGraphCanvas.prototype.showSearchBox = function (t, e) {
    var a = {
      slot_from: null,
      node_from: null,
      node_to: null,
      do_type_filter: LiteGraph.search_filter_enabled,
      type_filter_in: false,
      type_filter_out: false,
      show_general_if_none_on_typefilter: true,
      show_general_after_typefiltered: true,
      hide_on_mouse_leave: LiteGraph.search_hide_on_mouse_leave,
      show_all_if_empty: true,
      show_all_on_open: LiteGraph.search_show_all_on_open,
    };
    e = Object.assign(a, e || {});
    var o = this || _global;
    var r = LGraphCanvas.active_canvas;
    var l = r.canvas;
    var n = l.ownerDocument || document;
    var s = document.createElement("div");
    s.className = "litegraph litesearchbox graphdialog rounded";
    s.innerHTML =
      "<span class='name'>Search</span> <input autofocus type='text' class='value rounded'/>";
    if (e.do_type_filter) {
      s.innerHTML +=
        "<select class='slot_in_type_filter'><option value=''></option></select>";
      s.innerHTML +=
        "<select class='slot_out_type_filter'><option value=''></option></select>";
    }
    s.innerHTML += "<div class='helper'></div>";
    if (n.fullscreenElement) n.fullscreenElement.appendChild(s);
    else {
      n.body.appendChild(s);
      n.body.style.overflow = "hidden";
    }
    if (e.do_type_filter) {
      var u = s.querySelector(".slot_in_type_filter");
      var h = s.querySelector(".slot_out_type_filter");
    }
    s.close = function () {
      o.search_box = null;
      this.blur();
      l.focus();
      n.body.style.overflow = "";
      setTimeout(function () {
        o.canvas.focus();
      }, 20);
      s.parentNode && s.parentNode.removeChild(s);
    };
    (this || _global).ds.scale > 1 &&
      (s.style.transform = "scale(" + (this || _global).ds.scale + ")");
    if (e.hide_on_mouse_leave) {
      var p = false;
      var _ = null;
      LiteGraph.pointerListenerAdd(s, "enter", function (t) {
        if (_) {
          clearTimeout(_);
          _ = null;
        }
      });
      LiteGraph.pointerListenerAdd(s, "leave", function (t) {
        p ||
          (_ = setTimeout(function () {
            s.close();
          }, 500));
      });
      if (e.do_type_filter) {
        u.addEventListener("click", function (t) {
          p++;
        });
        u.addEventListener("blur", function (t) {
          p = 0;
        });
        u.addEventListener("change", function (t) {
          p = -1;
        });
        h.addEventListener("click", function (t) {
          p++;
        });
        h.addEventListener("blur", function (t) {
          p = 0;
        });
        h.addEventListener("change", function (t) {
          p = -1;
        });
      }
    }
    o.search_box && o.search_box.close();
    o.search_box = s;
    var g = s.querySelector(".helper");
    var d = null;
    var c = null;
    var b = null;
    var f = s.querySelector("input");
    if (f) {
      f.addEventListener("blur", function (t) {
        this.focus();
      });
      f.addEventListener("keydown", function (t) {
        if (38 == t.keyCode) changeSelection(false);
        else if (40 == t.keyCode) changeSelection(true);
        else if (27 == t.keyCode) s.close();
        else {
          if (13 != t.keyCode) {
            c && clearInterval(c);
            c = setTimeout(refreshHelper, 250);
            return;
          }
          b ? select(b.innerHTML) : d ? select(d) : s.close();
        }
        t.preventDefault();
        t.stopPropagation();
        t.stopImmediatePropagation();
        return true;
      });
    }
    if (e.do_type_filter) {
      if (u) {
        var m = LiteGraph.slot_types_in;
        var L = m.length;
        (e.type_filter_in != LiteGraph.EVENT &&
          e.type_filter_in != LiteGraph.ACTION) ||
          (e.type_filter_in = "_event_");
        for (var G = 0; G < L; G++) {
          var T = document.createElement("option");
          T.value = m[G];
          T.innerHTML = m[G];
          u.appendChild(T);
          false !== e.type_filter_in &&
            (e.type_filter_in + "").toLowerCase() ==
              (m[G] + "").toLowerCase() &&
            (T.selected = true);
        }
        u.addEventListener("change", function () {
          refreshHelper();
        });
      }
      if (h) {
        m = LiteGraph.slot_types_out;
        L = m.length;
        (e.type_filter_out != LiteGraph.EVENT &&
          e.type_filter_out != LiteGraph.ACTION) ||
          (e.type_filter_out = "_event_");
        for (G = 0; G < L; G++) {
          T = document.createElement("option");
          T.value = m[G];
          T.innerHTML = m[G];
          h.appendChild(T);
          false !== e.type_filter_out &&
            (e.type_filter_out + "").toLowerCase() ==
              (m[G] + "").toLowerCase() &&
            (T.selected = true);
        }
        h.addEventListener("change", function () {
          refreshHelper();
        });
      }
    }
    var I = l.getBoundingClientRect();
    var E = (t ? t.clientX : I.left + 0.5 * I.width) - 80;
    var D = (t ? t.clientY : I.top + 0.5 * I.height) - 20;
    s.style.left = E + "px";
    s.style.top = D + "px";
    t.layerY > I.height - 200 &&
      (g.style.maxHeight = I.height - t.layerY - 20 + "px");
    f.focus();
    e.show_all_on_open && refreshHelper();
    function select(a) {
      if (a)
        if (o.onSearchBoxSelection) o.onSearchBoxSelection(a, t, r);
        else {
          var l = LiteGraph.searchbox_extras[a.toLowerCase()];
          l && (a = l.type);
          r.graph.beforeChange();
          var n = LiteGraph.createNode(a);
          if (n) {
            n.pos = r.convertEventToCanvasOffset(t);
            r.graph.add(n, false);
          }
          if (l && l.data) {
            if (l.data.properties)
              for (var u in l.data.properties)
                n.addProperty(u, l.data.properties[u]);
            if (l.data.inputs) {
              n.inputs = [];
              for (var u in l.data.inputs)
                n.addOutput(l.data.inputs[u][0], l.data.inputs[u][1]);
            }
            if (l.data.outputs) {
              n.outputs = [];
              for (var u in l.data.outputs)
                n.addOutput(l.data.outputs[u][0], l.data.outputs[u][1]);
            }
            l.data.title && (n.title = l.data.title);
            l.data.json && n.configure(l.data.json);
          }
          if (e.node_from) {
            var h = false;
            switch (typeof e.slot_from) {
              case "string":
                h = e.node_from.findOutputSlot(e.slot_from);
                break;
              case "object":
                h = e.slot_from.name
                  ? e.node_from.findOutputSlot(e.slot_from.name)
                  : -1;
                -1 == h &&
                  "undefined" !== typeof e.slot_from.slot_index &&
                  (h = e.slot_from.slot_index);
                break;
              case "number":
                h = e.slot_from;
                break;
              default:
                h = 0;
            }
            void 0 !== typeof e.node_from.outputs[h] &&
              false !== h &&
              h > -1 &&
              e.node_from.connectByType(h, n, e.node_from.outputs[h].type);
          }
          if (e.node_to) {
            h = false;
            switch (typeof e.slot_from) {
              case "string":
                h = e.node_to.findInputSlot(e.slot_from);
                break;
              case "object":
                h = e.slot_from.name
                  ? e.node_to.findInputSlot(e.slot_from.name)
                  : -1;
                -1 == h &&
                  "undefined" !== typeof e.slot_from.slot_index &&
                  (h = e.slot_from.slot_index);
                break;
              case "number":
                h = e.slot_from;
                break;
              default:
                h = 0;
            }
            void 0 !== typeof e.node_to.inputs[h] &&
              false !== h &&
              h > -1 &&
              e.node_to.connectByTypeOutput(h, n, e.node_to.inputs[h].type);
          }
          r.graph.afterChange();
        }
      s.close();
    }
    function changeSelection(t) {
      var e = b;
      b && b.classList.remove("selected");
      if (b) {
        b = t ? b.nextSibling : b.previousSibling;
        b || (b = e);
      } else b = t ? g.childNodes[0] : g.childNodes[g.childNodes.length];
      if (b) {
        b.classList.add("selected");
        b.scrollIntoView({ block: "end", behavior: "smooth" });
      }
    }
    function refreshHelper() {
      c = null;
      var t = f.value;
      d = null;
      g.innerHTML = "";
      if (t || e.show_all_if_empty)
        if (o.onSearchBox) {
          var a = o.onSearchBox(g, t, r);
          if (a) for (var l = 0; l < a.length; ++l) addResult(a[l]);
        } else {
          var n = 0;
          t = t.toLowerCase();
          var s = r.filter || r.graph.filter;
          if (e.do_type_filter && o.search_box) {
            var u = o.search_box.querySelector(".slot_in_type_filter");
            var h = o.search_box.querySelector(".slot_out_type_filter");
          } else {
            u = false;
            h = false;
          }
          for (var l in LiteGraph.searchbox_extras) {
            var p = LiteGraph.searchbox_extras[l];
            if (
              (e.show_all_if_empty && !t) ||
              -1 !== p.desc.toLowerCase().indexOf(t)
            ) {
              var _ = LiteGraph.registered_node_types[p.type];
              if ((!_ || _.filter == s) && inner_test_filter(p.type)) {
                addResult(p.desc, "searchbox_extra");
                if (
                  -1 !== LGraphCanvas.search_limit &&
                  n++ > LGraphCanvas.search_limit
                )
                  break;
              }
            }
          }
          var b = null;
          if (Array.prototype.filter) {
            var m = Object.keys(LiteGraph.registered_node_types);
            b = m.filter(inner_test_filter);
          } else {
            b = [];
            for (var l in LiteGraph.registered_node_types)
              inner_test_filter(l) && b.push(l);
          }
          for (l = 0; l < b.length; l++) {
            addResult(b[l]);
            if (
              -1 !== LGraphCanvas.search_limit &&
              n++ > LGraphCanvas.search_limit
            )
              break;
          }
          if (e.show_general_after_typefiltered && (u.value || h.value)) {
            _global.filtered_extra = [];
            for (var l in LiteGraph.registered_node_types)
              inner_test_filter(l, {
                inTypeOverride: !(!u || !u.value) && "*",
                outTypeOverride: !(!h || !h.value) && "*",
              }) && filtered_extra.push(l);
            for (l = 0; l < filtered_extra.length; l++) {
              addResult(filtered_extra[l], "generic_type");
              if (
                -1 !== LGraphCanvas.search_limit &&
                n++ > LGraphCanvas.search_limit
              )
                break;
            }
          }
          if (
            (u.value || h.value) &&
            0 == g.childNodes.length &&
            e.show_general_if_none_on_typefilter
          ) {
            _global.filtered_extra = [];
            for (var l in LiteGraph.registered_node_types)
              inner_test_filter(l, { skipFilter: true }) &&
                filtered_extra.push(l);
            for (l = 0; l < filtered_extra.length; l++) {
              addResult(filtered_extra[l], "not_in_filter");
              if (
                -1 !== LGraphCanvas.search_limit &&
                n++ > LGraphCanvas.search_limit
              )
                break;
            }
          }
          function inner_test_filter(a, o) {
            o = o || {};
            var r = {
              skipFilter: false,
              inTypeOverride: false,
              outTypeOverride: false,
            };
            var l = Object.assign(r, o);
            var n = LiteGraph.registered_node_types[a];
            if (s && n.filter != s) return false;
            if (
              (!e.show_all_if_empty || t) &&
              -1 === a.toLowerCase().indexOf(t)
            )
              return false;
            if (e.do_type_filter && !l.skipFilter) {
              var p = a;
              var _ = u.value;
              false !== l.inTypeOverride && (_ = l.inTypeOverride);
              if (
                u &&
                _ &&
                LiteGraph.registered_slot_in_types[_] &&
                LiteGraph.registered_slot_in_types[_].nodes
              ) {
                var g = LiteGraph.registered_slot_in_types[_].nodes.includes(p);
                if (false === g) return false;
              }
              _ = h.value;
              false !== l.outTypeOverride && (_ = l.outTypeOverride);
              if (
                h &&
                _ &&
                LiteGraph.registered_slot_out_types[_] &&
                LiteGraph.registered_slot_out_types[_].nodes
              ) {
                g = LiteGraph.registered_slot_out_types[_].nodes.includes(p);
                if (false === g) return false;
              }
            }
            return true;
          }
        }
      function addResult(t, e) {
        var a = document.createElement("div");
        d || (d = t);
        a.innerText = t;
        a.dataset.type = escape(t);
        a.className = "litegraph lite-search-item";
        e && (a.className += " " + e);
        a.addEventListener("click", function (t) {
          select(unescape((this || _global).dataset.type));
        });
        g.appendChild(a);
      }
    }
    return s;
  };
  LGraphCanvas.prototype.showEditPropertyValue = function (t, e, a) {
    if (t && void 0 !== t.properties[e]) {
      a = a || {};
      var o = t.getPropertyInfo(e);
      var r = o.type;
      var l = "";
      if ("string" == r || "number" == r || "array" == r || "object" == r)
        l = "<input autofocus type='text' class='value'/>";
      else if (("enum" != r && "combo" != r) || !o.values) {
        if ("boolean" != r && "toggle" != r) {
          console.warn("unknown type: " + r);
          return;
        }
        l =
          "<input autofocus type='checkbox' class='value' " +
          (t.properties[e] ? "checked" : "") +
          "/>";
      } else {
        l = "<select autofocus type='text' class='value'>";
        for (var n in o.values) {
          var s = n;
          o.values.constructor === Array && (s = o.values[n]);
          l +=
            "<option value='" +
            s +
            "' " +
            (s == t.properties[e] ? "selected" : "") +
            ">" +
            o.values[n] +
            "</option>";
        }
        l += "</select>";
      }
      var u = this.createDialog(
        "<span class='name'>" +
          (o.label ? o.label : e) +
          "</span>" +
          l +
          "<button>OK</button>",
        a
      );
      var h = false;
      if (("enum" != r && "combo" != r) || !o.values)
        if ("boolean" == r || "toggle" == r) {
          h = u.querySelector("input");
          h &&
            h.addEventListener("click", function (t) {
              u.modified();
              setValue(!!h.checked);
            });
        } else {
          h = u.querySelector("input");
          if (h) {
            h.addEventListener("blur", function (t) {
              this.focus();
            });
            s = void 0 !== t.properties[e] ? t.properties[e] : "";
            "string" !== r && (s = JSON.stringify(s));
            h.value = s;
            h.addEventListener("keydown", function (t) {
              if (27 == t.keyCode) u.close();
              else if (13 == t.keyCode) inner();
              else if (13 != t.keyCode) {
                u.modified();
                return;
              }
              t.preventDefault();
              t.stopPropagation();
            });
          }
        }
      else {
        h = u.querySelector("select");
        h.addEventListener("change", function (t) {
          u.modified();
          setValue(t.target.value);
        });
      }
      h && h.focus();
      var p = u.querySelector("button");
      p.addEventListener("click", inner);
      return u;
    }
    function inner() {
      setValue(h.value);
    }
    function setValue(l) {
      o &&
        o.values &&
        o.values.constructor === Object &&
        void 0 != o.values[l] &&
        (l = o.values[l]);
      "number" == typeof t.properties[e] && (l = Number(l));
      ("array" != r && "object" != r) || (l = JSON.parse(l));
      t.properties[e] = l;
      t.graph && t.graph._version++;
      t.onPropertyChanged && t.onPropertyChanged(e, l);
      a.onclose && a.onclose();
      u.close();
      t.setDirtyCanvas(true, true);
    }
  };
  LGraphCanvas.prototype.createDialog = function (t, e) {
    var a = {
      checkForInput: false,
      closeOnLeave: true,
      closeOnLeave_checkModified: true,
    };
    e = Object.assign(a, e || {});
    var o = document.createElement("div");
    o.className = "graphdialog";
    o.innerHTML = t;
    o.is_modified = false;
    var r = (this || _global).canvas.getBoundingClientRect();
    var l = -20;
    var n = -20;
    if (r) {
      l -= r.left;
      n -= r.top;
    }
    if (e.position) {
      l += e.position[0];
      n += e.position[1];
    } else if (e.event) {
      l += e.event.clientX;
      n += e.event.clientY;
    } else {
      l += 0.5 * (this || _global).canvas.width;
      n += 0.5 * (this || _global).canvas.height;
    }
    o.style.left = l + "px";
    o.style.top = n + "px";
    (this || _global).canvas.parentNode.appendChild(o);
    if (e.checkForInput) {
      var s = [];
      var u = false;
      (s = o.querySelectorAll("input")) &&
        s.forEach(function (t) {
          t.addEventListener("keydown", function (t) {
            o.modified();
            if (27 == t.keyCode) o.close();
            else if (13 != t.keyCode) return;
            t.preventDefault();
            t.stopPropagation();
          });
          u || t.focus();
        });
    }
    o.modified = function () {
      o.is_modified = true;
    };
    o.close = function () {
      o.parentNode && o.parentNode.removeChild(o);
    };
    var h = null;
    var p = false;
    o.addEventListener("mouseleave", function (t) {
      p ||
        ((e.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave) &&
          !o.is_modified &&
          LiteGraph.dialog_close_on_mouse_leave &&
          (h = setTimeout(
            o.close,
            LiteGraph.dialog_close_on_mouse_leave_delay
          )));
    });
    o.addEventListener("mouseenter", function (t) {
      (e.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave) &&
        h &&
        clearTimeout(h);
    });
    var _ = o.querySelectorAll("select");
    _ &&
      _.forEach(function (t) {
        t.addEventListener("click", function (t) {
          p++;
        });
        t.addEventListener("blur", function (t) {
          p = 0;
        });
        t.addEventListener("change", function (t) {
          p = -1;
        });
      });
    return o;
  };
  LGraphCanvas.prototype.createPanel = function (t, e) {
    e = e || {};
    var a = e.window || window;
    var o = document.createElement("div");
    o.className = "litegraph dialog";
    o.innerHTML =
      "<div class='dialog-header'><span class='dialog-title'></span></div><div class='dialog-content'></div><div style='display:none;' class='dialog-alt-content'></div><div class='dialog-footer'></div>";
    o.header = o.querySelector(".dialog-header");
    e.width &&
      (o.style.width = e.width + (e.width.constructor === Number ? "px" : ""));
    e.height &&
      (o.style.height =
        e.height + (e.height.constructor === Number ? "px" : ""));
    if (e.closable) {
      var r = document.createElement("span");
      r.innerHTML = "&#10005;";
      r.classList.add("close");
      r.addEventListener("click", function () {
        o.close();
      });
      o.header.appendChild(r);
    }
    o.title_element = o.querySelector(".dialog-title");
    o.title_element.innerText = t;
    o.content = o.querySelector(".dialog-content");
    o.alt_content = o.querySelector(".dialog-alt-content");
    o.footer = o.querySelector(".dialog-footer");
    o.close = function () {
      o.onClose && "function" == typeof o.onClose && o.onClose();
      o.parentNode && o.parentNode.removeChild(o);
      (this || _global).parentNode &&
        (this || _global).parentNode.removeChild(this || _global);
    };
    o.toggleAltContent = function (t) {
      if ("undefined" != typeof t) {
        var e = t ? "block" : "none";
        var a = t ? "none" : "block";
      } else {
        e = "block" != o.alt_content.style.display ? "block" : "none";
        a = "block" != o.alt_content.style.display ? "none" : "block";
      }
      o.alt_content.style.display = e;
      o.content.style.display = a;
    };
    o.toggleFooterVisibility = function (t) {
      if ("undefined" != typeof t) var e = t ? "block" : "none";
      else e = "block" != o.footer.style.display ? "block" : "none";
      o.footer.style.display = e;
    };
    o.clear = function () {
      (this || _global).content.innerHTML = "";
    };
    o.addHTML = function (t, e, a) {
      var r = document.createElement("div");
      e && (r.className = e);
      r.innerHTML = t;
      a ? o.footer.appendChild(r) : o.content.appendChild(r);
      return r;
    };
    o.addButton = function (t, e, a) {
      var r = document.createElement("button");
      r.innerText = t;
      r.options = a;
      r.classList.add("btn");
      r.addEventListener("click", e);
      o.footer.appendChild(r);
      return r;
    };
    o.addSeparator = function () {
      var t = document.createElement("div");
      t.className = "separator";
      o.content.appendChild(t);
    };
    o.addWidget = function (t, e, r, l, n) {
      l = l || {};
      var s = String(r);
      t = t.toLowerCase();
      "number" == t && (s = r.toFixed(3));
      var u = document.createElement("div");
      u.className = "property";
      u.innerHTML =
        "<span class='property_name'></span><span class='property_value'></span>";
      u.querySelector(".property_name").innerText = l.label || e;
      var h = u.querySelector(".property_value");
      h.innerText = s;
      u.dataset.property = e;
      u.dataset.type = l.type || t;
      u.options = l;
      u.value = r;
      if ("code" == t)
        u.addEventListener("click", function (t) {
          o.inner_showCodePad((this || _global).dataset.property);
        });
      else if ("boolean" == t) {
        u.classList.add("boolean");
        r && u.classList.add("bool-on");
        u.addEventListener("click", function () {
          var t = (this || _global).dataset.property;
          (this || _global).value = !(this || _global).value;
          (this || _global).classList.toggle("bool-on");
          this.querySelector(".property_value").innerText = (this || _global)
            .value
            ? "true"
            : "false";
          innerChange(t, (this || _global).value);
        });
      } else if ("string" == t || "number" == t) {
        h.setAttribute("contenteditable", true);
        h.addEventListener("keydown", function (e) {
          if ("Enter" == e.code && ("string" != t || !e.shiftKey)) {
            e.preventDefault();
            this.blur();
          }
        });
        h.addEventListener("blur", function () {
          var t = (this || _global).innerText;
          var e = (this || _global).parentNode.dataset.property;
          var a = (this || _global).parentNode.dataset.type;
          "number" == a && (t = Number(t));
          innerChange(e, t);
        });
      } else if ("enum" == t || "combo" == t) {
        s = LGraphCanvas.getPropertyPrintableValue(r, l.values);
        h.innerText = s;
        h.addEventListener("click", function (t) {
          var e = l.values || [];
          var o = (this || _global).parentNode.dataset.property;
          var r = this || _global;
          new LiteGraph.ContextMenu(
            e,
            { event: t, className: "dark", callback: inner_clicked },
            a
          );
          function inner_clicked(t, e, a) {
            r.innerText = t;
            innerChange(o, t);
            return false;
          }
        });
      }
      o.content.appendChild(u);
      function innerChange(t, e) {
        l.callback && l.callback(t, e, l);
        n && n(t, e, l);
      }
      return u;
    };
    o.onOpen && "function" == typeof o.onOpen && o.onOpen();
    return o;
  };
  LGraphCanvas.getPropertyPrintableValue = function (t, e) {
    if (!e) return String(t);
    if (e.constructor === Array) return String(t);
    if (e.constructor === Object) {
      var a = "";
      for (var o in e)
        if (e[o] == t) {
          a = o;
          break;
        }
      return String(t) + " (" + a + ")";
    }
  };
  LGraphCanvas.prototype.closePanels = function () {
    var t = document.querySelector("#node-panel");
    t && t.close();
    t = document.querySelector("#option-panel");
    t && t.close();
  };
  LGraphCanvas.prototype.showShowGraphOptionsPanel = function (t, e, a, o) {
    if (
      (this || _global).constructor &&
      "HTMLDivElement" == (this || _global).constructor.name
    ) {
      if (!e || !e.event || !e.event.target || !e.event.target.lgraphcanvas) {
        console.warn("Canvas not found");
        return;
      }
      var r = e.event.target.lgraphcanvas;
    } else r = this || _global;
    r.closePanels();
    var l = r.getCanvasWindow();
    _global.panel = r.createPanel("Options", {
      closable: true,
      window: l,
      onOpen: function () {
        r.OPTIONPANEL_IS_OPEN = true;
      },
      onClose: function () {
        r.OPTIONPANEL_IS_OPEN = false;
        r.options_panel = null;
      },
    });
    r.options_panel = panel;
    panel.id = "option-panel";
    panel.classList.add("settings");
    function inner_refresh() {
      panel.content.innerHTML = "";
      var fUpdate = function (t, e, a) {
        switch (t) {
          default:
            a && a.key && (t = a.key);
            a.values && (e = Object.values(a.values).indexOf(e));
            r[t] = e;
            break;
        }
      };
      var t = LiteGraph.availableCanvasOptions;
      t.sort();
      for (var e in t) {
        var a = t[e];
        panel.addWidget(
          "boolean",
          a,
          r[a],
          { key: a, on: "True", off: "False" },
          fUpdate
        );
      }
      r.links_render_mode;
      panel.addWidget(
        "combo",
        "Render mode",
        LiteGraph.LINK_RENDER_MODES[r.links_render_mode],
        { key: "links_render_mode", values: LiteGraph.LINK_RENDER_MODES },
        fUpdate
      );
      panel.addSeparator();
      panel.footer.innerHTML = "";
    }
    inner_refresh();
    r.canvas.parentNode.appendChild(panel);
  };
  LGraphCanvas.prototype.showShowNodePanel = function (t) {
    (this || _global).SELECTED_NODE = t;
    this.closePanels();
    var e = this.getCanvasWindow();
    var a = this || _global;
    var o = this.createPanel(t.title || "", {
      closable: true,
      window: e,
      onOpen: function () {
        a.NODEPANEL_IS_OPEN = true;
      },
      onClose: function () {
        a.NODEPANEL_IS_OPEN = false;
        a.node_panel = null;
      },
    });
    a.node_panel = o;
    o.id = "node-panel";
    o.node = t;
    o.classList.add("settings");
    function inner_refresh() {
      o.content.innerHTML = "";
      o.addHTML(
        "<span class='node_type'>" +
          t.type +
          "</span><span class='node_desc'>" +
          (t.constructor.desc || "") +
          "</span><span class='separator'></span>"
      );
      o.addHTML("<h3>Properties</h3>");
      var fUpdate = function (e, o) {
        a.graph.beforeChange(t);
        switch (e) {
          case "Title":
            t.title = o;
            break;
          case "Mode":
            var r = Object.values(LiteGraph.NODE_MODES).indexOf(o);
            r >= 0 && LiteGraph.NODE_MODES[r]
              ? t.changeMode(r)
              : console.warn("unexpected mode: " + o);
            break;
          case "Color":
            if (LGraphCanvas.node_colors[o]) {
              t.color = LGraphCanvas.node_colors[o].color;
              t.bgcolor = LGraphCanvas.node_colors[o].bgcolor;
            } else console.warn("unexpected color: " + o);
            break;
          default:
            t.setProperty(e, o);
            break;
        }
        a.graph.afterChange();
        a.dirty_canvas = true;
      };
      o.addWidget("string", "Title", t.title, {}, fUpdate);
      o.addWidget(
        "combo",
        "Mode",
        LiteGraph.NODE_MODES[t.mode],
        { values: LiteGraph.NODE_MODES },
        fUpdate
      );
      var e = "";
      void 0 !== t.color &&
        (e = Object.keys(LGraphCanvas.node_colors).filter(function (e) {
          return LGraphCanvas.node_colors[e].color == t.color;
        }));
      o.addWidget(
        "combo",
        "Color",
        e,
        { values: Object.keys(LGraphCanvas.node_colors) },
        fUpdate
      );
      for (var r in t.properties) {
        var l = t.properties[r];
        var n = t.getPropertyInfo(r);
        n.type;
        (t.onAddPropertyToPanel && t.onAddPropertyToPanel(r, o)) ||
          o.addWidget(n.widget || n.type, r, l, n, fUpdate);
      }
      o.addSeparator();
      t.onShowCustomPanelInfo && t.onShowCustomPanelInfo(o);
      o.footer.innerHTML = "";
      o.addButton("Delete", function () {
        if (!t.block_delete) {
          t.graph.remove(t);
          o.close();
        }
      }).classList.add("delete");
    }
    o.inner_showCodePad = function (e) {
      o.classList.remove("settings");
      o.classList.add("centered");
      o.alt_content.innerHTML = "<textarea class='code'></textarea>";
      var a = o.alt_content.querySelector("textarea");
      var fDoneWith = function () {
        o.toggleAltContent(false);
        o.toggleFooterVisibility(true);
        a.parentNode.removeChild(a);
        o.classList.add("settings");
        o.classList.remove("centered");
        inner_refresh();
      };
      a.value = t.properties[e];
      a.addEventListener("keydown", function (o) {
        if ("Enter" == o.code && o.ctrlKey) {
          t.setProperty(e, a.value);
          fDoneWith();
        }
      });
      o.toggleAltContent(true);
      o.toggleFooterVisibility(false);
      a.style.height = "calc(100% - 40px)";
      var r = o.addButton("Assign", function () {
        t.setProperty(e, a.value);
        fDoneWith();
      });
      o.alt_content.appendChild(r);
      var l = o.addButton("Close", fDoneWith);
      l.style.float = "right";
      o.alt_content.appendChild(l);
    };
    inner_refresh();
    (this || _global).canvas.parentNode.appendChild(o);
  };
  LGraphCanvas.prototype.showSubgraphPropertiesDialog = function (t) {
    console.log("showing subgraph properties dialog");
    var e = (this || _global).canvas.parentNode.querySelector(
      ".subgraph_dialog"
    );
    e && e.close();
    var a = this.createPanel("Subgraph Inputs", { closable: true, width: 500 });
    a.node = t;
    a.classList.add("subgraph_dialog");
    function inner_refresh() {
      a.clear();
      if (t.inputs)
        for (var e = 0; e < t.inputs.length; ++e) {
          var o = t.inputs[e];
          if (!o.not_subgraph_input) {
            var r =
              "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
            var l = a.addHTML(r, "subgraph_property");
            l.dataset.name = o.name;
            l.dataset.slot = e;
            l.querySelector(".name").innerText = o.name;
            l.querySelector(".type").innerText = o.type;
            l.querySelector("button").addEventListener("click", function (e) {
              t.removeInput(Number((this || _global).parentNode.dataset.slot));
              inner_refresh();
            });
          }
        }
    }
    var o =
      " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>";
    var r = a.addHTML(o, "subgraph_property extra", true);
    r.querySelector("button").addEventListener("click", function (e) {
      var a = (this || _global).parentNode;
      var o = a.querySelector(".name").value;
      var r = a.querySelector(".type").value;
      if (o && -1 == t.findInputSlot(o)) {
        t.addInput(o, r);
        a.querySelector(".name").value = "";
        a.querySelector(".type").value = "";
        inner_refresh();
      }
    });
    inner_refresh();
    (this || _global).canvas.parentNode.appendChild(a);
    return a;
  };
  LGraphCanvas.prototype.showSubgraphPropertiesDialogRight = function (t) {
    var e = (this || _global).canvas.parentNode.querySelector(
      ".subgraph_dialog"
    );
    e && e.close();
    var a = this.createPanel("Subgraph Outputs", {
      closable: true,
      width: 500,
    });
    a.node = t;
    a.classList.add("subgraph_dialog");
    function inner_refresh() {
      a.clear();
      if (t.outputs)
        for (var e = 0; e < t.outputs.length; ++e) {
          var o = t.outputs[e];
          if (!o.not_subgraph_output) {
            var r =
              "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
            var l = a.addHTML(r, "subgraph_property");
            l.dataset.name = o.name;
            l.dataset.slot = e;
            l.querySelector(".name").innerText = o.name;
            l.querySelector(".type").innerText = o.type;
            l.querySelector("button").addEventListener("click", function (e) {
              t.removeOutput(Number((this || _global).parentNode.dataset.slot));
              inner_refresh();
            });
          }
        }
    }
    var o =
      " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>";
    var r = a.addHTML(o, "subgraph_property extra", true);
    r.querySelector(".name").addEventListener("keydown", function (t) {
      13 == t.keyCode && addOutput.apply(this || _global);
    });
    r.querySelector("button").addEventListener("click", function (t) {
      addOutput.apply(this || _global);
    });
    function addOutput() {
      var e = (this || _global).parentNode;
      var a = e.querySelector(".name").value;
      var o = e.querySelector(".type").value;
      if (a && -1 == t.findOutputSlot(a)) {
        t.addOutput(a, o);
        e.querySelector(".name").value = "";
        e.querySelector(".type").value = "";
        inner_refresh();
      }
    }
    inner_refresh();
    (this || _global).canvas.parentNode.appendChild(a);
    return a;
  };
  LGraphCanvas.prototype.checkPanels = function () {
    if ((this || _global).canvas) {
      var t = (this || _global).canvas.parentNode.querySelectorAll(
        ".litegraph.dialog"
      );
      for (var e = 0; e < t.length; ++e) {
        var a = t[e];
        a.node &&
          ((a.node.graph && a.graph == (this || _global).graph) || a.close());
      }
    }
  };
  LGraphCanvas.onMenuNodeCollapse = function (t, e, a, o, r) {
    r.graph.beforeChange();
    var fApplyMultiNode = function (t) {
      t.collapse();
    };
    var l = LGraphCanvas.active_canvas;
    if (!l.selected_nodes || Object.keys(l.selected_nodes).length <= 1)
      fApplyMultiNode(r);
    else for (var n in l.selected_nodes) fApplyMultiNode(l.selected_nodes[n]);
    r.graph.afterChange();
  };
  LGraphCanvas.onMenuNodePin = function (t, e, a, o, r) {
    r.pin();
  };
  LGraphCanvas.onMenuNodeMode = function (t, e, a, o, r) {
    new LiteGraph.ContextMenu(LiteGraph.NODE_MODES, {
      event: a,
      callback: inner_clicked,
      parentMenu: o,
      node: r,
    });
    function inner_clicked(t) {
      if (r) {
        var e = Object.values(LiteGraph.NODE_MODES).indexOf(t);
        var fApplyMultiNode = function (a) {
          if (e >= 0 && LiteGraph.NODE_MODES[e]) a.changeMode(e);
          else {
            console.warn("unexpected mode: " + t);
            a.changeMode(LiteGraph.ALWAYS);
          }
        };
        var a = LGraphCanvas.active_canvas;
        if (!a.selected_nodes || Object.keys(a.selected_nodes).length <= 1)
          fApplyMultiNode(r);
        else
          for (var o in a.selected_nodes) fApplyMultiNode(a.selected_nodes[o]);
      }
    }
    return false;
  };
  LGraphCanvas.onMenuNodeColors = function (t, e, a, o, r) {
    if (!r) throw "no node for color";
    var l = [];
    l.push({
      value: null,
      content:
        "<span style='display: block; padding-left: 4px;'>No color</span>",
    });
    for (var n in LGraphCanvas.node_colors) {
      var s = LGraphCanvas.node_colors[n];
      t = {
        value: n,
        content:
          "<span style='display: block; color: #999; padding-left: 4px; border-left: 8px solid " +
          s.color +
          "; background-color:" +
          s.bgcolor +
          "'>" +
          n +
          "</span>",
      };
      l.push(t);
    }
    new LiteGraph.ContextMenu(l, {
      event: a,
      callback: inner_clicked,
      parentMenu: o,
      node: r,
    });
    function inner_clicked(t) {
      if (r) {
        var e = t.value ? LGraphCanvas.node_colors[t.value] : null;
        var fApplyColor = function (t) {
          if (e)
            if (t.constructor === LiteGraph.LGraphGroup) t.color = e.groupcolor;
            else {
              t.color = e.color;
              t.bgcolor = e.bgcolor;
            }
          else {
            delete t.color;
            delete t.bgcolor;
          }
        };
        var a = LGraphCanvas.active_canvas;
        if (!a.selected_nodes || Object.keys(a.selected_nodes).length <= 1)
          fApplyColor(r);
        else for (var o in a.selected_nodes) fApplyColor(a.selected_nodes[o]);
        r.setDirtyCanvas(true, true);
      }
    }
    return false;
  };
  LGraphCanvas.onMenuNodeShapes = function (t, e, a, o, r) {
    if (!r) throw "no node passed";
    new LiteGraph.ContextMenu(LiteGraph.VALID_SHAPES, {
      event: a,
      callback: inner_clicked,
      parentMenu: o,
      node: r,
    });
    function inner_clicked(t) {
      if (r) {
        r.graph.beforeChange();
        var fApplyMultiNode = function (e) {
          e.shape = t;
        };
        var e = LGraphCanvas.active_canvas;
        if (!e.selected_nodes || Object.keys(e.selected_nodes).length <= 1)
          fApplyMultiNode(r);
        else
          for (var a in e.selected_nodes) fApplyMultiNode(e.selected_nodes[a]);
        r.graph.afterChange();
        r.setDirtyCanvas(true);
      }
    }
    return false;
  };
  LGraphCanvas.onMenuNodeRemove = function (t, e, a, o, r) {
    if (!r) throw "no node passed";
    var l = r.graph;
    l.beforeChange();
    var fApplyMultiNode = function (t) {
      false !== t.removable && l.remove(t);
    };
    var n = LGraphCanvas.active_canvas;
    if (!n.selected_nodes || Object.keys(n.selected_nodes).length <= 1)
      fApplyMultiNode(r);
    else for (var s in n.selected_nodes) fApplyMultiNode(n.selected_nodes[s]);
    l.afterChange();
    r.setDirtyCanvas(true, true);
  };
  LGraphCanvas.onMenuNodeToSubgraph = function (t, e, a, o, r) {
    var l = r.graph;
    var n = LGraphCanvas.active_canvas;
    if (n) {
      var s = Object.values(n.selected_nodes || {});
      s.length || (s = [r]);
      var u = LiteGraph.createNode("graph/subgraph");
      u.pos = r.pos.concat();
      l.add(u);
      u.buildFromNodes(s);
      n.deselectAllNodes();
      r.setDirtyCanvas(true, true);
    }
  };
  LGraphCanvas.onMenuNodeClone = function (t, e, a, o, r) {
    r.graph.beforeChange();
    var l = {};
    var fApplyMultiNode = function (t) {
      if (false != t.clonable) {
        var e = t.clone();
        if (e) {
          e.pos = [t.pos[0] + 5, t.pos[1] + 5];
          t.graph.add(e);
          l[e.id] = e;
        }
      }
    };
    var n = LGraphCanvas.active_canvas;
    if (!n.selected_nodes || Object.keys(n.selected_nodes).length <= 1)
      fApplyMultiNode(r);
    else for (var s in n.selected_nodes) fApplyMultiNode(n.selected_nodes[s]);
    Object.keys(l).length && n.selectNodes(l);
    r.graph.afterChange();
    r.setDirtyCanvas(true, true);
  };
  LGraphCanvas.node_colors = {
    red: { color: "#322", bgcolor: "#533", groupcolor: "#A88" },
    brown: { color: "#332922", bgcolor: "#593930", groupcolor: "#b06634" },
    green: { color: "#232", bgcolor: "#353", groupcolor: "#8A8" },
    blue: { color: "#223", bgcolor: "#335", groupcolor: "#88A" },
    pale_blue: { color: "#2a363b", bgcolor: "#3f5159", groupcolor: "#3f789e" },
    cyan: { color: "#233", bgcolor: "#355", groupcolor: "#8AA" },
    purple: { color: "#323", bgcolor: "#535", groupcolor: "#a1309b" },
    yellow: { color: "#432", bgcolor: "#653", groupcolor: "#b58b2a" },
    black: { color: "#222", bgcolor: "#000", groupcolor: "#444" },
  };
  LGraphCanvas.prototype.getCanvasMenuOptions = function () {
    var t = null;
    if ((this || _global).getMenuOptions) t = this.getMenuOptions();
    else {
      t = [
        {
          content: "Add Node",
          has_submenu: true,
          callback: LGraphCanvas.onMenuAdd,
        },
        { content: "Add Group", callback: LGraphCanvas.onGroupAdd },
      ];
      (this || _global)._graph_stack &&
        (this || _global)._graph_stack.length > 0 &&
        t.push(null, {
          content: "Close subgraph",
          callback: (this || _global).closeSubgraph.bind(this || _global),
        });
    }
    if ((this || _global).getExtraMenuOptions) {
      var e = this.getExtraMenuOptions(this || _global, t);
      e && (t = t.concat(e));
    }
    return t;
  };
  LGraphCanvas.prototype.getNodeMenuOptions = function (t) {
    var e = null;
    if (t.getMenuOptions) e = t.getMenuOptions(this || _global);
    else {
      e = [
        {
          content: "Inputs",
          has_submenu: true,
          disabled: true,
          callback: LGraphCanvas.showMenuNodeOptionalInputs,
        },
        {
          content: "Outputs",
          has_submenu: true,
          disabled: true,
          callback: LGraphCanvas.showMenuNodeOptionalOutputs,
        },
        null,
        {
          content: "Properties",
          has_submenu: true,
          callback: LGraphCanvas.onShowMenuNodeProperties,
        },
        null,
        { content: "Title", callback: LGraphCanvas.onShowPropertyEditor },
        {
          content: "Mode",
          has_submenu: true,
          callback: LGraphCanvas.onMenuNodeMode,
        },
      ];
      false !== t.resizable &&
        e.push({ content: "Resize", callback: LGraphCanvas.onMenuResizeNode });
      e.push(
        { content: "Collapse", callback: LGraphCanvas.onMenuNodeCollapse },
        { content: "Pin", callback: LGraphCanvas.onMenuNodePin },
        {
          content: "Colors",
          has_submenu: true,
          callback: LGraphCanvas.onMenuNodeColors,
        },
        {
          content: "Shapes",
          has_submenu: true,
          callback: LGraphCanvas.onMenuNodeShapes,
        },
        null
      );
    }
    if (t.onGetInputs) {
      var a = t.onGetInputs();
      a && a.length && (e[0].disabled = false);
    }
    if (t.onGetOutputs) {
      var o = t.onGetOutputs();
      o && o.length && (e[1].disabled = false);
    }
    if (t.getExtraMenuOptions) {
      var r = t.getExtraMenuOptions(this || _global, e);
      if (r) {
        r.push(null);
        e = r.concat(e);
      }
    }
    false !== t.clonable &&
      e.push({ content: "Clone", callback: LGraphCanvas.onMenuNodeClone });
    0;
    e.push(null, {
      content: "Remove",
      disabled: !(false !== t.removable && !t.block_delete),
      callback: LGraphCanvas.onMenuNodeRemove,
    });
    t.graph &&
      t.graph.onGetNodeMenuOptions &&
      t.graph.onGetNodeMenuOptions(e, t);
    return e;
  };
  LGraphCanvas.prototype.getGroupMenuOptions = function (t) {
    var e = [
      { content: "Title", callback: LGraphCanvas.onShowPropertyEditor },
      {
        content: "Color",
        has_submenu: true,
        callback: LGraphCanvas.onMenuNodeColors,
      },
      {
        content: "Font size",
        property: "font_size",
        type: "Number",
        callback: LGraphCanvas.onShowPropertyEditor,
      },
      null,
      { content: "Remove", callback: LGraphCanvas.onMenuNodeRemove },
    ];
    return e;
  };
  LGraphCanvas.prototype.processContextMenu = function (t, e) {
    var a = this || _global;
    var o = LGraphCanvas.active_canvas;
    var r = o.getCanvasWindow();
    var l = null;
    var n = { event: e, callback: inner_option_clicked, extra: t };
    t && (n.title = t.type);
    var s = null;
    if (t) {
      s = t.getSlotInPosition(e.canvasX, e.canvasY);
      LGraphCanvas.active_node = t;
    }
    if (s) {
      l = [];
      if (t.getSlotMenuOptions) l = t.getSlotMenuOptions(s);
      else {
        s &&
          s.output &&
          s.output.links &&
          s.output.links.length &&
          l.push({ content: "Disconnect Links", slot: s });
        var u = s.input || s.output;
        u.removable &&
          l.push(
            u.locked ? "Cannot remove" : { content: "Remove Slot", slot: s }
          );
        u.nameLocked || l.push({ content: "Rename Slot", slot: s });
      }
      n.title = (s.input ? s.input.type : s.output.type) || "*";
      s.input && s.input.type == LiteGraph.ACTION && (n.title = "Action");
      s.output && s.output.type == LiteGraph.EVENT && (n.title = "Event");
    } else if (t) l = this.getNodeMenuOptions(t);
    else {
      l = this.getCanvasMenuOptions();
      var h = (this || _global).graph.getGroupOnPos(e.canvasX, e.canvasY);
      h &&
        l.push(null, {
          content: "Edit Group",
          has_submenu: true,
          submenu: {
            title: "Group",
            extra: h,
            options: this.getGroupMenuOptions(h),
          },
        });
    }
    if (l) new LiteGraph.ContextMenu(l, n, r);
    function inner_option_clicked(e, o, r) {
      if (e)
        if ("Remove Slot" != e.content)
          if ("Disconnect Links" != e.content) {
            if ("Rename Slot" == e.content) {
              u = e.slot;
              var l = u.input
                ? t.getInputInfo(u.slot)
                : t.getOutputInfo(u.slot);
              var n = a.createDialog(
                "<span class='name'>Name</span><input autofocus type='text'/><button>OK</button>",
                o
              );
              var s = n.querySelector("input");
              s && l && (s.value = l.label || "");
              var inner = function () {
                t.graph.beforeChange();
                if (s.value) {
                  l && (l.label = s.value);
                  a.setDirty(true);
                }
                n.close();
                t.graph.afterChange();
              };
              n.querySelector("button").addEventListener("click", inner);
              s.addEventListener("keydown", function (t) {
                n.is_modified = true;
                if (27 == t.keyCode) n.close();
                else if (13 == t.keyCode) inner();
                else if (13 != t.keyCode && "textarea" != t.target.localName)
                  return;
                t.preventDefault();
                t.stopPropagation();
              });
              s.focus();
            }
          } else {
            var u = e.slot;
            t.graph.beforeChange();
            u.output
              ? t.disconnectOutput(u.slot)
              : u.input && t.disconnectInput(u.slot);
            t.graph.afterChange();
          }
        else {
          var u = e.slot;
          t.graph.beforeChange();
          u.input ? t.removeInput(u.slot) : u.output && t.removeOutput(u.slot);
          t.graph.afterChange();
        }
    }
  };
  "undefined" != typeof window &&
    window.CanvasRenderingContext2D &&
    !window.CanvasRenderingContext2D.prototype.roundRect &&
    (window.CanvasRenderingContext2D.prototype.roundRect = function (
      t,
      e,
      a,
      o,
      r,
      l
    ) {
      var n = 0;
      var s = 0;
      var u = 0;
      var h = 0;
      if (0 !== r) {
        void 0 === l && (l = r);
        if (null != r && r.constructor === Array)
          if (1 == r.length) n = s = u = h = r[0];
          else if (2 == r.length) {
            n = h = r[0];
            s = u = r[1];
          } else {
            if (4 != r.length) return;
            n = r[0];
            s = r[1];
            u = r[2];
            h = r[3];
          }
        else {
          n = r || 0;
          s = r || 0;
          u = l || 0;
          h = l || 0;
        }
        this.moveTo(t + n, e);
        this.lineTo(t + a - s, e);
        this.quadraticCurveTo(t + a, e, t + a, e + s);
        this.lineTo(t + a, e + o - h);
        this.quadraticCurveTo(t + a, e + o, t + a - h, e + o);
        this.lineTo(t + h, e + o);
        this.quadraticCurveTo(t, e + o, t, e + o - u);
        this.lineTo(t, e + u);
        this.quadraticCurveTo(t, e, t + n, e);
      } else this.rect(t, e, a, o);
    });
  function compareObjects(t, e) {
    for (var a in t) if (t[a] != e[a]) return false;
    return true;
  }
  LiteGraph.compareObjects = compareObjects;
  function distance(t, e) {
    return Math.sqrt(
      (e[0] - t[0]) * (e[0] - t[0]) + (e[1] - t[1]) * (e[1] - t[1])
    );
  }
  LiteGraph.distance = distance;
  function colorToString(t) {
    return (
      "rgba(" +
      Math.round(255 * t[0]).toFixed() +
      "," +
      Math.round(255 * t[1]).toFixed() +
      "," +
      Math.round(255 * t[2]).toFixed() +
      "," +
      (4 == t.length ? t[3].toFixed(2) : "1.0") +
      ")"
    );
  }
  LiteGraph.colorToString = colorToString;
  function isInsideRectangle(t, e, a, o, r, l) {
    return a < t && a + r > t && o < e && o + l > e;
  }
  LiteGraph.isInsideRectangle = isInsideRectangle;
  function growBounding(t, e, a) {
    e < t[0] ? (t[0] = e) : e > t[2] && (t[2] = e);
    a < t[1] ? (t[1] = a) : a > t[3] && (t[3] = a);
  }
  LiteGraph.growBounding = growBounding;
  function isInsideBounding(t, e) {
    return !(
      t[0] < e[0][0] ||
      t[1] < e[0][1] ||
      t[0] > e[1][0] ||
      t[1] > e[1][1]
    );
  }
  LiteGraph.isInsideBounding = isInsideBounding;
  function overlapBounding(t, e) {
    var a = t[0] + t[2];
    var o = t[1] + t[3];
    var r = e[0] + e[2];
    var l = e[1] + e[3];
    return !(t[0] > r || t[1] > l || a < e[0] || o < e[1]);
  }
  LiteGraph.overlapBounding = overlapBounding;
  function hex2num(t) {
    "#" == t.charAt(0) && (t = t.slice(1));
    t = t.toUpperCase();
    var e = "0123456789ABCDEF";
    var a = new Array(3);
    var o = 0;
    var r, l;
    for (var n = 0; n < 6; n += 2) {
      r = e.indexOf(t.charAt(n));
      l = e.indexOf(t.charAt(n + 1));
      a[o] = 16 * r + l;
      o++;
    }
    return a;
  }
  LiteGraph.hex2num = hex2num;
  function num2hex(t) {
    var e = "0123456789ABCDEF";
    var a = "#";
    var o, r;
    for (var l = 0; l < 3; l++) {
      o = t[l] / 16;
      r = t[l] % 16;
      a += e.charAt(o) + e.charAt(r);
    }
    return a;
  }
  LiteGraph.num2hex = num2hex;
  /**
   * ContextMenu from LiteGUI
   *
   * @class ContextMenu
   * @constructor
   * @param {Array} values (allows object { title: "Nice text", callback: function ... })
   * @param {Object} options [optional] Some options:\
   * - title: title to show on top of the menu
   * - callback: function to call when an option is clicked, it receives the item information
   * - ignore_item_callbacks: ignores the callback inside the item, it just calls the options.callback
   * - event: you can pass a MouseEvent, this way the ContextMenu appears in that position
   */ function ContextMenu(t, e) {
    e = e || {};
    (this || _global).options = e;
    var a = this || _global;
    if (e.parentMenu)
      if (e.parentMenu.constructor !== (this || _global).constructor) {
        console.error("parentMenu must be of class ContextMenu, ignoring it");
        e.parentMenu = null;
      } else {
        (this || _global).parentMenu = e.parentMenu;
        (this || _global).parentMenu.lock = true;
        (this || _global).parentMenu.current_submenu = this || _global;
      }
    var o = null;
    e.event && (o = e.event.constructor.name);
    if ("MouseEvent" !== o && "CustomEvent" !== o && "PointerEvent" !== o) {
      console.error(
        "Event passed to ContextMenu is not of type MouseEvent or CustomEvent. Ignoring it. (" +
          o +
          ")"
      );
      e.event = null;
    }
    var r = document.createElement("div");
    r.className = "litegraph litecontextmenu litemenubar-panel";
    e.className && (r.className += " " + e.className);
    r.style.minWidth = 100;
    r.style.minHeight = 100;
    r.style.pointerEvents = "none";
    setTimeout(function () {
      r.style.pointerEvents = "auto";
    }, 100);
    LiteGraph.pointerListenerAdd(
      r,
      "up",
      function (t) {
        t.preventDefault();
        return true;
      },
      true
    );
    r.addEventListener(
      "contextmenu",
      function (t) {
        if (2 != t.button) return false;
        t.preventDefault();
        return false;
      },
      true
    );
    LiteGraph.pointerListenerAdd(
      r,
      "down",
      function (t) {
        if (2 == t.button) {
          a.close();
          t.preventDefault();
          return true;
        }
      },
      true
    );
    function on_mouse_wheel(t) {
      var a = parseInt(r.style.top);
      r.style.top = (a + t.deltaY * e.scroll_speed).toFixed() + "px";
      t.preventDefault();
      return true;
    }
    e.scroll_speed || (e.scroll_speed = 0.1);
    r.addEventListener("wheel", on_mouse_wheel, true);
    r.addEventListener("mousewheel", on_mouse_wheel, true);
    (this || _global).root = r;
    if (e.title) {
      var l = document.createElement("div");
      l.className = "litemenu-title";
      l.innerHTML = e.title;
      r.appendChild(l);
    }
    var n = 0;
    for (var s = 0; s < t.length; s++) {
      var u = t.constructor == Array ? t[s] : s;
      null != u &&
        u.constructor !== String &&
        (u = void 0 === u.content ? String(u) : u.content);
      var h = t[s];
      this.addItem(u, h, e);
      n++;
    }
    LiteGraph.pointerListenerAdd(r, "enter", function (t) {
      r.closing_timer && clearTimeout(r.closing_timer);
    });
    var p = document;
    e.event && (p = e.event.target.ownerDocument);
    p || (p = document);
    p.fullscreenElement
      ? p.fullscreenElement.appendChild(r)
      : p.body.appendChild(r);
    var _ = e.left || 0;
    var g = e.top || 0;
    if (e.event) {
      _ = e.event.clientX - 10;
      g = e.event.clientY - 10;
      e.title && (g -= 20);
      if (e.parentMenu) {
        var d = e.parentMenu.root.getBoundingClientRect();
        _ = d.left + d.width;
      }
      var c = document.body.getBoundingClientRect();
      var b = r.getBoundingClientRect();
      0 == c.height &&
        console.error(
          "document.body height is 0. That is dangerous, set html,body { height: 100%; }"
        );
      c.width && _ > c.width - b.width - 10 && (_ = c.width - b.width - 10);
      c.height &&
        g > c.height - b.height - 10 &&
        (g = c.height - b.height - 10);
    }
    r.style.left = _ + "px";
    r.style.top = g + "px";
    e.scale && (r.style.transform = "scale(" + e.scale + ")");
  }
  ContextMenu.prototype.addItem = function (t, e, a) {
    var o = this || _global;
    a = a || {};
    var r = document.createElement("div");
    r.className = "litemenu-entry submenu";
    var l = false;
    if (null === e) r.classList.add("separator");
    else {
      r.innerHTML = e && e.title ? e.title : t;
      r.value = e;
      if (e) {
        if (e.disabled) {
          l = true;
          r.classList.add("disabled");
        }
        (e.submenu || e.has_submenu) && r.classList.add("has_submenu");
      }
      if ("function" == typeof e) {
        r.dataset.value = t;
        r.onclick_callback = e;
      } else r.dataset.value = e;
      e.className && (r.className += " " + e.className);
    }
    (this || _global).root.appendChild(r);
    l || r.addEventListener("click", inner_onclick);
    a.autoopen && LiteGraph.pointerListenerAdd(r, "enter", inner_over);
    function inner_over(t) {
      var e = (this || _global).value;
      e && e.has_submenu && inner_onclick.call(this || _global, t);
    }
    function inner_onclick(t) {
      var e = (this || _global).value;
      var r = true;
      o.current_submenu && o.current_submenu.close(t);
      if (a.callback) {
        var l = a.callback.call(this || _global, e, a, t, o, a.node);
        true === l && (r = false);
      }
      if (e) {
        if (e.callback && !a.ignore_item_callbacks && true !== e.disabled) {
          l = e.callback.call(this || _global, e, a, t, o, a.extra);
          true === l && (r = false);
        }
        if (e.submenu) {
          if (!e.submenu.options) throw "ContextMenu submenu needs options";
          new o.constructor(e.submenu.options, {
            callback: e.submenu.callback,
            event: t,
            parentMenu: o,
            ignore_item_callbacks: e.submenu.ignore_item_callbacks,
            title: e.submenu.title,
            extra: e.submenu.extra,
            autoopen: a.autoopen,
          });
          r = false;
        }
      }
      r && !o.lock && o.close();
    }
    return r;
  };
  ContextMenu.prototype.close = function (t, e) {
    (this || _global).root.parentNode &&
      (this || _global).root.parentNode.removeChild((this || _global).root);
    if ((this || _global).parentMenu && !e) {
      (this || _global).parentMenu.lock = false;
      (this || _global).parentMenu.current_submenu = null;
      void 0 === t
        ? (this || _global).parentMenu.close()
        : t &&
          !ContextMenu.isCursorOverElement(
            t,
            (this || _global).parentMenu.root
          ) &&
          ContextMenu.trigger(
            (this || _global).parentMenu.root,
            LiteGraph.pointerevents_method + "leave",
            t
          );
    }
    (this || _global).current_submenu &&
      (this || _global).current_submenu.close(t, true);
    (this || _global).root.closing_timer &&
      clearTimeout((this || _global).root.closing_timer);
  };
  ContextMenu.trigger = function (t, e, a, o) {
    var r = document.createEvent("CustomEvent");
    r.initCustomEvent(e, true, true, a);
    r.srcElement = o;
    t.dispatchEvent
      ? t.dispatchEvent(r)
      : t.__events && t.__events.dispatchEvent(r);
    return r;
  };
  ContextMenu.prototype.getTopMenu = function () {
    return (this || _global).options.parentMenu
      ? (this || _global).options.parentMenu.getTopMenu()
      : this || _global;
  };
  ContextMenu.prototype.getFirstEvent = function () {
    return (this || _global).options.parentMenu
      ? (this || _global).options.parentMenu.getFirstEvent()
      : (this || _global).options.event;
  };
  ContextMenu.isCursorOverElement = function (t, e) {
    var a = t.clientX;
    var o = t.clientY;
    var r = e.getBoundingClientRect();
    return (
      !!r &&
      o > r.top &&
      o < r.top + r.height &&
      a > r.left &&
      a < r.left + r.width
    );
  };
  LiteGraph.ContextMenu = ContextMenu;
  LiteGraph.closeAllContextMenus = function (t) {
    t = t || window;
    var e = t.document.querySelectorAll(".litecontextmenu");
    if (e.length) {
      var a = [];
      for (var o = 0; o < e.length; o++) a.push(e[o]);
      for (o = 0; o < a.length; o++)
        a[o].close
          ? a[o].close()
          : a[o].parentNode && a[o].parentNode.removeChild(a[o]);
    }
  };
  LiteGraph.extendClass = function (t, e) {
    for (var a in e) t.hasOwnProperty(a) || (t[a] = e[a]);
    if (e.prototype)
      for (var a in e.prototype)
        if (e.prototype.hasOwnProperty(a) && !t.prototype.hasOwnProperty(a)) {
          e.prototype.__lookupGetter__(a)
            ? t.prototype.__defineGetter__(a, e.prototype.__lookupGetter__(a))
            : (t.prototype[a] = e.prototype[a]);
          e.prototype.__lookupSetter__(a) &&
            t.prototype.__defineSetter__(a, e.prototype.__lookupSetter__(a));
        }
  };
  function CurveEditor(t) {
    (this || _global).points = t;
    (this || _global).selected = -1;
    (this || _global).nearest = -1;
    (this || _global).size = null;
    (this || _global).must_update = true;
    (this || _global).margin = 5;
  }
  CurveEditor.sampleCurve = function (t, e) {
    if (e) {
      for (var a = 0; a < e.length - 1; ++a) {
        var o = e[a];
        var r = e[a + 1];
        if (!(r[0] < t)) {
          var l = r[0] - o[0];
          if (Math.abs(l) < 1e-5) return o[1];
          var n = (t - o[0]) / l;
          return o[1] * (1 - n) + r[1] * n;
        }
      }
      return 0;
    }
  };
  CurveEditor.prototype.draw = function (t, e, a, o, r, l) {
    var n = (this || _global).points;
    if (n) {
      (this || _global).size = e;
      var s = e[0] - 2 * (this || _global).margin;
      var u = e[1] - 2 * (this || _global).margin;
      r = r || "#666";
      t.save();
      t.translate((this || _global).margin, (this || _global).margin);
      if (o) {
        t.fillStyle = "#111";
        t.fillRect(0, 0, s, u);
        t.fillStyle = "#222";
        t.fillRect(0.5 * s, 0, 1, u);
        t.strokeStyle = "#333";
        t.strokeRect(0, 0, s, u);
      }
      t.strokeStyle = r;
      l && (t.globalAlpha = 0.5);
      t.beginPath();
      for (var h = 0; h < n.length; ++h) {
        var p = n[h];
        t.lineTo(p[0] * s, (1 - p[1]) * u);
      }
      t.stroke();
      t.globalAlpha = 1;
      if (!l)
        for (h = 0; h < n.length; ++h) {
          p = n[h];
          t.fillStyle =
            (this || _global).selected == h
              ? "#FFF"
              : (this || _global).nearest == h
              ? "#DDD"
              : "#AAA";
          t.beginPath();
          t.arc(p[0] * s, (1 - p[1]) * u, 2, 0, 2 * Math.PI);
          t.fill();
        }
      t.restore();
    }
  };
  CurveEditor.prototype.onMouseDown = function (t, e) {
    var a = (this || _global).points;
    if (a && !(t[1] < 0)) {
      var o = (this || _global).size[0] - 2 * (this || _global).margin;
      var r = (this || _global).size[1] - 2 * (this || _global).margin;
      var l = t[0] - (this || _global).margin;
      var n = t[1] - (this || _global).margin;
      var s = [l, n];
      var u = 30 / e.ds.scale;
      (this || _global).selected = this.getCloserPoint(s, u);
      if (-1 == (this || _global).selected) {
        var h = [l / o, 1 - n / r];
        a.push(h);
        a.sort(function (t, e) {
          return t[0] - e[0];
        });
        (this || _global).selected = a.indexOf(h);
        (this || _global).must_update = true;
      }
      return -1 != (this || _global).selected || void 0;
    }
  };
  CurveEditor.prototype.onMouseMove = function (t, e) {
    var a = (this || _global).points;
    if (a) {
      var o = (this || _global).selected;
      if (!(o < 0)) {
        var r =
          (t[0] - (this || _global).margin) /
          ((this || _global).size[0] - 2 * (this || _global).margin);
        var l =
          (t[1] - (this || _global).margin) /
          ((this || _global).size[1] - 2 * (this || _global).margin);
        var n = [
          t[0] - (this || _global).margin,
          t[1] - (this || _global).margin,
        ];
        var s = 30 / e.ds.scale;
        (this || _global)._nearest = this.getCloserPoint(n, s);
        var u = a[o];
        if (u) {
          var h = 0 == o || o == a.length - 1;
          if (
            !h &&
            (t[0] < -10 ||
              t[0] > (this || _global).size[0] + 10 ||
              t[1] < -10 ||
              t[1] > (this || _global).size[1] + 10)
          ) {
            a.splice(o, 1);
            (this || _global).selected = -1;
            return;
          }
          u[0] = h ? (0 == o ? 0 : 1) : Math.clamp(r, 0, 1);
          u[1] = 1 - Math.clamp(l, 0, 1);
          a.sort(function (t, e) {
            return t[0] - e[0];
          });
          (this || _global).selected = a.indexOf(u);
          (this || _global).must_update = true;
        }
      }
    }
  };
  CurveEditor.prototype.onMouseUp = function (t, e) {
    (this || _global).selected = -1;
    return false;
  };
  CurveEditor.prototype.getCloserPoint = function (t, e) {
    var a = (this || _global).points;
    if (!a) return -1;
    e = e || 30;
    var o = (this || _global).size[0] - 2 * (this || _global).margin;
    var r = (this || _global).size[1] - 2 * (this || _global).margin;
    var l = a.length;
    var n = [0, 0];
    var s = 1e6;
    var u = -1;
    for (var h = 0; h < l; ++h) {
      var p = a[h];
      n[0] = p[0] * o;
      n[1] = (1 - p[1]) * r;
      n[0] < t[0] && h;
      var _ = vec2.distance(t, n);
      if (!(_ > s || _ > e)) {
        u = h;
        s = _;
      }
    }
    return u;
  };
  LiteGraph.CurveEditor = CurveEditor;
  LiteGraph.getParameterNames = function (t) {
    return (t + "")
      .replace(/[/][/].*$/gm, "")
      .replace(/\s+/g, "")
      .replace(/[/][*][^/*]*[*][/]/g, "")
      .split("){", 1)[0]
      .replace(/^[^(]*[(]/, "")
      .replace(/=[^,]+/g, "")
      .split(",")
      .filter(Boolean);
  };
  LiteGraph.pointerListenerAdd = function (t, e, a, o = false) {
    if (t && t.addEventListener && e && "function" === typeof a) {
      var r = LiteGraph.pointerevents_method;
      var l = e;
      if ("pointer" == r && !window.PointerEvent) {
        console.warn("sMethod=='pointer' && !window.PointerEvent");
        console.log(
          "Converting pointer[" +
            l +
            "] : down move up cancel enter TO touchstart touchmove touchend, etc .."
        );
        switch (l) {
          case "down":
            r = "touch";
            l = "start";
            break;
          case "move":
            r = "touch";
            break;
          case "up":
            r = "touch";
            l = "end";
            break;
          case "cancel":
            r = "touch";
            break;
          case "enter":
            console.log("debug: Should I send a move event?");
            break;
          default:
            console.warn(
              "PointerEvent not available in this browser ? The event " +
                l +
                " would not be called"
            );
        }
      }
      switch (l) {
        case "down":
        case "up":
        case "move":
        case "over":
        case "out":
        case "enter":
          t.addEventListener(r + l, a, o);
        case "leave":
        case "cancel":
        case "gotpointercapture":
        case "lostpointercapture":
          if ("mouse" != r) return t.addEventListener(r + l, a, o);
        default:
          return t.addEventListener(l, a, o);
      }
    }
  };
  LiteGraph.pointerListenerRemove = function (t, e, a, o = false) {
    if (t && t.removeEventListener && e && "function" === typeof a)
      switch (e) {
        case "down":
        case "up":
        case "move":
        case "over":
        case "out":
        case "enter":
          ("pointer" != LiteGraph.pointerevents_method &&
            "mouse" != LiteGraph.pointerevents_method) ||
            t.removeEventListener(LiteGraph.pointerevents_method + e, a, o);
        case "leave":
        case "cancel":
        case "gotpointercapture":
        case "lostpointercapture":
          if ("pointer" == LiteGraph.pointerevents_method)
            return t.removeEventListener(
              LiteGraph.pointerevents_method + e,
              a,
              o
            );
        default:
          return t.removeEventListener(e, a, o);
      }
  };
  Math.clamp = function (t, e, a) {
    return e > t ? e : a < t ? a : t;
  };
  "undefined" == typeof window ||
    window.requestAnimationFrame ||
    (window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (t) {
        window.setTimeout(t, 1e3 / 60);
      });
})(exports);
exports.LiteGraph = exports.LiteGraph;
(function (t) {
  var e = t.LiteGraph;
  function Time() {
    this.addOutput("in ms", "number");
    this.addOutput("in sec", "number");
  }
  Time.title = "Time";
  Time.desc = "Time";
  Time.prototype.onExecute = function () {
    this.setOutputData(0, 1e3 * (this || _global).graph.globaltime);
    this.setOutputData(1, (this || _global).graph.globaltime);
  };
  e.registerNodeType("basic/time", Time);
  function Subgraph() {
    (this || _global).size = [140, 80];
    (this || _global).properties = { enabled: true };
    (this || _global).enabled = true;
    (this || _global).subgraph = new e.LGraph();
    (this || _global).subgraph._subgraph_node = this || _global;
    (this || _global).subgraph._is_subgraph = true;
    (this || _global).subgraph.onTrigger = (
      this || _global
    ).onSubgraphTrigger.bind(this || _global);
    (this || _global).subgraph.onInputAdded = (
      this || _global
    ).onSubgraphNewInput.bind(this || _global);
    (this || _global).subgraph.onInputRenamed = (
      this || _global
    ).onSubgraphRenamedInput.bind(this || _global);
    (this || _global).subgraph.onInputTypeChanged = (
      this || _global
    ).onSubgraphTypeChangeInput.bind(this || _global);
    (this || _global).subgraph.onInputRemoved = (
      this || _global
    ).onSubgraphRemovedInput.bind(this || _global);
    (this || _global).subgraph.onOutputAdded = (
      this || _global
    ).onSubgraphNewOutput.bind(this || _global);
    (this || _global).subgraph.onOutputRenamed = (
      this || _global
    ).onSubgraphRenamedOutput.bind(this || _global);
    (this || _global).subgraph.onOutputTypeChanged = (
      this || _global
    ).onSubgraphTypeChangeOutput.bind(this || _global);
    (this || _global).subgraph.onOutputRemoved = (
      this || _global
    ).onSubgraphRemovedOutput.bind(this || _global);
  }
  Subgraph.title = "Subgraph";
  Subgraph.desc = "Graph inside a node";
  Subgraph.title_color = "#334";
  Subgraph.prototype.onGetInputs = function () {
    return [["enabled", "boolean"]];
  };
  Subgraph.prototype.onDblClick = function (t, e, a) {
    var o = this || _global;
    setTimeout(function () {
      a.openSubgraph(o.subgraph);
    }, 10);
  };
  Subgraph.prototype.onAction = function (t, e) {
    (this || _global).subgraph.onAction(t, e);
  };
  Subgraph.prototype.onExecute = function () {
    (this || _global).enabled = this.getInputOrProperty("enabled");
    if ((this || _global).enabled) {
      if ((this || _global).inputs)
        for (var t = 0; t < (this || _global).inputs.length; t++) {
          var e = (this || _global).inputs[t];
          var a = this.getInputData(t);
          (this || _global).subgraph.setInputData(e.name, a);
        }
      (this || _global).subgraph.runStep();
      if ((this || _global).outputs)
        for (t = 0; t < (this || _global).outputs.length; t++) {
          var o = (this || _global).outputs[t];
          a = (this || _global).subgraph.getOutputData(o.name);
          this.setOutputData(t, a);
        }
    }
  };
  Subgraph.prototype.sendEventToAllNodes = function (t, e, a) {
    (this || _global).enabled &&
      (this || _global).subgraph.sendEventToAllNodes(t, e, a);
  };
  Subgraph.prototype.onDrawBackground = function (t, a, o, r) {
    if ((this || _global).flags.collapsed) return;
    var l = (this || _global).size[1] - e.NODE_TITLE_HEIGHT + 0.5;
    var n = e.isInsideRectangle(
      r[0],
      r[1],
      (this || _global).pos[0],
      (this || _global).pos[1] + l,
      (this || _global).size[0],
      e.NODE_TITLE_HEIGHT
    );
    let s = e.isInsideRectangle(
      r[0],
      r[1],
      (this || _global).pos[0],
      (this || _global).pos[1] + l,
      (this || _global).size[0] / 2,
      e.NODE_TITLE_HEIGHT
    );
    t.fillStyle = n ? "#555" : "#222";
    t.beginPath();
    (this || _global)._shape == e.BOX_SHAPE
      ? s
        ? t.rect(0, l, (this || _global).size[0] / 2 + 1, e.NODE_TITLE_HEIGHT)
        : t.rect(
            (this || _global).size[0] / 2,
            l,
            (this || _global).size[0] / 2 + 1,
            e.NODE_TITLE_HEIGHT
          )
      : s
      ? t.roundRect(
          0,
          l,
          (this || _global).size[0] / 2 + 1,
          e.NODE_TITLE_HEIGHT,
          [0, 0, 8, 8]
        )
      : t.roundRect(
          (this || _global).size[0] / 2,
          l,
          (this || _global).size[0] / 2 + 1,
          e.NODE_TITLE_HEIGHT,
          [0, 0, 8, 8]
        );
    n
      ? t.fill()
      : t.fillRect(0, l, (this || _global).size[0] + 1, e.NODE_TITLE_HEIGHT);
    t.textAlign = "center";
    t.font = "24px Arial";
    t.fillStyle = n ? "#DDD" : "#999";
    t.fillText("+", 0.25 * (this || _global).size[0], l + 24);
    t.fillText("+", 0.75 * (this || _global).size[0], l + 24);
  };
  Subgraph.prototype.onMouseDown = function (t, a, o) {
    var r = (this || _global).size[1] - e.NODE_TITLE_HEIGHT + 0.5;
    console.log(0);
    if (a[1] > r)
      if (a[0] < (this || _global).size[0] / 2) {
        console.log(1);
        o.showSubgraphPropertiesDialog(this || _global);
      } else {
        console.log(2);
        o.showSubgraphPropertiesDialogRight(this || _global);
      }
  };
  Subgraph.prototype.computeSize = function () {
    var t = (this || _global).inputs ? (this || _global).inputs.length : 0;
    var a = (this || _global).outputs ? (this || _global).outputs.length : 0;
    return [200, Math.max(t, a) * e.NODE_SLOT_HEIGHT + e.NODE_TITLE_HEIGHT];
  };
  Subgraph.prototype.onSubgraphTrigger = function (t, e) {
    var a = this.findOutputSlot(t);
    -1 != a && this.triggerSlot(a);
  };
  Subgraph.prototype.onSubgraphNewInput = function (t, e) {
    var a = this.findInputSlot(t);
    -1 == a && this.addInput(t, e);
  };
  Subgraph.prototype.onSubgraphRenamedInput = function (t, e) {
    var a = this.findInputSlot(t);
    if (-1 != a) {
      var o = this.getInputInfo(a);
      o.name = e;
    }
  };
  Subgraph.prototype.onSubgraphTypeChangeInput = function (t, e) {
    var a = this.findInputSlot(t);
    if (-1 != a) {
      var o = this.getInputInfo(a);
      o.type = e;
    }
  };
  Subgraph.prototype.onSubgraphRemovedInput = function (t) {
    var e = this.findInputSlot(t);
    -1 != e && this.removeInput(e);
  };
  Subgraph.prototype.onSubgraphNewOutput = function (t, e) {
    var a = this.findOutputSlot(t);
    -1 == a && this.addOutput(t, e);
  };
  Subgraph.prototype.onSubgraphRenamedOutput = function (t, e) {
    var a = this.findOutputSlot(t);
    if (-1 != a) {
      var o = this.getOutputInfo(a);
      o.name = e;
    }
  };
  Subgraph.prototype.onSubgraphTypeChangeOutput = function (t, e) {
    var a = this.findOutputSlot(t);
    if (-1 != a) {
      var o = this.getOutputInfo(a);
      o.type = e;
    }
  };
  Subgraph.prototype.onSubgraphRemovedOutput = function (t) {
    var e = this.findOutputSlot(t);
    -1 != e && this.removeOutput(e);
  };
  Subgraph.prototype.getExtraMenuOptions = function (t) {
    var e = this || _global;
    return [
      {
        content: "Open",
        callback: function () {
          t.openSubgraph(e.subgraph);
        },
      },
    ];
  };
  Subgraph.prototype.onResize = function (t) {
    t[1] += 20;
  };
  Subgraph.prototype.serialize = function () {
    var t = e.LGraphNode.prototype.serialize.call(this || _global);
    t.subgraph = (this || _global).subgraph.serialize();
    return t;
  };
  Subgraph.prototype.clone = function () {
    var t = e.createNode((this || _global).type);
    var a = this.serialize();
    delete a.id;
    delete a.inputs;
    delete a.outputs;
    t.configure(a);
    return t;
  };
  Subgraph.prototype.buildFromNodes = function (t) {
    var e = {};
    var a = 0;
    for (var o = 0; o < t.length; ++o) {
      var r = t[o];
      e[r.id] = r;
      a = Math.min(r.pos[0], a);
      Math.max(r.pos[0], a);
    }
    for (o = 0; o < t.length; ++o) {
      r = t[o];
      if (r.inputs)
        for (var l = 0; l < r.inputs.length; ++l) {
          var n = r.inputs[l];
          if (n && n.link) {
            var s = r.graph.links[n.link];
            s &&
              (e[s.origin_id] ||
                (this || _global).subgraph.addInput(n.name, s.type));
          }
        }
      if (r.outputs)
        for (l = 0; l < r.outputs.length; ++l) {
          var u = r.outputs[l];
          if (u && u.links && u.links.length) {
            var h = false;
            for (var p = 0; p < u.links.length; ++p) {
              s = r.graph.links[u.links[p]];
              if (s && !e[s.target_id]) {
                h = true;
                break;
              }
            }
            h;
          }
        }
    }
  };
  e.Subgraph = Subgraph;
  e.registerNodeType("graph/subgraph", Subgraph);
  function GraphInput() {
    this.addOutput("", "number");
    (this || _global).name_in_graph = "";
    (this || _global).properties = { name: "", type: "number", value: 0 };
    var t = this || _global;
    (this || _global).name_widget = this.addWidget(
      "text",
      "Name",
      (this || _global).properties.name,
      function (e) {
        e && t.setProperty("name", e);
      }
    );
    (this || _global).type_widget = this.addWidget(
      "text",
      "Type",
      (this || _global).properties.type,
      function (e) {
        t.setProperty("type", e);
      }
    );
    (this || _global).value_widget = this.addWidget(
      "number",
      "Value",
      (this || _global).properties.value,
      function (e) {
        t.setProperty("value", e);
      }
    );
    (this || _global).widgets_up = true;
    (this || _global).size = [180, 90];
  }
  GraphInput.title = "Input";
  GraphInput.desc = "Input of the graph";
  GraphInput.prototype.onConfigure = function () {
    this.updateType();
  };
  GraphInput.prototype.updateType = function () {
    var t = (this || _global).properties.type;
    (this || _global).type_widget.value = t;
    if ((this || _global).outputs[0].type != t) {
      e.isValidConnection((this || _global).outputs[0].type, t) ||
        this.disconnectOutput(0);
      (this || _global).outputs[0].type = t;
    }
    if ("number" == t) {
      (this || _global).value_widget.type = "number";
      (this || _global).value_widget.value = 0;
    } else if ("boolean" == t) {
      (this || _global).value_widget.type = "toggle";
      (this || _global).value_widget.value = true;
    } else if ("string" == t) {
      (this || _global).value_widget.type = "text";
      (this || _global).value_widget.value = "";
    } else {
      (this || _global).value_widget.type = null;
      (this || _global).value_widget.value = null;
    }
    (this || _global).properties.value = (this || _global).value_widget.value;
    (this || _global).graph &&
      (this || _global).name_in_graph &&
      (this || _global).graph.changeInputType(
        (this || _global).name_in_graph,
        t
      );
  };
  GraphInput.prototype.onPropertyChanged = function (t, e) {
    if ("name" == t) {
      if ("" == e || e == (this || _global).name_in_graph || "enabled" == e)
        return false;
      (this || _global).graph &&
        ((this || _global).name_in_graph
          ? (this || _global).graph.renameInput(
              (this || _global).name_in_graph,
              e
            )
          : (this || _global).graph.addInput(
              e,
              (this || _global).properties.type
            ));
      (this || _global).name_widget.value = e;
      (this || _global).name_in_graph = e;
    } else "type" == t ? this.updateType() : "value" == t;
  };
  GraphInput.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? (this || _global).properties.name
      : (this || _global).title;
  };
  GraphInput.prototype.onAction = function (t, a) {
    (this || _global).properties.type == e.EVENT && this.triggerSlot(0, a);
  };
  GraphInput.prototype.onExecute = function () {
    var t = (this || _global).properties.name;
    var e = (this || _global).graph.inputs[t];
    e
      ? this.setOutputData(
          0,
          void 0 !== e.value ? e.value : (this || _global).properties.value
        )
      : this.setOutputData(0, (this || _global).properties.value);
  };
  GraphInput.prototype.onRemoved = function () {
    (this || _global).name_in_graph &&
      (this || _global).graph.removeInput((this || _global).name_in_graph);
  };
  e.GraphInput = GraphInput;
  e.registerNodeType("graph/input", GraphInput);
  function GraphOutput() {
    this.addInput("", "");
    (this || _global).name_in_graph = "";
    (this || _global).properties = { name: "", type: "" };
    (this || _global).name_widget = this.addWidget(
      "text",
      "Name",
      (this || _global).properties.name,
      "name"
    );
    (this || _global).type_widget = this.addWidget(
      "text",
      "Type",
      (this || _global).properties.type,
      "type"
    );
    (this || _global).widgets_up = true;
    (this || _global).size = [180, 60];
  }
  GraphOutput.title = "Output";
  GraphOutput.desc = "Output of the graph";
  GraphOutput.prototype.onPropertyChanged = function (t, e) {
    if ("name" == t) {
      if ("" == e || e == (this || _global).name_in_graph || "enabled" == e)
        return false;
      (this || _global).graph &&
        ((this || _global).name_in_graph
          ? (this || _global).graph.renameOutput(
              (this || _global).name_in_graph,
              e
            )
          : (this || _global).graph.addOutput(
              e,
              (this || _global).properties.type
            ));
      (this || _global).name_widget.value = e;
      (this || _global).name_in_graph = e;
    } else "type" == t ? this.updateType() : "value" == t;
  };
  GraphOutput.prototype.updateType = function () {
    var t = (this || _global).properties.type;
    (this || _global).type_widget && ((this || _global).type_widget.value = t);
    if ((this || _global).inputs[0].type != t) {
      ("action" != t && "event" != t) || (t = e.EVENT);
      e.isValidConnection((this || _global).inputs[0].type, t) ||
        this.disconnectInput(0);
      (this || _global).inputs[0].type = t;
    }
    (this || _global).graph &&
      (this || _global).name_in_graph &&
      (this || _global).graph.changeOutputType(
        (this || _global).name_in_graph,
        t
      );
  };
  GraphOutput.prototype.onExecute = function () {
    (this || _global)._value = this.getInputData(0);
    (this || _global).graph.setOutputData(
      (this || _global).properties.name,
      (this || _global)._value
    );
  };
  GraphOutput.prototype.onAction = function (t, a) {
    (this || _global).properties.type == e.ACTION &&
      (this || _global).graph.trigger((this || _global).properties.name, a);
  };
  GraphOutput.prototype.onRemoved = function () {
    (this || _global).name_in_graph &&
      (this || _global).graph.removeOutput((this || _global).name_in_graph);
  };
  GraphOutput.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? (this || _global).properties.name
      : (this || _global).title;
  };
  e.GraphOutput = GraphOutput;
  e.registerNodeType("graph/output", GraphOutput);
  function ConstantNumber() {
    this.addOutput("value", "number");
    this.addProperty("value", 1);
    (this || _global).widget = this.addWidget("number", "value", 1, "value");
    (this || _global).widgets_up = true;
    (this || _global).size = [180, 30];
  }
  ConstantNumber.title = "Const Number";
  ConstantNumber.desc = "Constant number";
  ConstantNumber.prototype.onExecute = function () {
    this.setOutputData(0, parseFloat((this || _global).properties.value));
  };
  ConstantNumber.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? (this || _global).properties.value
      : (this || _global).title;
  };
  ConstantNumber.prototype.setValue = function (t) {
    this.setProperty("value", t);
  };
  ConstantNumber.prototype.onDrawBackground = function (t) {
    (this || _global).outputs[0].label = (
      this || _global
    ).properties.value.toFixed(3);
  };
  e.registerNodeType("basic/const", ConstantNumber);
  function ConstantBoolean() {
    this.addOutput("bool", "boolean");
    this.addProperty("value", true);
    (this || _global).widget = this.addWidget("toggle", "value", true, "value");
    (this || _global).serialize_widgets = true;
    (this || _global).widgets_up = true;
    (this || _global).size = [140, 30];
  }
  ConstantBoolean.title = "Const Boolean";
  ConstantBoolean.desc = "Constant boolean";
  ConstantBoolean.prototype.getTitle = ConstantNumber.prototype.getTitle;
  ConstantBoolean.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global).properties.value);
  };
  ConstantBoolean.prototype.setValue = ConstantNumber.prototype.setValue;
  ConstantBoolean.prototype.onGetInputs = function () {
    return [["toggle", e.ACTION]];
  };
  ConstantBoolean.prototype.onAction = function (t) {
    this.setValue(!(this || _global).properties.value);
  };
  e.registerNodeType("basic/boolean", ConstantBoolean);
  function ConstantString() {
    this.addOutput("string", "string");
    this.addProperty("value", "");
    (this || _global).widget = this.addWidget("text", "value", "", "value");
    (this || _global).widgets_up = true;
    (this || _global).size = [180, 30];
  }
  ConstantString.title = "Const String";
  ConstantString.desc = "Constant string";
  ConstantString.prototype.getTitle = ConstantNumber.prototype.getTitle;
  ConstantString.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global).properties.value);
  };
  ConstantString.prototype.setValue = ConstantNumber.prototype.setValue;
  ConstantString.prototype.onDropFile = function (t) {
    var e = this || _global;
    var a = new FileReader();
    a.onload = function (t) {
      e.setProperty("value", t.target.result);
    };
    a.readAsText(t);
  };
  e.registerNodeType("basic/string", ConstantString);
  function ConstantObject() {
    this.addOutput("obj", "object");
    (this || _global).size = [120, 30];
    (this || _global)._object = {};
  }
  ConstantObject.title = "Const Object";
  ConstantObject.desc = "Constant Object";
  ConstantObject.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global)._object);
  };
  e.registerNodeType("basic/object", ConstantObject);
  function ConstantFile() {
    this.addInput("url", "string");
    this.addOutput("file", "string");
    this.addProperty("url", "");
    this.addProperty("type", "text");
    (this || _global).widget = this.addWidget("text", "url", "", "url");
    (this || _global)._data = null;
  }
  ConstantFile.title = "Const File";
  ConstantFile.desc = "Fetches a file from an url";
  ConstantFile["@type"] = {
    type: "enum",
    values: ["text", "arraybuffer", "blob", "json"],
  };
  ConstantFile.prototype.onPropertyChanged = function (t, e) {
    "url" == t &&
      (null == e || "" == e
        ? ((this || _global)._data = null)
        : this.fetchFile(e));
  };
  ConstantFile.prototype.onExecute = function () {
    var t = this.getInputData(0) || (this || _global).properties.url;
    !t ||
      (t == (this || _global)._url &&
        (this || _global)._type == (this || _global).properties.type) ||
      this.fetchFile(t);
    this.setOutputData(0, (this || _global)._data);
  };
  ConstantFile.prototype.setValue = ConstantNumber.prototype.setValue;
  ConstantFile.prototype.fetchFile = function (t) {
    var a = this || _global;
    if (t && t.constructor === String) {
      (this || _global)._url = t;
      (this || _global)._type = (this || _global).properties.type;
      "http" == t.substr(0, 4) &&
        e.proxy &&
        (t = e.proxy + t.substr(t.indexOf(":") + 3));
      fetch(t)
        .then(function (t) {
          if (!t.ok) throw new Error("File not found");
          return "arraybuffer" == a.properties.type
            ? t.arrayBuffer()
            : "text" == a.properties.type
            ? t.text()
            : "json" == a.properties.type
            ? t.json()
            : "blob" == a.properties.type
            ? t.blob()
            : void 0;
        })
        .then(function (t) {
          a._data = t;
          a.boxcolor = "#AEA";
        })
        .catch(function (e) {
          a._data = null;
          a.boxcolor = "red";
          console.error("error fetching file:", t);
        });
    } else {
      a._data = null;
      a.boxcolor = null;
    }
  };
  ConstantFile.prototype.onDropFile = function (t) {
    var e = this || _global;
    (this || _global)._url = t.name;
    (this || _global)._type = (this || _global).properties.type;
    (this || _global).properties.url = t.name;
    var a = new FileReader();
    a.onload = function (t) {
      e.boxcolor = "#AEA";
      var a = t.target.result;
      "json" == e.properties.type && (a = JSON.parse(a));
      e._data = a;
    };
    if ("arraybuffer" == e.properties.type) a.readAsArrayBuffer(t);
    else if ("text" == e.properties.type || "json" == e.properties.type)
      a.readAsText(t);
    else if ("blob" == e.properties.type) return a.readAsBinaryString(t);
  };
  e.registerNodeType("basic/file", ConstantFile);
  function ConstantData() {
    this.addOutput("data", "object");
    this.addProperty("value", "");
    (this || _global).widget = this.addWidget("text", "json", "", "value");
    (this || _global).widgets_up = true;
    (this || _global).size = [140, 30];
    (this || _global)._value = null;
  }
  ConstantData.title = "Const Data";
  ConstantData.desc = "Constant Data";
  ConstantData.prototype.onPropertyChanged = function (t, e) {
    (this || _global).widget.value = e;
    if (null != e && "" != e)
      try {
        (this || _global)._value = JSON.parse(e);
        (this || _global).boxcolor = "#AEA";
      } catch (t) {
        (this || _global).boxcolor = "red";
      }
  };
  ConstantData.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global)._value);
  };
  ConstantData.prototype.setValue = ConstantNumber.prototype.setValue;
  e.registerNodeType("basic/data", ConstantData);
  function ConstantArray() {
    (this || _global)._value = [];
    this.addInput("json", "");
    this.addOutput("arrayOut", "array");
    this.addOutput("length", "number");
    this.addProperty("value", "[]");
    (this || _global).widget = this.addWidget(
      "text",
      "array",
      (this || _global).properties.value,
      "value"
    );
    (this || _global).widgets_up = true;
    (this || _global).size = [140, 50];
  }
  ConstantArray.title = "Const Array";
  ConstantArray.desc = "Constant Array";
  ConstantArray.prototype.onPropertyChanged = function (t, e) {
    (this || _global).widget.value = e;
    if (null != e && "" != e)
      try {
        "[" != e[0]
          ? ((this || _global)._value = JSON.parse("[" + e + "]"))
          : ((this || _global)._value = JSON.parse(e));
        (this || _global).boxcolor = "#AEA";
      } catch (t) {
        (this || _global).boxcolor = "red";
      }
  };
  ConstantArray.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t && t.length) {
      (this || _global)._value || ((this || _global)._value = new Array());
      (this || _global)._value.length = t.length;
      for (var e = 0; e < t.length; ++e) (this || _global)._value[e] = t[e];
    }
    this.setOutputData(0, (this || _global)._value);
    this.setOutputData(
      1,
      ((this || _global)._value && (this || _global)._value.length) || 0
    );
  };
  ConstantArray.prototype.setValue = ConstantNumber.prototype.setValue;
  e.registerNodeType("basic/array", ConstantArray);
  function SetArray() {
    this.addInput("arr", "array");
    this.addInput("value", "");
    this.addOutput("arr", "array");
    (this || _global).properties = { index: 0 };
    (this || _global).widget = this.addWidget(
      "number",
      "i",
      (this || _global).properties.index,
      "index",
      { precision: 0, step: 10, min: 0 }
    );
  }
  SetArray.title = "Set Array";
  SetArray.desc = "Sets index of array";
  SetArray.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t) {
      var e = this.getInputData(1);
      if (void 0 !== e) {
        (this || _global).properties.index &&
          (t[Math.floor((this || _global).properties.index)] = e);
        this.setOutputData(0, t);
      }
    }
  };
  e.registerNodeType("basic/set_array", SetArray);
  function ArrayElement() {
    this.addInput("array", "array,table,string");
    this.addInput("index", "number");
    this.addOutput("value", "");
    this.addProperty("index", 0);
  }
  ArrayElement.title = "Array[i]";
  ArrayElement.desc = "Returns an element from an array";
  ArrayElement.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    null == e && (e = (this || _global).properties.index);
    null != t && null != e && this.setOutputData(0, t[Math.floor(Number(e))]);
  };
  e.registerNodeType("basic/array[]", ArrayElement);
  function TableElement() {
    this.addInput("table", "table");
    this.addInput("row", "number");
    this.addInput("col", "number");
    this.addOutput("value", "");
    this.addProperty("row", 0);
    this.addProperty("column", 0);
  }
  TableElement.title = "Table[row][col]";
  TableElement.desc = "Returns an element from a table";
  TableElement.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    var a = this.getInputData(2);
    null == e && (e = (this || _global).properties.row);
    null == a && (a = (this || _global).properties.column);
    if (null != t && null != e && null != a) {
      e = t[Math.floor(Number(e))];
      e
        ? this.setOutputData(0, e[Math.floor(Number(a))])
        : this.setOutputData(0, null);
    }
  };
  e.registerNodeType("basic/table[][]", TableElement);
  function ObjectProperty() {
    this.addInput("obj", "object");
    this.addOutput("property", 0);
    this.addProperty("value", 0);
    (this || _global).widget = this.addWidget(
      "text",
      "prop.",
      "",
      (this || _global).setValue.bind(this || _global)
    );
    (this || _global).widgets_up = true;
    (this || _global).size = [140, 30];
    (this || _global)._value = null;
  }
  ObjectProperty.title = "Object property";
  ObjectProperty.desc = "Outputs the property of an object";
  ObjectProperty.prototype.setValue = function (t) {
    (this || _global).properties.value = t;
    (this || _global).widget.value = t;
  };
  ObjectProperty.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? "in." + (this || _global).properties.value
      : (this || _global).title;
  };
  ObjectProperty.prototype.onPropertyChanged = function (t, e) {
    (this || _global).widget.value = e;
  };
  ObjectProperty.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && this.setOutputData(0, t[(this || _global).properties.value]);
  };
  e.registerNodeType("basic/object_property", ObjectProperty);
  function ObjectKeys() {
    this.addInput("obj", "");
    this.addOutput("keys", "array");
    (this || _global).size = [140, 30];
  }
  ObjectKeys.title = "Object keys";
  ObjectKeys.desc = "Outputs an array with the keys of an object";
  ObjectKeys.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && this.setOutputData(0, Object.keys(t));
  };
  e.registerNodeType("basic/object_keys", ObjectKeys);
  function SetObject() {
    this.addInput("obj", "");
    this.addInput("value", "");
    this.addOutput("obj", "");
    (this || _global).properties = { property: "" };
    (this || _global).name_widget = this.addWidget(
      "text",
      "prop.",
      (this || _global).properties.property,
      "property"
    );
  }
  SetObject.title = "Set Object";
  SetObject.desc = "Adds propertiesrty to object";
  SetObject.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t) {
      var e = this.getInputData(1);
      if (void 0 !== e) {
        (this || _global).properties.property &&
          (t[(this || _global).properties.property] = e);
        this.setOutputData(0, t);
      }
    }
  };
  e.registerNodeType("basic/set_object", SetObject);
  function MergeObjects() {
    this.addInput("A", "object");
    this.addInput("B", "object");
    this.addOutput("out", "object");
    (this || _global)._result = {};
    var t = this || _global;
    this.addWidget("button", "clear", "", function () {
      t._result = {};
    });
    (this || _global).size = this.computeSize();
  }
  MergeObjects.title = "Merge Objects";
  MergeObjects.desc = "Creates an object copying properties from others";
  MergeObjects.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    var a = (this || _global)._result;
    if (t) for (var o in t) a[o] = t[o];
    if (e) for (var o in e) a[o] = e[o];
    this.setOutputData(0, a);
  };
  e.registerNodeType("basic/merge_objects", MergeObjects);
  function Variable() {
    (this || _global).size = [60, 30];
    this.addInput("in");
    this.addOutput("out");
    (this || _global).properties = {
      varname: "myname",
      container: Variable.LITEGRAPH,
    };
    (this || _global).value = null;
  }
  Variable.title = "Variable";
  Variable.desc = "store/read variable value";
  Variable.LITEGRAPH = 0;
  Variable.GRAPH = 1;
  Variable.GLOBALSCOPE = 2;
  Variable["@container"] = {
    type: "enum",
    values: {
      litegraph: Variable.LITEGRAPH,
      graph: Variable.GRAPH,
      global: Variable.GLOBALSCOPE,
    },
  };
  Variable.prototype.onExecute = function () {
    var t = this.getContainer();
    if (this.isInputConnected(0)) {
      (this || _global).value = this.getInputData(0);
      t[(this || _global).properties.varname] = (this || _global).value;
      this.setOutputData(0, (this || _global).value);
    } else this.setOutputData(0, t[(this || _global).properties.varname]);
  };
  Variable.prototype.getContainer = function () {
    switch ((this || _global).properties.container) {
      case Variable.GRAPH:
        return (this || _global).graph ? (this || _global).graph.vars : {};
      case Variable.GLOBALSCOPE:
        return t;
      case Variable.LITEGRAPH:
      default:
        return e.Globals;
    }
  };
  Variable.prototype.getTitle = function () {
    return (this || _global).properties.varname;
  };
  e.registerNodeType("basic/variable", Variable);
  e.wrapFunctionAsNode("basic/length", length, [""], "number");
  function length(t) {
    return t && null != t.length ? Number(t.length) : 0;
  }
  e.wrapFunctionAsNode(
    "basic/not",
    function (t) {
      return !t;
    },
    [""],
    "boolean"
  );
  function DownloadData() {
    (this || _global).size = [60, 30];
    this.addInput("data", 0);
    this.addInput("download", e.ACTION);
    (this || _global).properties = { filename: "data.json" };
    (this || _global).value = null;
    var t = this || _global;
    this.addWidget("button", "Download", "", function (e) {
      t.value && t.downloadAsFile();
    });
  }
  DownloadData.title = "Download";
  DownloadData.desc = "Download some data";
  DownloadData.prototype.downloadAsFile = function () {
    if (null != (this || _global).value) {
      var t = null;
      t =
        (this || _global).value.constructor === String
          ? (this || _global).value
          : JSON.stringify((this || _global).value);
      var e = new Blob([t]);
      var a = URL.createObjectURL(e);
      var o = document.createElement("a");
      o.setAttribute("href", a);
      o.setAttribute("download", (this || _global).properties.filename);
      o.style.display = "none";
      document.body.appendChild(o);
      o.click();
      document.body.removeChild(o);
      setTimeout(function () {
        URL.revokeObjectURL(a);
      }, 6e4);
    }
  };
  DownloadData.prototype.onAction = function (t, e) {
    var a = this || _global;
    setTimeout(function () {
      a.downloadAsFile();
    }, 100);
  };
  DownloadData.prototype.onExecute = function () {
    (this || _global).inputs[0] &&
      ((this || _global).value = this.getInputData(0));
  };
  DownloadData.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? (this || _global).properties.filename
      : (this || _global).title;
  };
  e.registerNodeType("basic/download", DownloadData);
  function Watch() {
    (this || _global).size = [60, 30];
    this.addInput("value", 0, { label: "" });
    (this || _global).value = 0;
  }
  Watch.title = "Watch";
  Watch.desc = "Show value of input";
  Watch.prototype.onExecute = function () {
    (this || _global).inputs[0] &&
      ((this || _global).value = this.getInputData(0));
  };
  Watch.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? (this || _global).inputs[0].label
      : (this || _global).title;
  };
  Watch.toString = function (t) {
    if (null == t) return "null";
    if (t.constructor === Number) return t.toFixed(3);
    if (t.constructor === Array) {
      var e = "[";
      for (var a = 0; a < t.length; ++a)
        e += Watch.toString(t[a]) + (a + 1 != t.length ? "," : "");
      e += "]";
      return e;
    }
    return String(t);
  };
  Watch.prototype.onDrawBackground = function (t) {
    (this || _global).inputs[0].label = Watch.toString((this || _global).value);
  };
  e.registerNodeType("basic/watch", Watch);
  function Cast() {
    this.addInput("in", 0);
    this.addOutput("out", 0);
    (this || _global).size = [40, 30];
  }
  Cast.title = "Cast";
  Cast.desc = "Allows to connect different types";
  Cast.prototype.onExecute = function () {
    this.setOutputData(0, this.getInputData(0));
  };
  e.registerNodeType("basic/cast", Cast);
  function Console() {
    (this || _global).mode = e.ON_EVENT;
    (this || _global).size = [80, 30];
    this.addProperty("msg", "");
    this.addInput("log", e.EVENT);
    this.addInput("msg", 0);
  }
  Console.title = "Console";
  Console.desc = "Show value inside the console";
  Console.prototype.onAction = function (t, e) {
    var a = this.getInputData(1);
    a || (a = (this || _global).properties.msg);
    a || (a = "Event: " + e);
    "log" == t
      ? console.log(a)
      : "warn" == t
      ? console.warn(a)
      : "error" == t && console.error(a);
  };
  Console.prototype.onExecute = function () {
    var t = this.getInputData(1);
    t || (t = (this || _global).properties.msg);
    if (null != t && "undefined" != typeof t) {
      (this || _global).properties.msg = t;
      console.log(t);
    }
  };
  Console.prototype.onGetInputs = function () {
    return [
      ["log", e.ACTION],
      ["warn", e.ACTION],
      ["error", e.ACTION],
    ];
  };
  e.registerNodeType("basic/console", Console);
  function Alert() {
    (this || _global).mode = e.ON_EVENT;
    this.addProperty("msg", "");
    this.addInput("", e.EVENT);
    (this || _global).widget = this.addWidget("text", "Text", "", "msg");
    (this || _global).widgets_up = true;
    (this || _global).size = [200, 30];
  }
  Alert.title = "Alert";
  Alert.desc = "Show an alert window";
  Alert.color = "#510";
  Alert.prototype.onConfigure = function (t) {
    (this || _global).widget.value = t.properties.msg;
  };
  Alert.prototype.onAction = function (t, e) {
    var a = (this || _global).properties.msg;
    setTimeout(function () {
      alert(a);
    }, 10);
  };
  e.registerNodeType("basic/alert", Alert);
  function NodeScript() {
    (this || _global).size = [60, 30];
    this.addProperty("onExecute", "return A;");
    this.addInput("A", 0);
    this.addInput("B", 0);
    this.addOutput("out", 0);
    (this || _global)._func = null;
    (this || _global).data = {};
  }
  NodeScript.prototype.onConfigure = function (t) {
    t.properties.onExecute && e.allow_scripts
      ? this.compileCode(t.properties.onExecute)
      : console.warn("Script not compiled, LiteGraph.allow_scripts is false");
  };
  NodeScript.title = "Script";
  NodeScript.desc = "executes a code (max 256 characters)";
  NodeScript.widgets_info = { onExecute: { type: "code" } };
  NodeScript.prototype.onPropertyChanged = function (t, a) {
    "onExecute" == t && e.allow_scripts
      ? this.compileCode(a)
      : console.warn("Script not compiled, LiteGraph.allow_scripts is false");
  };
  NodeScript.prototype.compileCode = function (t) {
    (this || _global)._func = null;
    if (t.length > 256) console.warn("Script too long, max 256 chars");
    else {
      var e = t.toLowerCase();
      var a = ["script", "body", "document", "eval", "nodescript", "function"];
      for (var o = 0; o < a.length; ++o)
        if (-1 != e.indexOf(a[o])) {
          console.warn("invalid script");
          return;
        }
      try {
        (this || _global)._func = new Function(
          "A",
          "B",
          "C",
          "DATA",
          "node",
          t
        );
      } catch (t) {
        console.error("Error parsing script");
        console.error(t);
      }
    }
  };
  NodeScript.prototype.onExecute = function () {
    if ((this || _global)._func)
      try {
        var t = this.getInputData(0);
        var e = this.getInputData(1);
        var a = this.getInputData(2);
        this.setOutputData(
          0,
          this._func(t, e, a, (this || _global).data, this || _global)
        );
      } catch (t) {
        console.error("Error in script");
        console.error(t);
      }
  };
  NodeScript.prototype.onGetOutputs = function () {
    return [["C", ""]];
  };
  e.registerNodeType("basic/script", NodeScript);
  function GenericCompare() {
    this.addInput("A", 0);
    this.addInput("B", 0);
    this.addOutput("true", "boolean");
    this.addOutput("false", "boolean");
    this.addProperty("A", 1);
    this.addProperty("B", 1);
    this.addProperty("OP", "==", "enum", { values: GenericCompare.values });
    this.addWidget("combo", "Op.", (this || _global).properties.OP, {
      property: "OP",
      values: GenericCompare.values,
    });
    (this || _global).size = [80, 60];
  }
  GenericCompare.values = ["==", "!="];
  GenericCompare["@OP"] = {
    type: "enum",
    title: "operation",
    values: GenericCompare.values,
  };
  GenericCompare.title = "Compare *";
  GenericCompare.desc = "evaluates condition between A and B";
  GenericCompare.prototype.getTitle = function () {
    return "*A " + (this || _global).properties.OP + " *B";
  };
  GenericCompare.prototype.onExecute = function () {
    var t = this.getInputData(0);
    void 0 === t
      ? (t = (this || _global).properties.A)
      : ((this || _global).properties.A = t);
    var e = this.getInputData(1);
    void 0 === e
      ? (e = (this || _global).properties.B)
      : ((this || _global).properties.B = e);
    var a = false;
    if (typeof t == typeof e)
      switch ((this || _global).properties.OP) {
        case "==":
        case "!=":
          a = true;
          switch (typeof t) {
            case "object":
              var o = Object.getOwnPropertyNames(t);
              var r = Object.getOwnPropertyNames(e);
              if (o.length != r.length) {
                a = false;
                break;
              }
              for (var l = 0; l < o.length; l++) {
                var n = o[l];
                if (t[n] !== e[n]) {
                  a = false;
                  break;
                }
              }
              break;
            default:
              a = t == e;
          }
          "!=" == (this || _global).properties.OP && (a = !a);
          break;
      }
    this.setOutputData(0, a);
    this.setOutputData(1, !a);
  };
  e.registerNodeType("basic/CompareValues", GenericCompare);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function LogEvent() {
    (this || _global).size = [60, 30];
    this.addInput("event", e.ACTION);
  }
  LogEvent.title = "Log Event";
  LogEvent.desc = "Log event in console";
  LogEvent.prototype.onAction = function (t, e, a) {
    console.log(t, e);
  };
  e.registerNodeType("events/log", LogEvent);
  function TriggerEvent() {
    (this || _global).size = [60, 30];
    this.addInput("if", "");
    this.addOutput("true", e.EVENT);
    this.addOutput("change", e.EVENT);
    this.addOutput("false", e.EVENT);
    (this || _global).properties = { only_on_change: true };
    (this || _global).prev = 0;
  }
  TriggerEvent.title = "TriggerEvent";
  TriggerEvent.desc = "Triggers event if input evaluates to true";
  TriggerEvent.prototype.onExecute = function (t, e) {
    var a = this.getInputData(0);
    var o = a != (this || _global).prev;
    0 === (this || _global).prev && (o = false);
    var r =
      (o && (this || _global).properties.only_on_change) ||
      (!o && !(this || _global).properties.only_on_change);
    a && r && this.triggerSlot(0, t, null, e);
    !a && r && this.triggerSlot(2, t, null, e);
    o && this.triggerSlot(1, t, null, e);
    (this || _global).prev = a;
  };
  e.registerNodeType("events/trigger", TriggerEvent);
  function Sequence() {
    var t = this || _global;
    this.addInput("", e.ACTION);
    this.addInput("", e.ACTION);
    this.addInput("", e.ACTION);
    this.addOutput("", e.EVENT);
    this.addOutput("", e.EVENT);
    this.addOutput("", e.EVENT);
    this.addWidget("button", "+", null, function () {
      t.addInput("", e.ACTION);
      t.addOutput("", e.EVENT);
    });
    (this || _global).size = [90, 70];
    (this || _global).flags = { horizontal: true, render_box: false };
  }
  Sequence.title = "Sequence";
  Sequence.desc = "Triggers a sequence of events when an event arrives";
  Sequence.prototype.getTitle = function () {
    return "";
  };
  Sequence.prototype.onAction = function (t, e, a) {
    if ((this || _global).outputs) {
      a = a || {};
      for (var o = 0; o < (this || _global).outputs.length; ++o) {
        (this || _global).outputs[o];
        a.action_call
          ? (a.action_call = a.action_call + "_seq_" + o)
          : (a.action_call =
              (this || _global).id +
              "_" +
              (t || "action") +
              "_seq_" +
              o +
              "_" +
              Math.floor(9999 * Math.random()));
        this.triggerSlot(o, e, null, a);
      }
    }
  };
  e.registerNodeType("events/sequence", Sequence);
  function Stepper() {
    var t = this || _global;
    (this || _global).properties = { index: 0 };
    this.addInput("index", "number");
    this.addInput("step", e.ACTION);
    this.addInput("reset", e.ACTION);
    this.addOutput("index", "number");
    this.addOutput("", e.EVENT);
    this.addOutput("", e.EVENT);
    this.addOutput("", e.EVENT, { removable: true });
    this.addWidget("button", "+", null, function () {
      t.addOutput("", e.EVENT, { removable: true });
    });
    (this || _global).size = [120, 120];
    (this || _global).flags = { render_box: false };
  }
  Stepper.title = "Stepper";
  Stepper.desc = "Trigger events sequentially when an tick arrives";
  Stepper.prototype.onDrawBackground = function (t) {
    if (!(this || _global).flags.collapsed) {
      var a = (this || _global).properties.index || 0;
      t.fillStyle = "#AFB";
      var o = (this || _global).size[0];
      var r = (a + 1) * e.NODE_SLOT_HEIGHT + 4;
      t.beginPath();
      t.moveTo(o - 30, r);
      t.lineTo(o - 30, r + e.NODE_SLOT_HEIGHT);
      t.lineTo(o - 15, r + 0.5 * e.NODE_SLOT_HEIGHT);
      t.fill();
    }
  };
  Stepper.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      t = Math.floor(t);
      t = Math.clamp(
        t,
        0,
        (this || _global).outputs ? (this || _global).outputs.length - 2 : 0
      );
      if (t != (this || _global).properties.index) {
        (this || _global).properties.index = t;
        this.triggerSlot(t + 1);
      }
    }
    this.setOutputData(0, (this || _global).properties.index);
  };
  Stepper.prototype.onAction = function (t, e) {
    if ("reset" == t) (this || _global).properties.index = 0;
    else if ("step" == t) {
      this.triggerSlot((this || _global).properties.index + 1, e);
      var a = (this || _global).outputs
        ? (this || _global).outputs.length - 1
        : 0;
      (this || _global).properties.index =
        ((this || _global).properties.index + 1) % a;
    }
  };
  e.registerNodeType("events/stepper", Stepper);
  function FilterEvent() {
    (this || _global).size = [60, 30];
    this.addInput("event", e.ACTION);
    this.addOutput("event", e.EVENT);
    (this || _global).properties = {
      equal_to: "",
      has_property: "",
      property_equal_to: "",
    };
  }
  FilterEvent.title = "Filter Event";
  FilterEvent.desc = "Blocks events that do not match the filter";
  FilterEvent.prototype.onAction = function (t, e, a) {
    if (
      null != e &&
      (!(this || _global).properties.equal_to ||
        (this || _global).properties.equal_to == e)
    ) {
      if ((this || _global).properties.has_property) {
        var o = e[(this || _global).properties.has_property];
        if (null == o) return;
        if (
          (this || _global).properties.property_equal_to &&
          (this || _global).properties.property_equal_to != o
        )
          return;
      }
      this.triggerSlot(0, e, null, a);
    }
  };
  e.registerNodeType("events/filter", FilterEvent);
  function EventBranch() {
    this.addInput("in", e.ACTION);
    this.addInput("cond", "boolean");
    this.addOutput("true", e.EVENT);
    this.addOutput("false", e.EVENT);
    (this || _global).size = [120, 60];
    (this || _global)._value = false;
  }
  EventBranch.title = "Branch";
  EventBranch.desc =
    "If condition is true, outputs triggers true, otherwise false";
  EventBranch.prototype.onExecute = function () {
    (this || _global)._value = this.getInputData(1);
  };
  EventBranch.prototype.onAction = function (t, e, a) {
    (this || _global)._value = this.getInputData(1);
    this.triggerSlot((this || _global)._value ? 0 : 1, e, null, a);
  };
  e.registerNodeType("events/branch", EventBranch);
  function EventCounter() {
    this.addInput("inc", e.ACTION);
    this.addInput("dec", e.ACTION);
    this.addInput("reset", e.ACTION);
    this.addOutput("change", e.EVENT);
    this.addOutput("num", "number");
    this.addProperty("doCountExecution", false, "boolean", {
      name: "Count Executions",
    });
    this.addWidget(
      "toggle",
      "Count Exec.",
      (this || _global).properties.doCountExecution,
      "doCountExecution"
    );
    (this || _global).num = 0;
  }
  EventCounter.title = "Counter";
  EventCounter.desc = "Counts events";
  EventCounter.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? String((this || _global).num)
      : (this || _global).title;
  };
  EventCounter.prototype.onAction = function (t, e, a) {
    var o = (this || _global).num;
    "inc" == t
      ? ((this || _global).num += 1)
      : "dec" == t
      ? ((this || _global).num -= 1)
      : "reset" == t && ((this || _global).num = 0);
    (this || _global).num != o && this.trigger("change", (this || _global).num);
  };
  EventCounter.prototype.onDrawBackground = function (t) {
    if (!(this || _global).flags.collapsed) {
      t.fillStyle = "#AAA";
      t.font = "20px Arial";
      t.textAlign = "center";
      t.fillText(
        (this || _global).num,
        0.5 * (this || _global).size[0],
        0.5 * (this || _global).size[1]
      );
    }
  };
  EventCounter.prototype.onExecute = function () {
    (this || _global).properties.doCountExecution &&
      ((this || _global).num += 1);
    this.setOutputData(1, (this || _global).num);
  };
  e.registerNodeType("events/counter", EventCounter);
  function DelayEvent() {
    (this || _global).size = [60, 30];
    this.addProperty("time_in_ms", 1e3);
    this.addInput("event", e.ACTION);
    this.addOutput("on_time", e.EVENT);
    (this || _global)._pending = [];
  }
  DelayEvent.title = "Delay";
  DelayEvent.desc = "Delays one event";
  DelayEvent.prototype.onAction = function (t, e, a) {
    var o = (this || _global).properties.time_in_ms;
    o <= 0 ? this.trigger(null, e, a) : (this || _global)._pending.push([o, e]);
  };
  DelayEvent.prototype.onExecute = function (t, e) {
    var a = 1e3 * (this || _global).graph.elapsed_time;
    this.isInputConnected(1) &&
      ((this || _global).properties.time_in_ms = this.getInputData(1));
    for (var o = 0; o < (this || _global)._pending.length; ++o) {
      var r = (this || _global)._pending[o];
      r[0] -= a;
      if (!(r[0] > 0)) {
        (this || _global)._pending.splice(o, 1);
        --o;
        this.trigger(null, r[1], e);
      }
    }
  };
  DelayEvent.prototype.onGetInputs = function () {
    return [
      ["event", e.ACTION],
      ["time_in_ms", "number"],
    ];
  };
  e.registerNodeType("events/delay", DelayEvent);
  function TimerEvent() {
    this.addProperty("interval", 1e3);
    this.addProperty("event", "tick");
    this.addOutput("on_tick", e.EVENT);
    (this || _global).time = 0;
    (this || _global).last_interval = 1e3;
    (this || _global).triggered = false;
  }
  TimerEvent.title = "Timer";
  TimerEvent.desc = "Sends an event every N milliseconds";
  TimerEvent.prototype.onStart = function () {
    (this || _global).time = 0;
  };
  TimerEvent.prototype.getTitle = function () {
    return "Timer: " + (this || _global).last_interval.toString() + "ms";
  };
  TimerEvent.on_color = "#AAA";
  TimerEvent.off_color = "#222";
  TimerEvent.prototype.onDrawBackground = function () {
    (this || _global).boxcolor = (this || _global).triggered
      ? TimerEvent.on_color
      : TimerEvent.off_color;
    (this || _global).triggered = false;
  };
  TimerEvent.prototype.onExecute = function () {
    var t = 1e3 * (this || _global).graph.elapsed_time;
    var e = 0 == (this || _global).time;
    (this || _global).time += t;
    (this || _global).last_interval = Math.max(
      1,
      0 | this.getInputOrProperty("interval")
    );
    if (
      e ||
      !(
        (this || _global).time < (this || _global).last_interval ||
        isNaN((this || _global).last_interval)
      )
    ) {
      (this || _global).triggered = true;
      (this || _global).time =
        (this || _global).time % (this || _global).last_interval;
      this.trigger("on_tick", (this || _global).properties.event);
      (this || _global).inputs &&
        (this || _global).inputs.length > 1 &&
        (this || _global).inputs[1] &&
        this.setOutputData(1, true);
    } else
      (this || _global).inputs &&
        (this || _global).inputs.length > 1 &&
        (this || _global).inputs[1] &&
        this.setOutputData(1, false);
  };
  TimerEvent.prototype.onGetInputs = function () {
    return [["interval", "number"]];
  };
  TimerEvent.prototype.onGetOutputs = function () {
    return [["tick", "boolean"]];
  };
  e.registerNodeType("events/timer", TimerEvent);
  function SemaphoreEvent() {
    this.addInput("go", e.ACTION);
    this.addInput("green", e.ACTION);
    this.addInput("red", e.ACTION);
    this.addOutput("continue", e.EVENT);
    this.addOutput("blocked", e.EVENT);
    this.addOutput("is_green", "boolean");
    (this || _global)._ready = false;
    (this || _global).properties = {};
    var t = this || _global;
    this.addWidget("button", "reset", "", function () {
      t._ready = false;
    });
  }
  SemaphoreEvent.title = "Semaphore Event";
  SemaphoreEvent.desc =
    "Until both events are not triggered, it doesnt continue.";
  SemaphoreEvent.prototype.onExecute = function () {
    this.setOutputData(1, (this || _global)._ready);
    (this || _global).boxcolor = (this || _global)._ready ? "#9F9" : "#FA5";
  };
  SemaphoreEvent.prototype.onAction = function (t, e) {
    "go" == t
      ? this.triggerSlot((this || _global)._ready ? 0 : 1)
      : "green" == t
      ? ((this || _global)._ready = true)
      : "red" == t && ((this || _global)._ready = false);
  };
  e.registerNodeType("events/semaphore", SemaphoreEvent);
  function OnceEvent() {
    this.addInput("in", e.ACTION);
    this.addInput("reset", e.ACTION);
    this.addOutput("out", e.EVENT);
    (this || _global)._once = false;
    (this || _global).properties = {};
    var t = this || _global;
    this.addWidget("button", "reset", "", function () {
      t._once = false;
    });
  }
  OnceEvent.title = "Once";
  OnceEvent.desc = "Only passes an event once, then gets locked";
  OnceEvent.prototype.onAction = function (t, e) {
    if ("in" != t || (this || _global)._once)
      "reset" == t && ((this || _global)._once = false);
    else {
      (this || _global)._once = true;
      this.triggerSlot(0, e);
    }
  };
  e.registerNodeType("events/once", OnceEvent);
  function DataStore() {
    this.addInput("data", 0);
    this.addInput("assign", e.ACTION);
    this.addOutput("data", 0);
    (this || _global)._last_value = null;
    (this || _global).properties = { data: null, serialize: true };
    var t = this || _global;
    this.addWidget("button", "store", "", function () {
      t.properties.data = t._last_value;
    });
  }
  DataStore.title = "Data Store";
  DataStore.desc = "Stores data and only changes when event is received";
  DataStore.prototype.onExecute = function () {
    (this || _global)._last_value = this.getInputData(0);
    this.setOutputData(0, (this || _global).properties.data);
  };
  DataStore.prototype.onAction = function (t, e, a) {
    (this || _global).properties.data = (this || _global)._last_value;
  };
  DataStore.prototype.onSerialize = function (t) {
    null != t.data &&
      (false == (this || _global).properties.serialize ||
        (t.data.constructor !== String &&
          t.data.constructor !== Number &&
          t.data.constructor !== Boolean &&
          t.data.constructor !== Array &&
          t.data.constructor !== Object)) &&
      (t.data = null);
  };
  e.registerNodeType("basic/data_store", DataStore);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function WidgetButton() {
    this.addOutput("", e.EVENT);
    this.addOutput("", "boolean");
    this.addProperty("text", "click me");
    this.addProperty("font_size", 30);
    this.addProperty("message", "");
    (this || _global).size = [164, 84];
    (this || _global).clicked = false;
  }
  WidgetButton.title = "Button";
  WidgetButton.desc = "Triggers an event";
  WidgetButton.font = "Arial";
  WidgetButton.prototype.onDrawForeground = function (t) {
    if (!(this || _global).flags.collapsed) {
      var e = 10;
      t.fillStyle = "black";
      t.fillRect(
        e + 1,
        e + 1,
        (this || _global).size[0] - 2 * e,
        (this || _global).size[1] - 2 * e
      );
      t.fillStyle = "#AAF";
      t.fillRect(
        e - 1,
        e - 1,
        (this || _global).size[0] - 2 * e,
        (this || _global).size[1] - 2 * e
      );
      t.fillStyle = (this || _global).clicked
        ? "white"
        : (this || _global).mouseOver
        ? "#668"
        : "#334";
      t.fillRect(
        e,
        e,
        (this || _global).size[0] - 2 * e,
        (this || _global).size[1] - 2 * e
      );
      if (
        (this || _global).properties.text ||
        0 === (this || _global).properties.text
      ) {
        var a = (this || _global).properties.font_size || 30;
        t.textAlign = "center";
        t.fillStyle = (this || _global).clicked ? "black" : "white";
        t.font = a + "px " + WidgetButton.font;
        t.fillText(
          (this || _global).properties.text,
          0.5 * (this || _global).size[0],
          0.5 * (this || _global).size[1] + 0.3 * a
        );
        t.textAlign = "left";
      }
    }
  };
  WidgetButton.prototype.onMouseDown = function (t, e) {
    if (
      e[0] > 1 &&
      e[1] > 1 &&
      e[0] < (this || _global).size[0] - 2 &&
      e[1] < (this || _global).size[1] - 2
    ) {
      (this || _global).clicked = true;
      this.setOutputData(1, (this || _global).clicked);
      this.triggerSlot(0, (this || _global).properties.message);
      return true;
    }
  };
  WidgetButton.prototype.onExecute = function () {
    this.setOutputData(1, (this || _global).clicked);
  };
  WidgetButton.prototype.onMouseUp = function (t) {
    (this || _global).clicked = false;
  };
  e.registerNodeType("widget/button", WidgetButton);
  function WidgetToggle() {
    this.addInput("", "boolean");
    this.addInput("e", e.ACTION);
    this.addOutput("v", "boolean");
    this.addOutput("e", e.EVENT);
    (this || _global).properties = { font: "", value: false };
    (this || _global).size = [160, 44];
  }
  WidgetToggle.title = "Toggle";
  WidgetToggle.desc = "Toggles between true or false";
  WidgetToggle.prototype.onDrawForeground = function (t) {
    if (!(this || _global).flags.collapsed) {
      var e = 0.5 * (this || _global).size[1];
      var a = 0.25;
      var o = 0.8 * (this || _global).size[1];
      t.font =
        (this || _global).properties.font || (0.8 * e).toFixed(0) + "px Arial";
      var r = t.measureText((this || _global).title).width;
      var l = 0.5 * ((this || _global).size[0] - (r + e));
      t.fillStyle = "#AAA";
      t.fillRect(l, o - e, e, e);
      t.fillStyle = (this || _global).properties.value ? "#AEF" : "#000";
      t.fillRect(l + e * a, o - e + e * a, e * (1 - 2 * a), e * (1 - 2 * a));
      t.textAlign = "left";
      t.fillStyle = "#AAA";
      t.fillText((this || _global).title, 1.2 * e + l, 0.85 * o);
      t.textAlign = "left";
    }
  };
  WidgetToggle.prototype.onAction = function (t) {
    (this || _global).properties.value = !(this || _global).properties.value;
    this.trigger("e", (this || _global).properties.value);
  };
  WidgetToggle.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && ((this || _global).properties.value = t);
    this.setOutputData(0, (this || _global).properties.value);
  };
  WidgetToggle.prototype.onMouseDown = function (t, e) {
    if (
      e[0] > 1 &&
      e[1] > 1 &&
      e[0] < (this || _global).size[0] - 2 &&
      e[1] < (this || _global).size[1] - 2
    ) {
      (this || _global).properties.value = !(this || _global).properties.value;
      (this || _global).graph._version++;
      this.trigger("e", (this || _global).properties.value);
      return true;
    }
  };
  e.registerNodeType("widget/toggle", WidgetToggle);
  function WidgetNumber() {
    this.addOutput("", "number");
    (this || _global).size = [80, 60];
    (this || _global).properties = { min: -1e3, max: 1e3, value: 1, step: 1 };
    (this || _global).old_y = -1;
    (this || _global)._remainder = 0;
    (this || _global)._precision = 0;
    (this || _global).mouse_captured = false;
  }
  WidgetNumber.title = "Number";
  WidgetNumber.desc = "Widget to select number value";
  WidgetNumber.pixels_threshold = 10;
  WidgetNumber.markers_color = "#666";
  WidgetNumber.prototype.onDrawForeground = function (t) {
    var e = 0.5 * (this || _global).size[0];
    var a = (this || _global).size[1];
    if (a > 30) {
      t.fillStyle = WidgetNumber.markers_color;
      t.beginPath();
      t.moveTo(e, 0.1 * a);
      t.lineTo(e + 0.1 * a, 0.2 * a);
      t.lineTo(e + -0.1 * a, 0.2 * a);
      t.fill();
      t.beginPath();
      t.moveTo(e, 0.9 * a);
      t.lineTo(e + 0.1 * a, 0.8 * a);
      t.lineTo(e + -0.1 * a, 0.8 * a);
      t.fill();
      t.font = (0.7 * a).toFixed(1) + "px Arial";
    } else t.font = (0.8 * a).toFixed(1) + "px Arial";
    t.textAlign = "center";
    t.font = (0.7 * a).toFixed(1) + "px Arial";
    t.fillStyle = "#EEE";
    t.fillText(
      (this || _global).properties.value.toFixed((this || _global)._precision),
      e,
      0.75 * a
    );
  };
  WidgetNumber.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global).properties.value);
  };
  WidgetNumber.prototype.onPropertyChanged = function (t, e) {
    var a = ((this || _global).properties.step + "").split(".");
    (this || _global)._precision = a.length > 1 ? a[1].length : 0;
  };
  WidgetNumber.prototype.onMouseDown = function (t, e) {
    if (!(e[1] < 0)) {
      (this || _global).old_y = t.canvasY;
      this.captureInput(true);
      (this || _global).mouse_captured = true;
      return true;
    }
  };
  WidgetNumber.prototype.onMouseMove = function (t) {
    if ((this || _global).mouse_captured) {
      var e = (this || _global).old_y - t.canvasY;
      t.shiftKey && (e *= 10);
      (t.metaKey || t.altKey) && (e *= 0.1);
      (this || _global).old_y = t.canvasY;
      var a = (this || _global)._remainder + e / WidgetNumber.pixels_threshold;
      (this || _global)._remainder = a % 1;
      a |= 0;
      var o = Math.clamp(
        (this || _global).properties.value +
          a * (this || _global).properties.step,
        (this || _global).properties.min,
        (this || _global).properties.max
      );
      (this || _global).properties.value = o;
      (this || _global).graph._version++;
      this.setDirtyCanvas(true);
    }
  };
  WidgetNumber.prototype.onMouseUp = function (t, e) {
    if (t.click_time < 200) {
      var a = e[1] > 0.5 * (this || _global).size[1] ? -1 : 1;
      (this || _global).properties.value = Math.clamp(
        (this || _global).properties.value +
          a * (this || _global).properties.step,
        (this || _global).properties.min,
        (this || _global).properties.max
      );
      (this || _global).graph._version++;
      this.setDirtyCanvas(true);
    }
    if ((this || _global).mouse_captured) {
      (this || _global).mouse_captured = false;
      this.captureInput(false);
    }
  };
  e.registerNodeType("widget/number", WidgetNumber);
  function WidgetCombo() {
    this.addOutput("", "string");
    this.addOutput("change", e.EVENT);
    (this || _global).size = [80, 60];
    (this || _global).properties = { value: "A", values: "A;B;C" };
    (this || _global).old_y = -1;
    (this || _global).mouse_captured = false;
    (this || _global)._values = (this || _global).properties.values.split(";");
    var t = this || _global;
    (this || _global).widgets_up = true;
    (this || _global).widget = this.addWidget(
      "combo",
      "",
      (this || _global).properties.value,
      function (e) {
        t.properties.value = e;
        t.triggerSlot(1, e);
      },
      { property: "value", values: (this || _global)._values }
    );
  }
  WidgetCombo.title = "Combo";
  WidgetCombo.desc = "Widget to select from a list";
  WidgetCombo.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global).properties.value);
  };
  WidgetCombo.prototype.onPropertyChanged = function (t, e) {
    if ("values" == t) {
      (this || _global)._values = e.split(";");
      (this || _global).widget.options.values = (this || _global)._values;
    } else "value" == t && ((this || _global).widget.value = e);
  };
  e.registerNodeType("widget/combo", WidgetCombo);
  function WidgetKnob() {
    this.addOutput("", "number");
    (this || _global).size = [64, 84];
    (this || _global).properties = {
      min: 0,
      max: 1,
      value: 0.5,
      color: "#7AF",
      precision: 2,
    };
    (this || _global).value = -1;
  }
  WidgetKnob.title = "Knob";
  WidgetKnob.desc = "Circular controller";
  WidgetKnob.size = [80, 100];
  WidgetKnob.prototype.onDrawForeground = function (t) {
    if (!(this || _global).flags.collapsed) {
      -1 == (this || _global).value &&
        ((this || _global).value =
          ((this || _global).properties.value -
            (this || _global).properties.min) /
          ((this || _global).properties.max -
            (this || _global).properties.min));
      var e = 0.5 * (this || _global).size[0];
      var a = 0.5 * (this || _global).size[1];
      var o =
        0.5 * Math.min((this || _global).size[0], (this || _global).size[1]) -
        5;
      Math.floor(0.05 * o);
      t.globalAlpha = 1;
      t.save();
      t.translate(e, a);
      t.rotate(0.75 * Math.PI);
      t.fillStyle = "rgba(0,0,0,0.5)";
      t.beginPath();
      t.moveTo(0, 0);
      t.arc(0, 0, o, 0, 1.5 * Math.PI);
      t.fill();
      t.strokeStyle = "black";
      t.fillStyle = (this || _global).properties.color;
      t.lineWidth = 2;
      t.beginPath();
      t.moveTo(0, 0);
      t.arc(
        0,
        0,
        o - 4,
        0,
        1.5 * Math.PI * Math.max(0.01, (this || _global).value)
      );
      t.closePath();
      t.fill();
      t.lineWidth = 1;
      t.globalAlpha = 1;
      t.restore();
      t.fillStyle = "black";
      t.beginPath();
      t.arc(e, a, 0.75 * o, 0, 2 * Math.PI, true);
      t.fill();
      t.fillStyle = (this || _global).mouseOver
        ? "white"
        : (this || _global).properties.color;
      t.beginPath();
      var r = (this || _global).value * Math.PI * 1.5 + 0.75 * Math.PI;
      t.arc(
        e + Math.cos(r) * o * 0.65,
        a + Math.sin(r) * o * 0.65,
        0.05 * o,
        0,
        2 * Math.PI,
        true
      );
      t.fill();
      t.fillStyle = (this || _global).mouseOver ? "white" : "#AAA";
      t.font = Math.floor(0.5 * o) + "px Arial";
      t.textAlign = "center";
      t.fillText(
        (this || _global).properties.value.toFixed(
          (this || _global).properties.precision
        ),
        e,
        a + 0.15 * o
      );
    }
  };
  WidgetKnob.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global).properties.value);
    (this || _global).boxcolor = e.colorToString([
      (this || _global).value,
      (this || _global).value,
      (this || _global).value,
    ]);
  };
  WidgetKnob.prototype.onMouseDown = function (t) {
    (this || _global).center = [
      0.5 * (this || _global).size[0],
      0.5 * (this || _global).size[1] + 20,
    ];
    (this || _global).radius = 0.5 * (this || _global).size[0];
    if (
      t.canvasY - (this || _global).pos[1] < 20 ||
      e.distance(
        [t.canvasX, t.canvasY],
        [
          (this || _global).pos[0] + (this || _global).center[0],
          (this || _global).pos[1] + (this || _global).center[1],
        ]
      ) > (this || _global).radius
    )
      return false;
    (this || _global).oldmouse = [
      t.canvasX - (this || _global).pos[0],
      t.canvasY - (this || _global).pos[1],
    ];
    this.captureInput(true);
    return true;
  };
  WidgetKnob.prototype.onMouseMove = function (t) {
    if ((this || _global).oldmouse) {
      var e = [
        t.canvasX - (this || _global).pos[0],
        t.canvasY - (this || _global).pos[1],
      ];
      var a = (this || _global).value;
      a -= 0.01 * (e[1] - (this || _global).oldmouse[1]);
      a > 1 ? (a = 1) : a < 0 && (a = 0);
      (this || _global).value = a;
      (this || _global).properties.value =
        (this || _global).properties.min +
        ((this || _global).properties.max - (this || _global).properties.min) *
          (this || _global).value;
      (this || _global).oldmouse = e;
      this.setDirtyCanvas(true);
    }
  };
  WidgetKnob.prototype.onMouseUp = function (t) {
    if ((this || _global).oldmouse) {
      (this || _global).oldmouse = null;
      this.captureInput(false);
    }
  };
  WidgetKnob.prototype.onPropertyChanged = function (t, e) {
    if ("min" == t || "max" == t || "value" == t) {
      (this || _global).properties[t] = parseFloat(e);
      return true;
    }
  };
  e.registerNodeType("widget/knob", WidgetKnob);
  function WidgetSliderGUI() {
    this.addOutput("", "number");
    (this || _global).properties = { value: 0.5, min: 0, max: 1, text: "V" };
    var t = this || _global;
    (this || _global).size = [140, 40];
    (this || _global).slider = this.addWidget(
      "slider",
      "V",
      (this || _global).properties.value,
      function (e) {
        t.properties.value = e;
      },
      (this || _global).properties
    );
    (this || _global).widgets_up = true;
  }
  WidgetSliderGUI.title = "Inner Slider";
  WidgetSliderGUI.prototype.onPropertyChanged = function (t, e) {
    "value" == t && ((this || _global).slider.value = e);
  };
  WidgetSliderGUI.prototype.onExecute = function () {
    this.setOutputData(0, (this || _global).properties.value);
  };
  e.registerNodeType("widget/internal_slider", WidgetSliderGUI);
  function WidgetHSlider() {
    (this || _global).size = [160, 26];
    this.addOutput("", "number");
    (this || _global).properties = {
      color: "#7AF",
      min: 0,
      max: 1,
      value: 0.5,
    };
    (this || _global).value = -1;
  }
  WidgetHSlider.title = "H.Slider";
  WidgetHSlider.desc = "Linear slider controller";
  WidgetHSlider.prototype.onDrawForeground = function (t) {
    -1 == (this || _global).value &&
      ((this || _global).value =
        ((this || _global).properties.value -
          (this || _global).properties.min) /
        ((this || _global).properties.max - (this || _global).properties.min));
    t.globalAlpha = 1;
    t.lineWidth = 1;
    t.fillStyle = "#000";
    t.fillRect(
      2,
      2,
      (this || _global).size[0] - 4,
      (this || _global).size[1] - 4
    );
    t.fillStyle = (this || _global).properties.color;
    t.beginPath();
    t.rect(
      4,
      4,
      ((this || _global).size[0] - 8) * (this || _global).value,
      (this || _global).size[1] - 8
    );
    t.fill();
  };
  WidgetHSlider.prototype.onExecute = function () {
    (this || _global).properties.value =
      (this || _global).properties.min +
      ((this || _global).properties.max - (this || _global).properties.min) *
        (this || _global).value;
    this.setOutputData(0, (this || _global).properties.value);
    (this || _global).boxcolor = e.colorToString([
      (this || _global).value,
      (this || _global).value,
      (this || _global).value,
    ]);
  };
  WidgetHSlider.prototype.onMouseDown = function (t) {
    if (t.canvasY - (this || _global).pos[1] < 0) return false;
    (this || _global).oldmouse = [
      t.canvasX - (this || _global).pos[0],
      t.canvasY - (this || _global).pos[1],
    ];
    this.captureInput(true);
    return true;
  };
  WidgetHSlider.prototype.onMouseMove = function (t) {
    if ((this || _global).oldmouse) {
      var e = [
        t.canvasX - (this || _global).pos[0],
        t.canvasY - (this || _global).pos[1],
      ];
      var a = (this || _global).value;
      var o = e[0] - (this || _global).oldmouse[0];
      a += o / (this || _global).size[0];
      a > 1 ? (a = 1) : a < 0 && (a = 0);
      (this || _global).value = a;
      (this || _global).oldmouse = e;
      this.setDirtyCanvas(true);
    }
  };
  WidgetHSlider.prototype.onMouseUp = function (t) {
    (this || _global).oldmouse = null;
    this.captureInput(false);
  };
  WidgetHSlider.prototype.onMouseLeave = function (t) {};
  e.registerNodeType("widget/hslider", WidgetHSlider);
  function WidgetProgress() {
    (this || _global).size = [160, 26];
    this.addInput("", "number");
    (this || _global).properties = { min: 0, max: 1, value: 0, color: "#AAF" };
  }
  WidgetProgress.title = "Progress";
  WidgetProgress.desc = "Shows data in linear progress";
  WidgetProgress.prototype.onExecute = function () {
    var t = this.getInputData(0);
    void 0 != t && ((this || _global).properties.value = t);
  };
  WidgetProgress.prototype.onDrawForeground = function (t) {
    t.lineWidth = 1;
    t.fillStyle = (this || _global).properties.color;
    var e =
      ((this || _global).properties.value - (this || _global).properties.min) /
      ((this || _global).properties.max - (this || _global).properties.min);
    e = Math.min(1, e);
    e = Math.max(0, e);
    t.fillRect(
      2,
      2,
      ((this || _global).size[0] - 4) * e,
      (this || _global).size[1] - 4
    );
  };
  e.registerNodeType("widget/progress", WidgetProgress);
  function WidgetText() {
    this.addInputs("", 0);
    (this || _global).properties = {
      value: "...",
      font: "Arial",
      fontsize: 18,
      color: "#AAA",
      align: "left",
      glowSize: 0,
      decimals: 1,
    };
  }
  WidgetText.title = "Text";
  WidgetText.desc = "Shows the input value";
  WidgetText.widgets = [
    { name: "resize", text: "Resize box", type: "button" },
    { name: "led_text", text: "LED", type: "minibutton" },
    { name: "normal_text", text: "Normal", type: "minibutton" },
  ];
  WidgetText.prototype.onDrawForeground = function (t) {
    t.fillStyle = (this || _global).properties.color;
    var e = (this || _global).properties.value;
    if ((this || _global).properties.glowSize) {
      t.shadowColor = (this || _global).properties.color;
      t.shadowOffsetX = 0;
      t.shadowOffsetY = 0;
      t.shadowBlur = (this || _global).properties.glowSize;
    } else t.shadowColor = "transparent";
    var a = (this || _global).properties.fontsize;
    t.textAlign = (this || _global).properties.align;
    t.font = a.toString() + "px " + (this || _global).properties.font;
    (this || _global).str =
      "number" == typeof e
        ? e.toFixed((this || _global).properties.decimals)
        : e;
    if ("string" == typeof (this || _global).str) {
      var o = (this || _global).str.replace(/[\r\n]/g, "\\n").split("\\n");
      for (var r = 0; r < o.length; r++)
        t.fillText(
          o[r],
          "left" == (this || _global).properties.align
            ? 15
            : (this || _global).size[0] - 15,
          -0.15 * a + a * (parseInt(r) + 1)
        );
    }
    t.shadowColor = "transparent";
    (this || _global).last_ctx = t;
    t.textAlign = "left";
  };
  WidgetText.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && ((this || _global).properties.value = t);
  };
  WidgetText.prototype.resize = function () {
    if ((this || _global).last_ctx) {
      var t = (this || _global).str.split("\\n");
      (this || _global).last_ctx.font =
        (this || _global).properties.fontsize +
        "px " +
        (this || _global).properties.font;
      var e = 0;
      for (var a = 0; a < t.length; a++) {
        var o = (this || _global).last_ctx.measureText(t[a]).width;
        e < o && (e = o);
      }
      (this || _global).size[0] = e + 20;
      (this || _global).size[1] =
        4 + t.length * (this || _global).properties.fontsize;
      this.setDirtyCanvas(true);
    }
  };
  WidgetText.prototype.onPropertyChanged = function (t, e) {
    (this || _global).properties[t] = e;
    (this || _global).str = "number" == typeof e ? e.toFixed(3) : e;
    return true;
  };
  e.registerNodeType("widget/text", WidgetText);
  function WidgetPanel() {
    (this || _global).size = [200, 100];
    (this || _global).properties = {
      borderColor: "#ffffff",
      bgcolorTop: "#f0f0f0",
      bgcolorBottom: "#e0e0e0",
      shadowSize: 2,
      borderRadius: 3,
    };
  }
  WidgetPanel.title = "Panel";
  WidgetPanel.desc = "Non interactive panel";
  WidgetPanel.widgets = [{ name: "update", text: "Update", type: "button" }];
  WidgetPanel.prototype.createGradient = function (t) {
    if (
      "" != (this || _global).properties.bgcolorTop &&
      "" != (this || _global).properties.bgcolorBottom
    ) {
      (this || _global).lineargradient = t.createLinearGradient(
        0,
        0,
        0,
        (this || _global).size[1]
      );
      (this || _global).lineargradient.addColorStop(
        0,
        (this || _global).properties.bgcolorTop
      );
      (this || _global).lineargradient.addColorStop(
        1,
        (this || _global).properties.bgcolorBottom
      );
    } else (this || _global).lineargradient = 0;
  };
  WidgetPanel.prototype.onDrawForeground = function (t) {
    if (!(this || _global).flags.collapsed) {
      null == (this || _global).lineargradient && this.createGradient(t);
      if ((this || _global).lineargradient) {
        t.lineWidth = 1;
        t.strokeStyle = (this || _global).properties.borderColor;
        t.fillStyle = (this || _global).lineargradient;
        if ((this || _global).properties.shadowSize) {
          t.shadowColor = "#000";
          t.shadowOffsetX = 0;
          t.shadowOffsetY = 0;
          t.shadowBlur = (this || _global).properties.shadowSize;
        } else t.shadowColor = "transparent";
        t.roundRect(
          0,
          0,
          (this || _global).size[0] - 1,
          (this || _global).size[1] - 1,
          (this || _global).properties.shadowSize
        );
        t.fill();
        t.shadowColor = "transparent";
        t.stroke();
      }
    }
  };
  e.registerNodeType("widget/panel", WidgetPanel);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function GamepadInput() {
    this.addOutput("left_x_axis", "number");
    this.addOutput("left_y_axis", "number");
    this.addOutput("button_pressed", e.EVENT);
    (this || _global).properties = { gamepad_index: 0, threshold: 0.1 };
    (this || _global)._left_axis = new Float32Array(2);
    (this || _global)._right_axis = new Float32Array(2);
    (this || _global)._triggers = new Float32Array(2);
    (this || _global)._previous_buttons = new Uint8Array(17);
    (this || _global)._current_buttons = new Uint8Array(17);
  }
  GamepadInput.title = "Gamepad";
  GamepadInput.desc = "gets the input of the gamepad";
  GamepadInput.CENTER = 0;
  GamepadInput.LEFT = 1;
  GamepadInput.RIGHT = 2;
  GamepadInput.UP = 4;
  GamepadInput.DOWN = 8;
  GamepadInput.zero = new Float32Array(2);
  GamepadInput.buttons = [
    "a",
    "b",
    "x",
    "y",
    "lb",
    "rb",
    "lt",
    "rt",
    "back",
    "start",
    "ls",
    "rs",
    "home",
  ];
  GamepadInput.prototype.onExecute = function () {
    var t = this.getGamepad();
    var e = (this || _global).properties.threshold || 0;
    if (t) {
      (this || _global)._left_axis[0] =
        Math.abs(t.xbox.axes.lx) > e ? t.xbox.axes.lx : 0;
      (this || _global)._left_axis[1] =
        Math.abs(t.xbox.axes.ly) > e ? t.xbox.axes.ly : 0;
      (this || _global)._right_axis[0] =
        Math.abs(t.xbox.axes.rx) > e ? t.xbox.axes.rx : 0;
      (this || _global)._right_axis[1] =
        Math.abs(t.xbox.axes.ry) > e ? t.xbox.axes.ry : 0;
      (this || _global)._triggers[0] =
        Math.abs(t.xbox.axes.ltrigger) > e ? t.xbox.axes.ltrigger : 0;
      (this || _global)._triggers[1] =
        Math.abs(t.xbox.axes.rtrigger) > e ? t.xbox.axes.rtrigger : 0;
    }
    if ((this || _global).outputs)
      for (var a = 0; a < (this || _global).outputs.length; a++) {
        var o = (this || _global).outputs[a];
        if (o.links && o.links.length) {
          var r = null;
          if (t)
            switch (o.name) {
              case "left_axis":
                r = (this || _global)._left_axis;
                break;
              case "right_axis":
                r = (this || _global)._right_axis;
                break;
              case "left_x_axis":
                r = (this || _global)._left_axis[0];
                break;
              case "left_y_axis":
                r = (this || _global)._left_axis[1];
                break;
              case "right_x_axis":
                r = (this || _global)._right_axis[0];
                break;
              case "right_y_axis":
                r = (this || _global)._right_axis[1];
                break;
              case "trigger_left":
                r = (this || _global)._triggers[0];
                break;
              case "trigger_right":
                r = (this || _global)._triggers[1];
                break;
              case "a_button":
                r = t.xbox.buttons.a ? 1 : 0;
                break;
              case "b_button":
                r = t.xbox.buttons.b ? 1 : 0;
                break;
              case "x_button":
                r = t.xbox.buttons.x ? 1 : 0;
                break;
              case "y_button":
                r = t.xbox.buttons.y ? 1 : 0;
                break;
              case "lb_button":
                r = t.xbox.buttons.lb ? 1 : 0;
                break;
              case "rb_button":
                r = t.xbox.buttons.rb ? 1 : 0;
                break;
              case "ls_button":
                r = t.xbox.buttons.ls ? 1 : 0;
                break;
              case "rs_button":
                r = t.xbox.buttons.rs ? 1 : 0;
                break;
              case "hat_left":
                r = t.xbox.hatmap & GamepadInput.LEFT;
                break;
              case "hat_right":
                r = t.xbox.hatmap & GamepadInput.RIGHT;
                break;
              case "hat_up":
                r = t.xbox.hatmap & GamepadInput.UP;
                break;
              case "hat_down":
                r = t.xbox.hatmap & GamepadInput.DOWN;
                break;
              case "hat":
                r = t.xbox.hatmap;
                break;
              case "start_button":
                r = t.xbox.buttons.start ? 1 : 0;
                break;
              case "back_button":
                r = t.xbox.buttons.back ? 1 : 0;
                break;
              case "button_pressed":
                for (
                  var l = 0;
                  l < (this || _global)._current_buttons.length;
                  ++l
                )
                  (this || _global)._current_buttons[l] &&
                    !(this || _global)._previous_buttons[l] &&
                    this.triggerSlot(a, GamepadInput.buttons[l]);
                break;
              default:
                break;
            }
          else
            switch (o.name) {
              case "button_pressed":
                break;
              case "left_axis":
              case "right_axis":
                r = GamepadInput.zero;
                break;
              default:
                r = 0;
            }
          this.setOutputData(a, r);
        }
      }
  };
  GamepadInput.mapping = {
    a: 0,
    b: 1,
    x: 2,
    y: 3,
    lb: 4,
    rb: 5,
    lt: 6,
    rt: 7,
    back: 8,
    start: 9,
    ls: 10,
    rs: 11,
  };
  GamepadInput.mapping_array = [
    "a",
    "b",
    "x",
    "y",
    "lb",
    "rb",
    "lt",
    "rt",
    "back",
    "start",
    "ls",
    "rs",
  ];
  GamepadInput.prototype.getGamepad = function () {
    var t =
      navigator.getGamepads ||
      navigator.webkitGetGamepads ||
      navigator.mozGetGamepads;
    if (!t) return null;
    var e = t.call(navigator);
    var a = null;
    (this || _global)._previous_buttons.set((this || _global)._current_buttons);
    for (var o = (this || _global).properties.gamepad_index; o < 4; o++)
      if (e[o]) {
        a = e[o];
        var r = (this || _global).xbox_mapping;
        r ||
          (r = (this || _global).xbox_mapping =
            { axes: [], buttons: {}, hat: "", hatmap: GamepadInput.CENTER });
        r.axes.lx = a.axes[0];
        r.axes.ly = a.axes[1];
        r.axes.rx = a.axes[2];
        r.axes.ry = a.axes[3];
        r.axes.ltrigger = a.buttons[6].value;
        r.axes.rtrigger = a.buttons[7].value;
        r.hat = "";
        r.hatmap = GamepadInput.CENTER;
        for (var l = 0; l < a.buttons.length; l++) {
          (this || _global)._current_buttons[l] = a.buttons[l].pressed;
          if (l < 12) {
            r.buttons[GamepadInput.mapping_array[l]] = a.buttons[l].pressed;
            a.buttons[l].was_pressed &&
              this.trigger(GamepadInput.mapping_array[l] + "_button_event");
          } else
            switch (l) {
              case 12:
                if (a.buttons[l].pressed) {
                  r.hat += "up";
                  r.hatmap |= GamepadInput.UP;
                }
                break;
              case 13:
                if (a.buttons[l].pressed) {
                  r.hat += "down";
                  r.hatmap |= GamepadInput.DOWN;
                }
                break;
              case 14:
                if (a.buttons[l].pressed) {
                  r.hat += "left";
                  r.hatmap |= GamepadInput.LEFT;
                }
                break;
              case 15:
                if (a.buttons[l].pressed) {
                  r.hat += "right";
                  r.hatmap |= GamepadInput.RIGHT;
                }
                break;
              case 16:
                r.buttons.home = a.buttons[l].pressed;
                break;
              default:
            }
        }
        a.xbox = r;
        return a;
      }
  };
  GamepadInput.prototype.onDrawBackground = function (t) {
    if (!(this || _global).flags.collapsed) {
      var e = (this || _global)._left_axis;
      var a = (this || _global)._right_axis;
      t.strokeStyle = "#88A";
      t.strokeRect(
        0.5 * (e[0] + 1) * (this || _global).size[0] - 4,
        0.5 * (e[1] + 1) * (this || _global).size[1] - 4,
        8,
        8
      );
      t.strokeStyle = "#8A8";
      t.strokeRect(
        0.5 * (a[0] + 1) * (this || _global).size[0] - 4,
        0.5 * (a[1] + 1) * (this || _global).size[1] - 4,
        8,
        8
      );
      var o =
        (this || _global).size[1] / (this || _global)._current_buttons.length;
      t.fillStyle = "#AEB";
      for (var r = 0; r < (this || _global)._current_buttons.length; ++r)
        (this || _global)._current_buttons[r] && t.fillRect(0, o * r, 6, o);
    }
  };
  GamepadInput.prototype.onGetOutputs = function () {
    return [
      ["left_axis", "vec2"],
      ["right_axis", "vec2"],
      ["left_x_axis", "number"],
      ["left_y_axis", "number"],
      ["right_x_axis", "number"],
      ["right_y_axis", "number"],
      ["trigger_left", "number"],
      ["trigger_right", "number"],
      ["a_button", "number"],
      ["b_button", "number"],
      ["x_button", "number"],
      ["y_button", "number"],
      ["lb_button", "number"],
      ["rb_button", "number"],
      ["ls_button", "number"],
      ["rs_button", "number"],
      ["start_button", "number"],
      ["back_button", "number"],
      ["a_button_event", e.EVENT],
      ["b_button_event", e.EVENT],
      ["x_button_event", e.EVENT],
      ["y_button_event", e.EVENT],
      ["lb_button_event", e.EVENT],
      ["rb_button_event", e.EVENT],
      ["ls_button_event", e.EVENT],
      ["rs_button_event", e.EVENT],
      ["start_button_event", e.EVENT],
      ["back_button_event", e.EVENT],
      ["hat_left", "number"],
      ["hat_right", "number"],
      ["hat_up", "number"],
      ["hat_down", "number"],
      ["hat", "number"],
      ["button_pressed", e.EVENT],
    ];
  };
  e.registerNodeType("input/gamepad", GamepadInput);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function Converter() {
    this.addInput("in", 0);
    this.addOutput("out", 0);
    (this || _global).size = [80, 30];
  }
  Converter.title = "Converter";
  Converter.desc = "type A to type B";
  Converter.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t && (this || _global).outputs)
      for (var e = 0; e < (this || _global).outputs.length; e++) {
        var a = (this || _global).outputs[e];
        if (a.links && a.links.length) {
          var o = null;
          switch (a.name) {
            case "number":
              o = t.length ? t[0] : parseFloat(t);
              break;
            case "vec2":
            case "vec3":
            case "vec4":
              o = null;
              var r = 1;
              switch (a.name) {
                case "vec2":
                  r = 2;
                  break;
                case "vec3":
                  r = 3;
                  break;
                case "vec4":
                  r = 4;
                  break;
              }
              o = new Float32Array(r);
              if (t.length)
                for (var l = 0; l < t.length && l < o.length; l++) o[l] = t[l];
              else o[0] = parseFloat(t);
              break;
          }
          this.setOutputData(e, o);
        }
      }
  };
  Converter.prototype.onGetOutputs = function () {
    return [
      ["number", "number"],
      ["vec2", "vec2"],
      ["vec3", "vec3"],
      ["vec4", "vec4"],
    ];
  };
  e.registerNodeType("math/converter", Converter);
  function Bypass() {
    this.addInput("in");
    this.addOutput("out");
    (this || _global).size = [80, 30];
  }
  Bypass.title = "Bypass";
  Bypass.desc = "removes the type";
  Bypass.prototype.onExecute = function () {
    var t = this.getInputData(0);
    this.setOutputData(0, t);
  };
  e.registerNodeType("math/bypass", Bypass);
  function ToNumber() {
    this.addInput("in");
    this.addOutput("out");
  }
  ToNumber.title = "to Number";
  ToNumber.desc = "Cast to number";
  ToNumber.prototype.onExecute = function () {
    var t = this.getInputData(0);
    this.setOutputData(0, Number(t));
  };
  e.registerNodeType("math/to_number", ToNumber);
  function MathRange() {
    this.addInput("in", "number", { locked: true });
    this.addOutput("out", "number", { locked: true });
    this.addOutput("clamped", "number", { locked: true });
    this.addProperty("in", 0);
    this.addProperty("in_min", 0);
    this.addProperty("in_max", 1);
    this.addProperty("out_min", 0);
    this.addProperty("out_max", 1);
    (this || _global).size = [120, 50];
  }
  MathRange.title = "Range";
  MathRange.desc = "Convert a number from one range to another";
  MathRange.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? ((this || _global)._last_v || 0).toFixed(2)
      : (this || _global).title;
  };
  MathRange.prototype.onExecute = function () {
    if ((this || _global).inputs)
      for (var t = 0; t < (this || _global).inputs.length; t++) {
        var e = (this || _global).inputs[t];
        var a = this.getInputData(t);
        void 0 !== a && ((this || _global).properties[e.name] = a);
      }
    a = (this || _global).properties.in;
    (void 0 !== a && null !== a && a.constructor === Number) || (a = 0);
    var o = (this || _global).properties.in_min;
    var r = (this || _global).properties.in_max;
    var l = (this || _global).properties.out_min;
    var n = (this || _global).properties.out_max;
    (this || _global)._last_v = ((a - o) / (r - o)) * (n - l) + l;
    this.setOutputData(0, (this || _global)._last_v);
    this.setOutputData(1, Math.clamp((this || _global)._last_v, l, n));
  };
  MathRange.prototype.onDrawBackground = function (t) {
    (this || _global)._last_v
      ? ((this || _global).outputs[0].label = (this || _global)._last_v.toFixed(
          3
        ))
      : ((this || _global).outputs[0].label = "?");
  };
  MathRange.prototype.onGetInputs = function () {
    return [
      ["in_min", "number"],
      ["in_max", "number"],
      ["out_min", "number"],
      ["out_max", "number"],
    ];
  };
  e.registerNodeType("math/range", MathRange);
  function MathRand() {
    this.addOutput("value", "number");
    this.addProperty("min", 0);
    this.addProperty("max", 1);
    (this || _global).size = [80, 30];
  }
  MathRand.title = "Rand";
  MathRand.desc = "Random number";
  MathRand.prototype.onExecute = function () {
    if ((this || _global).inputs)
      for (var t = 0; t < (this || _global).inputs.length; t++) {
        var e = (this || _global).inputs[t];
        var a = this.getInputData(t);
        void 0 !== a && ((this || _global).properties[e.name] = a);
      }
    var o = (this || _global).properties.min;
    var r = (this || _global).properties.max;
    (this || _global)._last_v = Math.random() * (r - o) + o;
    this.setOutputData(0, (this || _global)._last_v);
  };
  MathRand.prototype.onDrawBackground = function (t) {
    (this || _global).outputs[0].label = (
      (this || _global)._last_v || 0
    ).toFixed(3);
  };
  MathRand.prototype.onGetInputs = function () {
    return [
      ["min", "number"],
      ["max", "number"],
    ];
  };
  e.registerNodeType("math/rand", MathRand);
  function MathNoise() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.addProperty("min", 0);
    this.addProperty("max", 1);
    this.addProperty("smooth", true);
    this.addProperty("seed", 0);
    this.addProperty("octaves", 1);
    this.addProperty("persistence", 0.8);
    this.addProperty("speed", 1);
    (this || _global).size = [90, 30];
  }
  MathNoise.title = "Noise";
  MathNoise.desc = "Random number with temporal continuity";
  MathNoise.data = null;
  MathNoise.getValue = function (t, e) {
    if (!MathNoise.data) {
      MathNoise.data = new Float32Array(1024);
      for (var a = 0; a < MathNoise.data.length; ++a)
        MathNoise.data[a] = Math.random();
    }
    t %= 1024;
    t < 0 && (t += 1024);
    var o = Math.floor(t);
    t -= o;
    var r = MathNoise.data[o];
    var l = MathNoise.data[1023 == o ? 0 : o + 1];
    e && (t = t * t * t * (t * (6 * t - 15) + 10));
    return r * (1 - t) + l * t;
  };
  MathNoise.prototype.onExecute = function () {
    var t = this.getInputData(0) || 0;
    var e = (this || _global).properties.octaves || 1;
    var a = 0;
    var o = 1;
    var r = (this || _global).properties.seed || 0;
    t += r;
    var l = (this || _global).properties.speed || 1;
    var n = 0;
    for (var s = 0; s < e; ++s) {
      a +=
        MathNoise.getValue(
          t * (1 + s) * l,
          (this || _global).properties.smooth
        ) * o;
      n += o;
      o *= (this || _global).properties.persistence;
      if (o < 0.001) break;
    }
    a /= n;
    var u = (this || _global).properties.min;
    var h = (this || _global).properties.max;
    (this || _global)._last_v = a * (h - u) + u;
    this.setOutputData(0, (this || _global)._last_v);
  };
  MathNoise.prototype.onDrawBackground = function (t) {
    (this || _global).outputs[0].label = (
      (this || _global)._last_v || 0
    ).toFixed(3);
  };
  e.registerNodeType("math/noise", MathNoise);
  function MathSpikes() {
    this.addOutput("out", "number");
    this.addProperty("min_time", 1);
    this.addProperty("max_time", 2);
    this.addProperty("duration", 0.2);
    (this || _global).size = [90, 30];
    (this || _global)._remaining_time = 0;
    (this || _global)._blink_time = 0;
  }
  MathSpikes.title = "Spikes";
  MathSpikes.desc = "spike every random time";
  MathSpikes.prototype.onExecute = function () {
    var t = (this || _global).graph.elapsed_time;
    (this || _global)._remaining_time -= t;
    (this || _global)._blink_time -= t;
    var e = 0;
    if ((this || _global)._blink_time > 0) {
      var a =
        (this || _global)._blink_time / (this || _global).properties.duration;
      e = 1 / (Math.pow(8 * a - 4, 4) + 1);
    }
    if ((this || _global)._remaining_time < 0) {
      (this || _global)._remaining_time =
        Math.random() *
          ((this || _global).properties.max_time -
            (this || _global).properties.min_time) +
        (this || _global).properties.min_time;
      (this || _global)._blink_time = (this || _global).properties.duration;
      (this || _global).boxcolor = "#FFF";
    } else (this || _global).boxcolor = "#000";
    this.setOutputData(0, e);
  };
  e.registerNodeType("math/spikes", MathSpikes);
  function MathClamp() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    (this || _global).size = [80, 30];
    this.addProperty("min", 0);
    this.addProperty("max", 1);
  }
  MathClamp.title = "Clamp";
  MathClamp.desc = "Clamp number between min and max";
  MathClamp.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      t = Math.max((this || _global).properties.min, t);
      t = Math.min((this || _global).properties.max, t);
      this.setOutputData(0, t);
    }
  };
  MathClamp.prototype.getCode = function (t) {
    var e = "";
    this.isInputConnected(0) &&
      (e +=
        "clamp({{0}}," +
        (this || _global).properties.min +
        "," +
        (this || _global).properties.max +
        ")");
    return e;
  };
  e.registerNodeType("math/clamp", MathClamp);
  function MathLerp() {
    (this || _global).properties = { f: 0.5 };
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("out", "number");
  }
  MathLerp.title = "Lerp";
  MathLerp.desc = "Linear Interpolation";
  MathLerp.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null == t && (t = 0);
    var e = this.getInputData(1);
    null == e && (e = 0);
    var a = (this || _global).properties.f;
    var o = this.getInputData(2);
    void 0 !== o && (a = o);
    this.setOutputData(0, t * (1 - a) + e * a);
  };
  MathLerp.prototype.onGetInputs = function () {
    return [["f", "number"]];
  };
  e.registerNodeType("math/lerp", MathLerp);
  function MathAbs() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    (this || _global).size = [80, 30];
  }
  MathAbs.title = "Abs";
  MathAbs.desc = "Absolute";
  MathAbs.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && this.setOutputData(0, Math.abs(t));
  };
  e.registerNodeType("math/abs", MathAbs);
  function MathFloor() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    (this || _global).size = [80, 30];
  }
  MathFloor.title = "Floor";
  MathFloor.desc = "Floor number to remove fractional part";
  MathFloor.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && this.setOutputData(0, Math.floor(t));
  };
  e.registerNodeType("math/floor", MathFloor);
  function MathFrac() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    (this || _global).size = [80, 30];
  }
  MathFrac.title = "Frac";
  MathFrac.desc = "Returns fractional part";
  MathFrac.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && this.setOutputData(0, t % 1);
  };
  e.registerNodeType("math/frac", MathFrac);
  function MathSmoothStep() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    (this || _global).size = [80, 30];
    (this || _global).properties = { A: 0, B: 1 };
  }
  MathSmoothStep.title = "Smoothstep";
  MathSmoothStep.desc = "Smoothstep";
  MathSmoothStep.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (void 0 !== t) {
      var e = (this || _global).properties.A;
      var a = (this || _global).properties.B;
      t = Math.clamp((t - e) / (a - e), 0, 1);
      t = t * t * (3 - 2 * t);
      this.setOutputData(0, t);
    }
  };
  e.registerNodeType("math/smoothstep", MathSmoothStep);
  function MathScale() {
    this.addInput("in", "number", { label: "" });
    this.addOutput("out", "number", { label: "" });
    (this || _global).size = [80, 30];
    this.addProperty("factor", 1);
  }
  MathScale.title = "Scale";
  MathScale.desc = "v * factor";
  MathScale.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null != t && this.setOutputData(0, t * (this || _global).properties.factor);
  };
  e.registerNodeType("math/scale", MathScale);
  function Gate() {
    this.addInput("v", "boolean");
    this.addInput("A");
    this.addInput("B");
    this.addOutput("out");
  }
  Gate.title = "Gate";
  Gate.desc = "if v is true, then outputs A, otherwise B";
  Gate.prototype.onExecute = function () {
    var t = this.getInputData(0);
    this.setOutputData(0, this.getInputData(t ? 1 : 2));
  };
  e.registerNodeType("math/gate", Gate);
  function MathAverageFilter() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    (this || _global).size = [80, 30];
    this.addProperty("samples", 10);
    (this || _global)._values = new Float32Array(10);
    (this || _global)._current = 0;
  }
  MathAverageFilter.title = "Average";
  MathAverageFilter.desc = "Average Filter";
  MathAverageFilter.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null == t && (t = 0);
    var e = (this || _global)._values.length;
    (this || _global)._values[(this || _global)._current % e] = t;
    (this || _global)._current += 1;
    (this || _global)._current > e && ((this || _global)._current = 0);
    var a = 0;
    for (var o = 0; o < e; ++o) a += (this || _global)._values[o];
    this.setOutputData(0, a / e);
  };
  MathAverageFilter.prototype.onPropertyChanged = function (t, e) {
    e < 1 && (e = 1);
    (this || _global).properties.samples = Math.round(e);
    var a = (this || _global)._values;
    (this || _global)._values = new Float32Array(
      (this || _global).properties.samples
    );
    a.length <= (this || _global)._values.length
      ? (this || _global)._values.set(a)
      : (this || _global)._values.set(
          a.subarray(0, (this || _global)._values.length)
        );
  };
  e.registerNodeType("math/average", MathAverageFilter);
  function MathTendTo() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.addProperty("factor", 0.1);
    (this || _global).size = [80, 30];
    (this || _global)._value = null;
  }
  MathTendTo.title = "TendTo";
  MathTendTo.desc = "moves the output value always closer to the input";
  MathTendTo.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null == t && (t = 0);
    var e = (this || _global).properties.factor;
    null == (this || _global)._value
      ? ((this || _global)._value = t)
      : ((this || _global)._value = (this || _global)._value * (1 - e) + t * e);
    this.setOutputData(0, (this || _global)._value);
  };
  e.registerNodeType("math/tendTo", MathTendTo);
  function MathOperation() {
    this.addInput("A", "number,array,object");
    this.addInput("B", "number");
    this.addOutput("=", "number");
    this.addProperty("A", 1);
    this.addProperty("B", 1);
    this.addProperty("OP", "+", "enum", { values: MathOperation.values });
    (this || _global)._func = function (t, e) {
      return t + e;
    };
    (this || _global)._result = [];
  }
  MathOperation.values = ["+", "-", "*", "/", "%", "^", "max", "min"];
  MathOperation.title = "Operation";
  MathOperation.desc = "Easy math operators";
  MathOperation["@OP"] = {
    type: "enum",
    title: "operation",
    values: MathOperation.values,
  };
  MathOperation.size = [100, 60];
  MathOperation.prototype.getTitle = function () {
    return "max" == (this || _global).properties.OP ||
      "min" == (this || _global).properties.OP
      ? (this || _global).properties.OP + "(A,B)"
      : "A " + (this || _global).properties.OP + " B";
  };
  MathOperation.prototype.setValue = function (t) {
    "string" == typeof t && (t = parseFloat(t));
    (this || _global).properties.value = t;
  };
  MathOperation.prototype.onPropertyChanged = function (t, e) {
    if ("OP" == t)
      switch ((this || _global).properties.OP) {
        case "+":
          (this || _global)._func = function (t, e) {
            return t + e;
          };
          break;
        case "-":
          (this || _global)._func = function (t, e) {
            return t - e;
          };
          break;
        case "x":
        case "X":
        case "*":
          (this || _global)._func = function (t, e) {
            return t * e;
          };
          break;
        case "/":
          (this || _global)._func = function (t, e) {
            return t / e;
          };
          break;
        case "%":
          (this || _global)._func = function (t, e) {
            return t % e;
          };
          break;
        case "^":
          (this || _global)._func = function (t, e) {
            return Math.pow(t, e);
          };
          break;
        case "max":
          (this || _global)._func = function (t, e) {
            return Math.max(t, e);
          };
          break;
        case "min":
          (this || _global)._func = function (t, e) {
            return Math.min(t, e);
          };
          break;
        default:
          console.warn("Unknown operation: " + (this || _global).properties.OP);
          (this || _global)._func = function (t) {
            return t;
          };
          break;
      }
  };
  MathOperation.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    null != t
      ? t.constructor === Number && ((this || _global).properties.A = t)
      : (t = (this || _global).properties.A);
    null != e
      ? ((this || _global).properties.B = e)
      : (e = (this || _global).properties.B);
    var a;
    if (t.constructor === Number) {
      a = 0;
      a = this._func(t, e);
    } else if (t.constructor === Array) {
      a = (this || _global)._result;
      a.length = t.length;
      for (var o = 0; o < t.length; ++o) a[o] = this._func(t[o], e);
    } else {
      a = {};
      for (var o in t) a[o] = this._func(t[o], e);
    }
    this.setOutputData(0, a);
  };
  MathOperation.prototype.onDrawBackground = function (t) {
    if (!(this || _global).flags.collapsed) {
      t.font = "40px Arial";
      t.fillStyle = "#666";
      t.textAlign = "center";
      t.fillText(
        (this || _global).properties.OP,
        0.5 * (this || _global).size[0],
        0.5 * ((this || _global).size[1] + e.NODE_TITLE_HEIGHT)
      );
      t.textAlign = "left";
    }
  };
  e.registerNodeType("math/operation", MathOperation);
  e.registerSearchboxExtra("math/operation", "MAX", {
    properties: { OP: "max" },
    title: "MAX()",
  });
  e.registerSearchboxExtra("math/operation", "MIN", {
    properties: { OP: "min" },
    title: "MIN()",
  });
  function MathCompare() {
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("A==B", "boolean");
    this.addOutput("A!=B", "boolean");
    this.addProperty("A", 0);
    this.addProperty("B", 0);
  }
  MathCompare.title = "Compare";
  MathCompare.desc = "compares between two values";
  MathCompare.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    void 0 !== t
      ? ((this || _global).properties.A = t)
      : (t = (this || _global).properties.A);
    void 0 !== e
      ? ((this || _global).properties.B = e)
      : (e = (this || _global).properties.B);
    for (var a = 0, o = (this || _global).outputs.length; a < o; ++a) {
      var r = (this || _global).outputs[a];
      if (r.links && r.links.length) {
        var l;
        switch (r.name) {
          case "A==B":
            l = t == e;
            break;
          case "A!=B":
            l = t != e;
            break;
          case "A>B":
            l = t > e;
            break;
          case "A<B":
            l = t < e;
            break;
          case "A<=B":
            l = t <= e;
            break;
          case "A>=B":
            l = t >= e;
            break;
        }
        this.setOutputData(a, l);
      }
    }
  };
  MathCompare.prototype.onGetOutputs = function () {
    return [
      ["A==B", "boolean"],
      ["A!=B", "boolean"],
      ["A>B", "boolean"],
      ["A<B", "boolean"],
      ["A>=B", "boolean"],
      ["A<=B", "boolean"],
    ];
  };
  e.registerNodeType("math/compare", MathCompare);
  e.registerSearchboxExtra("math/compare", "==", {
    outputs: [["A==B", "boolean"]],
    title: "A==B",
  });
  e.registerSearchboxExtra("math/compare", "!=", {
    outputs: [["A!=B", "boolean"]],
    title: "A!=B",
  });
  e.registerSearchboxExtra("math/compare", ">", {
    outputs: [["A>B", "boolean"]],
    title: "A>B",
  });
  e.registerSearchboxExtra("math/compare", "<", {
    outputs: [["A<B", "boolean"]],
    title: "A<B",
  });
  e.registerSearchboxExtra("math/compare", ">=", {
    outputs: [["A>=B", "boolean"]],
    title: "A>=B",
  });
  e.registerSearchboxExtra("math/compare", "<=", {
    outputs: [["A<=B", "boolean"]],
    title: "A<=B",
  });
  function MathCondition() {
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("true", "boolean");
    this.addOutput("false", "boolean");
    this.addProperty("A", 1);
    this.addProperty("B", 1);
    this.addProperty("OP", ">", "enum", { values: MathCondition.values });
    this.addWidget("combo", "Cond.", (this || _global).properties.OP, {
      property: "OP",
      values: MathCondition.values,
    });
    (this || _global).size = [80, 60];
  }
  MathCondition.values = [">", "<", "==", "!=", "<=", ">=", "||", "&&"];
  MathCondition["@OP"] = {
    type: "enum",
    title: "operation",
    values: MathCondition.values,
  };
  MathCondition.title = "Condition";
  MathCondition.desc = "evaluates condition between A and B";
  MathCondition.prototype.getTitle = function () {
    return "A " + (this || _global).properties.OP + " B";
  };
  MathCondition.prototype.onExecute = function () {
    var t = this.getInputData(0);
    void 0 === t
      ? (t = (this || _global).properties.A)
      : ((this || _global).properties.A = t);
    var e = this.getInputData(1);
    void 0 === e
      ? (e = (this || _global).properties.B)
      : ((this || _global).properties.B = e);
    var a = true;
    switch ((this || _global).properties.OP) {
      case ">":
        a = t > e;
        break;
      case "<":
        a = t < e;
        break;
      case "==":
        a = t == e;
        break;
      case "!=":
        a = t != e;
        break;
      case "<=":
        a = t <= e;
        break;
      case ">=":
        a = t >= e;
        break;
      case "||":
        a = t || e;
        break;
      case "&&":
        a = t && e;
        break;
    }
    this.setOutputData(0, a);
    this.setOutputData(1, !a);
  };
  e.registerNodeType("math/condition", MathCondition);
  function MathBranch() {
    this.addInput("in", 0);
    this.addInput("cond", "boolean");
    this.addOutput("true", 0);
    this.addOutput("false", 0);
    (this || _global).size = [80, 60];
  }
  MathBranch.title = "Branch";
  MathBranch.desc =
    "If condition is true, outputs IN in true, otherwise in false";
  MathBranch.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    if (e) {
      this.setOutputData(0, t);
      this.setOutputData(1, null);
    } else {
      this.setOutputData(0, null);
      this.setOutputData(1, t);
    }
  };
  e.registerNodeType("math/branch", MathBranch);
  function MathAccumulate() {
    this.addInput("inc", "number");
    this.addOutput("total", "number");
    this.addProperty("increment", 1);
    this.addProperty("value", 0);
  }
  MathAccumulate.title = "Accumulate";
  MathAccumulate.desc = "Increments a value every time";
  MathAccumulate.prototype.onExecute = function () {
    null === (this || _global).properties.value &&
      ((this || _global).properties.value = 0);
    var t = this.getInputData(0);
    (this || _global).properties.value +=
      null !== t ? t : (this || _global).properties.increment;
    this.setOutputData(0, (this || _global).properties.value);
  };
  e.registerNodeType("math/accumulate", MathAccumulate);
  function MathTrigonometry() {
    this.addInput("v", "number");
    this.addOutput("sin", "number");
    this.addProperty("amplitude", 1);
    this.addProperty("offset", 0);
    (this || _global).bgImageUrl = "nodes/imgs/icon-sin.png";
  }
  MathTrigonometry.title = "Trigonometry";
  MathTrigonometry.desc = "Sin Cos Tan";
  MathTrigonometry.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null == t && (t = 0);
    var e = (this || _global).properties.amplitude;
    var a = this.findInputSlot("amplitude");
    -1 != a && (e = this.getInputData(a));
    var o = (this || _global).properties.offset;
    a = this.findInputSlot("offset");
    -1 != a && (o = this.getInputData(a));
    for (var r = 0, l = (this || _global).outputs.length; r < l; ++r) {
      var n = (this || _global).outputs[r];
      var s;
      switch (n.name) {
        case "sin":
          s = Math.sin(t);
          break;
        case "cos":
          s = Math.cos(t);
          break;
        case "tan":
          s = Math.tan(t);
          break;
        case "asin":
          s = Math.asin(t);
          break;
        case "acos":
          s = Math.acos(t);
          break;
        case "atan":
          s = Math.atan(t);
          break;
      }
      this.setOutputData(r, e * s + o);
    }
  };
  MathTrigonometry.prototype.onGetInputs = function () {
    return [
      ["v", "number"],
      ["amplitude", "number"],
      ["offset", "number"],
    ];
  };
  MathTrigonometry.prototype.onGetOutputs = function () {
    return [
      ["sin", "number"],
      ["cos", "number"],
      ["tan", "number"],
      ["asin", "number"],
      ["acos", "number"],
      ["atan", "number"],
    ];
  };
  e.registerNodeType("math/trigonometry", MathTrigonometry);
  e.registerSearchboxExtra("math/trigonometry", "SIN()", {
    outputs: [["sin", "number"]],
    title: "SIN()",
  });
  e.registerSearchboxExtra("math/trigonometry", "COS()", {
    outputs: [["cos", "number"]],
    title: "COS()",
  });
  e.registerSearchboxExtra("math/trigonometry", "TAN()", {
    outputs: [["tan", "number"]],
    title: "TAN()",
  });
  function MathFormula() {
    this.addInput("x", "number");
    this.addInput("y", "number");
    this.addOutput("", "number");
    (this || _global).properties = { x: 1, y: 1, formula: "x+y" };
    (this || _global).code_widget = this.addWidget(
      "text",
      "F(x,y)",
      (this || _global).properties.formula,
      function (t, e, a) {
        a.properties.formula = t;
      }
    );
    this.addWidget("toggle", "allow", e.allow_scripts, function (t) {
      e.allow_scripts = t;
    });
    (this || _global)._func = null;
  }
  MathFormula.title = "Formula";
  MathFormula.desc = "Compute formula";
  MathFormula.size = [160, 100];
  MathAverageFilter.prototype.onPropertyChanged = function (t, e) {
    "formula" == t && ((this || _global).code_widget.value = e);
  };
  MathFormula.prototype.onExecute = function () {
    if (e.allow_scripts) {
      var t = this.getInputData(0);
      var a = this.getInputData(1);
      null != t
        ? ((this || _global).properties.x = t)
        : (t = (this || _global).properties.x);
      null != a
        ? ((this || _global).properties.y = a)
        : (a = (this || _global).properties.y);
      (this || _global).properties.formula;
      var o;
      try {
        if (
          !(this || _global)._func ||
          (this || _global)._func_code != (this || _global).properties.formula
        ) {
          (this || _global)._func = new Function(
            "x",
            "y",
            "TIME",
            "return " + (this || _global).properties.formula
          );
          (this || _global)._func_code = (this || _global).properties.formula;
        }
        o = this._func(t, a, (this || _global).graph.globaltime);
        (this || _global).boxcolor = null;
      } catch (t) {
        (this || _global).boxcolor = "red";
      }
      this.setOutputData(0, o);
    }
  };
  MathFormula.prototype.getTitle = function () {
    return (this || _global)._func_code || "Formula";
  };
  MathFormula.prototype.onDrawBackground = function () {
    var t = (this || _global).properties.formula;
    (this || _global).outputs &&
      (this || _global).outputs.length &&
      ((this || _global).outputs[0].label = t);
  };
  e.registerNodeType("math/formula", MathFormula);
  function Math3DVec2ToXY() {
    this.addInput("vec2", "vec2");
    this.addOutput("x", "number");
    this.addOutput("y", "number");
  }
  Math3DVec2ToXY.title = "Vec2->XY";
  Math3DVec2ToXY.desc = "vector 2 to components";
  Math3DVec2ToXY.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      this.setOutputData(0, t[0]);
      this.setOutputData(1, t[1]);
    }
  };
  e.registerNodeType("math3d/vec2-to-xy", Math3DVec2ToXY);
  function Math3DXYToVec2() {
    this.addInputs([
      ["x", "number"],
      ["y", "number"],
    ]);
    this.addOutput("vec2", "vec2");
    (this || _global).properties = { x: 0, y: 0 };
    (this || _global)._data = new Float32Array(2);
  }
  Math3DXYToVec2.title = "XY->Vec2";
  Math3DXYToVec2.desc = "components to vector2";
  Math3DXYToVec2.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null == t && (t = (this || _global).properties.x);
    var e = this.getInputData(1);
    null == e && (e = (this || _global).properties.y);
    var a = (this || _global)._data;
    a[0] = t;
    a[1] = e;
    this.setOutputData(0, a);
  };
  e.registerNodeType("math3d/xy-to-vec2", Math3DXYToVec2);
  function Math3DVec3ToXYZ() {
    this.addInput("vec3", "vec3");
    this.addOutput("x", "number");
    this.addOutput("y", "number");
    this.addOutput("z", "number");
  }
  Math3DVec3ToXYZ.title = "Vec3->XYZ";
  Math3DVec3ToXYZ.desc = "vector 3 to components";
  Math3DVec3ToXYZ.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      this.setOutputData(0, t[0]);
      this.setOutputData(1, t[1]);
      this.setOutputData(2, t[2]);
    }
  };
  e.registerNodeType("math3d/vec3-to-xyz", Math3DVec3ToXYZ);
  function Math3DXYZToVec3() {
    this.addInputs([
      ["x", "number"],
      ["y", "number"],
      ["z", "number"],
    ]);
    this.addOutput("vec3", "vec3");
    (this || _global).properties = { x: 0, y: 0, z: 0 };
    (this || _global)._data = new Float32Array(3);
  }
  Math3DXYZToVec3.title = "XYZ->Vec3";
  Math3DXYZToVec3.desc = "components to vector3";
  Math3DXYZToVec3.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null == t && (t = (this || _global).properties.x);
    var e = this.getInputData(1);
    null == e && (e = (this || _global).properties.y);
    var a = this.getInputData(2);
    null == a && (a = (this || _global).properties.z);
    var o = (this || _global)._data;
    o[0] = t;
    o[1] = e;
    o[2] = a;
    this.setOutputData(0, o);
  };
  e.registerNodeType("math3d/xyz-to-vec3", Math3DXYZToVec3);
  function Math3DVec4ToXYZW() {
    this.addInput("vec4", "vec4");
    this.addOutput("x", "number");
    this.addOutput("y", "number");
    this.addOutput("z", "number");
    this.addOutput("w", "number");
  }
  Math3DVec4ToXYZW.title = "Vec4->XYZW";
  Math3DVec4ToXYZW.desc = "vector 4 to components";
  Math3DVec4ToXYZW.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      this.setOutputData(0, t[0]);
      this.setOutputData(1, t[1]);
      this.setOutputData(2, t[2]);
      this.setOutputData(3, t[3]);
    }
  };
  e.registerNodeType("math3d/vec4-to-xyzw", Math3DVec4ToXYZW);
  function Math3DXYZWToVec4() {
    this.addInputs([
      ["x", "number"],
      ["y", "number"],
      ["z", "number"],
      ["w", "number"],
    ]);
    this.addOutput("vec4", "vec4");
    (this || _global).properties = { x: 0, y: 0, z: 0, w: 0 };
    (this || _global)._data = new Float32Array(4);
  }
  Math3DXYZWToVec4.title = "XYZW->Vec4";
  Math3DXYZWToVec4.desc = "components to vector4";
  Math3DXYZWToVec4.prototype.onExecute = function () {
    var t = this.getInputData(0);
    null == t && (t = (this || _global).properties.x);
    var e = this.getInputData(1);
    null == e && (e = (this || _global).properties.y);
    var a = this.getInputData(2);
    null == a && (a = (this || _global).properties.z);
    var o = this.getInputData(3);
    null == o && (o = (this || _global).properties.w);
    var r = (this || _global)._data;
    r[0] = t;
    r[1] = e;
    r[2] = a;
    r[3] = o;
    this.setOutputData(0, r);
  };
  e.registerNodeType("math3d/xyzw-to-vec4", Math3DXYZWToVec4);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function Math3DMat4() {
    this.addInput("T", "vec3");
    this.addInput("R", "vec3");
    this.addInput("S", "vec3");
    this.addOutput("mat4", "mat4");
    (this || _global).properties = {
      T: [0, 0, 0],
      R: [0, 0, 0],
      S: [1, 1, 1],
      R_in_degrees: true,
    };
    (this || _global)._result = mat4.create();
    (this || _global)._must_update = true;
  }
  Math3DMat4.title = "mat4";
  Math3DMat4.temp_quat = new Float32Array([0, 0, 0, 1]);
  Math3DMat4.temp_mat4 = new Float32Array(16);
  Math3DMat4.temp_vec3 = new Float32Array(3);
  Math3DMat4.prototype.onPropertyChanged = function (t, e) {
    (this || _global)._must_update = true;
  };
  Math3DMat4.prototype.onExecute = function () {
    var t = (this || _global)._result;
    var e = Math3DMat4.temp_quat;
    var a = Math3DMat4.temp_mat4;
    var o = Math3DMat4.temp_vec3;
    var r = this.getInputData(0);
    var l = this.getInputData(1);
    var n = this.getInputData(2);
    if ((this || _global)._must_update || r || l || n) {
      r = r || (this || _global).properties.T;
      l = l || (this || _global).properties.R;
      n = n || (this || _global).properties.S;
      mat4.identity(t);
      mat4.translate(t, t, r);
      if ((this || _global).properties.R_in_degrees) {
        o.set(l);
        vec3.scale(o, o, DEG2RAD);
        quat.fromEuler(e, o);
      } else quat.fromEuler(e, l);
      mat4.fromQuat(a, e);
      mat4.multiply(t, t, a);
      mat4.scale(t, t, n);
    }
    this.setOutputData(0, t);
  };
  e.registerNodeType("math3d/mat4", Math3DMat4);
  function Math3DOperation() {
    this.addInput("A", "number,vec3");
    this.addInput("B", "number,vec3");
    this.addOutput("=", "number,vec3");
    this.addProperty("OP", "+", "enum", { values: Math3DOperation.values });
    (this || _global)._result = vec3.create();
  }
  Math3DOperation.values = [
    "+",
    "-",
    "*",
    "/",
    "%",
    "^",
    "max",
    "min",
    "dot",
    "cross",
  ];
  e.registerSearchboxExtra("math3d/operation", "CROSS()", {
    properties: { OP: "cross" },
    title: "CROSS()",
  });
  e.registerSearchboxExtra("math3d/operation", "DOT()", {
    properties: { OP: "dot" },
    title: "DOT()",
  });
  Math3DOperation.title = "Operation";
  Math3DOperation.desc = "Easy math 3D operators";
  Math3DOperation["@OP"] = {
    type: "enum",
    title: "operation",
    values: Math3DOperation.values,
  };
  Math3DOperation.size = [100, 60];
  Math3DOperation.prototype.getTitle = function () {
    return "max" == (this || _global).properties.OP ||
      "min" == (this || _global).properties.OP
      ? (this || _global).properties.OP + "(A,B)"
      : "A " + (this || _global).properties.OP + " B";
  };
  Math3DOperation.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    if (null != t && null != e) {
      t.constructor === Number && (t = [t, t, t]);
      e.constructor === Number && (e = [e, e, e]);
      var a = (this || _global)._result;
      switch ((this || _global).properties.OP) {
        case "+":
          a = vec3.add(a, t, e);
          break;
        case "-":
          a = vec3.sub(a, t, e);
          break;
        case "x":
        case "X":
        case "*":
          a = vec3.mul(a, t, e);
          break;
        case "/":
          a = vec3.div(a, t, e);
          break;
        case "%":
          a[0] = t[0] % e[0];
          a[1] = t[1] % e[1];
          a[2] = t[2] % e[2];
          break;
        case "^":
          a[0] = Math.pow(t[0], e[0]);
          a[1] = Math.pow(t[1], e[1]);
          a[2] = Math.pow(t[2], e[2]);
          break;
        case "max":
          a[0] = Math.max(t[0], e[0]);
          a[1] = Math.max(t[1], e[1]);
          a[2] = Math.max(t[2], e[2]);
          break;
        case "min":
          a[0] = Math.min(t[0], e[0]);
          a[1] = Math.min(t[1], e[1]);
          a[2] = Math.min(t[2], e[2]);
        case "dot":
          a = vec3.dot(t, e);
          break;
        case "cross":
          vec3.cross(a, t, e);
          break;
        default:
          console.warn("Unknown operation: " + (this || _global).properties.OP);
      }
      this.setOutputData(0, a);
    }
  };
  Math3DOperation.prototype.onDrawBackground = function (t) {
    if (!(this || _global).flags.collapsed) {
      t.font = "40px Arial";
      t.fillStyle = "#666";
      t.textAlign = "center";
      t.fillText(
        (this || _global).properties.OP,
        0.5 * (this || _global).size[0],
        0.5 * ((this || _global).size[1] + e.NODE_TITLE_HEIGHT)
      );
      t.textAlign = "left";
    }
  };
  e.registerNodeType("math3d/operation", Math3DOperation);
  function Math3DVec3Scale() {
    this.addInput("in", "vec3");
    this.addInput("f", "number");
    this.addOutput("out", "vec3");
    (this || _global).properties = { f: 1 };
    (this || _global)._data = new Float32Array(3);
  }
  Math3DVec3Scale.title = "vec3_scale";
  Math3DVec3Scale.desc = "scales the components of a vec3";
  Math3DVec3Scale.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      var e = this.getInputData(1);
      null == e && (e = (this || _global).properties.f);
      var a = (this || _global)._data;
      a[0] = t[0] * e;
      a[1] = t[1] * e;
      a[2] = t[2] * e;
      this.setOutputData(0, a);
    }
  };
  e.registerNodeType("math3d/vec3-scale", Math3DVec3Scale);
  function Math3DVec3Length() {
    this.addInput("in", "vec3");
    this.addOutput("out", "number");
  }
  Math3DVec3Length.title = "vec3_length";
  Math3DVec3Length.desc = "returns the module of a vector";
  Math3DVec3Length.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      var e = Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]);
      this.setOutputData(0, e);
    }
  };
  e.registerNodeType("math3d/vec3-length", Math3DVec3Length);
  function Math3DVec3Normalize() {
    this.addInput("in", "vec3");
    this.addOutput("out", "vec3");
    (this || _global)._data = new Float32Array(3);
  }
  Math3DVec3Normalize.title = "vec3_normalize";
  Math3DVec3Normalize.desc = "returns the vector normalized";
  Math3DVec3Normalize.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      var e = Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]);
      var a = (this || _global)._data;
      a[0] = t[0] / e;
      a[1] = t[1] / e;
      a[2] = t[2] / e;
      this.setOutputData(0, a);
    }
  };
  e.registerNodeType("math3d/vec3-normalize", Math3DVec3Normalize);
  function Math3DVec3Lerp() {
    this.addInput("A", "vec3");
    this.addInput("B", "vec3");
    this.addInput("f", "vec3");
    this.addOutput("out", "vec3");
    (this || _global).properties = { f: 0.5 };
    (this || _global)._data = new Float32Array(3);
  }
  Math3DVec3Lerp.title = "vec3_lerp";
  Math3DVec3Lerp.desc = "returns the interpolated vector";
  Math3DVec3Lerp.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      var e = this.getInputData(1);
      if (null != e) {
        var a = this.getInputOrProperty("f");
        var o = (this || _global)._data;
        o[0] = t[0] * (1 - a) + e[0] * a;
        o[1] = t[1] * (1 - a) + e[1] * a;
        o[2] = t[2] * (1 - a) + e[2] * a;
        this.setOutputData(0, o);
      }
    }
  };
  e.registerNodeType("math3d/vec3-lerp", Math3DVec3Lerp);
  function Math3DVec3Dot() {
    this.addInput("A", "vec3");
    this.addInput("B", "vec3");
    this.addOutput("out", "number");
  }
  Math3DVec3Dot.title = "vec3_dot";
  Math3DVec3Dot.desc = "returns the dot product";
  Math3DVec3Dot.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (null != t) {
      var e = this.getInputData(1);
      if (null != e) {
        var a = t[0] * e[0] + t[1] * e[1] + t[2] * e[2];
        this.setOutputData(0, a);
      }
    }
  };
  e.registerNodeType("math3d/vec3-dot", Math3DVec3Dot);
  if (t.glMatrix) {
    function Math3DQuaternion() {
      this.addOutput("quat", "quat");
      (this || _global).properties = {
        x: 0,
        y: 0,
        z: 0,
        w: 1,
        normalize: false,
      };
      (this || _global)._value = quat.create();
    }
    Math3DQuaternion.title = "Quaternion";
    Math3DQuaternion.desc = "quaternion";
    Math3DQuaternion.prototype.onExecute = function () {
      (this || _global)._value[0] = this.getInputOrProperty("x");
      (this || _global)._value[1] = this.getInputOrProperty("y");
      (this || _global)._value[2] = this.getInputOrProperty("z");
      (this || _global)._value[3] = this.getInputOrProperty("w");
      (this || _global).properties.normalize &&
        quat.normalize((this || _global)._value, (this || _global)._value);
      this.setOutputData(0, (this || _global)._value);
    };
    Math3DQuaternion.prototype.onGetInputs = function () {
      return [
        ["x", "number"],
        ["y", "number"],
        ["z", "number"],
        ["w", "number"],
      ];
    };
    e.registerNodeType("math3d/quaternion", Math3DQuaternion);
    function Math3DRotation() {
      this.addInputs([
        ["degrees", "number"],
        ["axis", "vec3"],
      ]);
      this.addOutput("quat", "quat");
      (this || _global).properties = {
        angle: 90,
        axis: vec3.fromValues(0, 1, 0),
      };
      (this || _global)._value = quat.create();
    }
    Math3DRotation.title = "Rotation";
    Math3DRotation.desc = "quaternion rotation";
    Math3DRotation.prototype.onExecute = function () {
      var t = this.getInputData(0);
      null == t && (t = (this || _global).properties.angle);
      var e = this.getInputData(1);
      null == e && (e = (this || _global).properties.axis);
      var a = quat.setAxisAngle((this || _global)._value, e, 0.0174532925 * t);
      this.setOutputData(0, a);
    };
    e.registerNodeType("math3d/rotation", Math3DRotation);
    function MathEulerToQuat() {
      this.addInput("euler", "vec3");
      this.addOutput("quat", "quat");
      (this || _global).properties = {
        euler: [0, 0, 0],
        use_yaw_pitch_roll: false,
      };
      (this || _global)._degs = vec3.create();
      (this || _global)._value = quat.create();
    }
    MathEulerToQuat.title = "Euler->Quat";
    MathEulerToQuat.desc = "Converts euler angles (in degrees) to quaternion";
    MathEulerToQuat.prototype.onExecute = function () {
      var t = this.getInputData(0);
      null == t && (t = (this || _global).properties.euler);
      vec3.scale((this || _global)._degs, t, DEG2RAD);
      (this || _global).properties.use_yaw_pitch_roll &&
        ((this || _global)._degs = [
          (this || _global)._degs[2],
          (this || _global)._degs[0],
          (this || _global)._degs[1],
        ]);
      var e = quat.fromEuler((this || _global)._value, (this || _global)._degs);
      this.setOutputData(0, e);
    };
    e.registerNodeType("math3d/euler_to_quat", MathEulerToQuat);
    function MathQuatToEuler() {
      this.addInput(["quat", "quat"]);
      this.addOutput("euler", "vec3");
      (this || _global)._value = vec3.create();
    }
    MathQuatToEuler.title = "Euler->Quat";
    MathQuatToEuler.desc = "Converts rotX,rotY,rotZ in degrees to quat";
    MathQuatToEuler.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t) {
        quat.toEuler((this || _global)._value, t);
        vec3.scale((this || _global)._value, (this || _global)._value, DEG2RAD);
        this.setOutputData(0, (this || _global)._value);
      }
    };
    e.registerNodeType("math3d/quat_to_euler", MathQuatToEuler);
    function Math3DRotateVec3() {
      this.addInputs([
        ["vec3", "vec3"],
        ["quat", "quat"],
      ]);
      this.addOutput("result", "vec3");
      (this || _global).properties = { vec: [0, 0, 1] };
    }
    Math3DRotateVec3.title = "Rot. Vec3";
    Math3DRotateVec3.desc = "rotate a point";
    Math3DRotateVec3.prototype.onExecute = function () {
      var t = this.getInputData(0);
      null == t && (t = (this || _global).properties.vec);
      var e = this.getInputData(1);
      null == e
        ? this.setOutputData(t)
        : this.setOutputData(0, vec3.transformQuat(vec3.create(), t, e));
    };
    e.registerNodeType("math3d/rotate_vec3", Math3DRotateVec3);
    function Math3DMultQuat() {
      this.addInputs([
        ["A", "quat"],
        ["B", "quat"],
      ]);
      this.addOutput("A*B", "quat");
      (this || _global)._value = quat.create();
    }
    Math3DMultQuat.title = "Mult. Quat";
    Math3DMultQuat.desc = "rotate quaternion";
    Math3DMultQuat.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (null != t) {
        var e = this.getInputData(1);
        if (null != e) {
          var a = quat.multiply((this || _global)._value, t, e);
          this.setOutputData(0, a);
        }
      }
    };
    e.registerNodeType("math3d/mult-quat", Math3DMultQuat);
    function Math3DQuatSlerp() {
      this.addInputs([
        ["A", "quat"],
        ["B", "quat"],
        ["factor", "number"],
      ]);
      this.addOutput("slerp", "quat");
      this.addProperty("factor", 0.5);
      (this || _global)._value = quat.create();
    }
    Math3DQuatSlerp.title = "Quat Slerp";
    Math3DQuatSlerp.desc = "quaternion spherical interpolation";
    Math3DQuatSlerp.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (null != t) {
        var e = this.getInputData(1);
        if (null != e) {
          var a = (this || _global).properties.factor;
          null != this.getInputData(2) && (a = this.getInputData(2));
          var o = quat.slerp((this || _global)._value, t, e, a);
          this.setOutputData(0, o);
        }
      }
    };
    e.registerNodeType("math3d/quat-slerp", Math3DQuatSlerp);
    function Math3DRemapRange() {
      this.addInput("vec3", "vec3");
      this.addOutput("remap", "vec3");
      this.addOutput("clamped", "vec3");
      (this || _global).properties = {
        clamp: true,
        range_min: [-1, -1, 0],
        range_max: [1, 1, 0],
        target_min: [-1, -1, 0],
        target_max: [1, 1, 0],
      };
      (this || _global)._value = vec3.create();
      (this || _global)._clamped = vec3.create();
    }
    Math3DRemapRange.title = "Remap Range";
    Math3DRemapRange.desc = "remap a 3D range";
    Math3DRemapRange.prototype.onExecute = function () {
      var t = this.getInputData(0);
      t && (this || _global)._value.set(t);
      var e = (this || _global).properties.range_min;
      var a = (this || _global).properties.range_max;
      var o = (this || _global).properties.target_min;
      var r = (this || _global).properties.target_max;
      for (var l = 0; l < 3; ++l) {
        var n = a[l] - e[l];
        (this || _global)._clamped[l] = Math.clamp(
          (this || _global)._value[l],
          e[l],
          a[l]
        );
        if (0 != n) {
          var s = ((this || _global)._value[l] - e[l]) / n;
          (this || _global).properties.clamp && (s = Math.clamp(s, 0, 1));
          var u = r[l] - o[l];
          (this || _global)._value[l] = o[l] + s * u;
        } else (this || _global)._value[l] = 0.5 * (o[l] + r[l]);
      }
      this.setOutputData(0, (this || _global)._value);
      this.setOutputData(1, (this || _global)._clamped);
    };
    e.registerNodeType("math3d/remap_range", Math3DRemapRange);
  } else
    e.debug &&
      console.warn("No glmatrix found, some Math3D nodes may not work");
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function toString(t) {
    if (t && t.constructor === Object)
      try {
        return JSON.stringify(t);
      } catch (e) {
        return String(t);
      }
    return String(t);
  }
  e.wrapFunctionAsNode("string/toString", toString, [""], "string");
  function compare(t, e) {
    return t == e;
  }
  e.wrapFunctionAsNode(
    "string/compare",
    compare,
    ["string", "string"],
    "boolean"
  );
  function concatenate(t, e) {
    return void 0 === t ? e : void 0 === e ? t : t + e;
  }
  e.wrapFunctionAsNode(
    "string/concatenate",
    concatenate,
    ["string", "string"],
    "string"
  );
  function contains(t, e) {
    return void 0 !== t && void 0 !== e && -1 != t.indexOf(e);
  }
  e.wrapFunctionAsNode(
    "string/contains",
    contains,
    ["string", "string"],
    "boolean"
  );
  function toUpperCase(t) {
    return null != t && t.constructor === String ? t.toUpperCase() : t;
  }
  e.wrapFunctionAsNode("string/toUpperCase", toUpperCase, ["string"], "string");
  function split(t, e) {
    null == e && (e = (this || _global).properties.separator);
    if (null == t) return [];
    if (t.constructor === String) return t.split(e || " ");
    if (t.constructor === Array) {
      var a = [];
      for (var o = 0; o < t.length; ++o)
        "string" == typeof t[o] && (a[o] = t[o].split(e || " "));
      return a;
    }
    return null;
  }
  e.wrapFunctionAsNode(
    "string/split",
    split,
    ["string,array", "string"],
    "array",
    { separator: "," }
  );
  function toFixed(t) {
    return null != t && t.constructor === Number
      ? t.toFixed((this || _global).properties.precision)
      : t;
  }
  e.wrapFunctionAsNode("string/toFixed", toFixed, ["number"], "string", {
    precision: 0,
  });
  function StringToTable() {
    this.addInput("", "string");
    this.addOutput("table", "table");
    this.addOutput("rows", "number");
    this.addProperty("value", "");
    this.addProperty("separator", ",");
    (this || _global)._table = null;
  }
  StringToTable.title = "toTable";
  StringToTable.desc = "Splits a string to table";
  StringToTable.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t) {
      var e = (this || _global).properties.separator || ",";
      if (
        t != (this || _global)._str ||
        e != (this || _global)._last_separator
      ) {
        (this || _global)._last_separator = e;
        (this || _global)._str = t;
        (this || _global)._table = t.split("\n").map(function (t) {
          return t.trim().split(e);
        });
      }
      this.setOutputData(0, (this || _global)._table);
      this.setOutputData(
        1,
        (this || _global)._table ? (this || _global)._table.length : 0
      );
    }
  };
  e.registerNodeType("string/toTable", StringToTable);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function Selector() {
    this.addInput("sel", "number");
    this.addInput("A");
    this.addInput("B");
    this.addInput("C");
    this.addInput("D");
    this.addOutput("out");
    (this || _global).selected = 0;
  }
  Selector.title = "Selector";
  Selector.desc = "selects an output";
  Selector.prototype.onDrawBackground = function (t) {
    if (!(this || _global).flags.collapsed) {
      t.fillStyle = "#AFB";
      var a = ((this || _global).selected + 1) * e.NODE_SLOT_HEIGHT + 6;
      t.beginPath();
      t.moveTo(50, a);
      t.lineTo(50, a + e.NODE_SLOT_HEIGHT);
      t.lineTo(34, a + 0.5 * e.NODE_SLOT_HEIGHT);
      t.fill();
    }
  };
  Selector.prototype.onExecute = function () {
    var t = this.getInputData(0);
    (null != t && t.constructor === Number) || (t = 0);
    (this || _global).selected = t =
      Math.round(t) % ((this || _global).inputs.length - 1);
    var e = this.getInputData(t + 1);
    void 0 !== e && this.setOutputData(0, e);
  };
  Selector.prototype.onGetInputs = function () {
    return [
      ["E", 0],
      ["F", 0],
      ["G", 0],
      ["H", 0],
    ];
  };
  e.registerNodeType("logic/selector", Selector);
  function Sequence() {
    (this || _global).properties = { sequence: "A,B,C" };
    this.addInput("index", "number");
    this.addInput("seq");
    this.addOutput("out");
    (this || _global).index = 0;
    (this || _global).values = (this || _global).properties.sequence.split(",");
  }
  Sequence.title = "Sequence";
  Sequence.desc = "select one element from a sequence from a string";
  Sequence.prototype.onPropertyChanged = function (t, e) {
    "sequence" == t && ((this || _global).values = e.split(","));
  };
  Sequence.prototype.onExecute = function () {
    var t = this.getInputData(1);
    if (t && t != (this || _global).current_sequence) {
      (this || _global).values = t.split(",");
      (this || _global).current_sequence = t;
    }
    var e = this.getInputData(0);
    null == e && (e = 0);
    (this || _global).index = e =
      Math.round(e) % (this || _global).values.length;
    this.setOutputData(0, (this || _global).values[e]);
  };
  e.registerNodeType("logic/sequence", Sequence);
  function logicAnd() {
    (this || _global).properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }
  logicAnd.title = "AND";
  logicAnd.desc = "Return true if all inputs are true";
  logicAnd.prototype.onExecute = function () {
    var t = true;
    for (var e in (this || _global).inputs)
      if (!this.getInputData(e)) {
        t = false;
        break;
      }
    this.setOutputData(0, t);
  };
  logicAnd.prototype.onGetInputs = function () {
    return [["and", "boolean"]];
  };
  e.registerNodeType("logic/AND", logicAnd);
  function logicOr() {
    (this || _global).properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }
  logicOr.title = "OR";
  logicOr.desc = "Return true if at least one input is true";
  logicOr.prototype.onExecute = function () {
    var t = false;
    for (var e in (this || _global).inputs)
      if (this.getInputData(e)) {
        t = true;
        break;
      }
    this.setOutputData(0, t);
  };
  logicOr.prototype.onGetInputs = function () {
    return [["or", "boolean"]];
  };
  e.registerNodeType("logic/OR", logicOr);
  function logicNot() {
    (this || _global).properties = {};
    this.addInput("in", "boolean");
    this.addOutput("out", "boolean");
  }
  logicNot.title = "NOT";
  logicNot.desc = "Return the logical negation";
  logicNot.prototype.onExecute = function () {
    var t = !this.getInputData(0);
    this.setOutputData(0, t);
  };
  e.registerNodeType("logic/NOT", logicNot);
  function logicCompare() {
    (this || _global).properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }
  logicCompare.title = "bool == bool";
  logicCompare.desc = "Compare for logical equality";
  logicCompare.prototype.onExecute = function () {
    var t = null;
    var e = true;
    for (var a in (this || _global).inputs)
      if (null === t) t = this.getInputData(a);
      else if (t != this.getInputData(a)) {
        e = false;
        break;
      }
    this.setOutputData(0, e);
  };
  logicCompare.prototype.onGetInputs = function () {
    return [["bool", "boolean"]];
  };
  e.registerNodeType("logic/CompareBool", logicCompare);
  function logicBranch() {
    (this || _global).properties = {};
    this.addInput("onTrigger", e.ACTION);
    this.addInput("condition", "boolean");
    this.addOutput("true", e.EVENT);
    this.addOutput("false", e.EVENT);
    (this || _global).mode = e.ON_TRIGGER;
  }
  logicBranch.title = "Branch";
  logicBranch.desc = "Branch execution on condition";
  logicBranch.prototype.onExecute = function (t, e) {
    var a = this.getInputData(1);
    a ? this.triggerSlot(0) : this.triggerSlot(1);
  };
  e.registerNodeType("logic/IF", logicBranch);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function GraphicsPlot() {
    this.addInput("A", "Number");
    this.addInput("B", "Number");
    this.addInput("C", "Number");
    this.addInput("D", "Number");
    (this || _global).values = [[], [], [], []];
    (this || _global).properties = { scale: 2 };
  }
  GraphicsPlot.title = "Plot";
  GraphicsPlot.desc = "Plots data over time";
  GraphicsPlot.colors = ["#FFF", "#F99", "#9F9", "#99F"];
  GraphicsPlot.prototype.onExecute = function (t) {
    if (!(this || _global).flags.collapsed) {
      var e = (this || _global).size;
      for (var a = 0; a < 4; ++a) {
        var o = this.getInputData(a);
        if (null != o) {
          var r = (this || _global).values[a];
          r.push(o);
          r.length > e[0] && r.shift();
        }
      }
    }
  };
  GraphicsPlot.prototype.onDrawBackground = function (t) {
    if (!(this || _global).flags.collapsed) {
      var e = (this || _global).size;
      var a = (0.5 * e[1]) / (this || _global).properties.scale;
      var o = GraphicsPlot.colors;
      var r = 0.5 * e[1];
      t.fillStyle = "#000";
      t.fillRect(0, 0, e[0], e[1]);
      t.strokeStyle = "#555";
      t.beginPath();
      t.moveTo(0, r);
      t.lineTo(e[0], r);
      t.stroke();
      if ((this || _global).inputs)
        for (var l = 0; l < 4; ++l) {
          var n = (this || _global).values[l];
          if ((this || _global).inputs[l] && (this || _global).inputs[l].link) {
            t.strokeStyle = o[l];
            t.beginPath();
            var s = n[0] * a * -1 + r;
            t.moveTo(0, Math.clamp(s, 0, e[1]));
            for (var u = 1; u < n.length && u < e[0]; ++u) {
              s = n[u] * a * -1 + r;
              t.lineTo(u, Math.clamp(s, 0, e[1]));
            }
            t.stroke();
          }
        }
    }
  };
  e.registerNodeType("graphics/plot", GraphicsPlot);
  function GraphicsImage() {
    this.addOutput("frame", "image");
    (this || _global).properties = { url: "" };
  }
  GraphicsImage.title = "Image";
  GraphicsImage.desc = "Image loader";
  GraphicsImage.widgets = [{ name: "load", text: "Load", type: "button" }];
  GraphicsImage.supported_extensions = ["jpg", "jpeg", "png", "gif"];
  GraphicsImage.prototype.onAdded = function () {
    "" != (this || _global).properties.url &&
      null == (this || _global).img &&
      this.loadImage((this || _global).properties.url);
  };
  GraphicsImage.prototype.onDrawBackground = function (t) {
    (this || _global).flags.collapsed ||
      ((this || _global).img &&
        (this || _global).size[0] > 5 &&
        (this || _global).size[1] > 5 &&
        (this || _global).img.width &&
        t.drawImage(
          (this || _global).img,
          0,
          0,
          (this || _global).size[0],
          (this || _global).size[1]
        ));
  };
  GraphicsImage.prototype.onExecute = function () {
    (this || _global).img || ((this || _global).boxcolor = "#000");
    (this || _global).img && (this || _global).img.width
      ? this.setOutputData(0, (this || _global).img)
      : this.setOutputData(0, null);
    (this || _global).img &&
      (this || _global).img.dirty &&
      ((this || _global).img.dirty = false);
  };
  GraphicsImage.prototype.onPropertyChanged = function (t, e) {
    (this || _global).properties[t] = e;
    "url" == t && "" != e && this.loadImage(e);
    return true;
  };
  GraphicsImage.prototype.loadImage = function (t, a) {
    if ("" != t) {
      (this || _global).img = document.createElement("img");
      "http" == t.substr(0, 4) &&
        e.proxy &&
        (t = e.proxy + t.substr(t.indexOf(":") + 3));
      (this || _global).img.src = t;
      (this || _global).boxcolor = "#F95";
      var o = this || _global;
      (this || _global).img.onload = function () {
        a && a(this || _global);
        console.log("Image loaded, size: " + o.img.width + "x" + o.img.height);
        (this || _global).dirty = true;
        o.boxcolor = "#9F9";
        o.setDirtyCanvas(true);
      };
      (this || _global).img.onerror = function () {
        console.log("error loading the image:" + t);
      };
    } else (this || _global).img = null;
  };
  GraphicsImage.prototype.onWidget = function (t, e) {
    "load" == e.name && this.loadImage((this || _global).properties.url);
  };
  GraphicsImage.prototype.onDropFile = function (t) {
    var e = this || _global;
    (this || _global)._url && URL.revokeObjectURL((this || _global)._url);
    (this || _global)._url = URL.createObjectURL(t);
    (this || _global).properties.url = (this || _global)._url;
    this.loadImage((this || _global)._url, function (t) {
      e.size[1] = (t.height / t.width) * e.size[0];
    });
  };
  e.registerNodeType("graphics/image", GraphicsImage);
  function ColorPalette() {
    this.addInput("f", "number");
    this.addOutput("Color", "color");
    (this || _global).properties = {
      colorA: "#444444",
      colorB: "#44AAFF",
      colorC: "#44FFAA",
      colorD: "#FFFFFF",
    };
  }
  ColorPalette.title = "Palette";
  ColorPalette.desc = "Generates a color";
  ColorPalette.prototype.onExecute = function () {
    var t = [];
    null != (this || _global).properties.colorA &&
      t.push(hex2num((this || _global).properties.colorA));
    null != (this || _global).properties.colorB &&
      t.push(hex2num((this || _global).properties.colorB));
    null != (this || _global).properties.colorC &&
      t.push(hex2num((this || _global).properties.colorC));
    null != (this || _global).properties.colorD &&
      t.push(hex2num((this || _global).properties.colorD));
    var e = this.getInputData(0);
    null == e && (e = 0.5);
    e > 1 ? (e = 1) : e < 0 && (e = 0);
    if (0 != t.length) {
      var a = [0, 0, 0];
      if (0 == e) a = t[0];
      else if (1 == e) a = t[t.length - 1];
      else {
        var o = (t.length - 1) * e;
        var r = t[Math.floor(o)];
        var l = t[Math.floor(o) + 1];
        var n = o - Math.floor(o);
        a[0] = r[0] * (1 - n) + l[0] * n;
        a[1] = r[1] * (1 - n) + l[1] * n;
        a[2] = r[2] * (1 - n) + l[2] * n;
      }
      for (var s = 0; s < a.length; s++) a[s] /= 255;
      (this || _global).boxcolor = colorToString(a);
      this.setOutputData(0, a);
    }
  };
  e.registerNodeType("color/palette", ColorPalette);
  function ImageFrame() {
    this.addInput("", "image,canvas");
    (this || _global).size = [200, 200];
  }
  ImageFrame.title = "Frame";
  ImageFrame.desc = "Frame viewerew";
  ImageFrame.widgets = [
    { name: "resize", text: "Resize box", type: "button" },
    { name: "view", text: "View Image", type: "button" },
  ];
  ImageFrame.prototype.onDrawBackground = function (t) {
    (this || _global).frame &&
      !(this || _global).flags.collapsed &&
      t.drawImage(
        (this || _global).frame,
        0,
        0,
        (this || _global).size[0],
        (this || _global).size[1]
      );
  };
  ImageFrame.prototype.onExecute = function () {
    (this || _global).frame = this.getInputData(0);
    this.setDirtyCanvas(true);
  };
  ImageFrame.prototype.onWidget = function (t, e) {
    if ("resize" == e.name && (this || _global).frame) {
      var a = (this || _global).frame.width;
      var o = (this || _global).frame.height;
      if (!a && null != (this || _global).frame.videoWidth) {
        a = (this || _global).frame.videoWidth;
        o = (this || _global).frame.videoHeight;
      }
      a && o && ((this || _global).size = [a, o]);
      this.setDirtyCanvas(true, true);
    } else "view" == e.name && this.show();
  };
  ImageFrame.prototype.show = function () {
    showElement &&
      (this || _global).frame &&
      showElement((this || _global).frame);
  };
  e.registerNodeType("graphics/frame", ImageFrame);
  function ImageFade() {
    this.addInputs([
      ["img1", "image"],
      ["img2", "image"],
      ["fade", "number"],
    ]);
    this.addOutput("", "image");
    (this || _global).properties = { fade: 0.5, width: 512, height: 512 };
  }
  ImageFade.title = "Image fade";
  ImageFade.desc = "Fades between images";
  ImageFade.widgets = [
    { name: "resizeA", text: "Resize to A", type: "button" },
    { name: "resizeB", text: "Resize to B", type: "button" },
  ];
  ImageFade.prototype.onAdded = function () {
    this.createCanvas();
    var t = (this || _global).canvas.getContext("2d");
    t.fillStyle = "#000";
    t.fillRect(
      0,
      0,
      (this || _global).properties.width,
      (this || _global).properties.height
    );
  };
  ImageFade.prototype.createCanvas = function () {
    (this || _global).canvas = document.createElement("canvas");
    (this || _global).canvas.width = (this || _global).properties.width;
    (this || _global).canvas.height = (this || _global).properties.height;
  };
  ImageFade.prototype.onExecute = function () {
    var t = (this || _global).canvas.getContext("2d");
    (this || _global).canvas.width = (this || _global).canvas.width;
    var e = this.getInputData(0);
    null != e &&
      t.drawImage(
        e,
        0,
        0,
        (this || _global).canvas.width,
        (this || _global).canvas.height
      );
    var a = this.getInputData(2);
    null == a
      ? (a = (this || _global).properties.fade)
      : ((this || _global).properties.fade = a);
    t.globalAlpha = a;
    var o = this.getInputData(1);
    null != o &&
      t.drawImage(
        o,
        0,
        0,
        (this || _global).canvas.width,
        (this || _global).canvas.height
      );
    t.globalAlpha = 1;
    this.setOutputData(0, (this || _global).canvas);
    this.setDirtyCanvas(true);
  };
  e.registerNodeType("graphics/imagefade", ImageFade);
  function ImageCrop() {
    this.addInput("", "image");
    this.addOutput("", "image");
    (this || _global).properties = {
      width: 256,
      height: 256,
      x: 0,
      y: 0,
      scale: 1,
    };
    (this || _global).size = [50, 20];
  }
  ImageCrop.title = "Crop";
  ImageCrop.desc = "Crop Image";
  ImageCrop.prototype.onAdded = function () {
    this.createCanvas();
  };
  ImageCrop.prototype.createCanvas = function () {
    (this || _global).canvas = document.createElement("canvas");
    (this || _global).canvas.width = (this || _global).properties.width;
    (this || _global).canvas.height = (this || _global).properties.height;
  };
  ImageCrop.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t)
      if (t.width) {
        var e = (this || _global).canvas.getContext("2d");
        e.drawImage(
          t,
          -(this || _global).properties.x,
          -(this || _global).properties.y,
          t.width * (this || _global).properties.scale,
          t.height * (this || _global).properties.scale
        );
        this.setOutputData(0, (this || _global).canvas);
      } else this.setOutputData(0, null);
  };
  ImageCrop.prototype.onDrawBackground = function (t) {
    (this || _global).flags.collapsed ||
      ((this || _global).canvas &&
        t.drawImage(
          (this || _global).canvas,
          0,
          0,
          (this || _global).canvas.width,
          (this || _global).canvas.height,
          0,
          0,
          (this || _global).size[0],
          (this || _global).size[1]
        ));
  };
  ImageCrop.prototype.onPropertyChanged = function (t, e) {
    (this || _global).properties[t] = e;
    if ("scale" == t) {
      (this || _global).properties[t] = parseFloat(e);
      if (0 == (this || _global).properties[t]) {
        console.error("Error in scale");
        (this || _global).properties[t] = 1;
      }
    } else (this || _global).properties[t] = parseInt(e);
    this.createCanvas();
    return true;
  };
  e.registerNodeType("graphics/cropImage", ImageCrop);
  function CanvasNode() {
    this.addInput("clear", e.ACTION);
    this.addOutput("", "canvas");
    (this || _global).properties = { width: 512, height: 512, autoclear: true };
    (this || _global).canvas = document.createElement("canvas");
    (this || _global).ctx = (this || _global).canvas.getContext("2d");
  }
  CanvasNode.title = "Canvas";
  CanvasNode.desc = "Canvas to render stuff";
  CanvasNode.prototype.onExecute = function () {
    var t = (this || _global).canvas;
    var e = 0 | (this || _global).properties.width;
    var a = 0 | (this || _global).properties.height;
    t.width != e && (t.width = e);
    t.height != a && (t.height = a);
    (this || _global).properties.autoclear &&
      (this || _global).ctx.clearRect(0, 0, t.width, t.height);
    this.setOutputData(0, t);
  };
  CanvasNode.prototype.onAction = function (t, e) {
    "clear" == t &&
      (this || _global).ctx.clearRect(
        0,
        0,
        (this || _global).canvas.width,
        (this || _global).canvas.height
      );
  };
  e.registerNodeType("graphics/canvas", CanvasNode);
  function DrawImageNode() {
    this.addInput("canvas", "canvas");
    this.addInput("img", "image,canvas");
    this.addInput("x", "number");
    this.addInput("y", "number");
    (this || _global).properties = { x: 0, y: 0, opacity: 1 };
  }
  DrawImageNode.title = "DrawImage";
  DrawImageNode.desc = "Draws image into a canvas";
  DrawImageNode.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t) {
      var e = this.getInputOrProperty("img");
      if (e) {
        var a = this.getInputOrProperty("x");
        var o = this.getInputOrProperty("y");
        var r = t.getContext("2d");
        r.drawImage(e, a, o);
      }
    }
  };
  e.registerNodeType("graphics/drawImage", DrawImageNode);
  function DrawRectangleNode() {
    this.addInput("canvas", "canvas");
    this.addInput("x", "number");
    this.addInput("y", "number");
    this.addInput("w", "number");
    this.addInput("h", "number");
    (this || _global).properties = {
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      color: "white",
      opacity: 1,
    };
  }
  DrawRectangleNode.title = "DrawRectangle";
  DrawRectangleNode.desc = "Draws rectangle in canvas";
  DrawRectangleNode.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t) {
      var e = this.getInputOrProperty("x");
      var a = this.getInputOrProperty("y");
      var o = this.getInputOrProperty("w");
      var r = this.getInputOrProperty("h");
      var l = t.getContext("2d");
      l.fillRect(e, a, o, r);
    }
  };
  e.registerNodeType("graphics/drawRectangle", DrawRectangleNode);
  function ImageVideo() {
    this.addInput("t", "number");
    this.addOutputs([
      ["frame", "image"],
      ["t", "number"],
      ["d", "number"],
    ]);
    (this || _global).properties = { url: "", use_proxy: true };
  }
  ImageVideo.title = "Video";
  ImageVideo.desc = "Video playback";
  ImageVideo.widgets = [
    { name: "play", text: "PLAY", type: "minibutton" },
    { name: "stop", text: "STOP", type: "minibutton" },
    { name: "demo", text: "Demo video", type: "button" },
    { name: "mute", text: "Mute video", type: "button" },
  ];
  ImageVideo.prototype.onExecute = function () {
    if ((this || _global).properties.url) {
      (this || _global).properties.url != (this || _global)._video_url &&
        this.loadVideo((this || _global).properties.url);
      if ((this || _global)._video && 0 != (this || _global)._video.width) {
        var t = this.getInputData(0);
        if (t && t >= 0 && t <= 1) {
          (this || _global)._video.currentTime =
            t * (this || _global)._video.duration;
          (this || _global)._video.pause();
        }
        (this || _global)._video.dirty = true;
        this.setOutputData(0, (this || _global)._video);
        this.setOutputData(1, (this || _global)._video.currentTime);
        this.setOutputData(2, (this || _global)._video.duration);
        this.setDirtyCanvas(true);
      }
    }
  };
  ImageVideo.prototype.onStart = function () {
    this.play();
  };
  ImageVideo.prototype.onStop = function () {
    this.stop();
  };
  ImageVideo.prototype.loadVideo = function (t) {
    (this || _global)._video_url = t;
    var a = t.substr(0, 10).indexOf(":");
    var o = "";
    -1 != a && (o = t.substr(0, a));
    var r = "";
    if (o) {
      r = t.substr(0, t.indexOf("/", o.length + 3));
      r = r.substr(o.length + 3);
    }
    (this || _global).properties.use_proxy &&
      o &&
      e.proxy &&
      r != location.host &&
      (t = e.proxy + t.substr(t.indexOf(":") + 3));
    (this || _global)._video = document.createElement("video");
    (this || _global)._video.src = t;
    (this || _global)._video.type = "type=video/mp4";
    (this || _global)._video.muted = true;
    (this || _global)._video.autoplay = true;
    var l = this || _global;
    (this || _global)._video.addEventListener("loadedmetadata", function (t) {
      console.log("Duration: " + (this || _global).duration + " seconds");
      console.log(
        "Size: " +
          (this || _global).videoWidth +
          "," +
          (this || _global).videoHeight
      );
      l.setDirtyCanvas(true);
      (this || _global).width = (this || _global).videoWidth;
      (this || _global).height = (this || _global).videoHeight;
    });
    (this || _global)._video.addEventListener("progress", function (t) {
      console.log("video loading...");
    });
    (this || _global)._video.addEventListener("error", function (t) {
      console.error("Error loading video: " + (this || _global).src);
      if ((this || _global).error)
        switch ((this || _global).error.code) {
          case (this || _global).error.MEDIA_ERR_ABORTED:
            console.error("You stopped the video.");
            break;
          case (this || _global).error.MEDIA_ERR_NETWORK:
            console.error("Network error - please try again later.");
            break;
          case (this || _global).error.MEDIA_ERR_DECODE:
            console.error("Video is broken..");
            break;
          case (this || _global).error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            console.error("Sorry, your browser can't play this video.");
            break;
        }
    });
    (this || _global)._video.addEventListener("ended", function (t) {
      console.log("Video Ended.");
      this.play();
    });
  };
  ImageVideo.prototype.onPropertyChanged = function (t, e) {
    (this || _global).properties[t] = e;
    "url" == t && "" != e && this.loadVideo(e);
    return true;
  };
  ImageVideo.prototype.play = function () {
    (this || _global)._video &&
      (this || _global)._video.videoWidth &&
      (this || _global)._video.play();
  };
  ImageVideo.prototype.playPause = function () {
    (this || _global)._video &&
      ((this || _global)._video.paused ? this.play() : this.pause());
  };
  ImageVideo.prototype.stop = function () {
    if ((this || _global)._video) {
      (this || _global)._video.pause();
      (this || _global)._video.currentTime = 0;
    }
  };
  ImageVideo.prototype.pause = function () {
    if ((this || _global)._video) {
      console.log("Video paused");
      (this || _global)._video.pause();
    }
  };
  ImageVideo.prototype.onWidget = function (t, e) {};
  e.registerNodeType("graphics/video", ImageVideo);
  function ImageWebcam() {
    this.addOutput("Webcam", "image");
    (this || _global).properties = {
      filterFacingMode: false,
      facingMode: "user",
    };
    (this || _global).boxcolor = "black";
    (this || _global).frame = 0;
  }
  ImageWebcam.title = "Webcam";
  ImageWebcam.desc = "Webcam image";
  ImageWebcam.is_webcam_open = false;
  ImageWebcam.prototype.openStream = function () {
    if (navigator.mediaDevices.getUserMedia) {
      (this || _global)._waiting_confirmation = true;
      var t = {
        audio: false,
        video: !(this || _global).properties.filterFacingMode || {
          facingMode: (this || _global).properties.facingMode,
        },
      };
      navigator.mediaDevices
        .getUserMedia(t)
        .then((this || _global).streamReady.bind(this || _global))
        .catch(onFailSoHard);
      var e = this || _global;
    } else
      console.log(
        "getUserMedia() is not supported in your browser, use chrome and enable WebRTC from about://flags"
      );
    function onFailSoHard(t) {
      console.log("Webcam rejected", t);
      e._webcam_stream = false;
      ImageWebcam.is_webcam_open = false;
      e.boxcolor = "red";
      e.trigger("stream_error");
    }
  };
  ImageWebcam.prototype.closeStream = function () {
    if ((this || _global)._webcam_stream) {
      var t = (this || _global)._webcam_stream.getTracks();
      if (t.length) for (var e = 0; e < t.length; ++e) t[e].stop();
      ImageWebcam.is_webcam_open = false;
      (this || _global)._webcam_stream = null;
      (this || _global)._video = null;
      (this || _global).boxcolor = "black";
      this.trigger("stream_closed");
    }
  };
  ImageWebcam.prototype.onPropertyChanged = function (t, e) {
    if ("facingMode" == t) {
      (this || _global).properties.facingMode = e;
      this.closeStream();
      this.openStream();
    }
  };
  ImageWebcam.prototype.onRemoved = function () {
    this.closeStream();
  };
  ImageWebcam.prototype.streamReady = function (t) {
    (this || _global)._webcam_stream = t;
    (this || _global).boxcolor = "green";
    var e = (this || _global)._video;
    if (!e) {
      e = document.createElement("video");
      e.autoplay = true;
      e.srcObject = t;
      (this || _global)._video = e;
      e.onloadedmetadata = function (t) {
        console.log(t);
        ImageWebcam.is_webcam_open = true;
      };
    }
    this.trigger("stream_ready", e);
  };
  ImageWebcam.prototype.onExecute = function () {
    null != (this || _global)._webcam_stream ||
      (this || _global)._waiting_confirmation ||
      this.openStream();
    if ((this || _global)._video && (this || _global)._video.videoWidth) {
      (this || _global)._video.frame = ++(this || _global).frame;
      (this || _global)._video.width = (this || _global)._video.videoWidth;
      (this || _global)._video.height = (this || _global)._video.videoHeight;
      this.setOutputData(0, (this || _global)._video);
      for (var t = 1; t < (this || _global).outputs.length; ++t)
        if ((this || _global).outputs[t])
          switch ((this || _global).outputs[t].name) {
            case "width":
              this.setOutputData(t, (this || _global)._video.videoWidth);
              break;
            case "height":
              this.setOutputData(t, (this || _global)._video.videoHeight);
              break;
          }
    }
  };
  ImageWebcam.prototype.getExtraMenuOptions = function (t) {
    var e = this || _global;
    var a = e.properties.show ? "Hide Frame" : "Show Frame";
    return [
      {
        content: a,
        callback: function () {
          e.properties.show = !e.properties.show;
        },
      },
    ];
  };
  ImageWebcam.prototype.onDrawBackground = function (t) {
    if (
      !((this || _global).flags.collapsed || (this || _global).size[1] <= 20) &&
      (this || _global).properties.show &&
      (this || _global)._video
    ) {
      t.save();
      t.drawImage(
        (this || _global)._video,
        0,
        0,
        (this || _global).size[0],
        (this || _global).size[1]
      );
      t.restore();
    }
  };
  ImageWebcam.prototype.onGetOutputs = function () {
    return [
      ["width", "number"],
      ["height", "number"],
      ["stream_ready", e.EVENT],
      ["stream_closed", e.EVENT],
      ["stream_error", e.EVENT],
    ];
  };
  e.registerNodeType("graphics/webcam", ImageWebcam);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  var a = t.LGraphCanvas;
  t.LGraphTexture = null;
  if ("undefined" != typeof GL) {
    a.link_type_colors.Texture = "#987";
    t.LGraphTexture = LGraphTexture;
    LGraphTexture.title = "Texture";
    LGraphTexture.desc = "Texture";
    LGraphTexture.widgets_info = {
      name: { widget: "texture" },
      filter: { widget: "checkbox" },
    };
    LGraphTexture.loadTextureCallback = null;
    LGraphTexture.image_preview_size = 256;
    LGraphTexture.UNDEFINED = 0;
    LGraphTexture.PASS_THROUGH = 1;
    LGraphTexture.COPY = 2;
    LGraphTexture.LOW = 3;
    LGraphTexture.HIGH = 4;
    LGraphTexture.REUSE = 5;
    LGraphTexture.DEFAULT = 2;
    LGraphTexture.MODE_VALUES = {
      undefined: LGraphTexture.UNDEFINED,
      "pass through": LGraphTexture.PASS_THROUGH,
      copy: LGraphTexture.COPY,
      low: LGraphTexture.LOW,
      high: LGraphTexture.HIGH,
      reuse: LGraphTexture.REUSE,
      default: LGraphTexture.DEFAULT,
    };
    LGraphTexture.getTexturesContainer = function () {
      return gl.textures;
    };
    LGraphTexture.loadTexture = function (t, a) {
      a = a || {};
      var o = t;
      "http://" == o.substr(0, 7) && e.proxy && (o = e.proxy + o.substr(7));
      var r = LGraphTexture.getTexturesContainer();
      var l = (r[t] = GL.Texture.fromURL(o, a));
      return l;
    };
    LGraphTexture.getTexture = function (t) {
      var e = this.getTexturesContainer();
      if (!e) throw "Cannot load texture, container of textures not found";
      var a = e[t];
      return !a && t && ":" != t[0] ? this.loadTexture(t) : a;
    };
    LGraphTexture.getTargetTexture = function (t, e, a) {
      if (!t)
        throw "LGraphTexture.getTargetTexture expects a reference texture";
      var o = null;
      switch (a) {
        case LGraphTexture.LOW:
          o = gl.UNSIGNED_BYTE;
          break;
        case LGraphTexture.HIGH:
          o = gl.HIGH_PRECISION_FORMAT;
          break;
        case LGraphTexture.REUSE:
          return t;
        case LGraphTexture.COPY:
        default:
          o = t ? t.type : gl.UNSIGNED_BYTE;
          break;
      }
      (e &&
        e.width == t.width &&
        e.height == t.height &&
        e.type == o &&
        e.format == t.format) ||
        (e = new GL.Texture(t.width, t.height, {
          type: o,
          format: t.format,
          filter: gl.LINEAR,
        }));
      return e;
    };
    LGraphTexture.getTextureType = function (t, e) {
      var a = e ? e.type : gl.UNSIGNED_BYTE;
      switch (t) {
        case LGraphTexture.HIGH:
          a = gl.HIGH_PRECISION_FORMAT;
          break;
        case LGraphTexture.LOW:
          a = gl.UNSIGNED_BYTE;
          break;
      }
      return a;
    };
    LGraphTexture.getWhiteTexture = function () {
      if ((this || _global)._white_texture)
        return (this || _global)._white_texture;
      var t = ((this || _global)._white_texture = GL.Texture.fromMemory(
        1,
        1,
        [255, 255, 255, 255],
        { format: gl.RGBA, wrap: gl.REPEAT, filter: gl.NEAREST }
      ));
      return t;
    };
    LGraphTexture.getNoiseTexture = function () {
      if ((this || _global)._noise_texture)
        return (this || _global)._noise_texture;
      var t = new Uint8Array(1048576);
      for (var e = 0; e < 1048576; ++e) t[e] = 255 * Math.random();
      var a = GL.Texture.fromMemory(512, 512, t, {
        format: gl.RGBA,
        wrap: gl.REPEAT,
        filter: gl.NEAREST,
      });
      (this || _global)._noise_texture = a;
      return a;
    };
    LGraphTexture.prototype.onDropFile = function (t, e, a) {
      if (t) {
        var o = null;
        if ("string" == typeof t) o = GL.Texture.fromURL(t);
        else if (-1 != e.toLowerCase().indexOf(".dds"))
          o = GL.Texture.fromDDSInMemory(t);
        else {
          var r = new Blob([a]);
          var l = URL.createObjectURL(r);
          o = GL.Texture.fromURL(l);
        }
        (this || _global)._drop_texture = o;
        (this || _global).properties.name = e;
      } else {
        (this || _global)._drop_texture = null;
        (this || _global).properties.name = "";
      }
    };
    LGraphTexture.prototype.getExtraMenuOptions = function (t) {
      var e = this || _global;
      if ((this || _global)._drop_texture)
        return [
          {
            content: "Clear",
            callback: function () {
              e._drop_texture = null;
              e.properties.name = "";
            },
          },
        ];
    };
    LGraphTexture.prototype.onExecute = function () {
      var t = null;
      this.isOutputConnected(1) && (t = this.getInputData(0));
      !t &&
        (this || _global)._drop_texture &&
        (t = (this || _global)._drop_texture);
      !t &&
        (this || _global).properties.name &&
        (t = LGraphTexture.getTexture((this || _global).properties.name));
      if (t) {
        (this || _global)._last_tex = t;
        false === (this || _global).properties.filter
          ? t.setParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST)
          : t.setParameter(gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        this.setOutputData(0, t);
        this.setOutputData(1, t.fullpath || t.filename);
        for (var e = 2; e < (this || _global).outputs.length; e++) {
          var a = (this || _global).outputs[e];
          if (a) {
            var o = null;
            "width" == a.name
              ? (o = t.width)
              : "height" == a.name
              ? (o = t.height)
              : "aspect" == a.name && (o = t.width / t.height);
            this.setOutputData(e, o);
          }
        }
      } else {
        this.setOutputData(0, null);
        this.setOutputData(1, "");
      }
    };
    LGraphTexture.prototype.onResourceRenamed = function (t, e) {
      (this || _global).properties.name == t &&
        ((this || _global).properties.name = e);
    };
    LGraphTexture.prototype.onDrawBackground = function (t) {
      if (
        !((this || _global).flags.collapsed || (this || _global).size[1] <= 20)
      )
        if ((this || _global)._drop_texture && t.webgl)
          t.drawImage(
            (this || _global)._drop_texture,
            0,
            0,
            (this || _global).size[0],
            (this || _global).size[1]
          );
        else {
          if (
            (this || _global)._last_preview_tex != (this || _global)._last_tex
          )
            if (t.webgl)
              (this || _global)._canvas = (this || _global)._last_tex;
            else {
              var e = LGraphTexture.generateLowResTexturePreview(
                (this || _global)._last_tex
              );
              if (!e) return;
              (this || _global)._last_preview_tex = (this || _global)._last_tex;
              (this || _global)._canvas = cloneCanvas(e);
            }
          if ((this || _global)._canvas) {
            t.save();
            if (!t.webgl) {
              t.translate(0, (this || _global).size[1]);
              t.scale(1, -1);
            }
            t.drawImage(
              (this || _global)._canvas,
              0,
              0,
              (this || _global).size[0],
              (this || _global).size[1]
            );
            t.restore();
          }
        }
    };
    LGraphTexture.generateLowResTexturePreview = function (t) {
      if (!t) return null;
      var e = LGraphTexture.image_preview_size;
      var a = t;
      if (t.format == gl.DEPTH_COMPONENT) return null;
      if (t.width > e || t.height > e) {
        a = (this || _global)._preview_temp_tex;
        if (!(this || _global)._preview_temp_tex) {
          a = new GL.Texture(e, e, { minFilter: gl.NEAREST });
          (this || _global)._preview_temp_tex = a;
        }
        t.copyTo(a);
        t = a;
      }
      var o = (this || _global)._preview_canvas;
      if (!o) {
        o = createCanvas(e, e);
        (this || _global)._preview_canvas = o;
      }
      a && a.toCanvas(o);
      return o;
    };
    LGraphTexture.prototype.getResources = function (t) {
      (this || _global).properties.name &&
        (t[(this || _global).properties.name] = GL.Texture);
      return t;
    };
    LGraphTexture.prototype.onGetInputs = function () {
      return [["in", "Texture"]];
    };
    LGraphTexture.prototype.onGetOutputs = function () {
      return [
        ["width", "number"],
        ["height", "number"],
        ["aspect", "number"],
      ];
    };
    LGraphTexture.replaceCode = function (t, e) {
      return t.replace(/\{\{[a-zA-Z0-9_]*\}\}/g, function (t) {
        t = t.replace(/[\{\}]/g, "");
        return e[t] || "";
      });
    };
    e.registerNodeType("texture/texture", LGraphTexture);
    LGraphTexturePreview.title = "Preview";
    LGraphTexturePreview.desc = "Show a texture in the graph canvas";
    LGraphTexturePreview.allow_preview = false;
    LGraphTexturePreview.prototype.onDrawBackground = function (t) {
      if (
        !(this || _global).flags.collapsed &&
        (t.webgl || LGraphTexturePreview.allow_preview)
      ) {
        var e = this.getInputData(0);
        if (e) {
          var a = null;
          a =
            !e.handle && t.webgl
              ? e
              : LGraphTexture.generateLowResTexturePreview(e);
          t.save();
          if ((this || _global).properties.flipY) {
            t.translate(0, (this || _global).size[1]);
            t.scale(1, -1);
          }
          t.drawImage(
            a,
            0,
            0,
            (this || _global).size[0],
            (this || _global).size[1]
          );
          t.restore();
        }
      }
    };
    e.registerNodeType("texture/preview", LGraphTexturePreview);
    LGraphTextureSave.title = "Save";
    LGraphTextureSave.desc = "Save a texture in the repository";
    LGraphTextureSave.prototype.getPreviewTexture = function () {
      return (this || _global)._texture;
    };
    LGraphTextureSave.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t) {
        if ((this || _global).properties.generate_mipmaps) {
          t.bind(0);
          t.setParameter(gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.generateMipmap(t.texture_type);
          t.unbind(0);
        }
        if ((this || _global).properties.name)
          if (LGraphTexture.storeTexture)
            LGraphTexture.storeTexture((this || _global).properties.name, t);
          else {
            var e = LGraphTexture.getTexturesContainer();
            e[(this || _global).properties.name] = t;
          }
        (this || _global)._texture = t;
        this.setOutputData(0, t);
        this.setOutputData(1, (this || _global).properties.name);
      }
    };
    e.registerNodeType("texture/save", LGraphTextureSave);
    LGraphTextureOperation.widgets_info = {
      uvcode: { widget: "code" },
      pixelcode: { widget: "code" },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureOperation.title = "Operation";
    LGraphTextureOperation.desc = "Texture shader operation";
    LGraphTextureOperation.presets = {};
    LGraphTextureOperation.prototype.getExtraMenuOptions = function (t) {
      var e = this || _global;
      var a = e.properties.show ? "Hide Texture" : "Show Texture";
      return [
        {
          content: a,
          callback: function () {
            e.properties.show = !e.properties.show;
          },
        },
      ];
    };
    LGraphTextureOperation.prototype.onPropertyChanged = function () {
      (this || _global).has_error = false;
    };
    LGraphTextureOperation.prototype.onDrawBackground = function (t) {
      if (
        !(
          (this || _global).flags.collapsed || (this || _global).size[1] <= 20
        ) &&
        (this || _global).properties.show &&
        (this || _global)._tex &&
        (this || _global)._tex.gl == t
      ) {
        t.save();
        t.drawImage(
          (this || _global)._tex,
          0,
          0,
          (this || _global).size[0],
          (this || _global).size[1]
        );
        t.restore();
      }
    };
    LGraphTextureOperation.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (this.isOutputConnected(0))
        if (
          (this || _global).properties.precision !== LGraphTexture.PASS_THROUGH
        ) {
          var e = this.getInputData(1);
          if (
            (this || _global).properties.uvcode ||
            (this || _global).properties.pixelcode
          ) {
            var a = 512;
            var o = 512;
            if (t) {
              a = t.width;
              o = t.height;
            } else if (e) {
              a = e.width;
              o = e.height;
            }
            e || (e = GL.Texture.getWhiteTexture());
            var r = LGraphTexture.getTextureType(
              (this || _global).properties.precision,
              t
            );
            t || (this || _global)._tex
              ? ((this || _global)._tex = LGraphTexture.getTargetTexture(
                  t || (this || _global)._tex,
                  (this || _global)._tex,
                  (this || _global).properties.precision
                ))
              : ((this || _global)._tex = new GL.Texture(a, o, {
                  type: r,
                  format: gl.RGBA,
                  filter: gl.LINEAR,
                }));
            var l = "";
            if ((this || _global).properties.uvcode) {
              l = "uv = " + (this || _global).properties.uvcode;
              -1 != (this || _global).properties.uvcode.indexOf(";") &&
                (l = (this || _global).properties.uvcode);
            }
            var n = "";
            if ((this || _global).properties.pixelcode) {
              n = "result = " + (this || _global).properties.pixelcode;
              -1 != (this || _global).properties.pixelcode.indexOf(";") &&
                (n = (this || _global).properties.pixelcode);
            }
            var s = (this || _global)._shader;
            if (
              !(this || _global).has_error &&
              (!s || (this || _global)._shader_code != l + "|" + n)
            ) {
              var u = LGraphTexture.replaceCode(
                LGraphTextureOperation.pixel_shader,
                { UV_CODE: l, PIXEL_CODE: n }
              );
              try {
                s = new GL.Shader(Shader.SCREEN_VERTEX_SHADER, u);
                (this || _global).boxcolor = "#00FF00";
              } catch (t) {
                GL.Shader.dumpErrorToConsole(t, Shader.SCREEN_VERTEX_SHADER, u);
                (this || _global).boxcolor = "#FF0000";
                (this || _global).has_error = true;
                return;
              }
              (this || _global)._shader = s;
              (this || _global)._shader_code = l + "|" + n;
            }
            if ((this || _global)._shader) {
              var h = this.getInputData(2);
              null != h
                ? ((this || _global).properties.value = h)
                : (h = parseFloat((this || _global).properties.value));
              var p = (this || _global).graph.getTime();
              (this || _global)._tex.drawTo(function () {
                gl.disable(gl.DEPTH_TEST);
                gl.disable(gl.CULL_FACE);
                gl.disable(gl.BLEND);
                t && t.bind(0);
                e && e.bind(1);
                var r = Mesh.getScreenQuad();
                s.uniforms({
                  u_texture: 0,
                  u_textureB: 1,
                  value: h,
                  texSize: [a, o, 1 / a, 1 / o],
                  time: p,
                }).draw(r);
              });
              this.setOutputData(0, (this || _global)._tex);
            }
          }
        } else this.setOutputData(0, t);
    };
    LGraphTextureOperation.pixel_shader =
      "precision highp float;\n\t\t\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_textureB;\n\t\tvarying vec2 v_coord;\n\t\tuniform vec4 texSize;\n\t\tuniform float time;\n\t\tuniform float value;\n\t\t\n\t\tvoid main() {\n\t\t\tvec2 uv = v_coord;\n\t\t\t{{UV_CODE}};\n\t\t\tvec4 color4 = texture2D(u_texture, uv);\n\t\t\tvec3 color = color4.rgb;\n\t\t\tvec4 color4B = texture2D(u_textureB, uv);\n\t\t\tvec3 colorB = color4B.rgb;\n\t\t\tvec3 result = color;\n\t\t\tfloat alpha = 1.0;\n\t\t\t{{PIXEL_CODE}};\n\t\t\tgl_FragColor = vec4(result, alpha);\n\t\t}\n\t\t";
    LGraphTextureOperation.registerPreset = function (t, e) {
      LGraphTextureOperation.presets[t] = e;
    };
    LGraphTextureOperation.registerPreset("", "");
    LGraphTextureOperation.registerPreset("bypass", "color");
    LGraphTextureOperation.registerPreset("add", "color + colorB * value");
    LGraphTextureOperation.registerPreset(
      "substract",
      "(color - colorB) * value"
    );
    LGraphTextureOperation.registerPreset(
      "mate",
      "mix( color, colorB, color4B.a * value)"
    );
    LGraphTextureOperation.registerPreset("invert", "vec3(1.0) - color");
    LGraphTextureOperation.registerPreset("multiply", "color * colorB * value");
    LGraphTextureOperation.registerPreset("divide", "(color / colorB) / value");
    LGraphTextureOperation.registerPreset(
      "difference",
      "abs(color - colorB) * value"
    );
    LGraphTextureOperation.registerPreset("max", "max(color, colorB) * value");
    LGraphTextureOperation.registerPreset("min", "min(color, colorB) * value");
    LGraphTextureOperation.registerPreset(
      "displace",
      "texture2D(u_texture, uv + (colorB.xy - vec2(0.5)) * value).xyz"
    );
    LGraphTextureOperation.registerPreset(
      "grayscale",
      "vec3(color.x + color.y + color.z) * value / 3.0"
    );
    LGraphTextureOperation.registerPreset(
      "saturation",
      "mix( vec3(color.x + color.y + color.z) / 3.0, color, value )"
    );
    LGraphTextureOperation.registerPreset(
      "normalmap",
      "\n\t\tfloat z0 = texture2D(u_texture, uv + vec2(-texSize.z, -texSize.w) ).x;\n\t\tfloat z1 = texture2D(u_texture, uv + vec2(0.0, -texSize.w) ).x;\n\t\tfloat z2 = texture2D(u_texture, uv + vec2(texSize.z, -texSize.w) ).x;\n\t\tfloat z3 = texture2D(u_texture, uv + vec2(-texSize.z, 0.0) ).x;\n\t\tfloat z4 = color.x;\n\t\tfloat z5 = texture2D(u_texture, uv + vec2(texSize.z, 0.0) ).x;\n\t\tfloat z6 = texture2D(u_texture, uv + vec2(-texSize.z, texSize.w) ).x;\n\t\tfloat z7 = texture2D(u_texture, uv + vec2(0.0, texSize.w) ).x;\n\t\tfloat z8 = texture2D(u_texture, uv + vec2(texSize.z, texSize.w) ).x;\n\t\tvec3 normal = vec3( z2 + 2.0*z4 + z7 - z0 - 2.0*z3 - z5, z5 + 2.0*z6 + z7 -z0 - 2.0*z1 - z2, 1.0 );\n\t\tnormal.xy *= value;\n\t\tresult.xyz = normalize(normal) * 0.5 + vec3(0.5);\n\t"
    );
    LGraphTextureOperation.registerPreset(
      "threshold",
      "vec3(color.x > colorB.x * value ? 1.0 : 0.0,color.y > colorB.y * value ? 1.0 : 0.0,color.z > colorB.z * value ? 1.0 : 0.0)"
    );
    LGraphTextureOperation.prototype.onInspect = function (t) {
      var e = this || _global;
      t.addCombo("Presets", "", {
        values: Object.keys(LGraphTextureOperation.presets),
        callback: function (a) {
          var o = LGraphTextureOperation.presets[a];
          if (o) {
            e.setProperty("pixelcode", o);
            e.title = a;
            t.refresh();
          }
        },
      });
    };
    e.registerNodeType("texture/operation", LGraphTextureOperation);
    LGraphTextureShader.title = "Shader";
    LGraphTextureShader.desc = "Texture shader";
    LGraphTextureShader.widgets_info = {
      code: { type: "code", lang: "glsl" },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureShader.prototype.onPropertyChanged = function (t, e) {
      if ("code" == t) {
        var a = this.getShader();
        if (a) {
          var o = a.uniformInfo;
          if ((this || _global).inputs) {
            var r = {};
            for (var l = 0; l < (this || _global).inputs.length; ++l) {
              var n = this.getInputInfo(l);
              if (n)
                if (!o[n.name] || r[n.name]) {
                  this.removeInput(l);
                  l--;
                } else r[n.name] = true;
            }
          }
          for (var l in o) {
            n = a.uniformInfo[l];
            if (null !== n.loc && "time" != l) {
              var s = "number";
              if ((this || _global)._shader.samplers[l]) s = "texture";
              else
                switch (n.size) {
                  case 1:
                    s = "number";
                    break;
                  case 2:
                    s = "vec2";
                    break;
                  case 3:
                    s = "vec3";
                    break;
                  case 4:
                    s = "vec4";
                    break;
                  case 9:
                    s = "mat3";
                    break;
                  case 16:
                    s = "mat4";
                    break;
                  default:
                    continue;
                }
              var u = this.findInputSlot(l);
              if (-1 != u) {
                var h = this.getInputInfo(u);
                if (h) {
                  if (h.type == s) continue;
                  this.removeInput(u, s);
                  this.addInput(l, s);
                } else this.addInput(l, s);
              } else this.addInput(l, s);
            }
          }
        }
      }
    };
    LGraphTextureShader.prototype.getShader = function () {
      if (
        (this || _global)._shader &&
        (this || _global)._shader_code == (this || _global).properties.code
      )
        return (this || _global)._shader;
      (this || _global)._shader_code = (this || _global).properties.code;
      (this || _global)._shader = new GL.Shader(
        Shader.SCREEN_VERTEX_SHADER,
        (this || _global).properties.code
      );
      if (!(this || _global)._shader) {
        (this || _global).boxcolor = "red";
        return null;
      }
      (this || _global).boxcolor = "green";
      return (this || _global)._shader;
    };
    LGraphTextureShader.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getShader();
        if (t) {
          var e = 0;
          var a = null;
          if ((this || _global).inputs)
            for (var o = 0; o < (this || _global).inputs.length; ++o) {
              var r = this.getInputInfo(o);
              var l = this.getInputData(o);
              if (null != l) {
                if (l.constructor === GL.Texture) {
                  l.bind(e);
                  a || (a = l);
                  l = e;
                  e++;
                }
                t.setUniform(r.name, l);
              }
            }
          var n = (this || _global)._uniforms;
          var s = LGraphTexture.getTextureType(
            (this || _global).properties.precision,
            a
          );
          var u = 0 | (this || _global).properties.width;
          var h = 0 | (this || _global).properties.height;
          0 == u && (u = a ? a.width : gl.canvas.width);
          0 == h && (h = a ? a.height : gl.canvas.height);
          n.texSize[0] = u;
          n.texSize[1] = h;
          n.texSize[2] = 1 / u;
          n.texSize[3] = 1 / h;
          n.time = (this || _global).graph.getTime();
          n.u_value = (this || _global).properties.u_value;
          n.u_color.set((this || _global).properties.u_color);
          ((this || _global)._tex &&
            (this || _global)._tex.type == s &&
            (this || _global)._tex.width == u &&
            (this || _global)._tex.height == h) ||
            ((this || _global)._tex = new GL.Texture(u, h, {
              type: s,
              format: gl.RGBA,
              filter: gl.LINEAR,
            }));
          var p = (this || _global)._tex;
          p.drawTo(function () {
            t.uniforms(n).draw(GL.Mesh.getScreenQuad());
          });
          this.setOutputData(0, (this || _global)._tex);
        }
      }
    };
    LGraphTextureShader.pixel_shader =
      "precision highp float;\n\nvarying vec2 v_coord;\nuniform float time; //time in seconds\nuniform vec4 texSize; //tex resolution\nuniform float u_value;\nuniform vec4 u_color;\n\nvoid main() {\n\tvec2 uv = v_coord;\n\tvec3 color = vec3(0.0);\n\t//your code here\n\tcolor.xy=uv;\n\n\tgl_FragColor = vec4(color, 1.0);\n}\n";
    e.registerNodeType("texture/shader", LGraphTextureShader);
    LGraphTextureScaleOffset.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureScaleOffset.title = "Scale/Offset";
    LGraphTextureScaleOffset.desc = "Applies an scaling and offseting";
    LGraphTextureScaleOffset.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (this.isOutputConnected(0) && t)
        if (
          (this || _global).properties.precision !== LGraphTexture.PASS_THROUGH
        ) {
          var e = t.width;
          var a = t.height;
          var o =
            (this || _global).precision === LGraphTexture.LOW
              ? gl.UNSIGNED_BYTE
              : gl.HIGH_PRECISION_FORMAT;
          (this || _global).precision === LGraphTexture.DEFAULT && (o = t.type);
          ((this || _global)._tex &&
            (this || _global)._tex.width == e &&
            (this || _global)._tex.height == a &&
            (this || _global)._tex.type == o) ||
            ((this || _global)._tex = new GL.Texture(e, a, {
              type: o,
              format: gl.RGBA,
              filter: gl.LINEAR,
            }));
          var r = (this || _global)._shader;
          r ||
            (r = new GL.Shader(
              GL.Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureScaleOffset.pixel_shader
            ));
          var l = this.getInputData(1);
          if (l) {
            (this || _global).properties.scale[0] = l[0];
            (this || _global).properties.scale[1] = l[1];
          } else l = (this || _global).properties.scale;
          var n = this.getInputData(2);
          if (n) {
            (this || _global).properties.offset[0] = n[0];
            (this || _global).properties.offset[1] = n[1];
          } else n = (this || _global).properties.offset;
          (this || _global)._tex.drawTo(function () {
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            t.bind(0);
            var e = Mesh.getScreenQuad();
            r.uniforms({ u_texture: 0, u_scale: l, u_offset: n }).draw(e);
          });
          this.setOutputData(0, (this || _global)._tex);
        } else this.setOutputData(0, t);
    };
    LGraphTextureScaleOffset.pixel_shader =
      "precision highp float;\n\t\t\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_textureB;\n\t\tvarying vec2 v_coord;\n\t\tuniform vec2 u_scale;\n\t\tuniform vec2 u_offset;\n\t\t\n\t\tvoid main() {\n\t\t\tvec2 uv = v_coord;\n\t\t\tuv = uv / u_scale - u_offset;\n\t\t\tgl_FragColor = texture2D(u_texture, uv);\n\t\t}\n\t\t";
    e.registerNodeType("texture/scaleOffset", LGraphTextureScaleOffset);
    LGraphTextureWarp.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureWarp.title = "Warp";
    LGraphTextureWarp.desc = "Texture warp operation";
    LGraphTextureWarp.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (this.isOutputConnected(0))
        if (
          (this || _global).properties.precision !== LGraphTexture.PASS_THROUGH
        ) {
          var e = this.getInputData(1);
          var a = 512;
          var o = 512;
          gl.UNSIGNED_BYTE;
          if (t) {
            a = t.width;
            o = t.height;
            t.type;
          } else if (e) {
            a = e.width;
            o = e.height;
            e.type;
          }
          t || (this || _global)._tex
            ? ((this || _global)._tex = LGraphTexture.getTargetTexture(
                t || (this || _global)._tex,
                (this || _global)._tex,
                (this || _global).properties.precision
              ))
            : ((this || _global)._tex = new GL.Texture(a, o, {
                type:
                  (this || _global).precision === LGraphTexture.LOW
                    ? gl.UNSIGNED_BYTE
                    : gl.HIGH_PRECISION_FORMAT,
                format: gl.RGBA,
                filter: gl.LINEAR,
              }));
          var r = (this || _global)._shader;
          r ||
            (r = new GL.Shader(
              GL.Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureWarp.pixel_shader
            ));
          var l = this.getInputData(2);
          null != l
            ? ((this || _global).properties.factor = l)
            : (l = parseFloat((this || _global).properties.factor));
          var n = (this || _global)._uniforms;
          n.u_factor = l;
          n.u_scale.set((this || _global).properties.scale);
          n.u_offset.set((this || _global).properties.offset);
          (this || _global)._tex.drawTo(function () {
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            t && t.bind(0);
            e && e.bind(1);
            var a = Mesh.getScreenQuad();
            r.uniforms(n).draw(a);
          });
          this.setOutputData(0, (this || _global)._tex);
        } else this.setOutputData(0, t);
    };
    LGraphTextureWarp.pixel_shader =
      "precision highp float;\n\t\t\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_textureB;\n\t\tvarying vec2 v_coord;\n\t\tuniform float u_factor;\n\t\tuniform vec2 u_scale;\n\t\tuniform vec2 u_offset;\n\t\t\n\t\tvoid main() {\n\t\t\tvec2 uv = v_coord;\n\t\t\tuv += ( texture2D(u_textureB, uv).rg - vec2(0.5)) * u_factor * u_scale + u_offset;\n\t\t\tgl_FragColor = texture2D(u_texture, uv);\n\t\t}\n\t\t";
    e.registerNodeType("texture/warp", LGraphTextureWarp);
    LGraphTextureToViewport.title = "to Viewport";
    LGraphTextureToViewport.desc = "Texture to viewport";
    LGraphTextureToViewport._prev_viewport = new Float32Array(4);
    LGraphTextureToViewport.prototype.onDrawBackground = function (t) {
      if (
        !((this || _global).flags.collapsed || (this || _global).size[1] <= 40)
      ) {
        var e = this.getInputData(0);
        e &&
          t.drawImage(
            t == gl ? e : gl.canvas,
            10,
            30,
            (this || _global).size[0] - 20,
            (this || _global).size[1] - 40
          );
      }
    };
    LGraphTextureToViewport.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t) {
        if ((this || _global).properties.disable_alpha) gl.disable(gl.BLEND);
        else {
          gl.enable(gl.BLEND);
          (this || _global).properties.additive
            ? gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
            : gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        gl.disable(gl.DEPTH_TEST);
        var e = (this || _global).properties.gamma || 1;
        this.isInputConnected(1) && (e = this.getInputData(1));
        t.setParameter(
          gl.TEXTURE_MAG_FILTER,
          (this || _global).properties.filter ? gl.LINEAR : gl.NEAREST
        );
        var a = LGraphTextureToViewport._prev_viewport;
        a.set(gl.viewport_data);
        var o = (this || _global).properties.viewport;
        gl.viewport(
          a[0] + a[2] * o[0],
          a[1] + a[3] * o[1],
          a[2] * o[2],
          a[3] * o[3]
        );
        gl.getViewport();
        if ((this || _global).properties.antialiasing) {
          LGraphTextureToViewport._shader ||
            (LGraphTextureToViewport._shader = new GL.Shader(
              GL.Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureToViewport.aa_pixel_shader
            ));
          var r = Mesh.getScreenQuad();
          t.bind(0);
          LGraphTextureToViewport._shader
            .uniforms({
              u_texture: 0,
              uViewportSize: [t.width, t.height],
              u_igamma: 1 / e,
              inverseVP: [1 / t.width, 1 / t.height],
            })
            .draw(r);
        } else if (1 != e) {
          LGraphTextureToViewport._gamma_shader ||
            (LGraphTextureToViewport._gamma_shader = new GL.Shader(
              Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureToViewport.gamma_pixel_shader
            ));
          t.toViewport(LGraphTextureToViewport._gamma_shader, {
            u_texture: 0,
            u_igamma: 1 / e,
          });
        } else t.toViewport();
        gl.viewport(a[0], a[1], a[2], a[3]);
      }
    };
    LGraphTextureToViewport.prototype.onGetInputs = function () {
      return [["gamma", "number"]];
    };
    LGraphTextureToViewport.aa_pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform vec2 uViewportSize;\n\t\tuniform vec2 inverseVP;\n\t\tuniform float u_igamma;\n\t\t#define FXAA_REDUCE_MIN   (1.0/ 128.0)\n\t\t#define FXAA_REDUCE_MUL   (1.0 / 8.0)\n\t\t#define FXAA_SPAN_MAX     8.0\n\t\t\n\t\t/* from mitsuhiko/webgl-meincraft based on the code on geeks3d.com */\n\t\tvec4 applyFXAA(sampler2D tex, vec2 fragCoord)\n\t\t{\n\t\t\tvec4 color = vec4(0.0);\n\t\t\t/*vec2 inverseVP = vec2(1.0 / uViewportSize.x, 1.0 / uViewportSize.y);*/\n\t\t\tvec3 rgbNW = texture2D(tex, (fragCoord + vec2(-1.0, -1.0)) * inverseVP).xyz;\n\t\t\tvec3 rgbNE = texture2D(tex, (fragCoord + vec2(1.0, -1.0)) * inverseVP).xyz;\n\t\t\tvec3 rgbSW = texture2D(tex, (fragCoord + vec2(-1.0, 1.0)) * inverseVP).xyz;\n\t\t\tvec3 rgbSE = texture2D(tex, (fragCoord + vec2(1.0, 1.0)) * inverseVP).xyz;\n\t\t\tvec3 rgbM  = texture2D(tex, fragCoord  * inverseVP).xyz;\n\t\t\tvec3 luma = vec3(0.299, 0.587, 0.114);\n\t\t\tfloat lumaNW = dot(rgbNW, luma);\n\t\t\tfloat lumaNE = dot(rgbNE, luma);\n\t\t\tfloat lumaSW = dot(rgbSW, luma);\n\t\t\tfloat lumaSE = dot(rgbSE, luma);\n\t\t\tfloat lumaM  = dot(rgbM,  luma);\n\t\t\tfloat lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n\t\t\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\t\t\t\n\t\t\tvec2 dir;\n\t\t\tdir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n\t\t\tdir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\t\t\t\n\t\t\tfloat dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\t\t\t\n\t\t\tfloat rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n\t\t\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * inverseVP;\n\t\t\t\n\t\t\tvec3 rgbA = 0.5 * (texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz + \n\t\t\t\ttexture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n\t\t\tvec3 rgbB = rgbA * 0.5 + 0.25 * (texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz + \n\t\t\t\ttexture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n\t\t\t\n\t\t\t//return vec4(rgbA,1.0);\n\t\t\tfloat lumaB = dot(rgbB, luma);\n\t\t\tif ((lumaB < lumaMin) || (lumaB > lumaMax))\n\t\t\t\tcolor = vec4(rgbA, 1.0);\n\t\t\telse\n\t\t\t\tcolor = vec4(rgbB, 1.0);\n\t\t\tif(u_igamma != 1.0)\n\t\t\t\tcolor.xyz = pow( color.xyz, vec3(u_igamma) );\n\t\t\treturn color;\n\t\t}\n\t\t\n\t\tvoid main() {\n\t\t   gl_FragColor = applyFXAA( u_texture, v_coord * uViewportSize) ;\n\t\t}\n\t\t";
    LGraphTextureToViewport.gamma_pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform float u_igamma;\n\t\tvoid main() {\n\t\t\tvec4 color = texture2D( u_texture, v_coord);\n\t\t\tcolor.xyz = pow(color.xyz, vec3(u_igamma) );\n\t\t   gl_FragColor = color;\n\t\t}\n\t\t";
    e.registerNodeType("texture/toviewport", LGraphTextureToViewport);
    LGraphTextureCopy.title = "Copy";
    LGraphTextureCopy.desc = "Copy Texture";
    LGraphTextureCopy.widgets_info = {
      size: { widget: "combo", values: [0, 32, 64, 128, 256, 512, 1024, 2048] },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureCopy.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if ((t || (this || _global)._temp_texture) && this.isOutputConnected(0)) {
        if (t) {
          var e = t.width;
          var a = t.height;
          if (0 != (this || _global).properties.size) {
            e = (this || _global).properties.size;
            a = (this || _global).properties.size;
          }
          var o = (this || _global)._temp_texture;
          var r = t.type;
          (this || _global).properties.precision === LGraphTexture.LOW
            ? (r = gl.UNSIGNED_BYTE)
            : (this || _global).properties.precision === LGraphTexture.HIGH &&
              (r = gl.HIGH_PRECISION_FORMAT);
          if (!o || o.width != e || o.height != a || o.type != r) {
            var l = gl.LINEAR;
            (this || _global).properties.generate_mipmaps &&
              isPowerOfTwo(e) &&
              isPowerOfTwo(a) &&
              (l = gl.LINEAR_MIPMAP_LINEAR);
            (this || _global)._temp_texture = new GL.Texture(e, a, {
              type: r,
              format: gl.RGBA,
              minFilter: l,
              magFilter: gl.LINEAR,
            });
          }
          t.copyTo((this || _global)._temp_texture);
          if ((this || _global).properties.generate_mipmaps) {
            (this || _global)._temp_texture.bind(0);
            gl.generateMipmap((this || _global)._temp_texture.texture_type);
            (this || _global)._temp_texture.unbind(0);
          }
        }
        this.setOutputData(0, (this || _global)._temp_texture);
      }
    };
    e.registerNodeType("texture/copy", LGraphTextureCopy);
    LGraphTextureDownsample.title = "Downsample";
    LGraphTextureDownsample.desc = "Downsample Texture";
    LGraphTextureDownsample.widgets_info = {
      iterations: { type: "number", step: 1, precision: 0, min: 0 },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureDownsample.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (
        (t || (this || _global)._temp_texture) &&
        this.isOutputConnected(0) &&
        t &&
        t.texture_type === GL.TEXTURE_2D
      )
        if ((this || _global).properties.iterations < 1)
          this.setOutputData(0, t);
        else {
          var e = LGraphTextureDownsample._shader;
          e ||
            (LGraphTextureDownsample._shader = e =
              new GL.Shader(
                GL.Shader.SCREEN_VERTEX_SHADER,
                LGraphTextureDownsample.pixel_shader
              ));
          var a = 0 | t.width;
          var o = 0 | t.height;
          var r = t.type;
          (this || _global).properties.precision === LGraphTexture.LOW
            ? (r = gl.UNSIGNED_BYTE)
            : (this || _global).properties.precision === LGraphTexture.HIGH &&
              (r = gl.HIGH_PRECISION_FORMAT);
          var l = (this || _global).properties.iterations || 1;
          var n = t;
          var s = null;
          var u = [];
          var h = { type: r, format: t.format };
          var p = vec2.create();
          var _ = { u_offset: p };
          (this || _global)._texture &&
            GL.Texture.releaseTemporary((this || _global)._texture);
          for (var g = 0; g < l; ++g) {
            p[0] = 1 / a;
            p[1] = 1 / o;
            a = a >> 1 || 0;
            o = o >> 1 || 0;
            s = GL.Texture.getTemporary(a, o, h);
            u.push(s);
            n.setParameter(GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            n.copyTo(s, e, _);
            if (1 == a && 1 == o) break;
            n = s;
          }
          (this || _global)._texture = u.pop();
          for (g = 0; g < u.length; ++g) GL.Texture.releaseTemporary(u[g]);
          if ((this || _global).properties.generate_mipmaps) {
            (this || _global)._texture.bind(0);
            gl.generateMipmap((this || _global)._texture.texture_type);
            (this || _global)._texture.unbind(0);
          }
          this.setOutputData(0, (this || _global)._texture);
        }
    };
    LGraphTextureDownsample.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tuniform sampler2D u_texture;\n\t\tuniform vec2 u_offset;\n\t\tvarying vec2 v_coord;\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 color = texture2D(u_texture, v_coord );\n\t\t\tcolor += texture2D(u_texture, v_coord + vec2( u_offset.x, 0.0 ) );\n\t\t\tcolor += texture2D(u_texture, v_coord + vec2( 0.0, u_offset.y ) );\n\t\t\tcolor += texture2D(u_texture, v_coord + vec2( u_offset.x, u_offset.y ) );\n\t\t   gl_FragColor = color * 0.25;\n\t\t}\n\t\t";
    e.registerNodeType("texture/downsample", LGraphTextureDownsample);
    LGraphTextureResize.title = "Resize";
    LGraphTextureResize.desc = "Resize Texture";
    LGraphTextureResize.widgets_info = {
      iterations: { type: "number", step: 1, precision: 0, min: 0 },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureResize.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (
        (t || (this || _global)._temp_texture) &&
        this.isOutputConnected(0) &&
        t &&
        t.texture_type === GL.TEXTURE_2D
      ) {
        var e = 0 | (this || _global).properties.size[0];
        var a = 0 | (this || _global).properties.size[1];
        0 == e && (e = t.width);
        0 == a && (a = t.height);
        var o = t.type;
        (this || _global).properties.precision === LGraphTexture.LOW
          ? (o = gl.UNSIGNED_BYTE)
          : (this || _global).properties.precision === LGraphTexture.HIGH &&
            (o = gl.HIGH_PRECISION_FORMAT);
        ((this || _global)._texture &&
          (this || _global)._texture.width == e &&
          (this || _global)._texture.height == a &&
          (this || _global)._texture.type == o) ||
          ((this || _global)._texture = new GL.Texture(e, a, { type: o }));
        t.copyTo((this || _global)._texture);
        if ((this || _global).properties.generate_mipmaps) {
          (this || _global)._texture.bind(0);
          gl.generateMipmap((this || _global)._texture.texture_type);
          (this || _global)._texture.unbind(0);
        }
        this.setOutputData(0, (this || _global)._texture);
      }
    };
    e.registerNodeType("texture/resize", LGraphTextureResize);
    LGraphTextureAverage.title = "Average";
    LGraphTextureAverage.desc =
      "Compute a partial average (32 random samples) of a texture and stores it as a 1x1 pixel texture.\n If high_quality is true, then it generates the mipmaps first and reads from the lower one.";
    LGraphTextureAverage.prototype.onExecute = function () {
      (this || _global).properties.use_previous_frame || this.updateAverage();
      var t = (this || _global)._luminance;
      this.setOutputData(0, (this || _global)._temp_texture);
      this.setOutputData(1, t);
      this.setOutputData(2, (t[0] + t[1] + t[2]) / 3);
    };
    LGraphTextureAverage.prototype.onPreRenderExecute = function () {
      this.updateAverage();
    };
    LGraphTextureAverage.prototype.updateAverage = function () {
      var t = this.getInputData(0);
      if (
        t &&
        (this.isOutputConnected(0) ||
          this.isOutputConnected(1) ||
          this.isOutputConnected(2))
      ) {
        if (!LGraphTextureAverage._shader) {
          LGraphTextureAverage._shader = new GL.Shader(
            GL.Shader.SCREEN_VERTEX_SHADER,
            LGraphTextureAverage.pixel_shader
          );
          var e = new Float32Array(16);
          for (var a = 0; a < e.length; ++a) e[a] = Math.random();
          LGraphTextureAverage._shader.uniforms({
            u_samples_a: e.subarray(0, 16),
            u_samples_b: e.subarray(16, 32),
          });
        }
        var o = (this || _global)._temp_texture;
        var r = gl.UNSIGNED_BYTE;
        t.type != r && (r = gl.FLOAT);
        (o && o.type == r) ||
          ((this || _global)._temp_texture = new GL.Texture(1, 1, {
            type: r,
            format: gl.RGBA,
            filter: gl.NEAREST,
          }));
        (this || _global)._uniforms.u_mipmap_offset = 0;
        if ((this || _global).properties.high_quality) {
          ((this || _global)._temp_pot2_texture &&
            (this || _global)._temp_pot2_texture.type == r) ||
            ((this || _global)._temp_pot2_texture = new GL.Texture(512, 512, {
              type: r,
              format: gl.RGBA,
              minFilter: gl.LINEAR_MIPMAP_LINEAR,
              magFilter: gl.LINEAR,
            }));
          t.copyTo((this || _global)._temp_pot2_texture);
          t = (this || _global)._temp_pot2_texture;
          t.bind(0);
          gl.generateMipmap(GL.TEXTURE_2D);
          (this || _global)._uniforms.u_mipmap_offset = 9;
        }
        var l = LGraphTextureAverage._shader;
        var n = (this || _global)._uniforms;
        n.u_mipmap_offset = (this || _global).properties.mipmap_offset;
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        (this || _global)._temp_texture.drawTo(function () {
          t.toViewport(l, n);
        });
        if (this.isOutputConnected(1) || this.isOutputConnected(2)) {
          var s = (this || _global)._temp_texture.getPixels();
          if (s) {
            var u = (this || _global)._luminance;
            r = (this || _global)._temp_texture.type;
            u.set(s);
            r == gl.UNSIGNED_BYTE
              ? vec4.scale(u, u, 1 / 255)
              : r == GL.HALF_FLOAT || r == GL.HALF_FLOAT_OES;
          }
        }
      }
    };
    LGraphTextureAverage.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tuniform mat4 u_samples_a;\n\t\tuniform mat4 u_samples_b;\n\t\tuniform sampler2D u_texture;\n\t\tuniform float u_mipmap_offset;\n\t\tvarying vec2 v_coord;\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 color = vec4(0.0);\n\t\t\t//random average\n\t\t\tfor(int i = 0; i < 4; ++i)\n\t\t\t\tfor(int j = 0; j < 4; ++j)\n\t\t\t\t{\n\t\t\t\t\tcolor += texture2D(u_texture, vec2( u_samples_a[i][j], u_samples_b[i][j] ), u_mipmap_offset );\n\t\t\t\t\tcolor += texture2D(u_texture, vec2( 1.0 - u_samples_a[i][j], 1.0 - u_samples_b[i][j] ), u_mipmap_offset );\n\t\t\t\t}\n\t\t   gl_FragColor = color * 0.03125;\n\t\t}\n\t\t";
    e.registerNodeType("texture/average", LGraphTextureAverage);
    LGraphTextureMinMax.widgets_info = {
      mode: { widget: "combo", values: ["min", "max", "avg"] },
    };
    LGraphTextureMinMax.title = "MinMax";
    LGraphTextureMinMax.desc = "Compute the scene min max";
    LGraphTextureMinMax.prototype.onExecute = function () {
      (this || _global).properties.use_previous_frame || this.update();
      this.setOutputData(0, (this || _global)._temp_texture);
      this.setOutputData(1, (this || _global)._luminance);
    };
    LGraphTextureMinMax.prototype.onPreRenderExecute = function () {
      this.update();
    };
    LGraphTextureMinMax.prototype.update = function () {
      var t = this.getInputData(0);
      if (t && (this.isOutputConnected(0) || this.isOutputConnected(1))) {
        LGraphTextureMinMax._shader ||
          (LGraphTextureMinMax._shader = new GL.Shader(
            GL.Shader.SCREEN_VERTEX_SHADER,
            LGraphTextureMinMax.pixel_shader
          ));
        (this || _global)._temp_texture;
        var e = gl.UNSIGNED_BYTE;
        t.type != e && (e = gl.FLOAT);
        var a = 512;
        if (
          !(this || _global)._textures_chain.length ||
          (this || _global)._textures_chain[0].type != e
        ) {
          while (o) {
            (this || _global)._textures_chain[o] = new GL.Texture(a, a, {
              type: e,
              format: gl.RGBA,
              filter: gl.NEAREST,
            });
            a >>= 2;
            o++;
            if (1 == a) break;
          }
        }
        t.copyTo((this || _global)._textures_chain[0]);
        (this || _global)._textures_chain[0];
        for (var o = 1; o <= (this || _global)._textures_chain.length; ++o) {
          t = (this || _global)._textures_chain[o];
          t;
        }
        var r = LGraphTextureMinMax._shader;
        var l = (this || _global)._uniforms;
        l.u_mipmap_offset = (this || _global).properties.mipmap_offset;
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        (this || _global)._temp_texture.drawTo(function () {
          t.toViewport(r, l);
        });
      }
    };
    LGraphTextureMinMax.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tuniform mat4 u_samples_a;\n\t\tuniform mat4 u_samples_b;\n\t\tuniform sampler2D u_texture;\n\t\tuniform float u_mipmap_offset;\n\t\tvarying vec2 v_coord;\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 color = vec4(0.0);\n\t\t\t//random average\n\t\t\tfor(int i = 0; i < 4; ++i)\n\t\t\t\tfor(int j = 0; j < 4; ++j)\n\t\t\t\t{\n\t\t\t\t\tcolor += texture2D(u_texture, vec2( u_samples_a[i][j], u_samples_b[i][j] ), u_mipmap_offset );\n\t\t\t\t\tcolor += texture2D(u_texture, vec2( 1.0 - u_samples_a[i][j], 1.0 - u_samples_b[i][j] ), u_mipmap_offset );\n\t\t\t\t}\n\t\t   gl_FragColor = color * 0.03125;\n\t\t}\n\t\t";
    LGraphTextureTemporalSmooth.title = "Smooth";
    LGraphTextureTemporalSmooth.desc = "Smooth texture over time";
    LGraphTextureTemporalSmooth.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0)) {
        LGraphTextureTemporalSmooth._shader ||
          (LGraphTextureTemporalSmooth._shader = new GL.Shader(
            GL.Shader.SCREEN_VERTEX_SHADER,
            LGraphTextureTemporalSmooth.pixel_shader
          ));
        var e = (this || _global)._temp_texture;
        if (
          !e ||
          e.type != t.type ||
          e.width != t.width ||
          e.height != t.height
        ) {
          var a = { type: t.type, format: gl.RGBA, filter: gl.NEAREST };
          (this || _global)._temp_texture = new GL.Texture(
            t.width,
            t.height,
            a
          );
          (this || _global)._temp_texture2 = new GL.Texture(
            t.width,
            t.height,
            a
          );
          t.copyTo((this || _global)._temp_texture2);
        }
        var o = (this || _global)._temp_texture;
        var r = (this || _global)._temp_texture2;
        var l = LGraphTextureTemporalSmooth._shader;
        var n = (this || _global)._uniforms;
        n.u_factor = 1 - this.getInputOrProperty("factor");
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        o.drawTo(function () {
          r.bind(1);
          t.toViewport(l, n);
        });
        this.setOutputData(0, o);
        (this || _global)._temp_texture = r;
        (this || _global)._temp_texture2 = o;
      }
    };
    LGraphTextureTemporalSmooth.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_textureB;\n\t\tuniform float u_factor;\n\t\tvarying vec2 v_coord;\n\t\t\n\t\tvoid main() {\n\t\t\tgl_FragColor = mix( texture2D( u_texture, v_coord ), texture2D( u_textureB, v_coord ), u_factor );\n\t\t}\n\t\t";
    e.registerNodeType("texture/temporal_smooth", LGraphTextureTemporalSmooth);
    LGraphTextureLinearAvgSmooth.title = "Lineal Avg Smooth";
    LGraphTextureLinearAvgSmooth.desc = "Smooth texture linearly over time";
    LGraphTextureLinearAvgSmooth["@samples"] = {
      type: "number",
      min: 1,
      max: 64,
      step: 1,
      precision: 1,
    };
    LGraphTextureLinearAvgSmooth.prototype.getPreviewTexture = function () {
      return (this || _global)._temp_texture2;
    };
    LGraphTextureLinearAvgSmooth.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0)) {
        if (!LGraphTextureLinearAvgSmooth._shader) {
          LGraphTextureLinearAvgSmooth._shader_copy = new GL.Shader(
            GL.Shader.SCREEN_VERTEX_SHADER,
            LGraphTextureLinearAvgSmooth.pixel_shader_copy
          );
          LGraphTextureLinearAvgSmooth._shader_avg = new GL.Shader(
            GL.Shader.SCREEN_VERTEX_SHADER,
            LGraphTextureLinearAvgSmooth.pixel_shader_avg
          );
        }
        var e = Math.clamp((this || _global).properties.samples, 0, 64);
        var a = (this || _global).frame;
        var o = (this || _global).properties.frames_interval;
        if (0 == o || a % o == 0) {
          var r = (this || _global)._temp_texture;
          if (!r || r.type != t.type || r.width != e) {
            var l = { type: t.type, format: gl.RGBA, filter: gl.NEAREST };
            (this || _global)._temp_texture = new GL.Texture(e, 1, l);
            (this || _global)._temp_texture2 = new GL.Texture(e, 1, l);
            (this || _global)._temp_texture_out = new GL.Texture(1, 1, l);
          }
          var n = (this || _global)._temp_texture;
          var s = (this || _global)._temp_texture2;
          var u = LGraphTextureLinearAvgSmooth._shader_copy;
          var h = LGraphTextureLinearAvgSmooth._shader_avg;
          var p = (this || _global)._uniforms;
          p.u_samples = e;
          p.u_isamples = 1 / e;
          gl.disable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          n.drawTo(function () {
            s.bind(1);
            t.toViewport(u, p);
          });
          (this || _global)._temp_texture_out.drawTo(function () {
            n.toViewport(h, p);
          });
          this.setOutputData(0, (this || _global)._temp_texture_out);
          (this || _global)._temp_texture = s;
          (this || _global)._temp_texture2 = n;
        } else this.setOutputData(0, (this || _global)._temp_texture_out);
        this.setOutputData(1, (this || _global)._temp_texture2);
        (this || _global).frame++;
      }
    };
    LGraphTextureLinearAvgSmooth.pixel_shader_copy =
      "precision highp float;\n\t\tprecision highp float;\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_textureB;\n\t\tuniform float u_isamples;\n\t\tvarying vec2 v_coord;\n\t\t\n\t\tvoid main() {\n\t\t\tif( v_coord.x <= u_isamples )\n\t\t\t\tgl_FragColor = texture2D( u_texture, vec2(0.5) );\n\t\t\telse\n\t\t\t\tgl_FragColor = texture2D( u_textureB, v_coord - vec2(u_isamples,0.0) );\n\t\t}\n\t\t";
    LGraphTextureLinearAvgSmooth.pixel_shader_avg =
      "precision highp float;\n\t\tprecision highp float;\n\t\tuniform sampler2D u_texture;\n\t\tuniform int u_samples;\n\t\tuniform float u_isamples;\n\t\tvarying vec2 v_coord;\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 color = vec4(0.0);\n\t\t\tfor(int i = 0; i < 64; ++i)\n\t\t\t{\n\t\t\t\tcolor += texture2D( u_texture, vec2( float(i)*u_isamples,0.0) );\n\t\t\t\tif(i == (u_samples - 1))\n\t\t\t\t\tbreak;\n\t\t\t}\n\t\t\tgl_FragColor = color * u_isamples;\n\t\t}\n\t\t";
    e.registerNodeType(
      "texture/linear_avg_smooth",
      LGraphTextureLinearAvgSmooth
    );
    LGraphImageToTexture.title = "Image to Texture";
    LGraphImageToTexture.desc = "Uploads an image to the GPU";
    LGraphImageToTexture.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t) {
        var e = t.videoWidth || t.width;
        var a = t.videoHeight || t.height;
        if (t.gltexture) this.setOutputData(0, t.gltexture);
        else {
          var o = (this || _global)._temp_texture;
          (o && o.width == e && o.height == a) ||
            ((this || _global)._temp_texture = new GL.Texture(e, a, {
              format: gl.RGBA,
              filter: gl.LINEAR,
            }));
          try {
            (this || _global)._temp_texture.uploadImage(t);
          } catch (t) {
            console.error(
              "image comes from an unsafe location, cannot be uploaded to webgl: " +
                t
            );
            return;
          }
          this.setOutputData(0, (this || _global)._temp_texture);
        }
      }
    };
    e.registerNodeType("texture/imageToTexture", LGraphImageToTexture);
    LGraphTextureLUT.widgets_info = {
      texture: { widget: "texture" },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureLUT.title = "LUT";
    LGraphTextureLUT.desc = "Apply LUT to Texture";
    LGraphTextureLUT.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (
          (this || _global).properties.precision !==
            LGraphTexture.PASS_THROUGH &&
          false !== (this || _global).properties.enabled
        ) {
          if (t) {
            var e = this.getInputData(1);
            e ||
              (e = LGraphTexture.getTexture(
                (this || _global).properties.texture
              ));
            if (e) {
              e.bind(0);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE
              );
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE
              );
              gl.bindTexture(gl.TEXTURE_2D, null);
              var a = (this || _global).properties.intensity;
              this.isInputConnected(2) &&
                ((this || _global).properties.intensity = a =
                  this.getInputData(2));
              (this || _global)._tex = LGraphTexture.getTargetTexture(
                t,
                (this || _global)._tex,
                (this || _global).properties.precision
              );
              (this || _global)._tex.drawTo(function () {
                e.bind(1);
                t.toViewport(LGraphTextureLUT._shader, {
                  u_texture: 0,
                  u_textureB: 1,
                  u_amount: a,
                });
              });
              this.setOutputData(0, (this || _global)._tex);
            } else this.setOutputData(0, t);
          }
        } else this.setOutputData(0, t);
      }
    };
    LGraphTextureLUT.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_textureB;\n\t\tuniform float u_amount;\n\t\t\n\t\tvoid main() {\n\t\t\t lowp vec4 textureColor = clamp( texture2D(u_texture, v_coord), vec4(0.0), vec4(1.0) );\n\t\t\t mediump float blueColor = textureColor.b * 63.0;\n\t\t\t mediump vec2 quad1;\n\t\t\t quad1.y = floor(floor(blueColor) / 8.0);\n\t\t\t quad1.x = floor(blueColor) - (quad1.y * 8.0);\n\t\t\t mediump vec2 quad2;\n\t\t\t quad2.y = floor(ceil(blueColor) / 8.0);\n\t\t\t quad2.x = ceil(blueColor) - (quad2.y * 8.0);\n\t\t\t highp vec2 texPos1;\n\t\t\t texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);\n\t\t\t texPos1.y = 1.0 - ((quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g));\n\t\t\t highp vec2 texPos2;\n\t\t\t texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);\n\t\t\t texPos2.y = 1.0 - ((quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g));\n\t\t\t lowp vec4 newColor1 = texture2D(u_textureB, texPos1);\n\t\t\t lowp vec4 newColor2 = texture2D(u_textureB, texPos2);\n\t\t\t lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));\n\t\t\t gl_FragColor = vec4( mix( textureColor.rgb, newColor.rgb, u_amount), textureColor.w);\n\t\t}\n\t\t";
    e.registerNodeType("texture/LUT", LGraphTextureLUT);
    LGraphTextureEncode.widgets_info = {
      texture: { widget: "texture" },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureEncode.title = "Encode";
    LGraphTextureEncode.desc = "Apply a texture atlas to encode a texture";
    LGraphTextureEncode.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (
          (this || _global).properties.precision !==
            LGraphTexture.PASS_THROUGH &&
          false !== (this || _global).properties.enabled
        ) {
          if (t) {
            var e = this.getInputData(1);
            e ||
              (e = LGraphTexture.getTexture(
                (this || _global).properties.texture
              ));
            if (e) {
              e.bind(0);
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MAG_FILTER,
                (this || _global).properties.filter ? gl.LINEAR : gl.NEAREST
              );
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MIN_FILTER,
                (this || _global).properties.filter ? gl.LINEAR : gl.NEAREST
              );
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE
              );
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE
              );
              gl.bindTexture(gl.TEXTURE_2D, null);
              var a = (this || _global)._uniforms;
              a.u_row_simbols = Math.floor(
                (this || _global).properties.num_row_symbols
              );
              a.u_symbol_size = (this || _global).properties.symbol_size;
              a.u_brightness = (this || _global).properties.brightness;
              a.u_invert = (this || _global).properties.invert ? 1 : 0;
              a.u_colorize = (this || _global).properties.colorize ? 1 : 0;
              (this || _global)._tex = LGraphTexture.getTargetTexture(
                t,
                (this || _global)._tex,
                (this || _global).properties.precision
              );
              a.u_res[0] = (this || _global)._tex.width;
              a.u_res[1] = (this || _global)._tex.height;
              (this || _global)._tex.bind(0);
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MAG_FILTER,
                gl.NEAREST
              );
              gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MIN_FILTER,
                gl.NEAREST
              );
              (this || _global)._tex.drawTo(function () {
                e.bind(1);
                t.toViewport(LGraphTextureEncode._shader, a);
              });
              if ((this || _global).properties.generate_mipmaps) {
                (this || _global)._tex.bind(0);
                gl.generateMipmap((this || _global)._tex.texture_type);
                (this || _global)._tex.unbind(0);
              }
              this.setOutputData(0, (this || _global)._tex);
            } else this.setOutputData(0, t);
          }
        } else this.setOutputData(0, t);
      }
    };
    LGraphTextureEncode.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_textureB;\n\t\tuniform float u_row_simbols;\n\t\tuniform float u_symbol_size;\n\t\tuniform float u_brightness;\n\t\tuniform float u_invert;\n\t\tuniform float u_colorize;\n\t\tuniform vec2 u_res;\n\t\t\n\t\tvoid main() {\n\t\t\tvec2 total_symbols = u_res / u_symbol_size;\n\t\t\tvec2 uv = floor(v_coord * total_symbols) / total_symbols; //pixelate \n\t\t\tvec2 local_uv = mod(v_coord * u_res, u_symbol_size) / u_symbol_size;\n\t\t\tlowp vec4 textureColor = texture2D(u_texture, uv );\n\t\t\tfloat lum = clamp(u_brightness * (textureColor.x + textureColor.y + textureColor.z)/3.0,0.0,1.0);\n\t\t\tif( u_invert == 1.0 ) lum = 1.0 - lum;\n\t\t\tfloat index = floor( lum * (u_row_simbols * u_row_simbols - 1.0));\n\t\t\tfloat col = mod( index, u_row_simbols );\n\t\t\tfloat row = u_row_simbols - floor( index / u_row_simbols ) - 1.0;\n\t\t\tvec2 simbol_uv = ( vec2( col, row ) + local_uv ) / u_row_simbols;\n\t\t\tvec4 color = texture2D( u_textureB, simbol_uv );\n\t\t\tif(u_colorize == 1.0)\n\t\t\t\tcolor *= textureColor;\n\t\t\tgl_FragColor = color;\n\t\t}\n\t\t";
    e.registerNodeType("texture/encode", LGraphTextureEncode);
    LGraphTextureChannels.title = "Texture to Channels";
    LGraphTextureChannels.desc = "Split texture channels";
    LGraphTextureChannels.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t) {
        (this || _global)._channels || ((this || _global)._channels = Array(4));
        var e = gl.RGB;
        var a = 0;
        for (var o = 0; o < 4; o++)
          if (this.isOutputConnected(o)) {
            ((this || _global)._channels[o] &&
              (this || _global)._channels[o].width == t.width &&
              (this || _global)._channels[o].height == t.height &&
              (this || _global)._channels[o].type == t.type &&
              (this || _global)._channels[o].format == e) ||
              ((this || _global)._channels[o] = new GL.Texture(
                t.width,
                t.height,
                { type: t.type, format: e, filter: gl.LINEAR }
              ));
            a++;
          } else (this || _global)._channels[o] = null;
        if (a) {
          gl.disable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          var r = Mesh.getScreenQuad();
          var l = LGraphTextureChannels._shader;
          var n = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ];
          for (o = 0; o < 4; o++)
            if ((this || _global)._channels[o]) {
              (this || _global)._channels[o].drawTo(function () {
                t.bind(0);
                l.uniforms({ u_texture: 0, u_mask: n[o] }).draw(r);
              });
              this.setOutputData(o, (this || _global)._channels[o]);
            }
        }
      }
    };
    LGraphTextureChannels.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform vec4 u_mask;\n\t\t\n\t\tvoid main() {\n\t\t   gl_FragColor = vec4( vec3( length( texture2D(u_texture, v_coord) * u_mask )), 1.0 );\n\t\t}\n\t\t";
    e.registerNodeType("texture/textureChannels", LGraphTextureChannels);
    LGraphChannelsTexture.title = "Channels to Texture";
    LGraphChannelsTexture.desc = "Split texture channels";
    LGraphChannelsTexture.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphChannelsTexture.prototype.onExecute = function () {
      var t = LGraphTexture.getWhiteTexture();
      var e = this.getInputData(0) || t;
      var a = this.getInputData(1) || t;
      var o = this.getInputData(2) || t;
      var r = this.getInputData(3) || t;
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      var l = Mesh.getScreenQuad();
      LGraphChannelsTexture._shader ||
        (LGraphChannelsTexture._shader = new GL.Shader(
          Shader.SCREEN_VERTEX_SHADER,
          LGraphChannelsTexture.pixel_shader
        ));
      var n = LGraphChannelsTexture._shader;
      var s = Math.max(e.width, a.width, o.width, r.width);
      var u = Math.max(e.height, a.height, o.height, r.height);
      var h =
        (this || _global).properties.precision == LGraphTexture.HIGH
          ? LGraphTexture.HIGH_PRECISION_FORMAT
          : gl.UNSIGNED_BYTE;
      ((this || _global)._texture &&
        (this || _global)._texture.width == s &&
        (this || _global)._texture.height == u &&
        (this || _global)._texture.type == h) ||
        ((this || _global)._texture = new GL.Texture(s, u, {
          type: h,
          format: gl.RGBA,
          filter: gl.LINEAR,
        }));
      var p = (this || _global)._color;
      p[0] = (this || _global).properties.R;
      p[1] = (this || _global).properties.G;
      p[2] = (this || _global).properties.B;
      p[3] = (this || _global).properties.A;
      var _ = (this || _global)._uniforms;
      (this || _global)._texture.drawTo(function () {
        e.bind(0);
        a.bind(1);
        o.bind(2);
        r.bind(3);
        n.uniforms(_).draw(l);
      });
      this.setOutputData(0, (this || _global)._texture);
    };
    LGraphChannelsTexture.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_textureR;\n\t\tuniform sampler2D u_textureG;\n\t\tuniform sampler2D u_textureB;\n\t\tuniform sampler2D u_textureA;\n\t\tuniform vec4 u_color;\n\t\t\n\t\tvoid main() {\n\t\t   gl_FragColor = u_color * vec4( \t\t\t\t\ttexture2D(u_textureR, v_coord).r,\t\t\t\t\ttexture2D(u_textureG, v_coord).r,\t\t\t\t\ttexture2D(u_textureB, v_coord).r,\t\t\t\t\ttexture2D(u_textureA, v_coord).r);\n\t\t}\n\t\t";
    e.registerNodeType("texture/channelsTexture", LGraphChannelsTexture);
    LGraphTextureColor.title = "Color";
    LGraphTextureColor.desc = "Generates a 1x1 texture with a constant color";
    LGraphTextureColor.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureColor.prototype.onDrawBackground = function (t) {
      var e = (this || _global).properties.color;
      t.fillStyle =
        "rgb(" +
        Math.floor(255 * Math.clamp(e[0], 0, 1)) +
        "," +
        Math.floor(255 * Math.clamp(e[1], 0, 1)) +
        "," +
        Math.floor(255 * Math.clamp(e[2], 0, 1)) +
        ")";
      (this || _global).flags.collapsed
        ? ((this || _global).boxcolor = t.fillStyle)
        : t.fillRect(
            0,
            0,
            (this || _global).size[0],
            (this || _global).size[1]
          );
    };
    LGraphTextureColor.prototype.onExecute = function () {
      var t =
        (this || _global).properties.precision == LGraphTexture.HIGH
          ? LGraphTexture.HIGH_PRECISION_FORMAT
          : gl.UNSIGNED_BYTE;
      ((this || _global)._tex && (this || _global)._tex.type == t) ||
        ((this || _global)._tex = new GL.Texture(1, 1, {
          format: gl.RGBA,
          type: t,
          minFilter: gl.NEAREST,
        }));
      var e = (this || _global).properties.color;
      if ((this || _global).inputs)
        for (var a = 0; a < (this || _global).inputs.length; a++) {
          var o = (this || _global).inputs[a];
          var r = this.getInputData(a);
          if (void 0 !== r)
            switch (o.name) {
              case "RGB":
              case "RGBA":
                e.set(r);
                break;
              case "R":
                e[0] = r;
                break;
              case "G":
                e[1] = r;
                break;
              case "B":
                e[2] = r;
                break;
              case "A":
                e[3] = r;
                break;
            }
        }
      if (vec4.sqrDist((this || _global)._tex_color, e) > 0.001) {
        (this || _global)._tex_color.set(e);
        (this || _global)._tex.fill(e);
      }
      this.setOutputData(0, (this || _global)._tex);
    };
    LGraphTextureColor.prototype.onGetInputs = function () {
      return [
        ["RGB", "vec3"],
        ["RGBA", "vec4"],
        ["R", "number"],
        ["G", "number"],
        ["B", "number"],
        ["A", "number"],
      ];
    };
    e.registerNodeType("texture/color", LGraphTextureColor);
    LGraphTextureGradient.title = "Gradient";
    LGraphTextureGradient.desc = "Generates a gradient";
    LGraphTextureGradient["@A"] = { type: "color" };
    LGraphTextureGradient["@B"] = { type: "color" };
    LGraphTextureGradient["@texture_size"] = {
      type: "enum",
      values: [32, 64, 128, 256, 512],
    };
    LGraphTextureGradient.prototype.onExecute = function () {
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      var t = GL.Mesh.getScreenQuad();
      var e = LGraphTextureGradient._shader;
      var a = this.getInputData(0);
      a || (a = (this || _global).properties.A);
      var o = this.getInputData(1);
      o || (o = (this || _global).properties.B);
      for (var r = 2; r < (this || _global).inputs.length; r++) {
        var l = (this || _global).inputs[r];
        var n = this.getInputData(r);
        void 0 !== n && ((this || _global).properties[l.name] = n);
      }
      var s = (this || _global)._uniforms;
      (this || _global)._uniforms.u_angle =
        (this || _global).properties.angle * DEG2RAD;
      (this || _global)._uniforms.u_scale = (this || _global).properties.scale;
      vec3.copy(s.u_colorA, a);
      vec3.copy(s.u_colorB, o);
      var u = parseInt((this || _global).properties.texture_size);
      ((this || _global)._tex && (this || _global)._tex.width == u) ||
        ((this || _global)._tex = new GL.Texture(u, u, {
          format: gl.RGB,
          filter: gl.LINEAR,
        }));
      (this || _global)._tex.drawTo(function () {
        e.uniforms(s).draw(t);
      });
      this.setOutputData(0, (this || _global)._tex);
    };
    LGraphTextureGradient.prototype.onGetInputs = function () {
      return [
        ["angle", "number"],
        ["scale", "number"],
      ];
    };
    LGraphTextureGradient.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform float u_angle;\n\t\tuniform float u_scale;\n\t\tuniform vec3 u_colorA;\n\t\tuniform vec3 u_colorB;\n\t\t\n\t\tvec2 rotate(vec2 v, float angle)\n\t\t{\n\t\t\tvec2 result;\n\t\t\tfloat _cos = cos(angle);\n\t\t\tfloat _sin = sin(angle);\n\t\t\tresult.x = v.x * _cos - v.y * _sin;\n\t\t\tresult.y = v.x * _sin + v.y * _cos;\n\t\t\treturn result;\n\t\t}\n\t\tvoid main() {\n\t\t\tfloat f = (rotate(u_scale * (v_coord - vec2(0.5)), u_angle) + vec2(0.5)).x;\n\t\t\tvec3 color = mix(u_colorA,u_colorB,clamp(f,0.0,1.0));\n\t\t   gl_FragColor = vec4(color,1.0);\n\t\t}\n\t\t";
    e.registerNodeType("texture/gradient", LGraphTextureGradient);
    LGraphTextureMix.title = "Mix";
    LGraphTextureMix.desc = "Generates a texture mixing two textures";
    LGraphTextureMix.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureMix.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (this.isOutputConnected(0))
        if (
          (this || _global).properties.precision !== LGraphTexture.PASS_THROUGH
        ) {
          var e = this.getInputData(1);
          if (t && e) {
            var a = this.getInputData(2);
            var o = this.getInputData(3);
            (this || _global)._tex = LGraphTexture.getTargetTexture(
              (this || _global).properties.size_from_biggest &&
                e.width > t.width
                ? e
                : t,
              (this || _global)._tex,
              (this || _global).properties.precision
            );
            gl.disable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
            var r = Mesh.getScreenQuad();
            var l = null;
            var n = (this || _global)._uniforms;
            if (a) {
              l = LGraphTextureMix._shader_tex;
              l ||
                (l = LGraphTextureMix._shader_tex =
                  new GL.Shader(
                    Shader.SCREEN_VERTEX_SHADER,
                    LGraphTextureMix.pixel_shader,
                    { MIX_TEX: "" }
                  ));
            } else {
              l = LGraphTextureMix._shader_factor;
              l ||
                (l = LGraphTextureMix._shader_factor =
                  new GL.Shader(
                    Shader.SCREEN_VERTEX_SHADER,
                    LGraphTextureMix.pixel_shader
                  ));
              var s = null == o ? (this || _global).properties.factor : o;
              n.u_mix.set([s, s, s, s]);
            }
            var u = (this || _global).properties.invert;
            (this || _global)._tex.drawTo(function () {
              t.bind(u ? 1 : 0);
              e.bind(u ? 0 : 1);
              a && a.bind(2);
              l.uniforms(n).draw(r);
            });
            this.setOutputData(0, (this || _global)._tex);
          }
        } else this.setOutputData(0, t);
    };
    LGraphTextureMix.prototype.onGetInputs = function () {
      return [["factor", "number"]];
    };
    LGraphTextureMix.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_textureA;\n\t\tuniform sampler2D u_textureB;\n\t\t#ifdef MIX_TEX\n\t\t\tuniform sampler2D u_textureMix;\n\t\t#else\n\t\t\tuniform vec4 u_mix;\n\t\t#endif\n\t\t\n\t\tvoid main() {\n\t\t\t#ifdef MIX_TEX\n\t\t\t   vec4 f = texture2D(u_textureMix, v_coord);\n\t\t\t#else\n\t\t\t   vec4 f = u_mix;\n\t\t\t#endif\n\t\t   gl_FragColor = mix( texture2D(u_textureA, v_coord), texture2D(u_textureB, v_coord), f );\n\t\t}\n\t\t";
    e.registerNodeType("texture/mix", LGraphTextureMix);
    LGraphTextureEdges.title = "Edges";
    LGraphTextureEdges.desc = "Detects edges";
    LGraphTextureEdges.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureEdges.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (
          (this || _global).properties.precision !== LGraphTexture.PASS_THROUGH
        ) {
          if (t) {
            (this || _global)._tex = LGraphTexture.getTargetTexture(
              t,
              (this || _global)._tex,
              (this || _global).properties.precision
            );
            gl.disable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
            var e = Mesh.getScreenQuad();
            var a = LGraphTextureEdges._shader;
            var o = (this || _global).properties.invert;
            var r = (this || _global).properties.factor;
            var l = (this || _global).properties.threshold ? 1 : 0;
            (this || _global)._tex.drawTo(function () {
              t.bind(0);
              a.uniforms({
                u_texture: 0,
                u_isize: [1 / t.width, 1 / t.height],
                u_factor: r,
                u_threshold: l,
                u_invert: o ? 1 : 0,
              }).draw(e);
            });
            this.setOutputData(0, (this || _global)._tex);
          }
        } else this.setOutputData(0, t);
      }
    };
    LGraphTextureEdges.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform vec2 u_isize;\n\t\tuniform int u_invert;\n\t\tuniform float u_factor;\n\t\tuniform float u_threshold;\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 center = texture2D(u_texture, v_coord);\n\t\t\tvec4 up = texture2D(u_texture, v_coord + u_isize * vec2(0.0,1.0) );\n\t\t\tvec4 down = texture2D(u_texture, v_coord + u_isize * vec2(0.0,-1.0) );\n\t\t\tvec4 left = texture2D(u_texture, v_coord + u_isize * vec2(1.0,0.0) );\n\t\t\tvec4 right = texture2D(u_texture, v_coord + u_isize * vec2(-1.0,0.0) );\n\t\t\tvec4 diff = abs(center - up) + abs(center - down) + abs(center - left) + abs(center - right);\n\t\t\tdiff *= u_factor;\n\t\t\tif(u_invert == 1)\n\t\t\t\tdiff.xyz = vec3(1.0) - diff.xyz;\n\t\t\tif( u_threshold == 0.0 )\n\t\t\t\tgl_FragColor = vec4( diff.xyz, center.a );\n\t\t\telse\n\t\t\t\tgl_FragColor = vec4( diff.x > 0.5 ? 1.0 : 0.0, diff.y > 0.5 ? 1.0 : 0.0, diff.z > 0.5 ? 1.0 : 0.0, center.a );\n\t\t}\n\t\t";
    e.registerNodeType("texture/edges", LGraphTextureEdges);
    LGraphTextureDepthRange.title = "Depth Range";
    LGraphTextureDepthRange.desc = "Generates a texture with a depth range";
    LGraphTextureDepthRange.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (t) {
          var e = gl.UNSIGNED_BYTE;
          (this || _global).properties.high_precision &&
            (e = gl.half_float_ext ? gl.HALF_FLOAT_OES : gl.FLOAT);
          ((this || _global)._temp_texture &&
            (this || _global)._temp_texture.type == e &&
            (this || _global)._temp_texture.width == t.width &&
            (this || _global)._temp_texture.height == t.height) ||
            ((this || _global)._temp_texture = new GL.Texture(
              t.width,
              t.height,
              { type: e, format: gl.RGBA, filter: gl.LINEAR }
            ));
          var a = (this || _global)._uniforms;
          var o = (this || _global).properties.distance;
          if (this.isInputConnected(1)) {
            o = this.getInputData(1);
            (this || _global).properties.distance = o;
          }
          var r = (this || _global).properties.range;
          if (this.isInputConnected(2)) {
            r = this.getInputData(2);
            (this || _global).properties.range = r;
          }
          a.u_distance = o;
          a.u_range = r;
          gl.disable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          var l = Mesh.getScreenQuad();
          if (!LGraphTextureDepthRange._shader) {
            LGraphTextureDepthRange._shader = new GL.Shader(
              Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureDepthRange.pixel_shader
            );
            LGraphTextureDepthRange._shader_onlydepth = new GL.Shader(
              Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureDepthRange.pixel_shader,
              { ONLY_DEPTH: "" }
            );
          }
          var n = (this || _global).properties.only_depth
            ? LGraphTextureDepthRange._shader_onlydepth
            : LGraphTextureDepthRange._shader;
          var s = null;
          s = t.near_far_planes
            ? t.near_far_planes
            : window.LS && LS.Renderer._main_camera
            ? LS.Renderer._main_camera._uniforms.u_camera_planes
            : [0.1, 1e3];
          a.u_camera_planes = s;
          (this || _global)._temp_texture.drawTo(function () {
            t.bind(0);
            n.uniforms(a).draw(l);
          });
          (this || _global)._temp_texture.near_far_planes = s;
          this.setOutputData(0, (this || _global)._temp_texture);
        }
      }
    };
    LGraphTextureDepthRange.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform vec2 u_camera_planes;\n\t\tuniform float u_distance;\n\t\tuniform float u_range;\n\t\t\n\t\tfloat LinearDepth()\n\t\t{\n\t\t\tfloat zNear = u_camera_planes.x;\n\t\t\tfloat zFar = u_camera_planes.y;\n\t\t\tfloat depth = texture2D(u_texture, v_coord).x;\n\t\t\tdepth = depth * 2.0 - 1.0;\n\t\t\treturn zNear * (depth + 1.0) / (zFar + zNear - depth * (zFar - zNear));\n\t\t}\n\t\t\n\t\tvoid main() {\n\t\t\tfloat depth = LinearDepth();\n\t\t\t#ifdef ONLY_DEPTH\n\t\t\t   gl_FragColor = vec4(depth);\n\t\t\t#else\n\t\t\t\tfloat diff = abs(depth * u_camera_planes.y - u_distance);\n\t\t\t\tfloat dof = 1.0;\n\t\t\t\tif(diff <= u_range)\n\t\t\t\t\tdof = diff / u_range;\n\t\t\t   gl_FragColor = vec4(dof);\n\t\t\t#endif\n\t\t}\n\t\t";
    e.registerNodeType("texture/depth_range", LGraphTextureDepthRange);
    LGraphTextureLinearDepth.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureLinearDepth.title = "Linear Depth";
    LGraphTextureLinearDepth.desc = "Creates a color texture with linear depth";
    LGraphTextureLinearDepth.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (
          t &&
          (t.format == gl.DEPTH_COMPONENT || t.format == gl.DEPTH_STENCIL)
        ) {
          var e =
            (this || _global).properties.precision == LGraphTexture.HIGH
              ? gl.HIGH_PRECISION_FORMAT
              : gl.UNSIGNED_BYTE;
          ((this || _global)._temp_texture &&
            (this || _global)._temp_texture.type == e &&
            (this || _global)._temp_texture.width == t.width &&
            (this || _global)._temp_texture.height == t.height) ||
            ((this || _global)._temp_texture = new GL.Texture(
              t.width,
              t.height,
              { type: e, format: gl.RGB, filter: gl.LINEAR }
            ));
          var a = (this || _global)._uniforms;
          a.u_invert = (this || _global).properties.invert ? 1 : 0;
          gl.disable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          var o = Mesh.getScreenQuad();
          LGraphTextureLinearDepth._shader ||
            (LGraphTextureLinearDepth._shader = new GL.Shader(
              GL.Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureLinearDepth.pixel_shader
            ));
          var r = LGraphTextureLinearDepth._shader;
          var l = null;
          l = t.near_far_planes
            ? t.near_far_planes
            : window.LS && LS.Renderer._main_camera
            ? LS.Renderer._main_camera._uniforms.u_camera_planes
            : [0.1, 1e3];
          a.u_camera_planes = l;
          a.u_ires.set([0, 0]);
          (this || _global)._temp_texture.drawTo(function () {
            t.bind(0);
            r.uniforms(a).draw(o);
          });
          (this || _global)._temp_texture.near_far_planes = l;
          this.setOutputData(0, (this || _global)._temp_texture);
        }
      }
    };
    LGraphTextureLinearDepth.pixel_shader =
      "precision highp float;\n\t\tprecision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform vec2 u_camera_planes;\n\t\tuniform int u_invert;\n\t\tuniform vec2 u_ires;\n\t\t\n\t\tvoid main() {\n\t\t\tfloat zNear = u_camera_planes.x;\n\t\t\tfloat zFar = u_camera_planes.y;\n\t\t\tfloat depth = texture2D(u_texture, v_coord + u_ires*0.5).x * 2.0 - 1.0;\n\t\t\tfloat f = zNear * (depth + 1.0) / (zFar + zNear - depth * (zFar - zNear));\n\t\t\tif( u_invert == 1 )\n\t\t\t\tf = 1.0 - f;\n\t\t\tgl_FragColor = vec4(vec3(f),1.0);\n\t\t}\n\t\t";
    e.registerNodeType("texture/linear_depth", LGraphTextureLinearDepth);
    LGraphTextureBlur.title = "Blur";
    LGraphTextureBlur.desc = "Blur a texture";
    LGraphTextureBlur.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureBlur.max_iterations = 20;
    LGraphTextureBlur.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0)) {
        var a = (this || _global)._final_texture;
        (a && a.width == t.width && a.height == t.height && a.type == t.type) ||
          (a = (this || _global)._final_texture =
            new GL.Texture(t.width, t.height, {
              type: t.type,
              format: gl.RGBA,
              filter: gl.LINEAR,
            }));
        var o = (this || _global).properties.iterations;
        if (this.isInputConnected(1)) {
          o = this.getInputData(1);
          (this || _global).properties.iterations = o;
        }
        o = Math.min(Math.floor(o), LGraphTextureBlur.max_iterations);
        if (0 != o) {
          var r = (this || _global).properties.intensity;
          if (this.isInputConnected(2)) {
            r = this.getInputData(2);
            (this || _global).properties.intensity = r;
          }
          var l = e.camera_aspect;
          l || void 0 === window.gl || (l = gl.canvas.height / gl.canvas.width);
          l || (l = 1);
          l = (this || _global).properties.preserve_aspect ? l : 1;
          var n = (this || _global).properties.scale || [1, 1];
          t.applyBlur(l * n[0], n[1], r, a);
          for (var s = 1; s < o; ++s)
            a.applyBlur(l * n[0] * (s + 1), n[1] * (s + 1), r);
          this.setOutputData(0, a);
        } else this.setOutputData(0, t);
      }
    };
    e.registerNodeType("texture/blur", LGraphTextureBlur);
    FXGlow.prototype.applyFX = function (t, e, a, o) {
      var r = t.width;
      var l = t.height;
      var n = {
        format: t.format,
        type: t.type,
        minFilter: GL.LINEAR,
        magFilter: GL.LINEAR,
        wrap: gl.CLAMP_TO_EDGE,
      };
      var s = (this || _global)._uniforms;
      var u = (this || _global)._textures;
      var h = FXGlow._cut_shader;
      h ||
        (h = FXGlow._cut_shader =
          new GL.Shader(
            GL.Shader.SCREEN_VERTEX_SHADER,
            FXGlow.cut_pixel_shader
          ));
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      s.u_threshold = (this || _global).threshold;
      var p = (u[0] = GL.Texture.getTemporary(r, l, n));
      t.blit(p, h.uniforms(s));
      var _ = p;
      var g = (this || _global).iterations;
      g = 0 | Math.clamp(g, 1, 16);
      var d = s.u_texel_size;
      var c = (this || _global).intensity;
      s.u_intensity = 1;
      s.u_delta = (this || _global).scale;
      h = FXGlow._shader;
      h ||
        (h = FXGlow._shader =
          new GL.Shader(
            GL.Shader.SCREEN_VERTEX_SHADER,
            FXGlow.scale_pixel_shader
          ));
      var b = 1;
      for (; b < g; b++) {
        r >>= 1;
        (0 | l) > 1 && (l >>= 1);
        if (r < 2) break;
        p = u[b] = GL.Texture.getTemporary(r, l, n);
        d[0] = 1 / _.width;
        d[1] = 1 / _.height;
        _.blit(p, h.uniforms(s));
        _ = p;
      }
      if (o) {
        d[0] = 1 / _.width;
        d[1] = 1 / _.height;
        s.u_intensity = c;
        s.u_delta = 1;
        _.blit(o, h.uniforms(s));
      }
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      s.u_intensity = (this || _global).persistence;
      s.u_delta = 0.5;
      for (b -= 2; b >= 0; b--) {
        p = u[b];
        u[b] = null;
        d[0] = 1 / _.width;
        d[1] = 1 / _.height;
        _.blit(p, h.uniforms(s));
        GL.Texture.releaseTemporary(_);
        _ = p;
      }
      gl.disable(gl.BLEND);
      a && _.blit(a);
      if (e) {
        var f = e;
        var m = (this || _global).dirt_texture;
        var L = (this || _global).dirt_factor;
        s.u_intensity = c;
        h = m ? FXGlow._dirt_final_shader : FXGlow._final_shader;
        h ||
          (h = m
            ? (FXGlow._dirt_final_shader = new GL.Shader(
                GL.Shader.SCREEN_VERTEX_SHADER,
                FXGlow.final_pixel_shader,
                { USE_DIRT: "" }
              ))
            : (FXGlow._final_shader = new GL.Shader(
                GL.Shader.SCREEN_VERTEX_SHADER,
                FXGlow.final_pixel_shader
              )));
        f.drawTo(function () {
          t.bind(0);
          _.bind(1);
          if (m) {
            h.setUniform("u_dirt_factor", L);
            h.setUniform("u_dirt_texture", m.bind(2));
          }
          h.toViewport(s);
        });
      }
      GL.Texture.releaseTemporary(_);
    };
    FXGlow.cut_pixel_shader =
      "precision highp float;\n\tvarying vec2 v_coord;\n\tuniform sampler2D u_texture;\n\tuniform float u_threshold;\n\tvoid main() {\n\t\tgl_FragColor = max( texture2D( u_texture, v_coord ) - vec4( u_threshold ), vec4(0.0) );\n\t}";
    FXGlow.scale_pixel_shader =
      "precision highp float;\n\tvarying vec2 v_coord;\n\tuniform sampler2D u_texture;\n\tuniform vec2 u_texel_size;\n\tuniform float u_delta;\n\tuniform float u_intensity;\n\t\n\tvec4 sampleBox(vec2 uv) {\n\t\tvec4 o = u_texel_size.xyxy * vec2(-u_delta, u_delta).xxyy;\n\t\tvec4 s = texture2D( u_texture, uv + o.xy ) + texture2D( u_texture, uv + o.zy) + texture2D( u_texture, uv + o.xw) + texture2D( u_texture, uv + o.zw);\n\t\treturn s * 0.25;\n\t}\n\tvoid main() {\n\t\tgl_FragColor = u_intensity * sampleBox( v_coord );\n\t}";
    FXGlow.final_pixel_shader =
      "precision highp float;\n\tvarying vec2 v_coord;\n\tuniform sampler2D u_texture;\n\tuniform sampler2D u_glow_texture;\n\t#ifdef USE_DIRT\n\t\tuniform sampler2D u_dirt_texture;\n\t#endif\n\tuniform vec2 u_texel_size;\n\tuniform float u_delta;\n\tuniform float u_intensity;\n\tuniform float u_dirt_factor;\n\t\n\tvec4 sampleBox(vec2 uv) {\n\t\tvec4 o = u_texel_size.xyxy * vec2(-u_delta, u_delta).xxyy;\n\t\tvec4 s = texture2D( u_glow_texture, uv + o.xy ) + texture2D( u_glow_texture, uv + o.zy) + texture2D( u_glow_texture, uv + o.xw) + texture2D( u_glow_texture, uv + o.zw);\n\t\treturn s * 0.25;\n\t}\n\tvoid main() {\n\t\tvec4 glow = sampleBox( v_coord );\n\t\t#ifdef USE_DIRT\n\t\t\tglow = mix( glow, glow * texture2D( u_dirt_texture, v_coord ), u_dirt_factor );\n\t\t#endif\n\t\tgl_FragColor = texture2D( u_texture, v_coord ) + u_intensity * glow;\n\t}";
    LGraphTextureGlow.title = "Glow";
    LGraphTextureGlow.desc = "Filters a texture giving it a glow effect";
    LGraphTextureGlow.widgets_info = {
      iterations: { type: "number", min: 0, max: 16, step: 1, precision: 0 },
      threshold: { type: "number", min: 0, max: 10, step: 0.01, precision: 2 },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureGlow.prototype.onGetInputs = function () {
      return [
        ["enabled", "boolean"],
        ["threshold", "number"],
        ["intensity", "number"],
        ["persistence", "number"],
        ["iterations", "number"],
        ["dirt_factor", "number"],
      ];
    };
    LGraphTextureGlow.prototype.onGetOutputs = function () {
      return [["average", "Texture"]];
    };
    LGraphTextureGlow.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isAnyOutputConnected())
        if (
          (this || _global).properties.precision !==
            LGraphTexture.PASS_THROUGH &&
          false !== this.getInputOrProperty("enabled")
        ) {
          t.width;
          t.height;
          var e = (this || _global).fx;
          e.threshold = this.getInputOrProperty("threshold");
          e.iterations = this.getInputOrProperty("iterations");
          e.intensity = this.getInputOrProperty("intensity");
          e.persistence = this.getInputOrProperty("persistence");
          e.dirt_texture = this.getInputData(1);
          e.dirt_factor = this.getInputOrProperty("dirt_factor");
          e.scale = (this || _global).properties.scale;
          var a = LGraphTexture.getTextureType(
            (this || _global).properties.precision,
            t
          );
          var o = null;
          if (this.isOutputConnected(2)) {
            o = (this || _global)._average_texture;
            (o && o.type == t.type && o.format == t.format) ||
              (o = (this || _global)._average_texture =
                new GL.Texture(1, 1, {
                  type: t.type,
                  format: t.format,
                  filter: gl.LINEAR,
                }));
          }
          var r = null;
          if (this.isOutputConnected(1)) {
            r = (this || _global)._glow_texture;
            (r &&
              r.width == t.width &&
              r.height == t.height &&
              r.type == a &&
              r.format == t.format) ||
              (r = (this || _global)._glow_texture =
                new GL.Texture(t.width, t.height, {
                  type: a,
                  format: t.format,
                  filter: gl.LINEAR,
                }));
          }
          var l = null;
          if (this.isOutputConnected(0)) {
            l = (this || _global)._final_texture;
            (l &&
              l.width == t.width &&
              l.height == t.height &&
              l.type == a &&
              l.format == t.format) ||
              (l = (this || _global)._final_texture =
                new GL.Texture(t.width, t.height, {
                  type: a,
                  format: t.format,
                  filter: gl.LINEAR,
                }));
          }
          e.applyFX(t, l, r, o);
          this.isOutputConnected(0) && this.setOutputData(0, l);
          this.isOutputConnected(1) && this.setOutputData(1, o);
          this.isOutputConnected(2) && this.setOutputData(2, r);
        } else this.setOutputData(0, t);
    };
    e.registerNodeType("texture/glow", LGraphTextureGlow);
    LGraphTextureKuwaharaFilter.title = "Kuwahara Filter";
    LGraphTextureKuwaharaFilter.desc =
      "Filters a texture giving an artistic oil canvas painting";
    LGraphTextureKuwaharaFilter.max_radius = 10;
    LGraphTextureKuwaharaFilter._shaders = [];
    LGraphTextureKuwaharaFilter.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0)) {
        var a = (this || _global)._temp_texture;
        (a && a.width == t.width && a.height == t.height && a.type == t.type) ||
          ((this || _global)._temp_texture = new GL.Texture(t.width, t.height, {
            type: t.type,
            format: gl.RGBA,
            filter: gl.LINEAR,
          }));
        var o = (this || _global).properties.radius;
        o = Math.min(Math.floor(o), LGraphTextureKuwaharaFilter.max_radius);
        if (0 != o) {
          var r = (this || _global).properties.intensity;
          var l = e.camera_aspect;
          l || void 0 === window.gl || (l = gl.canvas.height / gl.canvas.width);
          l || (l = 1);
          l = (this || _global).properties.preserve_aspect ? l : 1;
          LGraphTextureKuwaharaFilter._shaders[o] ||
            (LGraphTextureKuwaharaFilter._shaders[o] = new GL.Shader(
              Shader.SCREEN_VERTEX_SHADER,
              LGraphTextureKuwaharaFilter.pixel_shader,
              { RADIUS: o.toFixed(0) }
            ));
          var n = LGraphTextureKuwaharaFilter._shaders[o];
          var s = GL.Mesh.getScreenQuad();
          t.bind(0);
          (this || _global)._temp_texture.drawTo(function () {
            n.uniforms({
              u_texture: 0,
              u_intensity: r,
              u_resolution: [t.width, t.height],
              u_iResolution: [1 / t.width, 1 / t.height],
            }).draw(s);
          });
          this.setOutputData(0, (this || _global)._temp_texture);
        } else this.setOutputData(0, t);
      }
    };
    LGraphTextureKuwaharaFilter.pixel_shader =
      "\nprecision highp float;\nvarying vec2 v_coord;\nuniform sampler2D u_texture;\nuniform float u_intensity;\nuniform vec2 u_resolution;\nuniform vec2 u_iResolution;\n#ifndef RADIUS\n\t#define RADIUS 7\n#endif\nvoid main() {\n\n\tconst int radius = RADIUS;\n\tvec2 fragCoord = v_coord;\n\tvec2 src_size = u_iResolution;\n\tvec2 uv = v_coord;\n\tfloat n = float((radius + 1) * (radius + 1));\n\tint i;\n\tint j;\n\tvec3 m0 = vec3(0.0); vec3 m1 = vec3(0.0); vec3 m2 = vec3(0.0); vec3 m3 = vec3(0.0);\n\tvec3 s0 = vec3(0.0); vec3 s1 = vec3(0.0); vec3 s2 = vec3(0.0); vec3 s3 = vec3(0.0);\n\tvec3 c;\n\t\n\tfor (int j = -radius; j <= 0; ++j)  {\n\t\tfor (int i = -radius; i <= 0; ++i)  {\n\t\t\tc = texture2D(u_texture, uv + vec2(i,j) * src_size).rgb;\n\t\t\tm0 += c;\n\t\t\ts0 += c * c;\n\t\t}\n\t}\n\t\n\tfor (int j = -radius; j <= 0; ++j)  {\n\t\tfor (int i = 0; i <= radius; ++i)  {\n\t\t\tc = texture2D(u_texture, uv + vec2(i,j) * src_size).rgb;\n\t\t\tm1 += c;\n\t\t\ts1 += c * c;\n\t\t}\n\t}\n\t\n\tfor (int j = 0; j <= radius; ++j)  {\n\t\tfor (int i = 0; i <= radius; ++i)  {\n\t\t\tc = texture2D(u_texture, uv + vec2(i,j) * src_size).rgb;\n\t\t\tm2 += c;\n\t\t\ts2 += c * c;\n\t\t}\n\t}\n\t\n\tfor (int j = 0; j <= radius; ++j)  {\n\t\tfor (int i = -radius; i <= 0; ++i)  {\n\t\t\tc = texture2D(u_texture, uv + vec2(i,j) * src_size).rgb;\n\t\t\tm3 += c;\n\t\t\ts3 += c * c;\n\t\t}\n\t}\n\t\n\tfloat min_sigma2 = 1e+2;\n\tm0 /= n;\n\ts0 = abs(s0 / n - m0 * m0);\n\t\n\tfloat sigma2 = s0.r + s0.g + s0.b;\n\tif (sigma2 < min_sigma2) {\n\t\tmin_sigma2 = sigma2;\n\t\tgl_FragColor = vec4(m0, 1.0);\n\t}\n\t\n\tm1 /= n;\n\ts1 = abs(s1 / n - m1 * m1);\n\t\n\tsigma2 = s1.r + s1.g + s1.b;\n\tif (sigma2 < min_sigma2) {\n\t\tmin_sigma2 = sigma2;\n\t\tgl_FragColor = vec4(m1, 1.0);\n\t}\n\t\n\tm2 /= n;\n\ts2 = abs(s2 / n - m2 * m2);\n\t\n\tsigma2 = s2.r + s2.g + s2.b;\n\tif (sigma2 < min_sigma2) {\n\t\tmin_sigma2 = sigma2;\n\t\tgl_FragColor = vec4(m2, 1.0);\n\t}\n\t\n\tm3 /= n;\n\ts3 = abs(s3 / n - m3 * m3);\n\t\n\tsigma2 = s3.r + s3.g + s3.b;\n\tif (sigma2 < min_sigma2) {\n\t\tmin_sigma2 = sigma2;\n\t\tgl_FragColor = vec4(m3, 1.0);\n\t}\n}\n";
    e.registerNodeType("texture/kuwahara", LGraphTextureKuwaharaFilter);
    LGraphTextureXDoGFilter.title = "XDoG Filter";
    LGraphTextureXDoGFilter.desc =
      "Filters a texture giving an artistic ink style";
    LGraphTextureXDoGFilter.max_radius = 10;
    LGraphTextureXDoGFilter._shaders = [];
    LGraphTextureXDoGFilter.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0)) {
        var e = (this || _global)._temp_texture;
        (e && e.width == t.width && e.height == t.height && e.type == t.type) ||
          ((this || _global)._temp_texture = new GL.Texture(t.width, t.height, {
            type: t.type,
            format: gl.RGBA,
            filter: gl.LINEAR,
          }));
        LGraphTextureXDoGFilter._xdog_shader ||
          (LGraphTextureXDoGFilter._xdog_shader = new GL.Shader(
            Shader.SCREEN_VERTEX_SHADER,
            LGraphTextureXDoGFilter.xdog_pixel_shader
          ));
        var a = LGraphTextureXDoGFilter._xdog_shader;
        var o = GL.Mesh.getScreenQuad();
        var r = (this || _global).properties.sigma;
        var l = (this || _global).properties.k;
        var n = (this || _global).properties.p;
        var s = (this || _global).properties.epsilon;
        var u = (this || _global).properties.phi;
        t.bind(0);
        (this || _global)._temp_texture.drawTo(function () {
          a.uniforms({
            src: 0,
            sigma: r,
            k: l,
            p: n,
            epsilon: s,
            phi: u,
            cvsWidth: t.width,
            cvsHeight: t.height,
          }).draw(o);
        });
        this.setOutputData(0, (this || _global)._temp_texture);
      }
    };
    LGraphTextureXDoGFilter.xdog_pixel_shader =
      "\nprecision highp float;\nuniform sampler2D src;\n\nuniform float cvsHeight;\nuniform float cvsWidth;\n\nuniform float sigma;\nuniform float k;\nuniform float p;\nuniform float epsilon;\nuniform float phi;\nvarying vec2 v_coord;\n\nfloat cosh(float val)\n{\n\tfloat tmp = exp(val);\n\tfloat cosH = (tmp + 1.0 / tmp) / 2.0;\n\treturn cosH;\n}\n\nfloat tanh(float val)\n{\n\tfloat tmp = exp(val);\n\tfloat tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);\n\treturn tanH;\n}\n\nfloat sinh(float val)\n{\n\tfloat tmp = exp(val);\n\tfloat sinH = (tmp - 1.0 / tmp) / 2.0;\n\treturn sinH;\n}\n\nvoid main(void){\n\tvec3 destColor = vec3(0.0);\n\tfloat tFrag = 1.0 / cvsHeight;\n\tfloat sFrag = 1.0 / cvsWidth;\n\tvec2 Frag = vec2(sFrag,tFrag);\n\tvec2 uv = gl_FragCoord.st;\n\tfloat twoSigmaESquared = 2.0 * sigma * sigma;\n\tfloat twoSigmaRSquared = twoSigmaESquared * k * k;\n\tint halfWidth = int(ceil( 1.0 * sigma * k ));\n\n\tconst int MAX_NUM_ITERATION = 99999;\n\tvec2 sum = vec2(0.0);\n\tvec2 norm = vec2(0.0);\n\n\tfor(int cnt=0;cnt<MAX_NUM_ITERATION;cnt++){\n\t\tif(cnt > (2*halfWidth+1)*(2*halfWidth+1)){break;}\n\t\tint i = int(cnt / (2*halfWidth+1)) - halfWidth;\n\t\tint j = cnt - halfWidth - int(cnt / (2*halfWidth+1)) * (2*halfWidth+1);\n\n\t\tfloat d = length(vec2(i,j));\n\t\tvec2 kernel = vec2( exp( -d * d / twoSigmaESquared ), \n\t\t\t\t\t\t\texp( -d * d / twoSigmaRSquared ));\n\n\t\tvec2 L = texture2D(src, (uv + vec2(i,j)) * Frag).xx;\n\n\t\tnorm += kernel;\n\t\tsum += kernel * L;\n\t}\n\n\tsum /= norm;\n\n\tfloat H = 100.0 * ((1.0 + p) * sum.x - p * sum.y);\n\tfloat edge = ( H > epsilon )? 1.0 : 1.0 + tanh( phi * (H - epsilon));\n\tdestColor = vec3(edge);\n\tgl_FragColor = vec4(destColor, 1.0);\n}";
    e.registerNodeType("texture/xDoG", LGraphTextureXDoGFilter);
    LGraphTextureWebcam.title = "Webcam";
    LGraphTextureWebcam.desc = "Webcam texture";
    LGraphTextureWebcam.is_webcam_open = false;
    LGraphTextureWebcam.prototype.openStream = function () {
      if (navigator.getUserMedia) {
        (this || _global)._waiting_confirmation = true;
        var t = {
          audio: false,
          video: { facingMode: (this || _global).properties.facingMode },
        };
        navigator.mediaDevices
          .getUserMedia(t)
          .then((this || _global).streamReady.bind(this || _global))
          .catch(onFailSoHard);
        var e = this || _global;
      }
      function onFailSoHard(t) {
        LGraphTextureWebcam.is_webcam_open = false;
        console.log("Webcam rejected", t);
        e._webcam_stream = false;
        e.boxcolor = "red";
        e.trigger("stream_error");
      }
    };
    LGraphTextureWebcam.prototype.closeStream = function () {
      if ((this || _global)._webcam_stream) {
        var t = (this || _global)._webcam_stream.getTracks();
        if (t.length) for (var e = 0; e < t.length; ++e) t[e].stop();
        LGraphTextureWebcam.is_webcam_open = false;
        (this || _global)._webcam_stream = null;
        (this || _global)._video = null;
        (this || _global).boxcolor = "black";
        this.trigger("stream_closed");
      }
    };
    LGraphTextureWebcam.prototype.streamReady = function (t) {
      (this || _global)._webcam_stream = t;
      (this || _global).boxcolor = "green";
      var e = (this || _global)._video;
      if (!e) {
        e = document.createElement("video");
        e.autoplay = true;
        e.srcObject = t;
        (this || _global)._video = e;
        e.onloadedmetadata = function (t) {
          LGraphTextureWebcam.is_webcam_open = true;
          console.log(t);
        };
      }
      this.trigger("stream_ready", e);
    };
    LGraphTextureWebcam.prototype.onPropertyChanged = function (t, e) {
      if ("facingMode" == t) {
        (this || _global).properties.facingMode = e;
        this.closeStream();
        this.openStream();
      }
    };
    LGraphTextureWebcam.prototype.onRemoved = function () {
      if ((this || _global)._webcam_stream) {
        var t = (this || _global)._webcam_stream.getTracks();
        if (t.length) for (var e = 0; e < t.length; ++e) t[e].stop();
        (this || _global)._webcam_stream = null;
        (this || _global)._video = null;
      }
    };
    LGraphTextureWebcam.prototype.onDrawBackground = function (t) {
      if (
        !(
          (this || _global).flags.collapsed || (this || _global).size[1] <= 20
        ) &&
        (this || _global)._video
      ) {
        t.save();
        t.webgl
          ? (this || _global)._video_texture &&
            t.drawImage(
              (this || _global)._video_texture,
              0,
              0,
              (this || _global).size[0],
              (this || _global).size[1]
            )
          : t.drawImage(
              (this || _global)._video,
              0,
              0,
              (this || _global).size[0],
              (this || _global).size[1]
            );
        t.restore();
      }
    };
    LGraphTextureWebcam.prototype.onExecute = function () {
      null != (this || _global)._webcam_stream ||
        (this || _global)._waiting_confirmation ||
        this.openStream();
      if ((this || _global)._video && (this || _global)._video.videoWidth) {
        var t = (this || _global)._video.videoWidth;
        var e = (this || _global)._video.videoHeight;
        var a = (this || _global)._video_texture;
        (a && a.width == t && a.height == e) ||
          ((this || _global)._video_texture = new GL.Texture(t, e, {
            format: gl.RGB,
            filter: gl.LINEAR,
          }));
        (this || _global)._video_texture.uploadImage((this || _global)._video);
        (this || _global)._video_texture.version = ++(this || _global).version;
        if ((this || _global).properties.texture_name) {
          var o = LGraphTexture.getTexturesContainer();
          o[(this || _global).properties.texture_name] = (
            this || _global
          )._video_texture;
        }
        this.setOutputData(0, (this || _global)._video_texture);
        for (var r = 1; r < (this || _global).outputs.length; ++r)
          if ((this || _global).outputs[r])
            switch ((this || _global).outputs[r].name) {
              case "width":
                this.setOutputData(r, (this || _global)._video.videoWidth);
                break;
              case "height":
                this.setOutputData(r, (this || _global)._video.videoHeight);
                break;
            }
      }
    };
    LGraphTextureWebcam.prototype.onGetOutputs = function () {
      return [
        ["width", "number"],
        ["height", "number"],
        ["stream_ready", e.EVENT],
        ["stream_closed", e.EVENT],
        ["stream_error", e.EVENT],
      ];
    };
    e.registerNodeType("texture/webcam", LGraphTextureWebcam);
    LGraphLensFX.title = "Lens FX";
    LGraphLensFX.desc = "distortion and chromatic aberration";
    LGraphLensFX.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphLensFX.prototype.onGetInputs = function () {
      return [["enabled", "boolean"]];
    };
    LGraphLensFX.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0))
        if (
          (this || _global).properties.precision !==
            LGraphTexture.PASS_THROUGH &&
          false !== this.getInputOrProperty("enabled")
        ) {
          var e = (this || _global)._temp_texture;
          (e &&
            e.width == t.width &&
            e.height == t.height &&
            e.type == t.type) ||
            (e = (this || _global)._temp_texture =
              new GL.Texture(t.width, t.height, {
                type: t.type,
                format: gl.RGBA,
                filter: gl.LINEAR,
              }));
          var a = LGraphLensFX._shader;
          a ||
            (a = LGraphLensFX._shader =
              new GL.Shader(
                GL.Shader.SCREEN_VERTEX_SHADER,
                LGraphLensFX.pixel_shader
              ));
          var o = this.getInputData(1);
          null == o && (o = (this || _global).properties.factor);
          var r = (this || _global)._uniforms;
          r.u_factor = o;
          gl.disable(gl.DEPTH_TEST);
          e.drawTo(function () {
            t.bind(0);
            a.uniforms(r).draw(GL.Mesh.getScreenQuad());
          });
          this.setOutputData(0, e);
        } else this.setOutputData(0, t);
    };
    LGraphLensFX.pixel_shader =
      "precision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform float u_factor;\n\t\tvec2 barrelDistortion(vec2 coord, float amt) {\n\t\t\tvec2 cc = coord - 0.5;\n\t\t\tfloat dist = dot(cc, cc);\n\t\t\treturn coord + cc * dist * amt;\n\t\t}\n\t\t\n\t\tfloat sat( float t )\n\t\t{\n\t\t\treturn clamp( t, 0.0, 1.0 );\n\t\t}\n\t\t\n\t\tfloat linterp( float t ) {\n\t\t\treturn sat( 1.0 - abs( 2.0*t - 1.0 ) );\n\t\t}\n\t\t\n\t\tfloat remap( float t, float a, float b ) {\n\t\t\treturn sat( (t - a) / (b - a) );\n\t\t}\n\t\t\n\t\tvec4 spectrum_offset( float t ) {\n\t\t\tvec4 ret;\n\t\t\tfloat lo = step(t,0.5);\n\t\t\tfloat hi = 1.0-lo;\n\t\t\tfloat w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );\n\t\t\tret = vec4(lo,1.0,hi, 1.) * vec4(1.0-w, w, 1.0-w, 1.);\n\t\t\n\t\t\treturn pow( ret, vec4(1.0/2.2) );\n\t\t}\n\t\t\n\t\tconst float max_distort = 2.2;\n\t\tconst int num_iter = 12;\n\t\tconst float reci_num_iter_f = 1.0 / float(num_iter);\n\t\t\n\t\tvoid main()\n\t\t{\t\n\t\t\tvec2 uv=v_coord;\n\t\t\tvec4 sumcol = vec4(0.0);\n\t\t\tvec4 sumw = vec4(0.0);\t\n\t\t\tfor ( int i=0; i<num_iter;++i )\n\t\t\t{\n\t\t\t\tfloat t = float(i) * reci_num_iter_f;\n\t\t\t\tvec4 w = spectrum_offset( t );\n\t\t\t\tsumw += w;\n\t\t\t\tsumcol += w * texture2D( u_texture, barrelDistortion(uv, .6 * max_distort*t * u_factor ) );\n\t\t\t}\n\t\t\tgl_FragColor = sumcol / sumw;\n\t\t}";
    e.registerNodeType("texture/lensfx", LGraphLensFX);
    LGraphTextureFromData.title = "Data->Tex";
    LGraphTextureFromData.desc = "Generates or applies a curve to a texture";
    LGraphTextureFromData.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureFromData.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (t) {
          var e = (this || _global).properties.channels;
          var a = (this || _global).properties.width;
          var o = (this || _global).properties.height;
          if (!a || !o) {
            a = Math.floor(t.length / e);
            o = 1;
          }
          var r = gl.RGBA;
          3 == e ? (r = gl.RGB) : 1 == e && (r = gl.LUMINANCE);
          var l = (this || _global)._temp_texture;
          var n = LGraphTexture.getTextureType(
            (this || _global).properties.precision
          );
          (l && l.width == a && l.height == o && l.type == n) ||
            (l = (this || _global)._temp_texture =
              new GL.Texture(a, o, { type: n, format: r, filter: gl.LINEAR }));
          l.uploadData(t);
          this.setOutputData(0, l);
        }
      }
    };
    e.registerNodeType("texture/fromdata", LGraphTextureFromData);
    LGraphTextureCurve.title = "Curve";
    LGraphTextureCurve.desc = "Generates or applies a curve to a texture";
    LGraphTextureCurve.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureCurve.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        var e = (this || _global)._temp_texture;
        if (t) {
          var a = LGraphTexture.getTextureType(
            (this || _global).properties.precision,
            t
          );
          (e &&
            e.type == a &&
            e.width == t.width &&
            e.height == t.height &&
            e.format == t.format) ||
            (e = (this || _global)._temp_texture =
              new GL.Texture(t.width, t.height, {
                type: a,
                format: t.format,
                filter: gl.LINEAR,
              }));
          var o = LGraphTextureCurve._shader;
          o ||
            (o = LGraphTextureCurve._shader =
              new GL.Shader(
                GL.Shader.SCREEN_VERTEX_SHADER,
                LGraphTextureCurve.pixel_shader
              ));
          (!(this || _global)._must_update &&
            (this || _global)._curve_texture) ||
            this.updateCurve();
          var r = (this || _global)._uniforms;
          var l = (this || _global)._curve_texture;
          e.drawTo(function () {
            gl.disable(gl.DEPTH_TEST);
            t.bind(0);
            l.bind(1);
            o.uniforms(r).draw(GL.Mesh.getScreenQuad());
          });
          this.setOutputData(0, e);
        } else {
          (!(this || _global)._must_update &&
            (this || _global)._curve_texture) ||
            this.updateCurve();
          this.setOutputData(0, (this || _global)._curve_texture);
        }
      }
    };
    LGraphTextureCurve.prototype.sampleCurve = function (t, e) {
      e = e || (this || _global)._points.RGB;
      if (e) {
        for (var a = 0; a < e.length - 1; ++a) {
          var o = e[a];
          var r = e[a + 1];
          if (!(r[0] < t)) {
            var l = r[0] - o[0];
            if (Math.abs(l) < 1e-5) return o[1];
            var n = (t - o[0]) / l;
            return o[1] * (1 - n) + r[1] * n;
          }
        }
        return 0;
      }
    };
    LGraphTextureCurve.prototype.updateCurve = function () {
      var t = (this || _global)._values;
      var e = t.length / 4;
      var a = (this || _global).properties.split_channels;
      for (var o = 0; o < e; ++o) {
        if (a) {
          t[4 * o] = Math.clamp(
            255 * this.sampleCurve(o / e, (this || _global)._points.R),
            0,
            255
          );
          t[4 * o + 1] = Math.clamp(
            255 * this.sampleCurve(o / e, (this || _global)._points.G),
            0,
            255
          );
          t[4 * o + 2] = Math.clamp(
            255 * this.sampleCurve(o / e, (this || _global)._points.B),
            0,
            255
          );
        } else {
          var r = this.sampleCurve(o / e);
          t[4 * o] = t[4 * o + 1] = t[4 * o + 2] = Math.clamp(255 * r, 0, 255);
        }
        t[4 * o + 3] = 255;
      }
      (this || _global)._curve_texture ||
        ((this || _global)._curve_texture = new GL.Texture(256, 1, {
          format: gl.RGBA,
          magFilter: gl.LINEAR,
          wrap: gl.CLAMP_TO_EDGE,
        }));
      (this || _global)._curve_texture.uploadData(t, null, true);
    };
    LGraphTextureCurve.prototype.onSerialize = function (t) {
      var e = {};
      for (var a in (this || _global)._points)
        e[a] = (this || _global)._points[a].concat();
      t.curves = e;
    };
    LGraphTextureCurve.prototype.onConfigure = function (t) {
      (this || _global)._points = t.curves;
      (this || _global).curve_editor &&
        (curve_editor.points = (this || _global)._points);
      (this || _global)._must_update = true;
    };
    LGraphTextureCurve.prototype.onMouseDown = function (t, e, a) {
      if ((this || _global).curve_editor) {
        var o = (this || _global).curve_editor.onMouseDown(
          [e[0], e[1] - (this || _global).curve_offset],
          a
        );
        o && this.captureInput(true);
        return o;
      }
    };
    LGraphTextureCurve.prototype.onMouseMove = function (t, e, a) {
      if ((this || _global).curve_editor)
        return (this || _global).curve_editor.onMouseMove(
          [e[0], e[1] - (this || _global).curve_offset],
          a
        );
    };
    LGraphTextureCurve.prototype.onMouseUp = function (t, e, a) {
      if ((this || _global).curve_editor)
        return (this || _global).curve_editor.onMouseUp(
          [e[0], e[1] - (this || _global).curve_offset],
          a
        );
      this.captureInput(false);
    };
    LGraphTextureCurve.channel_line_colors = {
      RGB: "#666",
      R: "#F33",
      G: "#3F3",
      B: "#33F",
    };
    LGraphTextureCurve.prototype.onDrawBackground = function (t, a) {
      if (!(this || _global).flags.collapsed) {
        (this || _global).curve_editor ||
          ((this || _global).curve_editor = new e.CurveEditor(
            (this || _global)._points.R
          ));
        t.save();
        t.translate(0, (this || _global).curve_offset);
        var o = (this || _global).widgets[1].value;
        if ((this || _global).properties.split_channels) {
          if ("RGB" == o) {
            (this || _global).widgets[1].value = o = "R";
            (this || _global).widgets[1].disabled = false;
          }
          (this || _global).curve_editor.points = (this || _global)._points.R;
          (this || _global).curve_editor.draw(
            t,
            [
              (this || _global).size[0],
              (this || _global).size[1] - (this || _global).curve_offset,
            ],
            a,
            "#111",
            LGraphTextureCurve.channel_line_colors.R,
            true
          );
          t.globalCompositeOperation = "lighten";
          (this || _global).curve_editor.points = (this || _global)._points.G;
          (this || _global).curve_editor.draw(
            t,
            [
              (this || _global).size[0],
              (this || _global).size[1] - (this || _global).curve_offset,
            ],
            a,
            null,
            LGraphTextureCurve.channel_line_colors.G,
            true
          );
          (this || _global).curve_editor.points = (this || _global)._points.B;
          (this || _global).curve_editor.draw(
            t,
            [
              (this || _global).size[0],
              (this || _global).size[1] - (this || _global).curve_offset,
            ],
            a,
            null,
            LGraphTextureCurve.channel_line_colors.B,
            true
          );
          t.globalCompositeOperation = "source-over";
        } else {
          (this || _global).widgets[1].value = o = "RGB";
          (this || _global).widgets[1].disabled = true;
        }
        (this || _global).curve_editor.points = (this || _global)._points[o];
        (this || _global).curve_editor.draw(
          t,
          [
            (this || _global).size[0],
            (this || _global).size[1] - (this || _global).curve_offset,
          ],
          a,
          (this || _global).properties.split_channels ? null : "#111",
          LGraphTextureCurve.channel_line_colors[o]
        );
        t.restore();
      }
    };
    LGraphTextureCurve.pixel_shader =
      "precision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform sampler2D u_curve;\n\t\tuniform float u_range;\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 color = texture2D( u_texture, v_coord ) * u_range;\n\t\t\tcolor.x = texture2D( u_curve, vec2( color.x, 0.5 ) ).x;\n\t\t\tcolor.y = texture2D( u_curve, vec2( color.y, 0.5 ) ).y;\n\t\t\tcolor.z = texture2D( u_curve, vec2( color.z, 0.5 ) ).z;\n\t\t\t//color.w = texture2D( u_curve, vec2( color.w, 0.5 ) ).w;\n\t\t\tgl_FragColor = color;\n\t\t}";
    e.registerNodeType("texture/curve", LGraphTextureCurve);
    LGraphExposition.title = "Exposition";
    LGraphExposition.desc = "Controls texture exposition";
    LGraphExposition.widgets_info = {
      exposition: { widget: "slider", min: 0, max: 3 },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphExposition.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0)) {
        var e = (this || _global)._temp_texture;
        (e && e.width == t.width && e.height == t.height && e.type == t.type) ||
          (e = (this || _global)._temp_texture =
            new GL.Texture(t.width, t.height, {
              type: t.type,
              format: gl.RGBA,
              filter: gl.LINEAR,
            }));
        var a = LGraphExposition._shader;
        a ||
          (a = LGraphExposition._shader =
            new GL.Shader(
              GL.Shader.SCREEN_VERTEX_SHADER,
              LGraphExposition.pixel_shader
            ));
        (this || _global).properties.exposition;
        var o = this.getInputData(1);
        null != o && ((this || _global).properties.exposition = o);
        var r = (this || _global)._uniforms;
        e.drawTo(function () {
          gl.disable(gl.DEPTH_TEST);
          t.bind(0);
          a.uniforms(r).draw(GL.Mesh.getScreenQuad());
        });
        this.setOutputData(0, e);
      }
    };
    LGraphExposition.pixel_shader =
      "precision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform float u_exposition;\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 color = texture2D( u_texture, v_coord );\n\t\t\tgl_FragColor = vec4( color.xyz * u_exposition, color.a );\n\t\t}";
    e.registerNodeType("texture/exposition", LGraphExposition);
    LGraphToneMapping.title = "Tone Mapping";
    LGraphToneMapping.desc = "Applies Tone Mapping to convert from high to low";
    LGraphToneMapping.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphToneMapping.prototype.onGetInputs = function () {
      return [["enabled", "boolean"]];
    };
    LGraphToneMapping.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t && this.isOutputConnected(0))
        if (
          (this || _global).properties.precision !==
            LGraphTexture.PASS_THROUGH &&
          false !== this.getInputOrProperty("enabled")
        ) {
          var e = (this || _global)._temp_texture;
          (e &&
            e.width == t.width &&
            e.height == t.height &&
            e.type == t.type) ||
            (e = (this || _global)._temp_texture =
              new GL.Texture(t.width, t.height, {
                type: t.type,
                format: gl.RGBA,
                filter: gl.LINEAR,
              }));
          var a = this.getInputData(1);
          null == a && (a = (this || _global).properties.average_lum);
          var o = (this || _global)._uniforms;
          var r = null;
          if (a.constructor === Number) {
            (this || _global).properties.average_lum = a;
            o.u_average_lum = (this || _global).properties.average_lum;
            r = LGraphToneMapping._shader;
            r ||
              (r = LGraphToneMapping._shader =
                new GL.Shader(
                  GL.Shader.SCREEN_VERTEX_SHADER,
                  LGraphToneMapping.pixel_shader
                ));
          } else if (a.constructor === GL.Texture) {
            o.u_average_texture = a.bind(1);
            r = LGraphToneMapping._shader_texture;
            r ||
              (r = LGraphToneMapping._shader_texture =
                new GL.Shader(
                  GL.Shader.SCREEN_VERTEX_SHADER,
                  LGraphToneMapping.pixel_shader,
                  { AVG_TEXTURE: "" }
                ));
          }
          o.u_lumwhite2 =
            (this || _global).properties.lum_white *
            (this || _global).properties.lum_white;
          o.u_scale = (this || _global).properties.scale;
          o.u_igamma = 1 / (this || _global).properties.gamma;
          gl.disable(gl.DEPTH_TEST);
          e.drawTo(function () {
            t.bind(0);
            r.uniforms(o).draw(GL.Mesh.getScreenQuad());
          });
          this.setOutputData(0, (this || _global)._temp_texture);
        } else this.setOutputData(0, t);
    };
    LGraphToneMapping.pixel_shader =
      "precision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform float u_scale;\n\t\t#ifdef AVG_TEXTURE\n\t\t\tuniform sampler2D u_average_texture;\n\t\t#else\n\t\t\tuniform float u_average_lum;\n\t\t#endif\n\t\tuniform float u_lumwhite2;\n\t\tuniform float u_igamma;\n\t\tvec3 RGB2xyY (vec3 rgb)\n\t\t{\n\t\t\t const mat3 RGB2XYZ = mat3(0.4124, 0.3576, 0.1805,\n\t\t\t\t\t\t\t\t\t   0.2126, 0.7152, 0.0722,\n\t\t\t\t\t\t\t\t\t   0.0193, 0.1192, 0.9505);\n\t\t\tvec3 XYZ = RGB2XYZ * rgb;\n\t\t\t\n\t\t\tfloat f = (XYZ.x + XYZ.y + XYZ.z);\n\t\t\treturn vec3(XYZ.x / f,\n\t\t\t\t\t\tXYZ.y / f,\n\t\t\t\t\t\tXYZ.y);\n\t\t}\n\t\t\n\t\tvoid main() {\n\t\t\tvec4 color = texture2D( u_texture, v_coord );\n\t\t\tvec3 rgb = color.xyz;\n\t\t\tfloat average_lum = 0.0;\n\t\t\t#ifdef AVG_TEXTURE\n\t\t\t\tvec3 pixel = texture2D(u_average_texture,vec2(0.5)).xyz;\n\t\t\t\taverage_lum = (pixel.x + pixel.y + pixel.z) / 3.0;\n\t\t\t#else\n\t\t\t\taverage_lum = u_average_lum;\n\t\t\t#endif\n\t\t\t//Ld - this part of the code is the same for both versions\n\t\t\tfloat lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));\n\t\t\tfloat L = (u_scale / average_lum) * lum;\n\t\t\tfloat Ld = (L * (1.0 + L / u_lumwhite2)) / (1.0 + L);\n\t\t\t//first\n\t\t\t//vec3 xyY = RGB2xyY(rgb);\n\t\t\t//xyY.z *= Ld;\n\t\t\t//rgb = xyYtoRGB(xyY);\n\t\t\t//second\n\t\t\trgb = (rgb / lum) * Ld;\n\t\t\trgb = max(rgb,vec3(0.001));\n\t\t\trgb = pow( rgb, vec3( u_igamma ) );\n\t\t\tgl_FragColor = vec4( rgb, color.a );\n\t\t}";
    e.registerNodeType("texture/tonemapping", LGraphToneMapping);
    LGraphTexturePerlin.title = "Perlin";
    LGraphTexturePerlin.desc = "Generates a perlin noise texture";
    LGraphTexturePerlin.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
      width: { type: "number", precision: 0, step: 1 },
      height: { type: "number", precision: 0, step: 1 },
      octaves: { type: "number", precision: 0, step: 1, min: 1, max: 50 },
    };
    LGraphTexturePerlin.prototype.onGetInputs = function () {
      return [
        ["seed", "number"],
        ["persistence", "number"],
        ["octaves", "number"],
        ["scale", "number"],
        ["amplitude", "number"],
        ["offset", "vec2"],
      ];
    };
    LGraphTexturePerlin.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = 0 | (this || _global).properties.width;
        var e = 0 | (this || _global).properties.height;
        0 == t && (t = gl.viewport_data[2]);
        0 == e && (e = gl.viewport_data[3]);
        var a = LGraphTexture.getTextureType(
          (this || _global).properties.precision
        );
        var o = (this || _global)._texture;
        (o && o.width == t && o.height == e && o.type == a) ||
          (o = (this || _global)._texture =
            new GL.Texture(t, e, {
              type: a,
              format: gl.RGB,
              filter: gl.LINEAR,
            }));
        var r = this.getInputOrProperty("persistence");
        var l = this.getInputOrProperty("octaves");
        var n = this.getInputOrProperty("offset");
        var s = this.getInputOrProperty("scale");
        var u = this.getInputOrProperty("amplitude");
        var h = this.getInputOrProperty("seed");
        var p = "" + t + e + a + r + l + s + h + n[0] + n[1] + u;
        if (p != (this || _global)._key) {
          (this || _global)._key = p;
          var _ = (this || _global)._uniforms;
          _.u_persistence = r;
          _.u_octaves = l;
          _.u_offset.set(n);
          _.u_scale = s;
          _.u_amplitude = u;
          _.u_seed = 128 * h;
          _.u_viewport[0] = t;
          _.u_viewport[1] = e;
          var g = LGraphTexturePerlin._shader;
          g ||
            (g = LGraphTexturePerlin._shader =
              new GL.Shader(
                GL.Shader.SCREEN_VERTEX_SHADER,
                LGraphTexturePerlin.pixel_shader
              ));
          gl.disable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          o.drawTo(function () {
            g.uniforms(_).draw(GL.Mesh.getScreenQuad());
          });
          this.setOutputData(0, o);
        } else this.setOutputData(0, o);
      }
    };
    LGraphTexturePerlin.pixel_shader =
      "precision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform vec2 u_offset;\n\t\tuniform float u_scale;\n\t\tuniform float u_persistence;\n\t\tuniform int u_octaves;\n\t\tuniform float u_amplitude;\n\t\tuniform vec2 u_viewport;\n\t\tuniform float u_seed;\n\t\t#define M_PI 3.14159265358979323846\n\t\t\n\t\tfloat rand(vec2 c){\treturn fract(sin(dot(c.xy ,vec2( 12.9898 + u_seed,78.233 + u_seed))) * 43758.5453); }\n\t\t\n\t\tfloat noise(vec2 p, float freq ){\n\t\t\tfloat unit = u_viewport.x/freq;\n\t\t\tvec2 ij = floor(p/unit);\n\t\t\tvec2 xy = mod(p,unit)/unit;\n\t\t\t//xy = 3.*xy*xy-2.*xy*xy*xy;\n\t\t\txy = .5*(1.-cos(M_PI*xy));\n\t\t\tfloat a = rand((ij+vec2(0.,0.)));\n\t\t\tfloat b = rand((ij+vec2(1.,0.)));\n\t\t\tfloat c = rand((ij+vec2(0.,1.)));\n\t\t\tfloat d = rand((ij+vec2(1.,1.)));\n\t\t\tfloat x1 = mix(a, b, xy.x);\n\t\t\tfloat x2 = mix(c, d, xy.x);\n\t\t\treturn mix(x1, x2, xy.y);\n\t\t}\n\t\t\n\t\tfloat pNoise(vec2 p, int res){\n\t\t\tfloat persistance = u_persistence;\n\t\t\tfloat n = 0.;\n\t\t\tfloat normK = 0.;\n\t\t\tfloat f = 4.;\n\t\t\tfloat amp = 1.0;\n\t\t\tint iCount = 0;\n\t\t\tfor (int i = 0; i<50; i++){\n\t\t\t\tn+=amp*noise(p, f);\n\t\t\t\tf*=2.;\n\t\t\t\tnormK+=amp;\n\t\t\t\tamp*=persistance;\n\t\t\t\tif (iCount >= res)\n\t\t\t\t\tbreak;\n\t\t\t\tiCount++;\n\t\t\t}\n\t\t\tfloat nf = n/normK;\n\t\t\treturn nf*nf*nf*nf;\n\t\t}\n\t\tvoid main() {\n\t\t\tvec2 uv = v_coord * u_scale * u_viewport + u_offset * u_scale;\n\t\t\tvec4 color = vec4( pNoise( uv, u_octaves ) * u_amplitude );\n\t\t\tgl_FragColor = color;\n\t\t}";
    e.registerNodeType("texture/perlin", LGraphTexturePerlin);
    LGraphTextureCanvas2D.title = "Canvas2D";
    LGraphTextureCanvas2D.desc =
      "Executes Canvas2D code inside a texture or the viewport.";
    LGraphTextureCanvas2D.help =
      "Set width and height to 0 to match viewport size.";
    LGraphTextureCanvas2D.default_code =
      "//vars: canvas,ctx,time\nctx.fillStyle='red';\nctx.fillRect(0,0,50,50);\n";
    LGraphTextureCanvas2D.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
      code: { type: "code" },
      width: { type: "number", precision: 0, step: 1 },
      height: { type: "number", precision: 0, step: 1 },
    };
    LGraphTextureCanvas2D.prototype.onPropertyChanged = function (t, e) {
      "code" == t && this.compileCode(e);
    };
    LGraphTextureCanvas2D.prototype.compileCode = function (t) {
      (this || _global)._func = null;
      if (e.allow_scripts)
        try {
          (this || _global)._func = new Function(
            "canvas",
            "ctx",
            "time",
            "script",
            "v",
            t
          );
          (this || _global).boxcolor = "#00FF00";
        } catch (t) {
          (this || _global).boxcolor = "#FF0000";
          console.error("Error parsing script");
          console.error(t);
        }
    };
    LGraphTextureCanvas2D.prototype.onExecute = function () {
      var t = (this || _global)._func;
      t && this.isOutputConnected(0) && this.executeDraw(t);
    };
    LGraphTextureCanvas2D.prototype.executeDraw = function (e) {
      var a = (this || _global).properties.width || gl.canvas.width;
      var o = (this || _global).properties.height || gl.canvas.height;
      var r = (this || _global)._temp_texture;
      var l = LGraphTexture.getTextureType(
        (this || _global).properties.precision
      );
      (r && r.width == a && r.height == o && r.type == l) ||
        (r = (this || _global)._temp_texture =
          new GL.Texture(a, o, {
            format: gl.RGBA,
            filter: gl.LINEAR,
            type: l,
          }));
      var n = this.getInputData(0);
      var s = (this || _global).properties;
      var u = this || _global;
      var h = (this || _global).graph.getTime();
      var p = gl;
      var _ = gl.canvas;
      if (
        (this || _global).properties.use_html_canvas ||
        !t.enableWebGLCanvas
      ) {
        if ((this || _global)._canvas) {
          _ = (this || _global)._canvas;
          p = (this || _global)._ctx;
        } else {
          _ = (this || _global)._canvas = createCanvas(a.height);
          p = (this || _global)._ctx = _.getContext("2d");
        }
        _.width = a;
        _.height = o;
      }
      if (p == gl)
        r.drawTo(function () {
          gl.start2D();
          if (s.clear) {
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
          }
          try {
            e.draw ? e.draw.call(u, _, p, h, e, n) : e.call(u, _, p, h, e, n);
            u.boxcolor = "#00FF00";
          } catch (t) {
            u.boxcolor = "#FF0000";
            console.error("Error executing script");
            console.error(t);
          }
          gl.finish2D();
        });
      else {
        s.clear && p.clearRect(0, 0, _.width, _.height);
        try {
          e.draw
            ? e.draw.call(this || _global, _, p, h, e, n)
            : e.call(this || _global, _, p, h, e, n);
          (this || _global).boxcolor = "#00FF00";
        } catch (t) {
          (this || _global).boxcolor = "#FF0000";
          console.error("Error executing script");
          console.error(t);
        }
        r.uploadImage(_);
      }
      this.setOutputData(0, r);
    };
    e.registerNodeType("texture/canvas2D", LGraphTextureCanvas2D);
    LGraphTextureMatte.title = "Matte";
    LGraphTextureMatte.desc = "Extracts background";
    LGraphTextureMatte.widgets_info = {
      key_color: { widget: "color" },
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphTextureMatte.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (
          (this || _global).properties.precision !== LGraphTexture.PASS_THROUGH
        ) {
          if (t) {
            (this || _global)._tex = LGraphTexture.getTargetTexture(
              t,
              (this || _global)._tex,
              (this || _global).properties.precision
            );
            gl.disable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
            (this || _global)._uniforms ||
              ((this || _global)._uniforms = {
                u_texture: 0,
                u_key_color: (this || _global).properties.key_color,
                u_threshold: 1,
                u_slope: 1,
              });
            var e = (this || _global)._uniforms;
            var a = Mesh.getScreenQuad();
            var o = LGraphTextureMatte._shader;
            o ||
              (o = LGraphTextureMatte._shader =
                new GL.Shader(
                  GL.Shader.SCREEN_VERTEX_SHADER,
                  LGraphTextureMatte.pixel_shader
                ));
            e.u_key_color = (this || _global).properties.key_color;
            e.u_threshold = (this || _global).properties.threshold;
            e.u_slope = (this || _global).properties.slope;
            (this || _global)._tex.drawTo(function () {
              t.bind(0);
              o.uniforms(e).draw(a);
            });
            this.setOutputData(0, (this || _global)._tex);
          }
        } else this.setOutputData(0, t);
      }
    };
    LGraphTextureMatte.pixel_shader =
      "precision highp float;\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tuniform vec3 u_key_color;\n\t\tuniform float u_threshold;\n\t\tuniform float u_slope;\n\t\t\n\t\tvoid main() {\n\t\t\tvec3 color = texture2D( u_texture, v_coord ).xyz;\n\t\t\tfloat diff = length( normalize(color) - normalize(u_key_color) );\n\t\t\tfloat edge = u_threshold * (1.0 - u_slope);\n\t\t\tfloat alpha = smoothstep( edge, u_threshold, diff);\n\t\t\tgl_FragColor = vec4( color, alpha );\n\t\t}";
    e.registerNodeType("texture/matte", LGraphTextureMatte);
    LGraphCubemapToTexture2D.title = "CubemapToTexture2D";
    LGraphCubemapToTexture2D.desc =
      "Transforms a CUBEMAP texture into a TEXTURE2D in Polar Representation";
    LGraphCubemapToTexture2D.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        if (t && t.texture_type == GL.TEXTURE_CUBE_MAP) {
          !(this || _global)._last_tex ||
            ((this || _global)._last_tex.height == t.height &&
              (this || _global)._last_tex.type == t.type) ||
            ((this || _global)._last_tex = null);
          var e = this.getInputOrProperty("yaw");
          (this || _global)._last_tex = GL.Texture.cubemapToTexture2D(
            t,
            t.height,
            (this || _global)._last_tex,
            true,
            e
          );
          this.setOutputData(0, (this || _global)._last_tex);
        }
      }
    };
    e.registerNodeType("texture/cubemapToTexture2D", LGraphCubemapToTexture2D);
  }
  function LGraphTexture() {
    this.addOutput("tex", "Texture");
    this.addOutput("name", "string");
    (this || _global).properties = { name: "", filter: true };
    (this || _global).size = [
      LGraphTexture.image_preview_size,
      LGraphTexture.image_preview_size,
    ];
  }
  function LGraphTexturePreview() {
    this.addInput("Texture", "Texture");
    (this || _global).properties = { flipY: false };
    (this || _global).size = [
      LGraphTexture.image_preview_size,
      LGraphTexture.image_preview_size,
    ];
  }
  function LGraphTextureSave() {
    this.addInput("Texture", "Texture");
    this.addOutput("tex", "Texture");
    this.addOutput("name", "string");
    (this || _global).properties = { name: "", generate_mipmaps: false };
  }
  function LGraphTextureOperation() {
    this.addInput("Texture", "Texture");
    this.addInput("TextureB", "Texture");
    this.addInput("value", "number");
    this.addOutput("Texture", "Texture");
    (this || _global).help =
      "<p>pixelcode must be vec3, uvcode must be vec2, is optional</p>\t\t<p><strong>uv:</strong> tex. coords</p><p><strong>color:</strong> texture <strong>colorB:</strong> textureB</p><p><strong>time:</strong> scene time <strong>value:</strong> input value</p><p>For multiline you must type: result = ...</p>";
    (this || _global).properties = {
      value: 1,
      pixelcode: "color + colorB * value",
      uvcode: "",
      precision: LGraphTexture.DEFAULT,
    };
    (this || _global).has_error = false;
  }
  function LGraphTextureShader() {
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      code: "",
      u_value: 1,
      u_color: [1, 1, 1, 1],
      width: 512,
      height: 512,
      precision: LGraphTexture.DEFAULT,
    };
    (this || _global).properties.code = LGraphTextureShader.pixel_shader;
    (this || _global)._uniforms = {
      u_value: 1,
      u_color: vec4.create(),
      in_texture: 0,
      texSize: vec4.create(),
      time: 0,
    };
  }
  function LGraphTextureScaleOffset() {
    this.addInput("in", "Texture");
    this.addInput("scale", "vec2");
    this.addInput("offset", "vec2");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      offset: vec2.fromValues(0, 0),
      scale: vec2.fromValues(1, 1),
      precision: LGraphTexture.DEFAULT,
    };
  }
  function LGraphTextureWarp() {
    this.addInput("in", "Texture");
    this.addInput("warp", "Texture");
    this.addInput("factor", "number");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      factor: 0.01,
      scale: [1, 1],
      offset: [0, 0],
      precision: LGraphTexture.DEFAULT,
    };
    (this || _global)._uniforms = {
      u_texture: 0,
      u_textureB: 1,
      u_factor: 1,
      u_scale: vec2.create(),
      u_offset: vec2.create(),
    };
  }
  function LGraphTextureToViewport() {
    this.addInput("Texture", "Texture");
    (this || _global).properties = {
      additive: false,
      antialiasing: false,
      filter: true,
      disable_alpha: false,
      gamma: 1,
      viewport: [0, 0, 1, 1],
    };
    (this || _global).size[0] = 130;
  }
  function LGraphTextureCopy() {
    this.addInput("Texture", "Texture");
    this.addOutput("", "Texture");
    (this || _global).properties = {
      size: 0,
      generate_mipmaps: false,
      precision: LGraphTexture.DEFAULT,
    };
  }
  function LGraphTextureDownsample() {
    this.addInput("Texture", "Texture");
    this.addOutput("", "Texture");
    (this || _global).properties = {
      iterations: 1,
      generate_mipmaps: false,
      precision: LGraphTexture.DEFAULT,
    };
  }
  function LGraphTextureResize() {
    this.addInput("Texture", "Texture");
    this.addOutput("", "Texture");
    (this || _global).properties = {
      size: [512, 512],
      generate_mipmaps: false,
      precision: LGraphTexture.DEFAULT,
    };
  }
  function LGraphTextureAverage() {
    this.addInput("Texture", "Texture");
    this.addOutput("tex", "Texture");
    this.addOutput("avg", "vec4");
    this.addOutput("lum", "number");
    (this || _global).properties = {
      use_previous_frame: true,
      high_quality: false,
    };
    (this || _global)._uniforms = { u_texture: 0, u_mipmap_offset: 0 };
    (this || _global)._luminance = new Float32Array(4);
  }
  function LGraphTextureMinMax() {
    this.addInput("Texture", "Texture");
    this.addOutput("min_t", "Texture");
    this.addOutput("max_t", "Texture");
    this.addOutput("min", "vec4");
    this.addOutput("max", "vec4");
    (this || _global).properties = { mode: "max", use_previous_frame: true };
    (this || _global)._uniforms = { u_texture: 0 };
    (this || _global)._max = new Float32Array(4);
    (this || _global)._min = new Float32Array(4);
    (this || _global)._textures_chain = [];
  }
  function LGraphTextureTemporalSmooth() {
    this.addInput("in", "Texture");
    this.addInput("factor", "Number");
    this.addOutput("out", "Texture");
    (this || _global).properties = { factor: 0.5 };
    (this || _global)._uniforms = {
      u_texture: 0,
      u_textureB: 1,
      u_factor: (this || _global).properties.factor,
    };
  }
  function LGraphTextureLinearAvgSmooth() {
    this.addInput("in", "Texture");
    this.addOutput("avg", "Texture");
    this.addOutput("array", "Texture");
    (this || _global).properties = { samples: 64, frames_interval: 1 };
    (this || _global)._uniforms = {
      u_texture: 0,
      u_textureB: 1,
      u_samples: (this || _global).properties.samples,
      u_isamples: 1 / (this || _global).properties.samples,
    };
    (this || _global).frame = 0;
  }
  function LGraphImageToTexture() {
    this.addInput("Image", "image");
    this.addOutput("", "Texture");
    (this || _global).properties = {};
  }
  function LGraphTextureLUT() {
    this.addInput("Texture", "Texture");
    this.addInput("LUT", "Texture");
    this.addInput("Intensity", "number");
    this.addOutput("", "Texture");
    (this || _global).properties = {
      enabled: true,
      intensity: 1,
      precision: LGraphTexture.DEFAULT,
      texture: null,
    };
    LGraphTextureLUT._shader ||
      (LGraphTextureLUT._shader = new GL.Shader(
        Shader.SCREEN_VERTEX_SHADER,
        LGraphTextureLUT.pixel_shader
      ));
  }
  function LGraphTextureEncode() {
    this.addInput("Texture", "Texture");
    this.addInput("Atlas", "Texture");
    this.addOutput("", "Texture");
    (this || _global).properties = {
      enabled: true,
      num_row_symbols: 4,
      symbol_size: 16,
      brightness: 1,
      colorize: false,
      filter: false,
      invert: false,
      precision: LGraphTexture.DEFAULT,
      generate_mipmaps: false,
      texture: null,
    };
    LGraphTextureEncode._shader ||
      (LGraphTextureEncode._shader = new GL.Shader(
        Shader.SCREEN_VERTEX_SHADER,
        LGraphTextureEncode.pixel_shader
      ));
    (this || _global)._uniforms = {
      u_texture: 0,
      u_textureB: 1,
      u_row_simbols: 4,
      u_simbol_size: 16,
      u_res: vec2.create(),
    };
  }
  function LGraphTextureChannels() {
    this.addInput("Texture", "Texture");
    this.addOutput("R", "Texture");
    this.addOutput("G", "Texture");
    this.addOutput("B", "Texture");
    this.addOutput("A", "Texture");
    LGraphTextureChannels._shader ||
      (LGraphTextureChannels._shader = new GL.Shader(
        Shader.SCREEN_VERTEX_SHADER,
        LGraphTextureChannels.pixel_shader
      ));
  }
  function LGraphChannelsTexture() {
    this.addInput("R", "Texture");
    this.addInput("G", "Texture");
    this.addInput("B", "Texture");
    this.addInput("A", "Texture");
    this.addOutput("Texture", "Texture");
    (this || _global).properties = {
      precision: LGraphTexture.DEFAULT,
      R: 1,
      G: 1,
      B: 1,
      A: 1,
    };
    (this || _global)._color = vec4.create();
    (this || _global)._uniforms = {
      u_textureR: 0,
      u_textureG: 1,
      u_textureB: 2,
      u_textureA: 3,
      u_color: (this || _global)._color,
    };
  }
  function LGraphTextureColor() {
    this.addOutput("Texture", "Texture");
    (this || _global)._tex_color = vec4.create();
    (this || _global).properties = {
      color: vec4.create(),
      precision: LGraphTexture.DEFAULT,
    };
  }
  function LGraphTextureGradient() {
    this.addInput("A", "color");
    this.addInput("B", "color");
    this.addOutput("Texture", "Texture");
    (this || _global).properties = {
      angle: 0,
      scale: 1,
      A: [0, 0, 0],
      B: [1, 1, 1],
      texture_size: 32,
    };
    LGraphTextureGradient._shader ||
      (LGraphTextureGradient._shader = new GL.Shader(
        Shader.SCREEN_VERTEX_SHADER,
        LGraphTextureGradient.pixel_shader
      ));
    (this || _global)._uniforms = {
      u_angle: 0,
      u_colorA: vec3.create(),
      u_colorB: vec3.create(),
    };
  }
  function LGraphTextureMix() {
    this.addInput("A", "Texture");
    this.addInput("B", "Texture");
    this.addInput("Mixer", "Texture");
    this.addOutput("Texture", "Texture");
    (this || _global).properties = {
      factor: 0.5,
      size_from_biggest: true,
      invert: false,
      precision: LGraphTexture.DEFAULT,
    };
    (this || _global)._uniforms = {
      u_textureA: 0,
      u_textureB: 1,
      u_textureMix: 2,
      u_mix: vec4.create(),
    };
  }
  function LGraphTextureEdges() {
    this.addInput("Tex.", "Texture");
    this.addOutput("Edges", "Texture");
    (this || _global).properties = {
      invert: true,
      threshold: false,
      factor: 1,
      precision: LGraphTexture.DEFAULT,
    };
    LGraphTextureEdges._shader ||
      (LGraphTextureEdges._shader = new GL.Shader(
        Shader.SCREEN_VERTEX_SHADER,
        LGraphTextureEdges.pixel_shader
      ));
  }
  function LGraphTextureDepthRange() {
    this.addInput("Texture", "Texture");
    this.addInput("Distance", "number");
    this.addInput("Range", "number");
    this.addOutput("Texture", "Texture");
    (this || _global).properties = {
      distance: 100,
      range: 50,
      only_depth: false,
      high_precision: false,
    };
    (this || _global)._uniforms = {
      u_texture: 0,
      u_distance: 100,
      u_range: 50,
      u_camera_planes: null,
    };
  }
  function LGraphTextureLinearDepth() {
    this.addInput("Texture", "Texture");
    this.addOutput("Texture", "Texture");
    (this || _global).properties = {
      precision: LGraphTexture.DEFAULT,
      invert: false,
    };
    (this || _global)._uniforms = {
      u_texture: 0,
      u_camera_planes: null,
      u_ires: vec2.create(),
    };
  }
  function LGraphTextureBlur() {
    this.addInput("Texture", "Texture");
    this.addInput("Iterations", "number");
    this.addInput("Intensity", "number");
    this.addOutput("Blurred", "Texture");
    (this || _global).properties = {
      intensity: 1,
      iterations: 1,
      preserve_aspect: false,
      scale: [1, 1],
      precision: LGraphTexture.DEFAULT,
    };
  }
  function FXGlow() {
    (this || _global).intensity = 0.5;
    (this || _global).persistence = 0.6;
    (this || _global).iterations = 8;
    (this || _global).threshold = 0.8;
    (this || _global).scale = 1;
    (this || _global).dirt_texture = null;
    (this || _global).dirt_factor = 0.5;
    (this || _global)._textures = [];
    (this || _global)._uniforms = {
      u_intensity: 1,
      u_texture: 0,
      u_glow_texture: 1,
      u_threshold: 0,
      u_texel_size: vec2.create(),
    };
  }
  function LGraphTextureGlow() {
    this.addInput("in", "Texture");
    this.addInput("dirt", "Texture");
    this.addOutput("out", "Texture");
    this.addOutput("glow", "Texture");
    (this || _global).properties = {
      enabled: true,
      intensity: 1,
      persistence: 0.99,
      iterations: 16,
      threshold: 0,
      scale: 1,
      dirt_factor: 0.5,
      precision: LGraphTexture.DEFAULT,
    };
    (this || _global).fx = new FXGlow();
  }
  function LGraphTextureKuwaharaFilter() {
    this.addInput("Texture", "Texture");
    this.addOutput("Filtered", "Texture");
    (this || _global).properties = { intensity: 1, radius: 5 };
  }
  function LGraphTextureXDoGFilter() {
    this.addInput("Texture", "Texture");
    this.addOutput("Filtered", "Texture");
    (this || _global).properties = {
      sigma: 1.4,
      k: 1.6,
      p: 21.7,
      epsilon: 79,
      phi: 0.017,
    };
  }
  function LGraphTextureWebcam() {
    this.addOutput("Webcam", "Texture");
    (this || _global).properties = { texture_name: "", facingMode: "user" };
    (this || _global).boxcolor = "black";
    (this || _global).version = 0;
  }
  function LGraphLensFX() {
    this.addInput("in", "Texture");
    this.addInput("f", "number");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      enabled: true,
      factor: 1,
      precision: LGraphTexture.LOW,
    };
    (this || _global)._uniforms = { u_texture: 0, u_factor: 1 };
  }
  function LGraphTextureFromData() {
    this.addInput("in", "");
    (this || _global).properties = {
      precision: LGraphTexture.LOW,
      width: 0,
      height: 0,
      channels: 1,
    };
    this.addOutput("out", "Texture");
  }
  function LGraphTextureCurve() {
    this.addInput("in", "Texture");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      precision: LGraphTexture.LOW,
      split_channels: false,
    };
    (this || _global)._values = new Uint8Array(1024);
    (this || _global)._values.fill(255);
    (this || _global)._curve_texture = null;
    (this || _global)._uniforms = { u_texture: 0, u_curve: 1, u_range: 1 };
    (this || _global)._must_update = true;
    (this || _global)._points = {
      RGB: [
        [0, 0],
        [1, 1],
      ],
      R: [
        [0, 0],
        [1, 1],
      ],
      G: [
        [0, 0],
        [1, 1],
      ],
      B: [
        [0, 0],
        [1, 1],
      ],
    };
    (this || _global).curve_editor = null;
    this.addWidget("toggle", "Split Channels", false, "split_channels");
    this.addWidget("combo", "Channel", "RGB", {
      values: ["RGB", "R", "G", "B"],
    });
    (this || _global).curve_offset = 68;
    (this || _global).size = [240, 160];
  }
  function LGraphExposition() {
    this.addInput("in", "Texture");
    this.addInput("exp", "number");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      exposition: 1,
      precision: LGraphTexture.LOW,
    };
    (this || _global)._uniforms = { u_texture: 0, u_exposition: 1 };
  }
  function LGraphToneMapping() {
    this.addInput("in", "Texture");
    this.addInput("avg", "number,Texture");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      enabled: true,
      scale: 1,
      gamma: 1,
      average_lum: 1,
      lum_white: 1,
      precision: LGraphTexture.LOW,
    };
    (this || _global)._uniforms = {
      u_texture: 0,
      u_lumwhite2: 1,
      u_igamma: 1,
      u_scale: 1,
      u_average_lum: 1,
    };
  }
  function LGraphTexturePerlin() {
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      width: 512,
      height: 512,
      seed: 0,
      persistence: 0.1,
      octaves: 8,
      scale: 1,
      offset: [0, 0],
      amplitude: 1,
      precision: LGraphTexture.DEFAULT,
    };
    (this || _global)._key = 0;
    (this || _global)._texture = null;
    (this || _global)._uniforms = {
      u_persistence: 0.1,
      u_seed: 0,
      u_offset: vec2.create(),
      u_scale: 1,
      u_viewport: vec2.create(),
    };
  }
  function LGraphTextureCanvas2D() {
    this.addInput("v");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      code: LGraphTextureCanvas2D.default_code,
      width: 512,
      height: 512,
      clear: true,
      precision: LGraphTexture.DEFAULT,
      use_html_canvas: false,
    };
    (this || _global)._func = null;
    (this || _global)._temp_texture = null;
    this.compileCode();
  }
  function LGraphTextureMatte() {
    this.addInput("in", "Texture");
    this.addOutput("out", "Texture");
    (this || _global).properties = {
      key_color: vec3.fromValues(0, 1, 0),
      threshold: 0.8,
      slope: 0.2,
      precision: LGraphTexture.DEFAULT,
    };
  }
  function LGraphCubemapToTexture2D() {
    this.addInput("in", "texture");
    this.addInput("yaw", "number");
    this.addOutput("out", "texture");
    (this || _global).properties = { yaw: 0 };
  }
})(exports);
(function (t) {
  if ("undefined" != typeof GL) {
    var e = t.LiteGraph;
    t.LGraphCanvas;
    var a = "#345";
    var o = (e.Shaders = {});
    o.GLSL_types = [
      "float",
      "vec2",
      "vec3",
      "vec4",
      "mat3",
      "mat4",
      "sampler2D",
      "samplerCube",
    ];
    var r = (o.GLSL_types_const = ["float", "vec2", "vec3", "vec4"]);
    var l = {
      radians: "T radians(T degrees)",
      degrees: "T degrees(T radians)",
      sin: "T sin(T angle)",
      cos: "T cos(T angle)",
      tan: "T tan(T angle)",
      asin: "T asin(T x)",
      acos: "T acos(T x)",
      atan: "T atan(T x)",
      atan2: "T atan(T x,T y)",
      pow: "T pow(T x,T y)",
      exp: "T exp(T x)",
      log: "T log(T x)",
      exp2: "T exp2(T x)",
      log2: "T log2(T x)",
      sqrt: "T sqrt(T x)",
      inversesqrt: "T inversesqrt(T x)",
      abs: "T abs(T x)",
      sign: "T sign(T x)",
      floor: "T floor(T x)",
      round: "T round(T x)",
      ceil: "T ceil(T x)",
      fract: "T fract(T x)",
      mod: "T mod(T x,T y)",
      min: "T min(T x,T y)",
      max: "T max(T x,T y)",
      clamp: "T clamp(T x,T minVal = 0.0,T maxVal = 1.0)",
      mix: "T mix(T x,T y,T a)",
      step: "T step(T edge, T edge2, T x)",
      smoothstep: "T smoothstep(T edge, T edge2, T x)",
      length: "float length(T x)",
      distance: "float distance(T p0, T p1)",
      normalize: "T normalize(T x)",
      dot: "float dot(T x,T y)",
      cross: "vec3 cross(vec3 x,vec3 y)",
      reflect: "vec3 reflect(vec3 V,vec3 N)",
      refract: "vec3 refract(vec3 V,vec3 N, float IOR)",
    };
    var n = {};
    var s = [];
    parseGLSLDescriptions();
    o.ALL_TYPES = "float,vec2,vec3,vec4";
    o.registerShaderNode = registerShaderNode;
    o.getInputLinkID = getInputLinkID;
    o.getOutputLinkID = getOutputLinkID;
    o.getShaderNodeVarName = getShaderNodeVarName;
    o.parseGLSLDescriptions = parseGLSLDescriptions;
    var u = (e.valueToGLSL = function valueToGLSL(t, e, a) {
      var o = 5;
      null != a && (o = a);
      if (!e)
        if (t.constructor === Number) e = "float";
        else {
          if (!t.length) throw "unknown type for glsl value: " + t.constructor;
          switch (t.length) {
            case 2:
              e = "vec2";
              break;
            case 3:
              e = "vec3";
              break;
            case 4:
              e = "vec4";
              break;
            case 9:
              e = "mat3";
              break;
            case 16:
              e = "mat4";
              break;
            default:
              throw "unknown type for glsl value size";
          }
        }
      switch (e) {
        case "float":
          return t.toFixed(o);
        case "vec2":
          return "vec2(" + t[0].toFixed(o) + "," + t[1].toFixed(o) + ")";
        case "color3":
        case "vec3":
          return (
            "vec3(" +
            t[0].toFixed(o) +
            "," +
            t[1].toFixed(o) +
            "," +
            t[2].toFixed(o) +
            ")"
          );
        case "color4":
        case "vec4":
          return (
            "vec4(" +
            t[0].toFixed(o) +
            "," +
            t[1].toFixed(o) +
            "," +
            t[2].toFixed(o) +
            "," +
            t[3].toFixed(o) +
            ")"
          );
        case "mat3":
          return "mat3(1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0)";
        case "mat4":
          return "mat4(1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0)";
        default:
          throw ("unknown glsl type in valueToGLSL:", e);
      }
      return "";
    });
    var h = (e.varToTypeGLSL = function varToTypeGLSL(t, e, a) {
      if (e == a) return t;
      if (null == t)
        switch (a) {
          case "float":
            return "0.0";
          case "vec2":
            return "vec2(0.0)";
          case "vec3":
            return "vec3(0.0)";
          case "vec4":
            return "vec4(0.0,0.0,0.0,1.0)";
          default:
            return null;
        }
      if (!a) throw "error: no output type specified";
      if ("float" == a)
        switch (e) {
          case "vec2":
          case "vec3":
          case "vec4":
            return t + ".x";
          default:
            return "0.0";
        }
      else if ("vec2" == a)
        switch (e) {
          case "float":
            return "vec2(" + t + ")";
          case "vec3":
          case "vec4":
            return t + ".xy";
          default:
            return "vec2(0.0)";
        }
      else if ("vec3" == a)
        switch (e) {
          case "float":
            return "vec3(" + t + ")";
          case "vec2":
            return "vec3(" + t + ",0.0)";
          case "vec4":
            return t + ".xyz";
          default:
            return "vec3(0.0)";
        }
      else if ("vec4" == a)
        switch (e) {
          case "float":
            return "vec4(" + t + ")";
          case "vec2":
            return "vec4(" + t + ",0.0,1.0)";
          case "vec3":
            return "vec4(" + t + ",1.0)";
          default:
            return "vec4(0.0,0.0,0.0,1.0)";
        }
      throw "type cannot be converted";
    });
    var _ = (e.convertVarToGLSLType = function convertVarToGLSLType(t, e, a) {
      if (e == a) return t;
      if ("float" == e) return a + "(" + t + ")";
      if ("vec2" == a) return "vec2(" + t + ".xy)";
      if ("vec3" == a) {
        if ("vec2" == e) return "vec3(" + t + ",0.0)";
        if ("vec4" == e) return "vec4(" + t + ".xyz)";
      }
      if ("vec4" == a) {
        if ("vec2" == e) return "vec4(" + t + ",0.0,0.0)";
        if ("vec3" == a) return "vec4(" + t + ",1.0)";
      }
      return null;
    });
    LGShaderContext.prototype.clear = function () {
      (this || _global)._uniforms = {};
      (this || _global)._functions = {};
      (this || _global)._codeparts = {};
      (this || _global)._uniform_value = null;
      (this || _global).extra = {};
    };
    LGShaderContext.prototype.addUniform = function (t, e, a) {
      (this || _global)._uniforms[t] = e;
      if (null != a) {
        (this || _global)._uniform_value ||
          ((this || _global)._uniform_value = {});
        (this || _global)._uniform_value[t] = a;
      }
    };
    LGShaderContext.prototype.addFunction = function (t, e) {
      (this || _global)._functions[t] = e;
    };
    LGShaderContext.prototype.addCode = function (t, e, a) {
      a = a || { "": "" };
      for (var o in a) {
        var r = o ? o + "_" + t : t;
        (this || _global)._codeparts[r]
          ? ((this || _global)._codeparts[r] += e + "\n")
          : ((this || _global)._codeparts[r] = e + "\n");
      }
    };
    LGShaderContext.prototype.computeCodeBlocks = function (t, e) {
      this.clear();
      var a = t.findNodesByType("shader::output/vertex");
      a = a && a.length ? a[0] : null;
      var o = t.findNodesByType("shader::output/fragcolor");
      o = o && o.length ? o[0] : null;
      if (!o) return null;
      t.sendEventToAllNodes("clearDestination");
      a && a.propagateDestination("vs");
      o && o.propagateDestination("fs");
      t.sendEventToAllNodes("onGetCode", this || _global);
      var r = "";
      for (var l in (this || _global)._uniforms)
        r += "uniform " + (this || _global)._uniforms[l] + " " + l + ";\n";
      if (e) for (var l in e) r += "uniform " + e[l] + " " + l + ";\n";
      var n = "";
      for (var l in (this || _global)._functions)
        n += "//" + l + "\n" + (this || _global)._functions[l] + "\n";
      var s = (this || _global)._codeparts;
      s.uniforms = r;
      s.functions = n;
      return s;
    };
    LGShaderContext.prototype.computeShaderCode = function (t) {
      var e = this.computeCodeBlocks(t);
      var a = GL.Shader.replaceCodeUsingContext(
        (this || _global).vs_template,
        e
      );
      var o = GL.Shader.replaceCodeUsingContext(
        (this || _global).fs_template,
        e
      );
      return { vs_code: a, fs_code: o };
    };
    LGShaderContext.prototype.computeShader = function (t, a) {
      var o = this.computeShaderCode(t);
      console.log(o.vs_code, o.fs_code);
      if (!e.catch_exceptions) {
        (this || _global)._shader_error = true;
        a
          ? a.updateShader(o.vs_code, o.fs_code)
          : (a = new GL.Shader(o.vs_code, o.fs_code));
        (this || _global)._shader_error = false;
        return a;
      }
      try {
        a
          ? a.updateShader(o.vs_code, o.fs_code)
          : (a = new GL.Shader(o.vs_code, o.fs_code));
        (this || _global)._shader_error = false;
        return a;
      } catch (t) {
        if (!(this || _global)._shader_error) {
          console.error(t);
          -1 != t.indexOf("Fragment shader")
            ? console.log(
                o.fs_code
                  .split("\n")
                  .map(function (t, e) {
                    return e + ".- " + t;
                  })
                  .join("\n")
              )
            : console.log(o.vs_code);
        }
        (this || _global)._shader_error = true;
        return null;
      }
      return null;
    };
    LGShaderContext.prototype.getShader = function (t) {
      if (
        (this || _global)._shader &&
        (this || _global)._shader._version == t._version
      )
        return (this || _global)._shader;
      var e = this.computeShader(t, (this || _global)._shader);
      if (!e) return null;
      (this || _global)._shader = e;
      e._version = t._version;
      return e;
    };
    LGShaderContext.prototype.fillUniforms = function (t, e) {
      if ((this || _global)._uniform_value)
        for (var a in (this || _global)._uniform_value) {
          var o = (this || _global)._uniform_value[a];
          null != o &&
            (o.constructor === Function
              ? (t[a] = o.call(this || _global, e))
              : o.constructor === GL.Texture || (t[a] = o));
        }
    };
    e.ShaderContext = e.Shaders.Context = LGShaderContext;
    LGraphShaderGraph.template =
      "\n#define FRAGMENT\nprecision highp float;\nvarying vec2 v_coord;\n{{varying}}\n{{uniforms}}\n{{functions}}\n{{fs_functions}}\nvoid main() {\n\nvec2 uv = v_coord;\nvec4 fragcolor = vec4(0.0);\nvec4 fragcolor1 = vec4(0.0);\n{{fs_code}}\ngl_FragColor = fragcolor;\n}\n\t";
    LGraphShaderGraph.widgets_info = {
      precision: { widget: "combo", values: LGraphTexture.MODE_VALUES },
    };
    LGraphShaderGraph.title = "ShaderGraph";
    LGraphShaderGraph.desc = "Builds a shader using a graph";
    LGraphShaderGraph.input_node_type = "input/uniform";
    LGraphShaderGraph.output_node_type = "output/fragcolor";
    LGraphShaderGraph.title_color = a;
    LGraphShaderGraph.prototype.onSerialize = function (t) {
      t.subgraph = (this || _global).subgraph.serialize();
    };
    LGraphShaderGraph.prototype.onConfigure = function (t) {
      (this || _global).subgraph.configure(t.subgraph);
    };
    LGraphShaderGraph.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputData(0);
        t && t.constructor != GL.Texture && (t = null);
        var e = 0 | (this || _global).properties.width;
        var a = 0 | (this || _global).properties.height;
        0 == e && (e = t ? t.width : gl.viewport_data[2]);
        0 == a && (a = t ? t.height : gl.viewport_data[3]);
        var o = LGraphTexture.getTextureType(
          (this || _global).properties.precision,
          t
        );
        var r = (this || _global)._texture;
        (r && r.width == e && r.height == a && r.type == o) ||
          (r = (this || _global)._texture =
            new GL.Texture(e, a, {
              type: o,
              format: (this || _global).alpha ? gl.RGBA : gl.RGB,
              filter: gl.LINEAR,
            }));
        var l = this.getShader((this || _global).subgraph);
        if (l) {
          var n = (this || _global)._uniforms;
          (this || _global)._context.fillUniforms(n);
          var s = 0;
          if ((this || _global).inputs)
            for (var u = 0; u < (this || _global).inputs.length; ++u) {
              var h = (this || _global).inputs[u];
              var p = this.getInputData(u);
              if ("texture" == h.type) {
                p || (p = GL.Texture.getWhiteTexture());
                p = p.bind(s++);
              }
              null != p && (n["u_" + h.name] = p);
            }
          var _ = GL.Mesh.getScreenQuad();
          gl.disable(gl.DEPTH_TEST);
          gl.disable(gl.BLEND);
          r.drawTo(function () {
            l.uniforms(n);
            l.draw(_);
          });
          this.setOutputData(0, r);
        }
      }
    };
    LGraphShaderGraph.prototype.onInputAdded = function (t) {
      var a = e.createNode("shader::input/uniform");
      a.setProperty("name", t.name);
      a.setProperty("type", t.type);
      (this || _global).subgraph.add(a);
    };
    LGraphShaderGraph.prototype.onInputRemoved = function (t, e) {
      var a = (this || _global).subgraph.findNodesByType(
        "shader::input/uniform"
      );
      for (var o = 0; o < a.length; ++o) {
        var r = a[o];
        r.properties.name == e.name && (this || _global).subgraph.remove(r);
      }
    };
    LGraphShaderGraph.prototype.computeSize = function () {
      var t = (this || _global).inputs ? (this || _global).inputs.length : 0;
      var a = (this || _global).outputs ? (this || _global).outputs.length : 0;
      return [
        200,
        Math.max(t, a) * e.NODE_SLOT_HEIGHT + e.NODE_TITLE_HEIGHT + 10,
      ];
    };
    LGraphShaderGraph.prototype.getShader = function () {
      var t = (this || _global)._context.getShader((this || _global).subgraph);
      (this || _global).boxcolor = t ? null : "red";
      return t;
    };
    LGraphShaderGraph.prototype.onDrawBackground = function (t, a, o, r) {
      if (!(this || _global).flags.collapsed) {
        var l = this.getOutputData(0);
        var n = (this || _global).inputs
          ? (this || _global).inputs.length * e.NODE_SLOT_HEIGHT
          : 0;
        l &&
          t == l.gl &&
          (this || _global).size[1] > n + e.NODE_TITLE_HEIGHT &&
          t.drawImage(
            l,
            10,
            s,
            (this || _global).size[0] - 20,
            (this || _global).size[1] - n - e.NODE_TITLE_HEIGHT
          );
        var s = (this || _global).size[1] - e.NODE_TITLE_HEIGHT + 0.5;
        var u = e.isInsideRectangle(
          r[0],
          r[1],
          (this || _global).pos[0],
          (this || _global).pos[1] + s,
          (this || _global).size[0],
          e.NODE_TITLE_HEIGHT
        );
        t.fillStyle = u ? "#555" : "#222";
        t.beginPath();
        (this || _global)._shape == e.BOX_SHAPE
          ? t.rect(0, s, (this || _global).size[0] + 1, e.NODE_TITLE_HEIGHT)
          : t.roundRect(
              0,
              s,
              (this || _global).size[0] + 1,
              e.NODE_TITLE_HEIGHT,
              0,
              8
            );
        t.fill();
        t.textAlign = "center";
        t.font = "24px Arial";
        t.fillStyle = u ? "#DDD" : "#999";
        t.fillText("+", 0.5 * (this || _global).size[0], s + 24);
      }
    };
    LGraphShaderGraph.prototype.onMouseDown = function (t, a, o) {
      var r = (this || _global).size[1] - e.NODE_TITLE_HEIGHT + 0.5;
      a[1] > r && o.showSubgraphPropertiesDialog(this || _global);
    };
    LGraphShaderGraph.prototype.onDrawSubgraphBackground = function (t) {};
    LGraphShaderGraph.prototype.getExtraMenuOptions = function (t) {
      var e = this || _global;
      var a = [
        {
          content: "Print Code",
          callback: function () {
            var t = e._context.computeShaderCode();
            console.log(t.vs_code, t.fs_code);
          },
        },
      ];
      return a;
    };
    e.registerNodeType("texture/shaderGraph", LGraphShaderGraph);
    LGraphShaderUniform.title = "Uniform";
    LGraphShaderUniform.desc = "Input data for the shader";
    LGraphShaderUniform.prototype.getTitle = function () {
      return (this || _global).properties.name &&
        (this || _global).flags.collapsed
        ? (this || _global).properties.type +
            " " +
            (this || _global).properties.name
        : "Uniform";
    };
    LGraphShaderUniform.prototype.onPropertyChanged = function (t, e) {
      (this || _global).outputs[0].name =
        (this || _global).properties.type +
        " " +
        (this || _global).properties.name;
    };
    LGraphShaderUniform.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination) {
        var e = (this || _global).properties.type;
        if (!e) {
          if (!t.onGetPropertyInfo) return;
          var a = t.onGetPropertyInfo((this || _global).property.name);
          if (!a) return;
          e = a.type;
        }
        "number" == e ? (e = "float") : "texture" == e && (e = "sampler2D");
        if (-1 != o.GLSL_types.indexOf(e)) {
          t.addUniform("u_" + (this || _global).properties.name, e);
          this.setOutputData(0, e);
        }
      }
    };
    LGraphShaderUniform.prototype.getOutputVarName = function (t) {
      return "u_" + (this || _global).properties.name;
    };
    registerShaderNode("input/uniform", LGraphShaderUniform);
    LGraphShaderAttribute.title = "Attribute";
    LGraphShaderAttribute.desc = "Input data from mesh attribute";
    LGraphShaderAttribute.prototype.getTitle = function () {
      return "att. " + (this || _global).properties.name;
    };
    LGraphShaderAttribute.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination) {
        var e = (this || _global).properties.type;
        if (e && -1 != o.GLSL_types.indexOf(e)) {
          "number" == e && (e = "float");
          "coord" != (this || _global).properties.name &&
            t.addCode(
              "varying",
              " varying " + e + " v_" + (this || _global).properties.name + ";"
            );
          this.setOutputData(0, e);
        }
      }
    };
    LGraphShaderAttribute.prototype.getOutputVarName = function (t) {
      return "v_" + (this || _global).properties.name;
    };
    registerShaderNode("input/attribute", LGraphShaderAttribute);
    LGraphShaderSampler2D.title = "Sampler2D";
    LGraphShaderSampler2D.desc = "Reads a pixel from a texture";
    LGraphShaderSampler2D.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination) {
        var e = getInputLinkID(this || _global, 0);
        var a = getShaderNodeVarName(this || _global);
        var o = "vec4 " + a + " = vec4(0.0);\n";
        if (e) {
          var r = getInputLinkID(this || _global, 1) || t.buffer_names.uvs;
          o += a + " = texture2D(" + e + "," + r + ");\n";
        }
        var l = getOutputLinkID(this || _global, 0);
        l &&
          (o +=
            "vec4 " + getOutputLinkID(this || _global, 0) + " = " + a + ";\n");
        var n = getOutputLinkID(this || _global, 1);
        n &&
          (o +=
            "vec3 " +
            getOutputLinkID(this || _global, 1) +
            " = " +
            a +
            ".xyz;\n");
        t.addCode("code", o, (this || _global).shader_destination);
        this.setOutputData(0, "vec4");
        this.setOutputData(1, "vec3");
      }
    };
    registerShaderNode("texture/sampler2D", LGraphShaderSampler2D);
    LGraphShaderConstant.title = "const";
    LGraphShaderConstant.prototype.getTitle = function () {
      return (this || _global).flags.collapsed
        ? u(
            (this || _global).properties.value,
            (this || _global).properties.type,
            2
          )
        : "Const";
    };
    LGraphShaderConstant.prototype.onPropertyChanged = function (t, e) {
      if ("type" == t) {
        if ((this || _global).outputs[0].type != e) {
          this.disconnectOutput(0);
          (this || _global).outputs[0].type = e;
        }
        (this || _global).widgets.length = 1;
        this.updateWidgets();
      }
      if ("value" == t)
        if (e.length) {
          (this || _global).widgets[1].value = e[1];
          e.length > 2 && ((this || _global).widgets[2].value = e[2]);
          e.length > 3 && ((this || _global).widgets[3].value = e[3]);
        } else (this || _global).widgets[1].value = e;
    };
    LGraphShaderConstant.prototype.updateWidgets = function (t) {
      var e = this || _global;
      t = (this || _global).properties.value;
      var a = { step: 0.01 };
      switch ((this || _global).properties.type) {
        case "float":
          (this || _global).properties.value = 0;
          this.addWidget("number", "v", 0, { step: 0.01, property: "value" });
          break;
        case "vec2":
          (this || _global).properties.value =
            t && 2 == t.length ? [t[0], t[1]] : [0, 0, 0];
          this.addWidget(
            "number",
            "x",
            (this || _global).properties.value[0],
            function (t) {
              e.properties.value[0] = t;
            },
            a
          );
          this.addWidget(
            "number",
            "y",
            (this || _global).properties.value[1],
            function (t) {
              e.properties.value[1] = t;
            },
            a
          );
          break;
        case "vec3":
          (this || _global).properties.value =
            t && 3 == t.length ? [t[0], t[1], t[2]] : [0, 0, 0];
          this.addWidget(
            "number",
            "x",
            (this || _global).properties.value[0],
            function (t) {
              e.properties.value[0] = t;
            },
            a
          );
          this.addWidget(
            "number",
            "y",
            (this || _global).properties.value[1],
            function (t) {
              e.properties.value[1] = t;
            },
            a
          );
          this.addWidget(
            "number",
            "z",
            (this || _global).properties.value[2],
            function (t) {
              e.properties.value[2] = t;
            },
            a
          );
          break;
        case "vec4":
          (this || _global).properties.value =
            t && 4 == t.length ? [t[0], t[1], t[2], t[3]] : [0, 0, 0, 0];
          this.addWidget(
            "number",
            "x",
            (this || _global).properties.value[0],
            function (t) {
              e.properties.value[0] = t;
            },
            a
          );
          this.addWidget(
            "number",
            "y",
            (this || _global).properties.value[1],
            function (t) {
              e.properties.value[1] = t;
            },
            a
          );
          this.addWidget(
            "number",
            "z",
            (this || _global).properties.value[2],
            function (t) {
              e.properties.value[2] = t;
            },
            a
          );
          this.addWidget(
            "number",
            "w",
            (this || _global).properties.value[3],
            function (t) {
              e.properties.value[3] = t;
            },
            a
          );
          break;
        default:
          console.error("unknown type for constant");
      }
    };
    LGraphShaderConstant.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination) {
        var e = u(
          (this || _global).properties.value,
          (this || _global).properties.type
        );
        var a = getOutputLinkID(this || _global, 0);
        if (a) {
          var o =
            "\t" +
            (this || _global).properties.type +
            " " +
            a +
            " = " +
            e +
            ";";
          t.addCode("code", o, (this || _global).shader_destination);
          this.setOutputData(0, (this || _global).properties.type);
        }
      }
    };
    registerShaderNode("const/const", LGraphShaderConstant);
    LGraphShaderVec2.title = "vec2";
    LGraphShaderVec2.varmodes = ["xy", "x", "y"];
    LGraphShaderVec2.prototype.onPropertyChanged = function () {
      (this || _global).graph && (this || _global).graph._version++;
    };
    LGraphShaderVec2.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination) {
        var e = (this || _global).properties;
        var a = getShaderNodeVarName(this || _global);
        var o = "\tvec2 " + a + " = " + u([e.x, e.y]) + ";\n";
        for (var l = 0; l < LGraphShaderVec2.varmodes.length; ++l) {
          var n = LGraphShaderVec2.varmodes[l];
          var s = getInputLinkID(this || _global, l);
          s && (o += "\t" + a + "." + n + " = " + s + ";\n");
        }
        for (l = 0; l < LGraphShaderVec2.varmodes.length; ++l) {
          n = LGraphShaderVec2.varmodes[l];
          var h = getOutputLinkID(this || _global, l);
          if (h) {
            var p = r[n.length - 1];
            o += "\t" + p + " " + h + " = " + a + "." + n + ";\n";
            this.setOutputData(l, p);
          }
        }
        t.addCode("code", o, (this || _global).shader_destination);
      }
    };
    registerShaderNode("const/vec2", LGraphShaderVec2);
    LGraphShaderVec3.title = "vec3";
    LGraphShaderVec3.varmodes = ["xyz", "x", "y", "z", "xy", "xz", "yz"];
    LGraphShaderVec3.prototype.onPropertyChanged = function () {
      (this || _global).graph && (this || _global).graph._version++;
    };
    LGraphShaderVec3.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination) {
        var e = (this || _global).properties;
        var a = getShaderNodeVarName(this || _global);
        var o = "vec3 " + a + " = " + u([e.x, e.y, e.z]) + ";\n";
        for (var l = 0; l < LGraphShaderVec3.varmodes.length; ++l) {
          var n = LGraphShaderVec3.varmodes[l];
          var s = getInputLinkID(this || _global, l);
          s && (o += "\t" + a + "." + n + " = " + s + ";\n");
        }
        for (l = 0; l < LGraphShaderVec3.varmodes.length; ++l) {
          n = LGraphShaderVec3.varmodes[l];
          var h = getOutputLinkID(this || _global, l);
          if (h) {
            var p = r[n.length - 1];
            o += "\t" + p + " " + h + " = " + a + "." + n + ";\n";
            this.setOutputData(l, p);
          }
        }
        t.addCode("code", o, (this || _global).shader_destination);
      }
    };
    registerShaderNode("const/vec3", LGraphShaderVec3);
    LGraphShaderVec4.title = "vec4";
    LGraphShaderVec4.varmodes = [
      "xyzw",
      "xyz",
      "x",
      "y",
      "z",
      "w",
      "xy",
      "yz",
      "zw",
    ];
    LGraphShaderVec4.prototype.onPropertyChanged = function () {
      (this || _global).graph && (this || _global).graph._version++;
    };
    LGraphShaderVec4.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination) {
        var e = (this || _global).properties;
        var a = getShaderNodeVarName(this || _global);
        var o = "vec4 " + a + " = " + u([e.x, e.y, e.z, e.w]) + ";\n";
        for (var l = 0; l < LGraphShaderVec4.varmodes.length; ++l) {
          var n = LGraphShaderVec4.varmodes[l];
          var s = getInputLinkID(this || _global, l);
          s && (o += "\t" + a + "." + n + " = " + s + ";\n");
        }
        for (l = 0; l < LGraphShaderVec4.varmodes.length; ++l) {
          n = LGraphShaderVec4.varmodes[l];
          var h = getOutputLinkID(this || _global, l);
          if (h) {
            var p = r[n.length - 1];
            o += "\t" + p + " " + h + " = " + a + "." + n + ";\n";
            this.setOutputData(l, p);
          }
        }
        t.addCode("code", o, (this || _global).shader_destination);
      }
    };
    registerShaderNode("const/vec4", LGraphShaderVec4);
    LGraphShaderFragColor.title = "FragColor";
    LGraphShaderFragColor.desc = "Pixel final color";
    LGraphShaderFragColor.prototype.onGetCode = function (t) {
      var e = getInputLinkID(this || _global, 0);
      if (e) {
        var a = this.getInputData(0);
        var o = h(e, a, "vec4");
        t.addCode("fs_code", "fragcolor = " + o + ";");
      }
    };
    registerShaderNode("output/fragcolor", LGraphShaderFragColor);
    LGraphShaderOperation.title = "Operation";
    LGraphShaderOperation.operations = ["+", "-", "*", "/"];
    LGraphShaderOperation.prototype.getTitle = function () {
      return (this || _global).flags.collapsed
        ? "A" + (this || _global).properties.operation + "B"
        : "Operation";
    };
    LGraphShaderOperation.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = [];
        for (var a = 0; a < 3; ++a)
          e.push({
            name: getInputLinkID(this || _global, a),
            type: this.getInputData(a) || "float",
          });
        var o = getOutputLinkID(this || _global, 0);
        if (o) {
          var r = e[0].type;
          var l = r;
          var n = (this || _global).properties.operation;
          var s = [];
          for (a = 0; a < 2; ++a) {
            var u = e[a].name;
            if (null == u) {
              u = null != p.value ? p.value : "(1.0)";
              e[a].type = "float";
            }
            e[a].type != r &&
              ("float" != e[a].type || ("*" != n && "/" != n)) &&
              (u = _(u, e[a].type, r));
            s.push(u);
          }
          t.addCode(
            "code",
            l + " " + o + " = " + s[0] + n + s[1] + ";",
            (this || _global).shader_destination
          );
          this.setOutputData(0, l);
        }
      }
    };
    registerShaderNode("math/operation", LGraphShaderOperation);
    LGraphShaderFunc.title = "Func";
    LGraphShaderFunc.prototype.onPropertyChanged = function (t, e) {
      (this || _global).graph && (this || _global).graph._version++;
      if ("func" == t) {
        var a = n[e];
        if (!a) return;
        for (var r = a.params.length; r < (this || _global).inputs.length; ++r)
          this.removeInput(r);
        for (r = 0; r < a.params.length; ++r) {
          var l = a.params[r];
          (this || _global).inputs[r]
            ? ((this || _global).inputs[r].name =
                l.name + (l.value ? " (" + l.value + ")" : ""))
            : this.addInput(l.name, o.ALL_TYPES);
        }
      }
    };
    LGraphShaderFunc.prototype.getTitle = function () {
      return (this || _global).flags.collapsed
        ? (this || _global).properties.func
        : "Func";
    };
    LGraphShaderFunc.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = [];
        for (var a = 0; a < 3; ++a)
          e.push({
            name: getInputLinkID(this || _global, a),
            type: this.getInputData(a) || "float",
          });
        var o = getOutputLinkID(this || _global, 0);
        if (o) {
          var r = n[(this || _global).properties.func];
          if (r) {
            var l = e[0].type;
            var s = r.return_type;
            "T" == s && (s = l);
            var u = [];
            for (a = 0; a < r.params.length; ++a) {
              var h = r.params[a];
              var p = e[a].name;
              if (null == p) {
                p = null != h.value ? h.value : "(1.0)";
                e[a].type = "float";
              }
              (("T" == h.type && e[a].type != l) ||
                ("T" != h.type && e[a].type != l)) &&
                (p = _(p, e[a].type, l));
              u.push(p);
            }
            t.addFunction(
              "round",
              "float round(float v){ return floor(v+0.5); }\nvec2 round(vec2 v){ return floor(v+vec2(0.5));}\nvec3 round(vec3 v){ return floor(v+vec3(0.5));}\nvec4 round(vec4 v){ return floor(v+vec4(0.5)); }\n"
            );
            t.addCode(
              "code",
              s + " " + o + " = " + r.func + "(" + u.join(",") + ");",
              (this || _global).shader_destination
            );
            this.setOutputData(0, s);
          }
        }
      }
    };
    registerShaderNode("math/func", LGraphShaderFunc);
    LGraphShaderSnippet.title = "Snippet";
    LGraphShaderSnippet.prototype.onPropertyChanged = function (t, e) {
      (this || _global).graph && (this || _global).graph._version++;
      if ("type" == t && (this || _global).outputs[0].type != e) {
        this.disconnectOutput(0);
        (this || _global).outputs[0].type = e;
      }
    };
    LGraphShaderSnippet.prototype.getTitle = function () {
      return (this || _global).flags.collapsed
        ? (this || _global).properties.code
        : "Snippet";
    };
    LGraphShaderSnippet.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = getInputLinkID(this || _global, 0);
        e || (e = "1.0");
        var a = getInputLinkID(this || _global, 1);
        a || (a = "1.0");
        var o = getOutputLinkID(this || _global, 0);
        if (o) {
          var r = this.getInputData(0) || "float";
          var l = this.getInputData(1) || "float";
          var n = (this || _global).properties.type;
          if ("T" == r || "T" == l) return null;
          var s = "funcSnippet" + (this || _global).id;
          var u = "\n" + n + " " + s + "( " + r + " A, " + l + " B) {\n";
          u += "\t" + n + " C = " + n + "(0.0);\n";
          u += "\t" + (this || _global).properties.code + ";\n";
          u += "\treturn C;\n}\n";
          t.addCode("functions", u, (this || _global).shader_destination);
          t.addCode(
            "code",
            n + " " + o + " = " + s + "(" + e + "," + a + ");",
            (this || _global).shader_destination
          );
          this.setOutputData(0, n);
        }
      }
    };
    registerShaderNode("utils/snippet", LGraphShaderSnippet);
    LGraphShaderRand.title = "Rand";
    LGraphShaderRand.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = getOutputLinkID(this || _global, 0);
        t.addUniform("u_rand" + (this || _global).id, "float", function () {
          return Math.random();
        });
        t.addCode(
          "code",
          "float " + e + " = u_rand" + (this || _global).id + ";",
          (this || _global).shader_destination
        );
        this.setOutputData(0, "float");
      }
    };
    registerShaderNode("input/rand", LGraphShaderRand);
    LGraphShaderNoise.NOISE_TYPES = ["noise", "rand"];
    LGraphShaderNoise.title = "noise";
    LGraphShaderNoise.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = getInputLinkID(this || _global, 0);
        var a = getOutputLinkID(this || _global, 0);
        var o = this.getInputData(0);
        if (!e) {
          o = "vec2";
          e = t.buffer_names.uvs;
        }
        t.addFunction("noise", LGraphShaderNoise.shader_functions);
        t.addUniform(
          "u_noise_scale" + (this || _global).id,
          "float",
          (this || _global).properties.scale
        );
        "float" == o
          ? t.addCode(
              "code",
              "float " +
                a +
                " = snoise( vec2(" +
                e +
                ") * u_noise_scale" +
                (this || _global).id +
                ");",
              (this || _global).shader_destination
            )
          : "vec2" == o || "vec3" == o
          ? t.addCode(
              "code",
              "float " +
                a +
                " = snoise(" +
                e +
                " * u_noise_scale" +
                (this || _global).id +
                ");",
              (this || _global).shader_destination
            )
          : "vec4" == o &&
            t.addCode(
              "code",
              "float " +
                a +
                " = snoise(" +
                e +
                ".xyz * u_noise_scale" +
                (this || _global).id +
                ");",
              (this || _global).shader_destination
            );
        this.setOutputData(0, "float");
      }
    };
    registerShaderNode("math/noise", LGraphShaderNoise);
    LGraphShaderNoise.shader_functions =
      "\nvec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }\n\nfloat snoise(vec2 v){\n  const vec4 C = vec4(0.211324865405187, 0.366025403784439,-0.577350269189626, 0.024390243902439);\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n  vec2 i1;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n  i = mod(i, 289.0);\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n  + i.x + vec3(0.0, i1.x, 1.0 ));\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\nvec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}\nvec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}\n\nfloat snoise(vec3 v){ \n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //  x0 = x0 - 0. + 0.0 * C \n  vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n  vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n  vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n// Permutations\n  i = mod(i, 289.0 ); \n  vec4 p = permute( permute( permute( \n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients\n// ( N*N points uniformly over a square, mapped onto an octahedron.)\n  float n_ = 1.0/7.0; // N=7\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );\n}\n\nvec3 hash3( vec2 p ){\n    vec3 q = vec3( dot(p,vec2(127.1,311.7)), \n\t\t\t\t   dot(p,vec2(269.5,183.3)), \n\t\t\t\t   dot(p,vec2(419.2,371.9)) );\n\treturn fract(sin(q)*43758.5453);\n}\nvec4 hash4( vec3 p ){\n    vec4 q = vec4( dot(p,vec3(127.1,311.7,257.3)), \n\t\t\t\t   dot(p,vec3(269.5,183.3,335.1)), \n\t\t\t\t   dot(p,vec3(314.5,235.1,467.3)), \n\t\t\t\t   dot(p,vec3(419.2,371.9,114.9)) );\n\treturn fract(sin(q)*43758.5453);\n}\n\nfloat iqnoise( in vec2 x, float u, float v ){\n    vec2 p = floor(x);\n    vec2 f = fract(x);\n\t\n\tfloat k = 1.0+63.0*pow(1.0-v,4.0);\n\t\n\tfloat va = 0.0;\n\tfloat wt = 0.0;\n    for( int j=-2; j<=2; j++ )\n    for( int i=-2; i<=2; i++ )\n    {\n        vec2 g = vec2( float(i),float(j) );\n\t\tvec3 o = hash3( p + g )*vec3(u,u,1.0);\n\t\tvec2 r = g - f + o.xy;\n\t\tfloat d = dot(r,r);\n\t\tfloat ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );\n\t\tva += o.z*ww;\n\t\twt += ww;\n    }\n\t\n    return va/wt;\n}\n";
    LGraphShaderTime.title = "Time";
    LGraphShaderTime.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = getOutputLinkID(this || _global, 0);
        t.addUniform("u_time" + (this || _global).id, "float", function () {
          return 0.001 * getTime();
        });
        t.addCode(
          "code",
          "float " + e + " = u_time" + (this || _global).id + ";",
          (this || _global).shader_destination
        );
        this.setOutputData(0, "float");
      }
    };
    registerShaderNode("input/time", LGraphShaderTime);
    LGraphShaderDither.title = "Dither";
    LGraphShaderDither.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = getInputLinkID(this || _global, 0);
        var a = "float";
        var o = getOutputLinkID(this || _global, 0);
        var r = this.getInputData(0);
        e = h(e, r, "float");
        t.addFunction("dither8x8", LGraphShaderDither.dither_func);
        t.addCode(
          "code",
          a + " " + o + " = dither8x8(" + e + ");",
          (this || _global).shader_destination
        );
        this.setOutputData(0, a);
      }
    };
    LGraphShaderDither.dither_values = [
      0.515625, 0.140625, 0.640625, 0.046875, 0.546875, 0.171875, 0.671875,
      0.765625, 0.265625, 0.890625, 0.390625, 0.796875, 0.296875, 0.921875,
      0.421875, 0.203125, 0.703125, 0.078125, 0.578125, 0.234375, 0.734375,
      0.109375, 0.609375, 0.953125, 0.453125, 0.828125, 0.328125, 0.984375,
      0.484375, 0.859375, 0.359375, 0.0625, 0.5625, 0.1875, 0.6875, 0.03125,
      0.53125, 0.15625, 0.65625, 0.8125, 0.3125, 0.9375, 0.4375, 0.78125,
      0.28125, 0.90625, 0.40625, 0.25, 0.75, 0.125, 0.625, 0.21875, 0.71875,
      0.09375, 0.59375, 1.0001, 0.5, 0.875, 0.375, 0.96875, 0.46875, 0.84375,
      0.34375,
    ];
    (LGraphShaderDither.dither_func =
      "\n\t\tfloat dither8x8(float brightness) {\n\t\t  vec2 position = vec2(0.0);\n\t\t  #ifdef FRAGMENT\n\t\t\tposition = gl_FragCoord.xy;\n\t\t  #endif\n\t\t  int x = int(mod(position.x, 8.0));\n\t\t  int y = int(mod(position.y, 8.0));\n\t\t  int index = x + y * 8;\n\t\t  float limit = 0.0;\n\t\t  if (x < 8) {\n\t\t\tif(index==0) limit = 0.015625;\n\t\t\t" +
      LGraphShaderDither.dither_values
        .map(function (t, e) {
          return "else if(index== " + (e + 1) + ") limit = " + t + ";";
        })
        .join("\n") +
      "\n\t\t  }\n\t\t  return brightness < limit ? 0.0 : 1.0;\n\t\t}\n"),
      registerShaderNode("math/dither", LGraphShaderDither);
    LGraphShaderRemap.title = "Remap";
    LGraphShaderRemap.prototype.onPropertyChanged = function () {
      (this || _global).graph && (this || _global).graph._version++;
    };
    LGraphShaderRemap.prototype.onConnectionsChange = function () {
      var t = this.getInputDataType(0);
      (this || _global).outputs[0].type = t || "T";
    };
    LGraphShaderRemap.prototype.onGetCode = function (t) {
      if ((this || _global).shader_destination && this.isOutputConnected(0)) {
        var e = getInputLinkID(this || _global, 0);
        var a = getOutputLinkID(this || _global, 0);
        if (e || a) {
          var o = this.getInputDataType(0);
          (this || _global).outputs[0].type = o;
          if ("T" != o)
            if (e) {
              var r = u((this || _global).properties.min_value);
              var l = u((this || _global).properties.max_value);
              var n = u((this || _global).properties.min_value2);
              var s = u((this || _global).properties.max_value2);
              t.addCode(
                "code",
                o +
                  " " +
                  a +
                  " = ( (" +
                  e +
                  " - " +
                  r +
                  ") / (" +
                  l +
                  " - " +
                  r +
                  ") ) * (" +
                  s +
                  " - " +
                  n +
                  ") + " +
                  n +
                  ";",
                (this || _global).shader_destination
              );
              this.setOutputData(0, o);
            } else
              t.addCode("code", "\t" + o + " " + a + " = " + o + "(0.0);\n");
          else console.warn("node type is T and cannot be resolved");
        }
      }
    };
    registerShaderNode("math/remap", LGraphShaderRemap);
  }
  function parseGLSLDescriptions() {
    s.length = 0;
    for (var t in l) {
      var e = l[t];
      var a = e.indexOf(" ");
      var o = e.substr(0, a);
      var r = e.indexOf("(", a);
      var u = e.substr(a, r - a).trim();
      var h = e.substr(r + 1, e.length - r - 2).split(",");
      for (var p in h) {
        var _ = h[p].split(" ").filter(function (t) {
          return t;
        });
        h[p] = { type: _[0].trim(), name: _[1].trim() };
        "=" == _[2] && (h[p].value = _[3].trim());
      }
      n[t] = { return_type: o, func: u, params: h };
      s.push(u);
    }
  }
  function registerShaderNode(t, o) {
    o.color = a;
    o.filter = "shader";
    o.prototype.clearDestination = function () {
      (this || _global).shader_destination = {};
    };
    o.prototype.propagateDestination = function propagateDestination(t) {
      (this || _global).shader_destination[t] = true;
      if ((this || _global).inputs)
        for (var e = 0; e < (this || _global).inputs.length; ++e) {
          var a = this.getInputNode(e);
          a && a.propagateDestination(t);
        }
    };
    o.prototype.onPropertyChanged ||
      (o.prototype.onPropertyChanged = function () {
        (this || _global).graph && (this || _global).graph._version++;
      });
    e.registerNodeType("shader::" + t, o);
  }
  function getShaderNodeVarName(t, e) {
    return "VAR_" + (e || "TEMP") + "_" + t.id;
  }
  function getInputLinkID(t, e) {
    if (!t.inputs) return null;
    var a = t.getInputLink(e);
    if (!a) return null;
    var o = t.graph.getNodeById(a.origin_id);
    return o
      ? o.getOutputVarName
        ? o.getOutputVarName(a.origin_slot)
        : "link_" + o.id + "_" + a.origin_slot
      : null;
  }
  function getOutputLinkID(t, e) {
    return t.isOutputConnected(e) ? "link_" + t.id + "_" + e : null;
  }
  function LGShaderContext() {
    (this || _global).vs_template = "";
    (this || _global).fs_template = "";
    (this || _global).buffer_names = { uvs: "v_coord" };
    (this || _global).extra = {};
    (this || _global)._functions = {};
    (this || _global)._uniforms = {};
    (this || _global)._codeparts = {};
    (this || _global)._uniform_value = null;
  }
  function LGraphShaderGraph() {
    (this || _global).subgraph = new e.LGraph();
    (this || _global).subgraph._subgraph_node = this || _global;
    (this || _global).subgraph._is_subgraph = true;
    (this || _global).subgraph.filter = "shader";
    this.addInput("in", "texture");
    this.addOutput("out", "texture");
    (this || _global).properties = {
      width: 0,
      height: 0,
      alpha: false,
      precision:
        "undefined" != typeof LGraphTexture ? LGraphTexture.DEFAULT : 2,
    };
    var t = (this || _global).subgraph.findNodesByType(
      "shader::input/uniform"
    )[0];
    t.pos = [200, 300];
    var a = e.createNode("shader::texture/sampler2D");
    a.pos = [400, 300];
    (this || _global).subgraph.add(a);
    var o = e.createNode("shader::output/fragcolor");
    o.pos = [600, 300];
    (this || _global).subgraph.add(o);
    t.connect(0, a);
    a.connect(0, o);
    (this || _global).size = [180, 60];
    (this || _global).redraw_on_mouse = true;
    (this || _global)._uniforms = {};
    (this || _global)._shader = null;
    (this || _global)._context = new LGShaderContext();
    (this || _global)._context.vs_template =
      "#define VERTEX\n" + GL.Shader.SCREEN_VERTEX_SHADER;
    (this || _global)._context.fs_template = LGraphShaderGraph.template;
  }
  function LGraphShaderUniform() {
    this.addOutput("out", "");
    (this || _global).properties = { name: "", type: "" };
  }
  function LGraphShaderAttribute() {
    this.addOutput("out", "vec2");
    (this || _global).properties = { name: "coord", type: "vec2" };
  }
  function LGraphShaderSampler2D() {
    this.addInput("tex", "sampler2D");
    this.addInput("uv", "vec2");
    this.addOutput("rgba", "vec4");
    this.addOutput("rgb", "vec3");
  }
  function LGraphShaderConstant() {
    this.addOutput("", "float");
    (this || _global).properties = { type: "float", value: 0 };
    this.addWidget("combo", "type", "float", null, {
      values: r,
      property: "type",
    });
    this.updateWidgets();
  }
  function LGraphShaderVec2() {
    this.addInput("xy", "vec2");
    this.addInput("x", "float");
    this.addInput("y", "float");
    this.addOutput("xy", "vec2");
    this.addOutput("x", "float");
    this.addOutput("y", "float");
    (this || _global).properties = { x: 0, y: 0 };
  }
  function LGraphShaderVec3() {
    this.addInput("xyz", "vec3");
    this.addInput("x", "float");
    this.addInput("y", "float");
    this.addInput("z", "float");
    this.addInput("xy", "vec2");
    this.addInput("xz", "vec2");
    this.addInput("yz", "vec2");
    this.addOutput("xyz", "vec3");
    this.addOutput("x", "float");
    this.addOutput("y", "float");
    this.addOutput("z", "float");
    this.addOutput("xy", "vec2");
    this.addOutput("xz", "vec2");
    this.addOutput("yz", "vec2");
    (this || _global).properties = { x: 0, y: 0, z: 0 };
  }
  function LGraphShaderVec4() {
    this.addInput("xyzw", "vec4");
    this.addInput("xyz", "vec3");
    this.addInput("x", "float");
    this.addInput("y", "float");
    this.addInput("z", "float");
    this.addInput("w", "float");
    this.addInput("xy", "vec2");
    this.addInput("yz", "vec2");
    this.addInput("zw", "vec2");
    this.addOutput("xyzw", "vec4");
    this.addOutput("xyz", "vec3");
    this.addOutput("x", "float");
    this.addOutput("y", "float");
    this.addOutput("z", "float");
    this.addOutput("xy", "vec2");
    this.addOutput("yz", "vec2");
    this.addOutput("zw", "vec2");
    (this || _global).properties = { x: 0, y: 0, z: 0, w: 0 };
  }
  function LGraphShaderFragColor() {
    this.addInput("color", o.ALL_TYPES);
    (this || _global).block_delete = true;
  }
  function LGraphShaderOperation() {
    this.addInput("A", o.ALL_TYPES);
    this.addInput("B", o.ALL_TYPES);
    this.addOutput("out", "");
    (this || _global).properties = { operation: "*" };
    this.addWidget("combo", "op.", (this || _global).properties.operation, {
      property: "operation",
      values: LGraphShaderOperation.operations,
    });
  }
  function LGraphShaderFunc() {
    this.addInput("A", o.ALL_TYPES);
    this.addInput("B", o.ALL_TYPES);
    this.addOutput("out", "");
    (this || _global).properties = { func: "floor" };
    (this || _global)._current = "floor";
    this.addWidget("combo", "func", (this || _global).properties.func, {
      property: "func",
      values: s,
    });
  }
  function LGraphShaderSnippet() {
    this.addInput("A", o.ALL_TYPES);
    this.addInput("B", o.ALL_TYPES);
    this.addOutput("C", "vec4");
    (this || _global).properties = { code: "C = A+B", type: "vec4" };
    this.addWidget("text", "code", (this || _global).properties.code, {
      property: "code",
    });
    this.addWidget("combo", "type", (this || _global).properties.type, {
      values: ["float", "vec2", "vec3", "vec4"],
      property: "type",
    });
  }
  function LGraphShaderRand() {
    this.addOutput("out", "float");
  }
  function LGraphShaderNoise() {
    this.addInput("out", o.ALL_TYPES);
    this.addInput("scale", "float");
    this.addOutput("out", "float");
    (this || _global).properties = { type: "noise", scale: 1 };
    this.addWidget("combo", "type", (this || _global).properties.type, {
      property: "type",
      values: LGraphShaderNoise.NOISE_TYPES,
    });
    this.addWidget("number", "scale", (this || _global).properties.scale, {
      property: "scale",
    });
  }
  function LGraphShaderTime() {
    this.addOutput("out", "float");
  }
  function LGraphShaderDither() {
    this.addInput("in", "T");
    this.addOutput("out", "float");
  }
  function LGraphShaderRemap() {
    this.addInput("", o.ALL_TYPES);
    this.addOutput("", "");
    (this || _global).properties = {
      min_value: 0,
      max_value: 1,
      min_value2: 0,
      max_value2: 1,
    };
    this.addWidget("number", "min", 0, { step: 0.1, property: "min_value" });
    this.addWidget("number", "max", 1, { step: 0.1, property: "max_value" });
    this.addWidget("number", "min2", 0, { step: 0.1, property: "min_value2" });
    this.addWidget("number", "max2", 1, { step: 0.1, property: "max_value2" });
  }
})(exports);
(function (t) {
  var e = t.LiteGraph;
  var a = new Float32Array(16);
  var o = new Float32Array(16);
  var r = new Float32Array(16);
  var l = new Float32Array(16);
  var n = { u_view: a, u_projection: o, u_viewprojection: r, u_model: l };
  e.LGraphRender = { onRequestCameraMatrices: null };
  function generateGeometryId() {
    return (1e5 * Math.random()) | 0;
  }
  function LGraphPoints3D() {
    this.addInput("obj", "");
    this.addInput("radius", "number");
    this.addOutput("out", "geometry");
    this.addOutput("points", "[vec3]");
    (this || _global).properties = {
      radius: 1,
      num_points: 4096,
      generate_normals: true,
      regular: false,
      mode: LGraphPoints3D.SPHERE,
      force_update: false,
    };
    (this || _global).points = new Float32Array(
      3 * (this || _global).properties.num_points
    );
    (this || _global).normals = new Float32Array(
      3 * (this || _global).properties.num_points
    );
    (this || _global).must_update = true;
    (this || _global).version = 0;
    var t = this || _global;
    this.addWidget("button", "update", null, function () {
      t.must_update = true;
    });
    (this || _global).geometry = { vertices: null, _id: generateGeometryId() };
    (this || _global)._old_obj = null;
    (this || _global)._last_radius = null;
  }
  t.LGraphPoints3D = LGraphPoints3D;
  LGraphPoints3D.RECTANGLE = 1;
  LGraphPoints3D.CIRCLE = 2;
  LGraphPoints3D.CUBE = 10;
  LGraphPoints3D.SPHERE = 11;
  LGraphPoints3D.HEMISPHERE = 12;
  LGraphPoints3D.INSIDE_SPHERE = 13;
  LGraphPoints3D.OBJECT = 20;
  LGraphPoints3D.OBJECT_UNIFORMLY = 21;
  LGraphPoints3D.OBJECT_INSIDE = 22;
  LGraphPoints3D.MODE_VALUES = {
    rectangle: LGraphPoints3D.RECTANGLE,
    circle: LGraphPoints3D.CIRCLE,
    cube: LGraphPoints3D.CUBE,
    sphere: LGraphPoints3D.SPHERE,
    hemisphere: LGraphPoints3D.HEMISPHERE,
    inside_sphere: LGraphPoints3D.INSIDE_SPHERE,
    object: LGraphPoints3D.OBJECT,
    object_uniformly: LGraphPoints3D.OBJECT_UNIFORMLY,
    object_inside: LGraphPoints3D.OBJECT_INSIDE,
  };
  LGraphPoints3D.widgets_info = {
    mode: { widget: "combo", values: LGraphPoints3D.MODE_VALUES },
  };
  LGraphPoints3D.title = "list of points";
  LGraphPoints3D.desc = "returns an array of points";
  LGraphPoints3D.prototype.onPropertyChanged = function (t, e) {
    (this || _global).must_update = true;
  };
  LGraphPoints3D.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (
      t != (this || _global)._old_obj ||
      (t && t._version != (this || _global)._old_obj_version)
    ) {
      (this || _global)._old_obj = t;
      (this || _global).must_update = true;
    }
    var e = this.getInputData(1);
    null == e && (e = (this || _global).properties.radius);
    if ((this || _global)._last_radius != e) {
      (this || _global)._last_radius = e;
      (this || _global).must_update = true;
    }
    if (
      (this || _global).must_update ||
      (this || _global).properties.force_update
    ) {
      (this || _global).must_update = false;
      this.updatePoints();
    }
    (this || _global).geometry.vertices = (this || _global).points;
    (this || _global).geometry.normals = (this || _global).normals;
    (this || _global).geometry._version = (this || _global).version;
    this.setOutputData(0, (this || _global).geometry);
  };
  LGraphPoints3D.prototype.updatePoints = function () {
    var t = 0 | (this || _global).properties.num_points;
    t < 1 && (t = 1);
    ((this || _global).points && (this || _global).points.length == 3 * t) ||
      ((this || _global).points = new Float32Array(3 * t));
    (this || _global).properties.generate_normals
      ? ((this || _global).normals &&
          (this || _global).normals.length ==
            (this || _global).points.length) ||
        ((this || _global).normals = new Float32Array(
          (this || _global).points.length
        ))
      : ((this || _global).normals = null);
    var e =
      (this || _global)._last_radius || (this || _global).properties.radius;
    var a = (this || _global).properties.mode;
    var o = this.getInputData(0);
    (this || _global)._old_obj_version = o ? o._version : null;
    (this || _global).points = LGraphPoints3D.generatePoints(
      e,
      t,
      a,
      (this || _global).points,
      (this || _global).normals,
      (this || _global).properties.regular,
      o
    );
    (this || _global).version++;
  };
  LGraphPoints3D.generatePoints = function (t, e, a, o, r, l, n) {
    var s = 3 * e;
    (o && o.length == s) || (o = new Float32Array(s));
    var u = new Float32Array(3);
    var h = new Float32Array([0, 1, 0]);
    if (l) {
      if (a == LGraphPoints3D.RECTANGLE) {
        var p = Math.floor(Math.sqrt(e));
        for (var _ = 0; _ < p; ++_)
          for (var g = 0; g < p; ++g) {
            var d = 3 * _ + 3 * g * p;
            o[d] = (_ / p - 0.5) * t * 2;
            o[d + 1] = 0;
            o[d + 2] = (g / p - 0.5) * t * 2;
          }
        o = new Float32Array(o.subarray(0, p * p * 3));
        if (r) for (_ = 0; _ < r.length; _ += 3) r.set(h, _);
      } else if (a == LGraphPoints3D.SPHERE) {
        p = Math.floor(Math.sqrt(e));
        for (_ = 0; _ < p; ++_)
          for (g = 0; g < p; ++g) {
            d = 3 * _ + 3 * g * p;
            polarToCartesian(
              u,
              (_ / p) * 2 * Math.PI,
              2 * (g / p - 0.5) * Math.PI,
              t
            );
            o[d] = u[0];
            o[d + 1] = u[1];
            o[d + 2] = u[2];
          }
        o = new Float32Array(o.subarray(0, p * p * 3));
        r && LGraphPoints3D.generateSphericalNormals(o, r);
      } else if (a == LGraphPoints3D.CIRCLE) {
        for (_ = 0; _ < s; _ += 3) {
          var c = 2 * Math.PI * (_ / s);
          o[_] = Math.cos(c) * t;
          o[_ + 1] = 0;
          o[_ + 2] = Math.sin(c) * t;
        }
        if (r) for (_ = 0; _ < r.length; _ += 3) r.set(h, _);
      }
    } else if (a == LGraphPoints3D.RECTANGLE) {
      for (_ = 0; _ < s; _ += 3) {
        o[_] = (Math.random() - 0.5) * t * 2;
        o[_ + 1] = 0;
        o[_ + 2] = (Math.random() - 0.5) * t * 2;
      }
      if (r) for (_ = 0; _ < r.length; _ += 3) r.set(h, _);
    } else if (a == LGraphPoints3D.CUBE) {
      for (_ = 0; _ < s; _ += 3) {
        o[_] = (Math.random() - 0.5) * t * 2;
        o[_ + 1] = (Math.random() - 0.5) * t * 2;
        o[_ + 2] = (Math.random() - 0.5) * t * 2;
      }
      if (r) for (_ = 0; _ < r.length; _ += 3) r.set(h, _);
    } else if (a == LGraphPoints3D.SPHERE) {
      LGraphPoints3D.generateSphere(o, s, t);
      r && LGraphPoints3D.generateSphericalNormals(o, r);
    } else if (a == LGraphPoints3D.HEMISPHERE) {
      LGraphPoints3D.generateHemisphere(o, s, t);
      r && LGraphPoints3D.generateSphericalNormals(o, r);
    } else if (a == LGraphPoints3D.CIRCLE) {
      LGraphPoints3D.generateInsideCircle(o, s, t);
      r && LGraphPoints3D.generateSphericalNormals(o, r);
    } else if (a == LGraphPoints3D.INSIDE_SPHERE) {
      LGraphPoints3D.generateInsideSphere(o, s, t);
      r && LGraphPoints3D.generateSphericalNormals(o, r);
    } else
      a == LGraphPoints3D.OBJECT
        ? LGraphPoints3D.generateFromObject(o, r, s, n, false)
        : a == LGraphPoints3D.OBJECT_UNIFORMLY
        ? LGraphPoints3D.generateFromObject(o, r, s, n, true)
        : a == LGraphPoints3D.OBJECT_INSIDE
        ? LGraphPoints3D.generateFromInsideObject(o, s, n)
        : console.warn("wrong mode in LGraphPoints3D");
    return o;
  };
  LGraphPoints3D.generateSphericalNormals = function (t, e) {
    var a = new Float32Array(3);
    for (var o = 0; o < e.length; o += 3) {
      a[0] = t[o];
      a[1] = t[o + 1];
      a[2] = t[o + 2];
      vec3.normalize(a, a);
      e.set(a, o);
    }
  };
  LGraphPoints3D.generateSphere = function (t, e, a) {
    for (var o = 0; o < e; o += 3) {
      var r = Math.random();
      var l = Math.random();
      var n = 2 * Math.cos(2 * Math.PI * r) * Math.sqrt(l * (1 - l));
      var s = 1 - 2 * l;
      var u = 2 * Math.sin(2 * Math.PI * r) * Math.sqrt(l * (1 - l));
      t[o] = n * a;
      t[o + 1] = s * a;
      t[o + 2] = u * a;
    }
  };
  LGraphPoints3D.generateHemisphere = function (t, e, a) {
    for (var o = 0; o < e; o += 3) {
      var r = Math.random();
      var l = Math.random();
      var n = Math.cos(2 * Math.PI * r) * Math.sqrt(1 - l * l);
      var s = l;
      var u = Math.sin(2 * Math.PI * r) * Math.sqrt(1 - l * l);
      t[o] = n * a;
      t[o + 1] = s * a;
      t[o + 2] = u * a;
    }
  };
  LGraphPoints3D.generateInsideCircle = function (t, e, a) {
    for (var o = 0; o < e; o += 3) {
      var r = Math.random();
      var l = Math.random();
      var n = Math.cos(2 * Math.PI * r) * Math.sqrt(1 - l * l);
      var s = Math.sin(2 * Math.PI * r) * Math.sqrt(1 - l * l);
      t[o] = n * a;
      t[o + 1] = 0;
      t[o + 2] = s * a;
    }
  };
  LGraphPoints3D.generateInsideSphere = function (t, e, a) {
    for (var o = 0; o < e; o += 3) {
      var r = Math.random();
      var l = Math.random();
      var n = 2 * r * Math.PI;
      var s = Math.acos(2 * l - 1);
      var u = Math.cbrt(Math.random()) * a;
      var h = Math.sin(n);
      var p = Math.cos(n);
      var _ = Math.sin(s);
      var g = Math.cos(s);
      t[o] = u * _ * p;
      t[o + 1] = u * _ * h;
      t[o + 2] = u * g;
    }
  };
  function findRandomTriangle(t, e) {
    var a = t.length;
    var o = 0;
    var r = 0;
    var l = a;
    if (0 == a) return -1;
    if (1 == a) return 0;
    while (l >= o) {
      r = (0.5 * (l + o)) | 0;
      var n = t[r];
      if (n == e) return r;
      if (o == l - 1) return o;
      n < e ? (o = r) : (l = r);
    }
    return r;
  }
  LGraphPoints3D.generateFromObject = function (t, e, a, o, r) {
    if (o) {
      var l = null;
      var n = null;
      var s = null;
      var u = null;
      if (o.constructor === GL.Mesh) {
        l = o.vertexBuffers.vertices.data;
        n = o.vertexBuffers.normals ? o.vertexBuffers.normals.data : null;
        s = o.indexBuffers.indices ? o.indexBuffers.indices.data : null;
        s ||
          (s = o.indexBuffers.triangles ? o.indexBuffers.triangles.data : null);
      }
      if (!l) return null;
      var h = s ? s.length / 3 : l.length / 9;
      var p = 0;
      if (r) {
        u = new Float32Array(h);
        for (var _ = 0; _ < h; ++_) {
          if (s) {
            I = 3 * s[3 * _];
            E = 3 * s[3 * _ + 1];
            D = 3 * s[3 * _ + 2];
          } else {
            I = 9 * _;
            E = 9 * _ + 3;
            D = 9 * _ + 6;
          }
          var g = l.subarray(I, I + 3);
          var d = l.subarray(E, E + 3);
          var c = l.subarray(D, D + 3);
          var b = vec3.distance(g, d);
          var f = vec3.distance(d, c);
          var m = vec3.distance(c, g);
          var L = (b + f + m) / 2;
          p += Math.sqrt(L * (L - b) * (L - f) * (L - m));
          u[_] = p;
        }
        for (_ = 0; _ < h; ++_) u[_] /= p;
      }
      for (_ = 0; _ < a; _ += 3) {
        var G = Math.random();
        var T = r ? findRandomTriangle(u, G) : Math.floor(G * h);
        var I = 0;
        var E = 0;
        var D = 0;
        if (s) {
          I = 3 * s[3 * T];
          E = 3 * s[3 * T + 1];
          D = 3 * s[3 * T + 2];
        } else {
          I = 9 * T;
          E = 9 * T + 3;
          D = 9 * T + 6;
        }
        L = Math.random();
        var S = Math.random();
        var C = Math.sqrt(L);
        var O = 1 - C;
        var N = C * (1 - S);
        var A = S * C;
        t[_] = O * l[I] + N * l[E] + A * l[D];
        t[_ + 1] = O * l[I + 1] + N * l[E + 1] + A * l[D + 1];
        t[_ + 2] = O * l[I + 2] + N * l[E + 2] + A * l[D + 2];
        if (e && n) {
          e[_] = O * n[I] + N * n[E] + A * n[D];
          e[_ + 1] = O * n[I + 1] + N * n[E + 1] + A * n[D + 1];
          e[_ + 2] = O * n[I + 2] + N * n[E + 2] + A * n[D + 2];
          var M = e.subarray(_, _ + 3);
          vec3.normalize(M, M);
        }
      }
    }
  };
  LGraphPoints3D.generateFromInsideObject = function (t, e, a) {
    if (a && a.constructor === GL.Mesh) {
      var o = a.getBoundingBox();
      a.octree || (a.octree = new GL.Octree(a));
      var r = a.octree;
      var l = vec3.create();
      var n = vec3.fromValues(1, 0, 0);
      var s = vec3.create();
      var u = 0;
      var h = 0;
      while (u < e && h < 10 * t.length) {
        h += 1;
        var p = vec3.random(s);
        p[0] = (2 * p[0] - 1) * o[3] + o[0];
        p[1] = (2 * p[1] - 1) * o[4] + o[1];
        p[2] = (2 * p[2] - 1) * o[5] + o[2];
        l.set(p);
        var _ = r.testRay(l, n, 0, 1e4, true, GL.Octree.ALL);
        if (_ && _.length % 2 != 0) {
          t.set(p, u);
          u += 3;
        }
      }
    }
  };
  e.registerNodeType("geometry/points3D", LGraphPoints3D);
  function LGraphPointsToInstances() {
    this.addInput("points", "geometry");
    this.addOutput("instances", "[mat4]");
    (this || _global).properties = { mode: 1, autoupdate: true };
    (this || _global).must_update = true;
    (this || _global).matrices = [];
    (this || _global).first_time = true;
  }
  LGraphPointsToInstances.NORMAL = 0;
  LGraphPointsToInstances.VERTICAL = 1;
  LGraphPointsToInstances.SPHERICAL = 2;
  LGraphPointsToInstances.RANDOM = 3;
  LGraphPointsToInstances.RANDOM_VERTICAL = 4;
  LGraphPointsToInstances.modes = {
    normal: 0,
    vertical: 1,
    spherical: 2,
    random: 3,
    random_vertical: 4,
  };
  LGraphPointsToInstances.widgets_info = {
    mode: { widget: "combo", values: LGraphPointsToInstances.modes },
  };
  LGraphPointsToInstances.title = "points to inst";
  LGraphPointsToInstances.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t) {
      if (this.isOutputConnected(0)) {
        var e =
          t._version != (this || _global)._version ||
          t._id != (this || _global)._geometry_id;
        if (
          (e && (this || _global).properties.autoupdate) ||
          (this || _global).first_time
        ) {
          (this || _global).first_time = false;
          this.updateInstances(t);
        }
        this.setOutputData(0, (this || _global).matrices);
      }
    } else this.setOutputData(0, null);
  };
  LGraphPointsToInstances.prototype.updateInstances = function (t) {
    var e = t.vertices;
    if (!e) return null;
    var a = t.normals;
    var o = (this || _global).matrices;
    var r = e.length / 3;
    o.length != r && (o.length = r);
    var l = mat4.create();
    var n = vec3.create();
    vec3.create();
    var s = vec3.fromValues(0, 1, 0);
    var u = vec3.fromValues(0, 0, -1);
    vec3.fromValues(1, 0, 0);
    var h = quat.create();
    var p = vec3.create();
    var _ = vec3.create();
    var g = vec3.create();
    for (var d = 0; d < e.length; d += 3) {
      var c = d / 3;
      var b = o[c];
      b || (b = o[c] = mat4.create());
      b.set(l);
      var f = e.subarray(d, d + 3);
      switch ((this || _global).properties.mode) {
        case LGraphPointsToInstances.NORMAL:
          mat4.setTranslation(b, f);
          if (a) {
            var m = a.subarray(d, d + 3);
            g.set(m);
            vec3.normalize(g, g);
            vec3.cross(_, u, g);
            vec3.normalize(_, _);
            vec3.cross(p, _, g);
            vec3.normalize(p, p);
            b.set(_, 0);
            b.set(g, 4);
            b.set(p, 8);
            mat4.setTranslation(b, f);
          }
          break;
        case LGraphPointsToInstances.VERTICAL:
          mat4.setTranslation(b, f);
          break;
        case LGraphPointsToInstances.SPHERICAL:
          p.set(f);
          vec3.normalize(p, p);
          vec3.cross(_, s, p);
          vec3.normalize(_, _);
          vec3.cross(g, p, _);
          vec3.normalize(g, g);
          b.set(_, 0);
          b.set(g, 4);
          b.set(p, 8);
          mat4.setTranslation(b, f);
          break;
        case LGraphPointsToInstances.RANDOM:
          n[0] = 2 * Math.random() - 1;
          n[1] = 2 * Math.random() - 1;
          n[2] = 2 * Math.random() - 1;
          vec3.normalize(n, n);
          quat.setAxisAngle(h, n, 2 * Math.random() * Math.PI);
          mat4.fromQuat(b, h);
          mat4.setTranslation(b, f);
          break;
        case LGraphPointsToInstances.RANDOM_VERTICAL:
          quat.setAxisAngle(h, s, 2 * Math.random() * Math.PI);
          mat4.fromQuat(b, h);
          mat4.setTranslation(b, f);
          break;
      }
    }
    (this || _global)._version = t._version;
    (this || _global)._geometry_id = t._id;
  };
  e.registerNodeType("geometry/points_to_instances", LGraphPointsToInstances);
  function LGraphGeometryTransform() {
    this.addInput("in", "geometry,[mat4]");
    this.addInput("mat4", "mat4");
    this.addOutput("out", "geometry");
    (this || _global).properties = {};
    (this || _global).geometry = {
      type: "triangles",
      vertices: null,
      _id: generateGeometryId(),
      _version: 0,
    };
    (this || _global)._last_geometry_id = -1;
    (this || _global)._last_version = -1;
    (this || _global)._last_key = "";
    (this || _global).must_update = true;
  }
  LGraphGeometryTransform.title = "Transform";
  LGraphGeometryTransform.prototype.onExecute = function () {
    var t = this.getInputData(0);
    var e = this.getInputData(1);
    if (t)
      if (t.constructor !== Array) {
        if (t.vertices && t.vertices.length) {
          var a = t;
          (this || _global).outputs[0].type = "geometry";
          if (this.isOutputConnected(0))
            if (e) {
              var o = typedArrayToArray(e).join(",");
              if (
                (this || _global).must_update ||
                a._id != (this || _global)._last_geometry_id ||
                a._version != (this || _global)._last_version ||
                o != (this || _global)._last_key
              ) {
                this.updateGeometry(a, e);
                (this || _global)._last_key = o;
                (this || _global)._last_version = a._version;
                (this || _global)._last_geometry_id = a._id;
                (this || _global).must_update = false;
              }
              this.setOutputData(0, (this || _global).geometry);
            } else this.setOutputData(0, a);
        }
      } else {
        if (0 == t.length) return;
        (this || _global).outputs[0].type = "[mat4]";
        if (!this.isOutputConnected(0)) return;
        if (!e) {
          this.setOutputData(0, t);
          return;
        }
        (this || _global)._output || ((this || _global)._output = new Array());
        (this || _global)._output.length != t.length &&
          ((this || _global)._output.length = t.length);
        for (var r = 0; r < t.length; ++r) {
          var l = (this || _global)._output[r];
          l || (l = (this || _global)._output[r] = mat4.create());
          mat4.multiply(l, t[r], e);
        }
        this.setOutputData(0, (this || _global)._output);
      }
  };
  LGraphGeometryTransform.prototype.updateGeometry = function (t, e) {
    var a = t.vertices;
    var o = (this || _global).geometry.vertices;
    (o && o.length == a.length) ||
      (o = (this || _global).geometry.vertices = new Float32Array(a.length));
    var r = vec3.create();
    for (var l = 0, n = o.length; l < n; l += 3) {
      r[0] = a[l];
      r[1] = a[l + 1];
      r[2] = a[l + 2];
      mat4.multiplyVec3(r, e, r);
      o[l] = r[0];
      o[l + 1] = r[1];
      o[l + 2] = r[2];
    }
    if (t.normals) {
      ((this || _global).geometry.normals &&
        (this || _global).geometry.normals.length == t.normals.length) ||
        ((this || _global).geometry.normals = new Float32Array(
          t.normals.length
        ));
      var s = (this || _global).geometry.normals;
      var u = mat4.invert(mat4.create(), e);
      u && mat4.transpose(u, u);
      var h = t.normals;
      for (l = 0, n = s.length; l < n; l += 3) {
        r[0] = h[l];
        r[1] = h[l + 1];
        r[2] = h[l + 2];
        mat4.multiplyVec3(r, u, r);
        s[l] = r[0];
        s[l + 1] = r[1];
        s[l + 2] = r[2];
      }
    }
    (this || _global).geometry.type = t.type;
    (this || _global).geometry._version++;
  };
  e.registerNodeType("geometry/transform", LGraphGeometryTransform);
  function LGraphGeometryPolygon() {
    this.addInput("sides", "number");
    this.addInput("radius", "number");
    this.addOutput("out", "geometry");
    (this || _global).properties = { sides: 6, radius: 1, uvs: false };
    (this || _global).geometry = {
      type: "line_loop",
      vertices: null,
      _id: generateGeometryId(),
    };
    (this || _global).geometry_id = -1;
    (this || _global).version = -1;
    (this || _global).must_update = true;
    (this || _global).last_info = { sides: -1, radius: -1 };
  }
  LGraphGeometryPolygon.title = "Polygon";
  LGraphGeometryPolygon.prototype.onExecute = function () {
    if (this.isOutputConnected(0)) {
      var t = this.getInputOrProperty("sides");
      var e = this.getInputOrProperty("radius");
      t = 0 | Math.max(3, t);
      ((this || _global).last_info.sides == t &&
        (this || _global).last_info.radius == e) ||
        this.updateGeometry(t, e);
      this.setOutputData(0, (this || _global).geometry);
    }
  };
  LGraphGeometryPolygon.prototype.updateGeometry = function (t, e) {
    var a = 3 * t;
    var o = (this || _global).geometry.vertices;
    (o && o.length == a) ||
      (o = (this || _global).geometry.vertices = new Float32Array(3 * t));
    var r = (2 * Math.PI) / t;
    var l = (this || _global).properties.uvs;
    l &&
      (_global.uvs = (this || _global).geometry.coords =
        new Float32Array(3 * t));
    for (var n = 0; n < t; ++n) {
      var s = r * -n;
      var u = Math.cos(s) * e;
      var h = 0;
      var p = Math.sin(s) * e;
      o[3 * n] = u;
      o[3 * n + 1] = h;
      o[3 * n + 2] = p;
      l;
    }
    (this || _global).geometry._id = ++(this || _global).geometry_id;
    (this || _global).geometry._version = ++(this || _global).version;
    (this || _global).last_info.sides = t;
    (this || _global).last_info.radius = e;
  };
  e.registerNodeType("geometry/polygon", LGraphGeometryPolygon);
  function LGraphGeometryExtrude() {
    this.addInput("", "geometry");
    this.addOutput("", "geometry");
    (this || _global).properties = {
      top_cap: true,
      bottom_cap: true,
      offset: [0, 100, 0],
    };
    (this || _global).version = -1;
    (this || _global)._last_geo_version = -1;
    (this || _global)._must_update = true;
  }
  LGraphGeometryExtrude.title = "extrude";
  LGraphGeometryExtrude.prototype.onPropertyChanged = function (t, e) {
    (this || _global)._must_update = true;
  };
  LGraphGeometryExtrude.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t && this.isOutputConnected(0)) {
      if (
        t.version != (this || _global)._last_geo_version ||
        (this || _global)._must_update
      ) {
        (this || _global)._geo = this.extrudeGeometry(
          t,
          (this || _global)._geo
        );
        (this || _global)._geo &&
          ((this || _global)._geo.version = (this || _global).version++);
        (this || _global)._must_update = false;
      }
      this.setOutputData(0, (this || _global)._geo);
    }
  };
  LGraphGeometryExtrude.prototype.extrudeGeometry = function (t) {
    var e = t.vertices;
    var a = e.length / 3;
    var o = vec3.create();
    var r = vec3.create();
    var l = vec3.create();
    var n = vec3.create();
    var s = new Float32Array((this || _global).properties.offset);
    if ("line_loop" == t.type) {
      var u = new Float32Array(6 * a * 3);
      var h = 0;
      for (var p = 0, _ = e.length; p < _; p += 3) {
        o[0] = e[p];
        o[1] = e[p + 1];
        o[2] = e[p + 2];
        if (p + 3 < _) {
          r[0] = e[p + 3];
          r[1] = e[p + 4];
          r[2] = e[p + 5];
        } else {
          r[0] = e[0];
          r[1] = e[1];
          r[2] = e[2];
        }
        vec3.add(l, o, s);
        vec3.add(n, r, s);
        u.set(o, h);
        h += 3;
        u.set(r, h);
        h += 3;
        u.set(l, h);
        h += 3;
        u.set(r, h);
        h += 3;
        u.set(n, h);
        h += 3;
        u.set(l, h);
        h += 3;
      }
    }
    var g = { _id: generateGeometryId(), type: "triangles", vertices: u };
    return g;
  };
  e.registerNodeType("geometry/extrude", LGraphGeometryExtrude);
  function LGraphGeometryEval() {
    this.addInput("in", "geometry");
    this.addOutput("out", "geometry");
    (this || _global).properties = {
      code: "V[1] += 0.01 * Math.sin(I + T*0.001);",
      execute_every_frame: false,
    };
    (this || _global).geometry = null;
    (this || _global).geometry_id = -1;
    (this || _global).version = -1;
    (this || _global).must_update = true;
    (this || _global).vertices = null;
    (this || _global).func = null;
  }
  LGraphGeometryEval.title = "geoeval";
  LGraphGeometryEval.desc = "eval code";
  LGraphGeometryEval.widgets_info = { code: { widget: "code" } };
  LGraphGeometryEval.prototype.onConfigure = function (t) {
    this.compileCode();
  };
  LGraphGeometryEval.prototype.compileCode = function () {
    if ((this || _global).properties.code)
      try {
        (this || _global).func = new Function(
          "V",
          "I",
          "T",
          (this || _global).properties.code
        );
        (this || _global).boxcolor = "#AFA";
        (this || _global).must_update = true;
      } catch (t) {
        (this || _global).boxcolor = "red";
      }
  };
  LGraphGeometryEval.prototype.onPropertyChanged = function (t, e) {
    if ("code" == t) {
      (this || _global).properties.code = e;
      this.compileCode();
    }
  };
  LGraphGeometryEval.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t)
      if ((this || _global).func) {
        if (
          (this || _global).geometry_id != t._id ||
          (this || _global).version != t._version ||
          (this || _global).must_update ||
          (this || _global).properties.execute_every_frame
        ) {
          (this || _global).must_update = false;
          (this || _global).geometry_id = t._id;
          (this || _global).properties.execute_every_frame
            ? (this || _global).version++
            : ((this || _global).version = t._version);
          var e = (this || _global).func;
          var a = getTime();
          (this || _global).geometry || ((this || _global).geometry = {});
          for (var o in t)
            null != t[o] &&
              (t[o].constructor == Float32Array
                ? ((this || _global).geometry[o] = new Float32Array(t[o]))
                : ((this || _global).geometry[o] = t[o]));
          (this || _global).geometry._id = t._id;
          (this || _global).properties.execute_every_frame
            ? ((this || _global).geometry._version = (this || _global).version)
            : ((this || _global).geometry._version = t._version + 1);
          var r = vec3.create();
          var l = (this || _global).vertices;
          l && (this || _global).vertices.length == t.vertices.length
            ? l.set(t.vertices)
            : (l = (this || _global).vertices = new Float32Array(t.vertices));
          for (o = 0; o < l.length; o += 3) {
            r[0] = l[o];
            r[1] = l[o + 1];
            r[2] = l[o + 2];
            e(r, o / 3, a);
            l[o] = r[0];
            l[o + 1] = r[1];
            l[o + 2] = r[2];
          }
          (this || _global).geometry.vertices = l;
        }
        this.setOutputData(0, (this || _global).geometry);
      } else this.setOutputData(0, t);
  };
  e.registerNodeType("geometry/eval", LGraphGeometryEval);
  function LGraphConnectPoints() {
    this.addInput("in", "geometry");
    this.addOutput("out", "geometry");
    (this || _global).properties = {
      min_dist: 0.4,
      max_dist: 0.5,
      max_connections: 0,
      probability: 1,
    };
    (this || _global).geometry_id = -1;
    (this || _global).version = -1;
    (this || _global).my_version = 1;
    (this || _global).must_update = true;
  }
  LGraphConnectPoints.title = "connect points";
  LGraphConnectPoints.desc = "adds indices between near points";
  LGraphConnectPoints.prototype.onPropertyChanged = function (t, e) {
    (this || _global).must_update = true;
  };
  LGraphConnectPoints.prototype.onExecute = function () {
    var t = this.getInputData(0);
    if (t) {
      if (
        (this || _global).geometry_id != t._id ||
        (this || _global).version != t._version ||
        (this || _global).must_update
      ) {
        (this || _global).must_update = false;
        (this || _global).geometry_id = t._id;
        (this || _global).version = t._version;
        (this || _global).geometry = {};
        for (var e in t) (this || _global).geometry[e] = t[e];
        (this || _global).geometry._id = generateGeometryId();
        (this || _global).geometry._version = (this || _global).my_version++;
        var a = t.vertices;
        var o = a.length;
        var r = (this || _global).properties.min_dist;
        var l = (this || _global).properties.max_dist;
        var n = (this || _global).properties.probability;
        var s = (this || _global).properties.max_connections;
        var u = [];
        for (e = 0; e < o; e += 3) {
          var h = a[e];
          var p = a[e + 1];
          var _ = a[e + 2];
          var g = 0;
          for (var d = e + 3; d < o; d += 3) {
            var c = a[d];
            var b = a[d + 1];
            var f = a[d + 2];
            var m = Math.sqrt(
              (h - c) * (h - c) + (p - b) * (p - b) + (_ - f) * (_ - f)
            );
            if (!(m > l || m < r || (n < 1 && n < Math.random()))) {
              u.push(e / 3, d / 3);
              g += 1;
              if (s && g > s) break;
            }
          }
        }
        (this || _global).geometry.indices = (this || _global).indices =
          new Uint32Array(u);
      }
      if ((this || _global).indices && (this || _global).indices.length) {
        (this || _global).geometry.indices = (this || _global).indices;
        this.setOutputData(0, (this || _global).geometry);
      } else this.setOutputData(0, null);
    }
  };
  e.registerNodeType("geometry/connectPoints", LGraphConnectPoints);
  if ("undefined" != typeof GL) {
    LGraphToGeometry.title = "to geometry";
    LGraphToGeometry.desc = "converts a mesh to geometry";
    LGraphToGeometry.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t) {
        if (t != (this || _global).last_mesh) {
          (this || _global).last_mesh = t;
          for (i in t.vertexBuffers) {
            var e = t.vertexBuffers[i];
            (this || _global).geometry[i] = e.data;
          }
          t.indexBuffers.triangles &&
            ((this || _global).geometry.indices =
              t.indexBuffers.triangles.data);
          (this || _global).geometry._id = generateGeometryId();
          (this || _global).geometry._version = 0;
        }
        this.setOutputData(0, (this || _global).geometry);
        (this || _global).geometry &&
          this.setOutputData(1, (this || _global).geometry.vertices);
      }
    };
    e.registerNodeType("geometry/toGeometry", LGraphToGeometry);
    LGraphGeometryToMesh.title = "Geo to Mesh";
    LGraphGeometryToMesh.prototype.updateMesh = function (t) {
      (this || _global).mesh || ((this || _global).mesh = new GL.Mesh());
      for (var e in t)
        if ("_" != e[0]) {
          var a = t[e];
          var o = GL.Mesh.common_buffers[e];
          if (o || "indices" == e) {
            var r = o ? o.spacing : 3;
            var l = (this || _global).mesh.vertexBuffers[e];
            if (l && l.data.length == a.length) {
              l.data.set(a);
              l.upload(GL.DYNAMIC_DRAW);
            } else
              l = new GL.Buffer(
                "indices" == e ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER,
                a,
                r,
                GL.DYNAMIC_DRAW
              );
            (this || _global).mesh.addBuffer(e, l);
          }
        }
      if (
        (this || _global).mesh.vertexBuffers.normals &&
        (this || _global).mesh.vertexBuffers.normals.data.length !=
          (this || _global).mesh.vertexBuffers.vertices.data.length
      ) {
        var n = new Float32Array([0, 1, 0]);
        var s = new Float32Array(
          (this || _global).mesh.vertexBuffers.vertices.data.length
        );
        for (e = 0; e < s.length; e += 3) s.set(n, e);
        l = new GL.Buffer(GL.ARRAY_BUFFER, s, 3);
        (this || _global).mesh.addBuffer("normals", l);
      }
      (this || _global).mesh.updateBoundingBox();
      (this || _global).geometry_id = (this || _global).mesh.id = t._id;
      (this || _global).version = (this || _global).mesh.version = t._version;
      return (this || _global).mesh;
    };
    LGraphGeometryToMesh.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if (t) {
        ((this || _global).version == t._version &&
          (this || _global).geometry_id == t._id) ||
          this.updateMesh(t);
        this.setOutputData(0, (this || _global).mesh);
      }
    };
    e.registerNodeType("geometry/toMesh", LGraphGeometryToMesh);
    LGraphRenderMesh.title = "Render Mesh";
    LGraphRenderMesh.desc = "renders a mesh flat";
    LGraphRenderMesh.PRIMITIVE_VALUES = {
      points: GL.POINTS,
      lines: GL.LINES,
      line_loop: GL.LINE_LOOP,
      line_strip: GL.LINE_STRIP,
      triangles: GL.TRIANGLES,
      triangle_fan: GL.TRIANGLE_FAN,
      triangle_strip: GL.TRIANGLE_STRIP,
    };
    LGraphRenderMesh.widgets_info = {
      primitive: { widget: "combo", values: LGraphRenderMesh.PRIMITIVE_VALUES },
      color: { widget: "color" },
    };
    LGraphRenderMesh.prototype.onExecute = function () {
      if ((this || _global).properties.enabled) {
        var t = this.getInputData(0);
        if (t)
          if (e.LGraphRender.onRequestCameraMatrices) {
            e.LGraphRender.onRequestCameraMatrices(a, o, r);
            var l = null;
            var s = this.getInputData(2);
            if (s) {
              l = gl.shaders.textured;
              l ||
                (l = gl.shaders.textured =
                  new GL.Shader(
                    LGraphRenderPoints.vertex_shader_code,
                    LGraphRenderPoints.fragment_shader_code,
                    { USE_TEXTURE: "" }
                  ));
            } else {
              l = gl.shaders.flat;
              l ||
                (l = gl.shaders.flat =
                  new GL.Shader(
                    LGraphRenderPoints.vertex_shader_code,
                    LGraphRenderPoints.fragment_shader_code
                  ));
            }
            (this || _global).color.set((this || _global).properties.color);
            (this || _global).color[3] = (this || _global).properties.opacity;
            var u = (this || _global).model_matrix;
            var h = this.getInputData(1);
            h ? u.set(h) : mat4.identity(u);
            (this || _global).uniforms.u_point_size = 1;
            var p = (this || _global).properties.primitive;
            l.uniforms(n);
            l.uniforms((this || _global).uniforms);
            (this || _global).properties.opacity >= 1
              ? gl.disable(gl.BLEND)
              : gl.enable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            if ((this || _global).properties.additive) {
              gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
              gl.depthMask(false);
            } else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            var _ = "indices";
            t.indexBuffers.triangles && (_ = "triangles");
            l.draw(t, p, _);
            gl.disable(gl.BLEND);
            gl.depthMask(true);
          } else
            console.warn(
              "cannot render geometry, LiteGraph.onRequestCameraMatrices is null, remember to fill this with a callback(view_matrix, projection_matrix,viewprojection_matrix) to use 3D rendering from the graph"
            );
      }
    };
    e.registerNodeType("geometry/render_mesh", LGraphRenderMesh);
    LGraphGeometryPrimitive.title = "Primitive";
    LGraphGeometryPrimitive.VALID = {
      CUBE: 1,
      PLANE: 2,
      CYLINDER: 3,
      SPHERE: 4,
      CIRCLE: 5,
      HEMISPHERE: 6,
      ICOSAHEDRON: 7,
      CONE: 8,
      QUAD: 9,
    };
    LGraphGeometryPrimitive.widgets_info = {
      type: { widget: "combo", values: LGraphGeometryPrimitive.VALID },
    };
    LGraphGeometryPrimitive.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var t = this.getInputOrProperty("size");
        ((this || _global).last_info.type ==
          (this || _global).properties.type &&
          (this || _global).last_info.size == t &&
          (this || _global).last_info.subdivisions ==
            (this || _global).properties.subdivisions) ||
          this.updateMesh(
            (this || _global).properties.type,
            t,
            (this || _global).properties.subdivisions
          );
        this.setOutputData(0, (this || _global)._mesh);
      }
    };
    LGraphGeometryPrimitive.prototype.updateMesh = function (t, e, a) {
      a = 0 | Math.max(0, a);
      switch (t) {
        case 1:
          (this || _global)._mesh = GL.Mesh.cube({
            size: e,
            normals: true,
            coords: true,
          });
          break;
        case 2:
          (this || _global)._mesh = GL.Mesh.plane({
            size: e,
            xz: true,
            detail: a,
            normals: true,
            coords: true,
          });
          break;
        case 3:
          (this || _global)._mesh = GL.Mesh.cylinder({
            size: e,
            subdivisions: a,
            normals: true,
            coords: true,
          });
          break;
        case 4:
          (this || _global)._mesh = GL.Mesh.sphere({
            size: e,
            long: a,
            lat: a,
            normals: true,
            coords: true,
          });
          break;
        case 5:
          (this || _global)._mesh = GL.Mesh.circle({
            size: e,
            slices: a,
            normals: true,
            coords: true,
          });
          break;
        case 6:
          (this || _global)._mesh = GL.Mesh.sphere({
            size: e,
            long: a,
            lat: a,
            normals: true,
            coords: true,
            hemi: true,
          });
          break;
        case 7:
          (this || _global)._mesh = GL.Mesh.icosahedron({
            size: e,
            subdivisions: a,
          });
          break;
        case 8:
          (this || _global)._mesh = GL.Mesh.cone({
            radius: e,
            height: e,
            subdivisions: a,
          });
          break;
        case 9:
          (this || _global)._mesh = GL.Mesh.plane({
            size: e,
            xz: false,
            detail: a,
            normals: true,
            coords: true,
          });
          break;
      }
      (this || _global).last_info.type = t;
      (this || _global).last_info.size = e;
      (this || _global).last_info.subdivisions = a;
      (this || _global)._mesh.version = (this || _global).version++;
    };
    e.registerNodeType("geometry/mesh_primitive", LGraphGeometryPrimitive);
    LGraphRenderPoints.title = "renderPoints";
    LGraphRenderPoints.desc = "render points with a texture";
    LGraphRenderPoints.widgets_info = { color: { widget: "color" } };
    LGraphRenderPoints.prototype.updateMesh = function (t) {
      (this || _global).buffer;
      if (
        (this || _global).buffer &&
        (this || _global).buffer.data &&
        (this || _global).buffer.data.length == t.vertices.length
      ) {
        (this || _global).buffer.data.set(t.vertices);
        (this || _global).buffer.upload(GL.DYNAMIC_DRAW);
      } else
        (this || _global).buffer = new GL.Buffer(
          GL.ARRAY_BUFFER,
          t.vertices,
          3,
          GL.DYNAMIC_DRAW
        );
      (this || _global).mesh || ((this || _global).mesh = new GL.Mesh());
      (this || _global).mesh.addBuffer("vertices", (this || _global).buffer);
      (this || _global).geometry_id = (this || _global).mesh.id = t._id;
      (this || _global).version = (this || _global).mesh.version = t._version;
    };
    LGraphRenderPoints.prototype.onExecute = function () {
      if ((this || _global).properties.enabled) {
        var t = this.getInputData(0);
        if (t) {
          ((this || _global).version == t._version &&
            (this || _global).geometry_id == t._id) ||
            this.updateMesh(t);
          if (e.LGraphRender.onRequestCameraMatrices) {
            e.LGraphRender.onRequestCameraMatrices(a, o, r);
            var s = null;
            var u = this.getInputData(2);
            if (u) {
              s = gl.shaders.textured_points;
              s ||
                (s = gl.shaders.textured_points =
                  new GL.Shader(
                    LGraphRenderPoints.vertex_shader_code,
                    LGraphRenderPoints.fragment_shader_code,
                    { USE_TEXTURED_POINTS: "" }
                  ));
            } else {
              s = gl.shaders.points;
              s ||
                (s = gl.shaders.points =
                  new GL.Shader(
                    LGraphRenderPoints.vertex_shader_code,
                    LGraphRenderPoints.fragment_shader_code,
                    { USE_POINTS: "" }
                  ));
            }
            (this || _global).color.set((this || _global).properties.color);
            (this || _global).color[3] = (this || _global).properties.opacity;
            var h = this.getInputData(1);
            h ? l.set(h) : mat4.identity(l);
            (this || _global).uniforms.u_point_size = (
              this || _global
            ).properties.point_size;
            (this || _global).uniforms.u_point_perspective = (this || _global)
              .properties.fixed_size
              ? 0
              : 1;
            (this || _global).uniforms.u_perspective =
              gl.viewport_data[3] * o[5];
            s.uniforms(n);
            s.uniforms((this || _global).uniforms);
            (this || _global).properties.opacity >= 1
              ? gl.disable(gl.BLEND)
              : gl.enable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            if ((this || _global).properties.additive) {
              gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
              gl.depthMask(false);
            } else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            s.draw((this || _global).mesh, GL.POINTS);
            gl.disable(gl.BLEND);
            gl.depthMask(true);
          } else
            console.warn(
              "cannot render geometry, LiteGraph.onRequestCameraMatrices is null, remember to fill this with a callback(view_matrix, projection_matrix,viewprojection_matrix) to use 3D rendering from the graph"
            );
        }
      }
    };
    e.registerNodeType("geometry/render_points", LGraphRenderPoints);
    LGraphRenderPoints.vertex_shader_code =
      "\t\tprecision mediump float;\n\t\tattribute vec3 a_vertex;\n\t\tvarying vec3 v_vertex;\n\t\tattribute vec3 a_normal;\n\t\tvarying vec3 v_normal;\n\t\t#ifdef USE_COLOR\n\t\t\tattribute vec4 a_color;\n\t\t\tvarying vec4 v_color;\n\t\t#endif\n\t\tattribute vec2 a_coord;\n\t\tvarying vec2 v_coord;\n\t\t#ifdef USE_SIZE\n\t\t\tattribute float a_extra;\n\t\t#endif\n\t\t#ifdef USE_INSTANCING\n\t\t\tattribute mat4 u_model;\n\t\t#else\n\t\t\tuniform mat4 u_model;\n\t\t#endif\n\t\tuniform mat4 u_viewprojection;\n\t\tuniform float u_point_size;\n\t\tuniform float u_perspective;\n\t\tuniform float u_point_perspective;\n\t\tfloat computePointSize(float radius, float w)\n\t\t{\n\t\t\tif(radius < 0.0)\n\t\t\t\treturn -radius;\n\t\t\treturn u_perspective * radius / w;\n\t\t}\n\t\tvoid main() {\n\t\t\tv_coord = a_coord;\n\t\t\t#ifdef USE_COLOR\n\t\t\t\tv_color = a_color;\n\t\t\t#endif\n\t\t\tv_vertex = ( u_model * vec4( a_vertex, 1.0 )).xyz;\n\t\t\tv_normal = ( u_model * vec4( a_normal, 0.0 )).xyz;\n\t\t\tgl_Position = u_viewprojection * vec4(v_vertex,1.0);\n\t\t\tgl_PointSize = u_point_size;\n\t\t\t#ifdef USE_SIZE\n\t\t\t\tgl_PointSize = a_extra;\n\t\t\t#endif\n\t\t\tif(u_point_perspective != 0.0)\n\t\t\t\tgl_PointSize = computePointSize( gl_PointSize, gl_Position.w );\n\t\t}\t";
    LGraphRenderPoints.fragment_shader_code =
      "\t\tprecision mediump float;\n\t\tuniform vec4 u_color;\n\t\t#ifdef USE_COLOR\n\t\t\tvarying vec4 v_color;\n\t\t#endif\n\t\tvarying vec2 v_coord;\n\t\tuniform sampler2D u_texture;\n\t\tvoid main() {\n\t\t\tvec4 color = u_color;\n\t\t\t#ifdef USE_TEXTURED_POINTS\n\t\t\t\tcolor *= texture2D(u_texture, gl_PointCoord.xy);\n\t\t\t#else\n\t\t\t\t#ifdef USE_TEXTURE\n\t\t\t\t  color *= texture2D(u_texture, v_coord);\n\t\t\t\t  if(color.a < 0.1)\n\t\t\t\t\tdiscard;\n\t\t\t\t#endif\n\t\t\t\t#ifdef USE_POINTS\n\t\t\t\t\tfloat dist = length( gl_PointCoord.xy - vec2(0.5) );\n\t\t\t\t\tif( dist > 0.45 )\n\t\t\t\t\t\tdiscard;\n\t\t\t\t#endif\n\t\t\t#endif\n\t\t\t#ifdef USE_COLOR\n\t\t\t\tcolor *= v_color;\n\t\t\t#endif\n\t\t\tgl_FragColor = color;\n\t\t}\t";
  }
  function LGraphToGeometry() {
    this.addInput("mesh", "mesh");
    this.addOutput("out", "geometry");
    (this || _global).geometry = {};
    (this || _global).last_mesh = null;
  }
  function LGraphGeometryToMesh() {
    this.addInput("in", "geometry");
    this.addOutput("mesh", "mesh");
    (this || _global).properties = {};
    (this || _global).version = -1;
    (this || _global).mesh = null;
  }
  function LGraphRenderMesh() {
    this.addInput("mesh", "mesh");
    this.addInput("mat4", "mat4");
    this.addInput("tex", "texture");
    (this || _global).properties = {
      enabled: true,
      primitive: GL.TRIANGLES,
      additive: false,
      color: [1, 1, 1],
      opacity: 1,
    };
    (this || _global).color = vec4.create([1, 1, 1, 1]);
    (this || _global).model_matrix = mat4.create();
    (this || _global).uniforms = {
      u_color: (this || _global).color,
      u_model: (this || _global).model_matrix,
    };
  }
  function LGraphGeometryPrimitive() {
    this.addInput("size", "number");
    this.addOutput("out", "mesh");
    (this || _global).properties = { type: 1, size: 1, subdivisions: 32 };
    (this || _global).version = (1e5 * Math.random()) | 0;
    (this || _global).last_info = { type: -1, size: -1, subdivisions: -1 };
  }
  function LGraphRenderPoints() {
    this.addInput("in", "geometry");
    this.addInput("mat4", "mat4");
    this.addInput("tex", "texture");
    (this || _global).properties = {
      enabled: true,
      point_size: 0.1,
      fixed_size: false,
      additive: true,
      color: [1, 1, 1],
      opacity: 1,
    };
    (this || _global).color = vec4.create([1, 1, 1, 1]);
    (this || _global).uniforms = {
      u_point_size: 1,
      u_perspective: 1,
      u_point_perspective: 1,
      u_color: (this || _global).color,
    };
    (this || _global).geometry_id = -1;
    (this || _global).version = -1;
    (this || _global).mesh = null;
  }
})(exports);
(function (t) {
  var e = t.LiteGraph;
  var a = t.LGraphTexture;
  if ("undefined" != typeof GL) {
    function LGraphFXLens() {
      this.addInput("Texture", "Texture");
      this.addInput("Aberration", "number");
      this.addInput("Distortion", "number");
      this.addInput("Blur", "number");
      this.addOutput("Texture", "Texture");
      (this || _global).properties = {
        aberration: 1,
        distortion: 1,
        blur: 1,
        precision: a.DEFAULT,
      };
      if (!LGraphFXLens._shader) {
        LGraphFXLens._shader = new GL.Shader(
          GL.Shader.SCREEN_VERTEX_SHADER,
          LGraphFXLens.pixel_shader
        );
        LGraphFXLens._texture = new GL.Texture(3, 1, {
          format: gl.RGB,
          wrap: gl.CLAMP_TO_EDGE,
          magFilter: gl.LINEAR,
          minFilter: gl.LINEAR,
          pixel_data: [255, 0, 0, 0, 255, 0, 0, 0, 255],
        });
      }
    }
    LGraphFXLens.title = "Lens";
    LGraphFXLens.desc = "Camera Lens distortion";
    LGraphFXLens.widgets_info = {
      precision: { widget: "combo", values: a.MODE_VALUES },
    };
    LGraphFXLens.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if ((this || _global).properties.precision !== a.PASS_THROUGH) {
        if (t) {
          (this || _global)._tex = a.getTargetTexture(
            t,
            (this || _global)._tex,
            (this || _global).properties.precision
          );
          var e = (this || _global).properties.aberration;
          if (this.isInputConnected(1)) {
            e = this.getInputData(1);
            (this || _global).properties.aberration = e;
          }
          var o = (this || _global).properties.distortion;
          if (this.isInputConnected(2)) {
            o = this.getInputData(2);
            (this || _global).properties.distortion = o;
          }
          var r = (this || _global).properties.blur;
          if (this.isInputConnected(3)) {
            r = this.getInputData(3);
            (this || _global).properties.blur = r;
          }
          gl.disable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          var l = Mesh.getScreenQuad();
          var n = LGraphFXLens._shader;
          (this || _global)._tex.drawTo(function () {
            t.bind(0);
            n.uniforms({
              u_texture: 0,
              u_aberration: e,
              u_distortion: o,
              u_blur: r,
            }).draw(l);
          });
          this.setOutputData(0, (this || _global)._tex);
        }
      } else this.setOutputData(0, t);
    };
    LGraphFXLens.pixel_shader =
      "precision highp float;\n\t\t\tprecision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform vec2 u_camera_planes;\n\t\t\tuniform float u_aberration;\n\t\t\tuniform float u_distortion;\n\t\t\tuniform float u_blur;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec2 coord = v_coord;\n\t\t\t\tfloat dist = distance(vec2(0.5), coord);\n\t\t\t\tvec2 dist_coord = coord - vec2(0.5);\n\t\t\t\tfloat percent = 1.0 + ((0.5 - dist) / 0.5) * u_distortion;\n\t\t\t\tdist_coord *= percent;\n\t\t\t\tcoord = dist_coord + vec2(0.5);\n\t\t\t\tvec4 color = texture2D(u_texture,coord, u_blur * dist);\n\t\t\t\tcolor.r = texture2D(u_texture,vec2(0.5) + dist_coord * (1.0+0.01*u_aberration), u_blur * dist ).r;\n\t\t\t\tcolor.b = texture2D(u_texture,vec2(0.5) + dist_coord * (1.0-0.01*u_aberration), u_blur * dist ).b;\n\t\t\t\tgl_FragColor = color;\n\t\t\t}\n\t\t\t";
    e.registerNodeType("fx/lens", LGraphFXLens);
    t.LGraphFXLens = LGraphFXLens;
    function LGraphFXBokeh() {
      this.addInput("Texture", "Texture");
      this.addInput("Blurred", "Texture");
      this.addInput("Mask", "Texture");
      this.addInput("Threshold", "number");
      this.addOutput("Texture", "Texture");
      (this || _global).properties = {
        shape: "",
        size: 10,
        alpha: 1,
        threshold: 1,
        high_precision: false,
      };
    }
    LGraphFXBokeh.title = "Bokeh";
    LGraphFXBokeh.desc = "applies an Bokeh effect";
    LGraphFXBokeh.widgets_info = { shape: { widget: "texture" } };
    LGraphFXBokeh.prototype.onExecute = function () {
      var t = this.getInputData(0);
      var e = this.getInputData(1);
      var o = this.getInputData(2);
      if (t && o && (this || _global).properties.shape) {
        e || (e = t);
        var r = a.getTexture((this || _global).properties.shape);
        if (r) {
          var l = (this || _global).properties.threshold;
          if (this.isInputConnected(3)) {
            l = this.getInputData(3);
            (this || _global).properties.threshold = l;
          }
          var n = gl.UNSIGNED_BYTE;
          (this || _global).properties.high_precision &&
            (n = gl.half_float_ext ? gl.HALF_FLOAT_OES : gl.FLOAT);
          ((this || _global)._temp_texture &&
            (this || _global)._temp_texture.type == n &&
            (this || _global)._temp_texture.width == t.width &&
            (this || _global)._temp_texture.height == t.height) ||
            ((this || _global)._temp_texture = new GL.Texture(
              t.width,
              t.height,
              { type: n, format: gl.RGBA, filter: gl.LINEAR }
            ));
          (this || _global).properties.size;
          var s = LGraphFXBokeh._first_shader;
          s ||
            (s = LGraphFXBokeh._first_shader =
              new GL.Shader(
                Shader.SCREEN_VERTEX_SHADER,
                LGraphFXBokeh._first_pixel_shader
              ));
          var u = LGraphFXBokeh._second_shader;
          u ||
            (u = LGraphFXBokeh._second_shader =
              new GL.Shader(
                LGraphFXBokeh._second_vertex_shader,
                LGraphFXBokeh._second_pixel_shader
              ));
          var h = (this || _global)._points_mesh;
          (h &&
            h._width == t.width &&
            h._height == t.height &&
            2 == h._spacing) ||
            (h = this.createPointsMesh(t.width, t.height, 2));
          var p = Mesh.getScreenQuad();
          var _ = (this || _global).properties.size;
          (this || _global).properties.min_light;
          var g = (this || _global).properties.alpha;
          gl.disable(gl.DEPTH_TEST);
          gl.disable(gl.BLEND);
          (this || _global)._temp_texture.drawTo(function () {
            t.bind(0);
            e.bind(1);
            o.bind(2);
            s.uniforms({
              u_texture: 0,
              u_texture_blur: 1,
              u_mask: 2,
              u_texsize: [t.width, t.height],
            }).draw(p);
          });
          (this || _global)._temp_texture.drawTo(function () {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE);
            t.bind(0);
            r.bind(3);
            u.uniforms({
              u_texture: 0,
              u_mask: 2,
              u_shape: 3,
              u_alpha: g,
              u_threshold: l,
              u_pointSize: _,
              u_itexsize: [1 / t.width, 1 / t.height],
            }).draw(h, gl.POINTS);
          });
          this.setOutputData(0, (this || _global)._temp_texture);
        }
      } else this.setOutputData(0, t);
    };
    LGraphFXBokeh.prototype.createPointsMesh = function (t, e, a) {
      var o = Math.round(t / a);
      var r = Math.round(e / a);
      var l = new Float32Array(o * r * 2);
      var n = -1;
      var s = (2 / t) * a;
      var u = (2 / e) * a;
      for (var h = 0; h < r; ++h) {
        var p = -1;
        for (var _ = 0; _ < o; ++_) {
          var g = h * o * 2 + 2 * _;
          l[g] = p;
          l[g + 1] = n;
          p += s;
        }
        n += u;
      }
      (this || _global)._points_mesh = GL.Mesh.load({ vertices2D: l });
      (this || _global)._points_mesh._width = t;
      (this || _global)._points_mesh._height = e;
      (this || _global)._points_mesh._spacing = a;
      return (this || _global)._points_mesh;
    };
    LGraphFXBokeh._first_pixel_shader =
      "precision highp float;\n\t\t\tprecision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform sampler2D u_texture_blur;\n\t\t\tuniform sampler2D u_mask;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 color = texture2D(u_texture, v_coord);\n\t\t\t\tvec4 blurred_color = texture2D(u_texture_blur, v_coord);\n\t\t\t\tfloat mask = texture2D(u_mask, v_coord).x;\n\t\t\t   gl_FragColor = mix(color, blurred_color, mask);\n\t\t\t}\n\t\t\t";
    LGraphFXBokeh._second_vertex_shader =
      "precision highp float;\n\t\t\tattribute vec2 a_vertex2D;\n\t\t\tvarying vec4 v_color;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform sampler2D u_mask;\n\t\t\tuniform vec2 u_itexsize;\n\t\t\tuniform float u_pointSize;\n\t\t\tuniform float u_threshold;\n\t\t\tvoid main() {\n\t\t\t\tvec2 coord = a_vertex2D * 0.5 + 0.5;\n\t\t\t\tv_color = texture2D( u_texture, coord );\n\t\t\t\tv_color += texture2D( u_texture, coord + vec2(u_itexsize.x, 0.0) );\n\t\t\t\tv_color += texture2D( u_texture, coord + vec2(0.0, u_itexsize.y));\n\t\t\t\tv_color += texture2D( u_texture, coord + u_itexsize);\n\t\t\t\tv_color *= 0.25;\n\t\t\t\tfloat mask = texture2D(u_mask, coord).x;\n\t\t\t\tfloat luminance = length(v_color) * mask;\n\t\t\t\t/*luminance /= (u_pointSize*u_pointSize)*0.01 */;\n\t\t\t\tluminance -= u_threshold;\n\t\t\t\tif(luminance < 0.0)\n\t\t\t\t{\n\t\t\t\t\tgl_Position.x = -100.0;\n\t\t\t\t\treturn;\n\t\t\t\t}\n\t\t\t\tgl_PointSize = u_pointSize;\n\t\t\t\tgl_Position = vec4(a_vertex2D,0.0,1.0);\n\t\t\t}\n\t\t\t";
    LGraphFXBokeh._second_pixel_shader =
      "precision highp float;\n\t\t\tvarying vec4 v_color;\n\t\t\tuniform sampler2D u_shape;\n\t\t\tuniform float u_alpha;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 color = texture2D( u_shape, gl_PointCoord );\n\t\t\t\tcolor *= v_color * u_alpha;\n\t\t\t\tgl_FragColor = color;\n\t\t\t}\n";
    e.registerNodeType("fx/bokeh", LGraphFXBokeh);
    t.LGraphFXBokeh = LGraphFXBokeh;
    function LGraphFXGeneric() {
      this.addInput("Texture", "Texture");
      this.addInput("value1", "number");
      this.addInput("value2", "number");
      this.addOutput("Texture", "Texture");
      (this || _global).properties = {
        fx: "halftone",
        value1: 1,
        value2: 1,
        precision: a.DEFAULT,
      };
    }
    LGraphFXGeneric.title = "FX";
    LGraphFXGeneric.desc = "applies an FX from a list";
    LGraphFXGeneric.widgets_info = {
      fx: {
        widget: "combo",
        values: ["halftone", "pixelate", "lowpalette", "noise", "gamma"],
      },
      precision: { widget: "combo", values: a.MODE_VALUES },
    };
    LGraphFXGeneric.shaders = {};
    LGraphFXGeneric.prototype.onExecute = function () {
      if (this.isOutputConnected(0)) {
        var e = this.getInputData(0);
        if ((this || _global).properties.precision !== a.PASS_THROUGH) {
          if (e) {
            (this || _global)._tex = a.getTargetTexture(
              e,
              (this || _global)._tex,
              (this || _global).properties.precision
            );
            var o = (this || _global).properties.value1;
            if (this.isInputConnected(1)) {
              o = this.getInputData(1);
              (this || _global).properties.value1 = o;
            }
            var r = (this || _global).properties.value2;
            if (this.isInputConnected(2)) {
              r = this.getInputData(2);
              (this || _global).properties.value2 = r;
            }
            var l = (this || _global).properties.fx;
            var n = LGraphFXGeneric.shaders[l];
            if (!n) {
              var s = LGraphFXGeneric["pixel_shader_" + l];
              if (!s) return;
              n = LGraphFXGeneric.shaders[l] = new GL.Shader(
                Shader.SCREEN_VERTEX_SHADER,
                s
              );
            }
            gl.disable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
            var u = Mesh.getScreenQuad();
            var h = t.LS ? LS.Renderer._current_camera : null;
            var p;
            p = h
              ? [
                  LS.Renderer._current_camera.near,
                  LS.Renderer._current_camera.far,
                ]
              : [1, 100];
            var _ = null;
            "noise" == l && (_ = a.getNoiseTexture());
            (this || _global)._tex.drawTo(function () {
              e.bind(0);
              "noise" == l && _.bind(1);
              n.uniforms({
                u_texture: 0,
                u_noise: 1,
                u_size: [e.width, e.height],
                u_rand: [Math.random(), Math.random()],
                u_value1: o,
                u_value2: r,
                u_camera_planes: p,
              }).draw(u);
            });
            this.setOutputData(0, (this || _global)._tex);
          }
        } else this.setOutputData(0, e);
      }
    };
    LGraphFXGeneric.pixel_shader_halftone =
      "precision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform vec2 u_camera_planes;\n\t\t\tuniform vec2 u_size;\n\t\t\tuniform float u_value1;\n\t\t\tuniform float u_value2;\n\t\t\t\n\t\t\tfloat pattern() {\n\t\t\t\tfloat s = sin(u_value1 * 3.1415), c = cos(u_value1 * 3.1415);\n\t\t\t\tvec2 tex = v_coord * u_size.xy;\n\t\t\t\tvec2 point = vec2(\n\t\t\t\t   c * tex.x - s * tex.y ,\n\t\t\t\t   s * tex.x + c * tex.y \n\t\t\t\t) * u_value2;\n\t\t\t\treturn (sin(point.x) * sin(point.y)) * 4.0;\n\t\t\t}\n\t\t\tvoid main() {\n\t\t\t\tvec4 color = texture2D(u_texture, v_coord);\n\t\t\t\tfloat average = (color.r + color.g + color.b) / 3.0;\n\t\t\t\tgl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n\t\t\t}\n";
    LGraphFXGeneric.pixel_shader_pixelate =
      "precision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform vec2 u_camera_planes;\n\t\t\tuniform vec2 u_size;\n\t\t\tuniform float u_value1;\n\t\t\tuniform float u_value2;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec2 coord = vec2( floor(v_coord.x * u_value1) / u_value1, floor(v_coord.y * u_value2) / u_value2 );\n\t\t\t\tvec4 color = texture2D(u_texture, coord);\n\t\t\t\tgl_FragColor = color;\n\t\t\t}\n";
    LGraphFXGeneric.pixel_shader_lowpalette =
      "precision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform vec2 u_camera_planes;\n\t\t\tuniform vec2 u_size;\n\t\t\tuniform float u_value1;\n\t\t\tuniform float u_value2;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 color = texture2D(u_texture, v_coord);\n\t\t\t\tgl_FragColor = floor(color * u_value1) / u_value1;\n\t\t\t}\n";
    LGraphFXGeneric.pixel_shader_noise =
      "precision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform sampler2D u_noise;\n\t\t\tuniform vec2 u_size;\n\t\t\tuniform float u_value1;\n\t\t\tuniform float u_value2;\n\t\t\tuniform vec2 u_rand;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 color = texture2D(u_texture, v_coord);\n\t\t\t\tvec3 noise = texture2D(u_noise, v_coord * vec2(u_size.x / 512.0, u_size.y / 512.0) + u_rand).xyz - vec3(0.5);\n\t\t\t\tgl_FragColor = vec4( color.xyz + noise * u_value1, color.a );\n\t\t\t}\n";
    LGraphFXGeneric.pixel_shader_gamma =
      "precision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform float u_value1;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 color = texture2D(u_texture, v_coord);\n\t\t\t\tfloat gamma = 1.0 / u_value1;\n\t\t\t\tgl_FragColor = vec4( pow( color.xyz, vec3(gamma) ), color.a );\n\t\t\t}\n";
    e.registerNodeType("fx/generic", LGraphFXGeneric);
    t.LGraphFXGeneric = LGraphFXGeneric;
    function LGraphFXVigneting() {
      this.addInput("Tex.", "Texture");
      this.addInput("intensity", "number");
      this.addOutput("Texture", "Texture");
      (this || _global).properties = {
        intensity: 1,
        invert: false,
        precision: a.DEFAULT,
      };
      LGraphFXVigneting._shader ||
        (LGraphFXVigneting._shader = new GL.Shader(
          Shader.SCREEN_VERTEX_SHADER,
          LGraphFXVigneting.pixel_shader
        ));
    }
    LGraphFXVigneting.title = "Vigneting";
    LGraphFXVigneting.desc = "Vigneting";
    LGraphFXVigneting.widgets_info = {
      precision: { widget: "combo", values: a.MODE_VALUES },
    };
    LGraphFXVigneting.prototype.onExecute = function () {
      var t = this.getInputData(0);
      if ((this || _global).properties.precision !== a.PASS_THROUGH) {
        if (t) {
          (this || _global)._tex = a.getTargetTexture(
            t,
            (this || _global)._tex,
            (this || _global).properties.precision
          );
          var e = (this || _global).properties.intensity;
          if (this.isInputConnected(1)) {
            e = this.getInputData(1);
            (this || _global).properties.intensity = e;
          }
          gl.disable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          var o = Mesh.getScreenQuad();
          var r = LGraphFXVigneting._shader;
          var l = (this || _global).properties.invert;
          (this || _global)._tex.drawTo(function () {
            t.bind(0);
            r.uniforms({
              u_texture: 0,
              u_intensity: e,
              u_isize: [1 / t.width, 1 / t.height],
              u_invert: l ? 1 : 0,
            }).draw(o);
          });
          this.setOutputData(0, (this || _global)._tex);
        }
      } else this.setOutputData(0, t);
    };
    LGraphFXVigneting.pixel_shader =
      "precision highp float;\n\t\t\tprecision highp float;\n\t\t\tvarying vec2 v_coord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tuniform float u_intensity;\n\t\t\tuniform int u_invert;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tfloat luminance = 1.0 - length( v_coord - vec2(0.5) ) * 1.414;\n\t\t\t\tvec4 color = texture2D(u_texture, v_coord);\n\t\t\t\tif(u_invert == 1)\n\t\t\t\t\tluminance = 1.0 - luminance;\n\t\t\t\tluminance = mix(1.0, luminance, u_intensity);\n\t\t\t   gl_FragColor = vec4( luminance * color.xyz, color.a);\n\t\t\t}\n\t\t\t";
    e.registerNodeType("fx/vigneting", LGraphFXVigneting);
    t.LGraphFXVigneting = LGraphFXVigneting;
  }
})(exports);
(function (t) {
  var e = t.LiteGraph;
  var a = "#243";
  function MIDIEvent(t) {
    (this || _global).channel = 0;
    (this || _global).cmd = 0;
    (this || _global).data = new Uint32Array(3);
    t && this.setup(t);
  }
  e.MIDIEvent = MIDIEvent;
  MIDIEvent.prototype.fromJSON = function (t) {
    this.setup(t.data);
  };
  MIDIEvent.prototype.setup = function (t) {
    var e = t;
    t.constructor === Object && (e = t.data);
    (this || _global).data.set(e);
    var a = e[0];
    (this || _global).status = a;
    var o = 240 & a;
    (this || _global).cmd = a >= 240 ? a : o;
    (this || _global).cmd == MIDIEvent.NOTEON &&
      0 == (this || _global).velocity &&
      ((this || _global).cmd = MIDIEvent.NOTEOFF);
    (this || _global).cmd_str = MIDIEvent.commands[(this || _global).cmd] || "";
    (o >= MIDIEvent.NOTEON || o <= MIDIEvent.NOTEOFF) &&
      ((this || _global).channel = 15 & a);
  };
  Object.defineProperty(MIDIEvent.prototype, "velocity", {
    get: function () {
      return (this || _global).cmd == MIDIEvent.NOTEON
        ? (this || _global).data[2]
        : -1;
    },
    set: function (t) {
      (this || _global).data[2] = t;
    },
    enumerable: true,
  });
  MIDIEvent.notes = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
  ];
  MIDIEvent.note_to_index = {
    A: 0,
    "A#": 1,
    B: 2,
    C: 3,
    "C#": 4,
    D: 5,
    "D#": 6,
    E: 7,
    F: 8,
    "F#": 9,
    G: 10,
    "G#": 11,
  };
  Object.defineProperty(MIDIEvent.prototype, "note", {
    get: function () {
      return (this || _global).cmd != MIDIEvent.NOTEON
        ? -1
        : MIDIEvent.toNoteString((this || _global).data[1], true);
    },
    set: function (t) {
      throw "notes cannot be assigned this way, must modify the data[1]";
    },
    enumerable: true,
  });
  Object.defineProperty(MIDIEvent.prototype, "octave", {
    get: function () {
      if ((this || _global).cmd != MIDIEvent.NOTEON) return -1;
      var t = (this || _global).data[1] - 24;
      return Math.floor(t / 12 + 1);
    },
    set: function (t) {
      throw "octave cannot be assigned this way, must modify the data[1]";
    },
    enumerable: true,
  });
  MIDIEvent.prototype.getPitch = function () {
    return 440 * Math.pow(2, ((this || _global).data[1] - 69) / 12);
  };
  MIDIEvent.computePitch = function (t) {
    return 440 * Math.pow(2, (t - 69) / 12);
  };
  MIDIEvent.prototype.getCC = function () {
    return (this || _global).data[1];
  };
  MIDIEvent.prototype.getCCValue = function () {
    return (this || _global).data[2];
  };
  MIDIEvent.prototype.getPitchBend = function () {
    return (this || _global).data[1] + ((this || _global).data[2] << 7) - 8192;
  };
  MIDIEvent.computePitchBend = function (t, e) {
    return t + (e << 7) - 8192;
  };
  MIDIEvent.prototype.setCommandFromString = function (t) {
    (this || _global).cmd = MIDIEvent.computeCommandFromString(t);
  };
  MIDIEvent.computeCommandFromString = function (t) {
    if (!t) return 0;
    if (t && t.constructor === Number) return t;
    t = t.toUpperCase();
    switch (t) {
      case "NOTE ON":
      case "NOTEON":
        return MIDIEvent.NOTEON;
      case "NOTE OFF":
      case "NOTEOFF":
        return MIDIEvent.NOTEON;
      case "KEY PRESSURE":
      case "KEYPRESSURE":
        return MIDIEvent.KEYPRESSURE;
      case "CONTROLLER CHANGE":
      case "CONTROLLERCHANGE":
      case "CC":
        return MIDIEvent.CONTROLLERCHANGE;
      case "PROGRAM CHANGE":
      case "PROGRAMCHANGE":
      case "PC":
        return MIDIEvent.PROGRAMCHANGE;
      case "CHANNEL PRESSURE":
      case "CHANNELPRESSURE":
        return MIDIEvent.CHANNELPRESSURE;
      case "PITCH BEND":
      case "PITCHBEND":
        return MIDIEvent.PITCHBEND;
      case "TIME TICK":
      case "TIMETICK":
        return MIDIEvent.TIMETICK;
      default:
        return Number(t);
    }
  };
  MIDIEvent.toNoteString = function (t, e) {
    t = Math.round(t);
    var a = t - 21;
    var o = Math.floor((t - 24) / 12 + 1);
    a %= 12;
    a < 0 && (a = 12 + a);
    return MIDIEvent.notes[a] + (e ? "" : o);
  };
  MIDIEvent.NoteStringToPitch = function (t) {
    t = t.toUpperCase();
    var e = t[0];
    var a = 4;
    if ("#" == t[1]) {
      e += "#";
      t.length > 2 && (a = Number(t[2]));
    } else t.length > 1 && (a = Number(t[1]));
    var o = MIDIEvent.note_to_index[e];
    return null == o ? null : 12 * (a - 1) + o + 21;
  };
  MIDIEvent.prototype.toString = function () {
    var t = (this || _global).channel + ". ";
    switch ((this || _global).cmd) {
      case MIDIEvent.NOTEON:
        t += "NOTEON " + MIDIEvent.toNoteString((this || _global).data[1]);
        break;
      case MIDIEvent.NOTEOFF:
        t += "NOTEOFF " + MIDIEvent.toNoteString((this || _global).data[1]);
        break;
      case MIDIEvent.CONTROLLERCHANGE:
        t +=
          "CC " + (this || _global).data[1] + " " + (this || _global).data[2];
        break;
      case MIDIEvent.PROGRAMCHANGE:
        t += "PC " + (this || _global).data[1];
        break;
      case MIDIEvent.PITCHBEND:
        t += "PITCHBEND " + this.getPitchBend();
        break;
      case MIDIEvent.KEYPRESSURE:
        t += "KEYPRESS " + (this || _global).data[1];
        break;
    }
    return t;
  };
  MIDIEvent.prototype.toHexString = function () {
    var t = "";
    for (var e = 0; e < (this || _global).data.length; e++)
      t += (this || _global).data[e].toString(16) + " ";
  };
  MIDIEvent.prototype.toJSON = function () {
    return {
      data: [
        (this || _global).data[0],
        (this || _global).data[1],
        (this || _global).data[2],
      ],
      object_class: "MIDIEvent",
    };
  };
  MIDIEvent.NOTEOFF = 128;
  MIDIEvent.NOTEON = 144;
  MIDIEvent.KEYPRESSURE = 160;
  MIDIEvent.CONTROLLERCHANGE = 176;
  MIDIEvent.PROGRAMCHANGE = 192;
  MIDIEvent.CHANNELPRESSURE = 208;
  MIDIEvent.PITCHBEND = 224;
  MIDIEvent.TIMETICK = 248;
  MIDIEvent.commands = {
    128: "note off",
    144: "note on",
    160: "key pressure",
    176: "controller change",
    192: "program change",
    208: "channel pressure",
    224: "pitch bend",
    240: "system",
    242: "Song pos",
    243: "Song select",
    246: "Tune request",
    248: "time tick",
    250: "Start Song",
    251: "Continue Song",
    252: "Stop Song",
    254: "Sensing",
    255: "Reset",
  };
  MIDIEvent.commands_short = {
    128: "NOTEOFF",
    144: "NOTEOFF",
    160: "KEYP",
    176: "CC",
    192: "PC",
    208: "CP",
    224: "PB",
    240: "SYS",
    242: "POS",
    243: "SELECT",
    246: "TUNEREQ",
    248: "TT",
    250: "START",
    251: "CONTINUE",
    252: "STOP",
    254: "SENS",
    255: "RESET",
  };
  MIDIEvent.commands_reversed = {};
  for (var o in MIDIEvent.commands)
    MIDIEvent.commands_reversed[MIDIEvent.commands[o]] = o;
  function MIDIInterface(t, e) {
    if (navigator.requestMIDIAccess) {
      (this || _global).on_ready = t;
      (this || _global).state = { note: [], cc: [] };
      (this || _global).input_ports = null;
      (this || _global).input_ports_info = [];
      (this || _global).output_ports = null;
      (this || _global).output_ports_info = [];
      navigator
        .requestMIDIAccess()
        .then(
          (this || _global).onMIDISuccess.bind(this || _global),
          (this || _global).onMIDIFailure.bind(this || _global)
        );
    } else {
      (this || _global).error = "not suppoorted";
      e
        ? e("Not supported")
        : console.error("MIDI NOT SUPPORTED, enable by chrome://flags");
    }
  }
  MIDIInterface.input = null;
  MIDIInterface.MIDIEvent = MIDIEvent;
  MIDIInterface.prototype.onMIDISuccess = function (t) {
    console.log("MIDI ready!");
    console.log(t);
    (this || _global).midi = t;
    this.updatePorts();
    (this || _global).on_ready && this.on_ready(this || _global);
  };
  MIDIInterface.prototype.updatePorts = function () {
    var t = (this || _global).midi;
    (this || _global).input_ports = t.inputs;
    (this || _global).input_ports_info = [];
    (this || _global).output_ports = t.outputs;
    (this || _global).output_ports_info = [];
    var e = 0;
    var a = (this || _global).input_ports.values();
    var o = a.next();
    while (o && false === o.done) {
      var r = o.value;
      (this || _global).input_ports_info.push(r);
      console.log(
        "Input port [type:'" +
          r.type +
          "'] id:'" +
          r.id +
          "' manufacturer:'" +
          r.manufacturer +
          "' name:'" +
          r.name +
          "' version:'" +
          r.version +
          "'"
      );
      e++;
      o = a.next();
    }
    (this || _global).num_input_ports = e;
    e = 0;
    a = (this || _global).output_ports.values();
    o = a.next();
    while (o && false === o.done) {
      r = o.value;
      (this || _global).output_ports_info.push(r);
      console.log(
        "Output port [type:'" +
          r.type +
          "'] id:'" +
          r.id +
          "' manufacturer:'" +
          r.manufacturer +
          "' name:'" +
          r.name +
          "' version:'" +
          r.version +
          "'"
      );
      e++;
      o = a.next();
    }
    (this || _global).num_output_ports = e;
  };
  MIDIInterface.prototype.onMIDIFailure = function (t) {
    console.error("Failed to get MIDI access - " + t);
  };
  MIDIInterface.prototype.openInputPort = function (t, e) {
    var a = (this || _global).input_ports.get("input-" + t);
    if (!a) return false;
    MIDIInterface.input = this || _global;
    var o = this || _global;
    a.onmidimessage = function (t) {
      var a = new MIDIEvent(t.data);
      o.updateState(a);
      e && e(t.data, a);
      MIDIInterface.on_message && MIDIInterface.on_message(t.data, a);
    };
    console.log("port open: ", a);
    return true;
  };
  MIDIInterface.parseMsg = function (t) {};
  MIDIInterface.prototype.updateState = function (t) {
    switch (t.cmd) {
      case MIDIEvent.NOTEON:
        (this || _global).state.note[0 | t.value1] = t.value2;
        break;
      case MIDIEvent.NOTEOFF:
        (this || _global).state.note[0 | t.value1] = 0;
        break;
      case MIDIEvent.CONTROLLERCHANGE:
        (this || _global).state.cc[t.getCC()] = t.getCCValue();
        break;
    }
  };
  MIDIInterface.prototype.sendMIDI = function (t, e) {
    if (e) {
      var a = (this || _global).output_ports_info[t];
      if (a) {
        MIDIInterface.output = this || _global;
        e.constructor === MIDIEvent ? a.send(e.data) : a.send(e);
      }
    }
  };
  function LGMIDIIn() {
    this.addOutput("on_midi", e.EVENT);
    this.addOutput("out", "midi");
    (this || _global).properties = { port: 0 };
    (this || _global)._last_midi_event = null;
    (this || _global)._current_midi_event = null;
    (this || _global).boxcolor = "#AAA";
    (this || _global)._last_time = 0;
    var t = this || _global;
    new MIDIInterface(function (e) {
      t._midi = e;
      t._waiting && t.onStart();
      t._waiting = false;
    });
  }
  LGMIDIIn.MIDIInterface = MIDIInterface;
  LGMIDIIn.title = "MIDI Input";
  LGMIDIIn.desc = "Reads MIDI from a input port";
  LGMIDIIn.color = a;
  LGMIDIIn.prototype.getPropertyInfo = function (t) {
    if ((this || _global)._midi && "port" == t) {
      var e = {};
      for (
        var a = 0;
        a < (this || _global)._midi.input_ports_info.length;
        ++a
      ) {
        var o = (this || _global)._midi.input_ports_info[a];
        e[a] = a + ".- " + o.name + " version:" + o.version;
      }
      return { type: "enum", values: e };
    }
  };
  LGMIDIIn.prototype.onStart = function () {
    (this || _global)._midi
      ? (this || _global)._midi.openInputPort(
          (this || _global).properties.port,
          (this || _global).onMIDIEvent.bind(this || _global)
        )
      : ((this || _global)._waiting = true);
  };
  LGMIDIIn.prototype.onMIDIEvent = function (t, a) {
    (this || _global)._last_midi_event = a;
    (this || _global).boxcolor = "#AFA";
    (this || _global)._last_time = e.getTime();
    this.trigger("on_midi", a);
    a.cmd == MIDIEvent.NOTEON
      ? this.trigger("on_noteon", a)
      : a.cmd == MIDIEvent.NOTEOFF
      ? this.trigger("on_noteoff", a)
      : a.cmd == MIDIEvent.CONTROLLERCHANGE
      ? this.trigger("on_cc", a)
      : a.cmd == MIDIEvent.PROGRAMCHANGE
      ? this.trigger("on_pc", a)
      : a.cmd == MIDIEvent.PITCHBEND && this.trigger("on_pitchbend", a);
  };
  LGMIDIIn.prototype.onDrawBackground = function (t) {
    (this || _global).boxcolor = "#AAA";
    if (
      !(this || _global).flags.collapsed &&
      (this || _global)._last_midi_event
    ) {
      t.fillStyle = "white";
      var a = e.getTime();
      var o = 1 - Math.max(0, 0.001 * (a - (this || _global)._last_time));
      if (o > 0) {
        var r = t.globalAlpha;
        t.globalAlpha *= o;
        t.font = "12px Tahoma";
        t.fillText(
          (this || _global)._last_midi_event.toString(),
          2,
          0.5 * (this || _global).size[1] + 3
        );
        t.globalAlpha = r;
      }
    }
  };
  LGMIDIIn.prototype.onExecute = function () {
    if ((this || _global).outputs) {
      var t = (this || _global)._last_midi_event;
      for (var e = 0; e < (this || _global).outputs.length; ++e) {
        var a = (this || _global).outputs[e];
        var o = null;
        switch (a.name) {
          case "midi":
            o = (this || _global)._midi;
            break;
          case "last_midi":
            o = t;
            break;
          default:
            continue;
        }
        this.setOutputData(e, o);
      }
    }
  };
  LGMIDIIn.prototype.onGetOutputs = function () {
    return [
      ["last_midi", "midi"],
      ["on_midi", e.EVENT],
      ["on_noteon", e.EVENT],
      ["on_noteoff", e.EVENT],
      ["on_cc", e.EVENT],
      ["on_pc", e.EVENT],
      ["on_pitchbend", e.EVENT],
    ];
  };
  e.registerNodeType("midi/input", LGMIDIIn);
  function LGMIDIOut() {
    this.addInput("send", e.EVENT);
    (this || _global).properties = { port: 0 };
    var t = this || _global;
    new MIDIInterface(function (e) {
      t._midi = e;
      t.widget.options.values = t.getMIDIOutputs();
    });
    (this || _global).widget = this.addWidget(
      "combo",
      "Device",
      (this || _global).properties.port,
      {
        property: "port",
        values: (this || _global).getMIDIOutputs.bind(this || _global),
      }
    );
    (this || _global).size = [340, 60];
  }
  LGMIDIOut.MIDIInterface = MIDIInterface;
  LGMIDIOut.title = "MIDI Output";
  LGMIDIOut.desc = "Sends MIDI to output channel";
  LGMIDIOut.color = a;
  LGMIDIOut.prototype.onGetPropertyInfo = function (t) {
    if ((this || _global)._midi && "port" == t) {
      var e = this.getMIDIOutputs();
      return { type: "enum", values: e };
    }
  };
  LGMIDIOut.default_ports = { 0: "unknown" };
  LGMIDIOut.prototype.getMIDIOutputs = function () {
    var t = {};
    if (!(this || _global)._midi) return LGMIDIOut.default_ports;
    if ((this || _global)._midi.output_ports_info)
      for (
        var e = 0;
        e < (this || _global)._midi.output_ports_info.length;
        ++e
      ) {
        var a = (this || _global)._midi.output_ports_info[e];
        if (a) {
          var o = e + ".- " + a.name + " version:" + a.version;
          t[e] = o;
        }
      }
    return t;
  };
  LGMIDIOut.prototype.onAction = function (t, e) {
    if ((this || _global)._midi) {
      "send" == t &&
        (this || _global)._midi.sendMIDI((this || _global).properties.port, e);
      this.trigger("midi", e);
    }
  };
  LGMIDIOut.prototype.onGetInputs = function () {
    return [["send", e.ACTION]];
  };
  LGMIDIOut.prototype.onGetOutputs = function () {
    return [["on_midi", e.EVENT]];
  };
  e.registerNodeType("midi/output", LGMIDIOut);
  function LGMIDIShow() {
    this.addInput("on_midi", e.EVENT);
    (this || _global)._str = "";
    (this || _global).size = [200, 40];
  }
  LGMIDIShow.title = "MIDI Show";
  LGMIDIShow.desc = "Shows MIDI in the graph";
  LGMIDIShow.color = a;
  LGMIDIShow.prototype.getTitle = function () {
    return (this || _global).flags.collapsed
      ? (this || _global)._str
      : (this || _global).title;
  };
  LGMIDIShow.prototype.onAction = function (t, e) {
    e &&
      (e.constructor === MIDIEvent
        ? ((this || _global)._str = e.toString())
        : ((this || _global)._str = "???"));
  };
  LGMIDIShow.prototype.onDrawForeground = function (t) {
    if ((this || _global)._str && !(this || _global).flags.collapsed) {
      t.font = "30px Arial";
      t.fillText((this || _global)._str, 10, 0.8 * (this || _global).size[1]);
    }
  };
  LGMIDIShow.prototype.onGetInputs = function () {
    return [["in", e.ACTION]];
  };
  LGMIDIShow.prototype.onGetOutputs = function () {
    return [["on_midi", e.EVENT]];
  };
  e.registerNodeType("midi/show", LGMIDIShow);
  function LGMIDIFilter() {
    (this || _global).properties = {
      channel: -1,
      cmd: -1,
      min_value: -1,
      max_value: -1,
    };
    var t = this || _global;
    (this || _global)._learning = false;
    this.addWidget("button", "Learn", "", function () {
      t._learning = true;
      t.boxcolor = "#FA3";
    });
    this.addInput("in", e.EVENT);
    this.addOutput("on_midi", e.EVENT);
    (this || _global).boxcolor = "#AAA";
  }
  LGMIDIFilter.title = "MIDI Filter";
  LGMIDIFilter.desc = "Filters MIDI messages";
  LGMIDIFilter.color = a;
  LGMIDIFilter["@cmd"] = {
    type: "enum",
    title: "Command",
    values: MIDIEvent.commands_reversed,
  };
  LGMIDIFilter.prototype.getTitle = function () {
    var t = null;
    t =
      -1 == (this || _global).properties.cmd
        ? "Nothing"
        : MIDIEvent.commands_short[(this || _global).properties.cmd] ||
          "Unknown";
    -1 != (this || _global).properties.min_value &&
      -1 != (this || _global).properties.max_value &&
      (t +=
        " " +
        ((this || _global).properties.min_value ==
        (this || _global).properties.max_value
          ? (this || _global).properties.max_value
          : (this || _global).properties.min_value +
            ".." +
            (this || _global).properties.max_value));
    return "Filter: " + t;
  };
  LGMIDIFilter.prototype.onPropertyChanged = function (t, e) {
    if ("cmd" == t) {
      var a = Number(e);
      isNaN(a) && (a = MIDIEvent.commands[e] || 0);
      (this || _global).properties.cmd = a;
    }
  };
  LGMIDIFilter.prototype.onAction = function (t, e) {
    if (e && e.constructor === MIDIEvent) {
      if ((this || _global)._learning) {
        (this || _global)._learning = false;
        (this || _global).boxcolor = "#AAA";
        (this || _global).properties.channel = e.channel;
        (this || _global).properties.cmd = e.cmd;
        (this || _global).properties.min_value = (
          this || _global
        ).properties.max_value = e.data[1];
      } else {
        if (
          -1 != (this || _global).properties.channel &&
          e.channel != (this || _global).properties.channel
        )
          return;
        if (
          -1 != (this || _global).properties.cmd &&
          e.cmd != (this || _global).properties.cmd
        )
          return;
        if (
          -1 != (this || _global).properties.min_value &&
          e.data[1] < (this || _global).properties.min_value
        )
          return;
        if (
          -1 != (this || _global).properties.max_value &&
          e.data[1] > (this || _global).properties.max_value
        )
          return;
      }
      this.trigger("on_midi", e);
    }
  };
  e.registerNodeType("midi/filter", LGMIDIFilter);
  function LGMIDIEvent() {
    (this || _global).properties = {
      channel: 0,
      cmd: 144,
      value1: 1,
      value2: 1,
    };
    this.addInput("send", e.EVENT);
    this.addInput("assign", e.EVENT);
    this.addOutput("on_midi", e.EVENT);
    (this || _global).midi_event = new MIDIEvent();
    (this || _global).gate = false;
  }
  LGMIDIEvent.title = "MIDIEvent";
  LGMIDIEvent.desc = "Create a MIDI Event";
  LGMIDIEvent.color = a;
  LGMIDIEvent.prototype.onAction = function (t, e) {
    if ("assign" != t) {
      e = (this || _global).midi_event;
      e.channel = (this || _global).properties.channel;
      (this || _global).properties.cmd &&
      (this || _global).properties.cmd.constructor === String
        ? e.setCommandFromString((this || _global).properties.cmd)
        : (e.cmd = (this || _global).properties.cmd);
      e.data[0] = e.cmd | e.channel;
      e.data[1] = Number((this || _global).properties.value1);
      e.data[2] = Number((this || _global).properties.value2);
      this.trigger("on_midi", e);
    } else {
      (this || _global).properties.channel = e.channel;
      (this || _global).properties.cmd = e.cmd;
      (this || _global).properties.value1 = e.data[1];
      (this || _global).properties.value2 = e.data[2];
      e.cmd == MIDIEvent.NOTEON
        ? ((this || _global).gate = true)
        : e.cmd == MIDIEvent.NOTEOFF && ((this || _global).gate = false);
    }
  };
  LGMIDIEvent.prototype.onExecute = function () {
    var t = (this || _global).properties;
    if ((this || _global).inputs)
      for (var e = 0; e < (this || _global).inputs.length; ++e) {
        var a = (this || _global).inputs[e];
        if (-1 != a.link)
          switch (a.name) {
            case "note":
              var o = this.getInputData(e);
              if (null != o) {
                o.constructor === String &&
                  (o = MIDIEvent.NoteStringToPitch(o));
                (this || _global).properties.value1 = (0 | o) % 255;
              }
              break;
            case "cmd":
              o = this.getInputData(e);
              null != o && ((this || _global).properties.cmd = o);
              break;
            case "value1":
              o = this.getInputData(e);
              null != o &&
                ((this || _global).properties.value1 = Math.clamp(
                  0 | o,
                  0,
                  127
                ));
              break;
            case "value2":
              o = this.getInputData(e);
              null != o &&
                ((this || _global).properties.value2 = Math.clamp(
                  0 | o,
                  0,
                  127
                ));
              break;
          }
      }
    if ((this || _global).outputs)
      for (e = 0; e < (this || _global).outputs.length; ++e) {
        var r = (this || _global).outputs[e];
        o = null;
        switch (r.name) {
          case "midi":
            o = new MIDIEvent();
            o.setup([t.cmd, t.value1, t.value2]);
            o.channel = t.channel;
            break;
          case "command":
            o = t.cmd;
            break;
          case "cc":
            o = t.value1;
            break;
          case "cc_value":
            o = t.value2;
            break;
          case "note":
            o =
              t.cmd == MIDIEvent.NOTEON || t.cmd == MIDIEvent.NOTEOFF
                ? t.value1
                : null;
            break;
          case "velocity":
            o = t.cmd == MIDIEvent.NOTEON ? t.value2 : null;
            break;
          case "pitch":
            o =
              t.cmd == MIDIEvent.NOTEON
                ? MIDIEvent.computePitch(t.value1)
                : null;
            break;
          case "pitchbend":
            o =
              t.cmd == MIDIEvent.PITCHBEND
                ? MIDIEvent.computePitchBend(t.value1, t.value2)
                : null;
            break;
          case "gate":
            o = (this || _global).gate;
            break;
          default:
            continue;
        }
        null !== o && this.setOutputData(e, o);
      }
  };
  LGMIDIEvent.prototype.onPropertyChanged = function (t, e) {
    "cmd" == t &&
      ((this || _global).properties.cmd =
        MIDIEvent.computeCommandFromString(e));
  };
  LGMIDIEvent.prototype.onGetInputs = function () {
    return [
      ["cmd", "number"],
      ["note", "number"],
      ["value1", "number"],
      ["value2", "number"],
    ];
  };
  LGMIDIEvent.prototype.onGetOutputs = function () {
    return [
      ["midi", "midi"],
      ["on_midi", e.EVENT],
      ["command", "number"],
      ["note", "number"],
      ["velocity", "number"],
      ["cc", "number"],
      ["cc_value", "number"],
      ["pitch", "number"],
      ["gate", "bool"],
      ["pitchbend", "number"],
    ];
  };
  e.registerNodeType("midi/event", LGMIDIEvent);
  function LGMIDICC() {
    (this || _global).properties = { cc: 1, value: 0 };
    this.addOutput("value", "number");
  }
  LGMIDICC.title = "MIDICC";
  LGMIDICC.desc = "gets a Controller Change";
  LGMIDICC.color = a;
  LGMIDICC.prototype.onExecute = function () {
    (this || _global).properties;
    MIDIInterface.input &&
      ((this || _global).properties.value =
        MIDIInterface.input.state.cc[(this || _global).properties.cc]);
    this.setOutputData(0, (this || _global).properties.value);
  };
  e.registerNodeType("midi/cc", LGMIDICC);
  function LGMIDIGenerator() {
    this.addInput("generate", e.ACTION);
    this.addInput("scale", "string");
    this.addInput("octave", "number");
    this.addOutput("note", e.EVENT);
    (this || _global).properties = {
      notes: "A,A#,B,C,C#,D,D#,E,F,F#,G,G#",
      octave: 2,
      duration: 0.5,
      mode: "sequence",
    };
    (this || _global).notes_pitches = LGMIDIGenerator.processScale(
      (this || _global).properties.notes
    );
    (this || _global).sequence_index = 0;
  }
  LGMIDIGenerator.title = "MIDI Generator";
  LGMIDIGenerator.desc = "Generates a random MIDI note";
  LGMIDIGenerator.color = a;
  LGMIDIGenerator.processScale = function (t) {
    var a = t.split(",");
    for (var o = 0; o < a.length; ++o) {
      var r = a[o];
      (2 == r.length && "#" != r[1]) || r.length > 2
        ? (a[o] = -e.MIDIEvent.NoteStringToPitch(r))
        : (a[o] = MIDIEvent.note_to_index[r] || 0);
    }
    return a;
  };
  LGMIDIGenerator.prototype.onPropertyChanged = function (t, e) {
    "notes" == t &&
      ((this || _global).notes_pitches = LGMIDIGenerator.processScale(e));
  };
  LGMIDIGenerator.prototype.onExecute = function () {
    var t = this.getInputData(2);
    null != t && ((this || _global).properties.octave = t);
    var e = this.getInputData(1);
    e && ((this || _global).notes_pitches = LGMIDIGenerator.processScale(e));
  };
  LGMIDIGenerator.prototype.onAction = function (t, e) {
    var a = 0;
    var o = (this || _global).notes_pitches.length;
    var r = 0;
    "sequence" == (this || _global).properties.mode
      ? (r = (this || _global).sequence_index =
          ((this || _global).sequence_index + 1) % o)
      : "random" == (this || _global).properties.mode &&
        (r = Math.floor(Math.random() * o));
    var l = (this || _global).notes_pitches[r];
    a = l >= 0 ? l + 12 * ((this || _global).properties.octave - 1) + 33 : -l;
    e = new MIDIEvent();
    e.setup([MIDIEvent.NOTEON, a, 10]);
    var n = (this || _global).properties.duration || 1;
    this.trigger("note", e);
    setTimeout(
      function () {
        var t = new MIDIEvent();
        t.setup([MIDIEvent.NOTEOFF, a, 0]);
        this.trigger("note", t);
      }.bind(this || _global),
      1e3 * n
    );
  };
  e.registerNodeType("midi/generator", LGMIDIGenerator);
  function LGMIDITranspose() {
    (this || _global).properties = { amount: 0 };
    this.addInput("in", e.ACTION);
    this.addInput("amount", "number");
    this.addOutput("out", e.EVENT);
    (this || _global).midi_event = new MIDIEvent();
  }
  LGMIDITranspose.title = "MIDI Transpose";
  LGMIDITranspose.desc = "Transpose a MIDI note";
  LGMIDITranspose.color = a;
  LGMIDITranspose.prototype.onAction = function (t, e) {
    if (e && e.constructor === MIDIEvent)
      if (e.data[0] == MIDIEvent.NOTEON || e.data[0] == MIDIEvent.NOTEOFF) {
        (this || _global).midi_event = new MIDIEvent();
        (this || _global).midi_event.setup(e.data);
        (this || _global).midi_event.data[1] = Math.round(
          (this || _global).midi_event.data[1] +
            (this || _global).properties.amount
        );
        this.trigger("out", (this || _global).midi_event);
      } else this.trigger("out", e);
  };
  LGMIDITranspose.prototype.onExecute = function () {
    var t = this.getInputData(1);
    null != t && ((this || _global).properties.amount = t);
  };
  e.registerNodeType("midi/transpose", LGMIDITranspose);
  function LGMIDIQuantize() {
    (this || _global).properties = { scale: "A,A#,B,C,C#,D,D#,E,F,F#,G,G#" };
    this.addInput("note", e.ACTION);
    this.addInput("scale", "string");
    this.addOutput("out", e.EVENT);
    (this || _global).valid_notes = new Array(12);
    (this || _global).offset_notes = new Array(12);
    this.processScale((this || _global).properties.scale);
  }
  LGMIDIQuantize.title = "MIDI Quantize Pitch";
  LGMIDIQuantize.desc = "Transpose a MIDI note tp fit an scale";
  LGMIDIQuantize.color = a;
  LGMIDIQuantize.prototype.onPropertyChanged = function (t, e) {
    "scale" == t && this.processScale(e);
  };
  LGMIDIQuantize.prototype.processScale = function (t) {
    (this || _global)._current_scale = t;
    (this || _global).notes_pitches = LGMIDIGenerator.processScale(t);
    for (var e = 0; e < 12; ++e)
      (this || _global).valid_notes[e] =
        -1 != (this || _global).notes_pitches.indexOf(e);
    for (e = 0; e < 12; ++e)
      if ((this || _global).valid_notes[e])
        (this || _global).offset_notes[e] = 0;
      else
        for (var a = 1; a < 12; ++a) {
          if ((this || _global).valid_notes[(e - a) % 12]) {
            (this || _global).offset_notes[e] = -a;
            break;
          }
          if ((this || _global).valid_notes[(e + a) % 12]) {
            (this || _global).offset_notes[e] = a;
            break;
          }
        }
  };
  LGMIDIQuantize.prototype.onAction = function (t, e) {
    if (e && e.constructor === MIDIEvent)
      if (e.data[0] == MIDIEvent.NOTEON || e.data[0] == MIDIEvent.NOTEOFF) {
        (this || _global).midi_event = new MIDIEvent();
        (this || _global).midi_event.setup(e.data);
        var a = e.note;
        var o = MIDIEvent.note_to_index[a];
        var r = (this || _global).offset_notes[o];
        (this || _global).midi_event.data[1] += r;
        this.trigger("out", (this || _global).midi_event);
      } else this.trigger("out", e);
  };
  LGMIDIQuantize.prototype.onExecute = function () {
    var t = this.getInputData(1);
    null != t && t != (this || _global)._current_scale && this.processScale(t);
  };
  e.registerNodeType("midi/quantize", LGMIDIQuantize);
  function LGMIDIFromFile() {
    (this || _global).properties = { url: "", autoplay: true };
    this.addInput("play", e.ACTION);
    this.addInput("pause", e.ACTION);
    this.addOutput("note", e.EVENT);
    (this || _global)._midi = null;
    (this || _global)._current_time = 0;
    (this || _global)._playing = false;
    if ("undefined" == typeof MidiParser) {
      console.error(
        "midi-parser.js not included, LGMidiPlay requires that library: https://raw.githubusercontent.com/colxi/midi-parser-js/master/src/main.js"
      );
      (this || _global).boxcolor = "red";
    }
  }
  LGMIDIFromFile.title = "MIDI fromFile";
  LGMIDIFromFile.desc = "Plays a MIDI file";
  LGMIDIFromFile.color = a;
  LGMIDIFromFile.prototype.onAction = function (t) {
    "play" == t
      ? this.play()
      : "pause" == t &&
        ((this || _global)._playing = !(this || _global)._playing);
  };
  LGMIDIFromFile.prototype.onPropertyChanged = function (t, e) {
    "url" == t && this.loadMIDIFile(e);
  };
  LGMIDIFromFile.prototype.onExecute = function () {
    if ((this || _global)._midi && (this || _global)._playing) {
      (this || _global)._current_time += (this || _global).graph.elapsed_time;
      var t = 100 * (this || _global)._current_time;
      for (var e = 0; e < (this || _global)._midi.tracks; ++e) {
        var a = (this || _global)._midi.track[e];
        if (!a._last_pos) {
          a._last_pos = 0;
          a._time = 0;
        }
        var o = a.event[a._last_pos];
        if (o && a._time + o.deltaTime <= t) {
          a._last_pos++;
          a._time += o.deltaTime;
          if (o.data) {
            var r = o.type << (4 + o.channel);
            var l = new MIDIEvent();
            l.setup([r, o.data[0], o.data[1]]);
            this.trigger("note", l);
          }
        }
      }
    }
  };
  LGMIDIFromFile.prototype.play = function () {
    (this || _global)._playing = true;
    (this || _global)._current_time = 0;
    if ((this || _global)._midi)
      for (var t = 0; t < (this || _global)._midi.tracks; ++t) {
        var e = (this || _global)._midi.track[t];
        e._last_pos = 0;
        e._time = 0;
      }
  };
  LGMIDIFromFile.prototype.loadMIDIFile = function (t) {
    var a = this || _global;
    e.fetchFile(
      t,
      "arraybuffer",
      function (t) {
        a.boxcolor = "#AFA";
        a._midi = MidiParser.parse(new Uint8Array(t));
        a.properties.autoplay && a.play();
      },
      function (t) {
        a.boxcolor = "#FAA";
        a._midi = null;
      }
    );
  };
  LGMIDIFromFile.prototype.onDropFile = function (t) {
    (this || _global).properties.url = "";
    this.loadMIDIFile(t);
  };
  e.registerNodeType("midi/fromFile", LGMIDIFromFile);
  function LGMIDIPlay() {
    (this || _global).properties = { volume: 0.5, duration: 1 };
    this.addInput("note", e.ACTION);
    this.addInput("volume", "number");
    this.addInput("duration", "number");
    this.addOutput("note", e.EVENT);
    if ("undefined" == typeof AudioSynth) {
      console.error(
        "Audiosynth.js not included, LGMidiPlay requires that library"
      );
      (this || _global).boxcolor = "red";
    } else {
      var t = ((this || _global).synth = new AudioSynth());
      (this || _global).instrument = t.createInstrument("piano");
    }
  }
  LGMIDIPlay.title = "MIDI Play";
  LGMIDIPlay.desc = "Plays a MIDI note";
  LGMIDIPlay.color = a;
  LGMIDIPlay.prototype.onAction = function (t, e) {
    if (e && e.constructor === MIDIEvent) {
      if ((this || _global).instrument && e.data[0] == MIDIEvent.NOTEON) {
        var a = e.note;
        if (!a || "undefined" == a || a.constructor !== String) return;
        (this || _global).instrument.play(
          a,
          e.octave,
          (this || _global).properties.duration,
          (this || _global).properties.volume
        );
      }
      this.trigger("note", e);
    }
  };
  LGMIDIPlay.prototype.onExecute = function () {
    var t = this.getInputData(1);
    null != t && ((this || _global).properties.volume = t);
    var e = this.getInputData(2);
    null != e && ((this || _global).properties.duration = e);
  };
  e.registerNodeType("midi/play", LGMIDIPlay);
  function LGMIDIKeys() {
    (this || _global).properties = { num_octaves: 2, start_octave: 2 };
    this.addInput("note", e.ACTION);
    this.addInput("reset", e.ACTION);
    this.addOutput("note", e.EVENT);
    (this || _global).size = [400, 100];
    (this || _global).keys = [];
    (this || _global)._last_key = -1;
  }
  LGMIDIKeys.title = "MIDI Keys";
  LGMIDIKeys.desc = "Keyboard to play notes";
  LGMIDIKeys.color = a;
  LGMIDIKeys.keys = [
    { x: 0, w: 1, h: 1, t: 0 },
    { x: 0.75, w: 0.5, h: 0.6, t: 1 },
    { x: 1, w: 1, h: 1, t: 0 },
    { x: 1.75, w: 0.5, h: 0.6, t: 1 },
    { x: 2, w: 1, h: 1, t: 0 },
    { x: 2.75, w: 0.5, h: 0.6, t: 1 },
    { x: 3, w: 1, h: 1, t: 0 },
    { x: 4, w: 1, h: 1, t: 0 },
    { x: 4.75, w: 0.5, h: 0.6, t: 1 },
    { x: 5, w: 1, h: 1, t: 0 },
    { x: 5.75, w: 0.5, h: 0.6, t: 1 },
    { x: 6, w: 1, h: 1, t: 0 },
  ];
  LGMIDIKeys.prototype.onDrawForeground = function (t) {
    if (!(this || _global).flags.collapsed) {
      var e = 12 * (this || _global).properties.num_octaves;
      (this || _global).keys.length = e;
      var a =
        (this || _global).size[0] /
        (7 * (this || _global).properties.num_octaves);
      var o = (this || _global).size[1];
      t.globalAlpha = 1;
      for (var r = 0; r < 2; r++)
        for (var l = 0; l < e; ++l) {
          var n = LGMIDIKeys.keys[l % 12];
          if (n.t == r) {
            var s = Math.floor(l / 12);
            var u = 7 * s * a + n.x * a;
            t.fillStyle =
              0 == r
                ? (this || _global).keys[l]
                  ? "#CCC"
                  : "white"
                : (this || _global).keys[l]
                ? "#333"
                : "black";
            t.fillRect(u + 1, 0, a * n.w - 2, o * n.h);
          }
        }
    }
  };
  LGMIDIKeys.prototype.getKeyIndex = function (t) {
    (this || _global).properties.num_octaves;
    var e =
      (this || _global).size[0] /
      (7 * (this || _global).properties.num_octaves);
    var a = (this || _global).size[1];
    for (var o = 1; o >= 0; o--)
      for (var r = 0; r < (this || _global).keys.length; ++r) {
        var l = LGMIDIKeys.keys[r % 12];
        if (l.t == o) {
          var n = Math.floor(r / 12);
          var s = 7 * n * e + l.x * e;
          var u = e * l.w;
          var h = a * l.h;
          if (!(t[0] < s || t[0] > s + u || t[1] > h)) return r;
        }
      }
    return -1;
  };
  LGMIDIKeys.prototype.onAction = function (t, e) {
    if ("reset" != t) {
      if (e && e.constructor === MIDIEvent) {
        var a = e;
        var o = 12 * ((this || _global).properties.start_octave - 1) + 29;
        var r = a.data[1] - o;
        r >= 0 &&
          r < (this || _global).keys.length &&
          (a.data[0] == MIDIEvent.NOTEON
            ? ((this || _global).keys[r] = true)
            : a.data[0] == MIDIEvent.NOTEOFF &&
              ((this || _global).keys[r] = false));
        this.trigger("note", a);
      }
    } else
      for (var l = 0; l < (this || _global).keys.length; ++l)
        (this || _global).keys[l] = false;
  };
  LGMIDIKeys.prototype.onMouseDown = function (t, e) {
    if (!(e[1] < 0)) {
      var a = this.getKeyIndex(e);
      (this || _global).keys[a] = true;
      (this || _global)._last_key = a;
      var o = 12 * ((this || _global).properties.start_octave - 1) + 29 + a;
      var r = new MIDIEvent();
      r.setup([MIDIEvent.NOTEON, o, 100]);
      this.trigger("note", r);
      return true;
    }
  };
  LGMIDIKeys.prototype.onMouseMove = function (t, e) {
    if (!(e[1] < 0 || -1 == (this || _global)._last_key)) {
      this.setDirtyCanvas(true);
      var a = this.getKeyIndex(e);
      if ((this || _global)._last_key == a) return true;
      (this || _global).keys[(this || _global)._last_key] = false;
      var o =
        12 * ((this || _global).properties.start_octave - 1) +
        29 +
        (this || _global)._last_key;
      var r = new MIDIEvent();
      r.setup([MIDIEvent.NOTEOFF, o, 100]);
      this.trigger("note", r);
      (this || _global).keys[a] = true;
      o = 12 * ((this || _global).properties.start_octave - 1) + 29 + a;
      r = new MIDIEvent();
      r.setup([MIDIEvent.NOTEON, o, 100]);
      this.trigger("note", r);
      (this || _global)._last_key = a;
      return true;
    }
  };
  LGMIDIKeys.prototype.onMouseUp = function (t, e) {
    if (!(e[1] < 0)) {
      var a = this.getKeyIndex(e);
      (this || _global).keys[a] = false;
      (this || _global)._last_key = -1;
      var o = 12 * ((this || _global).properties.start_octave - 1) + 29 + a;
      var r = new MIDIEvent();
      r.setup([MIDIEvent.NOTEOFF, o, 100]);
      this.trigger("note", r);
      return true;
    }
  };
  e.registerNodeType("midi/keys", LGMIDIKeys);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  var a = {};
  t.LGAudio = a;
  a.getAudioContext = function () {
    if (!(this || _global)._audio_context) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!window.AudioContext) {
        console.error("AudioContext not supported by browser");
        return null;
      }
      (this || _global)._audio_context = new AudioContext();
      (this || _global)._audio_context.onmessage = function (t) {
        console.log("msg", t);
      };
      (this || _global)._audio_context.onended = function (t) {
        console.log("ended", t);
      };
      (this || _global)._audio_context.oncomplete = function (t) {
        console.log("complete", t);
      };
    }
    return (this || _global)._audio_context;
  };
  a.connect = function (t, e) {
    try {
      t.connect(e);
    } catch (t) {
      console.warn("LGraphAudio:", t);
    }
  };
  a.disconnect = function (t, e) {
    try {
      t.disconnect(e);
    } catch (t) {
      console.warn("LGraphAudio:", t);
    }
  };
  a.changeAllAudiosConnections = function (t, e) {
    if (t.inputs)
      for (var o = 0; o < t.inputs.length; ++o) {
        var r = t.inputs[o];
        var l = t.graph.links[r.link];
        if (l) {
          var n = t.graph.getNodeById(l.origin_id);
          var s = null;
          s = n.getAudioNodeInOutputSlot
            ? n.getAudioNodeInOutputSlot(l.origin_slot)
            : n.audionode;
          var u = null;
          u = t.getAudioNodeInInputSlot
            ? t.getAudioNodeInInputSlot(o)
            : t.audionode;
          e ? a.connect(s, u) : a.disconnect(s, u);
        }
      }
    if (t.outputs)
      for (o = 0; o < t.outputs.length; ++o) {
        var h = t.outputs[o];
        for (var p = 0; p < h.links.length; ++p) {
          l = t.graph.links[h.links[p]];
          if (l) {
            s = null;
            s = t.getAudioNodeInOutputSlot
              ? t.getAudioNodeInOutputSlot(o)
              : t.audionode;
            var _ = t.graph.getNodeById(l.target_id);
            u = null;
            u = _.getAudioNodeInInputSlot
              ? _.getAudioNodeInInputSlot(l.target_slot)
              : _.audionode;
            e ? a.connect(s, u) : a.disconnect(s, u);
          }
        }
      }
  };
  a.onConnectionsChange = function (t, o, r, l) {
    if (t == e.OUTPUT) {
      var n = null;
      l && (n = (this || _global).graph.getNodeById(l.target_id));
      if (n) {
        var s = null;
        s = (this || _global).getAudioNodeInOutputSlot
          ? this.getAudioNodeInOutputSlot(o)
          : (this || _global).audionode;
        var u = null;
        u = n.getAudioNodeInInputSlot
          ? n.getAudioNodeInInputSlot(l.target_slot)
          : n.audionode;
        r ? a.connect(s, u) : a.disconnect(s, u);
      }
    }
  };
  a.createAudioNodeWrapper = function (t) {
    var e = t.prototype.onPropertyChanged;
    t.prototype.onPropertyChanged = function (t, a) {
      e && e.call(this || _global, t, a);
      (this || _global).audionode &&
        void 0 !== (this || _global).audionode[t] &&
        (void 0 !== (this || _global).audionode[t].value
          ? ((this || _global).audionode[t].value = a)
          : ((this || _global).audionode[t] = a));
    };
    t.prototype.onConnectionsChange = a.onConnectionsChange;
  };
  a.cached_audios = {};
  a.loadSound = function (t, e, o) {
    if (!a.cached_audios[t] || -1 != t.indexOf("blob:")) {
      a.onProcessAudioURL && (t = a.onProcessAudioURL(t));
      var r = new XMLHttpRequest();
      r.open("GET", t, true);
      r.responseType = "arraybuffer";
      var l = a.getAudioContext();
      r.onload = function () {
        console.log("AudioSource loaded");
        l.decodeAudioData(
          r.response,
          function (o) {
            console.log("AudioSource decoded");
            a.cached_audios[t] = o;
            e && e(o);
          },
          onError
        );
      };
      r.send();
      return r;
    }
    e && e(a.cached_audios[t]);
    function onError(t) {
      console.log("Audio loading sample error:", t);
      o && o(t);
    }
  };
  function LGAudioSource() {
    (this || _global).properties = {
      src: "",
      gain: 0.5,
      loop: true,
      autoplay: true,
      playbackRate: 1,
    };
    (this || _global)._loading_audio = false;
    (this || _global)._audiobuffer = null;
    (this || _global)._audionodes = [];
    (this || _global)._last_sourcenode = null;
    this.addOutput("out", "audio");
    this.addInput("gain", "number");
    var t = a.getAudioContext();
    (this || _global).audionode = t.createGain();
    (this || _global).audionode.graphnode = this || _global;
    (this || _global).audionode.gain.value = (this || _global).properties.gain;
    (this || _global).properties.src &&
      this.loadSound((this || _global).properties.src);
  }
  LGAudioSource.desc = "Plays an audio file";
  LGAudioSource["@src"] = { widget: "resource" };
  LGAudioSource.supported_extensions = ["wav", "ogg", "mp3"];
  LGAudioSource.prototype.onAdded = function (t) {
    t.status === LGraph.STATUS_RUNNING && this.onStart();
  };
  LGAudioSource.prototype.onStart = function () {
    (this || _global)._audiobuffer &&
      (this || _global).properties.autoplay &&
      this.playBuffer((this || _global)._audiobuffer);
  };
  LGAudioSource.prototype.onStop = function () {
    this.stopAllSounds();
  };
  LGAudioSource.prototype.onPause = function () {
    this.pauseAllSounds();
  };
  LGAudioSource.prototype.onUnpause = function () {
    this.unpauseAllSounds();
  };
  LGAudioSource.prototype.onRemoved = function () {
    this.stopAllSounds();
    (this || _global)._dropped_url &&
      URL.revokeObjectURL((this || _global)._url);
  };
  LGAudioSource.prototype.stopAllSounds = function () {
    for (var t = 0; t < (this || _global)._audionodes.length; ++t)
      if ((this || _global)._audionodes[t].started) {
        (this || _global)._audionodes[t].started = false;
        (this || _global)._audionodes[t].stop();
      }
    (this || _global)._audionodes.length = 0;
  };
  LGAudioSource.prototype.pauseAllSounds = function () {
    a.getAudioContext().suspend();
  };
  LGAudioSource.prototype.unpauseAllSounds = function () {
    a.getAudioContext().resume();
  };
  LGAudioSource.prototype.onExecute = function () {
    if ((this || _global).inputs)
      for (var t = 0; t < (this || _global).inputs.length; ++t) {
        var e = (this || _global).inputs[t];
        if (null != e.link) {
          var a = this.getInputData(t);
          if (void 0 !== a)
            if ("gain" == e.name) (this || _global).audionode.gain.value = a;
            else if ("src" == e.name) this.setProperty("src", a);
            else if ("playbackRate" == e.name) {
              (this || _global).properties.playbackRate = a;
              for (var o = 0; o < (this || _global)._audionodes.length; ++o)
                (this || _global)._audionodes[o].playbackRate.value = a;
            }
        }
      }
    if ((this || _global).outputs)
      for (t = 0; t < (this || _global).outputs.length; ++t) {
        var r = (this || _global).outputs[t];
        "buffer" == r.name &&
          (this || _global)._audiobuffer &&
          this.setOutputData(t, (this || _global)._audiobuffer);
      }
  };
  LGAudioSource.prototype.onAction = function (t) {
    (this || _global)._audiobuffer &&
      ("Play" == t
        ? this.playBuffer((this || _global)._audiobuffer)
        : "Stop" == t && this.stopAllSounds());
  };
  LGAudioSource.prototype.onPropertyChanged = function (t, e) {
    if ("src" == t) this.loadSound(e);
    else if ("gain" == t) (this || _global).audionode.gain.value = e;
    else if ("playbackRate" == t)
      for (var a = 0; a < (this || _global)._audionodes.length; ++a)
        (this || _global)._audionodes[a].playbackRate.value = e;
  };
  LGAudioSource.prototype.playBuffer = function (t) {
    var e = this || _global;
    var o = a.getAudioContext();
    var r = o.createBufferSource();
    (this || _global)._last_sourcenode = r;
    r.graphnode = this || _global;
    r.buffer = t;
    r.loop = (this || _global).properties.loop;
    r.playbackRate.value = (this || _global).properties.playbackRate;
    (this || _global)._audionodes.push(r);
    r.connect((this || _global).audionode);
    (this || _global)._audionodes.push(r);
    this.trigger("start");
    r.onended = function () {
      e.trigger("ended");
      var t = e._audionodes.indexOf(r);
      -1 != t && e._audionodes.splice(t, 1);
    };
    if (!r.started) {
      r.started = true;
      r.start();
    }
    return r;
  };
  LGAudioSource.prototype.loadSound = function (t) {
    var o = this || _global;
    if ((this || _global)._request) {
      (this || _global)._request.abort();
      (this || _global)._request = null;
    }
    (this || _global)._audiobuffer = null;
    (this || _global)._loading_audio = false;
    if (t) {
      (this || _global)._request = a.loadSound(t, inner);
      (this || _global)._loading_audio = true;
      (this || _global).boxcolor = "#AA4";
    }
    function inner(t) {
      (this || _global).boxcolor = e.NODE_DEFAULT_BOXCOLOR;
      o._audiobuffer = t;
      o._loading_audio = false;
      o.graph && o.graph.status === LGraph.STATUS_RUNNING && o.onStart();
    }
  };
  LGAudioSource.prototype.onConnectionsChange = a.onConnectionsChange;
  LGAudioSource.prototype.onGetInputs = function () {
    return [
      ["playbackRate", "number"],
      ["src", "string"],
      ["Play", e.ACTION],
      ["Stop", e.ACTION],
    ];
  };
  LGAudioSource.prototype.onGetOutputs = function () {
    return [
      ["buffer", "audiobuffer"],
      ["start", e.EVENT],
      ["ended", e.EVENT],
    ];
  };
  LGAudioSource.prototype.onDropFile = function (t) {
    (this || _global)._dropped_url &&
      URL.revokeObjectURL((this || _global)._dropped_url);
    var e = URL.createObjectURL(t);
    (this || _global).properties.src = e;
    this.loadSound(e);
    (this || _global)._dropped_url = e;
  };
  LGAudioSource.title = "Source";
  LGAudioSource.desc = "Plays audio";
  e.registerNodeType("audio/source", LGAudioSource);
  function LGAudioMediaSource() {
    (this || _global).properties = { gain: 0.5 };
    (this || _global)._audionodes = [];
    (this || _global)._media_stream = null;
    this.addOutput("out", "audio");
    this.addInput("gain", "number");
    var t = a.getAudioContext();
    (this || _global).audionode = t.createGain();
    (this || _global).audionode.graphnode = this || _global;
    (this || _global).audionode.gain.value = (this || _global).properties.gain;
  }
  LGAudioMediaSource.prototype.onAdded = function (t) {
    t.status === LGraph.STATUS_RUNNING && this.onStart();
  };
  LGAudioMediaSource.prototype.onStart = function () {
    null != (this || _global)._media_stream ||
      (this || _global)._waiting_confirmation ||
      this.openStream();
  };
  LGAudioMediaSource.prototype.onStop = function () {
    (this || _global).audionode.gain.value = 0;
  };
  LGAudioMediaSource.prototype.onPause = function () {
    (this || _global).audionode.gain.value = 0;
  };
  LGAudioMediaSource.prototype.onUnpause = function () {
    (this || _global).audionode.gain.value = (this || _global).properties.gain;
  };
  LGAudioMediaSource.prototype.onRemoved = function () {
    (this || _global).audionode.gain.value = 0;
    if ((this || _global).audiosource_node) {
      (this || _global).audiosource_node.disconnect(
        (this || _global).audionode
      );
      (this || _global).audiosource_node = null;
    }
    if ((this || _global)._media_stream) {
      var t = (this || _global)._media_stream.getTracks();
      t.length && t[0].stop();
    }
  };
  LGAudioMediaSource.prototype.openStream = function () {
    if (navigator.mediaDevices) {
      (this || _global)._waiting_confirmation = true;
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((this || _global).streamReady.bind(this || _global))
        .catch(onFailSoHard);
      var t = this || _global;
    } else
      console.log(
        "getUserMedia() is not supported in your browser, use chrome and enable WebRTC from about://flags"
      );
    function onFailSoHard(e) {
      console.log("Media rejected", e);
      t._media_stream = false;
      t.boxcolor = "red";
    }
  };
  LGAudioMediaSource.prototype.streamReady = function (t) {
    (this || _global)._media_stream = t;
    (this || _global).audiosource_node &&
      (this || _global).audiosource_node.disconnect(
        (this || _global).audionode
      );
    var e = a.getAudioContext();
    (this || _global).audiosource_node = e.createMediaStreamSource(t);
    (this || _global).audiosource_node.graphnode = this || _global;
    (this || _global).audiosource_node.connect((this || _global).audionode);
    (this || _global).boxcolor = "white";
  };
  LGAudioMediaSource.prototype.onExecute = function () {
    null != (this || _global)._media_stream ||
      (this || _global)._waiting_confirmation ||
      this.openStream();
    if ((this || _global).inputs)
      for (var t = 0; t < (this || _global).inputs.length; ++t) {
        var e = (this || _global).inputs[t];
        if (null != e.link) {
          var a = this.getInputData(t);
          void 0 !== a &&
            "gain" == e.name &&
            ((this || _global).audionode.gain.value = (
              this || _global
            ).properties.gain =
              a);
        }
      }
  };
  LGAudioMediaSource.prototype.onAction = function (t) {
    "Play" == t
      ? ((this || _global).audionode.gain.value = (
          this || _global
        ).properties.gain)
      : "Stop" == t && ((this || _global).audionode.gain.value = 0);
  };
  LGAudioMediaSource.prototype.onPropertyChanged = function (t, e) {
    "gain" == t && ((this || _global).audionode.gain.value = e);
  };
  LGAudioMediaSource.prototype.onConnectionsChange = a.onConnectionsChange;
  LGAudioMediaSource.prototype.onGetInputs = function () {
    return [
      ["playbackRate", "number"],
      ["Play", e.ACTION],
      ["Stop", e.ACTION],
    ];
  };
  LGAudioMediaSource.title = "MediaSource";
  LGAudioMediaSource.desc = "Plays microphone";
  e.registerNodeType("audio/media_source", LGAudioMediaSource);
  function LGAudioAnalyser() {
    (this || _global).properties = {
      fftSize: 2048,
      minDecibels: -100,
      maxDecibels: -10,
      smoothingTimeConstant: 0.5,
    };
    var t = a.getAudioContext();
    (this || _global).audionode = t.createAnalyser();
    (this || _global).audionode.graphnode = this || _global;
    (this || _global).audionode.fftSize = (this || _global).properties.fftSize;
    (this || _global).audionode.minDecibels = (
      this || _global
    ).properties.minDecibels;
    (this || _global).audionode.maxDecibels = (
      this || _global
    ).properties.maxDecibels;
    (this || _global).audionode.smoothingTimeConstant = (
      this || _global
    ).properties.smoothingTimeConstant;
    this.addInput("in", "audio");
    this.addOutput("freqs", "array");
    this.addOutput("samples", "array");
    (this || _global)._freq_bin = null;
    (this || _global)._time_bin = null;
  }
  LGAudioAnalyser.prototype.onPropertyChanged = function (t, e) {
    (this || _global).audionode[t] = e;
  };
  LGAudioAnalyser.prototype.onExecute = function () {
    if (this.isOutputConnected(0)) {
      var t = (this || _global).audionode.frequencyBinCount;
      ((this || _global)._freq_bin &&
        (this || _global)._freq_bin.length == t) ||
        ((this || _global)._freq_bin = new Uint8Array(t));
      (this || _global).audionode.getByteFrequencyData(
        (this || _global)._freq_bin
      );
      this.setOutputData(0, (this || _global)._freq_bin);
    }
    if (this.isOutputConnected(1)) {
      t = (this || _global).audionode.frequencyBinCount;
      ((this || _global)._time_bin &&
        (this || _global)._time_bin.length == t) ||
        ((this || _global)._time_bin = new Uint8Array(t));
      (this || _global).audionode.getByteTimeDomainData(
        (this || _global)._time_bin
      );
      this.setOutputData(1, (this || _global)._time_bin);
    }
    for (var e = 1; e < (this || _global).inputs.length; ++e) {
      var a = (this || _global).inputs[e];
      if (null != a.link) {
        var o = this.getInputData(e);
        void 0 !== o && ((this || _global).audionode[a.name].value = o);
      }
    }
  };
  LGAudioAnalyser.prototype.onGetInputs = function () {
    return [
      ["minDecibels", "number"],
      ["maxDecibels", "number"],
      ["smoothingTimeConstant", "number"],
    ];
  };
  LGAudioAnalyser.prototype.onGetOutputs = function () {
    return [
      ["freqs", "array"],
      ["samples", "array"],
    ];
  };
  LGAudioAnalyser.title = "Analyser";
  LGAudioAnalyser.desc = "Audio Analyser";
  e.registerNodeType("audio/analyser", LGAudioAnalyser);
  function LGAudioGain() {
    (this || _global).properties = { gain: 1 };
    (this || _global).audionode = a.getAudioContext().createGain();
    this.addInput("in", "audio");
    this.addInput("gain", "number");
    this.addOutput("out", "audio");
  }
  LGAudioGain.prototype.onExecute = function () {
    if ((this || _global).inputs && (this || _global).inputs.length)
      for (var t = 1; t < (this || _global).inputs.length; ++t) {
        var e = (this || _global).inputs[t];
        var a = this.getInputData(t);
        void 0 !== a && ((this || _global).audionode[e.name].value = a);
      }
  };
  a.createAudioNodeWrapper(LGAudioGain);
  LGAudioGain.title = "Gain";
  LGAudioGain.desc = "Audio gain";
  e.registerNodeType("audio/gain", LGAudioGain);
  function LGAudioConvolver() {
    (this || _global).properties = { impulse_src: "", normalize: true };
    (this || _global).audionode = a.getAudioContext().createConvolver();
    this.addInput("in", "audio");
    this.addOutput("out", "audio");
  }
  a.createAudioNodeWrapper(LGAudioConvolver);
  LGAudioConvolver.prototype.onRemove = function () {
    (this || _global)._dropped_url &&
      URL.revokeObjectURL((this || _global)._dropped_url);
  };
  LGAudioConvolver.prototype.onPropertyChanged = function (t, e) {
    "impulse_src" == t
      ? this.loadImpulse(e)
      : "normalize" == t && ((this || _global).audionode.normalize = e);
  };
  LGAudioConvolver.prototype.onDropFile = function (t) {
    (this || _global)._dropped_url &&
      URL.revokeObjectURL((this || _global)._dropped_url);
    (this || _global)._dropped_url = URL.createObjectURL(t);
    (this || _global).properties.impulse_src = (this || _global)._dropped_url;
    this.loadImpulse((this || _global)._dropped_url);
  };
  LGAudioConvolver.prototype.loadImpulse = function (t) {
    var e = this || _global;
    if ((this || _global)._request) {
      (this || _global)._request.abort();
      (this || _global)._request = null;
    }
    (this || _global)._impulse_buffer = null;
    (this || _global)._loading_impulse = false;
    if (t) {
      (this || _global)._request = a.loadSound(t, inner);
      (this || _global)._loading_impulse = true;
    }
    function inner(t) {
      e._impulse_buffer = t;
      e.audionode.buffer = t;
      console.log("Impulse signal set");
      e._loading_impulse = false;
    }
  };
  LGAudioConvolver.title = "Convolver";
  LGAudioConvolver.desc = "Convolves the signal (used for reverb)";
  e.registerNodeType("audio/convolver", LGAudioConvolver);
  function LGAudioDynamicsCompressor() {
    (this || _global).properties = {
      threshold: -50,
      knee: 40,
      ratio: 12,
      reduction: -20,
      attack: 0,
      release: 0.25,
    };
    (this || _global).audionode = a
      .getAudioContext()
      .createDynamicsCompressor();
    this.addInput("in", "audio");
    this.addOutput("out", "audio");
  }
  a.createAudioNodeWrapper(LGAudioDynamicsCompressor);
  LGAudioDynamicsCompressor.prototype.onExecute = function () {
    if ((this || _global).inputs && (this || _global).inputs.length)
      for (var t = 1; t < (this || _global).inputs.length; ++t) {
        var e = (this || _global).inputs[t];
        if (null != e.link) {
          var a = this.getInputData(t);
          void 0 !== a && ((this || _global).audionode[e.name].value = a);
        }
      }
  };
  LGAudioDynamicsCompressor.prototype.onGetInputs = function () {
    return [
      ["threshold", "number"],
      ["knee", "number"],
      ["ratio", "number"],
      ["reduction", "number"],
      ["attack", "number"],
      ["release", "number"],
    ];
  };
  LGAudioDynamicsCompressor.title = "DynamicsCompressor";
  LGAudioDynamicsCompressor.desc = "Dynamics Compressor";
  e.registerNodeType("audio/dynamicsCompressor", LGAudioDynamicsCompressor);
  function LGAudioWaveShaper() {
    (this || _global).properties = {};
    (this || _global).audionode = a.getAudioContext().createWaveShaper();
    this.addInput("in", "audio");
    this.addInput("shape", "waveshape");
    this.addOutput("out", "audio");
  }
  LGAudioWaveShaper.prototype.onExecute = function () {
    if ((this || _global).inputs && (this || _global).inputs.length) {
      var t = this.getInputData(1);
      void 0 !== t && ((this || _global).audionode.curve = t);
    }
  };
  LGAudioWaveShaper.prototype.setWaveShape = function (t) {
    (this || _global).audionode.curve = t;
  };
  a.createAudioNodeWrapper(LGAudioWaveShaper);
  function LGAudioMixer() {
    (this || _global).properties = { gain1: 0.5, gain2: 0.5 };
    (this || _global).audionode = a.getAudioContext().createGain();
    (this || _global).audionode1 = a.getAudioContext().createGain();
    (this || _global).audionode1.gain.value = (
      this || _global
    ).properties.gain1;
    (this || _global).audionode2 = a.getAudioContext().createGain();
    (this || _global).audionode2.gain.value = (
      this || _global
    ).properties.gain2;
    (this || _global).audionode1.connect((this || _global).audionode);
    (this || _global).audionode2.connect((this || _global).audionode);
    this.addInput("in1", "audio");
    this.addInput("in1 gain", "number");
    this.addInput("in2", "audio");
    this.addInput("in2 gain", "number");
    this.addOutput("out", "audio");
  }
  LGAudioMixer.prototype.getAudioNodeInInputSlot = function (t) {
    return 0 == t
      ? (this || _global).audionode1
      : 2 == t
      ? (this || _global).audionode2
      : void 0;
  };
  LGAudioMixer.prototype.onPropertyChanged = function (t, e) {
    "gain1" == t
      ? ((this || _global).audionode1.gain.value = e)
      : "gain2" == t && ((this || _global).audionode2.gain.value = e);
  };
  LGAudioMixer.prototype.onExecute = function () {
    if ((this || _global).inputs && (this || _global).inputs.length)
      for (var t = 1; t < (this || _global).inputs.length; ++t) {
        var e = (this || _global).inputs[t];
        if (null != e.link && "audio" != e.type) {
          var a = this.getInputData(t);
          void 0 !== a &&
            (1 == t
              ? ((this || _global).audionode1.gain.value = a)
              : 3 == t && ((this || _global).audionode2.gain.value = a));
        }
      }
  };
  a.createAudioNodeWrapper(LGAudioMixer);
  LGAudioMixer.title = "Mixer";
  LGAudioMixer.desc = "Audio mixer";
  e.registerNodeType("audio/mixer", LGAudioMixer);
  function LGAudioADSR() {
    (this || _global).properties = { A: 0.1, D: 0.1, S: 0.1, R: 0.1 };
    (this || _global).audionode = a.getAudioContext().createGain();
    (this || _global).audionode.gain.value = 0;
    this.addInput("in", "audio");
    this.addInput("gate", "boolean");
    this.addOutput("out", "audio");
    (this || _global).gate = false;
  }
  LGAudioADSR.prototype.onExecute = function () {
    var t = a.getAudioContext();
    var e = t.currentTime;
    var o = (this || _global).audionode;
    var r = o.gain;
    var l = this.getInputData(1);
    var n = this.getInputOrProperty("A");
    var s = this.getInputOrProperty("D");
    var u = this.getInputOrProperty("S");
    var h = this.getInputOrProperty("R");
    if (!(this || _global).gate && l) {
      r.cancelScheduledValues(0);
      r.setValueAtTime(0, e);
      r.linearRampToValueAtTime(1, e + n);
      r.linearRampToValueAtTime(u, e + n + s);
    } else if ((this || _global).gate && !l) {
      r.cancelScheduledValues(0);
      r.setValueAtTime(r.value, e);
      r.linearRampToValueAtTime(0, e + h);
    }
    (this || _global).gate = l;
  };
  LGAudioADSR.prototype.onGetInputs = function () {
    return [
      ["A", "number"],
      ["D", "number"],
      ["S", "number"],
      ["R", "number"],
    ];
  };
  a.createAudioNodeWrapper(LGAudioADSR);
  LGAudioADSR.title = "ADSR";
  LGAudioADSR.desc = "Audio envelope";
  e.registerNodeType("audio/adsr", LGAudioADSR);
  function LGAudioDelay() {
    (this || _global).properties = { delayTime: 0.5 };
    (this || _global).audionode = a.getAudioContext().createDelay(10);
    (this || _global).audionode.delayTime.value = (
      this || _global
    ).properties.delayTime;
    this.addInput("in", "audio");
    this.addInput("time", "number");
    this.addOutput("out", "audio");
  }
  a.createAudioNodeWrapper(LGAudioDelay);
  LGAudioDelay.prototype.onExecute = function () {
    var t = this.getInputData(1);
    void 0 !== t && ((this || _global).audionode.delayTime.value = t);
  };
  LGAudioDelay.title = "Delay";
  LGAudioDelay.desc = "Audio delay";
  e.registerNodeType("audio/delay", LGAudioDelay);
  function LGAudioBiquadFilter() {
    (this || _global).properties = { frequency: 350, detune: 0, Q: 1 };
    this.addProperty("type", "lowpass", "enum", {
      values: [
        "lowpass",
        "highpass",
        "bandpass",
        "lowshelf",
        "highshelf",
        "peaking",
        "notch",
        "allpass",
      ],
    });
    (this || _global).audionode = a.getAudioContext().createBiquadFilter();
    this.addInput("in", "audio");
    this.addOutput("out", "audio");
  }
  LGAudioBiquadFilter.prototype.onExecute = function () {
    if ((this || _global).inputs && (this || _global).inputs.length)
      for (var t = 1; t < (this || _global).inputs.length; ++t) {
        var e = (this || _global).inputs[t];
        if (null != e.link) {
          var a = this.getInputData(t);
          void 0 !== a && ((this || _global).audionode[e.name].value = a);
        }
      }
  };
  LGAudioBiquadFilter.prototype.onGetInputs = function () {
    return [
      ["frequency", "number"],
      ["detune", "number"],
      ["Q", "number"],
    ];
  };
  a.createAudioNodeWrapper(LGAudioBiquadFilter);
  LGAudioBiquadFilter.title = "BiquadFilter";
  LGAudioBiquadFilter.desc = "Audio filter";
  e.registerNodeType("audio/biquadfilter", LGAudioBiquadFilter);
  function LGAudioOscillatorNode() {
    (this || _global).properties = { frequency: 440, detune: 0, type: "sine" };
    this.addProperty("type", "sine", "enum", {
      values: ["sine", "square", "sawtooth", "triangle", "custom"],
    });
    (this || _global).audionode = a.getAudioContext().createOscillator();
    this.addOutput("out", "audio");
  }
  LGAudioOscillatorNode.prototype.onStart = function () {
    if (!(this || _global).audionode.started) {
      (this || _global).audionode.started = true;
      try {
        (this || _global).audionode.start();
      } catch (t) {}
    }
  };
  LGAudioOscillatorNode.prototype.onStop = function () {
    if ((this || _global).audionode.started) {
      (this || _global).audionode.started = false;
      (this || _global).audionode.stop();
    }
  };
  LGAudioOscillatorNode.prototype.onPause = function () {
    this.onStop();
  };
  LGAudioOscillatorNode.prototype.onUnpause = function () {
    this.onStart();
  };
  LGAudioOscillatorNode.prototype.onExecute = function () {
    if ((this || _global).inputs && (this || _global).inputs.length)
      for (var t = 0; t < (this || _global).inputs.length; ++t) {
        var e = (this || _global).inputs[t];
        if (null != e.link) {
          var a = this.getInputData(t);
          void 0 !== a && ((this || _global).audionode[e.name].value = a);
        }
      }
  };
  LGAudioOscillatorNode.prototype.onGetInputs = function () {
    return [
      ["frequency", "number"],
      ["detune", "number"],
      ["type", "string"],
    ];
  };
  a.createAudioNodeWrapper(LGAudioOscillatorNode);
  LGAudioOscillatorNode.title = "Oscillator";
  LGAudioOscillatorNode.desc = "Oscillator";
  e.registerNodeType("audio/oscillator", LGAudioOscillatorNode);
  function LGAudioVisualization() {
    (this || _global).properties = { continuous: true, mark: -1 };
    this.addInput("data", "array");
    this.addInput("mark", "number");
    (this || _global).size = [300, 200];
    (this || _global)._last_buffer = null;
  }
  LGAudioVisualization.prototype.onExecute = function () {
    (this || _global)._last_buffer = this.getInputData(0);
    var t = this.getInputData(1);
    void 0 !== t && ((this || _global).properties.mark = t);
    this.setDirtyCanvas(true, false);
  };
  LGAudioVisualization.prototype.onDrawForeground = function (t) {
    if ((this || _global)._last_buffer) {
      var e = (this || _global)._last_buffer;
      var o = e.length / (this || _global).size[0];
      var r = (this || _global).size[1];
      t.fillStyle = "black";
      t.fillRect(0, 0, (this || _global).size[0], (this || _global).size[1]);
      t.strokeStyle = "white";
      t.beginPath();
      var l = 0;
      if ((this || _global).properties.continuous) {
        t.moveTo(l, r);
        for (var n = 0; n < e.length; n += o) {
          t.lineTo(l, r - (e[0 | n] / 255) * r);
          l++;
        }
      } else
        for (n = 0; n < e.length; n += o) {
          t.moveTo(l + 0.5, r);
          t.lineTo(l + 0.5, r - (e[0 | n] / 255) * r);
          l++;
        }
      t.stroke();
      if ((this || _global).properties.mark >= 0) {
        var s = a.getAudioContext().sampleRate;
        var u = s / e.length;
        l = (((this || _global).properties.mark / u) * 2) / o;
        l >= (this || _global).size[0] && (l = (this || _global).size[0] - 1);
        t.strokeStyle = "red";
        t.beginPath();
        t.moveTo(l, r);
        t.lineTo(l, 0);
        t.stroke();
      }
    }
  };
  LGAudioVisualization.title = "Visualization";
  LGAudioVisualization.desc = "Audio Visualization";
  e.registerNodeType("audio/visualization", LGAudioVisualization);
  function LGAudioBandSignal() {
    (this || _global).properties = { band: 440, amplitude: 1 };
    this.addInput("freqs", "array");
    this.addOutput("signal", "number");
  }
  LGAudioBandSignal.prototype.onExecute = function () {
    (this || _global)._freqs = this.getInputData(0);
    if ((this || _global)._freqs) {
      var t = (this || _global).properties.band;
      var e = this.getInputData(1);
      void 0 !== e && (t = e);
      var o = a.getAudioContext().sampleRate;
      var r = o / (this || _global)._freqs.length;
      var l = (t / r) * 2;
      e = 0;
      l < 0 && (e = (this || _global)._freqs[0]);
      if (l >= (this || _global)._freqs.length)
        e = (this || _global)._freqs[(this || _global)._freqs.length - 1];
      else {
        var n = 0 | l;
        var s = (this || _global)._freqs[n];
        var u = (this || _global)._freqs[n + 1];
        var h = l - n;
        e = s * (1 - h) + u * h;
      }
      this.setOutputData(0, (e / 255) * (this || _global).properties.amplitude);
    }
  };
  LGAudioBandSignal.prototype.onGetInputs = function () {
    return [["band", "number"]];
  };
  LGAudioBandSignal.title = "Signal";
  LGAudioBandSignal.desc = "extract the signal of some frequency";
  e.registerNodeType("audio/signal", LGAudioBandSignal);
  function LGAudioScript() {
    if (!LGAudioScript.default_code) {
      var t = LGAudioScript.default_function.toString();
      var e = t.indexOf("{") + 1;
      var o = t.lastIndexOf("}");
      LGAudioScript.default_code = t.substr(e, o - e);
    }
    (this || _global).properties = { code: LGAudioScript.default_code };
    var r = a.getAudioContext();
    if (r.createScriptProcessor)
      (this || _global).audionode = r.createScriptProcessor(4096, 1, 1);
    else {
      console.warn("ScriptProcessorNode deprecated");
      (this || _global).audionode = r.createGain();
    }
    this.processCode();
    LGAudioScript._bypass_function ||
      (LGAudioScript._bypass_function = (
        this || _global
      ).audionode.onaudioprocess);
    this.addInput("in", "audio");
    this.addOutput("out", "audio");
  }
  LGAudioScript.prototype.onAdded = function (t) {
    t.status == LGraph.STATUS_RUNNING &&
      ((this || _global).audionode.onaudioprocess = (
        this || _global
      )._callback);
  };
  LGAudioScript["@code"] = { widget: "code", type: "code" };
  LGAudioScript.prototype.onStart = function () {
    (this || _global).audionode.onaudioprocess = (this || _global)._callback;
  };
  LGAudioScript.prototype.onStop = function () {
    (this || _global).audionode.onaudioprocess = LGAudioScript._bypass_function;
  };
  LGAudioScript.prototype.onPause = function () {
    (this || _global).audionode.onaudioprocess = LGAudioScript._bypass_function;
  };
  LGAudioScript.prototype.onUnpause = function () {
    (this || _global).audionode.onaudioprocess = (this || _global)._callback;
  };
  LGAudioScript.prototype.onExecute = function () {};
  LGAudioScript.prototype.onRemoved = function () {
    (this || _global).audionode.onaudioprocess = LGAudioScript._bypass_function;
  };
  LGAudioScript.prototype.processCode = function () {
    try {
      var t = new Function("properties", (this || _global).properties.code);
      (this || _global)._script = new t((this || _global).properties);
      (this || _global)._old_code = (this || _global).properties.code;
      (this || _global)._callback = (this || _global)._script.onaudioprocess;
    } catch (t) {
      console.error("Error in onaudioprocess code", t);
      (this || _global)._callback = LGAudioScript._bypass_function;
      (this || _global).audionode.onaudioprocess = (this || _global)._callback;
    }
  };
  LGAudioScript.prototype.onPropertyChanged = function (t, e) {
    if ("code" == t) {
      (this || _global).properties.code = e;
      this.processCode();
      (this || _global).graph &&
        (this || _global).graph.status == LGraph.STATUS_RUNNING &&
        ((this || _global).audionode.onaudioprocess = (
          this || _global
        )._callback);
    }
  };
  LGAudioScript.default_function = function () {
    (this || _global).onaudioprocess = function (t) {
      var e = t.inputBuffer;
      var a = t.outputBuffer;
      for (var o = 0; o < a.numberOfChannels; o++) {
        var r = e.getChannelData(o);
        var l = a.getChannelData(o);
        for (var n = 0; n < e.length; n++) l[n] = r[n];
      }
    };
  };
  a.createAudioNodeWrapper(LGAudioScript);
  LGAudioScript.title = "Script";
  LGAudioScript.desc = "apply script to signal";
  e.registerNodeType("audio/script", LGAudioScript);
  function LGAudioDestination() {
    (this || _global).audionode = a.getAudioContext().destination;
    this.addInput("in", "audio");
  }
  LGAudioDestination.title = "Destination";
  LGAudioDestination.desc = "Audio output";
  e.registerNodeType("audio/destination", LGAudioDestination);
})(exports);
(function (t) {
  var e = t.LiteGraph;
  function LGWebSocket() {
    (this || _global).size = [60, 20];
    this.addInput("send", e.ACTION);
    this.addOutput("received", e.EVENT);
    this.addInput("in", 0);
    this.addOutput("out", 0);
    (this || _global).properties = {
      url: "",
      room: "lgraph",
      only_send_changes: true,
    };
    (this || _global)._ws = null;
    (this || _global)._last_sent_data = [];
    (this || _global)._last_received_data = [];
  }
  LGWebSocket.title = "WebSocket";
  LGWebSocket.desc = "Send data through a websocket";
  LGWebSocket.prototype.onPropertyChanged = function (t, e) {
    "url" == t && this.connectSocket();
  };
  LGWebSocket.prototype.onExecute = function () {
    !(this || _global)._ws &&
      (this || _global).properties.url &&
      this.connectSocket();
    if (
      (this || _global)._ws &&
      (this || _global)._ws.readyState == WebSocket.OPEN
    ) {
      var t = (this || _global).properties.room;
      var e = (this || _global).properties.only_send_changes;
      for (var a = 1; a < (this || _global).inputs.length; ++a) {
        var o = this.getInputData(a);
        if (null != o) {
          var r;
          try {
            r = JSON.stringify({ type: 0, room: t, channel: a, data: o });
          } catch (t) {
            continue;
          }
          if (!e || (this || _global)._last_sent_data[a] != r) {
            (this || _global)._last_sent_data[a] = r;
            (this || _global)._ws.send(r);
          }
        }
      }
      for (a = 1; a < (this || _global).outputs.length; ++a)
        this.setOutputData(a, (this || _global)._last_received_data[a]);
      "#AFA" == (this || _global).boxcolor &&
        ((this || _global).boxcolor = "#6C6");
    }
  };
  LGWebSocket.prototype.connectSocket = function () {
    var t = this || _global;
    var a = (this || _global).properties.url;
    "ws" != a.substr(0, 2) && (a = "ws://" + a);
    (this || _global)._ws = new WebSocket(a);
    (this || _global)._ws.onopen = function () {
      console.log("ready");
      t.boxcolor = "#6C6";
    };
    (this || _global)._ws.onmessage = function (a) {
      t.boxcolor = "#AFA";
      var o = JSON.parse(a.data);
      if (!o.room || o.room == t.properties.room)
        if (1 == o.type)
          if (o.data.object_class && e[o.data.object_class]) {
            var r = null;
            try {
              r = new e[o.data.object_class](o.data);
              t.triggerSlot(0, r);
            } catch (t) {
              return;
            }
          } else t.triggerSlot(0, o.data);
        else t._last_received_data[o.channel || 0] = o.data;
    };
    (this || _global)._ws.onerror = function (e) {
      console.log("couldnt connect to websocket");
      t.boxcolor = "#E88";
    };
    (this || _global)._ws.onclose = function (e) {
      console.log("connection closed");
      t.boxcolor = "#000";
    };
  };
  LGWebSocket.prototype.send = function (t) {
    (this || _global)._ws &&
      (this || _global)._ws.readyState == WebSocket.OPEN &&
      (this || _global)._ws.send(JSON.stringify({ type: 1, msg: t }));
  };
  LGWebSocket.prototype.onAction = function (t, e) {
    (this || _global)._ws &&
      (this || _global)._ws.readyState == WebSocket.OPEN &&
      (this || _global)._ws.send({
        type: 1,
        room: (this || _global).properties.room,
        action: t,
        data: e,
      });
  };
  LGWebSocket.prototype.onGetInputs = function () {
    return [["in", 0]];
  };
  LGWebSocket.prototype.onGetOutputs = function () {
    return [["out", 0]];
  };
  e.registerNodeType("network/websocket", LGWebSocket);
  function LGSillyClient() {
    (this || _global).room_widget = this.addWidget(
      "text",
      "Room",
      "lgraph",
      (this || _global).setRoom.bind(this || _global)
    );
    this.addWidget(
      "button",
      "Reconnect",
      null,
      (this || _global).connectSocket.bind(this || _global)
    );
    this.addInput("send", e.ACTION);
    this.addOutput("received", e.EVENT);
    this.addInput("in", 0);
    this.addOutput("out", 0);
    (this || _global).properties = {
      url: "tamats.com:55000",
      room: "lgraph",
      only_send_changes: true,
    };
    (this || _global)._server = null;
    this.connectSocket();
    (this || _global)._last_sent_data = [];
    (this || _global)._last_received_data = [];
    "undefined" == typeof SillyClient &&
      console.warn(
        "remember to add SillyClient.js to your project: https://tamats.com/projects/sillyserver/src/sillyclient.js"
      );
  }
  LGSillyClient.title = "SillyClient";
  LGSillyClient.desc = "Connects to SillyServer to broadcast messages";
  LGSillyClient.prototype.onPropertyChanged = function (t, e) {
    "room" == t && ((this || _global).room_widget.value = e);
    this.connectSocket();
  };
  LGSillyClient.prototype.setRoom = function (t) {
    (this || _global).properties.room = t;
    (this || _global).room_widget.value = t;
    this.connectSocket();
  };
  LGSillyClient.prototype.onDrawForeground = function () {
    for (var t = 1; t < (this || _global).inputs.length; ++t) {
      var e = (this || _global).inputs[t];
      e.label = "in_" + t;
    }
    for (t = 1; t < (this || _global).outputs.length; ++t) {
      e = (this || _global).outputs[t];
      e.label = "out_" + t;
    }
  };
  LGSillyClient.prototype.onExecute = function () {
    if ((this || _global)._server && (this || _global)._server.is_connected) {
      var t = (this || _global).properties.only_send_changes;
      for (var e = 1; e < (this || _global).inputs.length; ++e) {
        var a = this.getInputData(e);
        var o = (this || _global)._last_sent_data[e];
        if (null != a) {
          if (t) {
            var r = true;
            if (
              a &&
              a.length &&
              o &&
              o.length == a.length &&
              a.constructor !== String
            ) {
              for (var l = 0; l < a.length; ++l)
                if (o[l] != a[l]) {
                  r = false;
                  break;
                }
            } else (this || _global)._last_sent_data[e] != a && (r = false);
            if (r) continue;
          }
          (this || _global)._server.sendMessage({
            type: 0,
            channel: e,
            data: a,
          });
          if (a.length && a.constructor !== String)
            if ((this || _global)._last_sent_data[e]) {
              (this || _global)._last_sent_data[e].length = a.length;
              for (l = 0; l < a.length; ++l)
                (this || _global)._last_sent_data[e][l] = a[l];
            } else
              a.constructor === Array
                ? ((this || _global)._last_sent_data[e] = a.concat())
                : ((this || _global)._last_sent_data[e] = new a.constructor(a));
          else (this || _global)._last_sent_data[e] = a;
        }
      }
      for (e = 1; e < (this || _global).outputs.length; ++e)
        this.setOutputData(e, (this || _global)._last_received_data[e]);
      "#AFA" == (this || _global).boxcolor &&
        ((this || _global).boxcolor = "#6C6");
    }
  };
  LGSillyClient.prototype.connectSocket = function () {
    var t = this || _global;
    if ("undefined" != typeof SillyClient) {
      (this || _global)._server = new SillyClient();
      (this || _global)._server.on_ready = function () {
        console.log("ready");
        t.boxcolor = "#6C6";
      };
      (this || _global)._server.on_message = function (a, o) {
        var r = null;
        try {
          r = JSON.parse(o);
        } catch (t) {
          return;
        }
        if (1 == r.type)
          if (r.data.object_class && e[r.data.object_class]) {
            var l = null;
            try {
              l = new e[r.data.object_class](r.data);
              t.triggerSlot(0, l);
            } catch (t) {
              return;
            }
          } else t.triggerSlot(0, r.data);
        else t._last_received_data[r.channel || 0] = r.data;
        t.boxcolor = "#AFA";
      };
      (this || _global)._server.on_error = function (e) {
        console.log("couldnt connect to websocket");
        t.boxcolor = "#E88";
      };
      (this || _global)._server.on_close = function (e) {
        console.log("connection closed");
        t.boxcolor = "#000";
      };
      if (
        (this || _global).properties.url &&
        (this || _global).properties.room
      ) {
        try {
          (this || _global)._server.connect(
            (this || _global).properties.url,
            (this || _global).properties.room
          );
        } catch (t) {
          console.error("SillyServer error: " + t);
          (this || _global)._server = null;
          return;
        }
        (this || _global)._final_url =
          (this || _global).properties.url +
          "/" +
          (this || _global).properties.room;
      }
    } else {
      (this || _global)._error ||
        console.error(
          "SillyClient node cannot be used, you must include SillyServer.js"
        );
      (this || _global)._error = true;
    }
  };
  LGSillyClient.prototype.send = function (t) {
    (this || _global)._server &&
      (this || _global)._server.is_connected &&
      (this || _global)._server.sendMessage({ type: 1, data: t });
  };
  LGSillyClient.prototype.onAction = function (t, e) {
    (this || _global)._server &&
      (this || _global)._server.is_connected &&
      (this || _global)._server.sendMessage({ type: 1, action: t, data: e });
  };
  LGSillyClient.prototype.onGetInputs = function () {
    return [["in", 0]];
  };
  LGSillyClient.prototype.onGetOutputs = function () {
    return [["out", 0]];
  };
  e.registerNodeType("network/sillyclient", LGSillyClient);
})(exports);
const LiteGraph = exports.LiteGraph;
export { LiteGraph, exports as default };
