/*
 *  Copyright (c) 2006-2018, JGraph Ltd
 *  Converted to ES9 syntax/React by David Morrissey 2021
 *
 *  Hello, World! example for mxGraph. This example demonstrates using
 *  a DOM node to create a graph and adding vertices and edges.
*/

import React from "react";
import mxEvent from "../js/util/mxEvent";
import mxGraph from "../js/view/mxGraph";
import mxRubberband from "../js/handler/mxRubberband";

class HelloWorld extends React.Component {
  constructor(props) {
    super(props);
  }

  render=()=>{
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

  componentDidMount=()=>{
    // FIXME!!
    let mxBasePath = '../src';

    // Create a sample graph in the DOM node with the specified ID.
    mxEvent.disableContextMenu(this.el);  // Disable the built-in context menu
    let graph = new mxGraph(this.el);     // Create the graph inside the given container
    new mxRubberband(graph);              // Enable rubberband selection

    // Get the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    let parent = graph.getDefaultParent();

    graph.getModel().batchUpdate(() => {
      // Add cells to the model in a single step
      let vertex1 = graph.insertVertex({
        parent: parent,
        value: 'Hello',
        position: [20, 20],
        size: [80, 30]
      });
      let vertex2 = graph.insertVertex({
        parent: parent,
        value: 'World!',
        position: [200, 150],
        size: [80, 30]
      });
      graph.insertEdge({
        parent: parent,
        value: 'to the',
        source: vertex1,
        target: vertex2
      });
    });
  }
}

export default HelloWorld;
