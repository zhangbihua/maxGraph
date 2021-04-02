/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxPoint from '../../mxgraph/util/datatypes/mxPoint';
import mxLog from '../../mxgraph/util/gui/mxLog';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxGraphView from '../../mxgraph/view/graph/mxGraphView';

class Grid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Grid</h1>
        This example demonstrates drawing a grid dynamically using HTML 5
        canvas.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            height: '481px',
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
  }

  componentDidMount() {
    mxEvent.disableContextMenu(this.el);

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.graphHandler.scaleGrid = true;
    graph.setPanning(true);

    // Enables rubberband selection
    new mxRubberband(graph);

    let repaintGrid;

    // Create grid dynamically (requires canvas)
    (function() {
      try {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.style.zIndex = -1;
        graph.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Modify event filtering to accept canvas as container
        const mxGraphViewIsContainerEvent =
          mxGraphView.prototype.isContainerEvent;
        mxGraphView.prototype.isContainerEvent = function(evt) {
          return (
            mxGraphViewIsContainerEvent.apply(this, arguments) ||
            mxEvent.getSource(evt) === canvas
          );
        };

        let s = 0;
        let gs = 0;
        let tr = new mxPoint();
        let w = 0;
        let h = 0;

        repaintGrid = function() {
          if (ctx != null) {
            const bounds = graph.getGraphBounds();
            const width = Math.max(
              bounds.x + bounds.width,
              graph.container.clientWidth
            );
            const height = Math.max(
              bounds.y + bounds.height,
              graph.container.clientHeight
            );
            const sizeChanged = width !== w || height !== h;

            if (
              graph.view.scale !== s ||
              graph.view.translate.x !== tr.x ||
              graph.view.translate.y !== tr.y ||
              gs !== graph.gridSize ||
              sizeChanged
            ) {
              tr = graph.view.translate.clone();
              s = graph.view.scale;
              gs = graph.gridSize;
              w = width;
              h = height;

              // Clears the background if required
              if (!sizeChanged) {
                ctx.clearRect(0, 0, w, h);
              } else {
                canvas.setAttribute('width', w);
                canvas.setAttribute('height', h);
              }

              const tx = tr.x * s;
              const ty = tr.y * s;

              // Sets the distance of the grid lines in pixels
              const minStepping = graph.gridSize;
              let stepping = minStepping * s;

              if (stepping < minStepping) {
                const count =
                  Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
                stepping = count * stepping;
              }

              const xs = Math.floor((0 - tx) / stepping) * stepping + tx;
              let xe = Math.ceil(w / stepping) * stepping;
              const ys = Math.floor((0 - ty) / stepping) * stepping + ty;
              let ye = Math.ceil(h / stepping) * stepping;

              xe += Math.ceil(stepping);
              ye += Math.ceil(stepping);

              const ixs = Math.round(xs);
              const ixe = Math.round(xe);
              const iys = Math.round(ys);
              const iye = Math.round(ye);

              // Draws the actual grid
              ctx.strokeStyle = '#f6f6f6';
              ctx.beginPath();

              for (let x = xs; x <= xe; x += stepping) {
                x = Math.round((x - tx) / stepping) * stepping + tx;
                const ix = Math.round(x);

                ctx.moveTo(ix + 0.5, iys + 0.5);
                ctx.lineTo(ix + 0.5, iye + 0.5);
              }

              for (let y = ys; y <= ye; y += stepping) {
                y = Math.round((y - ty) / stepping) * stepping + ty;
                const iy = Math.round(y);

                ctx.moveTo(ixs + 0.5, iy + 0.5);
                ctx.lineTo(ixe + 0.5, iy + 0.5);
              }

              ctx.closePath();
              ctx.stroke();
            }
          }
        };
      } catch (e) {
        mxLog.show();
        mxLog.debug('Using background image');

        this.el.style.backgroundImage = "url('editors/images/grid.gif')";
      }

      const mxGraphViewValidateBackground =
        mxGraphView.prototype.validateBackground;
      mxGraphView.prototype.validateBackground = function() {
        mxGraphViewValidateBackground.apply(this, arguments);
        repaintGrid();
      };
    })();

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
      mxUtils.button('+', function() {
        graph.zoomIn();
      })
    );

    this.el2.appendChild(
      mxUtils.button('-', function() {
        graph.zoomOut();
      })
    );
  }
}

export default Grid;
