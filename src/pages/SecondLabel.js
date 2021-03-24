/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Second label example for mxGraph. This example demonstrates how to
  add another string label to vertices.
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
        <h1>Second label example for mxGraph</h1>

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

    // Simple solution to add additional text to the rectangle shape definition:
    (function()
    {
      let mxRectangleShapeIsHtmlAllowed = mxRectangleShape.prototype.isHtmlAllowed;
      mxRectangleShape.prototype.isHtmlAllowed = function()
      {
        return mxRectangleShapeIsHtmlAllowed.apply(this, arguments) && this.state == null;
      };

      mxRectangleShapePaintForeground = mxRectangleShape.prototype.paintForeground;
      mxRectangleShape.prototype.paintForeground = function(c, x, y, w, h)
      {
        if (this.state != null && this.state.cell.geometry != null && !this.state.cell.geometry.relative)
        {
          c.setFontColor('#a0a0a0');
          c.text(x + 2, y, 0, 0, this.state.cell.id, 'left', 'top');
        }

        mxRectangleShapePaintForeground.apply(this, arguments);
      };
    })();

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
        // Creates the graph inside the given container
        let graph = new mxGraph(container);

        // Disables the folding icon
        graph.isCellFoldable = function(cell)
        {
          return false;
        }

        let secondLabelVisible = true;

        // Hook for returning shape number for a given cell
        graph.getSecondLabel = function(cell)
        {
          if (!this.model.isEdge(cell))
          {
            // Possible to return any string here
            return 'The ID of this cell is ' + cell.id;
          }

          return null;
        };

        let relativeChildVerticesVisible = true;

        // Overrides method to hide relative child vertices
        graph.isCellVisible = function(cell)
        {
          return !this.model.isVertex(cell) || cell.geometry == null ||
            !cell.geometry.relative ||
            cell.geometry.relative == relativeChildVerticesVisible;
        };

        // Creates the shape for the shape number and puts it into the draw pane
        let redrawShape = graph.cellRenderer.redrawShape;
        graph.cellRenderer.redrawShape = function(state, force, rendering)
        {
          let result = redrawShape.apply(this, arguments);

          if (result && secondLabelVisible && state.cell.geometry != null && !state.cell.geometry.relative)
          {
            let secondLabel = graph.getSecondLabel(state.cell);

            if (secondLabel != null && state.shape != null && state.secondLabel == null)
            {
              state.secondLabel = new mxText(secondLabel, new mxRectangle(),
                  mxConstants.ALIGN_LEFT, mxConstants.ALIGN_BOTTOM);

              // Styles the label
              state.secondLabel.color = 'black';
              state.secondLabel.family = 'Verdana';
              state.secondLabel.size = 8;
              state.secondLabel.fontStyle = mxConstants.FONT_ITALIC;
              state.secondLabel.background = 'yellow';
              state.secondLabel.border = 'black';
              state.secondLabel.valign = 'bottom';
              state.secondLabel.dialect = state.shape.dialect;
              state.secondLabel.dialect = mxConstants.DIALECT_STRICTHTML;
              state.secondLabel.wrap = true;
              graph.cellRenderer.initializeLabel(state, state.secondLabel);
            }
          }

          if (state.secondLabel != null)
          {
            let scale = graph.getView().getScale();
            let bounds = new mxRectangle(state.x + state.width - 8 * scale, state.y + 8 * scale, 35, 0);
            state.secondLabel.state = state;
            state.secondLabel.value = graph.getSecondLabel(state.cell);
            state.secondLabel.scale = scale;
            state.secondLabel.bounds = bounds;
            state.secondLabel.redraw();
          }

          return result;
        };

        // Destroys the shape number
        let destroy = graph.cellRenderer.destroy;
        graph.cellRenderer.destroy = function(state)
        {
          destroy.apply(this, arguments);

          if (state.secondLabel != null)
          {
            state.secondLabel.destroy();
            state.secondLabel = null;
          }
        };

        graph.cellRenderer.getShapesForState = function(state)
        {
          return [state.shape, state.text, state.secondLabel, state.control];
        };

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
          var v1 = graph.insertVertex(parent, null, 'Hello,', 30, 40, 80, 30);
          // Alternative solution of creating a second label by creating a realtive child vertex
          // with size (0, 0). This will not be selectable and only the label colors can be used
          // for coloring as the actual shape will have zero size.
          var v11 = graph.insertVertex(v1, null, 'World', 1, 1, 0, 0, 'align=left;verticalAlign=top;labelBackgroundColor=red;labelBorderColor=black', true);
          v11.geometry.offset = new mxPoint(-8, -8);
          var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
          // Another alternative solution of creating a second label as a relative child vertex
          // but this time with an automatic size so that the cell is actually selectable and
          // the background is painted as a shape.
          var v21 = graph.insertVertex(v2, null, 'World', 1, 1, 0, 0, 'align=left;verticalAlign=top;fillColor=red;rounded=1;spacingLeft=4;spacingRight=4', true);
          v21.geometry.offset = new mxPoint(-8, -8);
          graph.updateCellSize(v21);
          var e1 = graph.insertEdge(parent, null, '', v1, v2);
        }
        finally
        {
          // Updates the display
          graph.getModel().endUpdate();
        }

        // Adds a button to execute the layout
        document.body.insertBefore(mxUtils.button('Toggle Child Vertices',
          function(evt)
          {
            relativeChildVerticesVisible = !relativeChildVerticesVisible;
            graph.refresh();
          }
        ), document.body.firstChild);

        // Adds a button to execute the layout
        document.body.insertBefore(mxUtils.button('Toggle IDs',
          function(evt)
          {
            secondLabelVisible = !secondLabelVisible;
            graph.refresh();
          }
        ), document.body.firstChild);
      }
    };
  </script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer"
    style="position:relative;overflow:hidden;width:321px;height:241px;background:url('editors/images/grid.gif')">
  </div>
</body>
</html>
