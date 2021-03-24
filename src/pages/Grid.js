<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=5,IE=9" ><![endif]-->
<!DOCTYPE html>
/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Grid example for mxGraph. This example demonstrates drawing
  a grid dynamically using HTML 5 canvas.
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
        <h1>Grid example for mxGraph</h1>

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
        mxEvent.disableContextMenu(document.body);

        // Creates the graph inside the given container
        let graph = new mxGraph(container);
        graph.graphHandler.scaleGrid = true;
        graph.setPanning(true);

        // Enables rubberband selection
        new mxRubberband(graph);

        // Create grid dynamically (requires canvas)
        (function()
        {
          try
          {
            let canvas = document.createElement('canvas');
            canvas.style.position = 'absolute';
            canvas.style.top = '0px';
            canvas.style.left = '0px';
            canvas.style.zIndex = -1;
            graph.container.appendChild(canvas);

            let ctx = canvas.getContext('2d');

            // Modify event filtering to accept canvas as container
            let mxGraphViewIsContainerEvent = mxGraphView.prototype.isContainerEvent;
            mxGraphView.prototype.isContainerEvent = function(evt)
            {
              return mxGraphViewIsContainerEvent.apply(this, arguments) ||
                mxEvent.getSource(evt) == canvas;
            };

            let s = 0;
            let gs = 0;
            let tr = new mxPoint();
            let w = 0;
            let h = 0;

            function repaintGrid()
            {
              if (ctx != null)
              {
                let bounds = graph.getGraphBounds();
                let width = Math.max(bounds.x + bounds.width, graph.container.clientWidth);
                let height = Math.max(bounds.y + bounds.height, graph.container.clientHeight);
                let sizeChanged = width != w || height != h;

                if (graph.view.scale != s || graph.view.translate.x != tr.x || graph.view.translate.y != tr.y ||
                  gs != graph.gridSize || sizeChanged)
                {
                  tr = graph.view.translate.clone();
                  s = graph.view.scale;
                  gs = graph.gridSize;
                  w = width;
                  h = height;

                  // Clears the background if required
                  if (!sizeChanged)
                  {
                    ctx.clearRect(0, 0, w, h);
                  }
                  else
                  {
                    canvas.setAttribute('width', w);
                    canvas.setAttribute('height', h);
                  }

                  let tx = tr.x * s;
                  let ty = tr.y * s;

                  // Sets the distance of the grid lines in pixels
                  let minStepping = graph.gridSize;
                  let stepping = minStepping * s;

                  if (stepping < minStepping)
                  {
                    let count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
                    stepping = count * stepping;
                  }

                  let xs = Math.floor((0 - tx) / stepping) * stepping + tx;
                  let xe = Math.ceil(w / stepping) * stepping;
                  let ys = Math.floor((0 - ty) / stepping) * stepping + ty;
                  let ye = Math.ceil(h / stepping) * stepping;

                  xe += Math.ceil(stepping);
                  ye += Math.ceil(stepping);

                  let ixs = Math.round(xs);
                  let ixe = Math.round(xe);
                  let iys = Math.round(ys);
                  let iye = Math.round(ye);

                  // Draws the actual grid
                  ctx.strokeStyle = '#f6f6f6';
                  ctx.beginPath();

                  for (let x = xs; x <= xe; x += stepping)
                  {
                    x = Math.round((x - tx) / stepping) * stepping + tx;
                    let ix = Math.round(x);

                    ctx.moveTo(ix + 0.5, iys + 0.5);
                    ctx.lineTo(ix + 0.5, iye + 0.5);
                  }

                  for (let y = ys; y <= ye; y += stepping)
                  {
                    y = Math.round((y - ty) / stepping) * stepping + ty;
                    let iy = Math.round(y);

                    ctx.moveTo(ixs + 0.5, iy + 0.5);
                    ctx.lineTo(ixe + 0.5, iy + 0.5);
                  }

                  ctx.closePath();
                  ctx.stroke();
                }
              }
            };
          }
          catch (e)
          {
            mxLog.show();
            mxLog.debug('Using background image');

            container.style.backgroundImage = 'url(\'editors/images/grid.gif\')';
          }

          let mxGraphViewValidateBackground = mxGraphView.prototype.validateBackground;
          mxGraphView.prototype.validateBackground = function()
          {
            mxGraphViewValidateBackground.apply(this, arguments);
            repaintGrid();
          };
        })();


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

        graph.centerZoom = false;

        document.body.appendChild(mxUtils.button('+', function()
        {
          graph.zoomIn();
        }));

        document.body.appendChild(mxUtils.button('-', function()
        {
          graph.zoomOut();
        }));
      }
    };
  </script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer"
    style="overflow:hidden;width:641px;height:481px;cursor:default;">
  </div>
</body>
</html>
