/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxConstants from '../mxgraph/util/mxConstants';

class DynamicStyle extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Dynamic Style</h1>
        This example demonstrates changing the style of a cell dynamically by
        overriding mxGraphModel.getStyle.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            height: '241px',
            background: "url('editors/images/grid.gif')",
          }}
        />
      </>
    );
  };

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Disables moving of edge labels in this examples
    graph.edgeLabelsMovable = false;

    // Enables rubberband selection
    new mxRubberband(graph);

    // Needs to set a flag to check for dynamic style changes,
    // that is, changes to styles on cells where the style was
    // not explicitely changed using mxStyleChange
    graph.getView().updateStyle = true;

    // Overrides mxGraphModel.getStyle to return a specific style
    // for edges that reflects their target terminal (in this case
    // the strokeColor will be equal to the target's fillColor).
    const previous = graph.model.getStyle;

    graph.model.getStyle = function(cell) {
      if (cell != null) {
        let style = previous.apply(this, arguments);

        if (this.isEdge(cell)) {
          const target = this.getTerminal(cell, false);

          if (target != null) {
            const targetStyle = graph.getCurrentCellStyle(target);
            const fill = mxUtils.getValue(
              targetStyle,
              mxConstants.STYLE_FILLCOLOR
            );

            if (fill != null) {
              style += `;strokeColor=${fill}`;
            }
          }
        } else if (this.isVertex(cell)) {
          const geometry = this.getGeometry(cell);

          if (geometry != null && geometry.width > 80) {
            style += ';fillColor=green';
          }
        }

        return style;
      }

      return null;
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
        'Hello,',
        20,
        20,
        80,
        30,
        'fillColor=green'
      );
      const v2 = graph.insertVertex(
        parent,
        null,
        'World!',
        200,
        150,
        80,
        30,
        'fillColor=blue'
      );
      const v3 = graph.insertVertex(
        parent,
        null,
        'World!',
        20,
        150,
        80,
        30,
        'fillColor=red'
      );
      const e1 = graph.insertEdge(
        parent,
        null,
        'Connect',
        v1,
        v2,
        'perimeterSpacing=4;strokeWidth=4;labelBackgroundColor=white;fontStyle=1'
      );
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  };
}

export default DynamicStyle;
