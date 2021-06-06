import CellState from "../cell/datatypes/CellState";
import {htmlEntities} from "../../util/StringUtils";
import Resources from "../../util/Resources";
import Shape from "../geometry/shape/Shape";
import mxSelectionCellsHandler from "../selection/mxSelectionCellsHandler";
import Cell from "../cell/datatypes/Cell";
import TooltipHandler from "./TooltipHandler";

class GraphTooltip {
  /**
   * Returns the string or DOM node that represents the tooltip for the given
   * state, node and coordinate pair. This implementation checks if the given
   * node is a folding icon or overlay and returns the respective tooltip. If
   * this does not result in a tooltip, the handler for the cell is retrieved
   * from {@link selectionCellsHandler} and the optional getTooltipForNode method is
   * called. If no special tooltip exists here then {@link getTooltipForCell} is used
   * with the cell in the given state as the argument to return a tooltip for the
   * given state.
   *
   * @param state {@link mxCellState} whose tooltip should be returned.
   * @param node DOM node that is currently under the mouse.
   * @param x X-coordinate of the mouse.
   * @param y Y-coordinate of the mouse.
   */
  // getTooltip(state: mxCellState, node: Node, x: number, y: number): string;
  getTooltip(
    state: CellState,
    node: HTMLElement,
    x: number,
    y: number
  ): string | null {
    let tip: string | null = null;

    if (state != null) {
      // Checks if the mouse is over the folding icon
      if (
        state.control != null &&
        // @ts-ignore
        (node === state.control.node || node.parentNode === state.control.node)
      ) {
        tip = this.collapseExpandResource;
        tip = htmlEntities(Resources.get(tip) || tip, true).replace(
          /\\n/g,
          '<br>'
        );
      }

      if (tip == null && state.overlays != null) {
        state.overlays.visit((id: string, shape: Shape) => {
          // LATER: Exit loop if tip is not null
          if (
            tip == null &&
            // @ts-ignore
            (node === shape.node || node.parentNode === shape.node)
          ) {
            // @ts-ignore
            tip = shape.overlay.toString();
          }
        });
      }

      if (tip == null) {
        const handler = (<mxSelectionCellsHandler>(
          this.selectionCellsHandler
        )).getHandler(<Cell>state.cell);
        if (
          handler != null &&
          typeof handler.getTooltipForNode === 'function'
        ) {
          tip = handler.getTooltipForNode(node);
        }
      }

      if (tip == null) {
        tip = this.getTooltipForCell(<Cell>state.cell);
      }
    }
    return tip;
  }

  /**
   * Returns the string or DOM node to be used as the tooltip for the given
   * cell. This implementation uses the cells getTooltip function if it
   * exists, or else it returns {@link convertValueToString} for the cell.
   *
   * @example
   *
   * ```javascript
   * graph.getTooltipForCell = function(cell)
   * {
   *   return 'Hello, World!';
   * }
   * ```
   *
   * Replaces all tooltips with the string Hello, World!
   *
   * @param cell {@link mxCell} whose tooltip should be returned.
   */
  getTooltipForCell(cell: Cell): string | null {
    let tip = null;

    if (cell != null && 'getTooltip' in cell) {
      // @ts-ignore
      tip = cell.getTooltip();
    } else {
      tip = this.convertValueToString(cell);
    }
    return tip;
  }

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Specifies if tooltips should be enabled. This implementation updates
   * {@link TooltipHandler.enabled} in {@link tooltipHandler}.
   *
   * @param enabled Boolean indicating if tooltips should be enabled.
   */
  setTooltips(enabled: boolean): void {
    (<TooltipHandler>this.tooltipHandler).setEnabled(enabled);
  }

}

export default GraphTooltip;
