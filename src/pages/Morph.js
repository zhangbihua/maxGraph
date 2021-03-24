/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Morph example for mxGraph. This example demonstrates using
  mxMorphing for simple cell animations.
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
        <h1>Hello, World! example for mxGraph</h1>

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
        var v1, v2;
        try
        {
          v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
          var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
          var e1 = graph.insertEdge(parent, null, '', v1, v2);
        }
        finally
        {
          // Updates the display
          graph.getModel().endUpdate();
        }

        let mult = 1;

        document.body.appendChild(mxUtils.button('Morph', function()
        {
          graph.clearSelection();

          graph.getModel().beginUpdate();
          try
          {
            let geo = graph.getCellGeometry(v1);
            geo = geo.clone();
            geo.x += 180 * mult;
            graph.getModel().setGeometry(v1, geo);

            let geo = graph.getCellGeometry(v2);
            geo = geo.clone();
            geo.x -= 180 * mult;
            graph.getModel().setGeometry(v2, geo);
          }
          finally
          {
            // Arguments are number of steps, ease and delay
            let morph = new mxMorphing(graph, 20, 1.2, 20);
            morph.addListener(mxEvent.DONE, function()
            {
              graph.getModel().endUpdate();
            });
            morph.startAnimation();
          }

          mult *= -1;
        }));
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
