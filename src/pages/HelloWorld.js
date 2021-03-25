/*
 *  Copyright (c) 2006-2018, JGraph Ltd
 *  Converted to ES9 syntax/React by David Morrissey 2021
 *
 *  Hello, World!. This example demonstrates using
 *  a DOM node to create a graph and adding vertices and edges.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';

class HelloWorld extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph with a grid wallpaper
    return (
      <>
        <h1>Hello, World!</h1>

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  };

  componentDidMount = () => {
    // FIXME!!
    const mxBasePath = '../src';

    // Create a sample graph in the DOM node with the specified ID.
    mxEvent.disableContextMenu(this.el); // Disable the built-in context menu
    const graph = new mxGraph(this.el); // Create the graph inside the given container
    new mxRubberband(graph); // Enable rubberband selection

    // Get the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    graph.batchUpdate(() => {
      // Add cells to the model in a single step
      const vertex1 = graph.insertVertex({
        parent,
        value: 'Hello',
        position: [20, 20],
        size: [80, 30],
        relative: false,
      });
      const vertex2 = graph.insertVertex({
        parent,
        value: 'World!',
        position: [200, 150],
        size: [80, 30],
        relative: false,
      });
      const edge = graph.insertEdge({
        parent,
        // value: 'to the',
        source: vertex1,
        target: vertex2,
      });
    });
  };
}

export default HelloWorld;
