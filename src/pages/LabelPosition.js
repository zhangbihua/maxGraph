/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Label Position example for mxGraph. This example demonstrates the use of the
  label position styles to set the position of vertex labels.
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
        <h1>Label Position example for mxGraph</h1>

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

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();

        // Defines the common part of all cell styles as a string-prefix
        let prefix = 'shape=image;image=images/icons48/keys.png;';

        // Adds cells to the model in a single step and set the vertex
        // label positions using the label position styles. Vertical
        // and horizontal label position styles can be combined.
        // Note: Alternatively, vertex labels can be set be overriding
        // mxCellRenderer.getLabelBounds.
        graph.getModel().beginUpdate();
        try
        {
          graph.insertVertex(parent, null, 'Bottom', 60, 60, 60, 60,
            prefix+'verticalLabelPosition=bottom;verticalAlign=top');
          graph.insertVertex(parent, null, 'Top', 140, 60, 60, 60,
              prefix+'verticalLabelPosition=top;verticalAlign=bottom');
          graph.insertVertex(parent, null, 'Left', 60, 160, 60, 60,
              prefix+'labelPosition=left;align=right');
          graph.insertVertex(parent, null, 'Right', 140, 160, 60, 60,
              prefix+'labelPosition=right;align=left');
        }
        finally
        {
          // Updates the display
          graph.getModel().endUpdate();
        }
      }
    };
  </script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer"
    style="overflow:hidden;position:absolute;width:100%;height:100%;">
  </div>
</body>
</html>
