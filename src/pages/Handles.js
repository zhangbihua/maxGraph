/**
 * Copyright (c) 2006-2014, JGraph Ltd
  
  Handles example for mxGraph. This example demonstrates using mxHandle to change custom styles interactively.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxVertexHandler from '../mxgraph/handler/mxVertexHandler';
import mxCellRenderer from '../mxgraph/view/mxCellRenderer';
import mxRectangle from '../mxgraph/util/mxRectangle';
import mxCylinder from '../mxgraph/shape/mxCylinder';
import mxPoint from '../mxgraph/util/mxPoint';
import mxHandle from '../mxgraph/handler/mxHandle';

class Handles extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Handles example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '621px',
            height: '441px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    class MyShape extends mxCylinder {
      defaultPos1 = 20;

      defaultPos2 = 60;

      getLabelBounds(rect) {
        const pos1 =
          mxUtils.getValue(this.style, 'pos1', this.defaultPos1) * this.scale;
        const pos2 =
          mxUtils.getValue(this.style, 'pos2', this.defaultPos2) * this.scale;
        return new mxRectangle(
          rect.x,
          rect.y + pos1,
          rect.width,
          Math.min(rect.height, pos2) - Math.max(0, pos1)
        );
      }

      redrawPath(path, x, y, w, h, isForeground) {
        const pos1 = mxUtils.getValue(this.style, 'pos1', this.defaultPos1);
        const pos2 = mxUtils.getValue(this.style, 'pos2', this.defaultPos2);

        if (isForeground) {
          if (pos1 < h) {
            path.moveTo(0, pos1);
            path.lineTo(w, pos1);
          }

          if (pos2 < h) {
            path.moveTo(0, pos2);
            path.lineTo(w, pos2);
          }
        } else {
          path.rect(0, 0, w, h);
        }
      }
    }
    mxCellRenderer.registerShape('myShape', MyShape);

    class MyCustomVertexHandler extends mxVertexHandler {
      livePreview = true;

      rotationEnabled = true;

      createCustomHandles() {
        if (this.state.style.shape === 'myShape') {
          // Implements the handle for the first divider
          const firstHandle = new mxHandle(this.state);

          firstHandle.getPosition = function(bounds) {
            const pos2 = Math.max(
              0,
              Math.min(
                bounds.height,
                parseFloat(
                  mxUtils.getValue(
                    this.state.style,
                    'pos2',
                    MyShape.prototype.defaultPos2
                  )
                )
              )
            );
            const pos1 = Math.max(
              0,
              Math.min(
                pos2,
                parseFloat(
                  mxUtils.getValue(
                    this.state.style,
                    'pos1',
                    MyShape.prototype.defaultPos1
                  )
                )
              )
            );

            return new mxPoint(bounds.getCenterX(), bounds.y + pos1);
          };

          firstHandle.setPosition = function(bounds, pt) {
            const pos2 = Math.max(
              0,
              Math.min(
                bounds.height,
                parseFloat(
                  mxUtils.getValue(
                    this.state.style,
                    'pos2',
                    MyShape.prototype.defaultPos2
                  )
                )
              )
            );

            this.state.style.pos1 = Math.round(
              Math.max(0, Math.min(pos2, pt.y - bounds.y))
            );
          };

          firstHandle.execute = function() {
            this.copyStyle('pos1');
          };

          firstHandle.ignoreGrid = true;

          // Implements the handle for the second divider
          const secondHandle = new mxHandle(this.state);

          secondHandle.getPosition = function(bounds) {
            const pos1 = Math.max(
              0,
              Math.min(
                bounds.height,
                parseFloat(
                  mxUtils.getValue(
                    this.state.style,
                    'pos1',
                    MyShape.prototype.defaultPos1
                  )
                )
              )
            );
            const pos2 = Math.max(
              pos1,
              Math.min(
                bounds.height,
                parseFloat(
                  mxUtils.getValue(
                    this.state.style,
                    'pos2',
                    MyShape.prototype.defaultPos2
                  )
                )
              )
            );

            return new mxPoint(bounds.getCenterX(), bounds.y + pos2);
          };

          secondHandle.setPosition = function(bounds, pt) {
            const pos1 = Math.max(
              0,
              Math.min(
                bounds.height,
                parseFloat(
                  mxUtils.getValue(
                    this.state.style,
                    'pos1',
                    MyShape.prototype.defaultPos1
                  )
                )
              )
            );

            this.state.style.pos2 = Math.round(
              Math.max(pos1, Math.min(bounds.height, pt.y - bounds.y))
            );
          };

          secondHandle.execute = function() {
            this.copyStyle('pos2');
          };

          secondHandle.ignoreGrid = true;

          return [firstHandle, secondHandle];
        }

        return null;
      }
    }

    class MyCustomGraph extends mxGraph {
      createVertexHandler(state) {
        return new MyCustomVertexHandler(state);
      }
    }

    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.el);

    // Creates the graph inside the given container
    const graph = new MyCustomGraph(this.el);
    graph.setCellsCloneable(true);
    graph.setHtmlLabels(true);
    graph.setPanning(true);
    graph.centerZoom = false;

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(
        parent,
        null,
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        20,
        20,
        240,
        120,
        'shape=myShape;whiteSpace=wrap;overflow=hidden;pos1=30;pos2=80;'
      );
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    document.body.appendChild(
      mxUtils.button('+', function() {
        graph.zoomIn();
      })
    );
    document.body.appendChild(
      mxUtils.button('-', function() {
        graph.zoomOut();
      })
    );
  }
}

export default Handles;
