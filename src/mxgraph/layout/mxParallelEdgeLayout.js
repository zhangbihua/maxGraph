/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxPoint from '../util/datatypes/mxPoint';
import mxGraphLayout from './mxGraphLayout';
import mxObjectIdentity from '../util/mxObjectIdentity';

class mxParallelEdgeLayout extends mxGraphLayout {
  /**
   * Variable: spacing
   *
   * Defines the spacing between the parallels. Default is 20.
   */
  spacing = 20;

  /**
   * Variable: checkOverlap
   *
   * Specifies if only overlapping edges should be considered
   * parallel. Default is false.
   */
  checkOverlap = false;

  /**
   * Class: mxParallelEdgeLayout
   *
   * Extends <mxGraphLayout> for arranging parallel edges. This layout works
   * on edges for all pairs of vertices where there is more than one edge
   * connecting the latter.
   *
   * Example:
   *
   * (code)
   * let layout = new mxParallelEdgeLayout(graph);
   * layout.execute(graph.getDefaultParent());
   * (end)
   *
   * To run the layout for the parallel edges of a changed edge only, the
   * following code can be used.
   *
   * (code)
   * let layout = new mxParallelEdgeLayout(graph);
   *
   * graph.addListener(mxEvent.CELL_CONNECTED, (sender, evt)=>
   * {
   *   let model = graph.getModel();
   *   let edge = evt.getProperty('edge');
   *   let src = model.getTerminal(edge, true);
   *   let trg = model.getTerminal(edge, false);
   *
   *   layout.isEdgeIgnored = (edge2)=>
   *   {
   *     var src2 = model.getTerminal(edge2, true);
   *     var trg2 = model.getTerminal(edge2, false);
   *
   *     return !(model.isEdge(edge2) && ((src == src2 && trg == trg2) || (src == trg2 && trg == src2)));
   *   };
   *
   *   layout.execute(graph.getDefaultParent());
   * });
   * (end)
   *
   * Constructor: mxParallelEdgeLayout
   *
   * Constructs a new parallel edge layout for the specified graph.
   */
  constructor(graph) {
    super(graph);
  }

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   */
  execute(parent, cells) {
    const lookup = this.findParallels(parent, cells);

    this.graph.model.beginUpdate();
    try {
      for (const i in lookup) {
        const parallels = lookup[i];

        if (parallels.length > 1) {
          this.layout(parallels);
        }
      }
    } finally {
      this.graph.model.endUpdate();
    }
  }

  /**
   * Function: findParallels
   *
   * Finds the parallel edges in the given parent.
   */
  findParallels(parent, cells) {
    const lookup = [];

    const addCell = cell => {
      if (!this.isEdgeIgnored(cell)) {
        const id = this.getEdgeId(cell);

        if (id != null) {
          if (lookup[id] == null) {
            lookup[id] = [];
          }

          lookup[id].push(cell);
        }
      }
    };

    if (cells != null) {
      for (let i = 0; i < cells.length; i += 1) {
        addCell(cells[i]);
      }
    } else {
      const model = this.graph.getModel();
      const childCount = model.getChildCount(parent);

      for (let i = 0; i < childCount; i += 1) {
        addCell(model.getChildAt(parent, i));
      }
    }

    return lookup;
  }

  /**
   * Function: getEdgeId
   *
   * Returns a unique ID for the given edge. The id is independent of the
   * edge direction and is built using the visible terminal of the given
   * edge.
   */
  getEdgeId(edge) {
    const view = this.graph.getView();

    // Cannot used cached visible terminal because this could be triggered in BEFORE_UNDO
    let src = view.getVisibleTerminal(edge, true);
    let trg = view.getVisibleTerminal(edge, false);
    let pts = '';

    if (src != null && trg != null) {
      src = mxObjectIdentity.get(src);
      trg = mxObjectIdentity.get(trg);

      if (this.checkOverlap) {
        const state = this.graph.view.getState(edge);

        if (state != null && state.absolutePoints != null) {
          const tmp = [];

          for (let i = 0; i < state.absolutePoints.length; i += 1) {
            const pt = state.absolutePoints[i];

            if (pt != null) {
              tmp.push(pt.x, pt.y);
            }
          }
          pts = tmp.join(',');
        }
      }
      return (src > trg ? `${trg}-${src}` : `${src}-${trg}`) + pts;
    }
    return null;
  }

  /**
   * Function: layout
   *
   * Lays out the parallel edges in the given array.
   */
  layout(parallels) {
    const edge = parallels[0];
    const view = this.graph.getView();
    const model = this.graph.getModel();
    const src = model.getGeometry(view.getVisibleTerminal(edge, true));
    const trg = model.getGeometry(view.getVisibleTerminal(edge, false));

    let x0;
    let y0;

    // Routes multiple loops
    if (src === trg) {
      x0 = src.x + src.width + this.spacing;
      y0 = src.y + src.height / 2;

      for (let i = 0; i < parallels.length; i += 1) {
        this.route(parallels[i], x0, y0);
        x0 += this.spacing;
      }
    } else if (src != null && trg != null) {
      // Routes parallel edges
      const scx = src.x + src.width / 2;
      const scy = src.y + src.height / 2;

      const tcx = trg.x + trg.width / 2;
      const tcy = trg.y + trg.height / 2;

      const dx = tcx - scx;
      const dy = tcy - scy;

      const len = Math.sqrt(dx * dx + dy * dy);

      if (len > 0) {
        x0 = scx + dx / 2;
        y0 = scy + dy / 2;

        const nx = (dy * this.spacing) / len;
        const ny = (dx * this.spacing) / len;

        x0 += (nx * (parallels.length - 1)) / 2;
        y0 -= (ny * (parallels.length - 1)) / 2;

        for (let i = 0; i < parallels.length; i += 1) {
          this.route(parallels[i], x0, y0);
          x0 -= nx;
          y0 += ny;
        }
      }
    }
  }

  /**
   * Function: route
   *
   * Routes the given edge via the given point.
   */
  route(edge, x, y) {
    if (this.graph.isCellMovable(edge)) {
      this.setEdgePoints(edge, [new mxPoint(x, y)]);
    }
  }
}

export default mxParallelEdgeLayout;
