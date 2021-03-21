import mxEventObject from "../util/mxEventObject";
import mxResources from "../util/mxResources";
import mxLog from "../util/mxLog";
import mxEvent from "../util/mxEvent";

class mxSelectionChange {
  /**
   * Class: mxSelectionChange
   *
   * Action to change the current root in a view.
   *
   * Constructor: mxCurrentRootChange
   *
   * Constructs a change of the current root in the given view.
   */
  constructor(selectionModel, added, removed) {
    this.selectionModel = selectionModel;
    this.added = (added != null) ? added.slice() : null;
    this.removed = (removed != null) ? removed.slice() : null;
  };

  /**
   * Function: execute
   *
   * Changes the current root of the view.
   */
  execute = () => {
    var t0 = mxLog.enter('mxSelectionChange.execute');
    window.status = mxResources.get(
        this.selectionModel.updatingSelectionResource) ||
        this.selectionModel.updatingSelectionResource;

    if (this.removed != null) {
      for (let i = 0; i < this.removed.length; i++) {
        this.selectionModel.cellRemoved(this.removed[i]);
      }
    }

    if (this.added != null) {
      for (let i = 0; i < this.added.length; i++) {
        this.selectionModel.cellAdded(this.added[i]);
      }
    }

    let tmp = this.added;
    this.added = this.removed;
    this.removed = tmp;

    window.status = mxResources.get(this.selectionModel.doneResource) ||
        this.selectionModel.doneResource;
    mxLog.leave('mxSelectionChange.execute', t0);

    this.selectionModel.fireEvent(new mxEventObject(mxEvent.CHANGE,
        'added', this.added, 'removed', this.removed));
  };
}

export default mxSelectionChange;
