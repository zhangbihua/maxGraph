/**
 * Copyright (c) 2006-2018, JGraph Ltd
 * Copyright (c) 2006-2018, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import mxEventSource from '../../util/event/mxEventSource';
import mxUndoableEdit from '../../util/undo/mxUndoableEdit';
import mxCellPath from '../cell/mxCellPath';
import mxDictionary from '../../util/datatypes/mxDictionary';
import mxObjectIdentity from '../../util/datatypes/mxObjectIdentity';
import mxCell from '../cell/mxCell';
import mxUtils from '../../util/mxUtils';
import mxEventObject from '../../util/event/mxEventObject';
import mxEvent from '../../util/event/mxEvent';
import mxPoint from '../../util/datatypes/mxPoint';

import mxChildChange from '../../atomic_changes/mxChildChange';
import mxCollapseChange from '../../atomic_changes/mxCollapseChange';
import mxGeometryChange from '../../atomic_changes/mxGeometryChange';
import mxRootChange from '../../atomic_changes/mxRootChange';
import mxStyleChange from '../../atomic_changes/mxStyleChange';
import mxTerminalChange from '../../atomic_changes/mxTerminalChange';
import mxValueChange from '../../atomic_changes/mxValueChange';
import mxVisibleChange from '../../atomic_changes/mxVisibleChange';
import mxGeometry from "../../util/datatypes/mxGeometry";

/**
 * Extends {@link mxEventSource} to implement a graph model. The graph model acts as
 * a wrapper around the cells which are in charge of storing the actual graph
 * datastructure. The model acts as a transactional wrapper with event
 * notification for all changes, whereas the cells contain the atomic
 * operations for updating the actual datastructure.
 *
 * ### Layers
 *
 * The cell hierarchy in the model must have a top-level root cell which
 * contains the layers (typically one default layer), which in turn contain the
 * top-level cells of the layers. This means each cell is contained in a layer.
 * If no layers are required, then all new cells should be added to the default
 * layer.
 *
 * Layers are useful for hiding and showing groups of cells, or for placing
 * groups of cells on top of other cells in the display. To identify a layer,
 * the {@link isLayer} function is used. It returns true if the parent of the given
 * cell is the root of the model.
 *
 * ### Events
 *
 * See events section for more details. There is a new set of events for
 * tracking transactional changes as they happen. The events are called
 * startEdit for the initial beginUpdate, executed for each executed change
 * and endEdit for the terminal endUpdate. The executed event contains a
 * property called change which represents the change after execution.
 *
 * ### Encoding the model
 *
 * #### To encode a graph model, use the following code:
 *
 * ```javascript
 * var enc = new mxCodec();
 * var node = enc.encode(graph.getModel());
 * ```
 *
 * This will create an XML node that contains all the model information.
 *
 * #### Encoding and decoding changes:
 *
 * For the encoding of changes, a graph model listener is required that encodes
 * each change from the given array of changes.
 *
 * ```javascript
 * model.addListener(mxEvent.CHANGE, function(sender, evt)
 * {
 *   var changes = evt.getProperty('edit').changes;
 *   var nodes = [];
 *   var codec = new mxCodec();
 *
 *   for (var i = 0; i < changes.length; i++)
 *   {
 *     nodes.push(codec.encode(changes[i]));
 *   }
 *   // do something with the nodes
 * });
 * ```
 *
 * For the decoding and execution of changes, the codec needs a lookup function
 * that allows it to resolve cell IDs as follows:
 *
 * ```javascript
 * var codec = new mxCodec();
 * codec.lookup(id)
 * {
 *   return model.getCell(id);
 * }
 * ```
 *
 * For each encoded change (represented by a node), the following code can be
 * used to carry out the decoding and create a change object.
 *
 * ```javascript
 * var changes = [];
 * var change = codec.decode(node);
 * change.model = model;
 * change.execute();
 * changes.push(change);
 * ```
 *
 * The changes can then be dispatched using the model as follows.
 *
 * ```javascript
 * var edit = new mxUndoableEdit(model, false);
 * edit.changes = changes;
 *
 * edit.notify()
 * {
 *   edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
 *   	'edit', edit, 'changes', edit.changes));
 *   edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
 *   	'edit', edit, 'changes', edit.changes));
 * }
 *
 * model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
 * model.fireEvent(new mxEventObject(mxEvent.CHANGE,
 *    'edit', edit, 'changes', changes));
 * ```
 *
 * Event: mxEvent.CHANGE
 *
 * Fires when an undoable edit is dispatched. The `edit` property
 * contains the {@link mxUndoableEdit}. The `changes` property contains
 * the array of atomic changes inside the undoable edit. The changes property
 * is **deprecated**, please use edit.changes instead.
 *
 * ### Example
 *
 * For finding newly inserted cells, the following code can be used:
 *
 * ```javascript
 * graph.model.addListener(mxEvent.CHANGE, function(sender, evt)
 * {
 *   var changes = evt.getProperty('edit').changes;
 *
 *   for (var i = 0; i < changes.length; i++)
 *   {
 *     var change = changes[i];
 *
 *     if (change instanceof mxChildChange &&
 *       change.change.previous == null)
 *     {
 *       graph.startEditingAtCell(change.child);
 *       break;
 *     }
 *   }
 * });
 * ```
 *
 * Event: mxEvent.NOTIFY
 *
 * Same as <mxEvent.CHANGE>, this event can be used for classes that need to
 * implement a sync mechanism between this model and, say, a remote model. In
 * such a setup, only local changes should trigger a notify event and all
 * changes should trigger a change event.
 *
 * Event: mxEvent.EXECUTE
 *
 * Fires between begin- and endUpdate and after an atomic change was executed
 * in the model. The `change` property contains the atomic change
 * that was executed.
 *
 * Event: mxEvent.EXECUTED
 *
 * Fires between START_EDIT and END_EDIT after an atomic change was executed.
 * The `change` property contains the change that was executed.
 *
 * Event: mxEvent.BEGIN_UPDATE
 *
 * Fires after the {@link updateLevel} was incremented in {@link beginUpdate}. This event
 * contains no properties.
 *
 * Event: mxEvent.START_EDIT
 *
 * Fires after the {@link updateLevel} was changed from 0 to 1. This event
 * contains no properties.
 *
 * Event: mxEvent.END_UPDATE
 *
 * Fires after the {@link updateLevel} was decreased in {@link endUpdate} but before any
 * notification or change dispatching. The `edit` property contains
 * the {@link currentEdit}.
 *
 * Event: mxEvent.END_EDIT
 *
 * Fires after the {@link updateLevel} was changed from 1 to 0. This event
 * contains no properties.
 *
 * Event: mxEvent.BEFORE_UNDO
 *
 * Fires before the change is dispatched after the update level has reached 0
 * in {@link endUpdate}. The `edit` property contains the {@link curreneEdit}.
 *
 * Event: mxEvent.UNDO
 *
 * Fires after the change was dispatched in {@link endUpdate}. The `edit`
 * property contains the {@link currentEdit}.
 *
 * @class mxGraphModel
 */
class mxGraphModel extends mxEventSource {
  constructor(root: mxCell | null=null) {
    super();
    this.currentEdit = this.createUndoableEdit();

    if (root != null) {
      this.setRoot(root);
    } else {
      this.clear();
    }
  }

  /**
   * Holds the root cell, which in turn contains the cells that represent the
   * layers of the diagram as child cells. That is, the actual elements of the
   * diagram are supposed to live in the third generation of cells and below.
   */
  // root: mxCell;
  root: mxCell | null = null;

