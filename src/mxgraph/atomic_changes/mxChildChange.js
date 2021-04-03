/**
 * Class: mxChildChange
 *
 * Action to add or remove a child in a model.
 *
 * Constructor: mxChildChange
 *
 * Constructs a change of a child in the
 * specified model.
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
   * Function: execute
   *
   * Changes the parent of <child> using
   * <mxGraphModel.parentForCellChanged> and
   * removes or restores the cell's
   * connections.
   */
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
   * Function: disconnect
   *
   * Disconnects the given cell recursively from its
   * terminals and stores the previous terminal in the
   * cell's terminals.
   */
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
