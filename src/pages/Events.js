/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxConstants from '../mxgraph/util/mxConstants';
import mxEdgeStyle from '../mxgraph/view/mxEdgeStyle';
import mxKeyHandler from '../mxgraph/handler/mxKeyHandler';
import mxLayoutManager from '../mxgraph/view/mxLayoutManager';
import mxParallelEdgeLayout from '../mxgraph/layout/mxParallelEdgeLayout';
import mxConnectionHandler from '../mxgraph/handler/mxConnectionHandler';
import mxImage from '../mxgraph/util/mxImage';
import mxClient from '../mxgraph/mxClient';

class Events extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Events</h1>
        Events. This example demonstrates creating
        a graph container and using the mxDivResizer to update the size,
        interaction on the graph, including marquee selection, custom
        tooltips, context menu handling and changing the default menu
        opacity. It also demonstrates how to use an edgestyle in the
        default stylesheet, and handle the doubleclick on the adjustment
        point. See also: overlays.html for click event handling.

        <div
          ref={el => {
            this.el = el;
          }}
          style={{}}
        />
      </>
    );
  };

  componentDidMount() {
    // Program starts here. Creates a sample graph in the dynamically
    // created DOM node called container which is created below.

    class MyCustomConnectionHandler extends mxConnectionHandler {
      // Sets the image to be used for creating new connections
      connectImage = new mxImage('images/green-dot.gif', 14, 14);
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.overflow = 'hidden';
    container.style.left = '0px';
    container.style.top = '0px';
    container.style.right = '0px';
    container.style.bottom = '0px';
    container.style.background = 'url("editors/images/grid.gif")';

    // Disables built-in context menu
    mxEvent.disableContextMenu(container);
    this.el.appendChild(container);

    class MyCustomGraph extends mxGraph {
      alternateEdgeStyle = 'elbow=vertical';

      getTooltipForCell(cell) {
        // Installs a custom tooltip for cells
        return 'Doubleclick and right- or shiftclick';
      }

      createConnectionHandler() {
        return new MyCustomConnectionHandler(this);
      }
    }

    // Creates the graph inside the DOM node.
    // Optionally you can enable panning, tooltips and connections
    // using graph.setPanning(), setTooltips() & setConnectable().
    // To enable rubberband selection and basic keyboard events,
    // use new mxRubberband(graph) and new mxKeyHandler(graph).
    const graph = new MyCustomGraph(container);

    // Enables tooltips, new connections and panning
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.setConnectable(true);

    // Automatically handle parallel edges
    const layout = new mxParallelEdgeLayout(graph);
    const layoutMgr = new mxLayoutManager(graph);

    layoutMgr.getLayout = function(cell) {
      if (cell.getChildCount() > 0) {
        return layout;
      }
    };

    // Enables rubberband (marquee) selection and a handler
    // for basic keystrokes (eg. return, escape during editing).
    const rubberband = new mxRubberband(graph);
    const keyHandler = new mxKeyHandler(graph);

    // Changes the default style for edges "in-place" and assigns
    // an alternate edge style which is applied in mxGraph.flip
    // when the user double clicks on the adjustment control point
    // of the edge. The ElbowConnector edge style switches to TopToBottom
    // if the horizontal style is true.
    const style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;

    // Installs a popupmenu handler using local function (see below).
    graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
      return this.createPopupMenu(graph, menu, cell, evt);
    };

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(
        parent,
        null,
        'Doubleclick',
        20,
        20,
        80,
        30
      );
      const v2 = graph.insertVertex(
        parent,
        null,
        'Right-/Shiftclick',
        200,
        150,
        120,
        30
      );
      const v3 = graph.insertVertex(
        parent,
        null,
        'Connect/Reconnect',
        200,
        20,
        120,
        30
      );
      const v4 = graph.insertVertex(
        parent,
        null,
        'Control-Drag',
        20,
        150,
        100,
        30
      );
      const e1 = graph.insertEdge(parent, null, 'Tooltips', v1, v2);
      const e2 = graph.insertEdge(parent, null, '', v2, v3);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }

  createPopupMenu(graph, menu, cell, evt) {
    // Function to create the entries in the popupmenu
    if (cell != null) {
      menu.addItem('Cell Item', 'editors/images/image.gif', () => {
        mxUtils.alert('MenuItem1');
      });
    } else {
      menu.addItem('No-Cell Item', 'editors/images/image.gif', () => {
        mxUtils.alert('MenuItem2');
      });
    }
    menu.addSeparator();
    menu.addItem('MenuItem3', '../src/images/warning.gif', () => {
      mxUtils.alert(`MenuItem3: ${graph.getSelectionCount()} selected`);
    });
  }
}

export default Events;
