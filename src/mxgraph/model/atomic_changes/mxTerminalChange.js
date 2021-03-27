class mxTerminalChange {
  /**
   * Class: mxTerminalChange
   *
   * Action to change a terminal in a model.
   *
   * Constructor: mxTerminalChange
   *
   * Constructs a change of a terminal in the
   * specified model.
   */
  constructor(model, cell, terminal, source) {
    this.model = model;
    this.cell = cell;
    this.terminal = terminal;
    this.previous = terminal;
    this.source = source;
  }

  /**
   * Function: execute
   *
   * Changes the terminal of <cell> to <previous> using
   * <mxGraphModel.terminalForCellChanged>.
   */
  execute() {
    if (this.cell != null) {
      this.terminal = this.previous;
      this.previous = this.model.terminalForCellChanged(
        this.cell,
        this.previous,
        this.source
      );
    }
  }
}

export default mxTerminalChange;
import("../../io/mxTerminalChangeCodec");

