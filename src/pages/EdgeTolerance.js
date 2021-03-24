/**
 * Copyright (c) 2006-2013, JGraph Ltd
 *
 * Edge tolerance example for mxGraph. This example demonstrates increasing
 * the tolerance for hit detection on edges.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxUtils from '../mxgraph/util/mxUtils';

class EdgeTolerance extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Edge tolerance example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            width: '641px',
            height: '481px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    let el = this.el;

    class MyCustomGraph extends mxGraph {
      fireMouseEvent(evtName, me, sender) {
        // Overrides the mouse event dispatching mechanism to update the
        // cell which is associated with the event in case the native hit
        // detection did not return anything.

        // Checks if native hit detection did not return anything
        if (me.getState() == null) {
          // Updates the graph coordinates in the event since we need
          // them here. Storing them in the event means the overridden
          // method doesn't have to do this again.
          if (me.graphX == null || me.graphY == null) {
            const pt = mxUtils.convertPoint(el, me.getX(), me.getY());

            me.graphX = pt.x;
            me.graphY = pt.y;
          }

          const cell = this.getCellAt(me.graphX, me.graphY);

          if (this.getModel().isEdge(cell)) {
            me.state = this.view.getState(cell);

            if (me.state != null && me.state.shape != null) {
              this.container.style.cursor = me.state.shape.node.style.cursor;
            }
          }
        }

        if (me.state == null) {
          this.container.style.cursor = 'default';
        }

        super.fireMouseEvent(evtName, me, sender);
      };

      dblClick(evt, cell) {
        // Overrides double click handling to use the tolerance
        if (cell == null) {
          const pt = mxUtils.convertPoint(
            el,
            mxEvent.getClientX(evt),
            mxEvent.getClientY(evt)
          );
          cell = this.getCellAt(pt.x, pt.y);
        }

        super.dblClick(evt, cell);
      };
    }

    // Creates the graph inside the given container
    const graph = new MyCustomGraph(this.el);
    graph.setTolerance(20);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello,', 120, 120, 80, 30);
      const v2 = graph.insertVertex(parent, null, 'World!', 400, 250, 80, 30);
      const e1 = graph.insertEdge(
        parent,
        null,
        '',
        v1,
        v2,
        'edgeStyle=orthogonalEdgeStyle;'
      );
      const e2 = graph.insertEdge(
        parent,
        null,
        '',
        v2,
        v1,
        'edgeStyle=orthogonalEdgeStyle;'
      );
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default EdgeTolerance;
