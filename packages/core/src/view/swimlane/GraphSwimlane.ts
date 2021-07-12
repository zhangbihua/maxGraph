import Cell from '../cell/datatypes/Cell';
import Rectangle from '../geometry/Rectangle';
import utils, { convertPoint, getValue, mod } from '../../util/Utils';
import {
  DEFAULT_STARTSIZE,
  DIRECTION_EAST,
  DIRECTION_NORTH,
  DIRECTION_SOUTH,
  DIRECTION_WEST,
  SHAPE_SWIMLANE,
} from '../../util/Constants';
import CellArray from '../cell/datatypes/CellArray';
import InternalMouseEvent from '../event/InternalMouseEvent';
import { getClientX, getClientY } from '../../util/EventUtils';
import Graph from '../Graph';

class GraphSwimlane {
  constructor(graph: Graph) {
    this.graph = graph;
  }

  graph: Graph;

  /**
   * Specifies if swimlanes should be selectable via the content if the
   * mouse is released.
   * @default true
   */
  swimlaneSelectionEnabled: boolean = true;

  /**
   * Specifies if nesting of swimlanes is allowed.
   * @default true
   */
  swimlaneNesting: boolean = true;

  /**
   * The attribute used to find the color for the indicator if the indicator
   * color is set to 'swimlane'.
   * @default {@link 'fillColor'}
   */
  swimlaneIndicatorColorAttribute: string = 'fillColor';

  /**
   * Returns the nearest ancestor of the given cell which is a swimlane, or
   * the given cell, if it is itself a swimlane.
   *
   * @param cell {@link mxCell} for which the ancestor swimlane should be returned.
   */
  // getSwimlane(cell: mxCell): mxCell;
  getSwimlane(cell: Cell | null = null): Cell | null {
    while (cell != null && !this.isSwimlane(cell)) {
      cell = <Cell>cell.getParent();
    }
    return cell;
  }

