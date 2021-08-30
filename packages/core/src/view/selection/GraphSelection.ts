import Cell from '../cell/datatypes/Cell';
import CellArray from '../cell/datatypes/CellArray';
import Rectangle from '../geometry/Rectangle';
import mxClient from '../../mxClient';
import SelectionChange from './SelectionChange';
import UndoableEdit from '../model/UndoableEdit';
import EventObject from '../event/EventObject';
import InternalEvent from '../event/InternalEvent';
import Dictionary from '../../util/Dictionary';
import RootChange from '../model/RootChange';
import ChildChange from '../model/ChildChange';
import { autoImplement } from '../../util/Utils';

import type GraphCells from '../cell/GraphCells';
import type Graph from '../Graph';
import type GraphEvents from '../event/GraphEvents';
import type EventSource from '../event/EventSource';
import { MaxGraph } from '../Graph';

type PartialGraph = Pick<
  Graph,
  'fireEvent' | 'getDefaultParent' | 'getView' | 'getCurrentRoot' | 'getModel'
>;
type PartialCells = Pick<GraphCells, 'isCellSelectable' | 'getCells'>;
type PartialEvents = Pick<GraphEvents, 'isToggleEvent'>;
type PartialClass = PartialGraph & PartialCells & PartialEvents & EventSource;

// @ts-ignore recursive reference error
class GraphSelection extends autoImplement<PartialClass>() {
  // TODO: Document me!!
  cells: CellArray = new CellArray();

  /**
   * Specifies the resource key for the status message after a long operation.
   * If the resource for this key does not exist then the value is used as
   * the status message. Default is 'done'.
   */
  doneResource: string = mxClient.language !== 'none' ? 'done' : '';

  getDoneResource = () => this.doneResource;

  /**
   * Specifies the resource key for the status message while the selection is
   * being updated. If the resource for this key does not exist then the
   * value is used as the status message. Default is 'updatingSelection'.
   */
  updatingSelectionResource: string =
    mxClient.language !== 'none' ? 'updatingSelection' : '';

  getUpdatingSelectionResource = () => this.updatingSelectionResource;

  /**
   * Specifies if only one selected item at a time is allowed.
   * Default is false.
   */
  singleSelection: boolean = false;

  // TODO: Document me!!
  selectionModel: GraphSelection | null = null;

  /**
   * Returns the {@link mxGraphSelectionModel} that contains the selection.
   */
  getSelectionModel() {
    return this.selectionModel;
  }

  /**
   * Sets the {@link mxSelectionModel} that contains the selection.
   */
  setSelectionModel(selectionModel: GraphSelection) {
    this.selectionModel = selectionModel;
  }

  /**
   * Returns {@link singleSelection} as a boolean.
   */
  isSingleSelection() {
    return this.singleSelection;
  }

  /**
   * Sets the {@link singleSelection} flag.
   *
   * @param {boolean} singleSelection Boolean that specifies the new value for
   * {@link singleSelection}.
   */
  setSingleSelection(singleSelection: boolean) {
    this.singleSelection = singleSelection;
  }

  /**
   * Returns true if the given {@link Cell} is selected.
   */
  isSelected(cell: Cell) {
    return this.cells.indexOf(cell) >= 0;
  }

  /**
   * Returns true if no cells are currently selected.
   */
  isEmpty() {
    return this.cells.length === 0;
  }

  /**
   * Clears the selection and fires a {@link change} event if the selection was not
   * empty.
   */
  clear() {
    this.changeSelection(null, this.cells);
  }

  /**
   * Selects the specified {@link Cell} using {@link setCells}.
   *
   * @param cell {@link mxCell} to be selected.
   */
  setCell(cell: Cell | null) {
    this.setCells(cell ? new CellArray(cell) : new CellArray());
  }

  /**
   * Selects the given array of {@link Cell} and fires a {@link change} event.
   *
   * @param cells Array of {@link Cell} to be selected.
   */
  setCells(cells: CellArray): void {
    if (this.singleSelection) {
      cells = new CellArray(<Cell>this.getFirstSelectableCell(cells));
    }

    const tmp = new CellArray();
    for (let i = 0; i < cells.length; i += 1) {
      if (this.isCellSelectable(cells[i])) {
        tmp.push(cells[i]);
      }
    }
    this.changeSelection(tmp, this.cells);
  }

  /**
   * Returns the first selectable cell in the given array of cells.
   */
  getFirstSelectableCell(cells: CellArray) {
    for (let i = 0; i < cells.length; i += 1) {
      if (this.isCellSelectable(cells[i])) {
        return cells[i];
      }
    }

    return null;
  }

