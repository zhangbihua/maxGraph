/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/event/mxEvent';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxConstants from '../../mxgraph/util/mxConstants';
import mxPrintPreview from '../../mxgraph/view/graph/mxPrintPreview';

class PageBreaks extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Pagebreaks</h1>
        This example demonstrates using the pageBreaksVisible and preferPageSize
        switches and adding headers and footers to print output.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '481px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
        <div
          ref={el => {
            this.el2 = el;
          }}
        />
      </>
    );
  }

  componentDidMount() {
    mxEvent.disableContextMenu(this.el);

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.view.setScale(0.15);
    graph.pageBreaksVisible = true;
    graph.pageBreakDashed = true;
    graph.preferPageSize = true;
    graph.centerZoom = false;
    graph.setPanning(true);

    // Account for the header and footer size in the page format
    const headerSize = 100;
    const footerSize = 100;

    // Removes header and footer from page height
    graph.pageFormat.height -= headerSize + footerSize;

    // Takes zoom into account for moving cells
    graph.graphHandler.scaleGrid = true;

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello,', 10, 10, 280, 330);
      const v2 = graph.insertVertex(
        parent,
        null,
        'World!',
        graph.pageFormat.width * graph.pageScale - 280 - 10,
        graph.pageFormat.height * graph.pageScale - 330 - 10,
        280,
        330
      );
      const e1 = graph.insertEdge(parent, null, '', v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    this.el2.appendChild(
      mxUtils.button('Toggle Page Breaks', function(evt) {
        graph.pageBreaksVisible = !graph.pageBreaksVisible;
        graph.sizeDidChange();
      })
    );

    this.el2.appendChild(
      mxUtils.button('Zoom In', function(evt) {
        graph.zoomIn();
      })
    );

    this.el2.appendChild(
      mxUtils.button('Zoom Out', function(evt) {
        graph.zoomOut();
      })
    );

    this.el2.appendChild(
      mxUtils.button('Print', function(evt) {
        // Matches actual printer paper size and avoids blank pages
        const scale = 0.5;

        // Applies scale to page
        const pf = mxRectangle.fromRectangle(
          graph.pageFormat || mxConstants.PAGE_FORMAT_A4_PORTRAIT
        );
        pf.width = Math.round(pf.width * scale * graph.pageScale);
        pf.height = Math.round(pf.height * scale * graph.pageScale);

        // Finds top left corner of top left page
        const bounds = mxRectangle.fromRectangle(graph.getGraphBounds());
        bounds.x -= graph.view.translate.x * graph.view.scale;
        bounds.y -= graph.view.translate.y * graph.view.scale;

        const x0 = Math.floor(bounds.x / pf.width) * pf.width;
        const y0 = Math.floor(bounds.y / pf.height) * pf.height;

        const preview = new mxPrintPreview(graph, scale, pf, 0, -x0, -y0);
        preview.marginTop = headerSize * scale * graph.pageScale;
        preview.marginBottom = footerSize * scale * graph.pageScale;
        preview.autoOrigin = false;

        const oldRenderPage = preview.renderPage;
        preview.renderPage = function(w, h, x, y, content, pageNumber) {
          const div = oldRenderPage.apply(this, arguments);

          const header = document.createElement('div');
          header.style.position = 'absolute';
          header.style.boxSizing = 'border-box';
          header.style.fontFamily = 'Arial,Helvetica';
          header.style.height = `${this.marginTop - 10}px`;
          header.style.textAlign = 'center';
          header.style.verticalAlign = 'middle';
          header.style.marginTop = 'auto';
          header.style.fontSize = '12px';
          header.style.width = '100%';

          // Vertical centering for text in header/footer
          header.style.lineHeight = `${this.marginTop - 10}px`;

          const footer = header.cloneNode(true);

          mxUtils.write(header, `Page ${pageNumber} - Header`);
          header.style.borderBottom = '1px solid gray';
          header.style.top = '0px';

          mxUtils.write(footer, `Page ${pageNumber} - Footer`);
          footer.style.borderTop = '1px solid gray';
          footer.style.bottom = '0px';

          div.firstChild.appendChild(footer);
          div.firstChild.appendChild(header);

          return div;
        };

        preview.open();
      })
    );

    this.el2.appendChild(
      mxUtils.button('Reset View', function(evt) {
        graph.view.scaleAndTranslate(0.15, 0, 0);
      })
    );
  }
}

export default PageBreaks;
