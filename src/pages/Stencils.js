/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Stencils example for mxGraph. This example demonstrates using
  an XML file to define new stencils to be used as shapes. See
  docs/stencils.xsd for the XML schema file.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from "../mxgraph/util/mxUtils";
import mxConstants from "../mxgraph/util/mxConstants";
import mxPoint from "../mxgraph/util/mxPoint";
import mxStencilRegistry from "../mxgraph/shape/mxStencilRegistry";
import mxCellRenderer from "../mxgraph/view/mxCellRenderer";
import mxShape from "../mxgraph/shape/mxShape";
import mxVertexHandler from "../mxgraph/handler/mxVertexHandler";
import mxCellHighlight from "../mxgraph/handler/mxCellHighlight";
import mxEdgeHandler from "../mxgraph/handler/mxEdgeHandler";
import mxConnectionHandler from "../mxgraph/handler/mxConnectionHandler";
import mxStencil from "../mxgraph/shape/mxStencil";

class Stencils extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Stencils example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '601px',
            height: '401px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
        <div
          ref={el => {
            this.el2 = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '601px',
            height: '150px',
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Sets the global shadow color
    mxConstants.SHADOWCOLOR = '#C0C0C0';
    mxConstants.SHADOW_OPACITY = 0.5;
    mxConstants.SHADOW_OFFSET_X = 4;
    mxConstants.SHADOW_OFFSET_Y = 4;
    mxConstants.HANDLE_FILLCOLOR = '#99ccff';
    mxConstants.HANDLE_STROKECOLOR = '#0088cf';
    mxConstants.VERTEX_SELECTION_COLOR = '#00a8ff';

    // Enables connections along the outline
    mxConnectionHandler.prototype.outlineConnect = true;
    mxEdgeHandler.prototype.manageLabelHandle = true;
    mxEdgeHandler.prototype.outlineConnect = true;
    mxCellHighlight.prototype.keepOnTop = true;

    // Enable rotation handle
    mxVertexHandler.prototype.rotationEnabled = true;

    // Uses the shape for resize previews
    mxVertexHandler.prototype.createSelectionShape = function(bounds) {
      const key = this.state.style[mxConstants.STYLE_SHAPE];
      const stencil = mxStencilRegistry.getStencil(key);
      let shape = null;

      if (stencil != null) {
        shape = new mxShape(stencil);
        shape.apply(this.state);
      } else {
        shape = new this.state.shape.constructor();
      }

      shape.outline = true;
      shape.bounds = bounds;
      shape.stroke = mxConstants.HANDLE_STROKECOLOR;
      shape.strokewidth = this.getSelectionStrokeWidth();
      shape.isDashed = this.isSelectionDashed();
      shape.isShadow = false;

      return shape;
    };

    // Defines a custom stencil via the canvas API as defined here:
    // http://jgraph.github.io/mxgraph/docs/js-api/files/util/mxXmlCanvas2D-js.html

    class CustomShape extends mxShape {
      paintBackground(c, x, y, w, h) {
        c.translate(x, y);

        // Head
        c.ellipse(w / 4, 0, w / 2, h / 4);
        c.fillAndStroke();

        c.begin();
        c.moveTo(w / 2, h / 4);
        c.lineTo(w / 2, (2 * h) / 3);

        // Arms
        c.moveTo(w / 2, h / 3);
        c.lineTo(0, h / 3);
        c.moveTo(w / 2, h / 3);
        c.lineTo(w, h / 3);

        // Legs
        c.moveTo(w / 2, (2 * h) / 3);
        c.lineTo(0, h);
        c.moveTo(w / 2, (2 * h) / 3);
        c.lineTo(w, h);
        c.end();

        c.stroke();
      }
    }

    // Replaces existing actor shape
    mxCellRenderer.registerShape('customShape', CustomShape);

    // Loads the stencils into the registry
    const req = mxUtils.load('stencils.xml');
    const root = req.getDocumentElement();
    let shape = root.firstChild;

    while (shape != null) {
      if (shape.nodeType === mxConstants.NODETYPE_ELEMENT) {
        mxStencilRegistry.addStencil(
          shape.getAttribute('name'),
          new mxStencil(shape)
        );
      }

      shape = shape.nextSibling;
    }

    mxEvent.disableContextMenu(this.el);

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setConnectable(true);
    graph.setTooltips(true);
    graph.setPanning(true);

    graph.getTooltipForCell = function(cell) {
      if (cell != null) {
        return cell.style;
      }

      return null;
    };

    // Changes default styles
    let style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = 'orthogonalEdgeStyle';
    style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_FILLCOLOR] = '#adc5ff';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#7d85df';
    style[mxConstants.STYLE_SHADOW] = '1';

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(
        parent,
        null,
        'A1',
        20,
        20,
        40,
        80,
        'shape=and'
      );
      const v2 = graph.insertVertex(
        parent,
        null,
        'A2',
        20,
        220,
        40,
        80,
        'shape=and'
      );
      const v3 = graph.insertVertex(
        parent,
        null,
        'X1',
        160,
        110,
        80,
        80,
        'shape=xor'
      );
      const e1 = graph.insertEdge(parent, null, '', v1, v3);
      e1.geometry.points = [new mxPoint(90, 60), new mxPoint(90, 130)];
      const e2 = graph.insertEdge(parent, null, '', v2, v3);
      e2.geometry.points = [new mxPoint(90, 260), new mxPoint(90, 170)];

      const v4 = graph.insertVertex(
        parent,
        null,
        'A3',
        520,
        20,
        40,
        80,
        'shape=customShape;flipH=1'
      );
      const v5 = graph.insertVertex(
        parent,
        null,
        'A4',
        520,
        220,
        40,
        80,
        'shape=and;flipH=1'
      );
      const v6 = graph.insertVertex(
        parent,
        null,
        'X2',
        340,
        110,
        80,
        80,
        'shape=xor;flipH=1'
      );
      const e3 = graph.insertEdge(parent, null, '', v4, v6);
      e3.geometry.points = [new mxPoint(490, 60), new mxPoint(130, 130)];
      const e4 = graph.insertEdge(parent, null, '', v5, v6);
      e4.geometry.points = [new mxPoint(490, 260), new mxPoint(130, 170)];

      const v7 = graph.insertVertex(
        parent,
        null,
        'O1',
        250,
        260,
        80,
        60,
        'shape=or;direction=south'
      );
      const e5 = graph.insertEdge(parent, null, '', v6, v7);
      e5.geometry.points = [new mxPoint(310, 150)];
      const e6 = graph.insertEdge(parent, null, '', v3, v7);
      e6.geometry.points = [new mxPoint(270, 150)];

      const e7 = graph.insertEdge(parent, null, '', v7, v5);
      e7.geometry.points = [new mxPoint(290, 370)];
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    this.el2.appendChild(
      mxUtils.button('FlipH', function() {
        graph.toggleCellStyles(mxConstants.STYLE_FLIPH);
      })
    );

    this.el2.appendChild(
      mxUtils.button('FlipV', function() {
        graph.toggleCellStyles(mxConstants.STYLE_FLIPV);
      })
    );

    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));

    this.el2.appendChild(
      mxUtils.button('Rotate', function() {
        const cell = graph.getSelectionCell();

        if (cell != null) {
          let geo = graph.getCellGeometry(cell);

          if (geo != null) {
            graph.getModel().beginUpdate();
            try {
              // Rotates the size and position in the geometry
              geo = geo.clone();
              geo.x += geo.width / 2 - geo.height / 2;
              geo.y += geo.height / 2 - geo.width / 2;
              const tmp = geo.width;
              geo.width = geo.height;
              geo.height = tmp;
              graph.getModel().setGeometry(cell, geo);

              // Reads the current direction and advances by 90 degrees
              const state = graph.view.getState(cell);

              if (state != null) {
                let dir =
                  state.style[mxConstants.STYLE_DIRECTION] ||
                  'east'; /* default */

                if (dir === 'east') {
                  dir = 'south';
                } else if (dir === 'south') {
                  dir = 'west';
                } else if (dir === 'west') {
                  dir = 'north';
                } else if (dir === 'north') {
                  dir = 'east';
                }

                graph.setCellStyles(mxConstants.STYLE_DIRECTION, dir, [cell]);
              }
            } finally {
              graph.getModel().endUpdate();
            }
          }
        }
      })
    );

    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));

    this.el2.appendChild(
      mxUtils.button('And', function() {
        graph.setCellStyles(mxConstants.STYLE_SHAPE, 'and');
      })
    );
    this.el2.appendChild(
      mxUtils.button('Or', function() {
        graph.setCellStyles(mxConstants.STYLE_SHAPE, 'or');
      })
    );
    this.el2.appendChild(
      mxUtils.button('Xor', function() {
        graph.setCellStyles(mxConstants.STYLE_SHAPE, 'xor');
      })
    );

    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));
    this.el2.appendChild(document.createTextNode('\u00a0'));

    this.el2.appendChild(
      mxUtils.button('Style', function() {
        const cell = graph.getSelectionCell();

        if (cell != null) {
          const style = mxUtils.prompt(
            'Style',
            graph.getModel().getStyle(cell)
          );

          if (style != null) {
            graph.getModel().setStyle(cell, style);
          }
        }
      })
    );

    this.el2.appendChild(
      mxUtils.button('+', function() {
        graph.zoomIn();
      })
    );
    this.el2.appendChild(
      mxUtils.button('-', function() {
        graph.zoomOut();
      })
    );
  }
}

export default Stencils;