  /**
   * Maps from Ids to cells.
   */
  // cells: any;
  cells: any = {};

  /**
   * Specifies if edges should automatically be moved into the nearest common
   * ancestor of their terminals. Default is true.
   */
  // maintainEdgeParent: boolean;
  maintainEdgeParent: boolean = true;

  /**
   * Specifies if relative edge parents should be ignored for finding the nearest
   * common ancestors of an edge's terminals. Default is true.
   */
  // ignoreRelativeEdgeParent: boolean;
  ignoreRelativeEdgeParent: boolean = true;

  /**
   * Specifies if the model should automatically create Ids for new cells.
   * Default is true.
   */
  // createIds: boolean;
  createIds: boolean = true;

  /**
   * Defines the prefix of new Ids. Default is an empty string.
   */
  // prefix: string;
  prefix: string = '';

  /**
   * Defines the postfix of new Ids. Default is an empty string.
   */
  // postfix: string;
  postfix: string = '';

  /**
   * Specifies the next Id to be created. Initial value is 0.
   */
  // nextId: number | string;
  nextId: number = 0;

  /**
   * Holds the changes for the current transaction. If the transaction is
   * closed then a new object is created for this variable using
   * {@link createUndoableEdit}.
   */
  // currentEdit: any;
  currentEdit: any = null;

  /**
   * Counter for the depth of nested transactions. Each call to {@link beginUpdate}
   * will increment this number and each call to {@link endUpdate} will decrement
   * it. When the counter reaches 0, the transaction is closed and the
   * respective events are fired. Initial value is 0.
   */
  // updateLevel: number;
  updateLevel: number = 0;

  /**
   * True if the program flow is currently inside endUpdate.
   */
  // endingUpdate: boolean;
  endingUpdate: boolean = false;

  /**
   * Sets a new root using {@link createRoot}.
   */
  // clear(): void;
  clear(): void {
    this.setRoot(this.createRoot());
  }

  /**
   * Returns {@link createIds}.
   */
  // isCreateIds(): boolean;
  isCreateIds(): boolean {
    return this.createIds;
  }

  /**
   * Sets {@link createIds}.
   */
  // setCreateIds(value: boolean): void;
  setCreateIds(value: boolean): void {
    this.createIds = value;
  }

  /**
   * Creates a new root cell with a default layer (child 0).
   */
  // createRoot(): mxCell;
  createRoot(): mxCell {
    const cell = new mxCell();
    cell.insert(new mxCell());
    return cell;
  }

  /**
   * Returns the {@link mxCell} for the specified Id or null if no cell can be
   * found for the given Id.
   *
   * @param {string} id  A string representing the Id of the cell.
   */
  // getCell(id: string): mxCell;
  getCell(id: string): mxCell | null {
    return this.cells != null ? this.cells[id] : null;
  }

  /**
   * Returns the cells from the given array where the given filter function
   * returns true.
   */
  // filterCells(cells: Array<mxCell>, filter: (...args: any) => boolean): Array<mxCell>;
  filterCells(cells: mxCell[] | null,
              filter: Function): mxCell[] | null {

    let result = null;
    if (cells != null) {
      result = [];

      for (let i = 0; i < cells.length; i += 1) {
        if (filter(cells[i])) {
          result.push(cells[i]);
        }
      }
    }
    return result;
  }

  /**
   * Returns all descendants of the given cell and the cell itself in an array.
   *
   * @param {mxCell} parent  whose descendants should be returned.
   */
  // getDescendants(parent: mxCell): Array<mxCell>;
  getDescendants(parent: mxCell): mxCell[] {
    return this.filterDescendants(null, parent);
  }

  /**
   * Visits all cells recursively and applies the specified filter function
   * to each cell. If the function returns true then the cell is added
   * to the resulting array. The parent and result paramters are optional.
   * If parent is not specified then the recursion starts at {@link root}.
   *
   * Example:
   * The following example extracts all vertices from a given model:
   * ```javascript
   * var filter(cell)
   * {
   * 	return model.isVertex(cell);
   * }
   * var vertices = model.filterDescendants(filter);
   * ```
   *
   * @param filter  JavaScript function that takes an {@link mxCell} as an argument
   * and returns a boolean.
   * @param parent  Optional {@link mxCell} that is used as the root of the recursion.
   */
  // filterDescendants(filter: (...args: any) => boolean, parent?: mxCell): Array<mxCell>;
  filterDescendants(filter: Function | null,
                    parent: mxCell): mxCell[] {
    // Creates a new array for storing the result
    let result: mxCell[] = [];

    // Recursion starts at the root of the model
    parent = parent || this.getRoot();

    // Checks if the filter returns true for the cell
    // and adds it to the result array
    if (filter == null || filter(parent)) {
      result.push(parent);
    }

    // Visits the children of the cell
    const childCount = this.getChildCount(parent);
    for (let i = 0; i < childCount; i += 1) {
      const child = <mxCell>this.getChildAt(parent, i);
      result = result.concat(this.filterDescendants(filter, child));
    }

    return result;
  }

  /**
   * Returns the root of the model or the topmost parent of the given cell.
   *
   * @param cell  Optional {@link mxCell} that specifies the child.
   */
  // getRoot(cell?: mxCell): mxCell;
  getRoot(cell: mxCell | null = null): mxCell | null {
    let root = cell || this.root;
    if (cell != null) {
      while (cell != null) {
        root = cell;
        cell = this.getParent(cell);
      }
    }
    return root;
  }

  /**
   * Sets the {@link root} of the model using {@link mxRootChange} and adds the change to
   * the current transaction. This resets all datastructures in the model and
   * is the preferred way of clearing an existing model. Returns the new
   * root.
   *
   * Example:
   *
   * ```javascript
   * var root = new mxCell();
   * root.insert(new mxCell());
   * model.setRoot(root);
   * ```
   *
   * @param {mxCell} root  that specifies the new root.
   */
  // setRoot(root: mxCell): mxCell;
  setRoot(root: mxCell | null): mxCell | null {
    this.execute(new mxRootChange(this, root));
    return root;
  }

  /**
   * Inner callback to change the root of the model and update the internal
   * datastructures, such as {@link cells} and {@link nextId}. Returns the previous root.
   *
   * @param {mxCell} root  that specifies the new root.
   */
  // rootChanged(root: mxCell): mxCell;
  rootChanged(root: mxCell | null): mxCell | null {
    const oldRoot = this.root;
    this.root = root;

    // Resets counters and datastructures
    this.nextId = 0;
    this.cells = null;
    this.cellAdded(root);

    return oldRoot;
  }

  /**
   * Returns true if the given cell is the root of the model and a non-null
   * value.
   *
   * @param {mxCell} cell  that represents the possible root.
   */
  // isRoot(cell: mxCell): boolean;
  isRoot(cell: mxCell | null=null): boolean {
    return cell != null && this.root === cell;
  }

  /**
   * Returns true if {@link isRoot} returns true for the parent of the given cell.
   *
   * @param {mxCell} cell  that represents the possible layer.
   */
  // isLayer(cell: mxCell): boolean;
  isLayer(cell: mxCell | null): boolean {
    return this.isRoot(this.getParent(cell));
  }

