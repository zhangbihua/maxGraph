import EventObject from '../event/EventObject';
import Resources from '../../util/Resources';
import mxLog from '../../util/gui/mxLog';
import InternalEvent from '../event/InternalEvent';
import mxGraphSelectionModel from '../view/selection/mxGraphSelectionModel';
import Cell from '../cell/datatypes/Cell';
import CellArray from "../cell/datatypes/CellArray";

import type { UndoableChange } from '../../types';

/**
 * @class SelectionChange
 * Action to change the current root in a view.
 */
class SelectionChange implements UndoableChange {
  constructor(
    selectionModel: mxGraphSelectionModel,
    added: CellArray = new CellArray(),
    removed: CellArray = new CellArray()
  ) {
    this.selectionModel = selectionModel;
    this.added = added.slice();
    this.removed = removed.slice();
  }

  selectionModel: mxGraphSelectionModel;

  added: CellArray;

  removed: CellArray;

  /**
   * Changes the current root of the view.
   */
  execute() {
    const t0: any = mxLog.enter('mxSelectionChange.execute');

    window.status =
      Resources.get(this.selectionModel.updatingSelectionResource) ||
      this.selectionModel.updatingSelectionResource;

    for (const removed of this.removed) {
      this.selectionModel.cellRemoved(removed);
    }

    for (const added of this.added) {
      this.selectionModel.cellAdded(added);
    }

    [this.added, this.removed] = [this.removed, this.added];

    window.status =
      Resources.get(this.selectionModel.doneResource) ||
      this.selectionModel.doneResource;
    mxLog.leave('mxSelectionChange.execute', t0);

    this.selectionModel.fireEvent(
      new EventObject(
        InternalEvent.CHANGE,
        'added',
        this.added,
        'removed',
        this.removed
      )
    );
  }
}

export default SelectionChange;
