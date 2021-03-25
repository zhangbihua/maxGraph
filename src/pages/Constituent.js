/**
 * Copyright (c) 2006-2013, JGraph Ltd
 *
 * Consistuent. This example demonstrates using
 * cells as parts of other cells.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxGraphHandler from "../mxgraph/handler/mxGraphHandler";
import mxClient from "../mxgraph/mxClient";

class Constituent extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Consistuent</h1>

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '241px',
            background: 'url("editors/images/grid.gif")',
            cursor: 'default',
          }}
        />
      </>
    );
  };

  componentDidMount() {
    class MyCustomGraphHandler extends mxGraphHandler {
      /**
       * Redirects start drag to parent.
       */
      getInitialCellForEvent(me) {
        let cell = super.getInitialCellForEvent(me);
        if (this.graph.isPart(cell)) {
          cell = this.graph.getModel().getParent(cell);
        }
        return cell;
      }
    }

    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.el);

    class MyCustomGraph extends mxGraph {
      foldingEnabled = false;

      recursiveResize = true;

      isPart(cell) {
        // Helper method to mark parts with constituent=1 in the style
        return this.getCurrentCellStyle(cell).constituent == '1';
      }

      selectCellForEvent(cell, evt) {
        // Redirects selection to parent
        if (this.isPart(cell)) {
          cell = this.model.getParent(cell);
        }
        super.selectCellForEvent(cell, evt);
      }

      createGraphHandler() {
        return new MyCustomGraphHandler(this);
      }
    }

    // Creates the graph inside the given container
    const graph = new MyCustomGraph(this.el);

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, '', 20, 20, 120, 70);
      const v2 = graph.insertVertex(
        v1,
        null,
        'Constituent',
        20,
        20,
        80,
        30,
        'constituent=1;'
      );
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Constituent;
