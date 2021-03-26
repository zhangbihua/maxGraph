/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';

class Visibility extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Visibility</h1>
        This example demonstrates using various solutions for hiding and showing
        cells.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
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

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    let showOne = true;
    let showTwo = true;
    let showThree = true;

    // Overridden to implement dynamic conditions
    graph.isCellVisible = function(cell) {
      let result = mxGraph.prototype.isCellVisible.apply(this, arguments);

      if (result && cell.value != null) {
        result =
          (showOne && cell.value == '1') ||
          (showTwo && cell.value == '2') ||
          (showThree && cell.value == '3');
      }

      return result;
    };

    // Adds cells to the model in a single step
    let v1;
    graph.getModel().beginUpdate();
    try {
      v1 = graph.insertVertex(parent, null, '1', 20, 20, 80, 30);
      const v2 = graph.insertVertex(parent, null, '2', 200, 150, 80, 30);
      const e1 = graph.insertEdge(parent, null, '3', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    // Dynamic conditions (requires refresh)
    this.el2.appendChild(
      mxUtils.button('Cond 1', function() {
        showOne = !showOne;
        graph.refresh();
      })
    );
    this.el2.appendChild(
      mxUtils.button('Cond 2', function() {
        showTwo = !showTwo;
        graph.refresh();
      })
    );
    this.el2.appendChild(
      mxUtils.button('Cond 3', function() {
        showThree = !showThree;
        graph.refresh();
      })
    );

    // Explicit show/hide
    this.el2.appendChild(
      mxUtils.button('Toggle cell', function() {
        graph.toggleCells(!graph.getModel().isVisible(v1), [v1], true);
      })
    );

    // Explicit remove/add
    let removed = null;

    this.el2.appendChild(
      mxUtils.button('Add/remove cell', function() {
        if (removed != null) {
          graph.addCells(removed);
          removed = null;
        } else {
          removed = graph.removeCells([v1]);
        }
      })
    );
  }
}

export default Visibility;
