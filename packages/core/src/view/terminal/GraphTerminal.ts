import CellArray from "../cell/datatypes/CellArray";
import Cell from "../cell/datatypes/Cell";
import Dictionary from "../../util/Dictionary";
import Graph from '../Graph';

class GraphTerminal {
  constructor(graph: Graph) {
    this.graph = graph;
  }

  graph: Graph;

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Returns true if the given terminal point is movable. This is independent
   * from {@link isCellConnectable} and {@link isCellDisconnectable} and controls if terminal
   * points can be moved in the graph if the edge is not connected. Note that it
   * is required for this to return true to connect unconnected edges. This
   * implementation returns true.
   *
   * @param cell {@link mxCell} whose terminal point should be moved.
   * @param source Boolean indicating if the source or target terminal should be moved.
   */
  isTerminalPointMovable(cell: Cell, source: boolean): boolean {
    return true;
  }

  /*****************************************************************************
   * Group: Cell retrieval
   *****************************************************************************/

  /**
   * Returns all distinct visible opposite cells for the specified terminal
   * on the given edges.
   *
   * @param edges Array of {@link Cell} that contains the edges whose opposite
   * terminals should be returned.
   * @param terminal Terminal that specifies the end whose opposite should be
   * returned.
   * @param sources Optional boolean that specifies if source terminals should be
   * included in the result. Default is `true`.
   * @param targets Optional boolean that specifies if targer terminals should be
   * included in the result. Default is `true`.
   */
  getOpposites(
    edges: CellArray,
    terminal: Cell | null = null,
    sources: boolean = true,
    targets: boolean = true
  ): CellArray {
    const terminals = new CellArray();

    // Fast lookup to avoid duplicates in terminals array
    const dict = new Dictionary();

    for (let i = 0; i < edges.length; i += 1) {
      const state = this.graph.view.getState(edges[i]);

      const source =
        state != null
          ? state.getVisibleTerminal(true)
          : this.graph.view.getVisibleTerminal(edges[i], true);
      const target =
        state != null
          ? state.getVisibleTerminal(false)
          : this.graph.view.getVisibleTerminal(edges[i], false);

      // Checks if the terminal is the source of the edge and if the
      // target should be stored in the result
      if (
        source == terminal &&
        target != null &&
        target != terminal &&
        targets
      ) {
        if (!dict.get(target)) {
          dict.put(target, true);
          terminals.push(target);
        }
      }

        // Checks if the terminal is the taget of the edge and if the
      // source should be stored in the result
      else if (
        target == terminal &&
        source != null &&
        source != terminal &&
        sources
      ) {
        if (!dict.get(source)) {
          dict.put(source, true);
          terminals.push(source);
        }
      }
    }
    return terminals;
  }
}

export default GraphTerminal;
