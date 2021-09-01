import { autoImplement } from '../../util/Utils';
import Point from '../geometry/Point';
import Rectangle from '../geometry/Rectangle';

import type Graph from '../Graph';

type PartialGraph = Pick<Graph, 'getView'>;
type PartialClass = PartialGraph;

class GraphSnap extends autoImplement<PartialClass>() {
  // TODO: Document me!
  snapTolerance: number = 0;

  getSnapTolerance = () => this.snapTolerance;

  /**
   * Specifies the grid size.
   * @default 10
   */
  gridSize = 10;

  /**
   * Specifies if the grid is enabled. This is used in {@link snap}.
   * @default true
   */
  gridEnabled = true;

  /*****************************************************************************
   * Group: Graph display
   *****************************************************************************/

  /**
   * Snaps the given numeric value to the grid if {@link gridEnabled} is true.
   *
   * @param value Numeric value to be snapped to the grid.
   */
  snap(value: number) {
    if (this.gridEnabled) {
      value = Math.round(value / this.gridSize) * this.gridSize;
    }
    return value;
  }

  /**
   * Function: snapDelta
   *
   * Snaps the given delta with the given scaled bounds.
   */
  snapDelta(
    delta: Point,
    bounds: Rectangle,
    ignoreGrid = false,
    ignoreHorizontal = false,
    ignoreVertical = false
  ) {
    const t = this.getView().translate;
    const s = this.getView().scale;

    if (!ignoreGrid && this.gridEnabled) {
      const tol = this.gridSize * s * 0.5;

      if (!ignoreHorizontal) {
        const tx = bounds.x - (this.snap(bounds.x / s - t.x) + t.x) * s;

        if (Math.abs(delta.x - tx) < tol) {
          delta.x = 0;
        } else {
          delta.x = this.snap(delta.x / s) * s - tx;
        }
      }

      if (!ignoreVertical) {
        const ty = bounds.y - (this.snap(bounds.y / s - t.y) + t.y) * s;

        if (Math.abs(delta.y - ty) < tol) {
          delta.y = 0;
        } else {
          delta.y = this.snap(delta.y / s) * s - ty;
        }
      }
    } else {
      const tol = 0.5 * s;

      if (!ignoreHorizontal) {
        const tx = bounds.x - (Math.round(bounds.x / s - t.x) + t.x) * s;

        if (Math.abs(delta.x - tx) < tol) {
          delta.x = 0;
        } else {
          delta.x = Math.round(delta.x / s) * s - tx;
        }
      }

      if (!ignoreVertical) {
        const ty = bounds.y - (Math.round(bounds.y / s - t.y) + t.y) * s;

        if (Math.abs(delta.y - ty) < tol) {
          delta.y = 0;
        } else {
          delta.y = Math.round(delta.y / s) * s - ty;
        }
      }
    }
    return delta;
  }

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Returns {@link gridEnabled} as a boolean.
   */
  isGridEnabled() {
    return this.gridEnabled;
  }

  /**
   * Specifies if the grid should be enabled.
   *
   * @param value Boolean indicating if the grid should be enabled.
   */
  setGridEnabled(value: boolean) {
    this.gridEnabled = value;
  }

  /**
   * Returns {@link gridSize}.
   */
  getGridSize() {
    return this.gridSize;
  }

  /**
   * Sets {@link gridSize}.
   */
  setGridSize(value: number) {
    this.gridSize = value;
  }

  /**
   * Returns {@link tolerance}.
   */
  getTolerance() {
    return this.snapTolerance;
  }

  /**
   * Sets {@link tolerance}.
   */
  setTolerance(value: number) {
    this.snapTolerance = value;
  }
}

export default GraphSnap;
