import CellArray from '../cell/datatypes/CellArray';
import { autoImplement, sortCells } from '../../util/Utils';
import EventObject from '../event/EventObject';
import InternalEvent from '../event/InternalEvent';
import Graph from '../Graph';
import GraphSelection from '../selection/GraphSelection';

type PartialGraph = Pick<Graph, 'fireEvent' | 'batchUpdate' | 'getModel'>;
type PartialSelection = Pick<GraphSelection, 'getSelectionCells'>;
type PartialClass = PartialGraph & PartialSelection;

class GraphOrder extends autoImplement<PartialClass>() {
  /*****************************************************************************
   * Group: Order
   *****************************************************************************/

  /**
   * Moves the given cells to the front or back. The change is carried out
   * using {@link cellsOrdered}. This method fires {@link InternalEvent.ORDER_CELLS} while the
   * transaction is in progress.
   *
   * @param back Boolean that specifies if the cells should be moved to back.
   * @param cells Array of {@link mxCell} to move to the background. If null is
   * specified then the selection cells are used.
   */
  orderCells(
    back: boolean = false,
    cells: CellArray = this.getSelectionCells()
  ): CellArray {
    if (cells == null) {
      cells = sortCells(this.getSelectionCells(), true);
    }

    this.batchUpdate(() => {
      this.cellsOrdered(cells, back);
      const event = new EventObject(
        InternalEvent.ORDER_CELLS,
        'back',
        back,
        'cells',
        cells
      );
      this.fireEvent(event);
    });

    return cells;
  }

  /**
   * Moves the given cells to the front or back. This method fires
   * {@link InternalEvent.CELLS_ORDERED} while the transaction is in progress.
   *
   * @param cells Array of {@link mxCell} whose order should be changed.
   * @param back Boolean that specifies if the cells should be moved to back.
   */
  cellsOrdered(cells: CellArray, back: boolean = false) {
    this.batchUpdate(() => {
      for (let i = 0; i < cells.length; i += 1) {
        const parent = cells[i].getParent();

        if (back) {
          this.getModel().add(parent, cells[i], i);
        } else {
          this.getModel().add(parent, cells[i], parent ? parent.getChildCount() - 1 : 0);
        }
      }

      this.fireEvent(
        new EventObject(InternalEvent.CELLS_ORDERED, 'back', back, 'cells', cells)
      );
    });
  }
}

export default GraphOrder;
