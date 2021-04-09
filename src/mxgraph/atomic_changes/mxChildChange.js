/**
 * Action to add or remove a child in a model.
 *
 * Constructor: mxChildChange
 *
 * Constructs a change of a child in the
 * specified model.
 *
 * @class mxChildChange
 */
class mxChildChange {
  constructor(model, parent, child, index) {
    this.model = model;
    this.parent = parent;
    this.previous = parent;
    this.child = child;
    this.index = index;
    this.previousIndex = index;
  }

  /**
   * Changes the parent of {@link child}` using
   * <mxGraphModel.parentForCellChanged> and
   * removes or restores the cell's
   * connections.
   */
  // execute(): void;
  execute() {
    if (this.child != null) {
      let tmp = this.model.getParent(this.child);
      const tmp2 = tmp != null ? tmp.getIndex(this.child) : 0;

      if (this.previous == null) {
        this.connect(this.child, false);
      }

      tmp = this.model.parentForCellChanged(
        this.child,
        this.previous,
        this.previousIndex
      );

      if (this.previous != null) {
        this.connect(this.child, true);
      }

      this.parent = this.previous;
      this.previous = tmp;
      this.index = this.previousIndex;
      this.previousIndex = tmp2;
    }
  }

  /**
   * Disconnects the given cell recursively from its
   * terminals and stores the previous terminal in the
   * cell's terminals.
   *
   * @warning doc from mxGraph source code is incorrect
   */
  // connect(cell: mxCell, isConnect: boolean): void;
  connect(cell, isConnect) {
    isConnect = isConnect != null ? isConnect : true;

    const source = cell.getTerminal(true);
    const target = cell.getTerminal(false);

    if (source != null) {
      if (isConnect) {
        this.model.terminalForCellChanged(cell, source, true);
      } else {
        this.model.terminalForCellChanged(cell, null, true);
      }
    }

    if (target != null) {
      if (isConnect) {
        this.model.terminalForCellChanged(cell, target, false);
      } else {
        this.model.terminalForCellChanged(cell, null, false);
      }
    }

    cell.setTerminal(source, true);
    cell.setTerminal(target, false);

    const childCount = this.model.getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      this.connect(this.model.getChildAt(cell, i), isConnect);
    }
  }
}

export default mxChildChange;
import('../serialization/mxChildChangeCodec');
