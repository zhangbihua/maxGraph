/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxClient from '../../mxgraph/mxClient';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxMultiplicity from '../../mxgraph/view/connection/mxMultiplicity';
import mxKeyHandler from '../../mxgraph/handler/mxKeyHandler';

class Validation extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Validation</h1>
        This example demonstrates using multiplicities for automatically
        validating a graph.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '281px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    const xmlDocument = mxUtils.createXmlDocument();
    const sourceNode = xmlDocument.createElement('Source');
    const targetNode = xmlDocument.createElement('Target');
    const subtargetNode = xmlDocument.createElement('Subtarget');

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setConnectable(true);
    graph.setTooltips(true);
    graph.setAllowDanglingEdges(false);
    graph.setMultigraph(false);

    // Source nodes needs 1..2 connected Targets
    graph.multiplicities.push(
      new mxMultiplicity(
        true,
        'Source',
        null,
        null,
        1,
        2,
        ['Target'],
        'Source Must Have 1 or 2 Targets',
        'Source Must Connect to Target'
      )
    );

    // Source node does not want any incoming connections
    graph.multiplicities.push(
      new mxMultiplicity(
        false,
        'Source',
        null,
        null,
        0,
        0,
        null,
        'Source Must Have No Incoming Edge',
        null
      )
    ); // Type does not matter

    // Target needs exactly one incoming connection from Source
    graph.multiplicities.push(
      new mxMultiplicity(
        false,
        'Target',
        null,
        null,
        1,
        1,
        ['Source'],
        'Target Must Have 1 Source',
        'Target Must Connect From Source'
      )
    );

    // Enables rubberband selection
    new mxRubberband(graph);

    // Removes cells when [DELETE] is pressed
    const keyHandler = new mxKeyHandler(graph);
    keyHandler.bindKey(46, function(evt) {
      if (graph.isEnabled()) {
        graph.removeCells();
      }
    });

    // Installs automatic validation (use editor.validation = true
    // if you are using an mxEditor instance)
    const listener = function(sender, evt) {
      graph.validateGraph();
    };

    graph.getModel().addListener(mxEvent.CHANGE, listener);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, sourceNode, 20, 20, 80, 30);
      const v2 = graph.insertVertex(parent, null, targetNode, 200, 20, 80, 30);
      const v3 = graph.insertVertex({
        parent,
        value: targetNode.cloneNode(true),
        position: [200, 80],
        size: [80, 30],
      });
      const v4 = graph.insertVertex(
        parent,
        null,
        targetNode.cloneNode(true),
        200,
        140,
        80,
        30
      );
      const v5 = graph.insertVertex(
        parent,
        null,
        subtargetNode,
        200,
        200,
        80,
        30
      );
      const v6 = graph.insertVertex(
        parent,
        null,
        sourceNode.cloneNode(true),
        20,
        140,
        80,
        30
      );
      const e1 = graph.insertEdge(parent, null, '', v1, v2);
      const e2 = graph.insertEdge(parent, null, '', v1, v3);
      const e3 = graph.insertEdge(parent, null, '', v6, v4);
      // var e4 = graph.insertEdge(parent, null, '', v1, v4);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Validation;