  /**
   * Adds the given {@link Cell} to the selection and fires a {@link select} event.
   *
   * @param cell {@link mxCell} to add to the selection.
   */
  addCell(cell: Cell) {
    this.addCells(new CellArray(cell));
  }

  /**
   * Adds the given array of {@link Cell} to the selection and fires a {@link select}
   * event.
   *
   * @param cells Array of {@link Cell} to add to the selection.
   */
  addCells(cells: CellArray) {
    let remove = null;
    if (this.singleSelection) {
      remove = this.cells;

      const selectableCell = this.getFirstSelectableCell(cells);

      cells = selectableCell ? new CellArray(selectableCell) : new CellArray();
    }

    const tmp = new CellArray();
    for (let i = 0; i < cells.length; i += 1) {
      if (!this.isSelected(cells[i]) && this.isCellSelectable(cells[i])) {
        tmp.push(cells[i]);
      }
    }

    this.changeSelection(tmp, remove);
  }

  /**
   * Removes the specified {@link Cell} from the selection and fires a {@link select}
   * event for the remaining cells.
   *
   * @param cell {@link mxCell} to remove from the selection.
   */
  removeCell(cell: Cell) {
    this.removeCells(new CellArray(cell));
  }

  /**
   * Removes the specified {@link Cell} from the selection and fires a {@link select}
   * event for the remaining cells.
   *
   * @param cells {@link mxCell}s to remove from the selection.
   */
  removeCells(cells: CellArray) {
    const tmp = new CellArray();

    for (let i = 0; i < cells.length; i += 1) {
      if (this.isSelected(cells[i])) {
        tmp.push(cells[i]);
      }
    }

    this.changeSelection(null, tmp);
  }

  /**
   * Adds/removes the specified arrays of {@link Cell} to/from the selection.
   *
   * @param added Array of {@link Cell} to add to the selection.
   * @param remove Array of {@link Cell} to remove from the selection.
   */
  changeSelection(added: CellArray | null = null, removed: CellArray | null = null) {
    if (
      (added && added.length > 0 && added[0]) ||
      (removed && removed.length > 0 && removed[0])
    ) {
      const change = new SelectionChange(
        this as MaxGraph,
        added || new CellArray(),
        removed || new CellArray()
      );
      change.execute();
      const edit = new UndoableEdit(this, false);
      edit.add(change);
      this.fireEvent(new EventObject(InternalEvent.UNDO, 'edit', edit));
    }
  }

  /**
   * Inner callback to add the specified {@link Cell} to the selection. No event
   * is fired in this implementation.
   *
   * Paramters:
   *
   * @param cell {@link mxCell} to add to the selection.
   */
  cellAdded(cell: Cell) {
    if (!this.isSelected(cell)) {
      this.cells.push(cell);
    }
  }

  /**
   * Inner callback to remove the specified {@link Cell} from the selection. No
   * event is fired in this implementation.
   *
   * @param cell {@link mxCell} to remove from the selection.
   */
  cellRemoved(cell: Cell) {
    const index = this.cells.indexOf(cell);
    if (index >= 0) {
      this.cells.splice(index, 1);
    }
  }

  /*****************************************************************************
   * Selection
   *****************************************************************************/

  /**
   * Returns true if the given cell is selected.
   *
   * @param cell {@link mxCell} for which the selection state should be returned.
   */
  isCellSelected(cell: Cell) {
    return this.isSelected(cell);
  }

  /**
   * Returns true if the selection is empty.
   */
  isSelectionEmpty() {
    return this.isEmpty();
  }

  /**
   * Clears the selection using {@link mxGraphSelectionModel.clear}.
   */
  clearSelection() {
    this.clear();
  }

  /**
   * Returns the number of selected cells.
   */
  getSelectionCount() {
    return this.cells.length;
  }

  /**
   * Returns the first cell from the array of selected {@link Cell}.
   */
  getSelectionCell() {
    return this.cells[0];
  }

  /**
   * Returns the array of selected {@link Cell}.
   */
  getSelectionCells() {
    return this.cells.slice();
  }

  /**
   * Sets the selection cell.
   *
   * @param cell {@link mxCell} to be selected.
   */
  setSelectionCell(cell: Cell | null) {
    this.setCell(cell);
  }

  /**
   * Sets the selection cell.
   *
   * @param cells Array of {@link Cell} to be selected.
   */
  setSelectionCells(cells: CellArray) {
    this.setCells(cells);
  }

