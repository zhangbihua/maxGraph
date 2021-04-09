/**
 * Action to change a terminal in a model.
 *
 * Constructor: mxTerminalChange
 *
 * Constructs a change of a terminal in the
 * specified model.
 */
class mxTerminalChange {
  constructor(model, cell, terminal, source) {
    this.model = model;
    this.cell = cell;
    this.terminal = terminal;
    this.previous = terminal;
    this.source = source;
  }

  /**
   * Changes the terminal of {@link cell}` to {@link previous}` using
   * <mxGraphModel.terminalForCellChanged>.
   */
  // execute(): void;
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
import('../serialization/mxTerminalChangeCodec');