  /**
   * Returns the bottom-most swimlane that intersects the given point (x, y)
   * in the cell hierarchy that starts at the given parent.
   *
   * @param x X-coordinate of the location to be checked.
   * @param y Y-coordinate of the location to be checked.
   * @param parent {@link mxCell} that should be used as the root of the recursion.
   * Default is {@link defaultParent}.
   */
  getSwimlaneAt(
    x: number,
    y: number,
    parent: Cell = this.getDefaultParent()
  ): Cell | null {
    if (parent == null) {
      parent = <Cell>this.getCurrentRoot();

      if (parent == null) {
        parent = <Cell>this.getModel().getRoot();
      }
    }

    if (parent != null) {
      const childCount = parent.getChildCount();

      for (let i = 0; i < childCount; i += 1) {
        const child = parent.getChildAt(i);

        if (child != null) {
          const result = this.getSwimlaneAt(x, y, child);

          if (result != null) {
            return result;
          }
          if (child.isVisible() && this.isSwimlane(child)) {
            const state = this.getView().getState(child);

            if (this.intersects(state, x, y)) {
              return child;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Returns true if the given coordinate pair is inside the content
   * are of the given swimlane.
   *
   * @param swimlane {@link mxCell} that specifies the swimlane.
   * @param x X-coordinate of the mouse event.
   * @param y Y-coordinate of the mouse event.
   */
  hitsSwimlaneContent(swimlane: Cell, x: number, y: number): boolean {
    const state = this.graph.view.getState(swimlane);
    const size = this.getStartSize(swimlane);

    if (state != null) {
      const scale = this.graph.view.getScale();
      x -= state.x;
      y -= state.y;

      if (size.width > 0 && x > 0 && x > size.width * scale) {
        return true;
      }
      if (size.height > 0 && y > 0 && y > size.height * scale) {
        return true;
      }
    }
    return false;
  }

  /*****************************************************************************
   * Group: Graph appearance
   *****************************************************************************/

  /**
   * Returns the start size of the given swimlane, that is, the width or
   * height of the part that contains the title, depending on the
   * horizontal style. The return value is an {@link Rectangle} with either
   * width or height set as appropriate.
   *
   * @param swimlane {@link mxCell} whose start size should be returned.
   * @param ignoreState Optional boolean that specifies if cell state should be ignored.
   */
  getStartSize(swimlane: Cell, ignoreState: boolean = false): Rectangle {
    const result = new Rectangle();
    const style = this.graph.cell.getCurrentCellStyle(swimlane, ignoreState);
    const size = parseInt(getValue(style, 'startSize', DEFAULT_STARTSIZE));

    if (getValue(style, 'horizontal', true)) {
      result.height = size;
    } else {
      result.width = size;
    }
    return result;
  }

  /**
   * Returns the direction for the given swimlane style.
   */
  getSwimlaneDirection(style: any): string {
    const dir = getValue(style, 'direction', DIRECTION_EAST);
    const flipH = getValue(style, 'flipH', 0) == 1;
    const flipV = getValue(style, 'flipV', 0) == 1;
    const h = getValue(style, 'horizontal', true);
    let n = h ? 0 : 3;

    if (dir === DIRECTION_NORTH) {
      n--;
    } else if (dir === DIRECTION_WEST) {
      n += 2;
    } else if (dir === DIRECTION_SOUTH) {
      n += 1;
    }

    const _mod = mod(n, 2);

    if (flipH && _mod === 1) {
      n += 2;
    }

    if (flipV && _mod === 0) {
      n += 2;
    }

    return [DIRECTION_NORTH, DIRECTION_EAST, DIRECTION_SOUTH, DIRECTION_WEST][mod(n, 4)];
  }

  /**
   * Returns the actual start size of the given swimlane taking into account
   * direction and horizontal and vertial flip styles. The start size is
   * returned as an {@link Rectangle} where top, left, bottom, right start sizes
   * are returned as x, y, height and width, respectively.
   *
   * @param swimlane {@link mxCell} whose start size should be returned.
   * @param ignoreState Optional boolean that specifies if cell state should be ignored.
   */
  getActualStartSize(swimlane: Cell, ignoreState: boolean = false): Rectangle {
    const result = new Rectangle();

    if (this.isSwimlane(swimlane, ignoreState)) {
      const style = this.graph.cell.getCurrentCellStyle(swimlane, ignoreState);
      const size = parseInt(getValue(style, 'startSize', DEFAULT_STARTSIZE));
      const dir = this.getSwimlaneDirection(style);

      if (dir === DIRECTION_NORTH) {
        result.y = size;
      } else if (dir === DIRECTION_WEST) {
        result.x = size;
      } else if (dir === DIRECTION_SOUTH) {
        result.height = size;
      } else {
        result.width = size;
      }
    }
    return result;
  }

  /**
   * Returns true if the given cell is a swimlane in the graph. A swimlane is
   * a container cell with some specific behaviour. This implementation
   * checks if the shape associated with the given cell is a {@link mxSwimlane}.
   *
   * @param cell {@link mxCell} to be checked.
   * @param ignoreState Optional boolean that specifies if the cell state should be ignored.
   */
  isSwimlane(cell: Cell, ignoreState: boolean = false): boolean {
    if (
      cell != null &&
      cell.getParent() !== this.graph.model.getRoot() &&
      !cell.isEdge()
    ) {
      return this.graph.cell.getCurrentCellStyle(cell, ignoreState).shape === SHAPE_SWIMLANE;
    }
    return false;
  }

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Returns true if the given cell is a valid drop target for the specified
   * cells. If {@link splitEnabled} is true then this returns {@link isSplitTarget} for
   * the given arguments else it returns true if the cell is not collapsed
   * and its child count is greater than 0.
   *
   * @param cell {@link mxCell} that represents the possible drop target.
   * @param cells {@link mxCell} that should be dropped into the target.
   * @param evt Mouseevent that triggered the invocation.
   */
  isValidDropTarget(cell: Cell, cells: CellArray, evt: InternalMouseEvent): boolean {
    return (
      cell != null &&
      ((this.graph.isSplitEnabled() && this.graph.isSplitTarget(cell, cells, evt)) ||
        (!cell.isEdge() &&
          (this.isSwimlane(cell) || (cell.getChildCount() > 0 && !cell.isCollapsed()))))
    );
  }

  /**
   * Returns the given cell if it is a drop target for the given cells or the
   * nearest ancestor that may be used as a drop target for the given cells.
   * If the given array contains a swimlane and {@link swimlaneNesting} is false
   * then this always returns null. If no cell is given, then the bottommost
   * swimlane at the location of the given event is returned.
   *
   * This function should only be used if {@link isDropEnabled} returns true.
   *
   * @param cells Array of {@link Cell} which are to be dropped onto the target.
   * @param evt Mouseevent for the drag and drop.
   * @param cell {@link mxCell} that is under the mousepointer.
   * @param clone Optional boolean to indicate of cells will be cloned.
   */
  getDropTarget(
    cells: CellArray,
    evt: InternalMouseEvent,
    cell: Cell | null = null,
    clone: boolean = false
  ): Cell | null {
    if (!this.isSwimlaneNesting()) {
      for (let i = 0; i < cells.length; i += 1) {
        if (this.isSwimlane(cells[i])) {
          return null;
        }
      }
    }

    const pt = convertPoint(this.graph.container, getClientX(evt), getClientY(evt));
    pt.x -= this.graph.panning.panDx;
    pt.y -= this.graph.panning.panDy;
    const swimlane = this.getSwimlaneAt(pt.x, pt.y);

    if (cell == null) {
      cell = swimlane;
    } else if (swimlane != null) {
      // Checks if the cell is an ancestor of the swimlane
      // under the mouse and uses the swimlane in that case
      let tmp = swimlane.getParent();

      while (tmp != null && this.isSwimlane(tmp) && tmp != cell) {
        tmp = tmp.getParent();
      }

      if (tmp == cell) {
        cell = swimlane;
      }
    }

    while (
      cell != null &&
      !this.isValidDropTarget(cell, cells, evt) &&
      !this.graph.model.isLayer(cell)
    ) {
      cell = cell.getParent();
    }

    // Checks if parent is dropped into child if not cloning
    if (!clone) {
      let parent = cell;
      while (parent != null && cells.indexOf(parent) < 0) {
        parent = parent.getParent();
      }
    }

    return !this.graph.model.isLayer(<Cell>cell) && parent == null ? cell : null;
  }

  /**
   * Returns {@link swimlaneNesting} as a boolean.
   */
  isSwimlaneNesting(): boolean {
    return this.swimlaneNesting;
  }

  /**
   * Specifies if swimlanes can be nested by drag and drop. This is only
   * taken into account if dropEnabled is true.
   *
   * @param value Boolean indicating if swimlanes can be nested.
   */
  setSwimlaneNesting(value: boolean): void {
    this.swimlaneNesting = value;
  }

  /**
   * Returns {@link swimlaneSelectionEnabled} as a boolean.
   */
  isSwimlaneSelectionEnabled(): boolean {
    return this.swimlaneSelectionEnabled;
  }

  /**
   * Specifies if swimlanes should be selected if the mouse is released
   * over their content area.
   *
   * @param value Boolean indicating if swimlanes content areas
   * should be selected when the mouse is released over them.
   */
  setSwimlaneSelectionEnabled(value: boolean): void {
    this.swimlaneSelectionEnabled = value;
  }
}

export default GraphSwimlane;
