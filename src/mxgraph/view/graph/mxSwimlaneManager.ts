/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxEventSource from '../../util/event/mxEventSource';
import mxUtils from '../../util/mxUtils';
import mxEvent from '../../util/event/mxEvent';
import mxConstants from '../../util/mxConstants';
import mxRectangle from '../../util/datatypes/mxRectangle';
import mxGraph from './mxGraph';
import mxEventObject from "../../util/event/mxEventObject";
import mxCell from "../cell/mxCell";
import mxGeometry from "../../util/datatypes/mxGeometry";

/**
 * Class: mxSwimlaneManager
 *
 * Manager for swimlanes and nested swimlanes that sets the size of newly added
 * swimlanes to that of their siblings, and propagates changes to the size of a
 * swimlane to its siblings, if <siblings> is true, and its ancestors, if
 * <bubbling> is true.
 *
 * Constructor: mxSwimlaneManager
 *
 * Constructs a new swimlane manager for the given graph.
 *
 * Arguments:
 *
 * graph - Reference to the enclosing graph.
 */
class mxSwimlaneManager extends mxEventSource {
  constructor(
      graph: mxGraph,
      horizontal: boolean = true,
      addEnabled: boolean = true,
      resizeEnabled: boolean = true
  ) {
    super();

    this.horizontal = horizontal;
    this.addEnabled = addEnabled;
    this.resizeEnabled = resizeEnabled;

    this.addHandler = mxUtils.bind(this, (sender: any, evt: mxEventObject) => {
      if (this.isEnabled() && this.isAddEnabled()) {
        this.cellsAdded(evt.getProperty('cells'));
      }
    });

    this.resizeHandler = mxUtils.bind(this, (sender: any, evt: mxEventObject) => {
      if (this.isEnabled() && this.isResizeEnabled()) {
        this.cellsResized(evt.getProperty('cells'));
      }
    });

    this.setGraph(graph);
  }

  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: mxGraph | null = null;

  /**
   * Variable: enabled
   *
   * Specifies if event handling is enabled. Default is true.
   */
  enabled: boolean = true;

  /**
   * Variable: horizontal
   *
   * Specifies the orientation of the swimlanes. Default is true.
   */
  horizontal: boolean = true;

  /**
   * Variable: addEnabled
   *
   * Specifies if newly added cells should be resized to match the size of their
   * existing siblings. Default is true.
   */
  addEnabled: boolean = true;

  /**
   * Variable: resizeEnabled
   *
   * Specifies if resizing of swimlanes should be handled. Default is true.
   */
  resizeEnabled: boolean = true;

  /**
   * Variable: moveHandler
   *
   * Holds the function that handles the move event.
   */
  addHandler: Function | null = null;

  /**
   * Variable: moveHandler
   *
   * Holds the function that handles the move event.
   */
  resizeHandler: Function | null = null;

  /**
   * Function: isEnabled
   *
   * Returns true if events are handled. This implementation
   * returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation
   * updates <enabled>.
   *
   * Parameters:
   *
   * enabled - Boolean that specifies the new enabled state.
   */
  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  /**
   * Function: isHorizontal
   *
   * Returns <horizontal>.
   */
  isHorizontal(): boolean {
    return this.horizontal;
  }

  /**
   * Function: setHorizontal
   *
   * Sets <horizontal>.
   */
  setHorizontal(value: boolean): void {
    this.horizontal = value;
  }

  /**
   * Function: isAddEnabled
   *
   * Returns <addEnabled>.
   */
  isAddEnabled(): boolean {
    return this.addEnabled;
  }

  /**
   * Function: setAddEnabled
   *
   * Sets <addEnabled>.
   */
  setAddEnabled(value: boolean): void {
    this.addEnabled = value;
  }

  /**
   * Function: isResizeEnabled
   *
   * Returns <resizeEnabled>.
   */
  isResizeEnabled(): boolean {
    return this.resizeEnabled;
  }

  /**
   * Function: setResizeEnabled
   *
   * Sets <resizeEnabled>.
   */
  setResizeEnabled(value: boolean): void {
    this.resizeEnabled = value;
  }

  /**
   * Function: getGraph
   *
   * Returns the graph that this manager operates on.
   */
  getGraph(): mxGraph | null {
    return this.graph;
  }

  /**
   * Function: setGraph
   *
   * Sets the graph that the manager operates on.
   */
  setGraph(graph: mxGraph | null): void {
    if (this.graph != null) {
      this.graph.removeListener(this.addHandler);
      this.graph.removeListener(this.resizeHandler);
    }

    this.graph = graph;

    if (this.graph != null) {
      this.graph.addListener(mxEvent.ADD_CELLS, this.addHandler);
      this.graph.addListener(mxEvent.CELLS_RESIZED, this.resizeHandler);
    }
  }

  /**
   * Function: isSwimlaneIgnored
   *
   * Returns true if the given swimlane should be ignored.
   */
  isSwimlaneIgnored(swimlane: mxCell): boolean {
    return !((<mxGraph>this.getGraph()).isSwimlane(swimlane));
  }

