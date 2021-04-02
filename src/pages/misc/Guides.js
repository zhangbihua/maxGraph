/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxGraphHandler from '../../mxgraph/handler/mxGraphHandler';
import mxEdgeHandler from '../../mxgraph/handler/mxEdgeHandler';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxEdgeStyle from '../../mxgraph/view/style/mxEdgeStyle';
import mxKeyHandler from '../../mxgraph/handler/mxKeyHandler';

class Guides extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Guides</h1>
        This example demonstrates the guides feature which aligns the current
        selection to the existing vertices in the graph. This feature is in RFC
        state. Creating a grid using a canvas and installing a key handler for
        cursor keys is also demonstrated here, as well as snapping waypoints to
        terminals.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            height: '601px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;

    // Alt disables guides
    mxGraphHandler.prototype.useGuidesForEvent = function(me) {
      return !mxEvent.isAltDown(me.getEvent());
    };

    // Defines the guides to be red (default)
    mxConstants.GUIDE_COLOR = '#FF0000';

    // Defines the guides to be 1 pixel (default)
    mxConstants.GUIDE_STROKEWIDTH = 1;

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setConnectable(true);
    graph.gridSize = 30;

    // Changes the default style for edges "in-place" and assigns
    // an alternate edge style which is applied in mxGraph.flip
    // when the user double clicks on the adjustment control point
    // of the edge. The ElbowConnector edge style switches to TopToBottom
    // if the horizontal style is true.
    const style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    graph.alternateEdgeStyle = 'elbow=vertical';

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    let v1;
    try {
      v1 = graph.insertVertex(parent, null, 'Hello,', 20, 40, 80, 70);
      const v2 = graph.insertVertex(parent, null, 'World!', 200, 140, 80, 40);
      const e1 = graph.insertEdge(parent, null, '', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    // Handles cursor keys
    const nudge = function(keyCode) {
      if (!graph.isSelectionEmpty()) {
        let dx = 0;
        let dy = 0;

        if (keyCode === 37) {
          dx = -1;
        } else if (keyCode === 38) {
          dy = -1;
        } else if (keyCode === 39) {
          dx = 1;
        } else if (keyCode === 40) {
          dy = 1;
        }

        graph.moveCells(graph.getSelectionCells(), dx, dy);
      }

      // Transfer initial focus to graph container for keystroke handling
      graph.container.focus();

      // Handles keystroke events
      const keyHandler = new mxKeyHandler(graph);

      // Ignores enter keystroke. Remove this line if you want the
      // enter keystroke to stop editing
      keyHandler.enter = function() {};

      keyHandler.bindKey(37, function() {
        nudge(37);
      });

      keyHandler.bindKey(38, function() {
        nudge(38);
      });

      keyHandler.bindKey(39, function() {
        nudge(39);
      });

      keyHandler.bindKey(40, function() {
        nudge(40);
      });
    };
  }
}

export default Guides;
