/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../../mxgraph/view/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxConnectionHandler from '../../mxgraph/handler/mxConnectionHandler';
import mxKeyHandler from '../../mxgraph/handler/mxKeyHandler';
import mxImage from '../../mxgraph/util/mxImage';
import mxUtils from '../../mxgraph/util/mxUtils';

class Permission {
  constructor(locked, createEdges, editEdges, editVertices, cloneCells) {
    this.locked = locked != null ? locked : false;
    this.createEdges = createEdges != null ? createEdges : true;
    this.editEdges = editEdges != null ? editEdges : true;
    this.editVertices = editVertices != null ? editVertices : true;
    this.cloneCells = cloneCells != null ? cloneCells : true;
  }

  apply(graph) {
    graph.setConnectable(this.createEdges);
    graph.setCellsLocked(this.locked);
  }
}

class Permissions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Permissions</h1>
        This example demonstrates creating permissions to define the available
        operations a the graph.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '300px',
            // background: "url('editors/images/grid.gif')",
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

    // Creates the div for the graph
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.overflow = 'hidden';
    container.style.left = '00px';
    container.style.top = '40px';
    container.style.right = '0px';
    container.style.bottom = '0px';
    container.style.background = 'url("editors/images/grid.gif")';

    this.el.appendChild(container);

    // Creates the graph inside the given container
    const graph = new mxGraph(container);

    // Enable tooltips, disables mutligraphs, enable loops
    graph.setMultigraph(false);
    graph.setAllowLoops(true);

    // Enables rubberband selection and key handling
    const rubberband = new mxRubberband(graph);
    const keyHandler = new mxKeyHandler(graph);

    // Assigns the delete key
    keyHandler.bindKey(46, function(evt) {
      if (graph.isEnabled()) {
        graph.removeCells();
      }
    });

    // Shared variable between child function scopes
    // aka "private" variable
    let currentPermission = null;

    const apply = function(permission) {
      graph.clearSelection();
      permission.apply(graph);
      graph.setEnabled(true);
      graph.setTooltips(true);

      // Updates the icons on the shapes - rarely
      // needed and very slow for large graphs
      graph.refresh();
      currentPermission = permission;
    };

    apply(new Permission());

    let button = mxUtils.button('Allow All', function(evt) {
      apply(new Permission());
    });
    this.el.appendChild(button);

    button = mxUtils.button('Connect Only', function(evt) {
      apply(new Permission(false, true, false, false, true));
    });
    this.el.appendChild(button);

    button = mxUtils.button('Edges Only', function(evt) {
      apply(new Permission(false, false, true, false, false));
    });
    this.el.appendChild(button);

    button = mxUtils.button('Vertices Only', function(evt) {
      apply(new Permission(false, false, false, true, false));
    });
    this.el.appendChild(button);

    button = mxUtils.button('Select Only', function(evt) {
      apply(new Permission(false, false, false, false, false));
    });
    this.el.appendChild(button);

    button = mxUtils.button('Locked', function(evt) {
      apply(new Permission(true, false));
    });
    this.el.appendChild(button);

    button = mxUtils.button('Disabled', function(evt) {
      graph.clearSelection();
      graph.setEnabled(false);
      graph.setTooltips(false);
    });
    this.el.appendChild(button);

    // Extends hook functions to use permission object. This could
    // be done by assigning the respective switches (eg.
    // setMovable), but this approach is more flexible, doesn't
    // override any existing behaviour or settings, and allows for
    // dynamic conditions to be used in the functions. See the
    // specification for more functions to extend (eg.
    // isSelectable).
    const oldDisconnectable = graph.isCellDisconnectable;
    graph.isCellDisconnectable = function(cell, terminal, source) {
      return (
        oldDisconnectable.apply(this, arguments) && currentPermission.editEdges
      );
    };

    const oldTerminalPointMovable = graph.isTerminalPointMovable;
    graph.isTerminalPointMovable = function(cell) {
      return (
        oldTerminalPointMovable.apply(this, arguments) &&
        currentPermission.editEdges
      );
    };

    const oldBendable = graph.isCellBendable;
    graph.isCellBendable = function(cell) {
      return oldBendable.apply(this, arguments) && currentPermission.editEdges;
    };

    const oldLabelMovable = graph.isLabelMovable;
    graph.isLabelMovable = function(cell) {
      return (
        oldLabelMovable.apply(this, arguments) && currentPermission.editEdges
      );
    };

    const oldMovable = graph.isCellMovable;
    graph.isCellMovable = function(cell) {
      return (
        oldMovable.apply(this, arguments) && currentPermission.editVertices
      );
    };

    const oldResizable = graph.isCellResizable;
    graph.isCellResizable = function(cell) {
      return (
        oldResizable.apply(this, arguments) && currentPermission.editVertices
      );
    };

    const oldEditable = graph.isCellEditable;
    graph.isCellEditable = function(cell) {
      return (
        (oldEditable.apply(this, arguments) &&
          this.getModel().isVertex(cell) &&
          currentPermission.editVertices) ||
        (this.getModel().isEdge(cell) && currentPermission.editEdges)
      );
    };

    const oldDeletable = graph.isCellDeletable;
    graph.isCellDeletable = function(cell) {
      return (
        (oldDeletable.apply(this, arguments) &&
          this.getModel().isVertex(cell) &&
          currentPermission.editVertices) ||
        (this.getModel().isEdge(cell) && currentPermission.editEdges)
      );
    };

    const oldCloneable = graph.isCellCloneable;
    graph.isCellCloneable = function(cell) {
      return (
        oldCloneable.apply(this, arguments) && currentPermission.cloneCells
      );
    };

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      const v2 = graph.insertVertex(parent, null, 'Hello,', 200, 20, 80, 30);
      const v3 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      const e1 = graph.insertEdge(parent, null, 'Connection', v1, v3);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Permissions;
