import Cell from './Cell';
import Dictionary from '../../util/Dictionary';
import ObjectIdentity from '../../util/ObjectIdentity';

declare global {
  interface Array<T> {
    filterCells: (filter: Function) => T[];
    getOpposites: (terminal: Cell, sources: boolean, targets: boolean) => T[];
    getTopmostCells: () => T[];
    getParents: () => T[];
    cloneCells: (includeChildren?: boolean, mapping?: any) => T[];
    cloneCellImpl: (cell: Cell, mapping?: any, includeChildren?: boolean) => T;
    restoreClone: (clone: Cell, cell: Cell, mapping: any) => void;
  }
}

/**
 * Returns the cells from the given array where the given filter function
 * returns true.
 */
Array.prototype.filterCells = function (filter: Function) {
  let result = [] as Cell[];

  for (let i = 0; i < this.length; i += 1) {
    if (filter(this[i])) {
      result.push(this[i]);
    }
  }

  return result;
};

/**
 * Returns all opposite vertices wrt terminal for the given edges, only
 * returning sources and/or targets as specified. The result is returned
 * as an array of {@link Cell}.
 *
 * @param {Cell} terminal  that specifies the known end of the edges.
 * @param sources  Boolean that specifies if source terminals should be contained
 * in the result. Default is true.
 * @param targets  Boolean that specifies if target terminals should be contained
 * in the result. Default is true.
 */
Array.prototype.getOpposites = function (
  terminal: Cell,
  sources: boolean = true,
  targets: boolean = true
) {
  const terminals = [] as Cell[];

  for (let i = 0; i < this.length; i += 1) {
    const source = this[i].getTerminal(true);
    const target = this[i].getTerminal(false);

    // Checks if the terminal is the source of
    // the edge and if the target should be
    // stored in the result
    if (source === terminal && target != null && target !== terminal && targets) {
      terminals.push(target);
    }

    // Checks if the terminal is the taget of
    // the edge and if the source should be
    // stored in the result
    else if (target === terminal && source != null && source !== terminal && sources) {
      terminals.push(source);
    }
  }

  return terminals;
};

/**
 * Returns the topmost cells of the hierarchy in an array that contains no
 * descendants for each {@link Cell} that it contains. Duplicates should be
 * removed in the cells array to improve performance.
 */
Array.prototype.getTopmostCells = function () {
  const dict = new Dictionary();
  const tmp = [] as Cell[];

  for (let i = 0; i < this.length; i += 1) {
    dict.put(this[i], true);
  }

  for (let i = 0; i < this.length; i += 1) {
    const cell = this[i];
    let topmost = true;
    let parent = cell.getParent();

    while (parent != null) {
      if (dict.get(parent)) {
        topmost = false;
        break;
      }
      parent = parent.getParent();
    }

    if (topmost) {
      tmp.push(cell);
    }
  }

  return tmp;
};

/**
 * Returns an array that represents the set (no duplicates) of all parents
 * for the given array of cells.
 */
Array.prototype.getParents = function () {
  const parents = [];
  const dict = new Dictionary();

  for (const cell of this) {
    const parent = cell.getParent();
    if (parent != null && !dict.get(parent)) {
      dict.put(parent, true);
      parents.push(parent);
    }
  }

  return parents;
};

/**
 * Returns an array of clones for the given array of {@link Cell}`.
 * Depending on the value of includeChildren, a deep clone is created for
 * each cell. Connections are restored based if the corresponding
 * cell is contained in the passed in array.
 *
 * @param includeChildren  Boolean indicating if the cells should be cloned
 * with all descendants.
 * @param mapping  Optional mapping for existing clones.
 */
Array.prototype.cloneCells = function (includeChildren = true, mapping: any = {}) {
  const clones = [] as Cell[];

  for (const cell of this) {
    clones.push(this.cloneCellImpl(cell, mapping, includeChildren));
  }

  for (let i = 0; i < clones.length; i += 1) {
    if (clones[i] != null) {
      this.restoreClone(<Cell>clones[i], this[i], mapping);
    }
  }

  return clones;
};

/**
 * Inner helper method for cloning cells recursively.
 *
 * @private
 */
Array.prototype.cloneCellImpl = function (
  cell: Cell,
  mapping: any = {},
  includeChildren: boolean = false
): Cell {
  const ident = <string>ObjectIdentity.get(cell);
  let clone = mapping ? mapping[ident] : null;

  if (clone == null) {
    clone = cell.clone();
    mapping[ident] = clone;

    if (includeChildren) {
      const childCount = cell.getChildCount();

      for (let i = 0; i < childCount; i += 1) {
        const cloneChild = this.cloneCellImpl(<Cell>cell.getChildAt(i), mapping, true);
        clone.insert(cloneChild);
      }
    }
  }
  return clone;
};

/**
 * Inner helper method for restoring the connections in
 * a network of cloned cells.
 *
 * @private
 */
Array.prototype.restoreClone = function (clone: Cell, cell: Cell, mapping: any) {
  const source = cell.getTerminal(true);

  if (source != null) {
    const tmp = mapping[<string>ObjectIdentity.get(source)];
    if (tmp != null) {
      tmp.insertEdge(clone, true);
    }
  }

  const target = cell.getTerminal(false);
  if (target != null) {
    const tmp = mapping[<string>ObjectIdentity.get(target)];
    if (tmp != null) {
      tmp.insertEdge(clone, false);
    }
  }

  const childCount = clone.getChildCount();
  for (let i = 0; i < childCount; i += 1) {
    this.restoreClone(<Cell>clone.getChildAt(i), <Cell>cell.getChildAt(i), mapping);
  }
};