  /**
   * Adds the given cell to the selection.
   *
   * @param cell {@link mxCell} to be add to the selection.
   */
  addSelectionCell(cell: Cell) {
    this.addCell(cell);
  }

  /**
   * Adds the given cells to the selection.
   *
   * @param cells Array of {@link Cell} to be added to the selection.
   */
  addSelectionCells(cells: CellArray) {
    this.addCells(cells);
  }

  /**
   * Removes the given cell from the selection.
   *
   * @param cell {@link mxCell} to be removed from the selection.
   */
  removeSelectionCell(cell: Cell) {
    this.removeCell(cell);
  }

  /**
   * Removes the given cells from the selection.
   *
   * @param cells Array of {@link Cell} to be removed from the selection.
   */
  removeSelectionCells(cells: CellArray) {
    this.removeCells(cells);
  }

  /**
   * Selects and returns the cells inside the given rectangle for the
   * specified event.
   *
   * @param rect {@link mxRectangle} that represents the region to be selected.
   * @param evt Mouseevent that triggered the selection.
   */
  // selectRegion(rect: mxRectangle, evt: Event): mxCellArray;
  selectRegion(rect: Rectangle, evt: MouseEvent) {
    const cells = this.getCells(rect.x, rect.y, rect.width, rect.height);
    this.selectCellsForEvent(cells, evt);
    return cells;
  }

  /**
   * Selects the next cell.
   */
  selectNextCell() {
    this.selectCell(true);
  }

  /**
   * Selects the previous cell.
   */
  selectPreviousCell() {
    this.selectCell();
  }

  /**
   * Selects the parent cell.
   */
  selectParentCell() {
    this.selectCell(false, true);
  }

  /**
   * Selects the first child cell.
   */
  selectChildCell() {
    this.selectCell(false, false, true);
  }

  /**
   * Selects the next, parent, first child or previous cell, if all arguments
   * are false.
   *
   * @param isNext Boolean indicating if the next cell should be selected.
   * @param isParent Boolean indicating if the parent cell should be selected.
   * @param isChild Boolean indicating if the first child cell should be selected.
   */
  selectCell(isNext = false, isParent = false, isChild = false) {
    const cell = this.cells.length > 0 ? this.cells[0] : null;

    if (this.cells.length > 1) {
      this.clear();
    }

    const parent = cell ? cell.getParent() : this.getDefaultParent();
    const childCount = parent.getChildCount();

    if (!cell && childCount > 0) {
      const child = parent.getChildAt(0);
      this.setSelectionCell(child);
    } else if (
      parent &&
      (!cell || isParent) &&
      this.getView().getState(parent) &&
      parent.getGeometry()
    ) {
      if (this.getCurrentRoot() !== parent) {
        this.setSelectionCell(parent);
      }
    } else if (cell && isChild) {
      const tmp = cell.getChildCount();

      if (tmp > 0) {
        const child = cell.getChildAt(0);
        this.setSelectionCell(child);
      }
    } else if (childCount > 0) {
      let i = parent.getIndex(cell);

      if (isNext) {
        i++;
        const child = parent.getChildAt(i % childCount);
        this.setSelectionCell(child);
      } else {
        i--;
        const index = i < 0 ? childCount - 1 : i;
        const child = parent.getChildAt(index);
        this.setSelectionCell(child);
      }
    }
  }

  /**
   * Selects all children of the given parent cell or the children of the
   * default parent if no parent is specified. To select leaf vertices and/or
   * edges use {@link selectCells}.
   *
   * @param parent Optional {@link Cell} whose children should be selected.
   * Default is {@link defaultParent}.
   * @param descendants Optional boolean specifying whether all descendants should be
   * selected. Default is `false`.
   */
  selectAll(parent: Cell = this.getDefaultParent(), descendants: boolean = false) {
    const cells = descendants
      ? parent.filterDescendants((cell: Cell) => {
          return cell !== parent && !!this.getView().getState(cell);
        })
      : parent.getChildren();

    this.setSelectionCells(cells);
  }

  /**
   * Select all vertices inside the given parent or the default parent.
   */
  selectVertices(parent: Cell, selectGroups = false) {
    this.selectCells(true, false, parent, selectGroups);
  }

  /**
   * Select all vertices inside the given parent or the default parent.
   */
  selectEdges(parent: Cell) {
    this.selectCells(false, true, parent);
  }

