/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxVertexHandler from '../mxgraph/handler/mxVertexHandler';
import mxUtils from '../mxgraph/util/mxUtils';
import mxClient from '../mxgraph/mxClient';

class ContextIcons extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Context icons</h1>
        This example demonstrates adding
        icons to selected vertices to carry out special operations.

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
  };

  componentDidMount = () => {
    // Defines a subclass for mxVertexHandler that adds a set of clickable
    // icons to every selected vertex.
    function mxVertexToolHandler(state) {
      mxVertexHandler.apply(this, arguments);
    }

    mxVertexToolHandler.prototype = new mxVertexHandler();
    mxVertexToolHandler.prototype.constructor = mxVertexToolHandler;

    mxVertexToolHandler.prototype.domNode = null;

    mxVertexToolHandler.prototype.init = function() {
      mxVertexHandler.prototype.init.apply(this, arguments);

      // In this example we force the use of DIVs for images in IE. This
      // handles transparency in PNG images properly in IE and fixes the
      // problem that IE routes all mouse events for a gesture via the
      // initial IMG node, which means the target vertices
      this.domNode = document.createElement('div');
      this.domNode.style.position = 'absolute';
      this.domNode.style.whiteSpace = 'nowrap';

      // Workaround for event redirection via image tag in quirks and IE8
      function createImage(src) {
        return mxUtils.createImage(src);
      }

      // Delete
      let img = createImage('images/delete2.png');
      img.setAttribute('title', 'Delete');
      img.style.cursor = 'pointer';
      img.style.width = '16px';
      img.style.height = '16px';
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function(evt) {
          // Disables dragging the image
          mxEvent.consume(evt);
        })
      );
      mxEvent.addListener(
        img,
        'click',
        mxUtils.bind(this, function(evt) {
          this.graph.removeCells([this.state.cell]);
          mxEvent.consume(evt);
        })
      );
      this.domNode.appendChild(img);

      // Size
      img = createImage('images/fit_to_size.png');
      img.setAttribute('title', 'Resize');
      img.style.cursor = 'se-resize';
      img.style.width = '16px';
      img.style.height = '16px';
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function(evt) {
          this.start(mxEvent.getClientX(evt), mxEvent.getClientY(evt), 7);
          this.graph.isMouseDown = true;
          this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
          mxEvent.consume(evt);
        })
      );
      this.domNode.appendChild(img);

      // Move
      img = createImage('images/plus.png');
      img.setAttribute('title', 'Move');
      img.style.cursor = 'move';
      img.style.width = '16px';
      img.style.height = '16px';
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function(evt) {
          this.graph.graphHandler.start(
            this.state.cell,
            mxEvent.getClientX(evt),
            mxEvent.getClientY(evt)
          );
          this.graph.graphHandler.cellWasClicked = true;
          this.graph.isMouseDown = true;
          this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
          mxEvent.consume(evt);
        })
      );
      this.domNode.appendChild(img);

      // Connect
      img = createImage('images/check.png');
      img.setAttribute('title', 'Connect');
      img.style.cursor = 'pointer';
      img.style.width = '16px';
      img.style.height = '16px';
      mxEvent.addGestureListeners(
        img,
        mxUtils.bind(this, function(evt) {
          const pt = mxUtils.convertPoint(
            this.graph.container,
            mxEvent.getClientX(evt),
            mxEvent.getClientY(evt)
          );
          this.graph.connectionHandler.start(this.state, pt.x, pt.y);
          this.graph.isMouseDown = true;
          this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
          mxEvent.consume(evt);
        })
      );
      this.domNode.appendChild(img);

      this.graph.container.appendChild(this.domNode);
      this.redrawTools();
    };

    mxVertexToolHandler.prototype.redraw = function() {
      mxVertexHandler.prototype.redraw.apply(this);
      this.redrawTools();
    };

    mxVertexToolHandler.prototype.redrawTools = function() {
      if (this.state != null && this.domNode != null) {
        const dy = 4;
        this.domNode.style.left = `${this.state.x + this.state.width - 56}px`;
        this.domNode.style.top = `${this.state.y + this.state.height + dy}px`;
      }
    };

    mxVertexToolHandler.prototype.destroy = function(sender, me) {
      mxVertexHandler.prototype.destroy.apply(this, arguments);

      if (this.domNode != null) {
        this.domNode.parentNode.removeChild(this.domNode);
        this.domNode = null;
      }
    };

    // Program starts here. Creates a sample graph in the
    // DOM node with the specified ID. This function is invoked
    // from the onLoad event handler of the document (see below).
    function main(container) {
      // Checks if the browser is supported
      if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        // Creates the graph inside the given container
        const graph = new mxGraph(container);
        graph.setConnectable(true);
        graph.connectionHandler.createTarget = true;

        graph.createHandler = function(state) {
          if (state != null && this.model.isVertex(state.cell)) {
            return new mxVertexToolHandler(state);
          }

          return mxGraph.prototype.createHandler.apply(this, arguments);
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
          const v2 = graph.insertVertex(
            parent,
            null,
            'World!',
            200,
            150,
            80,
            30
          );
          const e1 = graph.insertEdge(parent, null, '', v1, v2);
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
        }
      }
    }
  };
}

export default ContextIcons;
