/**
 * Class: mxVisibleChange
 *
 * Action to change a cell's visible state in a model.
 *
 * Constructor: mxVisibleChange
 *
 * Constructs a change of a visible state in the
 * specified model.
 */
class mxVisibleChange {
  constructor(model, cell, visible) {
    this.model = model;
    this.cell = cell;
    this.visible = visible;
    this.previous = visible;
  }

  /**
   * Function: execute
   *
   * Changes the visible state of {@link cell}` to {@link previous}` using
   * <mxGraphModel.visibleStateForCellChanged>.
   */
  // execute(): void;
  execute() {
    if (this.cell != null) {
      this.visible = this.previous;
      this.previous = this.model.visibleStateForCellChanged(
        this.cell,
        this.previous
      );
    }
  }
}

export default mxVisibleChange;
import('../serialization/mxGenericChangeCodec');
