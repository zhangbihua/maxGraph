/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxEdgeStyle from '../../mxgraph/view/style/mxEdgeStyle';
import mxPoint from '../../mxgraph/util/datatypes/mxPoint';
import mxCodec from '../../mxgraph/io/mxCodec';
import mxUtils from '../../mxgraph/util/mxUtils';

class HelloPort extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Hello Port</h1>
        This example demonstrates using the isPort hook for visually connecting
        to another cell.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
        <div
          ref={el => {
            this.el2 = el;
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setConnectable(true);
    graph.setTooltips(true);

    // Sets the default edge style
    const style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;

    // Ports are not used as terminals for edges, they are
    // only used to compute the graphical connection point
    graph.isPort = function(cell) {
      const geo = this.getCellGeometry(cell);

      return geo != null ? geo.relative : false;
    };

    // Implements a tooltip that shows the actual
    // source and target of an edge
    graph.getTooltipForCell = function(cell) {
      if (this.model.isEdge(cell)) {
        return `${this.convertValueToString(
          this.model.getTerminal(cell, true)
        )} => ${this.convertValueToString(
          this.model.getTerminal(cell, false)
        )}`;
      }

      return mxGraph.prototype.getTooltipForCell.apply(this, arguments);
    };

    // Removes the folding icon and disables any folding
    graph.isCellFoldable = function(cell) {
      return false;
    };

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello', 20, 80, 80, 30);
      v1.setConnectable(false);
      const v11 = graph.insertVertex(v1, null, '', 1, 1, 10, 10);
      v11.geometry.offset = new mxPoint(-5, -5);
      v11.geometry.relative = true;
      const v12 = graph.insertVertex(v1, null, '', 1, 0, 10, 10);
      v12.geometry.offset = new mxPoint(-5, -5);
      v12.geometry.relative = true;
      const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      const v3 = graph.insertVertex(parent, null, 'World2', 200, 20, 80, 30);
      var e1 = graph.insertEdge(parent, null, '', v11, v2);
      var e1 = graph.insertEdge(parent, null, '', v12, v3);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    const button = mxUtils.button('View XML', function() {
      const encoder = new mxCodec();
      const node = encoder.encode(graph.getModel());
      mxUtils.popup(mxUtils.getPrettyXml(node), true);
    });

    this.el2.appendChild(button);
  }
}

export default HelloPort;
