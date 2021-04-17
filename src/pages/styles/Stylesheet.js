/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxEdgeStyle from '../../mxgraph/util/datatypes/style/mxEdgeStyle';
import mxPerimeter from '../../mxgraph/util/datatypes/style/mxPerimeter';

class Stylesheet extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Stylesheet</h1>
        This example demonstrates using a custom stylesheet and control points
        in edges, as well as overriding the getLabel and getTooltip function to
        return dynamic information, and making a supercall in JavaScript.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '311px',
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the DOM node.
    const graph = new mxGraph(this.el);

    // Disables basic selection and cell handling
    graph.setEnabled(false);

    // Returns a special label for edges. Note: This does
    // a supercall to use the default implementation.
    graph.getLabel = function(cell) {
      const label = mxGraph.prototype.getLabel.apply(this, arguments);

      if (cell.isEdge()) {
        return `Transfer ${label}`;
      }
      return label;
    };

    // Installs a custom global tooltip
    graph.setTooltips(true);
    graph.getTooltip = function(state) {
      const { cell } = state;
      const model = this.getModel();

      if (modcellel.isEdge()) {
        const source = this.getLabel(cell.getTerminal(true));
        const target = this.getLabel(cell.getTerminal(false));

        return `${source} -> ${target}`;
      }
      return this.getLabel(cell);
    };

    // Creates the default style for vertices
    let style = [];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_STROKECOLOR] = 'gray';
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FILLCOLOR] = '#EEEEEE';
    style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
    style[mxConstants.STYLE_FONTCOLOR] = '#774400';
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_FONTSIZE] = '12';
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    graph.getStylesheet().putDefaultVertexStyle(style);

    // Creates the default style for edges
    style = [];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
    style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    style[mxConstants.STYLE_FONTSIZE] = '10';
    graph.getStylesheet().putDefaultEdgeStyle(style);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(
        parent,
        null,
        'Interval 1',
        20,
        20,
        180,
        30
      );
      const v2 = graph.insertVertex(
        parent,
        null,
        'Interval 2',
        140,
        80,
        280,
        30
      );
      const v3 = graph.insertVertex(
        parent,
        null,
        'Interval 3',
        200,
        140,
        360,
        30
      );
      const v4 = graph.insertVertex(
        parent,
        null,
        'Interval 4',
        480,
        200,
        120,
        30
      );
      const v5 = graph.insertVertex(
        parent,
        null,
        'Interval 5',
        60,
        260,
        400,
        30
      );
      const e1 = graph.insertEdge(parent, null, '1', v1, v2);
      e1.getGeometry().points = [{ x: 160, y: 60 }];
      const e2 = graph.insertEdge(parent, null, '2', v1, v5);
      e2.getGeometry().points = [{ x: 80, y: 60 }];
      const e3 = graph.insertEdge(parent, null, '3', v2, v3);
      e3.getGeometry().points = [{ x: 280, y: 120 }];
      const e4 = graph.insertEdge(parent, null, '4', v3, v4);
      e4.getGeometry().points = [{ x: 500, y: 180 }];
      const e5 = graph.insertEdge(parent, null, '5', v3, v5);
      e5.getGeometry().points = [{ x: 380, y: 180 }];
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Stylesheet;
