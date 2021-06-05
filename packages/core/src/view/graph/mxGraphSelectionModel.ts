/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */

import mxUndoableEdit from '../../util/undo/mxUndoableEdit';
import mxEventSource from '../../util/event/mxEventSource';
import mxEventObject from '../../util/event/mxEventObject';
import mxClient from '../../mxClient';
import mxSelectionChange from '../../atomic_changes/mxSelectionChange';
import mxEvent from '../../util/event/mxEvent';
import mxCell from '../cell/mxCell';
import mxGraph from './mxGraph';
import mxCellArray from "../cell/mxCellArray";

/**
 * @class mxGraphSelectionModel
 *
 * Implements the selection model for a graph. Here is a listener that handles
 * all removed selection cells.
 *
 * @example
 * ```javascript
 * graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt)
 * {
 *   var cells = evt.getProperty('added');
 *
 *   for (var i = 0; i < cells.length; i++)
 *   {
 *     // Handle cells[i]...
 *   }
 * });
 * ```
 *
 * ### Event: mxEvent.UNDO
 *
 * Fires after the selection was changed in {@link changeSelection}. The
 * `edit` property contains the {@link mxUndoableEdit} which contains the
 * {@link mxSelectionChange}.
 *
 * ### Event: mxEvent.CHANGE
 *
 * Fires after the selection changes by executing an {@link mxSelectionChange}. The
 * `added` and `removed` properties contain arrays of
 * cells that have been added to or removed from the selection, respectively.
 * The names are inverted due to historic reasons. This cannot be changed.
 */
class mxGraphSelectionModel extends mxEventSource {
  constructor(graph: mxGraph) {
    super();

    this.graph = graph;
    this.cells = new mxCellArray();
  }

  // TODO: Document me!!
  cells: mxCellArray;

  /**
   * Specifies the resource key for the status message after a long operation.
   * If the resource for this key does not exist then the value is used as
   * the status message. Default is 'done'.
   */
  doneResource: string = mxClient.language !== 'none' ? 'done' : '';

  /**
   * Specifies the resource key for the status message while the selection is
   * being updated. If the resource for this key does not exist then the
   * value is used as the status message. Default is 'updatingSelection'.
   */
  updatingSelectionResource: string =
    mxClient.language !== 'none' ? 'updatingSelection' : '';

  /**
   * Reference to the enclosing {@link mxGraph}.
   */
  graph: mxGraph | null = null;

  /**
   * Specifies if only one selected item at a time is allowed.
   * Default is false.
   */
  singleSelection: boolean = false;

  /**
   * Returns {@link singleSelection} as a boolean.
   */
  isSingleSelection(): boolean {
    return this.singleSelection;
  }

  /**
   * Sets the {@link singleSelection} flag.
   *
   * @param {boolean} singleSelection Boolean that specifies the new value for
   * {@link singleSelection}.
   */
  setSingleSelection(singleSelection: boolean): void {
    this.singleSelection = singleSelection;
  }

  /**
   * Returns true if the given {@link mxCell} is selected.
   */
  isSelected(cell: mxCell): boolean {
    if (cell != null) {
      return this.cells.indexOf(cell) >= 0;
    }
    return false;
  }

  /**
   * Returns true if no cells are currently selected.
   */
  isEmpty(): boolean {
    return this.cells.length === 0;
  }

  /**
   * Clears the selection and fires a {@link change} event if the selection was not
   * empty.
   */
  clear(): void {
    this.changeSelection(null, this.cells);
  }

  /**
   * Selects the specified {@link mxCell} using {@link setCells}.
   *
   * @param cell {@link mxCell} to be selected.
   */
  setCell(cell: mxCell | null): void {
    if (cell != null) {
      this.setCells(new mxCellArray(cell));
    }
  }

  /**
   * Selects the given array of {@link mxCell} and fires a {@link change} event.
   *
   * @param cells Array of {@link mxCell} to be selected.
   */
  setCells(cells: mxCellArray): void {
    if (cells != null) {
      if (this.singleSelection) {
        cells = new mxCellArray(<mxCell>this.getFirstSelectableCell(cells));
      }

      const tmp = new mxCellArray();
      for (let i = 0; i < cells.length; i += 1) {
        if ((<mxGraph>this.graph).isCellSelectable(cells[i])) {
          tmp.push(cells[i]);
        }
      }
      this.changeSelection(tmp, this.cells);
    }
  }

