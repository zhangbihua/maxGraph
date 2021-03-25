/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxDragSource from '../mxgraph/util/mxDragSource';
import mxGraphModel from '../mxgraph/model/mxGraphModel';
import mxToolbar from '../mxgraph/util/mxToolbar';
import mxConnectionHandler from '../mxgraph/handler/mxConnectionHandler';
import mxImage from '../mxgraph/util/mxImage';
import mxGeometry from '../mxgraph/model/mxGeometry';
import mxCell from '../mxgraph/model/mxCell';
import mxKeyHandler from '../mxgraph/handler/mxKeyHandler';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Toolbar</h1>
        This example demonstrates using
        existing cells as templates for creating new cells.

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '400px',
            border: 'gray dotted 1px',
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
    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage(
      'images/connector.gif',
      16,
      16
    );

    // Creates the div for the toolbar
    const tbContainer = document.createElement('div');
    tbContainer.style.position = 'absolute';
    tbContainer.style.overflow = 'hidden';
    tbContainer.style.padding = '2px';
    tbContainer.style.left = '0px';
    tbContainer.style.top = '26px';
    tbContainer.style.width = '24px';
    tbContainer.style.bottom = '0px';

    this.el.appendChild(tbContainer);

    // Creates new toolbar without event processing
    const toolbar = new mxToolbar(tbContainer);
    toolbar.enabled = false;

    // Creates the div for the graph
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.overflow = 'hidden';
    container.style.left = '24px';
    container.style.top = '26px';
    container.style.right = '0px';
    container.style.bottom = '0px';
    container.style.background = 'url("editors/images/grid.gif")';

    this.el.appendChild(container);

    // Creates the model and the graph inside the container
    // using the fastest rendering available on the browser
    const model = new mxGraphModel();
    const graph = new mxGraph(container, model);
    graph.dropEnabled = true;

    // Matches DnD inside the graph
    mxDragSource.prototype.getDropTarget = function(graph, x, y) {
      let cell = graph.getCellAt(x, y);
      if (!graph.isValidDropTarget(cell)) {
        cell = null;
      }
      return cell;
    };

    // Enables new connections in the graph
    graph.setConnectable(true);
    graph.setMultigraph(false);

    // Stops editing on enter or escape keypress
    const keyHandler = new mxKeyHandler(graph);
    const rubberband = new mxRubberband(graph);

    const addVertex = (icon, w, h, style) => {
      const vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
      vertex.setVertex(true);

      this.addToolbarItem(graph, toolbar, vertex, icon);
    };

    addVertex(
      'editors/images/swimlane.gif',
      120,
      160,
      'shape=swimlane;startSize=20;'
    );
    addVertex('editors/images/rectangle.gif', 100, 40, '');
    addVertex('editors/images/rounded.gif', 100, 40, 'shape=rounded');
    addVertex('editors/images/ellipse.gif', 40, 40, 'shape=ellipse');
    addVertex('editors/images/rhombus.gif', 40, 40, 'shape=rhombus');
    addVertex('editors/images/triangle.gif', 40, 40, 'shape=triangle');
    addVertex('editors/images/cylinder.gif', 40, 40, 'shape=cylinder');
    addVertex('editors/images/actor.gif', 30, 40, 'shape=actor');
    toolbar.addLine();

    const button = mxUtils.button(
      'Create toolbar entry from selection',
      evt => {
        if (!graph.isSelectionEmpty()) {
          // Creates a copy of the selection array to preserve its state
          const cells = graph.getSelectionCells();
          const bounds = graph.getView().getBounds(cells);

          // Function that is executed when the image is dropped on
          // the graph. The cell argument points to the cell under
          // the mousepointer if there is one.
          const funct = (graph, evt, cell) => {
            graph.stopEditing(false);

            const pt = graph.getPointForEvent(evt);
            const dx = pt.x - bounds.x;
            const dy = pt.y - bounds.y;

            graph.setSelectionCells(graph.importCells(cells, dx, dy, cell));
          };

          // Creates the image which is used as the drag icon (preview)
          const img = toolbar.addMode(
            null,
            'editors/images/outline.gif',
            funct
          );
          mxUtils.makeDraggable(img, graph, funct);
        }
      }
    );

    this.el2.appendChild(button);
  }

  addToolbarItem(graph, toolbar, prototype, image) {
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    const funct = (graph, evt, cell) => {
      graph.stopEditing(false);

      const pt = graph.getPointForEvent(evt);
      const vertex = graph.getModel().cloneCell(prototype);
      vertex.geometry.x = pt.x;
      vertex.geometry.y = pt.y;

      graph.setSelectionCells(graph.importCells([vertex], 0, 0, cell));
    };

    // Creates the image which is used as the drag icon (preview)
    const img = toolbar.addMode(null, image, funct);
    mxUtils.makeDraggable(img, graph, funct);
  }
}

export default Toolbar;
