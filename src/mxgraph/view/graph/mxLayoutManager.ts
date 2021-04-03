/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxEventSource from '../../util/event/mxEventSource';
import mxEvent from '../../util/event/mxEvent';
import mxUtils from '../../util/mxUtils';
import mxRootChange from '../../atomic_changes/mxRootChange';
import mxChildChange from '../../atomic_changes/mxChildChange';
import mxTerminalChange from '../../atomic_changes/mxTerminalChange';
import mxGeometryChange from '../../atomic_changes/mxGeometryChange';
import mxVisibleChange from '../../atomic_changes/mxVisibleChange';
import mxStyleChange from '../../atomic_changes/mxStyleChange';
import mxEventObject from '../../util/event/mxEventObject';
import mxCell from '../cell/mxCell';
import mxGraph from './mxGraph';
import mxRectangle from '../../util/datatypes/mxRectangle';

class mxLayoutManager extends mxEventSource {
  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: mxGraph | null = null;

  /**
   * Variable: bubbling
   *
   * Specifies if the layout should bubble along
   * the cell hierarchy. Default is true.
   */
  bubbling: boolean = true;

  /**
   * Variable: enabled
   *
   * Specifies if event handling is enabled. Default is true.
   */
  enabled: boolean = true;

  /**
   * Variable: undoHandler
   *
   * Holds the function that handles the endUpdate event.
   */
  undoHandler: Function | null = null;

  /**
   * Variable: moveHandler
   *
   * Holds the function that handles the move event.
   */
  moveHandler: Function | null = null;

  /**
   * Variable: resizeHandler
   *
   * Holds the function that handles the resize event.
   */
  resizeHandler: Function | null = null;

