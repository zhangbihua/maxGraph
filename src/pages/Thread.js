/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Thread example for mxGraph. This example demonstrates setting
  overlays in mxGraph from within a timed function.
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
        <h1>Thread example for mxGraph</h1>

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
      // Checks if browser is supported
      if (!mxClient.isBrowserSupported())
      {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
      }
      else
      {
        // Creates the graph inside the given container
        let graph = new mxGraph(container);

        // Disables basic selection and cell handling
        graph.setEnabled(false);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();
        var v1, v2, e1;

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
          v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
          v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
          e1 = graph.insertEdge(parent, null, '', v1, v2);
        }
        finally
        {
          // Updates the display
          graph.getModel().endUpdate();
        }

        // Function to switch the overlay every 5 secs
        let f = function()
        {
          let overlays = graph.getCellOverlays(v1);

          if (overlays == null)
          {
            graph.removeCellOverlays(v2);
            graph.setCellWarning(v1, 'Tooltip');
          }
          else
          {
            graph.removeCellOverlays(v1);
            graph.setCellWarning(v2, 'Tooltip');
          }
        };

        window.setInterval(f, 1000);
        f();
      }
    };
  </script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer"
    style="overflow:hidden;width:321px;height:241px;background:url('editors/images/grid.gif')">
  </div>
</body>
</html>
