/**
 * Action to change the root in a model.
 *
 * Constructor: mxRootChange
 *
 * Constructs a change of the root in the
 * specified model.
 *
 * @class mxRootChange
 */
class mxRootChange {
  constructor(model, root) {
    this.model = model;
    this.root = root;
    this.previous = root;
  }

  /**
   * Carries out a change of the root using
   * <mxGraphModel.rootChanged>.
   */
  // execute(): void;
  execute() {
    this.root = this.previous;
    this.previous = this.model.rootChanged(this.previous);
  }
}

export default mxRootChange;
import('../serialization/mxRootChangeCodec');
