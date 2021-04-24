import mxGraphView from '../view/graph/mxGraphView';
import mxEventObject from '../util/event/mxEventObject';
import mxPoint from '../util/datatypes/mxPoint';
import mxCell from '../view/cell/mxCell';
import mxEvent from '../util/event/mxEvent';
import mxGraphModel from '../view/graph/mxGraphModel';
import mxGraph from "../view/graph/mxGraph";

/**
 * Class: mxCurrentRootChange
 *
 * Action to change the current root in a view.
 */
class mxCurrentRootChange {
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
        tmp = tmp.getParent();
      }
    }
  }

  view: mxGraphView;

  root: mxCell;

  previous: mxCell;

  isUp: boolean;

  /**
   * Changes the current root of the view.
   */
  // execute(): void;
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
