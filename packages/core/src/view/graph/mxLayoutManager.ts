/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
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
import mxMouseEvent from "../../util/event/mxMouseEvent";
import { getClientX, getClientY } from '../../util/mxEventUtils';

/**
 * @class mxLayoutManager
 * @extends {mxEventSource}
 *
 * Implements a layout manager that runs a given layout after any changes to the graph:
 *
 * ### Example
 *
 * @example
 * ```javascript
 * var layoutMgr = new mxLayoutManager(graph);
 * layoutMgr.getLayout(cell, eventName)
 * {
 *   return layout;
 * };
 * ```
 *
 * See {@link getLayout} for a description of the possible eventNames.
 *
 * #### Event: mxEvent.LAYOUT_CELLS
 *
 * Fires between begin- and endUpdate after all cells have been layouted in
 * {@link layoutCells}. The `cells` property contains all cells that have
 * been passed to {@link layoutCells}.
 */
class mxLayoutManager extends mxEventSource {
  constructor(graph: mxGraph) {
    super();

    // Executes the layout before the changes are dispatched
    this.undoHandler = (sender: any, evt: mxEventObject) => {
      if (this.isEnabled()) {
        this.beforeUndo(evt.getProperty('edit'));
      }
    };

    // Notifies the layout of a move operation inside a parent
    this.moveHandler = (sender: any, evt: mxEventObject) => {
      if (this.isEnabled()) {
        this.cellsMoved(evt.getProperty('cells'), evt.getProperty('event'));
      }
    };

    // Notifies the layout of a move operation inside a parent
    this.resizeHandler = (sender: any, evt: mxEventObject) => {
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
   * Reference to the enclosing {@link mxGraph}.
   */
  // graph: mxGraph;
  graph: mxGraph | null = null;

  /**
   * Specifies if the layout should bubble along
   * the cell hierarchy.
   * @default true
   */
  // bubbling: boolean;
  bubbling: boolean = true;

  /**
   * Specifies if event handling is enabled.
   * @default true
   */
  // enabled: boolean;
  enabled: boolean = true;

  /**
   * Holds the function that handles the endUpdate event.
   */
  // undoHandler: Function;
  undoHandler: Function | null = null;

  /**
   * Holds the function that handles the move event.
   */
  // moveHandler: Function;
  moveHandler: Function | null = null;

  /**
   * Holds the function that handles the resize event.
   */
  // resizeHandler: Function;
  resizeHandler: Function | null = null;

  /**
   * Returns true if events are handled. This implementation
   * returns {@link enabled}.
   */
  // isEnabled(): boolean;
  isEnabled() {
    return this.enabled;
  }

  /**
   * Enables or disables event handling. This implementation
   * updates {@link enabled}.
   *
   * @param enabled Boolean that specifies the new enabled state.
   */
  // setEnabled(enabled: boolean): void;
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Returns true if a layout should bubble, that is, if the parent layout
   * should be executed whenever a cell layout (layout of the children of
   * a cell) has been executed. This implementation returns {@link bubbling}.
   */
  // isBubbling(): boolean;
  isBubbling(): boolean {
    return this.bubbling;
  }

  /**
   * Sets {@link bubbling}.
   */
  // setBubbling(value: boolean): void;
  setBubbling(value: boolean): void {
    this.bubbling = value;
  }

  /**
   * Returns the graph that this layout operates on.
   */
  // getGraph(): mxGraph;
  getGraph(): mxGraph | null {
    return this.graph;
  }

  /**
   * Sets the graph that the layouts operate on.
   */
  // setGraph(graph: mxGraph): void;
  setGraph(graph: mxGraph | null): void {
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
  hasLayout(cell: mxCell | null): boolean {
    return !!this.getLayout(cell, mxEvent.LAYOUT_CELLS);
  }

  /**
   * Returns the layout for the given cell and eventName. Possible
   * event names are {@link mxEvent.MOVE_CELLS} and {@link mxEvent.RESIZE_CELLS}
   * for callbacks on when cells are moved or resized and
   * {@link mxEvent.BEGIN_UPDATE} and {@link mxEvent.END_UPDATE} for the capture
   * and bubble phase of the layout after any changes of the model.
   */
  // getLayout(cell: mxCell, eventName?: string): mxGraphLayout | null;
  getLayout(cell: mxCell | null, eventName: string): any {
    return null;
  }

  /**
   * Called from {@link undoHandler}.
   *
   * @param cell Array of {@link mxCell} that have been moved.
   * @param evt Mouse event that represents the mousedown.
   *
   * TODO: what is undoableEdit type?
   */
  // beforeUndo(undoableEdit: any): void;
  beforeUndo(undoableEdit: any): void {
    this.executeLayoutForCells(this.getCellsForChanges(undoableEdit.changes));
  }

  /**
   * Called from {@link moveHandler}.
   *
   * @param cell Array of {@link mxCell} that have been moved.
   * @param evt Mouse event that represents the mousedown.
   */
  // cellsMoved(cells: Array<mxCell>, evt: MouseEvent): void;
  cellsMoved(cells: mxCell[],
             evt: mxMouseEvent): void {

    if (cells != null && evt != null) {
      const point = mxUtils.convertPoint(
        (<mxGraph>this.getGraph()).container,
        getClientX(evt),
        getClientY(evt)
      );
      const model = (<mxGraph>this.getGraph()).getModel();

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
   * Called from {@link resizeHandler}.
   *
   * @param cell Array of {@link mxCell} that have been resized.
   * @param bounds {@link mxRectangle} taht represents the new bounds.
   */
  // cellsResized(cells: Array<mxCell>, bounds: Array<mxRectangle>, prev: Array<any>): void;
  cellsResized(
    cells: mxCell[] | null = null,
    bounds: mxRectangle[] | null = null,
    prev: mxCell[] | null = null
  ): void {
    if (cells != null && bounds != null) {
      const model = (<mxGraph>this.getGraph()).getModel();

      for (let i = 0; i < cells.length; i += 1) {
        const layout = this.getLayout(
          model.getParent(cells[i]),
          mxEvent.RESIZE_CELLS
        );
        if (layout != null) {
          layout.resizeCell(cells[i], bounds[i], prev?.[i]);
        }
      }
    }
  }

  /**
   * Returns the cells for which a layout should be executed.
   */
  // getCellsForChanges(changes: Array<any>): Array<mxCell>;
  getCellsForChanges(changes: any[]): mxCell[] {
    let result: mxCell[] = [];
    for (const change of changes) {
      if (change instanceof mxRootChange) {
        return [];
      }
      result = result.concat(this.getCellsForChange(change));
    }
    return result;
  }

  /**
   * Executes all layouts which have been scheduled during the
   * changes.
   * @param change  mxChildChange|mxTerminalChange|mxVisibleChange|...
   */
  // getCellsForChange(change: any): Array<mxCell>;
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
   * Adds all ancestors of the given cell that have a layout.
   */
  // addCellsWithLayout(cell: mxCell, result: Array<mxCell>): Array<mxCell>;
  addCellsWithLayout(cell: mxCell, result: mxCell[] = []): mxCell[] {
    return this.addDescendantsWithLayout(
      cell,
      this.addAncestorsWithLayout(cell, result)
    );
  }

  /**
   * Adds all ancestors of the given cell that have a layout.
   */
  // addAncestorsWithLayout(cell: mxCell, result: Array<mxCell>): Array<mxCell>;
  addAncestorsWithLayout(cell: mxCell, result: mxCell[] = []): mxCell[] {
    if (cell != null) {
      const layout = this.hasLayout(cell);

      if (layout != null) {
        result.push(cell);
      }

      if (this.isBubbling()) {
        const model = (<mxGraph>this.getGraph()).getModel();
        this.addAncestorsWithLayout(<mxCell>model.getParent(cell), result);
      }
    }
    return result;
  }

  /**
   * Adds all descendants of the given cell that have a layout.
   */
  // addDescendantsWithLayout(cell: mxCell, result: Array<mxCell>): Array<mxCell>;
  addDescendantsWithLayout(cell: mxCell, result: mxCell[] = []): mxCell[] {
    if (cell != null && this.hasLayout(cell)) {
      const model = (<mxGraph>this.getGraph()).getModel();

      for (let i = 0; i < model.getChildCount(cell); i += 1) {
        const child = <mxCell>model.getChildAt(cell, i);

        if (this.hasLayout(child)) {
          result.push(child);
          this.addDescendantsWithLayout(child, result);
        }
      }
    }
    return result;
  }

  /**
   * Executes the given layout on the given parent.
   */
  // executeLayoutForCells(cells: Array<mxCell>): void;
  executeLayoutForCells(cells: mxCell[]): void {
    const sorted = mxUtils.sortCells(cells, false);
    this.layoutCells(sorted, true);
    this.layoutCells(sorted.reverse(), false);
  }

  /**
   * Executes all layouts which have been scheduled during the changes.
   */
  // layoutCells(cells: Array<mxCell>, bubble: string): void;
  layoutCells(cells: mxCell[], bubble: boolean = false): void {
    if (cells.length > 0) {
      // Invokes the layouts while removing duplicates
      const model = (<mxGraph>this.getGraph()).getModel();

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
   * Executes the given layout on the given parent.
   */
  // executeLayout(cell: mxCell, bubble: string): void;
  executeLayout(cell: mxCell,
                bubble: boolean=false): void {
    const layout = this.getLayout(
      cell,
      bubble ? mxEvent.BEGIN_UPDATE : mxEvent.END_UPDATE
    );
    if (layout != null) {
      layout.execute(cell);
    }
  }

  /**
   * Removes all handlers from the {@link graph} and deletes the reference to it.
   */
  // destroy(): void;
  destroy(): void {
    this.setGraph(null);
  }
}

export default mxLayoutManager;