  /**
   * Returns the first selectable cell in the given array of cells.
   */
  getFirstSelectableCell(cells: mxCellArray): mxCell | null {
    if (cells != null) {
      for (let i = 0; i < cells.length; i += 1) {
        if ((<mxGraph>this.graph).isCellSelectable(cells[i])) {
          return cells[i];
        }
      }
    }
    return null;
  }

  /**
   * Adds the given {@link mxCell} to the selection and fires a {@link select} event.
   *
   * @param cell {@link mxCell} to add to the selection.
   */
  addCell(cell: mxCell | null = null): void {
    if (cell != null) {
      this.addCells(new mxCellArray(cell));
    }
  }

  /**
   * Adds the given array of {@link mxCell} to the selection and fires a {@link select}
   * event.
   *
   * @param cells Array of {@link mxCell} to add to the selection.
   */
  addCells(cells: mxCellArray): void {
    if (cells != null) {
      let remove = null;
      if (this.singleSelection) {
        remove = this.cells;
        cells = new mxCellArray(<mxCell>this.getFirstSelectableCell(cells));
      }

      const tmp = new mxCellArray();
      for (let i = 0; i < cells.length; i += 1) {
        if (
          !this.isSelected(cells[i]) &&
          (<mxGraph>this.graph).isCellSelectable(cells[i])
        ) {
          tmp.push(cells[i]);
        }
      }

      this.changeSelection(tmp, remove);
    }
  }

  /**
   * Removes the specified {@link mxCell} from the selection and fires a {@link select}
   * event for the remaining cells.
   *
   * @param cell {@link mxCell} to remove from the selection.
   */
  removeCell(cell: mxCell | null = null): void {
    if (cell != null) {
      this.removeCells(new mxCellArray(cell));
    }
  }

  /**
   * Removes the specified {@link mxCell} from the selection and fires a {@link select}
   * event for the remaining cells.
   *
   * @param cells {@link mxCell}s to remove from the selection.
   */
  removeCells(cells: mxCellArray | null = null): void {
    if (cells != null) {
      const tmp = new mxCellArray();
      for (let i = 0; i < cells.length; i += 1) {
        if (this.isSelected(cells[i])) {
          tmp.push(cells[i]);
        }
      }
      this.changeSelection(null, tmp);
    }
  }

  /**
   * Adds/removes the specified arrays of {@link mxCell} to/from the selection.
   *
   * @param added Array of {@link mxCell} to add to the selection.
   * @param remove Array of {@link mxCell} to remove from the selection.
   */
  changeSelection(added: mxCellArray | null=null,
                  removed: mxCellArray | null=null): void {
    if (
      (added != null && added.length > 0 && added[0] != null) ||
      (removed != null && removed.length > 0 && removed[0] != null)
    ) {
      const change = new mxSelectionChange(this, added || new mxCellArray(), removed || new mxCellArray());
      change.execute();
      const edit = new mxUndoableEdit(this, false);
      edit.add(change);
      this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
    }
  }

  /**
   * Inner callback to add the specified {@link mxCell} to the selection. No event
   * is fired in this implementation.
   *
   * Paramters:
   *
   * @param cell {@link mxCell} to add to the selection.
   */
  cellAdded(cell: mxCell): void {
    if (cell != null && !this.isSelected(cell)) {
      this.cells.push(cell);
    }
  }

  /**
   * Inner callback to remove the specified {@link mxCell} from the selection. No
   * event is fired in this implementation.
   *
   * @param cell {@link mxCell} to remove from the selection.
   */
  cellRemoved(cell: mxCell): void {
    if (cell != null) {
      const index = this.cells.indexOf(cell);
      if (index >= 0) {
        this.cells.splice(index, 1);
      }
    }
  }
}

export default mxGraphSelectionModel;
