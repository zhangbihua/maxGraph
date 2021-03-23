<!--
  Copyright (c) 2006-2013, JGraph Ltd
  
  Drop example for mxGraph. This example demonstrates handling
  native drag and drop of images (requires modern browser).
-->

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
        <h1></h1>

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

<html>
<head>
	<title>Drop example for mxGraph</title>

	<!-- Sets the basepath for the library if not in same directory -->
	<script type="text/javascript">
		mxBasePath = '../src';
	</script>

	<!-- Loads and initializes the library -->
	<script type="text/javascript" src="../src/js/mxClient.js"></script>

	<!-- Example code -->
	<script type="text/javascript">
		// Program starts here. Creates a sample graph in the
		// DOM node with the specified ID. This function is invoked
		// from the onLoad event handler of the document (see below).
		function main(container)
		{
			// Checks if the browser is supported
			let fileSupport = window.File != null && window.FileReader != null && window.FileList != null;
			
			if (!fileSupport || !mxClient.isBrowserSupported())
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

				mxEvent.addListener(container, 'dragover', function(evt)
				{
					if (graph.isEnabled())
					{
						evt.stopPropagation();
						evt.preventDefault();
					}
				});
				
				mxEvent.addListener(container, 'drop', function(evt)
				{
					if (graph.isEnabled())
					{
						evt.stopPropagation();
						evt.preventDefault();

						// Gets drop location point for vertex
						let pt = mxUtils.convertPoint(graph.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
						let tr = graph.view.translate;
						let scale = graph.view.scale;
						let x = pt.x / scale - tr.x;
						let y = pt.y / scale - tr.y;
						
						// Converts local images to data urls
						let filesArray = event.dataTransfer.files;
						
		                for (let i = 0; i < filesArray.length; i++)
		                {
			    			handleDrop(graph, filesArray[i], x + i * 10, y + i * 10);
		                }
					}
				});
			}
		};

		// Handles each file as a separate insert for simplicity.
		// Use barrier to handle multiple files as a single insert.
		function handleDrop(graph, file, x, y)
		{
			if (file.type.substring(0, 5) == 'image')
			{
                let reader = new FileReader();

                reader.onload = function(e)
                {
                	// Gets size of image for vertex
					let data = e.target.result;

    				// SVG needs special handling to add viewbox if missing and
    				// find initial size from SVG attributes (only for IE11)
					if (file.type.substring(0, 9) == 'image/svg')
	    			{
    					let comma = data.indexOf(',');
    					let svgText = atob(data.substring(comma + 1));
    					let root = mxUtils.parseXml(svgText);
    					
    					// Parses SVG to find width and height
    					if (root != null)
    					{
    						let svgs = root.getElementsByTagName('svg');
    						
    						if (svgs.length > 0)
	    					{
    							let svgRoot = svgs[0];
	    						let w = parseFloat(svgRoot.getAttribute('width'));
	    						let h = parseFloat(svgRoot.getAttribute('height'));
	    						
	    						// Check if viewBox attribute already exists
	    						let vb = svgRoot.getAttribute('viewBox');
	    						
	    						if (vb == null || vb.length == 0)
	    						{
	    							svgRoot.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
	    						}
	    						// Uses width and height from viewbox for
	    						// missing width and height attributes
	    						else if (isNaN(w) || isNaN(h))
	    						{
	    							let tokens = vb.split(' ');
	    							
	    							if (tokens.length > 3)
	    							{
	    								w = parseFloat(tokens[2]);
	    								h = parseFloat(tokens[3]);
	    							}
	    						}
	    						
		                    	w = Math.max(1, Math.round(w));
		                    	h = Math.max(1, Math.round(h));
	    						
	    						data = 'data:image/svg+xml,' + btoa(mxUtils.getXml(svgs[0], '\n'));
	    						graph.insertVertex(null, null, '', x, y, w, h, 'shape=image;image=' + data + ';');
	    					}
    					}
	    			}
					else
					{
                    	let img = new Image();
                    	
                    	img.onload = function()
                    	{
	                    	let w = Math.max(1, img.width);
	                    	let h = Math.max(1, img.height);
	                    	
	                    	// Converts format of data url to cell style value for use in vertex
	        				let semi = data.indexOf(';');
	        				
	        				if (semi > 0)
	        				{
	        					data = data.substring(0, semi) + data.substring(data.indexOf(',', semi + 1));
	        				}

	        				graph.insertVertex(null, null, '', x, y, w, h, 'shape=image;image=' + data + ';');
                    	};
                    	
                    	img.src = data;
					}
                };
                
				reader.readAsDataURL(file);
			}
		};
	</script>
</head>

<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">
	Drag & drop your images below:<br>
	<!-- Creates a container for the graph with a grid wallpaper -->
	<div id="graphContainer"
		style="position:relative;overflow:hidden;width:621px;height:441px;background:url('editors/images/grid.gif');cursor:default;">
	</div>
</body>
</html>