  /**
   * Selects all vertices and/or edges depending on the given boolean
   * arguments recursively, starting at the given parent or the default
   * parent if no parent is specified. Use {@link selectAll} to select all cells.
   * For vertices, only cells with no children are selected.
   *
   * @param vertices Boolean indicating if vertices should be selected.
   * @param edges Boolean indicating if edges should be selected.
   * @param parent Optional {@link Cell} that acts as the root of the recursion.
   * Default is {@link defaultParent}.
   * @param selectGroups Optional boolean that specifies if groups should be
   * selected. Default is `false`.
   */
  selectCells(
    vertices = false,
    edges = false,
    parent: Cell = this.getDefaultParent(),
    selectGroups = false
  ) {
    const filter = (cell: Cell) => {
      return (
        !!this.getView().getState(cell) &&
        (((selectGroups || cell.getChildCount() === 0) &&
          cell.isVertex() &&
          vertices &&
          cell.getParent() &&
          !cell.getParent().isEdge()) ||
          (cell.isEdge() && edges))
      );
    };

    const cells = parent.filterDescendants(filter);
    this.setSelectionCells(cells);
  }

  /**
   * Selects the given cell by either adding it to the selection or
   * replacing the selection depending on whether the given mouse event is a
   * toggle event.
   *
   * @param cell {@link mxCell} to be selected.
   * @param evt Optional mouseevent that triggered the selection.
   */
  selectCellForEvent(cell: Cell, evt: MouseEvent) {
    const isSelected = this.isCellSelected(cell);

    if (this.isToggleEvent(evt)) {
      if (isSelected) {
        this.removeSelectionCell(cell);
      } else {
        this.addSelectionCell(cell);
      }
    } else if (!isSelected || this.getSelectionCount() !== 1) {
      this.setSelectionCell(cell);
    }
  }

  /**
   * Selects the given cells by either adding them to the selection or
   * replacing the selection depending on whether the given mouse event is a
   * toggle event.
   *
   * @param cells Array of {@link Cell} to be selected.
   * @param evt Optional mouseevent that triggered the selection.
   */
  selectCellsForEvent(cells: CellArray, evt: MouseEvent) {
    if (this.isToggleEvent(evt)) {
      this.addSelectionCells(cells);
    } else {
      this.setSelectionCells(cells);
    }
  }

  /**
   * Returns true if any sibling of the given cell is selected.
   */
  isSiblingSelected(cell: Cell) {
    const parent = cell.getParent();
    const childCount = parent.getChildCount();

    for (let i = 0; i < childCount; i += 1) {
      const child = parent.getChildAt(i);
      if (cell !== child && this.isCellSelected(child)) {
        return true;
      }
    }

    return false;
  }

  /*****************************************************************************
   * Selection state
   *****************************************************************************/

  /**
   * Function: getSelectionCellsForChanges
   *
   * Returns the cells to be selected for the given array of changes.
   *
   * Parameters:
   *
   * ignoreFn - Optional function that takes a change and returns true if the
   * change should be ignored.
   *
   */
  getSelectionCellsForChanges(changes: any[], ignoreFn: Function | null = null) {
    const dict = new Dictionary();
    const cells: CellArray = new CellArray();

    const addCell = (cell: Cell) => {
      if (!dict.get(cell) && this.getModel().contains(cell)) {
        if (cell.isEdge() || cell.isVertex()) {
          dict.put(cell, true);
          cells.push(cell);
        } else {
          const childCount = cell.getChildCount();

          for (let i = 0; i < childCount; i += 1) {
            addCell(cell.getChildAt(i));
          }
        }
      }
    };

    for (let i = 0; i < changes.length; i += 1) {
      const change = changes[i];

      if (change.constructor !== RootChange && (!ignoreFn || !ignoreFn(change))) {
        let cell = null;

        if (change instanceof ChildChange) {
          cell = change.child;
        } else if (change.cell && change.cell instanceof Cell) {
          cell = change.cell;
        }

        if (cell) {
          addCell(cell);
        }
      }
    }
    return cells;
  }

  /**
   * Removes selection cells that are not in the model from the selection.
   */
  updateSelection() {
    const cells = this.getSelectionCells();
    const removed = new CellArray();

    for (const cell of cells) {
      if (!this.getModel().contains(cell) || !cell.isVisible()) {
        removed.push(cell);
      } else {
        let par = cell.getParent();

        while (par && par !== this.getView().currentRoot) {
          if (par.isCollapsed() || !par.isVisible()) {
            removed.push(cell);
            break;
          }

          par = par.getParent();
        }
      }
    }
    this.removeSelectionCells(removed);
  }
}

export default GraphSelection;