  /**
   * Function: isCellHorizontal
   *
   * Returns true if the given cell is horizontal. If the given cell is not a
   * swimlane, then the global orientation is returned.
   */
  isCellHorizontal(cell: mxCell): boolean {
    if ((<mxGraph>this.graph).isSwimlane(cell)) {
      const style = (<mxGraph>this.graph).getCellStyle(cell);
      return mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, 1) == 1;
    }
    return !this.isHorizontal();
  }

  /**
   * Function: cellsAdded
   *
   * Called if any cells have been added.
   *
   * Parameters:
   *
   * cell - Array of <mxCells> that have been added.
   */
  cellsAdded(cells: mxCell[]): void {
    if (cells != null) {
      const model = (<mxGraph>this.graph).getModel();

      model.beginUpdate();
      try {
        for (const cell of cells) {
          if (!this.isSwimlaneIgnored(cell)) {
            this.swimlaneAdded(cell);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   * Function: swimlaneAdded
   *
   * Updates the size of the given swimlane to match that of any existing
   * siblings swimlanes.
   *
   * Parameters:
   *
   * swimlane - <mxCell> that represents the new swimlane.
   */
  swimlaneAdded(swimlane: mxCell): void {
    const model = (<mxGraph>this.getGraph()).getModel();
    const parent = model.getParent(swimlane);
    const childCount = model.getChildCount(parent);
    let geo = null;

    // Finds the first valid sibling swimlane as reference
    for (let i = 0; i < childCount; i += 1) {
      const child = <mxCell>model.getChildAt(parent, i);

      if (child !== swimlane && !this.isSwimlaneIgnored(child)) {
        geo = model.getGeometry(child);
        if (geo != null) {
          break;
        }
      }
    }

    // Applies the size of the refernece to the newly added swimlane
    if (geo != null) {
      const parentHorizontal =
        parent != null ? this.isCellHorizontal(parent) : this.horizontal;
      this.resizeSwimlane(swimlane, geo.width, geo.height, parentHorizontal);
    }
  }

  /**
   * Function: cellsResized
   *
   * Called if any cells have been resizes. Calls <swimlaneResized> for all
   * swimlanes where <isSwimlaneIgnored> returns false.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose size was changed.
   */
  cellsResized(cells: mxCell[] | null): void {
    if (cells != null) {
      const model = (<mxGraph>this.getGraph()).getModel();

      model.beginUpdate();
      try {
        // Finds the top-level swimlanes and adds offsets
        for (const cell of cells) {
          if (!this.isSwimlaneIgnored(cell)) {
            const geo = model.getGeometry(cell);

            if (geo != null) {
              const size = new mxRectangle(0, 0, geo.width, geo.height);
              let top = cell;
              let current = top;

              while (current != null) {
                top = current;
                current = <mxCell>model.getParent(current);
                const tmp = (<mxGraph>this.graph).isSwimlane(current)
                  ? (<mxGraph>this.graph).getStartSize(current)
                  : new mxRectangle();
                size.width += tmp.width;
                size.height += tmp.height;
              }

              const parentHorizontal =
                current != null
                  ? this.isCellHorizontal(current)
                  : this.horizontal;
              this.resizeSwimlane(
                top,
                size.width,
                size.height,
                parentHorizontal
              );
            }
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  /**
   * Function: resizeSwimlane
   *
   * Called from <cellsResized> for all swimlanes that are not ignored to update
   * the size of the siblings and the size of the parent swimlanes, recursively,
   * if <bubbling> is true.
   *
   * Parameters:
   *
   * swimlane - <mxCell> whose size has changed.
   */
  resizeSwimlane(swimlane: mxCell,
                 w: number,
                 h: number,
                 parentHorizontal: boolean): void {

    const model = (<mxGraph>this.graph).getModel();

    model.beginUpdate();
    try {
      const horizontal = this.isCellHorizontal(swimlane);

      if (!this.isSwimlaneIgnored(swimlane)) {
        let geo = <mxGeometry>model.getGeometry(swimlane);

        if (geo != null) {
          if (
            (parentHorizontal && geo.height !== h) ||
            (!parentHorizontal && geo.width !== w)
          ) {
            geo = geo.clone();

            if (parentHorizontal) {
              geo.height = h;
            } else {
              geo.width = w;
            }

            model.setGeometry(swimlane, geo);
          }
        }
      }

      const tmp = (<mxGraph>this.graph).isSwimlane(swimlane)
        ? (<mxGraph>this.graph).getStartSize(swimlane)
        : new mxRectangle();
      w -= tmp.width;
      h -= tmp.height;

      const childCount = model.getChildCount(swimlane);

      for (let i = 0; i < childCount; i += 1) {
        const child = <mxCell>model.getChildAt(swimlane, i);
        this.resizeSwimlane(child, w, h, horizontal);
      }
    } finally {
      model.endUpdate();
    }
  }

  /**
   * Function: destroy
   *
   * Removes all handlers from the <graph> and deletes the reference to it.
   */
  destroy(): void {
    this.setGraph(null);
  }
}

export default mxSwimlaneManager;
