/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Offpage. This example demonstrates creating
  offpage connectors in a graph and loading a new diagram on a
  single click.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxCellTracker from "../mxgraph/handler/mxCellTracker";
import mxConstants from "../mxgraph/util/mxConstants";

class OffPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Offpage connector</h1>

        <div
          ref={el => {
            this.el = el;
          }}
          style={{}}
        />
      </>
    );
  }

  componentDidMount() {
    // Use complete cell as highlight region
    mxConstants.ACTIVE_REGION = 1;

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.height = '80vhpx';
    container.style.background = 'url("editors/images/grid.gif")';

    this.el.appendChild(container);

    // Creates the graph inside the given container
    const graph = new mxGraph(container);
    graph.setEnabled(false);

    // Highlights offpage connectors
    const highlight = new mxCellTracker(graph, null, function(me) {
      const cell = me.getCell();

      if (
        cell != null &&
        cell.value != null &&
        typeof cell.value.create === 'function'
      ) {
        return cell;
      }

      return null;
    });

    // Handles clicks on offpage connectors and
    // executes function in user object
    graph.addListener(mxEvent.CLICK, function(source, evt) {
      const cell = evt.getProperty('cell');

      if (
        cell != null &&
        cell.value != null &&
        typeof cell.value.create === 'function'
      ) {
        cell.value.create();
      }
    });

    // Handles clicks on offpage connectors and
    // executes function in user object
    graph.getCursorForCell = function(cell) {
      if (
        cell != null &&
        cell.value != null &&
        typeof cell.value.create === 'function'
      ) {
        return 'pointer';
      }
    };

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    let first = null;
    let second = null;

    first = function() {
      const value = {
        toString() {
          return 'Next';
        },
        create: second,
      };

      // Adds cells to the model in a single step
      graph.getModel().beginUpdate();
      try {
        graph.getModel().setRoot(graph.getModel().createRoot());
        const parent = graph.getDefaultParent();

        const v1 = graph.insertVertex(
          parent,
          null,
          'Click',
          30,
          20,
          80,
          30,
          'fillColor=#FFFF88;strokeColor=#FF1A00'
        );
        const v2 = graph.insertVertex(
          parent,
          null,
          'Next',
          20,
          150,
          100,
          30,
          'fillColor=#FFFF88;strokeColor=#FF1A00'
        );
        const v3 = graph.insertVertex(
          parent,
          null,
          value,
          200,
          150,
          40,
          40,
          'shape=triangle;align=left;fillColor=#C3D9FF;strokeColor=#4096EE'
        );
        const e1 = graph.insertEdge(
          parent,
          null,
          null,
          v1,
          v2,
          'strokeColor=#FF1A00'
        );
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
      }
    };

    second = function() {
      const value = {
        toString() {
          return 'Prev';
        },
        create: first,
      };

      // Adds cells to the model in a single step
      graph.getModel().beginUpdate();
      try {
        graph.getModel().setRoot(graph.getModel().createRoot());
        const parent = graph.getDefaultParent();

        const v1 = graph.insertVertex(
          parent,
          null,
          'Click',
          30,
          20,
          80,
          30,
          'fillColor=#CDEB8B;strokeColor=#008C00'
        );
        const v2 = graph.insertVertex(
          parent,
          null,
          'Prev',
          220,
          20,
          100,
          30,
          'fillColor=#CDEB8B;strokeColor=#008C00'
        );
        const v3 = graph.insertVertex(
          parent,
          null,
          value,
          30,
          150,
          40,
          40,
          'shape=triangle;align=right;fillColor=#C3D9FF;strokeColor=#4096EE;direction=west'
        );
        const e1 = graph.insertEdge(
          parent,
          null,
          null,
          v1,
          v2,
          'strokeColor=#008C00'
        );
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
      }
    };

    first();
  }
}

export default OffPage;
