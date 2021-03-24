/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  FixedIcon example for mxGraph. This example demonstrates
  customizing the icon position in the mxLabel shape.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';

class MYNAMEHERE extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Fixed icon example for mxGraph</h1>

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

  componentDidMount = () => {

  };
}

export default MYNAMEHERE;


    // Overrides the image bounds code to change the position
    mxLabel.prototype.getImageBounds = function(x, y, w, h)
    {
      let iw = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_WIDTH, mxConstants.DEFAULT_IMAGESIZE);
      let ih = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_HEIGHT, mxConstants.DEFAULT_IMAGESIZE);

      // Places the icon
      let ix = (w - iw) / 2;
      let iy = h - ih;

      return new mxRectangle(x + ix, y + iy, iw, ih);
    };

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
        // Makes the shadow brighter
        mxConstants.SHADOWCOLOR = '#C0C0C0';

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
          var v1 = graph.insertVertex(parent, null, 'Fixed icon', 20, 20, 80, 50,
            'shape=label;image=images/plus.png;imageWidth=16;imageHeight=16;spacingBottom=10;' +
            'fillColor=#adc5ff;gradientColor=#7d85df;glass=1;rounded=1;shadow=1;');
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
