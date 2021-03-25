/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxRectangle from '../mxgraph/util/mxRectangle';
import mxCellRenderer from '../mxgraph/view/mxCellRenderer';
import mxImageShape from '../mxgraph/shape/mxImageShape';
import mxImage from '../mxgraph/util/mxImage';

class Control extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Control</h1>
        This example demonstrates adding
        controls to specific cells in a graph.

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            height: '441px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
        <div
          ref={el => {
            this.el2 = el;
          }}
        />
      </>
    );
  };

  componentDidMount = () => {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setPanning(true);

    // Specifies the URL and size of the new control
    const deleteImage = new mxImage(
      'editors/images/overlays/forbidden.png',
      16,
      16
    );

    // Overridden to add an additional control to the state at creation time
    const mxCellRendererCreateControl = mxCellRenderer.prototype.createControl;
    mxCellRenderer.prototype.createControl = function(state) {
      mxCellRendererCreateControl.apply(this, arguments);

      const { graph } = state.view;

      if (graph.getModel().isVertex(state.cell)) {
        if (state.deleteControl == null) {
          const b = new mxRectangle(
            0,
            0,
            deleteImage.width,
            deleteImage.height
          );
          state.deleteControl = new mxImageShape(b, deleteImage.src);
          state.deleteControl.dialect = graph.dialect;
          state.deleteControl.preserveImageAspect = false;

          this.initControl(state, state.deleteControl, false, function(evt) {
            if (graph.isEnabled()) {
              graph.removeCells([state.cell]);
              mxEvent.consume(evt);
            }
          });
        }
      } else if (state.deleteControl != null) {
        state.deleteControl.destroy();
        state.deleteControl = null;
      }
    };

    // Helper function to compute the bounds of the control
    const getDeleteControlBounds = function(state) {
      if (state.deleteControl != null) {
        const oldScale = state.deleteControl.scale;
        const w = state.deleteControl.bounds.width / oldScale;
        const h = state.deleteControl.bounds.height / oldScale;
        const s = state.view.scale;

        return state.view.graph.getModel().isEdge(state.cell)
          ? new mxRectangle(
              state.x + state.width / 2 - (w / 2) * s,
              state.y + state.height / 2 - (h / 2) * s,
              w * s,
              h * s
            )
          : new mxRectangle(
              state.x + state.width - w * s,
              state.y,
              w * s,
              h * s
            );
      }

      return null;
    };

    // Overridden to update the scale and bounds of the control
    const mxCellRendererRedrawControl = mxCellRenderer.prototype.redrawControl;
    mxCellRenderer.prototype.redrawControl = function(state) {
      mxCellRendererRedrawControl.apply(this, arguments);

      if (state.deleteControl != null) {
        const bounds = getDeleteControlBounds(state);
        const s = state.view.scale;

        if (
          state.deleteControl.scale !== s ||
          !state.deleteControl.bounds.equals(bounds)
        ) {
          state.deleteControl.bounds = bounds;
          state.deleteControl.scale = s;
          state.deleteControl.redraw();
        }
      }
    };

    // Overridden to remove the control if the state is destroyed
    const mxCellRendererDestroy = mxCellRenderer.prototype.destroy;
    mxCellRenderer.prototype.destroy = function(state) {
      mxCellRendererDestroy.apply(this, arguments);

      if (state.deleteControl != null) {
        state.deleteControl.destroy();
        state.deleteControl = null;
      }
    };

    // Uncomment the following if you want the container
    // to fit the size of the graph
    // graph.setResizeContainer(true);

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      const e1 = graph.insertEdge(parent, null, '', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    graph.centerZoom = false;

    this.el2.appendChild(
      mxUtils.button('Zoom In', function() {
        graph.zoomIn();
      })
    );

    this.el2.appendChild(
      mxUtils.button('Zoom Out', function() {
        graph.zoomOut();
      })
    );
  };
}

export default Control;
