/**
 * Copyright (c) 2006-2017, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxPoint from '../mxgraph/util/mxPoint';

class Animation extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Animation</h1>
        This example demonstrates using SVG animations on edges to visualize the
        flow in a pipe.
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
  };

  componentDidMount() {
    const graph = new mxGraph(this.el);
    graph.setEnabled(false);
    const parent = graph.getDefaultParent();

    const vertexStyle =
      'shape=cylinder;strokeWidth=2;fillColor=#ffffff;strokeColor=black;' +
      'gradientColor=#a0a0a0;fontColor=black;fontStyle=1;spacingTop=14;';

    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex({
        parent,
        value: 'Pump',
        position: [20, 20],
        size: [60, 60],
        style: vertexStyle,
      });
      const v2 = graph.insertVertex({
        parent,
        value: 'Tank',
        position: [200, 150],
        size: [60, 60],
        style: vertexStyle,
      });
      var e1 = graph.insertEdge({
        parent,
        source: v1,
        target: v2,
        style:
          'strokeWidth=3;endArrow=block;endSize=2;endFill=1;strokeColor=black;rounded=1;',
      });
      e1.geometry.points = [new mxPoint(230, 50)];
      graph.orderCells(true, [e1]);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    // Adds animation to edge shape and makes "pipe" visible
    const state = graph.view.getState(e1);
    state.shape.node
      .getElementsByTagName('path')[0]
      .removeAttribute('visibility');
    state.shape.node
      .getElementsByTagName('path')[0]
      .setAttribute('stroke-width', '6');
    state.shape.node
      .getElementsByTagName('path')[0]
      .setAttribute('stroke', 'lightGray');
    state.shape.node
      .getElementsByTagName('path')[1]
      .setAttribute('class', 'flow');
  };
}

export default Animation;
