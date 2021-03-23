class mxCellAttributeChange {
  /**
   * Class: mxCellAttributeChange
   *
   * Action to change the attribute of a cell's user object.
   * There is no method on the graph model that uses this
   * action. To use the action, you can use the code shown
   * in the example below.
   *
   * Example:
   *
   * To change the attributeName in the cell's user object
   * to attributeValue, use the following code:
   *
   * (code)
   * model.beginUpdate();
   * try
   * {
   *   let edit = new mxCellAttributeChange(
   *     cell, attributeName, attributeValue);
   *   model.execute(edit);
   * }
   * finally
   * {
   *   model.endUpdate();
   * }
   * (end)
   *
   * Constructor: mxCellAttributeChange
   *
   * Constructs a change of a attribute of the DOM node
   * stored as the value of the given <mxCell>.
   */
  constructor(cell, attribute, value) {
    this.cell = cell;
    this.attribute = attribute;
    this.value = value;
    this.previous = value;
  }

  /**
   * Function: execute
   *
   * Changes the attribute of the cell's user object by
   * using <mxCell.setAttribute>.
   */
  execute() {
    if (this.cell != null) {
      const tmp = this.cell.getAttribute(this.attribute);

      if (this.previous == null) {
        this.cell.value.removeAttribute(this.attribute);
      } else {
        this.cell.setAttribute(this.attribute, this.previous);
      }

      this.previous = tmp;
    }
  }
}

export default mxCellAttributeChange;
