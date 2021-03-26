/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';

class Wrapping extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Wrapping</h1>
        This example demonstrates using HTML markup and word-wrapping in vertex
        and edge labels.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
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
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Enables HTML labels as wrapping is only available for those
    graph.setHtmlLabels(true);

    // Disables in-place editing for edges
    graph.isCellEditable = function(cell) {
      return !this.model.isEdge(cell);
    };

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(
        parent,
        null,
        'Cum Caesar vidisset, portum plenum esse, iuxta navigavit.',
        20,
        20,
        100,
        70,
        'whiteSpace=wrap;'
      );
      const v2 = graph.insertVertex(
        parent,
        null,
        'Cum Caesar vidisset, portum plenum esse, iuxta navigavit.',
        220,
        150,
        80,
        70,
        'whiteSpace=wrap;'
      );
      const e1 = graph.insertEdge(
        parent,
        null,
        'Cum Caesar vidisset, portum plenum esse, iuxta navigavit.',
        v1,
        v2,
        'whiteSpace=wrap;'
      );
      e1.geometry.width = 100;
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Wrapping;
