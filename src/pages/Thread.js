/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Thread example for mxGraph. This example demonstrates setting
  overlays in mxGraph from within a timed function.
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';

class Thread extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Thread example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            width: '321px',
            height: '241px',
            background: "url('editors/images/grid.gif')",
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Disables basic selection and cell handling
    graph.setEnabled(false);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();
    let v1;
    let v2;
    let e1;

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      e1 = graph.insertEdge(parent, null, '', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    // Function to switch the overlay every 5 secs
    const f = () => {
      const overlays = graph.getCellOverlays(v1);

      if (overlays == null) {
        graph.removeCellOverlays(v2);
        graph.setCellWarning(v1, 'Tooltip');
      } else {
        graph.removeCellOverlays(v1);
        graph.setCellWarning(v2, 'Tooltip');
      }
    };

    window.setInterval(f, 1000);
    f();
  }
}

export default Thread;
