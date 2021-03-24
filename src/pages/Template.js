/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Template example for mxGraph. This is used as a template HTML file by the
  backends to demonstrate the deployment of the client with a graph embedded
  in the page as XML data (see graph variable in the onload-handler).
  
  *** THIS FILE MUST BE DEPLOYED BY ONE OF THE BACKENDS! ***
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
        <h1>Hello, World!</h1>

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


    function main(container, xml)
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

        // Adds rubberband selection to the graph
        new mxRubberband(graph);

        let doc = mxUtils.parseXml(xml);
        let codec = new mxCodec(doc);
        codec.decode(doc.documentElement, graph.getModel());
      }
    };
  </script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'), '%graph%');">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer" style="overflow:hidden;position:relative;width:321px;height:241px;background:url('/mxgraph/javascript/examples/editors/images/grid.gif');cursor:default;">
  </div>
</body>
</html>
