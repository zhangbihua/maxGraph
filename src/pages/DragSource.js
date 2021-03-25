/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxCell from '../mxgraph/model/mxCell';
import mxGeometry from '../mxgraph/model/mxGeometry';
import mxUtils from '../mxgraph/util/mxUtils';
import mxDragSource from '../mxgraph/util/mxDragSource';
import mxGraphHandler from "../mxgraph/handler/mxGraphHandler";
import mxGuide from "../mxgraph/util/mxGuide";
import mxEdgeHandler from "../mxgraph/handler/mxEdgeHandler";

class DragSource extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Dragsource</h1>
        This example demonstrates using one drag source
        for multiple graphs and changing the drag icon.

        <div
          ref={el => {
            this.el = el;
          }}
          style={{}}
        />
      </>
    );
  };

  componentDidMount = () => {
    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;

    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = function(evt) {
      return !mxEvent.isAltDown(evt);
    };

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    const graphs = [];

    // Creates the graph inside the given container
    for (let i = 0; i < 2; i++) {
      const container = document.createElement('div');
      container.style.overflow = 'hidden';
      container.style.position = 'relative';
      container.style.width = '321px';
      container.style.height = '241px';
      container.style.background = "url('editors/images/grid.gif')";
      container.style.cursor = 'default';

      this.el.appendChild(container);

      var graph = new mxGraph(container);
      graph.gridSize = 30;

      // Uncomment the following if you want the container
      // to fit the size of the graph
      // graph.setResizeContainer(true);

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

      graphs.push(graph);
    }

    // Returns the graph under the mouse
    const graphF = function(evt) {
      const x = mxEvent.getClientX(evt);
      const y = mxEvent.getClientY(evt);
      const elt = document.elementFromPoint(x, y);

      for (let i = 0; i < graphs.length; i++) {
        if (mxUtils.isAncestorNode(graphs[i].container, elt)) {
          return graphs[i];
        }
      }

      return null;
    };

    // Inserts a cell at the given location
    const funct = function(graph, evt, target, x, y) {
      const cell = new mxCell('Test', new mxGeometry(0, 0, 120, 40));
      cell.vertex = true;
      const cells = graph.importCells([cell], x, y, target);

      if (cells != null && cells.length > 0) {
        graph.scrollCellToVisible(cells[0]);
        graph.setSelectionCells(cells);
      }
    };

    // Creates a DOM node that acts as the drag source
    const img = mxUtils.createImage('images/icons48/gear.png');
    img.style.width = '48px';
    img.style.height = '48px';
    this.el.appendChild(img);

    // Creates the element that is being for the actual preview.
    const dragElt = document.createElement('div');
    dragElt.style.border = 'dashed black 1px';
    dragElt.style.width = '120px';
    dragElt.style.height = '40px';

    // Drag source is configured to use dragElt for preview and as drag icon
    // if scalePreview (last) argument is true. Dx and dy are null to force
    // the use of the defaults. Note that dx and dy are only used for the
    // drag icon but not for the preview.
    const ds = mxUtils.makeDraggable(
      img,
      graphF,
      funct,
      dragElt,
      null,
      null,
      graph.autoscroll,
      true
    );

    // Redirects feature to global switch. Note that this feature should only be used
    // if the the x and y arguments are used in funct to insert the cell.
    ds.isGuidesEnabled = function() {
      return graph.graphHandler.guidesEnabled;
    };

    // Restores original drag icon while outside of graph
    ds.createDragElement = mxDragSource.prototype.createDragElement;
  };

  // NOTE: To enable cross-document DnD (eg. between frames),
  // the following methods need to be overridden:
  /* mxDragSourceMouseUp = mxDragSource.prototype.mouseUp;
mxDragSource.prototype.mouseUp = function(evt)
{
    let doc = this.element.ownerDocument;

    if (doc != document)
    {
        let mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';

        if (this.mouseUpHandler != null)
        {
            mxEvent.removeListener(doc, mu, this.mouseUpHandler);
        }
    }

    mxDragSourceMouseUp.apply(this, arguments);
}; */

  /* mxDragSourceMouseDown = mxDragSource.prototype.mouseDown;
mxDragSource.prototype.mouseDown = function(evt)
{
    if (this.enabled && !mxEvent.isConsumed(evt))
    {
        mxDragSourceMouseDown.apply(this, arguments);
        let doc = this.element.ownerDocument;

        if (doc != document)
        {
            let mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';
            mxEvent.addListener(doc, mu, this.mouseUpHandler);
        }
    }
}; */
}

export default DragSource;
