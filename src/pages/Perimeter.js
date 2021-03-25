/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Perimeter. This example demonstrates how to
  avoid edge and label intersections.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from "../mxgraph/util/mxUtils";
import mxGraphView from "../mxgraph/view/mxGraphView";

class Perimeter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Perimeter</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Redirects the perimeter to the label bounds if intersection
    // between edge and label is found
    const mxGraphViewGetPerimeterPoint =
      mxGraphView.prototype.getPerimeterPoint;
    mxGraphView.prototype.getPerimeterPoint = function(
      terminal,
      next,
      orthogonal,
      border
    ) {
      let point = mxGraphViewGetPerimeterPoint.apply(this, arguments);

      if (point != null) {
        const perimeter = this.getPerimeterFunction(terminal);

        if (terminal.text != null && terminal.text.boundingBox != null) {
          // Adds a small border to the label bounds
          const b = terminal.text.boundingBox.clone();
          b.grow(3);

          if (mxUtils.rectangleIntersectsSegment(b, point, next)) {
            point = perimeter(b, terminal, next, orthogonal);
          }
        }
      }

      return point;
    };

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setVertexLabelsMovable(true);
    graph.setConnectable(true);

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
      const v1 = graph.insertVertex(
        parent,
        null,
        'Label',
        20,
        20,
        80,
        30,
        'verticalLabelPosition=bottom'
      );
      const v2 = graph.insertVertex(
        parent,
        null,
        'Label',
        200,
        20,
        80,
        30,
        'verticalLabelPosition=bottom'
      );
      const v3 = graph.insertVertex(
        parent,
        null,
        'Label',
        20,
        150,
        80,
        30,
        'verticalLabelPosition=bottom'
      );
      var e1 = graph.insertEdge(parent, null, '', v1, v2);
      var e1 = graph.insertEdge(parent, null, '', v1, v3);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Perimeter;
