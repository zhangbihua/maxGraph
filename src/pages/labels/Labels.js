/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxKeyHandler from '../../mxgraph/handler/mxKeyHandler';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxRectangle from '../../mxgraph/util/datatypes/mxRectangle';

class Labels extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Labels</h1>
        This example demonstrates the use of wrapping and clipping for HTML
        labels of vertices, truncating labels to fit the size of a vertex, and
        manually placing vertex labels and relative children that act as
        "sublabels".
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '300px',
            background: "url('editors/images/grid.gif')",
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setTooltips(true);
    graph.htmlLabels = true;
    graph.vertexLabelsMovable = true;
    new mxRubberband(graph);
    new mxKeyHandler(graph);

    // Do not allow removing labels from parents
    graph.graphHandler.removeCellsFromParent = false;

    // Autosize labels on insert where autosize=1
    graph.autoSizeCellsOnAdd = true;

    // Allows moving of relative cells
    graph.isCellLocked = function(cell) {
      return this.isCellsLocked();
    };

    graph.isCellResizable = function(cell) {
      const geo = this.model.getGeometry(cell);

      return geo == null || !geo.relative;
    };

    // Truncates the label to the size of the vertex
    graph.getLabel = function(cell) {
      const label = this.labelsVisible ? this.convertValueToString(cell) : '';
      const geometry = this.model.getGeometry(cell);

      if (
        !this.model.isCollapsed(cell) &&
        geometry != null &&
        (geometry.offset == null ||
          (geometry.offset.x == 0 && geometry.offset.y == 0)) &&
        this.model.isVertex(cell) &&
        geometry.width >= 2
      ) {
        const style = this.getCellStyle(cell);
        const fontSize =
          style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE;
        const max = geometry.width / (fontSize * 0.625);

        if (max < label.length) {
          return `${label.substring(0, max)}...`;
        }
      }

      return label;
    };

    // Enables wrapping for vertex labels
    graph.isWrapping = function(cell) {
      return this.model.isCollapsed(cell);
    };

    // Enables clipping of vertex labels if no offset is defined
    graph.isLabelClipped = function(cell) {
      const geometry = this.model.getGeometry(cell);

      return (
        geometry != null &&
        !geometry.relative &&
        (geometry.offset == null ||
          (geometry.offset.x == 0 && geometry.offset.y == 0))
      );
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
        'vertexLabelsMovable',
        20,
        20,
        80,
        30
      );

      // Places sublabels inside the vertex
      const label11 = graph.insertVertex(
        v1,
        null,
        'Label1',
        0.5,
        1,
        0,
        0,
        null,
        true
      );
      const label12 = graph.insertVertex(
        v1,
        null,
        'Label2',
        0.5,
        0,
        0,
        0,
        null,
        true
      );

      const v2 = graph.insertVertex(
        parent,
        null,
        'Wrapping and clipping is enabled only if the cell is collapsed, otherwise the label is truncated if there is no manual offset.',
        200,
        150,
        80,
        30
      );
      v2.geometry.alternateBounds = new mxRectangle(0, 0, 80, 30);
      const e1 = graph.insertEdge(parent, null, 'edgeLabelsMovable', v1, v2);

      // Places sublabels inside the vertex
      const label21 = graph.insertVertex(
        v2,
        null,
        'Label1',
        0.5,
        1,
        0,
        0,
        null,
        true
      );
      const label22 = graph.insertVertex(
        v2,
        null,
        'Label2',
        0.5,
        0,
        0,
        0,
        null,
        true
      );
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Labels;
