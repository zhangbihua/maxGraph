/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Overlays example for mxGraph. This example demonstrates cell
  highlighting, overlays and handling click and double click
  events. See also: events.html for more event handling.
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
        <h1>Overlays example for mxGraph</h1>

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

        // Highlights the vertices when the mouse enters
        let highlight = new mxCellTracker(graph, '#00FF00');

        // Enables tooltips for the overlays
        graph.setTooltips(true);

        // Installs a handler for click events in the graph
        // that toggles the overlay for the respective cell
        graph.addListener(mxEvent.CLICK, function(sender, evt)
        {
          let cell = evt.getProperty('cell');

          if (cell != null)
          {
            let overlays = graph.getCellOverlays(cell);

            if (overlays == null)
            {
              // Creates a new overlay with an image and a tooltip
              let overlay = new mxCellOverlay(
                new mxImage('editors/images/overlays/check.png', 16, 16),
                'Overlay tooltip');

              // Installs a handler for clicks on the overlay
              overlay.addListener(mxEvent.CLICK, function(sender, evt2)
              {
                mxUtils.alert('Overlay clicked');
              });

              // Sets the overlay for the cell in the graph
              graph.addCellOverlay(cell, overlay);
            }
            else
            {
              graph.removeCellOverlays(cell);
            }
          }
        });

        // Installs a handler for double click events in the graph
        // that shows an alert box
        graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt)
        {
          let cell = evt.getProperty('cell');
          mxUtils.alert('Doubleclick: '+((cell != null) ? 'Cell' : 'Graph'));
          evt.consume();
        });

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
          var v1 = graph.insertVertex(parent, null, 'Click,', 20, 20, 60, 40);
          var v2 = graph.insertVertex(parent, null, 'Doubleclick', 200, 150, 100, 40);
          var e1 = graph.insertEdge(parent, null, '', v1, v2);
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
    style="overflow:hidden;position:relative;width:321px;height:241px;background:url('editors/images/grid.gif')">
  </div>
</body>
</html>
