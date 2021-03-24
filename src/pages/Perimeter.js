/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Perimeter example for mxGraph. This example demonstrates how to
  avoid edge and label intersections.
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
        <h1>Perimeter example for mxGraph</h1>

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
        // Redirects the perimeter to the label bounds if intersection
        // between edge and label is found
        mxGraphViewGetPerimeterPoint = mxGraphView.prototype.getPerimeterPoint;
        mxGraphView.prototype.getPerimeterPoint = function(terminal, next, orthogonal, border)
        {
          let point = mxGraphViewGetPerimeterPoint.apply(this, arguments);

          if (point != null)
          {
            let perimeter = this.getPerimeterFunction(terminal);

            if (terminal.text != null && terminal.text.boundingBox != null)
            {
              // Adds a small border to the label bounds
              let b = terminal.text.boundingBox.clone();
              b.grow(3)

              if (mxUtils.rectangleIntersectsSegment(b, point, next))
              {
                point = perimeter(b, terminal, next, orthogonal);
              }
            }
          }

          return point;
        };

        // Creates the graph inside the given container
        let graph = new mxGraph(container);
        graph.setVertexLabelsMovable(true);
        graph.setConnectable(true);

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
          var v1 = graph.insertVertex(parent, null, 'Label', 20, 20, 80, 30, 'verticalLabelPosition=bottom');
          var v2 = graph.insertVertex(parent, null, 'Label', 200, 20, 80, 30, 'verticalLabelPosition=bottom');
          var v3 = graph.insertVertex(parent, null, 'Label', 20, 150, 80, 30, 'verticalLabelPosition=bottom');
          var e1 = graph.insertEdge(parent, null, '', v1, v2);
          var e1 = graph.insertEdge(parent, null, '', v1, v3);
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
    style="overflow:hidden;position:relative;width:321px;height:241px;background:url('editors/images/grid.gif');cursor:default;">
  </div>
</body>
</html>
