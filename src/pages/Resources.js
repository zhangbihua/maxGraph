/**
 * Copyright (c) 2006-2018, JGraph Ltd
  

 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxClient from '../mxgraph/mxClient';

class Resources extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Resources</h1>
        This example demonstrates disabling the Synchronous XMLHttpRequest on
        main thread warning.
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
  }

  componentDidMount() {
    // Async indirection to load resources asynchronously (see above)
    // Alternatively you can remove the line that sets mxLoadResources
    // anove and change the code to not use this callback.

    mxClient.loadResources(() => {
      // Disables the built-in context menu
      mxEvent.disableContextMenu(this.el);

      // Creates the graph inside the given container
      const graph = new mxGraph(this.el);

      // Enables rubberband selection
      new mxRubberband(graph);

      // Gets the default parent for inserting new cells. This
      // is normally the first child of the root (ie. layer 0).
      const parent = graph.getDefaultParent();

      // Adds cells to the model in a single step
      graph.getModel().beginUpdate();
      try {
        const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
        const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
        const e1 = graph.insertEdge(parent, null, '', v1, v2);
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
      }
    });
  }
}

export default Resources;
