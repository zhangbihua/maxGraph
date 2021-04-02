class mxValueChange {
  /**
   * Class: mxValueChange
   *
   * Action to change a user object in a model.
   *
   * Constructor: mxValueChange
   *
   * Constructs a change of a user object in the
   * specified model.
   */
  constructor(model, cell, value) {
    this.model = model;
    this.cell = cell;
    this.value = value;
    this.previous = value;
  }

  /**
   * Function: execute
   *
   * Changes the value of <cell> to <previous> using
   * <mxGraphModel.valueForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.value = this.previous;
      this.previous = this.model.valueForCellChanged(this.cell, this.previous);
    }
  }
}

export default mxValueChange;
import("../io/mxGenericChangeCodec");

