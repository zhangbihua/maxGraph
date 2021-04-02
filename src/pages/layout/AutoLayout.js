/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxClient from '../../mxgraph/mxClient';
import mxMorphing from '../../mxgraph/util/animate/mxMorphing';
import mxEdgeHandler from '../../mxgraph/handler/mxEdgeHandler';
import mxHierarchicalLayout from '../../mxgraph/layout/hierarchical/mxHierarchicalLayout';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxCellOverlay from '../../mxgraph/view/cell/mxCellOverlay';
import mxImage from '../../mxgraph/util/image/mxImage';
import mxEventObject from '../../mxgraph/util/event/mxEventObject';
import mxCellRenderer from '../../mxgraph/view/cell/mxCellRenderer';

class AutoLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Auto layout</h1>
        This example demonstrates running and animating a layout algorithm after
        every change to a graph.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '641px',
            background: 'url("editors/images/grid.gif")',
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    mxEvent.disableContextMenu(this.el);

    class MyCustomCellRenderer extends mxCellRenderer {
      installCellOverlayListeners(state, overlay, shape) {
        super.installCellOverlayListeners(state, overlay, shape);

        mxEvent.addListener(
          shape.node,
          mxClient.IS_POINTER ? 'pointerdown' : 'mousedown',
          evt => {
            overlay.fireEvent(
              new mxEventObject('pointerdown', 'event', evt, 'state', state)
            );
          }
        );

        if (!mxClient.IS_POINTER && mxClient.IS_TOUCH) {
          mxEvent.addListener(shape.node, 'touchstart', evt => {
            overlay.fireEvent(
              new mxEventObject('pointerdown', 'event', evt, 'state', state)
            );
          });
        }
      }
    }

    class MyCustomEdgeHandler extends mxEdgeHandler {
      connect(edge, terminal, isSource, isClone, me) {
        super.connect(edge, terminal, isSource, isClone, me);
        executeLayout();
      }
    }

    class MyCustomGraph extends mxGraph {
      createEdgeHandler(state, edgeStyle) {
        return new MyCustomEdgeHandler(state, edgeStyle);
      }

      createCellRenderer() {
        return new MyCustomCellRenderer();
      }
    }

    // Creates the graph inside the given this.el
    const graph = new MyCustomGraph(this.el);
    graph.setPanning(true);
    graph.panningHandler.useLeftButtonForPanning = true;
    graph.setAllowDanglingEdges(false);
    graph.connectionHandler.select = false;
    graph.view.setTranslate(20, 20);

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    const layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
    const executeLayout = (change, post) => {
      graph.getModel().beginUpdate();
      try {
        if (change != null) {
          change();
        }
        layout.execute(graph.getDefaultParent(), v1);
      } catch (e) {
        throw e;
      } finally {
        // New API for animating graph layout results asynchronously
        const morph = new mxMorphing(graph);
        morph.addListener(mxEvent.DONE, () => {
          graph.getModel().endUpdate();
          if (post != null) {
            post();
          }
        });
        morph.startAnimation();
      }
    };

    const addOverlay = cell => {
      // Creates a new overlay with an image and a tooltip
      const overlay = new mxCellOverlay(
        new mxImage('images/add.png', 24, 24),
        'Add outgoing'
      );
      overlay.cursor = 'hand';

      // Installs a handler for clicks on the overlay
      overlay.addListener(mxEvent.CLICK, (sender, evt2) => {
        graph.clearSelection();
        const geo = graph.getCellGeometry(cell);

        let v2;

        executeLayout(
          () => {
            v2 = graph.insertVertex({
              parent,
              value: 'World!',
              position: [geo.x, geo.y],
              size: [80, 30],
            });
            addOverlay(v2);
            graph.view.refresh(v2);
            const e1 = graph.insertEdge({
              parent,
              source: cell,
              target: v2,
            });
          },
          () => {
            graph.scrollCellToVisible(v2);
          }
        );
      });

      // Special CMS event
      overlay.addListener('pointerdown', (sender, eo) => {
        const evt2 = eo.getProperty('event');
        const state = eo.getProperty('state');

        graph.popupMenuHandler.hideMenu();
        graph.stopEditing(false);

        const pt = mxUtils.convertPoint(
          graph.container,
          mxEvent.getClientX(evt2),
          mxEvent.getClientY(evt2)
        );
        graph.connectionHandler.start(state, pt.x, pt.y);
        graph.isMouseDown = true;
        graph.isMouseTrigger = mxEvent.isMouseEvent(evt2);
        mxEvent.consume(evt2);
      });

      // Sets the overlay for the cell in the graph
      graph.addCellOverlay(cell, overlay);
    };

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    let v1;
    try {
      v1 = graph.insertVertex({
        parent,
        value: 'Hello,',
        position: [0, 0],
        size: [80, 30],
      });
      addOverlay(v1);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    graph.resizeCell = function() {
      mxGraph.prototype.resizeCell.apply(this, arguments);
      executeLayout();
    };

    graph.connectionHandler.addListener(mxEvent.CONNECT, function() {
      executeLayout();
    });
  }
}

export default AutoLayout;