  /**
   * Class: mxLayoutManager
   *
   * Implements a layout manager that runs a given layout after any changes to the graph:
   *
   * Example:
   *
   * (code)
   * let layoutMgr = new mxLayoutManager(graph);
   * layoutMgr.getLayout = (cell, eventName)=>
   * {
   *   return layout;
   * };
   * (end)
   *
   * See <getLayout> for a description of the possible eventNames.
   *
   * Event: mxEvent.LAYOUT_CELLS
   *
   * Fires between begin- and endUpdate after all cells have been layouted in
   * <layoutCells>. The <code>cells</code> property contains all cells that have
   * been passed to <layoutCells>.
   *
   * Constructor: mxLayoutManager
   *
   * Constructs a new automatic layout for the given graph.
   *
   * Arguments:
   *
   * graph - Reference to the enclosing graph.
   */
  constructor(graph: mxGraph) {
    super();

    // Executes the layout before the changes are dispatched
    this.undoHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.beforeUndo(evt.getProperty('edit'));
      }
    };

    // Notifies the layout of a move operation inside a parent
    this.moveHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.cellsMoved(evt.getProperty('cells'), evt.getProperty('event'));
      }
    };

    // Notifies the layout of a move operation inside a parent
    this.resizeHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.cellsResized(
          evt.getProperty('cells'),
          evt.getProperty('bounds'),
          evt.getProperty('previous')
        );
      }
    };

    this.setGraph(graph);
  }

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation
   * updates <enabled>.
   *
   * Parameters:
   *
   * enabled - Boolean that specifies the new enabled state.
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Function: isBubbling
   *
   * Returns true if a layout should bubble, that is, if the parent layout
   * should be executed whenever a cell layout (layout of the children of
   * a cell) has been executed. This implementation returns <bubbling>.
   */
  isBubbling() {
    return this.bubbling;
  }

  /**
   * Function: setBubbling
   *
   * Sets <bubbling>.
   */
  setBubbling(value) {
    this.bubbling = value;
  }

  /**
   * Function: getGraph
   *
   * Returns the graph that this layout operates on.
   */
  getGraph() {
    return this.graph;
  }

  /**
   * Function: setGraph
   *
   * Sets the graph that the layouts operate on.
   */
  setGraph(graph: mxGraph): void {
    if (this.graph != null) {
      const model = this.graph.getModel();
      model.removeListener(this.undoHandler);
      this.graph.removeListener(this.moveHandler);
      this.graph.removeListener(this.resizeHandler);
    }

    this.graph = graph;

    if (this.graph != null) {
      const model = this.graph.getModel();
      model.addListener(mxEvent.BEFORE_UNDO, this.undoHandler);
      this.graph.addListener(mxEvent.MOVE_CELLS, this.moveHandler);
      this.graph.addListener(mxEvent.RESIZE_CELLS, this.resizeHandler);
    }
  }

  /**
   * Function: hasLayout
   *
   * Returns true if the given cell has a layout. This implementation invokes
   * <getLayout> with <mxEvent.LAYOUT_CELLS> as the eventName. Override this
   * if creating layouts in <getLayout> is expensive and return true if
   * <getLayout> will return a layout for the given cell for
   * <mxEvent.BEGIN_UPDATE> or <mxEvent.END_UPDATE>.
   */
  hasLayout(cell: mxCell): boolean {
    return !!this.getLayout(cell, mxEvent.LAYOUT_CELLS);
  }

  /**
   * Function: getLayout
   *
   * Returns the layout for the given cell and eventName. Possible
   * event names are <mxEvent.MOVE_CELLS> and <mxEvent.RESIZE_CELLS>
   * when cells are moved or resized and <mxEvent.BEGIN_UPDATE> or
   * <mxEvent.END_UPDATE> for the bottom up and top down phases after
   * changes to the graph model. <mxEvent.LAYOUT_CELLS> is used to
   * check if a layout exists for the given cell. This is called
   * from <hasLayout>.
   */
  getLayout(cell: mxCell, eventName: string): any {
    return null;
  }

  /**
   * Function: beforeUndo
   *
   * Called from <undoHandler>.
   *
   * Parameters:
   *
   * cell - Array of <mxCells> that have been moved.
   * evt - Mouse event that represents the mousedown.
   */
  beforeUndo(undoableEdit) {
    this.executeLayoutForCells(this.getCellsForChanges(undoableEdit.changes));
  }

  /**
   * Function: cellsMoved
   *
   * Called from <moveHandler>.
   *
   * Parameters:
   *
   * cell - Array of <mxCells> that have been moved.
   * evt - Mouse event that represents the mousedown.
   */
  cellsMoved(cells, evt) {
    if (cells != null && evt != null) {
      const point = mxUtils.convertPoint(
        this.getGraph().container,
        mxEvent.getClientX(evt),
        mxEvent.getClientY(evt)
      );
      const model = this.getGraph().getModel();

      for (let i = 0; i < cells.length; i += 1) {
        const layout = this.getLayout(
          model.getParent(cells[i]),
          mxEvent.MOVE_CELLS
        );

        if (layout != null) {
          layout.moveCell(cells[i], point.x, point.y);
        }
      }
    }
  }

  /**
   * Function: cellsResized
   *
   * Called from <resizeHandler>.
   *
   * Parameters:
   *
   * cell - Array of <mxCells> that have been resized.
   * bounds - <mxRectangle> taht represents the new bounds.
   */
  cellsResized(
    cells: mxCell[] | null = null,
    bounds: mxRectangle | null = null,
    prev
  ) {
    if (cells != null && bounds != null) {
      const model = this.getGraph().getModel();

      for (let i = 0; i < cells.length; i += 1) {
        const layout = this.getLayout(
          model.getParent(cells[i]),
          mxEvent.RESIZE_CELLS
        );

        if (layout != null) {
          layout.resizeCell(cells[i], bounds[i], prev[i]);
        }
      }
    }
  }

  /**
   * Function: getCellsForChanges
   *
   * Returns the cells for which a layout should be executed.
   */
  getCellsForChanges(changes: any[]): mxCell[] {
    let result = [];
    for (const change of changes) {
      if (change instanceof mxRootChange) {
        return [];
      }
      result = result.concat(this.getCellsForChange(change));
    }
    return result;
  }

  /**
   * Function: getCellsForChange
   *
   * Executes all layouts which have been scheduled during the
   * changes.
   */
  getCellsForChange(change: any): mxCell[] {
    if (change instanceof mxChildChange) {
      return this.addCellsWithLayout(
        change.child,
        this.addCellsWithLayout(change.previous)
      );
    }

    if (
      change instanceof mxTerminalChange ||
      change instanceof mxGeometryChange
    ) {
      return this.addCellsWithLayout(change.cell);
    }

    if (change instanceof mxVisibleChange || change instanceof mxStyleChange) {
      return this.addCellsWithLayout(change.cell);
    }

    return [];
  }

  /**
   * Function: addCellsWithLayout
   *
   * Adds all ancestors of the given cell that have a layout.
   */
  addCellsWithLayout(cell: mxCell, result: mxCell[] = []): mxCell[] {
    return this.addDescendantsWithLayout(
      cell,
      this.addAncestorsWithLayout(cell, result)
    );
  }

  /**
   * Function: addAncestorsWithLayout
   *
   * Adds all ancestors of the given cell that have a layout.
   */
  addAncestorsWithLayout(cell: mxCell, result: mxCell[] = []): mxCell[] {
    if (cell != null) {
      const layout = this.hasLayout(cell);

      if (layout != null) {
        result.push(cell);
      }

      if (this.isBubbling()) {
        const model = this.getGraph().getModel();
        this.addAncestorsWithLayout(model.getParent(cell), result);
      }
    }
    return result;
  }

  /**
   * Function: addDescendantsWithLayout
   *
   * Adds all descendants of the given cell that have a layout.
   */
  addDescendantsWithLayout(cell: mxCell, result: mxCell[] = []): mxCell[] {
    if (cell != null && this.hasLayout(cell)) {
      const model = this.getGraph().getModel();

      for (let i = 0; i < model.getChildCount(cell); i += 1) {
        const child = model.getChildAt(cell, i);

        if (this.hasLayout(child)) {
          result.push(child);
          this.addDescendantsWithLayout(child, result);
        }
      }
    }
    return result;
  }

  /**
   * Function: executeLayoutForCells
   *
   * Executes all layouts for the given cells in two phases: In the first phase
   * layouts for child cells are executed before layouts for parent cells with
   * <mxEvent.BEGIN_UPDATE>, in the second phase layouts for parent cells are
   * executed before layouts for child cells with <mxEvent.END_UPDATE>.
   */
  executeLayoutForCells(cells: mxCell[]): void {
    const sorted = mxUtils.sortCells(cells, false);
    this.layoutCells(sorted, true);
    this.layoutCells(sorted.reverse(), false);
  }

  /**
   * Function: layoutCells
   *
   * Executes all layouts which have been scheduled during the changes.
   */
  layoutCells(cells: mxCell[], bubble: boolean = false): void {
    if (cells.length > 0) {
      // Invokes the layouts while removing duplicates
      const model = this.getGraph().getModel();

      model.beginUpdate();
      try {
        let last = null;

        for (const cell of cells) {
          if (cell !== model.getRoot() && cell !== last) {
            this.executeLayout(cell, bubble);
            last = cell;
          }
        }

        this.fireEvent(new mxEventObject(mxEvent.LAYOUT_CELLS, 'cells', cells));
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   * Function: executeLayout
   *
   * Executes the given layout on the given parent.
   */
  executeLayout(cell: mxCell, bubble: boolean = false): void {
    const layout = this.getLayout(
      cell,
      bubble ? mxEvent.BEGIN_UPDATE : mxEvent.END_UPDATE
    );
    if (layout != null) {
      layout.execute(cell);
    }
  }

  /**
   * Function: destroy
   *
   * Removes all handlers from the <graph> and deletes the reference to it.
   */
  destroy(): void {
    this.setGraph(null);
  }
}

export default mxLayoutManager;
