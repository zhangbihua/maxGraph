import Cell from "../cell/datatypes/Cell";
import CellArray from "../cell/datatypes/CellArray";
import InternalMouseEvent from "../event/InternalMouseEvent";

class GraphSplit {
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

export default GraphSplit;
