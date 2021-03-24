/**
 * Copyright (c) 2006-2013, JGraph Ltd
 *
 * Dynamic loading example for mxGraph. This example demonstrates loading
 * graph model data dynamically to limit the number of cells in the model.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxText from '../mxgraph/shape/mxText';
import mxUtils from '../mxgraph/util/mxUtils';
import mxConstants from '../mxgraph/util/mxConstants';
import mxCodec from '../mxgraph/io/mxCodec';
import mxEffects from '../mxgraph/util/mxEffects';
import mxPerimeter from '../mxgraph/view/mxPerimeter';

class DynamicLoading extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Dynamic loading example for mxGraph</h1>

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'visible',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  };

  componentDidMount = () => {
    let requestId = 0;

    // Speedup the animation
    mxText.prototype.enableBoundingBox = false;

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Disables all built-in interactions
    graph.setEnabled(false);

    // Handles clicks on cells
    graph.addListener(mxEvent.CLICK, function(sender, evt) {
      const cell = evt.getProperty('cell');

      if (cell != null) {
        load(graph, cell);
      }
    });

    // Changes the default vertex style in-place
    const style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    const cx = graph.container.clientWidth / 2;
    const cy = graph.container.clientHeight / 2;

    const cell = graph.insertVertex(
      parent,
      '0-0',
      '0-0',
      cx - 20,
      cy - 15,
      60,
      40
    );

    // Animates the changes in the graph model
    graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt) {
      const { changes } = evt.getProperty('edit');
      mxEffects.animateChanges(graph, changes);
    });

    // Loads the links for the given cell into the given graph
    // by requesting the respective data in the server-side
    // (implemented for this demo using the server-function)
    function load(graph, cell) {
      if (graph.getModel().isVertex(cell)) {
        const cx = graph.container.clientWidth / 2;
        const cy = graph.container.clientHeight / 2;

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        const parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
          const xml = server(cell.id);
          const doc = mxUtils.parseXml(xml);
          const dec = new mxCodec(doc);
          const model = dec.decode(doc.documentElement);

          // Removes all cells which are not in the response
          for (var key in graph.getModel().cells) {
            const tmp = graph.getModel().getCell(key);

            if (tmp != cell && graph.getModel().isVertex(tmp)) {
              graph.removeCells([tmp]);
            }
          }

          // Merges the response model with the client model
          graph.getModel().mergeChildren(model.getRoot().getChildAt(0), parent);

          // Moves the given cell to the center
          let geo = graph.getModel().getGeometry(cell);

          if (geo != null) {
            geo = geo.clone();
            geo.x = cx - geo.width / 2;
            geo.y = cy - geo.height / 2;

            graph.getModel().setGeometry(cell, geo);
          }

          // Creates a list of the new vertices, if there is more
          // than the center vertex which might have existed
          // previously, then this needs to be changed to analyze
          // the target model before calling mergeChildren above
          const vertices = [];

          for (var key in graph.getModel().cells) {
            const tmp = graph.getModel().getCell(key);

            if (tmp != cell && model.isVertex(tmp)) {
              vertices.push(tmp);

              // Changes the initial location "in-place"
              // to get a nice animation effect from the
              // center to the radius of the circle
              const geo = model.getGeometry(tmp);

              if (geo != null) {
                geo.x = cx - geo.width / 2;
                geo.y = cy - geo.height / 2;
              }
            }
          }

          // Arranges the response in a circle
          const cellCount = vertices.length;
          const phi = (2 * Math.PI) / cellCount;
          const r = Math.min(
            graph.container.clientWidth / 4,
            graph.container.clientHeight / 4
          );

          for (let i = 0; i < cellCount; i++) {
            let geo = graph.getModel().getGeometry(vertices[i]);

            if (geo != null) {
              geo = geo.clone();
              geo.x += r * Math.sin(i * phi);
              geo.y += r * Math.cos(i * phi);

              graph.getModel().setGeometry(vertices[i], geo);
            }
          }
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
        }
      }
    }

    // Simulates the existence of a server that can crawl the
    // big graph with a certain depth and create a graph model
    // for the traversed cells, which is then sent to the client
    function server(cellId) {
      // Increments the request ID as a prefix for the cell IDs
      requestId++;

      // Creates a local graph with no display
      const graph = new mxGraph();

      // Gets the default parent for inserting new cells. This
      // is normally the first child of the root (ie. layer 0).
      const parent = graph.getDefaultParent();

      // Adds cells to the model in a single step
      graph.getModel().beginUpdate();
      try {
        const v0 = graph.insertVertex(parent, cellId, 'Dummy', 0, 0, 60, 40);
        const cellCount = parseInt(Math.random() * 16) + 4;

        // Creates the random links and cells for the response
        for (let i = 0; i < cellCount; i++) {
          const id = `${requestId}-${i}`;
          const v = graph.insertVertex(parent, id, id, 0, 0, 60, 40);
          const e = graph.insertEdge(parent, null, `Link ${i}`, v0, v);
        }
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
      }

      const enc = new mxCodec();
      const node = enc.encode(graph.getModel());

      return mxUtils.getXml(node);
    }

    load(graph, cell);
  };
}

export default DynamicLoading;
