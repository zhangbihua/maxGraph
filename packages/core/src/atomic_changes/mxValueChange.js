/**
 * Action to change a user object in a model.
 *
 * Constructs a change of a user object in the
 * specified model.
 *
 * @class mxValueChange
 */
class mxValueChange {
  constructor(model, cell, value) {
    this.model = model;
    this.cell = cell;
    this.value = value;
    this.previous = value;
  }

  /**
   * Changes the value of {@link cell}` to {@link previous}` using
   * <mxGraphModel.valueForCellChanged>.
   */
  // execute(): void;
  execute() {
    if (this.cell != null) {
      this.value = this.previous;
      this.previous = this.model.valueForCellChanged(this.cell, this.previous);
    }
  }
}

export default mxValueChange;
// import('../serialization/mxGenericChangeCodec');