  /**
   * Returns true if the given parent is an ancestor of the given child. Note
   * returns true if child == parent.
   *
   * @param {mxCell} parent  that specifies the parent.
   * @param {mxCell} child  that specifies the child.
   */
  // isAncestor(parent: mxCell, child: mxCell): boolean;
  isAncestor(parent: mxCell | null,
             child: mxCell | null): boolean {

    while (child != null && child !== parent) {
      child = this.getParent(child);
    }
    return child === parent;
  }

  /**
   * Returns true if the model contains the given {@link mxCell}.
   *
   * @param {mxCell} cell  that specifies the cell.
   */
  // contains(cell: mxCell): boolean;
  contains(cell: mxCell | null): boolean {
    return this.isAncestor(this.root, cell);
  }

  /**
   * Returns the parent of the given cell.
   *
   * @param {mxCell} cell  whose parent should be returned.
   */
  // getParent(cell: mxCell): mxCell;
  getParent(cell: mxCell | null): mxCell | null {
    return cell != null ? cell.getParent() : null;
  }

  /**
   * Adds the specified child to the parent at the given index using
   * {@link mxChildChange} and adds the change to the current transaction. If no
   * index is specified then the child is appended to the parent's array of
   * children. Returns the inserted child.
   *
   * @param {mxCell} parent  that specifies the parent to contain the child.
   * @param {mxCell} child  that specifies the child to be inserted.
   * @param index  Optional integer that specifies the index of the child.
   */
  // add(parent: mxCell, child: mxCell, index?: number): mxCell;
  add(parent: mxCell | null,
      child: mxCell | null,
      index: number | null=null): mxCell | null {

    if (child !== parent && parent != null && child != null) {
      // Appends the child if no index was specified
      if (index == null) {
        index = this.getChildCount(parent);
      }

      const parentChanged = parent !== this.getParent(child);
      this.execute(new mxChildChange(this, parent, child, index));

      // Maintains the edges parents by moving the edges
      // into the nearest common ancestor of its terminals
      if (this.maintainEdgeParent && parentChanged) {
        this.updateEdgeParents(child);
      }
    }
    return child;
  }

  /**
   * Inner callback to update {@link cells} when a cell has been added. This
   * implementation resolves collisions by creating new Ids. To change the
   * ID of a cell after it was inserted into the model, use the following
   * code:
   *
   * (code
   * delete model.cells[cell.getId()];
   * cell.setId(newId);
   * model.cells[cell.getId()] = cell;
   * ```
   *
   * If the change of the ID should be part of the command history, then the
   * cell should be removed from the model and a clone with the new ID should
   * be reinserted into the model instead.
   *
   * @param {mxCell} cell  that specifies the cell that has been added.
   */
  // cellAdded(cell: mxCell): void;
  cellAdded(cell: mxCell | null): void {
    if (cell != null) {
      // Creates an Id for the cell if not Id exists
      if (cell.getId() == null && this.createIds) {
        cell.setId(this.createId(cell));
      }

      if (cell.getId() != null) {
        let collision: mxCell | null = this.getCell(<string>cell.getId());

        if (collision !== cell) {
          // Creates new Id for the cell
          // as long as there is a collision
          while (collision != null) {
            cell.setId(this.createId(cell));
            collision = this.getCell(<string>cell.getId());
          }

          // Lazily creates the cells dictionary
          if (this.cells == null) {
            this.cells = {};
          }

          this.cells[<string>cell.getId()] = cell;
        }
      }

      // Makes sure IDs of deleted cells are not reused
      if (mxUtils.isNumeric(cell.getId())) {
        this.nextId = Math.max(this.nextId, parseInt(<string>cell.getId()));
      }

      // Recursively processes child cells
      const childCount = this.getChildCount(cell);

      for (let i = 0; i < childCount; i += 1) {
        this.cellAdded(this.getChildAt(cell, i));
      }
    }
  }

  /**
   * Hook method to create an Id for the specified cell. This implementation
   * concatenates {@link prefix}, id and {@link postfix} to create the Id and increments
   * {@link nextId}. The cell is ignored by this implementation, but can be used in
   * overridden methods to prefix the Ids with eg. the cell type.
   *
   * @param {mxCell} cell  to create the Id for.
   */
  // createId(cell: mxCell): string;
  createId(cell: mxCell): string {
    const id = this.nextId;
    this.nextId++;
    return this.prefix + id + this.postfix;
  }

  /**
   * Updates the parent for all edges that are connected to cell or one of
   * its descendants using {@link updateEdgeParent}.
   */
  // updateEdgeParents(cell: mxCell, root: mxCell): void;
  updateEdgeParents(cell: mxCell,
                    root: mxCell | null=null): void {

    // Gets the topmost node of the hierarchy
    root = root || this.getRoot(cell);

    // Updates edges on children first
    const childCount = this.getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      const child = <mxCell>this.getChildAt(cell, i);
      this.updateEdgeParents(child, root);
    }

    // Updates the parents of all connected edges
    const edgeCount = this.getEdgeCount(cell);
    const edges = [];

