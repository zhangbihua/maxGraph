/**
 * Action to change a cell's style in a model.
 *
 * @class mxStyleChange
 */
class mxStyleChange {
  constructor(model, cell, style) {
    this.model = model;
    this.cell = cell;
    this.style = style;
    this.previous = style;
  }

  /**
   * Function: execute
   *
   * Changes the style of {@link cell}` to {@link previous}` using
   * <mxGraphModel.styleForCellChanged>.
   */
  // execute(): void;
  execute() {
    if (this.cell != null) {
      this.style = this.previous;
      this.previous = this.model.styleForCellChanged(this.cell, this.previous);
    }
  }
}

export default mxStyleChange;
import('../serialization/mxGenericChangeCodec');
