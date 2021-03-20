/*
 *  Copyright (c) 2006-2018, JGraph Ltd
 *
 *  Hello, World! example for mxGraph. This example demonstrates using
 *  a DOM node to create a graph and adding vertices and edges.
*/

import React from "react";
import mxGraph from "../js/view/mxGraph";
import mxRubberband from "../js/handler/mxRubberband";

class HelloWorld extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph with a grid wallpaper
    return <>
      <h1>Hello, World! example for mxGraph</h1>

      <div ref={ el => {this.el = el;} }
           style={{
             position: "relative",
             overflow: "hidden",
             width: "321px",
             height: "241px",
             background: "url('editors/images/grid.gif')",
             cursor: "default"
           }}/>
    </>;
  }

  componentDidMount() {
    // FIXME!!
    let mxBasePath = '../src';

    // Create a sample graph in the DOM node with the specified ID.
    mxEvent.disableContextMenu(this.el);  // Disable the built-in context menu
    let graph = new mxGraph(this.el);     // Create the graph inside the given container
    new mxRubberband(graph);              // Enable rubberband selection

    // Get the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    let parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      let v1 = graph.insertVertex({
        id: null,
        parent: parent,
        value: 'Hello,',
        position: [20, 20],
        size: [80, 30]
      });
      let v2 = graph.insertVertex({
        id: null,
        parent: parent,
        value: 'World!',
        position: [200, 150],
        size: [80, 30]
      });
      graph.insertEdge({
        id: null,
        parent: parent,
        value: '',
        source: v1,
        target: v2
      });
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default HelloWorld;
