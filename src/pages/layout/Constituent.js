/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxGraphHandler from '../../mxgraph/handler/mxGraphHandler';

class Constituent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Constituent</h1>
        This example demonstrates using cells as parts of other cells.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '241px',
            background: 'url("editors/images/grid.gif")',
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.el);

    class MyCustomGraphHandler extends mxGraphHandler {
      /**
       * Redirects start drag to parent.
       */
      getInitialCellForEvent(me) {
        let cell = super.getInitialCellForEvent(me);
        if (this.graph.isPart(cell)) {
          cell = this.cell.getParent();
        }
        return cell;
      }
    }

    class MyCustomGraph extends mxGraph {
      foldingEnabled = false;

      recursiveResize = true;

      isPart(cell) {
        // Helper method to mark parts with constituent=1 in the style
        return this.getCurrentCellStyle(cell).constituent == '1';
      }

      selectCellForEvent(cell, evt) {
        // Redirects selection to parent
        if (this.isPart(cell)) {
          cell = cell.getParent();
        }
        super.selectCellForEvent(cell, evt);
      }

      createGraphHandler() {
        return new MyCustomGraphHandler(this);
      }
    }

    // Creates the graph inside the given container
    const graph = new MyCustomGraph(this.el);

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.batchUpdate(() => {
      const v1 = graph.insertVertex({
        parent,
        position: [20, 20],
        size: [120, 70],
      });
      const v2 = graph.insertVertex({
        parent: v1,
        value: 'Constituent',
        position: [20, 20],
        size: [80, 30],
        style: 'constituent=1;',
      });
    });
  }
}

export default Constituent;
