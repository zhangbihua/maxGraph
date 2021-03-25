/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxMorphing from '../mxgraph/util/mxMorphing';
import mxUtils from '../mxgraph/util/mxUtils';

class Morph extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Morph</h1>
        This example demonstrates using
        mxMorphing for simple cell animations.

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
        <div
          ref={el => {
            this.el2 = el;
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.el);

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    let v1;
    var v2;
    try {
      v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      const e1 = graph.insertEdge(parent, null, '', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    let mult = 1;

    this.el2.appendChild(
      mxUtils.button('Morph', function() {
        graph.clearSelection();

        graph.getModel().beginUpdate();
        try {
          let geo = graph.getCellGeometry(v1);
          geo = geo.clone();
          geo.x += 180 * mult;
          graph.getModel().setGeometry(v1, geo);

          geo = graph.getCellGeometry(v2);
          geo = geo.clone();
          geo.x -= 180 * mult;
          graph.getModel().setGeometry(v2, geo);
        } finally {
          // Arguments are number of steps, ease and delay
          const morph = new mxMorphing(graph, 20, 1.2, 20);
          morph.addListener(mxEvent.DONE, function() {
            graph.getModel().endUpdate();
          });
          morph.startAnimation();
        }

        mult *= -1;
      })
    );
  }
}

export default Morph;