    for (let i = 0; i < edgeCount; i += 1) {
      edges.push(this.getEdgeAt(cell, i));
    }

    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];

      // Updates edge parent if edge and child have
      // a common root node (does not need to be the
      // model root node)
      if (this.isAncestor(root, edge)) {
        this.updateEdgeParent(edge, root);
      }
    }
  }

  /**
   * Inner callback to update the parent of the specified {@link mxCell} to the
   * nearest-common-ancestor of its two terminals.
   *
   * @param {mxCell} edge  that specifies the edge.
   * @param {mxCell} root  that represents the current root of the model.
   */
  // updateEdgeParent(edge: mxCell, root: mxCell): void;
  updateEdgeParent(edge: mxCell | null,
                   root: mxCell | null): void {

    let source = this.getTerminal(edge, true);
    let target = this.getTerminal(edge, false);
    let cell = null;

    // Uses the first non-relative descendants of the source terminal
    while (
      source != null &&
      !this.isEdge(source) &&
      source.geometry != null &&
      source.geometry.relative
    ) {
      source = this.getParent(source);
    }

    // Uses the first non-relative descendants of the target terminal
    while (
      target != null &&
      this.ignoreRelativeEdgeParent &&
      !this.isEdge(target) &&
      target.geometry != null &&
      target.geometry.relative
    ) {
      target = this.getParent(target);
    }

    if (this.isAncestor(root, source) && this.isAncestor(root, target)) {
      if (source === target) {
        cell = this.getParent(source);
      } else {
        cell = this.getNearestCommonAncestor(source, target);
      }

      if (
        cell != null &&
        (this.getParent(cell) !== this.root || this.isAncestor(cell, edge)) &&
        this.getParent(edge) !== cell
      ) {
        let geo = this.getGeometry(edge);

        if (geo != null) {
          const origin1 = this.getOrigin(this.getParent(edge));
          const origin2 = this.getOrigin(cell);

          const dx = origin2.x - origin1.x;
          const dy = origin2.y - origin1.y;

          geo = <mxGeometry>geo.clone();
          geo.translate(-dx, -dy);
          this.setGeometry(edge, geo);
        }

        this.add(cell, edge, this.getChildCount(cell));
      }
    }
  }

  /**
   * Returns the absolute, accumulated origin for the children inside the
   * given parent as an {@link mxPoint}.
   */
  // getOrigin(cell: mxCell): mxPoint;
  getOrigin(cell: mxCell | null): mxPoint {
    let result = null;

    if (cell != null) {
      result = this.getOrigin(this.getParent(cell));

      if (!this.isEdge(cell)) {
        const geo = this.getGeometry(cell);

        if (geo != null) {
          result.x += geo.x;
          result.y += geo.y;
        }
      }
    } else {
      result = new mxPoint();
    }
    return result;
  }

  /**
   * Returns the nearest common ancestor for the specified cells.
   *
   * @param {mxCell} cell1  that specifies the first cell in the tree.
   * @param {mxCell} cell2  that specifies the second cell in the tree.
   */
  // getNearestCommonAncestor(cell1: mxCell, cell2: mxCell): mxCell;
  getNearestCommonAncestor(cell1: mxCell | null,
                           cell2: mxCell | null): mxCell | null {

    if (cell1 != null && cell2 != null) {
      // Creates the cell path for the second cell
      let path = mxCellPath.create(cell2);

      if (path != null && path.length > 0) {
        // Bubbles through the ancestors of the first
        // cell to find the nearest common ancestor.
        let cell = cell1;
        let current: string | null = mxCellPath.create(cell);

        // Inverts arguments
        if (path.length < current.length) {
          cell = cell2;
          const tmp = current;
          current = path;
          path = tmp;
        }

        while (cell != null) {
          const parent = <mxCell>this.getParent(cell);

          // Checks if the cell path is equal to the beginning of the given cell path
          if (
            path.indexOf(current + mxCellPath.PATH_SEPARATOR) === 0 &&
            parent != null
          ) {
            return cell;
          }

          current = mxCellPath.getParentPath(<string>current);
          cell = parent;
        }
      }
    }
    return null;
  }

  /**
   * Removes the specified cell from the model using {@link mxChildChange} and adds
   * the change to the current transaction. This operation will remove the
   * cell and all of its children from the model. Returns the removed cell.
   *
   * @param {mxCell} cell  that should be removed.
   */
  // remove(cell: mxCell): mxCell;
  remove(cell: mxCell) {
    if (cell === this.root) {
      this.setRoot(null);
    } else if (this.getParent(cell) != null) {
      this.execute(new mxChildChange(this, null, cell));
    }

    return cell;
  }

  /**
   * Inner callback to update {@link cells} when a cell has been removed.
   *
   * @param {mxCell} cell  that specifies the cell that has been removed.
   */
  // cellRemoved(cell: mxCell): void;
  cellRemoved(cell: mxCell) {
    if (cell != null && this.cells != null) {
      // Recursively processes child cells
      const childCount = this.getChildCount(cell);

      for (let i = childCount - 1; i >= 0; i--) {
        this.cellRemoved(<mxCell>this.getChildAt(cell, i));
      }

      // Removes the dictionary entry for the cell
      if (this.cells != null && cell.getId() != null) {
        // @ts-ignore
        delete this.cells[cell.getId()];
      }
    }
  }

  /**
   * Inner callback to update the parent of a cell using <mxCell.insert>
   * on the parent and return the previous parent.
   *
   * @param {mxCell} cell  to update the parent for.
   * @param {mxCell} parent  that specifies the new parent of the cell.
   * @param index  Optional integer that defines the index of the child
   * in the parent's child array.
   */
  // parentForCellChanged(cell: mxCell, parent: mxCell, index: number): mxCell;
  parentForCellChanged(cell: mxCell,
                       parent: mxCell | null,
                       index: number) {

    const previous = <mxCell>this.getParent(cell);

    if (parent != null) {
      if (parent !== previous || previous.getIndex(cell) !== index) {
        parent.insert(cell, index);
      }
    } else if (previous != null) {
      const oldIndex = previous.getIndex(cell);
      previous.remove(oldIndex);
    }

    // Adds or removes the cell from the model
    const par = this.contains(parent);
    const pre = this.contains(previous);

    if (par && !pre) {
      this.cellAdded(cell);
    } else if (pre && !par) {
      this.cellRemoved(cell);
    }
    return previous;
  }

  /**
   * Returns the number of children in the given cell.
   *
   * @param {mxCell} cell  whose number of children should be returned.
   */
  // getChildCount(cell?: mxCell): number;
  getChildCount(cell: mxCell | null) {
    return cell != null ? cell.getChildCount() : 0;
  }

  /**
   * Returns the child of the given {@link mxCell} at the given index.
   *
   * @param {mxCell} cell  that represents the parent.
   * @param index  Integer that specifies the index of the child to be returned.
   */
  // getChildAt(cell: mxCell, index: number): mxCell;
  getChildAt(cell: mxCell | null,
             index: number): mxCell | null {
    return cell != null ? cell.getChildAt(index) : null;
  }

  /**
   * Returns all children of the given {@link mxCell} as an array of {@link mxCell}. The
   * return value should be only be read.
   *
   * @param {mxCell} cell  the represents the parent.
   */
  // getChildren(cell: mxCell): Array<mxCell>;
  getChildren(cell: mxCell): mxCell[] | null {
    return cell != null ? cell.children : null;
  }

  /**
   * Returns the child vertices of the given parent.
   *
   * @param {mxCell} cell  whose child vertices should be returned.
   */
  // getChildVertices(parent: mxCell): Array<mxCell>;
  getChildVertices(parent: mxCell | null) {
    return this.getChildCells(parent, true, false);
  }

  /**
   * Returns the child edges of the given parent.
   *
   * @param {mxCell} cell  whose child edges should be returned.
   */
  // getChildEdges(parent: mxCell): Array<mxCell>;
  getChildEdges(parent: mxCell | null): (mxCell | null)[] {
    return this.getChildCells(parent, false, true);
  }

  /**
   * Returns the children of the given cell that are vertices and/or edges
   * depending on the arguments.
   *
   * @param {mxCell} cell  the represents the parent.
   * @param vertices  Boolean indicating if child vertices should be returned.
   * Default is false.
   * @param edges  Boolean indicating if child edges should be returned.
   * Default is false.
   */
  // getChildCells(parent: mxCell, vertices: boolean, edges: boolean): Array<mxCell>;
  getChildCells(parent: mxCell | null,
                vertices: boolean=false,
                edges: boolean=false): (mxCell | null)[] {

    const childCount = this.getChildCount(parent);
    const result = [];

    for (let i = 0; i < childCount; i += 1) {
      const child = <mxCell>this.getChildAt(parent, i);

      if (
        (!edges && !vertices) ||
        (edges && this.isEdge(child)) ||
        (vertices && this.isVertex(child))
      ) {
        result.push(child);
      }
    }
    return result;
  }

  /**
   * Returns the source or target {@link mxCell} of the given edge depending on the
   * value of the boolean parameter.
   *
   * @param {mxCell} edge  that specifies the edge.
   * @param isSource  Boolean indicating which end of the edge should be returned.
   */
  // getTerminal(edge: mxCell, isSource: boolean): mxCell;
  getTerminal(edge: mxCell | null,
              isSource: boolean=false): mxCell | null {
    return edge != null ? edge.getTerminal(isSource) : null;
  }

  /**
   * Sets the source or target terminal of the given {@link mxCell} using
   * {@link mxTerminalChange} and adds the change to the current transaction.
   * This implementation updates the parent of the edge using {@link updateEdgeParent}
   * if required.
   *
   * @param {mxCell} edge  that specifies the edge.
   * @param {mxCell} terminal  that specifies the new terminal.
   * @param isSource  Boolean indicating if the terminal is the new source or
   * target terminal of the edge.
   */
  // setTerminal(edge: mxCell, terminal: mxCell, isSource: boolean): mxCell;
  setTerminal(edge: mxCell | null,
              terminal: mxCell | null,
              isSource: boolean): mxCell | null {

    const terminalChanged = terminal !== this.getTerminal(edge, isSource);
    this.execute(new mxTerminalChange(this, edge, terminal, isSource));

    if (this.maintainEdgeParent && terminalChanged) {
      this.updateEdgeParent(edge, this.getRoot());
    }
    return terminal;
  }

  /**
   * Sets the source and target {@link mxCell} of the given {@link mxCell} in a single
   * transaction using {@link setTerminal} for each end of the edge.
   *
   * @param {mxCell} edge  that specifies the edge.
   * @param {mxCell} source  that specifies the new source terminal.
   * @param {mxCell} target  that specifies the new target terminal.
   */
  // setTerminals(edge: mxCell, source: mxCell, target: mxCell): void;
  setTerminals(edge: mxCell | null,
               source: mxCell | null,
               target: mxCell | null): void {

    this.beginUpdate();
    try {
      this.setTerminal(edge, source, true);
      this.setTerminal(edge, target, false);
    } finally {
      this.endUpdate();
    }
  }

  /**
   * Inner helper function to update the terminal of the edge using
   * <mxCell.insertEdge> and return the previous terminal.
   *
   * @param {mxCell} edge  that specifies the edge to be updated.
   * @param {mxCell} terminal  that specifies the new terminal.
   * @param isSource  Boolean indicating if the terminal is the new source or
   * target terminal of the edge.
   */
  // terminalForCellChanged(edge: mxCell, terminal: mxCell, isSource: boolean): mxCell;
  terminalForCellChanged(edge: mxCell | null,
                         terminal: mxCell | null,
                         isSource: boolean=false): mxCell | null {

    const previous = this.getTerminal(edge, isSource);
    if (terminal != null) {
      terminal.insertEdge(edge, isSource);
    } else if (previous != null) {
      previous.removeEdge(edge, isSource);
    }
    return previous;
  }

  /**
   * Returns the number of distinct edges connected to the given cell.
   *
   * @param {mxCell} cell  that represents the vertex.
   */
  // getEdgeCount(cell: mxCell): number;
  getEdgeCount(cell: mxCell): number {
    return cell != null ? cell.getEdgeCount() : 0;
  }

  /**
   * Returns the edge of cell at the given index.
   *
   * @param {mxCell} cell  that specifies the vertex.
   * @param index  Integer that specifies the index of the edge
   * to return.
   */
  // getEdgeAt(cell: mxCell, index: number): mxCell;
  getEdgeAt(cell: mxCell,
            index: number): mxCell | null {
    return cell != null ? cell.getEdgeAt(index) : null;
  }

  /**
   * Returns the number of incoming or outgoing edges, ignoring the given
   * edge.
   *
   * @param {mxCell} cell  whose edge count should be returned.
   * @param outgoing  Boolean that specifies if the number of outgoing or
   * incoming edges should be returned.
   * @param {mxCell} ignoredEdge  that represents an edge to be ignored.
   */
  // getDirectedEdgeCount(cell: mxCell, outgoing: boolean, ignoredEdge: boolean): number;
  getDirectedEdgeCount(cell: mxCell,
                       outgoing: boolean,
                       ignoredEdge: mxCell | null=null): number {
    let count = 0;
    const edgeCount = this.getEdgeCount(cell);

    for (let i = 0; i < edgeCount; i += 1) {
      const edge = this.getEdgeAt(cell, i);
      if (edge !== ignoredEdge && this.getTerminal(edge, outgoing) === cell) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * Returns all edges of the given cell without loops.
   *
   * @param {mxCell} cell  whose edges should be returned.
   *
   */
  // getConnections(cell: mxCell): Array<mxCell>;
  getConnections(cell: mxCell) {
    return this.getEdges(cell, true, true, false);
  }

  /**
   * Returns the incoming edges of the given cell without loops.
   *
   * @param {mxCell} cell  whose incoming edges should be returned.
   *
   */
  // getIncomingEdges(cell: mxCell): Array<mxCell>;
  getIncomingEdges(cell: mxCell): (mxCell | null)[] {
    return this.getEdges(cell, true, false, false);
  }

  /**
   * Returns the outgoing edges of the given cell without loops.
   *
   * @param {mxCell} cell  whose outgoing edges should be returned.
   *
   */
  // getOutgoingEdges(cell: mxCell): Array<mxCell>;
  getOutgoingEdges(cell: mxCell): (mxCell | null)[] {
    return this.getEdges(cell, false, true, false);
  }

  /**
   * Returns all distinct edges connected to this cell as a new array of
   * {@link mxCell}. If at least one of incoming or outgoing is true, then loops
   * are ignored, otherwise if both are false, then all edges connected to
   * the given cell are returned including loops.
   *
   * @param {mxCell} cell  that specifies the cell.
   * @param incoming  Optional boolean that specifies if incoming edges should be
   * returned. Default is true.
   * @param outgoing  Optional boolean that specifies if outgoing edges should be
   * returned. Default is true.
   * @param includeLoops  Optional boolean that specifies if loops should be returned.
   * Default is true.
   */
  // getEdges(cell: mxCell, incoming?: boolean, outgoing?: boolean, includeLoops?: boolean): Array<mxCell>;
  getEdges(cell: mxCell,
           incoming: boolean=true,
           outgoing: boolean=true,
           includeLoops: boolean=true) {

    const edgeCount = this.getEdgeCount(cell);
    const result = [];

    for (let i = 0; i < edgeCount; i += 1) {
      const edge = this.getEdgeAt(cell, i);
      const source = this.getTerminal(edge, true);
      const target = this.getTerminal(edge, false);

      if (
        (includeLoops && source === target) ||
        (source !== target &&
          ((incoming && target === cell) || (outgoing && source === cell)))
      ) {
        result.push(edge);
      }
    }

    return result;
  }

  /**
   * Returns all edges between the given source and target pair. If directed
   * is true, then only edges from the source to the target are returned,
   * otherwise, all edges between the two cells are returned.
   *
   * @param {mxCell} source  that defines the source terminal of the edge to be
   * returned.
   * @param {mxCell} target  that defines the target terminal of the edge to be
   * returned.
   * @param directed  Optional boolean that specifies if the direction of the
   * edge should be taken into account. Default is false.
   */
  // getEdgesBetween(source: mxCell, target: mxCell, directed?: boolean): Array<mxCell>;
  getEdgesBetween(source: mxCell,
                  target: mxCell,
                  directed: boolean=false) {

    const tmp1 = this.getEdgeCount(source);
    const tmp2 = this.getEdgeCount(target);

    // Assumes the source has less connected edges
    let terminal = source;
    let edgeCount = tmp1;

    // Uses the smaller array of connected edges
    // for searching the edge
    if (tmp2 < tmp1) {
      edgeCount = tmp2;
      terminal = target;
    }

    const result = [];

    // Checks if the edge is connected to the correct
    // cell and returns the first match
    for (let i = 0; i < edgeCount; i += 1) {
      const edge = this.getEdgeAt(terminal, i);
      const src = this.getTerminal(edge, true);
      const trg = this.getTerminal(edge, false);
      const directedMatch = src === source && trg === target;
      const oppositeMatch = trg === source && src === target;

      if (directedMatch || (!directed && oppositeMatch)) {
        result.push(edge);
      }
    }

    return result;
  }

  /**
   * Returns all opposite vertices wrt terminal for the given edges, only
   * returning sources and/or targets as specified. The result is returned
   * as an array of {@link mxCell}.
   *
   * @param edges  Array of {@link mxCell} that contain the edges to be examined.
   * @param {mxCell} terminal  that specifies the known end of the edges.
   * @param sources  Boolean that specifies if source terminals should be contained
   * in the result. Default is true.
   * @param targets  Boolean that specifies if target terminals should be contained
   * in the result. Default is true.
   */
  // getOpposites(edges: Array<mxCell>, terminal: mxCell, sources?: boolean, targets?: boolean): Array<mxCell>;
  getOpposites(edges: mxCell[],
               terminal: mxCell,
               sources: boolean=true,
               targets: boolean=true): mxCell[] {

    const terminals = [];

    if (edges != null) {
      for (let i = 0; i < edges.length; i += 1) {
        const source = this.getTerminal(edges[i], true);
        const target = this.getTerminal(edges[i], false);

        // Checks if the terminal is the source of
        // the edge and if the target should be
        // stored in the result
        if (
          source === terminal &&
          target != null &&
          target !== terminal &&
          targets
        ) {
          terminals.push(target);
        }

        // Checks if the terminal is the taget of
        // the edge and if the source should be
        // stored in the result
        else if (
          target === terminal &&
          source != null &&
          source !== terminal &&
          sources
        ) {
          terminals.push(source);
        }
      }
    }

    return terminals;
  }

  /**
   * Returns the topmost cells of the hierarchy in an array that contains no
   * descendants for each {@link mxCell} that it contains. Duplicates should be
   * removed in the cells array to improve performance.
   *
   * @param cells  Array of {@link mxCell} whose topmost ancestors should be returned.
   */
  // getTopmostCells(cells: Array<mxCell>): Array<mxCell>;
  getTopmostCells(cells: mxCell[]): mxCell[] {
    const dict = new mxDictionary();
    const tmp = [];

    for (let i = 0; i < cells.length; i += 1) {
      dict.put(cells[i], true);
    }

    for (let i = 0; i < cells.length; i += 1) {
      const cell = cells[i];
      let topmost = true;
      let parent = this.getParent(cell);

      while (parent != null) {
        if (dict.get(parent)) {
          topmost = false;
          break;
        }

        parent = this.getParent(parent);
      }

      if (topmost) {
        tmp.push(cell);
      }
    }

    return tmp;
  }

  /**
   * Returns true if the given cell is a vertex.
   *
   * @param {mxCell} cell  that represents the possible vertex.
   */
  // isVertex(cell: mxCell): boolean;
  isVertex(cell: mxCell | null): boolean {
    return cell != null ? cell.isVertex() : false;
  }

  /**
   * Returns true if the given cell is an edge.
   *
   * @param {mxCell} cell  that represents the possible edge.
   */
  // isEdge(cell: mxCell): boolean;
  isEdge(cell: mxCell | null): boolean {
    return cell != null ? cell.isEdge() : false;
  }

  /**
   * Returns true if the given {@link mxCell} is connectable. If {@link edgesConnectable}
   * is false, then this function returns false for all edges else it returns
   * the return value of <mxCell.isConnectable>.
   *
   * @param {mxCell} cell  whose connectable state should be returned.
   */
  // isConnectable(cell: mxCell): boolean;
  isConnectable(cell: mxCell | null) {
    return cell != null ? cell.isConnectable() : false;
  }

  /**
   * Returns the user object of the given {@link mxCell} using <mxCell.getValue>.
   *
   * @param {mxCell} cell  whose user object should be returned.
   */
  // getValue(cell: mxCell): any;
  getValue(cell: mxCell | null) {
    return cell != null ? cell.getValue() : null;
  }

  /**
   * Sets the user object of then given {@link mxCell} using {@link mxValueChange}
   * and adds the change to the current transaction.
   *
   * @param {mxCell} cell  whose user object should be changed.
   * @param value  Object that defines the new user object.
   */
  // setValue(cell: mxCell, value: any): any;
  setValue(cell: mxCell,
           value: any): any {
    this.execute(new mxValueChange(this, cell, value));
    return value;
  }

  /**
   * Inner callback to update the user object of the given {@link mxCell}
   * using <mxCell.valueChanged> and return the previous value,
   * that is, the return value of <mxCell.valueChanged>.
   *
   * To change a specific attribute in an XML node, the following code can be
   * used.
   *
   * ```javascript
   * graph.getModel().valueForCellChanged(cell, value)
   * {
   *   var previous = cell.value.getAttribute('label');
   *   cell.value.setAttribute('label', value);
   *
   *   return previous;
   * };
   * ```
   */
  // valueForCellChanged(cell: mxCell, value: any): any;
  valueForCellChanged(cell: mxCell,
                      value: any): any {
    return cell.valueChanged(value);
  }

  /**
   * Returns the {@link mxGeometry} of the given {@link mxCell}.
   *
   * @param {mxCell} cell  whose geometry should be returned.
   */
  // getGeometry(cell: mxCell): mxGeometry;
  getGeometry(cell: mxCell | null): mxGeometry | null {
    return cell != null ? cell.getGeometry() : null;
  }

  /**
   * Sets the {@link mxGeometry} of the given {@link mxCell}. The actual update
   * of the cell is carried out in {@link geometryForCellChanged}. The
   * {@link mxGeometryChange} action is used to encapsulate the change.
   *
   * @param {mxCell} cell  whose geometry should be changed.
   * @param {mxGeometry} geometry  that defines the new geometry.
   */
  // setGeometry(cell: mxCell, geometry: mxGeometry): mxGeometry;
  setGeometry(cell: mxCell | null,
              geometry: mxGeometry): mxGeometry {

    if (geometry !== this.getGeometry(cell)) {
      this.execute(new mxGeometryChange(this, cell, geometry));
    }
    return geometry;
  }

  /**
   * Inner callback to update the {@link mxGeometry} of the given {@link mxCell} using
   * <mxCell.setGeometry> and return the previous {@link mxGeometry}.
   */
  // geometryForCellChanged(cell: mxCell, geometry: mxGeometry): mxGeometry;
  geometryForCellChanged(cell: mxCell,
                         geometry: mxGeometry): mxGeometry | null {

    const previous = this.getGeometry(cell);
    cell.setGeometry(geometry);
    return previous;
  }

  /**
   * Returns the style of the given {@link mxCell}.
   *
   * @param {mxCell} cell  whose style should be returned.
   */
  // getStyle(cell: mxCell): string | null;
  getStyle(cell: mxCell | null): any {
    return cell != null ? cell.getStyle() : null;
  }

  /**
   * Sets the style of the given {@link mxCell} using {@link mxStyleChange} and
   * adds the change to the current transaction.
   *
   * @param {mxCell} cell  whose style should be changed.
   * @param style  String of the form [stylename;|key=value;] to specify
   * the new cell style.
   */
  // setStyle(cell: mxCell, style: string): string;
  setStyle(cell: mxCell,
           style: any): any {

    if (style !== this.getStyle(cell)) {
      this.execute(new mxStyleChange(this, cell, style));
    }
    return style;
  }

  /**
   * Inner callback to update the style of the given {@link mxCell}
   * using <mxCell.setStyle> and return the previous style.
   *
   * @param {mxCell} cell  that specifies the cell to be updated.
   * @param style  String of the form [stylename;|key=value;] to specify
   * the new cell style.
   */
  // styleForCellChanged(cell: mxCell, style: string): string;
  styleForCellChanged(cell: mxCell,
                      style: any): mxCell | null {

    const previous = this.getStyle(cell);
    cell.setStyle(style);
    return previous;
  }

  /**
   * Returns true if the given {@link mxCell} is collapsed.
   *
   * @param {mxCell} cell  whose collapsed state should be returned.
   */
  // isCollapsed(cell: mxCell): boolean;
  isCollapsed(cell: mxCell | null): boolean {
    return cell != null ? cell.isCollapsed() : false;
  }

  /**
   * Sets the collapsed state of the given {@link mxCell} using {@link mxCollapseChange}
   * and adds the change to the current transaction.
   *
   * @param {mxCell} cell  whose collapsed state should be changed.
   * @param collapsed  Boolean that specifies the new collpased state.
   */
  // setCollapsed(cell: mxCell, collapsed: boolean): boolean;
  setCollapsed(cell: mxCell,
               collapsed: boolean): boolean {

    if (collapsed !== this.isCollapsed(cell)) {
      this.execute(new mxCollapseChange(this, cell, collapsed));
    }
    return collapsed;
  }

  /**
   * Inner callback to update the collapsed state of the
   * given {@link mxCell} using <mxCell.setCollapsed> and return
   * the previous collapsed state.
   *
   * @param {mxCell} cell  that specifies the cell to be updated.
   * @param collapsed  Boolean that specifies the new collpased state.
   */
  // collapsedStateForCellChanged(cell: mxCell, collapsed: boolean): boolean;
  collapsedStateForCellChanged(cell: mxCell,
                               collapsed: boolean): boolean {

    const previous = this.isCollapsed(cell);
    cell.setCollapsed(collapsed);
    return previous;
  }

  /**
   * Returns true if the given {@link mxCell} is visible.
   *
   * @param {mxCell} cell  whose visible state should be returned.
   */
  // isVisible(cell: mxCell): boolean;
  isVisible(cell: mxCell | null): boolean {
    return cell != null ? cell.isVisible() : false;
  }

  /**
   * Sets the visible state of the given {@link mxCell} using {@link mxVisibleChange} and
   * adds the change to the current transaction.
   *
   * @param {mxCell} cell  whose visible state should be changed.
   * @param visible  Boolean that specifies the new visible state.
   */
  // setVisible(cell: mxCell, visible: boolean): boolean;
  setVisible(cell: mxCell,
             visible: boolean) {

    if (visible !== this.isVisible(cell)) {
      this.execute(new mxVisibleChange(this, cell, visible));
    }
    return visible;
  }

  /**
   * Inner callback to update the visible state of the
   * given {@link mxCell} using <mxCell.setCollapsed> and return
   * the previous visible state.
   *
   * @param {mxCell} cell  that specifies the cell to be updated.
   * @param visible  Boolean that specifies the new visible state.
   */
  // visibleStateForCellChanged(cell: mxCell, visible: boolean): boolean;
  visibleStateForCellChanged(cell: mxCell,
                             visible: boolean): boolean {
    const previous = this.isVisible(cell);
    cell.setVisible(visible);
    return previous;
  }

  /**
   * Executes the given edit and fires events if required. The edit object
   * requires an execute function which is invoked. The edit is added to the
   * {@link currentEdit} between {@link beginUpdate} and {@link endUpdate} calls, so that
   * events will be fired if this execute is an individual transaction, that
   * is, if no previous {@link beginUpdate} calls have been made without calling
   * {@link endUpdate}. This implementation fires an {@link execute} event before
   * executing the given change.
   *
   * @param change  Object that described the change.
   */
  // execute(change: any): void;
  execute(change: any): void {
    change.execute();
    this.beginUpdate();
    this.currentEdit.add(change);
    this.fireEvent(new mxEventObject(mxEvent.EXECUTE, 'change', change));
    // New global executed event
    this.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
    this.endUpdate();
  }

  /**
   * Increments the {@link updateLevel} by one. The event notification
   * is queued until {@link updateLevel} reaches 0 by use of
   * {@link endUpdate}.
   *
   * All changes on {@link mxGraphModel} are transactional,
   * that is, they are executed in a single undoable change
   * on the model (without transaction isolation).
   * Therefore, if you want to combine any
   * number of changes into a single undoable change,
   * you should group any two or more API calls that
   * modify the graph model between {@link beginUpdate}
   * and {@link endUpdate} calls as shown here:
   *
   * ```javascript
   * var model = graph.getModel();
   * var parent = graph.getDefaultParent();
   * var index = model.getChildCount(parent);
   * model.beginUpdate();
   * try
   * {
   *   model.add(parent, v1, index);
   *   model.add(parent, v2, index+1);
   * }
   * finally
   * {
   *   model.endUpdate();
   * }
   * ```
   *
   * Of course there is a shortcut for appending a
   * sequence of cells into the default parent:
   *
   * ```javascript
   * graph.addCells([v1, v2]).
   * ```
   */
  // beginUpdate(): void;
  beginUpdate(): void {
    this.updateLevel += 1;
    this.fireEvent(new mxEventObject(mxEvent.BEGIN_UPDATE));

    if (this.updateLevel === 1) {
      this.fireEvent(new mxEventObject(mxEvent.START_EDIT));
    }
  }

  /**
   * Decrements the {@link updateLevel} by one and fires an {@link undo}
   * event if the {@link updateLevel} reaches 0. This function
   * indirectly fires a {@link change} event by invoking the notify
   * function on the {@link currentEdit} und then creates a new
   * {@link currentEdit} using {@link createUndoableEdit}.
   *
   * The {@link undo} event is fired only once per edit, whereas
   * the {@link change} event is fired whenever the notify
   * function is invoked, that is, on undo and redo of
   * the edit.
   */
  // endUpdate(): void;
  endUpdate(): void {
    this.updateLevel -= 1;

    if (this.updateLevel === 0) {
      this.fireEvent(new mxEventObject(mxEvent.END_EDIT));
    }

    if (!this.endingUpdate) {
      this.endingUpdate = this.updateLevel === 0;
      this.fireEvent(
        new mxEventObject(mxEvent.END_UPDATE, 'edit', this.currentEdit)
      );

      try {
        if (this.endingUpdate && !this.currentEdit.isEmpty()) {
          this.fireEvent(
            new mxEventObject(mxEvent.BEFORE_UNDO, 'edit', this.currentEdit)
          );
          const tmp = this.currentEdit;
          this.currentEdit = this.createUndoableEdit();
          tmp.notify();
          this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', tmp));
        }
      } finally {
        this.endingUpdate = false;
      }
    }
  }

  /**
   * Creates a new {@link mxUndoableEdit} that implements the
   * notify function to fire a {@link change} and {@link notify} event
   * through the {@link mxUndoableEdit}'s source.
   *
   * @param significant  Optional boolean that specifies if the edit to be created is
   * significant. Default is true.
   */
  // createUndoableEdit(significant?: boolean): mxUndoableEdit;
  createUndoableEdit(significant: boolean=true): any {
    const edit = new mxUndoableEdit(this, significant);

    edit.notify = () => {
      // LATER: Remove changes property (deprecated)
      edit.source.fireEvent(
        new mxEventObject(mxEvent.CHANGE, 'edit', edit, 'changes', edit.changes)
      );
      edit.source.fireEvent(
        new mxEventObject(mxEvent.NOTIFY, 'edit', edit, 'changes', edit.changes)
      );
    };

    return edit;
  }

  /**
   * Merges the children of the given cell into the given target cell inside
   * this model. All cells are cloned unless there is a corresponding cell in
   * the model with the same id, in which case the source cell is ignored and
   * all edges are connected to the corresponding cell in this model. Edges
   * are considered to have no identity and are always cloned unless the
   * cloneAllEdges flag is set to false, in which case edges with the same
   * id in the target model are reconnected to reflect the terminals of the
   * source edges.
   */
  // mergeChildren(from: mxGraphModel, to: mxGraphModel, cloneAllEdges?: boolean): void;
  mergeChildren(from: mxCell,
                to: mxCell,
                cloneAllEdges: boolean=true) : void {

    this.beginUpdate();
    try {
      const mapping: any = {};
      this.mergeChildrenImpl(from, to, cloneAllEdges, mapping);

      // Post-processes all edges in the mapping and
      // reconnects the terminals to the corresponding
      // cells in the target model
      for (const key in mapping) {
        const cell = mapping[key];
        let terminal = this.getTerminal(cell, true);

        if (terminal != null) {
          terminal = mapping[mxCellPath.create(terminal)];
          this.setTerminal(cell, terminal, true);
        }

        terminal = this.getTerminal(cell, false);

        if (terminal != null) {
          terminal = mapping[mxCellPath.create(terminal)];
          this.setTerminal(cell, terminal, false);
        }
      }
    } finally {
      this.endUpdate();
    }
  }

  /**
   * Clones the children of the source cell into the given target cell in
   * this model and adds an entry to the mapping that maps from the source
   * cell to the target cell with the same id or the clone of the source cell
   * that was inserted into this model.
   */
  // mergeChildrenImpl(from: mxGraphModel, to: mxGraphModel, cloneAllEdges: boolean, mapping: any): void;
  mergeChildrenImpl(from: mxCell,
                    to: mxCell,
                    cloneAllEdges: boolean,
                    mapping: any={}) {

    this.beginUpdate();
    try {
      const childCount = from.getChildCount();

      for (let i = 0; i < childCount; i += 1) {
        const cell = <mxCell>from.getChildAt(i);

        if (typeof cell.getId === 'function') {
          const id: string = <string>cell.getId();
          let target =
            id != null && (!this.isEdge(cell) || !cloneAllEdges)
              ? this.getCell(id)
              : null;

          // Clones and adds the child if no cell exists for the id
          if (target == null) {
            const clone = cell.clone();
            clone.setId(id);

            // Sets the terminals from the original cell to the clone
            // because the lookup uses strings not cells in JS
            clone.setTerminal(cell.getTerminal(true), true);
            clone.setTerminal(cell.getTerminal(false), false);

            // Do *NOT* use model.add as this will move the edge away
            // from the parent in updateEdgeParent if maintainEdgeParent
            // is enabled in the target model
            target = to.insert(clone);
            this.cellAdded(target);
          }

          // Stores the mapping for later reconnecting edges
          mapping[mxCellPath.create(cell)] = target;

          // Recurses
          this.mergeChildrenImpl(cell, <mxCell>target, cloneAllEdges, mapping);
        }
      }
    } finally {
      this.endUpdate();
    }
  }

  /**
   * Returns an array that represents the set (no duplicates) of all parents
   * for the given array of cells.
   *
   * @param cells  Array of cells whose parents should be returned.
   */
  // getParents(cells: Array<mxCell>): Array<mxCell>;
  getParents(cells: mxCell[] | null) {
    const parents = [];

    if (cells != null) {
      const dict = new mxDictionary();

      for (const cell of cells) {
        const parent = this.getParent(cell);

        if (parent != null && !dict.get(parent)) {
          dict.put(parent, true);
          parents.push(parent);
        }
      }
    }
    return parents;
  }

  //
  // Cell Cloning
  //

  /**
   * Returns a deep clone of the given {@link mxCell}` (including
   * the children) which is created using {@link cloneCells}`.
   *
   * @param {mxCell} cell  to be cloned.
   */
  // cloneCell(cell: mxCell): mxCell;
  cloneCell(cell: mxCell | null,
            includeChildren: boolean): mxCell | null {
    if (cell != null) {
      return this.cloneCells([cell], includeChildren)[0];
    }
    return null;
  }

  /**
   * Returns an array of clones for the given array of {@link mxCell}`.
   * Depending on the value of includeChildren, a deep clone is created for
   * each cell. Connections are restored based if the corresponding
   * cell is contained in the passed in array.
   *
   * @param cells  Array of {@link mxCell}` to be cloned.
   * @param includeChildren  Boolean indicating if the cells should be cloned
   * with all descendants.
   * @param mapping  Optional mapping for existing clones.
   */
  // cloneCells(cells: Array<mxCell>, includeChildren?: boolean, mapping?: any): Array<mxCell>;
  cloneCells(cells: mxCell[],
             includeChildren: boolean=true,
             mapping: any={}): (mxCell | null)[] {

    const clones: (mxCell | null)[] = [];

    for (let i = 0; i < cells.length; i += 1) {
      if (cells[i] != null) {
        clones.push(this.cloneCellImpl(cells[i], mapping, includeChildren));
      } else {
        clones.push(null);
      }
    }

    for (let i = 0; i < clones.length; i += 1) {
      if (clones[i] != null) {
        this.restoreClone(clones[i], cells[i], mapping);
      }
    }
    return clones;
  }

  /**
   * Inner helper method for cloning cells recursively.
   */
  // cloneCellImpl(cell: mxCell, mapping?: any, includeChildren?: boolean): mxCell;
  cloneCellImpl(cell: mxCell,
                mapping: any={},
                includeChildren: boolean): mxCell {

    const ident = mxObjectIdentity.get(cell);
    let clone = mapping ? mapping[ident] : null;

    if (clone == null) {
      clone = this.cellCloned(cell);
      mapping[ident] = clone;

      if (includeChildren) {
        const childCount = this.getChildCount(cell);

        for (let i = 0; i < childCount; i += 1) {
          const cloneChild = this.cloneCellImpl(
            <mxCell>this.getChildAt(cell, i),
            mapping,
            true
          );
          clone.insert(cloneChild);
        }
      }
    }
    return clone;
  }

  /**
   * Hook for cloning the cell. This returns cell.clone() or
   * any possible exceptions.
   */
  // cellCloned(cell: mxCell): mxCell;
  cellCloned(cell: mxCell): mxCell {
    return cell.clone();
  }

  /**
   * Inner helper method for restoring the connections in
   * a network of cloned cells.
   */
  // restoreClone(clone: mxCell, cell: mxCell, mapping?: any): void;
  restoreClone(clone: mxCell | null,
               cell: mxCell | null,
               mapping: any): void {

    const source = this.getTerminal(cell, true);

    if (source != null) {
      const tmp = mapping[mxObjectIdentity.get(source)];
      if (tmp != null) {
        tmp.insertEdge(clone, true);
      }
    }

    const target = this.getTerminal(cell, false);
    if (target != null) {
      const tmp = mapping[mxObjectIdentity.get(target)];
      if (tmp != null) {
        tmp.insertEdge(clone, false);
      }
    }

    const childCount = this.getChildCount(clone);
    for (let i = 0; i < childCount; i += 1) {
      this.restoreClone(
        this.getChildAt(clone, i),
        this.getChildAt(cell, i),
        mapping
      );
    }
  }
}

//
// Atomic changes
//
export default mxGraphModel;
import('../../serialization/mxModelCodec');
