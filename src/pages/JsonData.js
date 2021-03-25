/**
 * Copyright (c) 2006-2013, JGraph Ltd

 JSON data example for mxGraph. This example demonstrates using
 JSON to encode/decode parts of the graph model in mxCodec.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxCodecRegistry from '../mxgraph/io/mxCodecRegistry';
import mxObjectCodec from '../mxgraph/io/mxObjectCodec';
import mxUtils from '../mxgraph/util/mxUtils';
import mxCodec from '../mxgraph/io/mxCodec';

class JsonData extends React.Component {
  // Adds an option to view the XML of the graph
  document;

  body;

  'View XML';

  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>JSON data example for mxGraph</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '321px',
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
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      v1.data = new CustomData('v1');
      const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      v2.data = new CustomData('v2');
      const e1 = graph.insertEdge(parent, null, '', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    this.el2.appendChild(
      mxUtils.button(function() {
        const encoder = new mxCodec();
        const node = encoder.encode(graph.getModel());
        mxUtils.popup(mxUtils.getXml(node), true);
      })
    );

    function CustomData(value) {
      this.value = value;
    }

    const codec = new mxObjectCodec(new CustomData());
    codec.encode = function(enc, obj) {
      const node = enc.document.createElement('CustomData');
      mxUtils.setTextContent(node, JSON.stringify(obj));

      return node;
    };
    codec.decode = function(dec, node, into) {
      const obj = JSON.parse(mxUtils.getTextContent(node));
      obj.constructor = CustomData;

      return obj;
    };
    mxCodecRegistry.register(codec);
  }
}

export default JsonData;
