/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Label Position example for mxGraph. This example demonstrates the use of the
  label position styles to set the position of vertex labels.
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';

class LabelPosition extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Label Position example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '300px',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Defines the common part of all cell styles as a string-prefix
    const prefix = 'shape=image;image=images/icons48/keys.png;';

    // Adds cells to the model in a single step and set the vertex
    // label positions using the label position styles. Vertical
    // and horizontal label position styles can be combined.
    // Note: Alternatively, vertex labels can be set be overriding
    // mxCellRenderer.getLabelBounds.
    graph.getModel().beginUpdate();
    try {
      graph.insertVertex(
        parent,
        null,
        'Bottom',
        60,
        60,
        60,
        60,
        `${prefix}verticalLabelPosition=bottom;verticalAlign=top`
      );
      graph.insertVertex(
        parent,
        null,
        'Top',
        140,
        60,
        60,
        60,
        `${prefix}verticalLabelPosition=top;verticalAlign=bottom`
      );
      graph.insertVertex(
        parent,
        null,
        'Left',
        60,
        160,
        60,
        60,
        `${prefix}labelPosition=left;align=right`
      );
      graph.insertVertex(
        parent,
        null,
        'Right',
        140,
        160,
        60,
        60,
        `${prefix}labelPosition=right;align=left`
      );
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default LabelPosition;
