/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxGraphView from '../../mxgraph/view/graph/mxGraphView'
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxRectangle from '../../mxgraph/util/datatypes/mxRectangle';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxPoint from '../../mxgraph/util/datatypes/mxPoint';
import mxCell from '../../mxgraph/view/cell/mxCell';
import ExampleBase from "./ExampleBase";

/**
 * Specifies the size of the size for "tiles" to be used for a graph with
 * scrollbars but no visible background page. A good value is large
 * enough to reduce the number of repaints that is caused for auto-
 * translation, which depends on this value, and small enough to give
 * a small empty buffer around the graph. Default is 400x400.
 */
const scrollTileSize = new mxRectangle(0, 0, 400, 400);

class ExtendCanvas extends ExampleBase {
  constructor(props) {
    super(props);
  }

  getHTML() {
    // A container for the graph
    return `
      <h1>Extend canvas</h1>
      This example demonstrates implementing an infinite canvas with
      scrollbars.
      
      <div id="el"
           style="position: relative;
                  overflow: auto;
                  height: 241px;
                  background: url('editors/images/grid.gif');
                  cursor: default"
      />
    `;
  }

  afterHTMLSet(): void {
    // Executed after the HTML has been set
    const el = document.getElementById("el");
    el.id = '';

    // Disables the built-in context menu
    mxEvent.disableContextMenu(el);

    // Creates the graph inside the given container
    const graph: MyCustomGraph = new MyCustomGraph(el);
    graph.panningHandler.ignoreCell = true;
    graph.setPanning(true);

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.batchUpdate(() => {
      const v1: mxCell = graph.insertVertex({
        parent,
        value: 'Hello,',
        position: [20, 20],
        size: [80, 30],
      });
      const v2: mxCell = graph.insertVertex({
        parent,
        value: 'World!',
        position: [200, 150],
        size: [80, 30],
      });
      const e1: mxCell = graph.insertEdge({
        parent,
        source: v1,
        target: v2,
      });
    });

    // Sets initial scrollbar positions
    window.setTimeout(() => {
      const bounds: mxRectangle = graph.getGraphBounds();
      const width: number = Math.max(
        bounds.width,
        scrollTileSize.width * graph.view.scale
      );
      const height: number = Math.max(
        bounds.height,
        scrollTileSize.height * graph.view.scale
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
  }
}

class MyCustomGraph extends mxGraph {
  autoTranslate: boolean;

  createGraphView(): mxGraphView {
    return new MyCustomGraphView(this);
  }

  /**
   * Returns the padding for pages in page view with scrollbars.
   */
  getPagePadding(): mxPoint {
    return new mxPoint(
      Math.max(0, Math.round(this.container.offsetWidth - 34)),
      Math.max(0, Math.round(this.container.offsetHeight - 34))
    );
  }

  /**
   * Returns the size of the page format scaled with the page size.
   */
  getPageSize(): mxRectangle {
    return this.pageVisible
      ? new mxRectangle(
          0,
          0,
          this.pageFormat.width * this.pageScale,
          this.pageFormat.height * this.pageScale
        )
      : scrollTileSize;
  }

  /**
   * Returns a rectangle describing the position and count of the
   * background pages, where x and y are the position of the top,
   * left page and width and height are the vertical and horizontal
   * page count.
   */
  getPageLayout(): mxRectangle {
    const size: mxRectangle = this.pageVisible
      ? this.getPageSize()
      : scrollTileSize;
    const bounds = this.getGraphBounds();

    if (bounds.width === 0 || bounds.height === 0) {
      return new mxRectangle(0, 0, 1, 1);
    }

    // Computes untransformed graph bounds
    const x: number = Math.ceil(bounds.x / this.view.scale - this.view.translate.x);
    const y: number = Math.ceil(bounds.y / this.view.scale - this.view.translate.y);
    const w: number = Math.floor(bounds.width / this.view.scale);
    const h: number = Math.floor(bounds.height / this.view.scale);

    const x0: number = Math.floor(x / size.width);
    const y0: number = Math.floor(y / size.height);
    const w0: number = Math.ceil((x + w) / size.width) - x0;
    const h0: number = Math.ceil((y + h) / size.height) - y0;

    return new mxRectangle(x0, y0, w0, h0);
  }

  getPreferredPageSize(bounds, width, height): mxRectangle {
    const pages: mxRectangle = this.getPageLayout();
    const size: mxRectangle = this.getPageSize();

    return new mxRectangle(
      0,
      0,
      pages.width * size.width,
      pages.height * size.height
    );
  }

  sizeDidChange(): mxRectangle {
    if (this.container != null && mxUtils.hasScrollbars(this.container)) {
      const pages: mxRectangle = this.getPageLayout();
      const pad: mxPoint = this.getPagePadding();
      const size: mxRectangle = this.getPageSize();

      // Updates the minimum graph size
      const minw: number = Math.ceil(
        (2 * pad.x) / this.view.scale + pages.width * size.width
      );
      const minh: number = Math.ceil(
        (2 * pad.y) / this.view.scale + pages.height * size.height
      );

      const min: number = this.minimumGraphSize;

      // LATER: Fix flicker of scrollbar size in IE quirks mode
      // after delayed call in window.resize event handler
      if (min == null || min.width !== minw || min.height !== minh) {
        this.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
      }

      // Updates auto-translate to include padding and graph size
      const dx: number = pad.x / this.view.scale - pages.x * size.width;
      const dy: number = pad.y / this.view.scale - pages.y * size.height;

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
        const tx: number = this.view.translate.x;
        const ty: number = this.view.translate.y;

        this.view.setTranslate(dx, dy);
        this.container.scrollLeft += (dx - tx) * this.view.scale;
        this.container.scrollTop += (dy - ty) * this.view.scale;

        this.autoTranslate = false;
        return;
      }

      super.sizeDidChange();
    }
  }
}

class MyCustomGraphView extends mxGraphView {
  /**
   * Fits the number of background pages to the graph
   */
  getBackgroundPageBounds(): mxRectangle {
    const layout: mxRectangle = this.graph.getPageLayout();
    const page: mxRectangle = this.graph.getPageSize();

    return new mxRectangle(
      this.scale * (this.translate.x + layout.x * page.width),
      this.scale * (this.translate.y + layout.y * page.height),
      this.scale * layout.width * page.width,
      this.scale * layout.height * page.height
    );
  }

  /**
   * Guesses autoTranslate to avoid another repaint (see below).
   * Works if only the scale of the graph changes or if pages
   * are visible and the visible pages do not change.
   */
  validate(): void {
    if (
      this.graph.container != null &&
      mxUtils.hasScrollbars(this.graph.container)
    ) {
      const pad: mxPoint = this.graph.getPagePadding();
      const size: mxRectangle = this.graph.getPageSize();

      // Updating scrollbars here causes flickering in quirks and is not needed
      // if zoom method is always used to set the current scale on the graph.
      //const tx = this.translate.x;
      //const ty = this.translate.y;
      this.translate.x = pad.x / this.scale - (this.x0 || 0) * size.width;
      this.translate.y = pad.y / this.scale - (this.y0 || 0) * size.height;
    }

    super.validate();
  };
}

export default ExtendCanvas;
