/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxPoint from '../../mxgraph/util/datatypes/mxPoint';
import mxGraphHandler from '../../mxgraph/handler/mxGraphHandler';
import mxUtils from '../../mxgraph/util/mxUtils';

class Boundary extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Boundary</h1>
        This example demonstrates implementing boundary events in BPMN diagrams.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '241px',
            background: 'url("editors/images/grid.gif")',
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.el);

    class MyCustomGraph extends mxGraph {
      // Enables moving of relative children
      isCellLocked(cell) {
        return false;
      }

      // Removes folding icon for relative children
      isCellFoldable(cell, collapse) {
        const childCount = this.model.getChildCount(cell);

        for (let i = 0; i < childCount; i++) {
          const child = this.model.getChildAt(cell, i);
          const geo = this.getCellGeometry(child);

          if (geo != null && geo.relative) {
            return false;
          }
        }

        return childCount > 0;
      }

      // Returns the relative position of the given child
      getRelativePosition(state, dx, dy) {
        if (state != null) {
          const model = graph.getModel();
          const geo = model.getGeometry(state.cell);

          if (geo != null && geo.relative && !model.isEdge(state.cell)) {
            const parent = model.getParent(state.cell);

            if (model.isVertex(parent)) {
              const pstate = graph.view.getState(parent);

              if (pstate != null) {
                const { scale } = graph.view;
                let x = state.x + dx;
                let y = state.y + dy;

                if (geo.offset != null) {
                  x -= geo.offset.x * scale;
                  y -= geo.offset.y * scale;
                }

                x = (x - pstate.x) / pstate.width;
                y = (y - pstate.y) / pstate.height;

                if (Math.abs(y - 0.5) <= Math.abs((x - 0.5) / 2)) {
                  x = x > 0.5 ? 1 : 0;
                  y = Math.min(1, Math.max(0, y));
                } else {
                  x = Math.min(1, Math.max(0, x));
                  y = y > 0.5 ? 1 : 0;
                }

                return new mxPoint(x, y);
              }
            }
          }
        }

        return null;
      }

      // Replaces translation for relative children
      translateCell(cell, dx, dy) {
        const rel = this.getRelativePosition(
          this.view.getState(cell),
          dx * graph.view.scale,
          dy * graph.view.scale
        );

        if (rel != null) {
          let geo = this.model.getGeometry(cell);

          if (geo != null && geo.relative) {
            geo = geo.clone();
            geo.x = rel.x;
            geo.y = rel.y;

            this.model.setGeometry(cell, geo);
          }
        } else {
          mxGraph.prototype.translateCell.apply(this, arguments);
        }
      }
    }

    // Creates the graph inside the given this.el
    const graph = new MyCustomGraph(this.el);

    // Sets the base style for all vertices
    const style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
    style[mxConstants.STYLE_STROKECOLOR] = '#000000';
    style[mxConstants.STYLE_STROKEWIDTH] = '2';
    style[mxConstants.STYLE_FONTCOLOR] = '#000000';
    style[mxConstants.STYLE_FONTSIZE] = '12';
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    graph.getStylesheet().putDefaultVertexStyle(style);

    // Replaces move preview for relative children
    graph.graphHandler.getDelta = function(me) {
      const point = mxUtils.convertPoint(
        this.graph.container,
        me.getX(),
        me.getY()
      );
      let delta = new mxPoint(point.x - this.first.x, point.y - this.first.y);

      if (
        this.cells != null &&
        this.cells.length > 0 &&
        this.cells[0] != null
      ) {
        const state = this.graph.view.getState(this.cells[0]);
        const rel = graph.getRelativePosition(state, delta.x, delta.y);

        if (rel != null) {
          const pstate = this.graph.view.getState(
            this.graph.model.getParent(state.cell)
          );

          if (pstate != null) {
            delta = new mxPoint(
              pstate.x + pstate.width * rel.x - state.getCenterX(),
              pstate.y + pstate.height * rel.y - state.getCenterY()
            );
          }
        }
      }

      return delta;
    };

    // Relative children cannot be removed from parent
    graph.graphHandler.shouldRemoveCellsFromParent = function(
      parent,
      cells,
      evt
    ) {
      return (
        cells.length === 0 &&
        !cells[0].geometry.relative &&
        mxGraphHandler.prototype.shouldRemoveCellsFromParent.apply(
          this,
          arguments
        )
      );
    };

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.batchUpdate(() => {
      const v1 = graph.insertVertex({
        parent,
        value: 'Process',
        position: [60, 60],
        size: [90, 40],
      });

      const v2 = graph.insertVertex({
        parent: v1,
        value: 'in',
        position: [0, 0.5],
        size: [20, 20],
        style: 'fontSize=9;shape=ellipse;resizable=0;',
      });
      v2.geometry.offset = new mxPoint(-10, -10);
      v2.geometry.relative = true;

      const v3 = graph.insertVertex({
        parent: v1,
        value: 'out',
        position: [1, 0.5],
        size: [20, 20],
        style: 'fontSize=9;shape=ellipse;resizable=0;',
      });
      v3.geometry.offset = new mxPoint(-10, -10);
      v3.geometry.relative = true;
    });
  }
}

export default Boundary;
