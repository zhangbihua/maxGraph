class mxGeometryChange {
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
  constructor(model, cell, geometry) {
    this.model = model;
    this.cell = cell;
    this.geometry = geometry;
    this.previous = geometry;
  }

  /**
   * Function: execute
   *
   * Changes the geometry of <cell> ro <previous> using
   * <mxGraphModel.geometryForCellChanged>.
   */
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
import("../io/mxGenericChangeCodec");

