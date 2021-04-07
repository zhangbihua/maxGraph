import mxGraphView from './mxGraphView';
import mxEventObject from '../../util/event/mxEventObject';
import mxPoint from '../../util/datatypes/mxPoint';
import mxCell from '../cell/mxCell';
import mxEvent from '../../util/event/mxEvent';
import mxGraphModel from './mxGraphModel';
import mxGraph from "./mxGraph";

class mxCurrentRootChange {
  view: mxGraphView;

  root: mxCell;

  previous: mxCell;

  isUp: boolean;

  /**
   * Class: mxCurrentRootChange
   *
   * Action to change the current root in a view.
   *
   * Constructor: mxCurrentRootChange
   *
   * Constructs a change of the current root in the given view.
   */
  constructor(view: mxGraphView, root: mxCell) {
    this.view = view;
    this.root = root;
    this.previous = root;
    this.isUp = root == null;

    if (!this.isUp) {
      let tmp: mxCell | null = this.view.currentRoot;
      const model: mxGraphModel = (<mxGraph>this.view.graph).getModel();

      while (tmp != null) {
        if (tmp === root) {
          this.isUp = true;
          break;
        }
        tmp = model.getParent(tmp);
      }
    }
  }

  /**
   * Function: execute
   *
   * Changes the current root of the view.
   */
  execute(): void {
    const tmp = this.view.currentRoot;
    this.view.currentRoot = this.previous;
    this.previous = <mxCell>tmp;

    const translate = (<mxGraph>this.view.graph).getTranslateForRoot(
      this.view.currentRoot
    );

    if (translate != null) {
      this.view.translate = new mxPoint(-translate.x, -translate.y);
    }

    if (this.isUp) {
      this.view.clear(this.view.currentRoot, true, true);
      this.view.validate(null);
    } else {
      this.view.refresh();
    }

    const name: string = this.isUp ? mxEvent.UP : mxEvent.DOWN;

    this.view.fireEvent(
      new mxEventObject(
        name,
        'root',
        this.view.currentRoot,
        'previous',
        this.previous
      )
    );
    this.isUp = !this.isUp;
  }
}

export default mxCurrentRootChange;
