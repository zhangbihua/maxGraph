import Cell from "../cell/datatypes/Cell";
import CellArray from "../cell/datatypes/CellArray";
import {sortCells} from "../../util/Utils";
import Geometry from "../geometry/Geometry";
import EventObject from "../event/EventObject";
import InternalEvent from "../event/InternalEvent";
import Rectangle from "../geometry/Rectangle";
import Point from "../geometry/Point";
import Graph from "../Graph";

class GraphGrouping {
  constructor(graph: Graph) {
    this.graph = graph;
  }

  graph: Graph;

  /*****************************************************************************
   * Group: Grouping
   *****************************************************************************/

  /**
   * Adds the cells into the given group. The change is carried out using
   * {@link cellsAdded}, {@link cellsMoved} and {@link cellsResized}. This method fires
   * {@link InternalEvent.GROUP_CELLS} while the transaction is in progress. Returns the
   * new group. A group is only created if there is at least one entry in the
   * given array of cells.
   *
   * @param group {@link mxCell} that represents the target group. If `null` is specified
   * then a new group is created using {@link createGroupCell}.
   * @param border Optional integer that specifies the border between the child
   * area and the group bounds. Default is `0`.
   * @param cells Optional array of {@link Cell} to be grouped. If `null` is specified
   * then the selection cells are used.
   */
  // groupCells(group: mxCell | null, border?: number, cells?: mxCellArray): mxCell;
  groupCells(
    group: Cell,
    border: number = 0,
    cells: CellArray = sortCells(this.getSelectionCells(), true)
  ) {
    cells = this.getCellsForGroup(cells);

    if (group == null) {
      group = this.createGroupCell(cells);
    }

    const bounds = this.getBoundsForGroup(group, cells, border);

    if (cells.length > 1 && bounds != null) {
      // Uses parent of group or previous parent of first child
      let parent = group.getParent();

      if (parent == null) {
        parent = <Cell>cells[0].getParent();
      }

      this.graph.model.beginUpdate();
      try {
        // Checks if the group has a geometry and
        // creates one if one does not exist
        if (group.getGeometry() == null) {
          this.graph.model.setGeometry(group, new Geometry());
        }

        // Adds the group into the parent
        let index = parent.getChildCount();
        this.cellsAdded(
          new CellArray(group),
          parent,
          index,
          null,
          null,
          false,
          false,
          false
        );

        // Adds the children into the group and moves
        index = group.getChildCount();
        this.cellsAdded(cells, group, index, null, null, false, false, false);
        this.cellsMoved(cells, -bounds.x, -bounds.y, false, false, false);

        // Resizes the group
        this.cellsResized(new CellArray(group), [bounds], false);

        this.graph.fireEvent(
          new EventObject(
            InternalEvent.GROUP_CELLS,
            'group',
            group,
            'border',
            border,
            'cells',
            cells
          )
        );
      } finally {
        this.graph.model.endUpdate();
      }
    }
    return group;
  }

  /**
   * Returns the cells with the same parent as the first cell
   * in the given array.
   */
  getCellsForGroup(cells: CellArray): CellArray {
    const result = new CellArray();
    if (cells != null && cells.length > 0) {
      const parent = cells[0].getParent();
      result.push(cells[0]);

      // Filters selection cells with the same parent
      for (let i = 1; i < cells.length; i += 1) {
        if (cells[i].getParent() === parent) {
          result.push(cells[i]);
        }
      }
    }
    return result;
  }

  /**
   * Returns the bounds to be used for the given group and children.
   */
  getBoundsForGroup(group: Cell,
                    children: CellArray,
                    border: number | null): Rectangle | null {

    const result = this.getBoundingBoxFromGeometry(children, true);
    if (result != null) {
      if (this.isSwimlane(group)) {
        const size = this.getStartSize(group);

        result.x -= size.width;
        result.y -= size.height;
        result.width += size.width;
        result.height += size.height;
      }

      // Adds the border
      if (border != null) {
        result.x -= border;
        result.y -= border;
        result.width += 2 * border;
        result.height += 2 * border;
      }
    }
    return result;
  }

  /**
   * Hook for creating the group cell to hold the given array of {@link Cell} if
   * no group cell was given to the {@link group} function.
   *
   * The following code can be used to set the style of new group cells.
   *
   * ```javascript
   * var graphCreateGroupCell = graph.createGroupCell;
   * graph.createGroupCell = function(cells)
   * {
   *   var group = graphCreateGroupCell.apply(this, arguments);
   *   group.setStyle('group');
   *
   *   return group;
   * };
   */
  // createGroupCell(cells: mxCellArray): mxCell;
  createGroupCell(cells: CellArray) {
    const group = new Cell('');
    group.setVertex(true);
    group.setConnectable(false);

    return group;
  }

