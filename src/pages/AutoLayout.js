/**
 * Copyright (c) 2006-2013, JGraph Ltd
 *
 * Autolayout example for mxGraph. This example demonstrates running
 * and animating a layout algorithm after every change to a graph.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxClient from '../mxgraph/mxClient';
import mxMorphing from '../mxgraph/util/mxMorphing';
import mxEdgeHandler from '../mxgraph/handler/mxEdgeHandler';
import mxHierarchicalLayout from '../mxgraph/layout/hierarchical/mxHierarchicalLayout';
import mxConstants from '../mxgraph/util/mxConstants';
import mxUtils from '../mxgraph/util/mxUtils';
import mxCellOverlay from '../mxgraph/view/mxCellOverlay';
import mxImage from '../mxgraph/util/mxImage';
import mxEventObject from '../mxgraph/util/mxEventObject';
import mxCellRenderer from '../mxgraph/view/mxCellRenderer';

class AutoLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A this.el for the graph
    return (
      <>
        <h1>Auto layout example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '821px',
            height: '641px',
            background: 'url("editors/images/grid.gif")',
            cursor: 'default',
          }}
        />
      </>
    );
  };

  componentDidMount = () => {
    mxEvent.disableContextMenu(this.el);

    const mxCellRendererInstallCellOverlayListeners =
      mxCellRenderer.prototype.installCellOverlayListeners;
    mxCellRenderer.prototype.installCellOverlayListeners = function(
      state,
      overlay,
      shape
    ) {
      mxCellRendererInstallCellOverlayListeners.apply(this, arguments);

      mxEvent.addListener(
        shape.node,
        mxClient.IS_POINTER ? 'pointerdown' : 'mousedown',
        function(evt) {
          overlay.fireEvent(
            new mxEventObject('pointerdown', 'event', evt, 'state', state)
          );
        }
      );

      if (!mxClient.IS_POINTER && mxClient.IS_TOUCH) {
        mxEvent.addListener(shape.node, 'touchstart', function(evt) {
          overlay.fireEvent(
            new mxEventObject('pointerdown', 'event', evt, 'state', state)
          );
        });
      }
    };

    // Creates the graph inside the given this.el
    const graph = new mxGraph(this.el);
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
    const executeLayout = function(change, post) {
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
        morph.addListener(
          mxEvent.DONE,
          mxUtils.bind(this, function() {
            graph.getModel().endUpdate();
            if (post != null) {
              post();
            }
          })
        );
        morph.startAnimation();
      }
    };

    const addOverlay = function(cell) {
      // Creates a new overlay with an image and a tooltip
      const overlay = new mxCellOverlay(
        new mxImage('images/add.png', 24, 24),
        'Add outgoing'
      );
      overlay.cursor = 'hand';

      // Installs a handler for clicks on the overlay
      overlay.addListener(mxEvent.CLICK, function(sender, evt2) {
        graph.clearSelection();
        const geo = graph.getCellGeometry(cell);

        let v2;

        executeLayout(
          function() {
            v2 = graph.insertVertex(
              parent,
              null,
              'World!',
              geo.x,
              geo.y,
              80,
              30
            );
            addOverlay(v2);
            graph.view.refresh(v2);
            const e1 = graph.insertEdge(parent, null, '', cell, v2);
          },
          function() {
            graph.scrollCellToVisible(v2);
          }
        );
      });

      // Special CMS event
      overlay.addListener('pointerdown', function(sender, eo) {
        const evt2 = eo.getProperty('event');
        const state = eo.getProperty('state');

        graph.popupMenuHandler.hideMenu();
        graph.stopEditing(false);

        const pt = mxUtils.convertPoint(
          graph.this.el,
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
      v1 = graph.insertVertex(parent, null, 'Hello,', 0, 0, 80, 30);
      addOverlay(v1);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    const edgeHandleConnect = mxEdgeHandler.prototype.connect;
    mxEdgeHandler.prototype.connect = function(
      edge,
      terminal,
      isSource,
      isClone,
      me
    ) {
      edgeHandleConnect.apply(this, arguments);
      executeLayout();
    };

    graph.resizeCell = function() {
      mxGraph.prototype.resizeCell.apply(this, arguments);
      executeLayout();
    };

    graph.connectionHandler.addListener(mxEvent.CONNECT, function() {
      executeLayout();
    });
  };
}

export default AutoLayout;
