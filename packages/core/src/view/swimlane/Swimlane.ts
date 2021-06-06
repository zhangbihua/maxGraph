import Cell from "../cell/datatypes/Cell";

class Swimlane {
  constructor() {
  }

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
  hitsSwimlaneContent(swimlane: Cell,
                      x: number,
                      y: number): boolean {
    const state = this.getView().getState(swimlane);
    const size = this.getStartSize(swimlane);

    if (state != null) {
      const scale = this.getView().getScale();
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
}

export default Swimlane;
