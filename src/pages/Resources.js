/**
 * Copyright (c) 2006-2018, JGraph Ltd
  
  Resources example for mxGraph. This example demonstrates disabling the Synchronous
  XMLHttpRequest on main thread warning.
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
        <h1>Resources example for mxGraph</h1>

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
        // Async indirection to load resources asynchronously (see above)
        // Alternatively you can remove the line that sets mxLoadResources
        // anove and change the code to not use this callback.
        mxClient.loadResources(function()
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
            var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
            var e1 = graph.insertEdge(parent, null, '', v1, v2);
          }
          finally
          {
            // Updates the display
            graph.getModel().endUpdate();
          }
        });
      }
    };
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
