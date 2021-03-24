/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Standardsmode example for mxGraph. This example demonstrates using a DOCTYPE with
  mxGraph. (The first line is required for this to use VML in all IE versions.)
  
  To use the DOCTYPE and SVG in IE9, replace the content attribute of the first line
  with IE=5,IE=9.
  
  To use IE7 standards mode in IE 7,8 and 9, replace IE=5 with IE=7.
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
        <h1>Standardsmode example for mxGraph</h1>

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
        // Creates the graph inside the given container
        let graph = new mxGraph(container);

        // Uncomment the following if you want the container
        // to fit the size of the graph
        //graph.setResizeContainer(true);

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
          var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
          var e1 = graph.insertEdge(parent, null, '', v1, v2);
        }
        finally
        {
          // Updates the display
          graph.getModel().endUpdate();
        }

        // Prints the rendering mode and display dialect (VML or SVG) in use
        // CSS1Compat means standard
        mxLog.show();
        let mode = (document.compatMode == 'CSS1Compat') ? 'standards' : 'quirks';
        let disp = (mxClient.IS_SVG) ? 'svg' : 'vml';
        mxLog.debug(mode + ' ' + disp);
      }
    };
  </script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer"
    style="overflow:hidden;width:321px;height:241px;background:url('editors/images/grid.gif');cursor:default;position:relative;">
  </div>
  <br>
  See also:<br>
  <a href="ie9svg.html">IE9SVG</a><br>
  <a href="../../docs/known-issues.html#Doctypes">docs/known-issues.html#Doctypes</a><br>
  <a href="../../docs/known-issues.html#IE9">docs/known-issues.html#IE9</a>
</body>
</html>
