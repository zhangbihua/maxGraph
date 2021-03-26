/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxClient from '../mxgraph/mxClient';

class Drop extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Drop</h1>
        This example demonstrates handling native drag and drop of images
        (requires modern browser).
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '441px',
            background: `url('editors/images/grid.gif')`,
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Checks if the browser is supported
    const fileSupport =
      window.File != null &&
      window.FileReader != null &&
      window.FileList != null;

    if (!fileSupport || !mxClient.isBrowserSupported()) {
      // Displays an error message if the browser is not supported.
      mxUtils.error('Browser is not supported!', 200, false);
    } else {
      // Disables the built-in context menu
      mxEvent.disableContextMenu(this.el);

      // Creates the graph inside the given this.el
      const graph = new mxGraph(this.el);

      // Enables rubberband selection
      new mxRubberband(graph);

      mxEvent.addListener(this.el, 'dragover', function(evt) {
        if (graph.isEnabled()) {
          evt.stopPropagation();
          evt.preventDefault();
        }
      });

      mxEvent.addListener(this.el, 'drop', evt => {
        if (graph.isEnabled()) {
          evt.stopPropagation();
          evt.preventDefault();

          // Gets drop location point for vertex
          const pt = mxUtils.convertPoint(
            graph.container,
            mxEvent.getClientX(evt),
            mxEvent.getClientY(evt)
          );
          const tr = graph.view.translate;
          const { scale } = graph.view;
          const x = pt.x / scale - tr.x;
          const y = pt.y / scale - tr.y;

          // Converts local images to data urls
          const filesArray = evt.dataTransfer.files;

          for (let i = 0; i < filesArray.length; i++) {
            this.handleDrop(graph, filesArray[i], x + i * 10, y + i * 10);
          }
        }
      });
    }
  }

  handleDrop(graph, file, x, y) {
    // Handles each file as a separate insert for simplicity.
    // Use barrier to handle multiple files as a single insert.

    if (file.type.substring(0, 5) === 'image') {
      const reader = new FileReader();

      reader.onload = function(e) {
        // Gets size of image for vertex
        let data = e.target.result;

        // SVG needs special handling to add viewbox if missing and
        // find initial size from SVG attributes (only for IE11)
        if (file.type.substring(0, 9) === 'image/svg') {
          const comma = data.indexOf(',');
          const svgText = atob(data.substring(comma + 1));
          const root = mxUtils.parseXml(svgText);

          // Parses SVG to find width and height
          if (root != null) {
            const svgs = root.getElementsByTagName('svg');

            if (svgs.length > 0) {
              const svgRoot = svgs[0];
              let w = parseFloat(svgRoot.getAttribute('width'));
              let h = parseFloat(svgRoot.getAttribute('height'));

              // Check if viewBox attribute already exists
              const vb = svgRoot.getAttribute('viewBox');

              if (vb == null || vb.length === 0) {
                svgRoot.setAttribute('viewBox', `0 0 ${w} ${h}`);
              }
              // Uses width and height from viewbox for
              // missing width and height attributes
              else if (Number.isNaN(w) || Number.isNaN(h)) {
                const tokens = vb.split(' ');

                if (tokens.length > 3) {
                  w = parseFloat(tokens[2]);
                  h = parseFloat(tokens[3]);
                }
              }

              w = Math.max(1, Math.round(w));
              h = Math.max(1, Math.round(h));

              data = `data:image/svg+xml,${btoa(
                mxUtils.getXml(svgs[0], '\n')
              )}`;
              graph.insertVertex(
                null,
                null,
                '',
                x,
                y,
                w,
                h,
                `shape=image;image=${data};`
              );
            }
          }
        } else {
          const img = new Image();

          img.onload = function() {
            const w = Math.max(1, img.width);
            const h = Math.max(1, img.height);

            // Converts format of data url to cell style value for use in vertex
            const semi = data.indexOf(';');

            if (semi > 0) {
              data =
                data.substring(0, semi) +
                data.substring(data.indexOf(',', semi + 1));
            }

            graph.insertVertex(
              null,
              null,
              '',
              x,
              y,
              w,
              h,
              `shape=image;image=${data};`
            );
          };

          img.src = data;
        }
      };

      reader.readAsDataURL(file);
    }
  }
}

export default Drop;
