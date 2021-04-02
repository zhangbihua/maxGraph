/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxUtils from '../../util/mxUtils';
import mxPoint from '../../util/datatypes/mxPoint';
import mxDictionary from '../../util/datatypes/mxDictionary';
import mxCellState from "../../util/datatypes/mxCellState";
import mxCell from "./mxCell";
import mxGraph from "../graph/mxGraph";

class mxCellStatePreview {
  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: mxGraph | null = null;

  /**
   * Variable: deltas
   *
   * Reference to the enclosing <mxGraph>.
   */
  deltas: mxDictionary | null = null;

  /**
   * Variable: count
   *
   * Contains the number of entries in the map.
   */
  count: number = 0;

  /**
   *
   * Class: mxCellStatePreview
   *
   * Implements a live preview for moving cells.
   *
   * Constructor: mxCellStatePreview
   *
   * Constructs a move preview for the given graph.
   *
   * Parameters:
   *
   * graph - Reference to the enclosing <mxGraph>.
   */
  constructor(graph: mxGraph) {
    this.deltas = new mxDictionary();
    this.graph = graph;
  }

  /**
   * Function: isEmpty
   *
   * Returns true if this contains no entries.
   */
  isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Function: moveState
   */
  moveState(state: mxCellState,
            dx: number,
            dy: number,
            add: boolean=true,
            includeEdges: boolean=true): mxPoint {

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
   * Function: show
   */
  show(visitor: Function | null=null) {
    this.deltas.visit(
      mxUtils.bind(this, (key, delta) => {
        this.translateState(delta.state, delta.point.x, delta.point.y);
      })
    );

    this.deltas.visit(
      mxUtils.bind(this, (key, delta) => {
        this.revalidateState(
          delta.state,
          delta.point.x,
          delta.point.y,
          visitor
        );
      })
    );
  }

  /**
   * Function: translateState
   */
  translateState(state: mxCellState,
                 dx: number,
                 dy: number) {

    if (state != null) {
      const model = this.graph.getModel();

      if (model.isVertex(state.cell)) {
        state.view.updateCellState(state);
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
          state.view.getState(model.getChildAt(state.cell, i)),
          dx,
          dy
        );
      }
    }
  }

  /**
   * Function: revalidateState
   */
  revalidateState(state: mxCellState | null=null,
                  dx: number,
                  dy: number,
                  visitor: Function | null=null): void {

    if (state != null) {
      const model = this.graph.getModel();

      // Updates the edge terminal points and restores the
      // (relative) positions of any (relative) children
      if (model.isEdge(state.cell)) {
        state.view.updateCellState(state);
      }

      const geo = this.graph.getCellGeometry(state.cell);
      const pState = state.view.getState(model.getParent(state.cell));

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
   * Function: addEdges
   */
  addEdges(state: mxCellState): void {
    const model = this.graph.getModel();
    const edgeCount = model.getEdgeCount(state.cell);

    for (let i = 0; i < edgeCount; i += 1) {
      const s = state.view.getState(model.getEdgeAt(state.cell, i));

      if (s != null) {
        this.moveState(s, 0, 0);
      }
    }
  }
}

export default mxCellStatePreview;
