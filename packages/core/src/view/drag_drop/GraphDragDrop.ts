import Cell from '../cell/datatypes/Cell';
import CellArray from '../cell/datatypes/CellArray';
import InternalMouseEvent from '../event/InternalMouseEvent';

class GraphDragDrop {
  /**
   * Specifies the return value for {@link isDropEnabled}.
   * @default false
   */
  dropEnabled: boolean = false;

  /**
   * Specifies if dropping onto edges should be enabled. This is ignored if
   * {@link dropEnabled} is `false`. If enabled, it will call {@link splitEdge} to carry
   * out the drop operation.
   * @default true
   */
  splitEnabled: boolean = true;

  /**
   * Specifies if the graph should automatically scroll if the mouse goes near
   * the container edge while dragging. This is only taken into account if the
   * container has scrollbars.
   *
   * If you need this to work without scrollbars then set {@link ignoreScrollbars} to
   * true. Please consult the {@link ignoreScrollbars} for details. In general, with
   * no scrollbars, the use of {@link allowAutoPanning} is recommended.
   * @default true
   */
  autoScroll: boolean = true;

  /**
   * Specifies if the size of the graph should be automatically extended if the
   * mouse goes near the container edge while dragging. This is only taken into
   * account if the container has scrollbars. See {@link autoScroll}.
   * @default true
   */
  autoExtend: boolean = true;


  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Returns {@link dropEnabled} as a boolean.
   */
  isDropEnabled(): boolean {
    return this.dropEnabled;
  }

  /**
   * Specifies if the graph should allow dropping of cells onto or into other
   * cells.
   *
   * @param dropEnabled Boolean indicating if the graph should allow dropping
   * of cells into other cells.
   */
  setDropEnabled(value: boolean): void {
    this.dropEnabled = value;
  }

  /*****************************************************************************
   * Group: Split behaviour
   *****************************************************************************/

  /**
   * Returns {@link splitEnabled} as a boolean.
   */
  isSplitEnabled(): boolean {
    return this.splitEnabled;
  }

  /**
   * Specifies if the graph should allow dropping of cells onto or into other
   * cells.
   *
   * @param dropEnabled Boolean indicating if the graph should allow dropping
   * of cells into other cells.
   */
  setSplitEnabled(value: boolean): void {
    this.splitEnabled = value;
  }

  /**
   * Returns true if the given edge may be splitted into two edges with the
   * given cell as a new terminal between the two.
   *
   * @param target {@link mxCell} that represents the edge to be splitted.
   * @param cells {@link mxCell} that should split the edge.
   * @param evt Mouseevent that triggered the invocation.
   */
  // isSplitTarget(target: mxCell, cells: mxCellArray, evt: Event): boolean;
  isSplitTarget(target: Cell, cells: CellArray, evt: InternalMouseEvent): boolean {
    if (
      target.isEdge() &&
      cells != null &&
      cells.length == 1 &&
      cells[0].isConnectable() &&
      this.getEdgeValidationError(target, target.getTerminal(true), cells[0]) ==
      null
    ) {
      const src = <Cell>target.getTerminal(true);
      const trg = <Cell>target.getTerminal(false);

      return (
        !cells[0].isAncestor(src) &&
        !cells[0].isAncestor(trg)
      );
    }
    return false;
  }
}

export default GraphDragDrop;
