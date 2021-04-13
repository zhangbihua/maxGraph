/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxShape from '../../mxgraph/shape/mxShape';
import mxConnectionConstraint from '../../mxgraph/view/connection/mxConnectionConstraint';
import mxPoint from '../../mxgraph/util/datatypes/mxPoint';
import mxPolyline from '../../mxgraph/shape/edge/mxPolyline';
import mxCellState from '../../mxgraph/view/cell/mxCellState';
import mxGeometry from '../../mxgraph/util/datatypes/mxGeometry';
import mxConnectionHandler from '../../mxgraph/handler/mxConnectionHandler';

class Anchors extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Anchors</h1>
        This example demonstrates defining fixed connection points for all
        shapes.
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

    class MyCustomConnectionHandler extends mxConnectionHandler {
      // Enables connect preview for the default edge style
      createEdgeState(me) {
        const edge = graph.createEdge(null, null, null, null, null);
        return new mxCellState(
          this.graph.view,
          edge,
          this.graph.getCellStyle(edge)
        );
      }
    }

    class MyCustomGraph extends mxGraph {
      getAllConnectionConstraints(terminal, source) {
        // Overridden to define per-shape connection points
        if (terminal != null && terminal.shape != null) {
          if (terminal.shape.stencil != null) {
            if (terminal.shape.stencil.constraints != null) {
              return terminal.shape.stencil.constraints;
            }
          } else if (terminal.shape.constraints != null) {
            return terminal.shape.constraints;
          }
        }
        return null;
      }

      createConnectionHandler() {
        return new MyCustomConnectionHandler(this);
      }
    }

    class MyCustomGeometryClass extends mxGeometry {
      // Defines the default constraints for the vertices
      constraints = [
        new mxConnectionConstraint(new mxPoint(0.25, 0), true),
        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
        new mxConnectionConstraint(new mxPoint(0.75, 0), true),
        new mxConnectionConstraint(new mxPoint(0, 0.25), true),
        new mxConnectionConstraint(new mxPoint(0, 0.5), true),
        new mxConnectionConstraint(new mxPoint(0, 0.75), true),
        new mxConnectionConstraint(new mxPoint(1, 0.25), true),
        new mxConnectionConstraint(new mxPoint(1, 0.5), true),
        new mxConnectionConstraint(new mxPoint(1, 0.75), true),
        new mxConnectionConstraint(new mxPoint(0.25, 1), true),
        new mxConnectionConstraint(new mxPoint(0.5, 1), true),
        new mxConnectionConstraint(new mxPoint(0.75, 1), true),
      ];
    }

    // Edges have no connection points
    mxPolyline.prototype.constraints = null;

    // Creates the graph inside the given container
    const graph = new MyCustomGraph(this.el);
    graph.setConnectable(true);

    // Specifies the default edge style
    graph.getStylesheet().getDefaultEdgeStyle().edgeStyle =
      'orthogonalEdgeStyle';

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.batchUpdate(() => {
      const v1 = graph.insertVertex({
        parent,
        value: 'Hello,',
        position: [20, 20],
        size: [80, 30],
        geometryClass: MyCustomGeometryClass,
      });
      const v2 = graph.insertVertex({
        parent,
        value: 'World!',
        position: [200, 150],
        size: [80, 30],
        geometryClass: MyCustomGeometryClass,
      });
      const e1 = graph.insertEdge({
        parent,
        value: '',
        position: v1,
        size: v2,
      });
    });
  }
}

export default Anchors;
