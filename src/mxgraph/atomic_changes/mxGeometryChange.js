/**
 * Class: mxGeometryChange
 *
 * Action to change a cell's geometry in a model.
 *
 * Constructor: mxGeometryChange
 *
 * Constructs a change of a geometry in the
 * specified model.
 */
class mxGeometryChange {
  constructor(model, cell, geometry) {
    this.model = model;
    this.cell = cell;
    this.geometry = geometry;
    this.previous = geometry;
  }

  /**
   * Function: execute
   *
   * Changes the geometry of {@link cell}` ro {@link previous}` using
   * <mxGraphModel.geometryForCellChanged>.
   */
  // execute(): void;
  execute() {
    if (this.cell != null) {
      this.geometry = this.previous;
      this.previous = this.model.geometryForCellChanged(
        this.cell,
        this.previous
      );
    }
  }
}

export default mxGeometryChange;
import('../serialization/mxGenericChangeCodec');
