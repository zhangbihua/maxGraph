/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  JSON data example for mxGraph. This example demonstrates using
  JSON to encode/decode parts of the graph model in mxCodec.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';

class MYNAMEHERE extends React.Component {
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

          }}
        />
      </>
    );
  };

  componentDidMount() {

  };
}

export default MYNAMEHERE;


<html>
<head>
  <title></title>

  <!-- Sets the basepath for the library if not in same directory -->
  <script type="text/javascript">
    mxBasePath = '../src';
  </script>

  <!-- Loads and initializes the library -->
  <script type="text/javascript" src="../src/js/mxClient.js"></script>

  <!-- Example code -->
  <script type="text/javascript">
    // Program starts here. Creates a sample graph in the
    // DOM node with the specified ID. This function is invoked
    // from the onLoad event handler of the document (see below).
    function main(container)
    {
      // Checks if the browser is supported
      if (!mxClient.isBrowserSupported())
      {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
      }
      else
      {
        // Disables the built-in context menu
        mxEvent.disableContextMenu(container);

        // Creates the graph inside the given container
        let graph = new mxGraph(container);

        // Enables rubberband selection
        new mxRubberband(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
          var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
          v1.data = new CustomData('v1');
          var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
          v2.data = new CustomData('v2');
          var e1 = graph.insertEdge(parent, null, '', v1, v2);
        }
        finally
        {
          // Updates the display
          graph.getModel().endUpdate();
        }
      }

      // Adds an option to view the XML of the graph
      document.body.appendChild(mxUtils.button('View XML', function()
      {
        let encoder = new mxCodec();
        let node = encoder.encode(graph.getModel());
        mxUtils.popup(mxUtils.getXml(node), true);
      }));
    };

    function CustomData(value)
    {
      this.value = value;
    }

    let codec = new mxObjectCodec(new CustomData());

    codec.encode = function(enc, obj)
    {
      let node = enc.document.createElement('CustomData');
      mxUtils.setTextContent(node, JSON.stringify(obj));

      return node;
    };

    codec.decode = function(dec, node, into)
    {
      let obj = JSON.parse(mxUtils.getTextContent(node));
      obj.constructor = CustomData;

      return obj;
    };

    mxCodecRegistry.register(codec);
  </script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer"
    style="position:relative;overflow:hidden;width:321px;height:241px;background:url('editors/images/grid.gif');cursor:default;">
  </div>
</body>
</html>
