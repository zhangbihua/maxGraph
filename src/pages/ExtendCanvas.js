/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxRectangle from '../mxgraph/util/mxRectangle';
import mxUtils from '../mxgraph/util/mxUtils';
import mxPoint from '../mxgraph/util/mxPoint';

class ExtendCanvas extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Extend canvas</h1>
        This example demonstrates implementing
        an infinite canvas with scrollbars.

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'auto',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  };

  componentDidMount = () => {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.el);

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.panningHandler.ignoreCell = true;
    graph.setPanning(true);

    /**
     * Specifies the size of the size for "tiles" to be used for a graph with
     * scrollbars but no visible background page. A good value is large
     * enough to reduce the number of repaints that is caused for auto-
     * translation, which depends on this value, and small enough to give
     * a small empty buffer around the graph. Default is 400x400.
     */
    graph.scrollTileSize = new mxRectangle(0, 0, 400, 400);

    /**
     * Returns the padding for pages in page view with scrollbars.
     */
    graph.getPagePadding = function() {
      return new mxPoint(
        Math.max(0, Math.round(graph.container.offsetWidth - 34)),
        Math.max(0, Math.round(graph.container.offsetHeight - 34))
      );
    };

    /**
     * Returns the size of the page format scaled with the page size.
     */
    graph.getPageSize = function() {
      return this.pageVisible
        ? new mxRectangle(
            0,
            0,
            this.pageFormat.width * this.pageScale,
            this.pageFormat.height * this.pageScale
          )
        : this.scrollTileSize;
    };

    /**
     * Returns a rectangle describing the position and count of the
     * background pages, where x and y are the position of the top,
     * left page and width and height are the vertical and horizontal
     * page count.
     */
    graph.getPageLayout = function() {
      const size = this.pageVisible ? this.getPageSize() : this.scrollTileSize;
      const bounds = this.getGraphBounds();

      if (bounds.width === 0 || bounds.height === 0) {
        return new mxRectangle(0, 0, 1, 1);
      }

      // Computes untransformed graph bounds
      const x = Math.ceil(bounds.x / this.view.scale - this.view.translate.x);
      const y = Math.ceil(bounds.y / this.view.scale - this.view.translate.y);
      const w = Math.floor(bounds.width / this.view.scale);
      const h = Math.floor(bounds.height / this.view.scale);

      const x0 = Math.floor(x / size.width);
      const y0 = Math.floor(y / size.height);
      const w0 = Math.ceil((x + w) / size.width) - x0;
      const h0 = Math.ceil((y + h) / size.height) - y0;

      return new mxRectangle(x0, y0, w0, h0);
    };

    // Fits the number of background pages to the graph
    graph.view.getBackgroundPageBounds = function() {
      const layout = this.graph.getPageLayout();
      const page = this.graph.getPageSize();

      return new mxRectangle(
        this.scale * (this.translate.x + layout.x * page.width),
        this.scale * (this.translate.y + layout.y * page.height),
        this.scale * layout.width * page.width,
        this.scale * layout.height * page.height
      );
    };

    graph.getPreferredPageSize = function(bounds, width, height) {
      const pages = this.getPageLayout();
      const size = this.getPageSize();

      return new mxRectangle(
        0,
        0,
        pages.width * size.width,
        pages.height * size.height
      );
    };

    /**
     * Guesses autoTranslate to avoid another repaint (see below).
     * Works if only the scale of the graph changes or if pages
     * are visible and the visible pages do not change.
     */
    const graphViewValidate = graph.view.validate;
    graph.view.validate = function() {
      if (
        this.graph.container != null &&
        mxUtils.hasScrollbars(this.graph.container)
      ) {
        const pad = this.graph.getPagePadding();
        const size = this.graph.getPageSize();

        // Updating scrollbars here causes flickering in quirks and is not needed
        // if zoom method is always used to set the current scale on the graph.
        const tx = this.translate.x;
        const ty = this.translate.y;
        this.translate.x = pad.x / this.scale - (this.x0 || 0) * size.width;
        this.translate.y = pad.y / this.scale - (this.y0 || 0) * size.height;
      }

      graphViewValidate.apply(this, arguments);
    };

    const graphSizeDidChange = graph.sizeDidChange;
    graph.sizeDidChange = function() {
      if (this.container != null && mxUtils.hasScrollbars(this.container)) {
        const pages = this.getPageLayout();
        const pad = this.getPagePadding();
        const size = this.getPageSize();

        // Updates the minimum graph size
        const minw = Math.ceil(
          (2 * pad.x) / this.view.scale + pages.width * size.width
        );
        const minh = Math.ceil(
          (2 * pad.y) / this.view.scale + pages.height * size.height
        );

        const min = graph.minimumGraphSize;

        // LATER: Fix flicker of scrollbar size in IE quirks mode
        // after delayed call in window.resize event handler
        if (min == null || min.width !== minw || min.height !== minh) {
          graph.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
        }

        // Updates auto-translate to include padding and graph size
        const dx = pad.x / this.view.scale - pages.x * size.width;
        const dy = pad.y / this.view.scale - pages.y * size.height;

        if (
          !this.autoTranslate &&
          (this.view.translate.x !== dx || this.view.translate.y !== dy)
        ) {
          this.autoTranslate = true;
          this.view.x0 = pages.x;
          this.view.y0 = pages.y;

          // NOTE: THIS INVOKES THIS METHOD AGAIN. UNFORTUNATELY THERE IS NO WAY AROUND THIS SINCE THE
          // BOUNDS ARE KNOWN AFTER THE VALIDATION AND SETTING THE TRANSLATE TRIGGERS A REVALIDATION.
          // SHOULD MOVE TRANSLATE/SCALE TO VIEW.
          const tx = graph.view.translate.x;
          const ty = graph.view.translate.y;

          graph.view.setTranslate(dx, dy);
          graph.container.scrollLeft += (dx - tx) * graph.view.scale;
          graph.container.scrollTop += (dy - ty) * graph.view.scale;

          this.autoTranslate = false;
          return;
        }

        graphSizeDidChange.apply(this, arguments);
      }
    };

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      const e1 = graph.insertEdge(parent, null, '', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    // Sets initial scrollbar positions
    window.setTimeout(function() {
      const bounds = graph.getGraphBounds();
      const width = Math.max(
        bounds.width,
        graph.scrollTileSize.width * graph.view.scale
      );
      const height = Math.max(
        bounds.height,
        graph.scrollTileSize.height * graph.view.scale
      );
      graph.container.scrollTop = Math.floor(
        Math.max(
          0,
          bounds.y - Math.max(20, (graph.container.clientHeight - height) / 4)
        )
      );
      graph.container.scrollLeft = Math.floor(
        Math.max(
          0,
          bounds.x - Math.max(0, (graph.container.clientWidth - width) / 2)
        )
      );
    }, 0);
  };
}

export default ExtendCanvas;
