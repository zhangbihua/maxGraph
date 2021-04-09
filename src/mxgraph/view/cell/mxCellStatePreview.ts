/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */

import mxUtils from '../../util/mxUtils';
import mxPoint from '../../util/datatypes/mxPoint';
import mxDictionary from '../../util/datatypes/mxDictionary';
import mxCellState from '../../util/datatypes/mxCellState';
import mxCell from './mxCell';
import mxGraph from '../graph/mxGraph';
import mxGraphView from "../graph/mxGraphView";

/**
 *
 * @class mxCellStatePreview
 *
 * Implements a live preview for moving cells.
 */
class mxCellStatePreview {
  constructor(graph: mxGraph) {
    this.deltas = new mxDictionary();
    this.graph = graph;
  }

  /**
   * Reference to the enclosing <mxGraph>.
   */
  // graph: mxGraph;
  graph: mxGraph;

  /**
   * Reference to the enclosing <mxGraph>.
   */
  // deltas: mxDictionary;
  deltas: mxDictionary;

  /**
   * Contains the number of entries in the map.
   */
  // count: number;
  count: number = 0;

  /**
   * Returns true if this contains no entries.
   */
  // isEmpty(): boolean;
  isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   *
   *
   * @param {mxCellState} state
   * @param {number} dx
   * @param {number} dy
   * @param {boolean} add
   * @param {boolean} includeEdges
   * @return {*}  {mxPoint}
   * @memberof mxCellStatePreview
   */
  // moveState(state: mxCellState, dx: number, dy: number, add: boolean, includeEdges: boolean): mxPoint;
  moveState(
    state: mxCellState,
    dx: number,
    dy: number,
    add: boolean = true,
    includeEdges: boolean = true
  ): mxPoint {
    let delta = this.deltas.get(state.cell);

    if (delta == null) {
      // Note: Deltas stores the point and the state since the key is a string.
      delta = { point: new mxPoint(dx, dy), state };
      this.deltas.put(state.cell, delta);
      this.count++;
    } else if (add) {
      delta.point.x += dx;
      delta.point.y += dy;
    } else {
      delta.point.x = dx;
      delta.point.y = dy;
    }

    if (includeEdges) {
      this.addEdges(state);
    }
    return delta.point;
  }

  /**
   *
   *
   * @param {Function} visitor
   * @memberof mxCellStatePreview
   */
  // show(visitor: Function): void;
  show(visitor: Function | null = null) {
    this.deltas.visit((key: string, delta: any) => {
      this.translateState(delta.state, delta.point.x, delta.point.y);
    });

    this.deltas.visit((key: string, delta: any) => {
      this.revalidateState(
        delta.state,
        delta.point.x,
        delta.point.y,
        visitor
      );
    });
  }

  /**
   *
   *
   * @param {mxCellState} state
   * @param {number} dx
   * @param {number} dy
   * @memberof mxCellStatePreview
   */
  // translateState(state: mxCellState, dx: number, dy: number): void;
  translateState(state: mxCellState, dx: number, dy: number) {
    if (state != null) {
      const model = this.graph.getModel();

      if (model.isVertex(state.cell)) {
        (<mxGraphView>state.view).updateCellState(state);
        const geo = model.getGeometry(state.cell);

        // Moves selection cells and non-relative vertices in
        // the first phase so that edge terminal points will
        // be updated in the second phase
        if (
          (dx !== 0 || dy !== 0) &&
          geo != null &&
          (!geo.relative || this.deltas.get(state.cell) != null)
        ) {
          state.x += dx;
          state.y += dy;
        }
      }

      const childCount = model.getChildCount(state.cell);

      for (let i = 0; i < childCount; i += 1) {
        this.translateState(
          <mxCellState>(state.view).getState(model.getChildAt(state.cell, i)),
          dx,
          dy
        );
      }
    }
  }

  /**
   *
   *
   * @param {mxCellState} state
   * @param {number} dx
   * @param {number} dy
   * @param {Function} visitor
   * @memberof mxCellStatePreview
   */
  // revalidateState(state: mxCellState, dx: number, dy: number, visitor: Function): void;
  revalidateState(
    state: mxCellState | null = null,
    dx: number,
    dy: number,
    visitor: Function | null = null
  ): void {
    if (state != null) {
      const model = this.graph.getModel();

      // Updates the edge terminal points and restores the
      // (relative) positions of any (relative) children
      if (model.isEdge(state.cell)) {
        state.view.updateCellState(state);
      }

      const geo = this.graph.getCellGeometry(<mxCell>state.cell);
      const pState = state.view.getState(model.getParent(<mxCell>state.cell));

      // Moves selection vertices which are relative
      if (
        (dx !== 0 || dy !== 0) &&
        geo != null &&
        geo.relative &&
        model.isVertex(state.cell) &&
        (pState == null ||
          model.isVertex(pState.cell) ||
          this.deltas.get(state.cell) != null)
      ) {
        state.x += dx;
        state.y += dy;
      }

      this.graph.cellRenderer.redraw(state);

      // Invokes the visitor on the given state
      if (visitor != null) {
        visitor(state);
      }

      const childCount = model.getChildCount(state.cell);

      for (let i = 0; i < childCount; i += 1) {
        this.revalidateState(
          this.graph.view.getState(model.getChildAt(state.cell, i)),
          dx,
          dy,
          visitor
        );
      }
    }
  }

  /**
   *
   *
   * @param {mxCellState} state
   * @memberof mxCellStatePreview
   */
  // addEdges(state: mxCellState): void;
  addEdges(state: mxCellState): void {
    const model = this.graph.getModel();
    const edgeCount = model.getEdgeCount(<mxCell>state.cell);

    for (let i = 0; i < edgeCount; i += 1) {
      const s = state.view.getState(model.getEdgeAt(<mxCell>state.cell, i));

      if (s != null) {
        this.moveState(s, 0, 0);
      }
    }
  }
}

export default mxCellStatePreview;