  /**
   * Ungroups the given cells by moving the children the children to their
   * parents parent and removing the empty groups. Returns the children that
   * have been removed from the groups.
   *
   * @param cells Array of cells to be ungrouped. If null is specified then the
   * selection cells are used.
   */
  // ungroupCells(cells: mxCellArray): mxCellArray;
  ungroupCells(cells: CellArray) {
    let result: CellArray = new CellArray();

    if (cells == null) {
      cells = this.getCellsForUngroup();
    }

    if (cells != null && cells.length > 0) {
      this.graph.model.beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          let children = cells[i].getChildren();

          if (children != null && children.length > 0) {
            children = children.slice();
            const parent = <Cell>cells[i].getParent();
            const index = parent.getChildCount();

            this.cellsAdded(children, parent, index, null, null, true);
            result = result.concat(children);

            // Fix relative child cells
            for (const child of children) {
              const state = this.graph.view.getState(child);
              let geo = child.getGeometry();

              if (state != null && geo != null && geo.relative) {
                geo = <Geometry>geo.clone();
                geo.x = (<Point>state.origin).x;
                geo.y = (<Point>state.origin).y;
                geo.relative = false;

                this.graph.model.setGeometry(child, geo);
              }
            }
          }
        }

        this.removeCellsAfterUngroup(cells);
        this.graph.fireEvent(
          new EventObject(InternalEvent.UNGROUP_CELLS, 'cells', cells)
        );
      } finally {
        this.graph.model.endUpdate();
      }
    }
    return result;
  }

  /**
   * Function: getCellsForUngroup
   *
   * Returns the selection cells that can be ungrouped.
   */
  getCellsForUngroup(): CellArray {
    const cells = this.getSelectionCells();

    // Finds the cells with children
    const tmp = new CellArray();

    for (let i = 0; i < cells.length; i += 1) {
      if (cells[i].isVertex() && cells[i].getChildCount() > 0) {
        tmp.push(cells[i]);
      }
    }
    return tmp;
  }

  /**
   * Hook to remove the groups after {@link ungroupCells}.
   *
   * @param cells Array of {@link Cell} that were ungrouped.
   */
  removeCellsAfterUngroup(cells: CellArray): void {
    this.cellsRemoved(this.addAllEdges(cells));
  }

  /**
   * Removes the specified cells from their parents and adds them to the
   * default parent. Returns the cells that were removed from their parents.
   *
   * @param cells Array of {@link Cell} to be removed from their parents.
   */
  removeCellsFromParent(cells: CellArray): CellArray {
    if (cells == null) {
      cells = this.getSelectionCells();
    }
    this.graph.model.beginUpdate();
    try {
      const parent = this.getDefaultParent();
      const index = parent.getChildCount();

      this.cellsAdded(cells, parent, index, null, null, true);
      this.fireEvent(
        new EventObject(InternalEvent.REMOVE_CELLS_FROM_PARENT, 'cells', cells)
      );
    } finally {
      this.graph.model.endUpdate();
    }
    return cells;
  }

  /**
   * Function: updateGroupBounds
   *
   * Updates the bounds of the given groups to include all children and returns
   * the passed-in cells. Call this with the groups in parent to child order,
   * top-most group first, the cells are processed in reverse order and cells
   * with no children are ignored.
   *
   * Parameters:
   *
   * cells - The groups whose bounds should be updated. If this is null, then
   * the selection cells are used.
   * border - Optional border to be added in the group. Default is 0.
   * moveGroup - Optional boolean that allows the group to be moved. Default
   * is false.
   * topBorder - Optional top border to be added in the group. Default is 0.
   * rightBorder - Optional top border to be added in the group. Default is 0.
   * bottomBorder - Optional top border to be added in the group. Default is 0.
   * leftBorder - Optional top border to be added in the group. Default is 0.
   */
  updateGroupBounds(
    cells: CellArray,
    border: number = 0,
    moveGroup: boolean = false,
    topBorder: number = 0,
    rightBorder: number = 0,
    bottomBorder: number = 0,
    leftBorder: number = 0
  ): CellArray {
    if (cells == null) {
      cells = this.graph.selection.getSelectionCells();
    }

    border = border != null ? border : 0;
    moveGroup = moveGroup != null ? moveGroup : false;
    topBorder = topBorder != null ? topBorder : 0;
    rightBorder = rightBorder != null ? rightBorder : 0;
    bottomBorder = bottomBorder != null ? bottomBorder : 0;
    leftBorder = leftBorder != null ? leftBorder : 0;

    this.graph.batchUpdate(() => {
      for (let i = cells.length - 1; i >= 0; i--) {
        let geo = cells[i].getGeometry();
        if (geo == null) {
          continue;
        }

        const children = <CellArray>this.getChildCells(cells[i]);
        if (children != null && children.length > 0) {
          const bounds = this.getBoundingBoxFromGeometry(children, true);

          if (bounds != null && bounds.width > 0 && bounds.height > 0) {
            // Adds the size of the title area for swimlanes
            const size = <Rectangle>(
              (this.isSwimlane(cells[i])
                ? this.getActualStartSize(cells[i], true)
                : new Rectangle())
            );
            geo = <Geometry>geo.clone();

            if (moveGroup) {
              geo.x = Math.round(
                geo.x + bounds.x - border - size.x - leftBorder
              );
              geo.y = Math.round(
                geo.y + bounds.y - border - size.y - topBorder
              );
            }

            geo.width = Math.round(
              bounds.width +
              2 * border +
              size.x +
              leftBorder +
              rightBorder +
              size.width
            );
            geo.height = Math.round(
              bounds.height +
              2 * border +
              size.y +
              topBorder +
              bottomBorder +
              size.height
            );

            this.graph.model.setGeometry(cells[i], geo);
            this.moveCells(
              children,
              border + size.x - bounds.x + leftBorder,
              border + size.y - bounds.y + topBorder
            );
          }
        }
      }
    });
    return cells;
  }
}

export default GraphGrouping;
