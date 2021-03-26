/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxUtils from '../mxgraph/util/mxUtils';

class LOD extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Level of detail</h1>
        This example demonstrates implementing a level of detail per cell.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '441px',
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
    graph.centerZoom = false;

    // Links level of detail to zoom level but can be independent of zoom
    graph.isCellVisible = function(cell) {
      return cell.lod == null || cell.lod / 2 < this.view.scale;
    };

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, '1', 20, 20, 80, 30);
      v1.lod = 1;
      const v2 = graph.insertVertex(parent, null, '1', 200, 150, 80, 30);
      v2.lod = 1;
      const v3 = graph.insertVertex(parent, null, '2', 20, 150, 40, 20);
      v3.lod = 2;
      const v4 = graph.insertVertex(parent, null, '3', 200, 10, 20, 20);
      v4.lod = 3;
      const e1 = graph.insertEdge(parent, null, '2', v1, v2, 'strokeWidth=2');
      e1.lod = 2;
      var e2 = graph.insertEdge(parent, null, '2', v3, v4, 'strokeWidth=2');
      e2.lod = 2;
      var e2 = graph.insertEdge(parent, null, '3', v1, v4, 'strokeWidth=1');
      e2.lod = 3;
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

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

export default LOD;
