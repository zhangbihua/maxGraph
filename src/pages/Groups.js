/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Groups example for mxGraph. This example demonstrates using
  cells as parts of other cells.
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxGraphHandler from "../mxgraph/handler/mxGraphHandler";
import mxPopupMenuHandler from "../mxgraph/handler/mxPopupMenuHandler";

class Groups extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Hello, World! example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            width: '321px',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Overrides check for valid roots
    mxGraph.prototype.isValidRoot = function() {
      return false;
    };

    // Don't clear selection if multiple cells selected
    const graphHandlerMouseDown = mxGraphHandler.prototype.mouseDown;
    mxGraphHandler.prototype.mouseDown = function(sender, me) {
      graphHandlerMouseDown.apply(this, arguments);

      if (
        this.graph.isCellSelected(me.getCell()) &&
        this.graph.getSelectionCount() > 1
      ) {
        this.delayedSelection = false;
      }
    };

    // Selects descendants before children selection mode
    const graphHandlerGetInitialCellForEvent =
      mxGraphHandler.prototype.getInitialCellForEvent;
    mxGraphHandler.prototype.getInitialCellForEvent = function(me) {
      const model = this.graph.getModel();
      const psel = model.getParent(this.graph.getSelectionCell());
      let cell = graphHandlerGetInitialCellForEvent.apply(this, arguments);
      let parent = model.getParent(cell);

      if (psel == null || (psel != cell && psel != parent)) {
        while (
          !this.graph.isCellSelected(cell) &&
          !this.graph.isCellSelected(parent) &&
          model.isVertex(parent) &&
          !this.graph.isValidRoot(parent)
        ) {
          cell = parent;
          parent = this.graph.getModel().getParent(cell);
        }
      }

      return cell;
    };

    // Selection is delayed to mouseup if child selected
    const graphHandlerIsDelayedSelection =
      mxGraphHandler.prototype.isDelayedSelection;
    mxGraphHandler.prototype.isDelayedSelection = function(cell) {
      let result = graphHandlerIsDelayedSelection.apply(this, arguments);
      const model = this.graph.getModel();
      const psel = model.getParent(this.graph.getSelectionCell());
      const parent = model.getParent(cell);

      if (psel == null || (psel != cell && psel != parent)) {
        if (
          !this.graph.isCellSelected(cell) &&
          model.isVertex(parent) &&
          !this.graph.isValidRoot(parent)
        ) {
          result = true;
        }
      }

      return result;
    };

    // Delayed selection of parent group
    mxGraphHandler.prototype.selectDelayed = function(me) {
      let cell = me.getCell();

      if (cell == null) {
        cell = this.cell;
      }

      const model = this.graph.getModel();
      let parent = model.getParent(cell);

      while (
        this.graph.isCellSelected(cell) &&
        model.isVertex(parent) &&
        !this.graph.isValidRoot(parent)
      ) {
        cell = parent;
        parent = model.getParent(cell);
      }

      this.graph.selectCellForEvent(cell, me.getEvent());
    };

    // Returns last selected ancestor
    mxPopupMenuHandler.prototype.getCellForPopupEvent = function(me) {
      let cell = me.getCell();
      const model = this.graph.getModel();
      let parent = model.getParent(cell);

      while (model.isVertex(parent) && !this.graph.isValidRoot(parent)) {
        if (this.graph.isCellSelected(parent)) {
          cell = parent;
        }

        parent = model.getParent(parent);
      }

      return cell;
    };

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.constrainChildren = false;
    graph.extendParents = false;
    graph.extendParentsOnAdd = false;

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
      const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 120, 60);
      const v2 = graph.insertVertex(v1, null, 'World!', 90, 20, 60, 20);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Groups;
