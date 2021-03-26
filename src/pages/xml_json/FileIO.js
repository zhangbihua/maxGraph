/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/mxEvent';
import mxGraph from '../../mxgraph/view/mxGraph';
import mxCellTracker from '../../mxgraph/handler/mxCellTracker';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxFastOrganicLayout from '../../mxgraph/layout/mxFastOrganicLayout';
import mxEventObject from '../../mxgraph/util/mxEventObject';
import mxCodec from '../../mxgraph/io/mxCodec';
import mxPerimeter from '../../mxgraph/view/mxPerimeter';
import mxClient from '../../mxgraph/mxClient';

class FileIO extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>File I/O</h1>
        This example demonstrates reading an XML file, writing a custom parser,
        applying an automatic layout and defining a 2-way edge.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'auto',
            height: '80vh',
            borderTop: 'gray 1px solid',
          }}
        />
        <div
          ref={el => {
            this.el2 = el;
          }}
        />
      </>
    );
  };

  componentDidMount() {
    // Program starts here. Creates a sample graph in the
    // DOM node with the specified ID. This function is invoked
    // from the onLoad event handler of the document (see below).
    function main(container) {
      // Checks if browser is supported
      if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        // Creates the graph inside the given container
        const graph = new mxGraph(container);

        graph.setEnabled(false);
        graph.setPanning(true);
        graph.setTooltips(true);
        graph.panningHandler.useLeftButtonForPanning = true;

        // Adds a highlight on the cell under the mousepointer
        new mxCellTracker(graph);

        // Changes the default vertex style in-place
        let style = graph.getStylesheet().getDefaultVertexStyle();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ROUNDED;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
        style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
        style[mxConstants.STYLE_PERIMETER_SPACING] = 4;
        style[mxConstants.STYLE_SHADOW] = true;

        style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';

        style = mxUtils.clone(style);
        style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_CLASSIC;
        graph.getStylesheet().putCellStyle('2way', style);

        graph.isHtmlLabel = function(cell) {
          return true;
        };

        // Larger grid size yields cleaner layout result
        graph.gridSize = 20;

        // Creates a layout algorithm to be used
        // with the graph
        const layout = new mxFastOrganicLayout(graph);

        // Moves stuff wider apart than usual
        layout.forceConstant = 140;

        // Adds a button to execute the layout
        this.el2.appendChild(
          mxUtils.button('Arrange', function(evt) {
            const parent = graph.getDefaultParent();
            layout.execute(parent);
          })
        );

        // Load cells and layouts the graph
        graph.getModel().beginUpdate();
        try {
          // Loads the custom file format (TXT file)
          parse(graph, 'fileio.txt');

          // Loads the mxGraph file format (XML file)
          // read(graph, 'fileio.xml');

          // Gets the default parent for inserting new cells. This
          // is normally the first child of the root (ie. layer 0).
          const parent = graph.getDefaultParent();

          // Executes the layout
          layout.execute(parent);
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
        }

        graph.dblClick = function(evt, cell) {
          const mxe = new mxEventObject(
            mxEvent.DOUBLE_CLICK,
            'event',
            evt,
            'cell',
            cell
          );
          this.fireEvent(mxe);

          if (
            this.isEnabled() &&
            !mxEvent.isConsumed(evt) &&
            !mxe.isConsumed() &&
            cell != null
          ) {
            mxUtils.alert(
              `Show properties for cell ${cell.customId || cell.getId()}`
            );
          }
        };
      }
    }

    // Custom parser for simple file format
    function parse(graph, filename) {
      const model = graph.getModel();

      // Gets the default parent for inserting new cells. This
      // is normally the first child of the root (ie. layer 0).
      const parent = graph.getDefaultParent();

      const req = mxUtils.load(filename);
      const text = req.getText();

      const lines = text.split('\n');

      // Creates the lookup table for the vertices
      const vertices = [];

      // Parses all lines (vertices must be first in the file)
      graph.getModel().beginUpdate();
      try {
        for (let i = 0; i < lines.length; i++) {
          // Ignores comments (starting with #)
          const colon = lines[i].indexOf(':');

          if (lines[i].substring(0, 1) != '#' || colon == -1) {
            const comma = lines[i].indexOf(',');
            const value = lines[i].substring(colon + 2, lines[i].length);

            if (comma == -1 || comma > colon) {
              const key = lines[i].substring(0, colon);

              if (key.length > 0) {
                vertices[key] = graph.insertVertex(
                  parent,
                  null,
                  value,
                  0,
                  0,
                  80,
                  70
                );
              }
            } else if (comma < colon) {
              // Looks up the vertices in the lookup table
              const source = vertices[lines[i].substring(0, comma)];
              const target = vertices[lines[i].substring(comma + 1, colon)];

              if (source != null && target != null) {
                const e = graph.insertEdge(parent, null, value, source, target);

                // Uses the special 2-way style for 2-way labels
                if (value.indexOf('2-Way') >= 0) {
                  e.style = '2way';
                }
              }
            }
          }
        }
      } finally {
        graph.getModel().endUpdate();
      }
    }

    // Parses the mxGraph XML file format
    function read(graph, filename) {
      const req = mxUtils.load(filename);
      const root = req.getDocumentElement();
      const dec = new mxCodec(root.ownerDocument);

      dec.decode(root, graph.getModel());
    }
  };
}

export default FileIO;
