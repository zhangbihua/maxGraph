/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/mxEvent';
import mxGraph from '../../mxgraph/view/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxConnectionHandler from '../../mxgraph/handler/mxConnectionHandler';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxRectangle from '../../mxgraph/util/mxRectangle';
import mxImage from '../../mxgraph/util/mxImage';

class HoverIcons extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Hover icons</h1>
        This example demonstrates showing icons on vertices as mouse hovers over
        them.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage(
      'images/connector.gif',
      16,
      16
    );

    // Defines a new class for all icons
    function mxIconSet(state) {
      this.images = [];
      const { graph } = state.view;

      // Icon1
      let img = mxUtils.createImage('images/copy.png');
      img.setAttribute('title', 'Duplicate');
      img.style.position = 'absolute';
      img.style.cursor = 'pointer';
      img.style.width = '16px';
      img.style.height = '16px';
      img.style.left = `${state.x + state.width}px`;
      img.style.top = `${state.y + state.height}px`;

      mxEvent.addGestureListeners(img, evt => {
        const s = graph.gridSize;
        graph.setSelectionCells(graph.moveCells([state.cell], s, s, true));
        mxEvent.consume(evt);
        this.destroy();
      });

      state.view.graph.container.appendChild(img);
      this.images.push(img);

      // Delete
      img = mxUtils.createImage('images/delete2.png');
      img.setAttribute('title', 'Delete');
      img.style.position = 'absolute';
      img.style.cursor = 'pointer';
      img.style.width = '16px';
      img.style.height = '16px';
      img.style.left = `${state.x + state.width}px`;
      img.style.top = `${state.y - 16}px`;

      mxEvent.addGestureListeners(img, evt => {
        // Disables dragging the image
        mxEvent.consume(evt);
      });

      mxEvent.addListener(img, 'click', evt => {
        graph.removeCells([state.cell]);
        mxEvent.consume(evt);
        this.destroy();
      });

      state.view.graph.container.appendChild(img);
      this.images.push(img);
    }

    mxIconSet.prototype.destroy = function() {
      if (this.images != null) {
        for (let i = 0; i < this.images.length; i++) {
          const img = this.images[i];
          img.parentNode.removeChild(img);
        }
      }

      this.images = null;
    };

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setConnectable(true);

    // Defines the tolerance before removing the icons
    const iconTolerance = 20;

    // Shows icons if the mouse is over a cell
    graph.addMouseListener({
      currentState: null,
      currentIconSet: null,
      mouseDown(sender, me) {
        // Hides icons on mouse down
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove(sender, me) {
        if (
          this.currentState != null &&
          (me.getState() == this.currentState || me.getState() == null)
        ) {
          const tol = iconTolerance;
          const tmp = new mxRectangle(
            me.getGraphX() - tol,
            me.getGraphY() - tol,
            2 * tol,
            2 * tol
          );

          if (mxUtils.intersects(tmp, this.currentState)) {
            return;
          }
        }

        let tmp = graph.view.getState(me.getCell());

        // Ignores everything but vertices
        if (
          graph.isMouseDown ||
          (tmp != null && !graph.getModel().isVertex(tmp.cell))
        ) {
          tmp = null;
        }

        if (tmp != this.currentState) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
          }

          this.currentState = tmp;

          if (this.currentState != null) {
            this.dragEnter(me.getEvent(), this.currentState);
          }
        }
      },
      mouseUp(sender, me) {},
      dragEnter(evt, state) {
        if (this.currentIconSet == null) {
          this.currentIconSet = new mxIconSet(state);
        }
      },
      dragLeave(evt, state) {
        if (this.currentIconSet != null) {
          this.currentIconSet.destroy();
          this.currentIconSet = null;
        }
      },
    });

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
  }
}

export default HoverIcons;
