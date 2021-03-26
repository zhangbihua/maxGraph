/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxHierarchicalLayout from '../mxgraph/layout/hierarchical/mxHierarchicalLayout';
import mxFastOrganicLayout from '../mxgraph/layout/mxFastOrganicLayout';
import mxConstants from '../mxgraph/util/mxConstants';
import mxPerimeter from '../mxgraph/view/mxPerimeter';
import mxUtils from '../mxgraph/util/mxUtils';

class HierarchicalLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Hierarchical Layout</h1>
        This example demonstrates the use of the hierarchical and organic
        layouts. Note that the hierarchical layout requires another script tag
        in the head of the page.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'absolute',
            overflow: 'auto',
            top: '36px',
            bottom: '0px',
            left: '0px',
            right: '0px',
            borderTop: 'gray 1px solid',
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
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Adds rubberband selection
    new mxRubberband(graph);

    // Changes the default vertex style in-place
    let style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
    style[mxConstants.STYLE_PERIMETER_SPACING] = 6;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_SHADOW] = true;

    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_ROUNDED] = true;

    // Creates a layout algorithm to be used
    // with the graph
    const layout = new mxHierarchicalLayout(graph);
    const organic = new mxFastOrganicLayout(graph);
    organic.forceConstant = 120;

    const parent = graph.getDefaultParent();

    // Adds a button to execute the layout
    let button = document.createElement('button');
    mxUtils.write(button, 'Hierarchical');
    mxEvent.addListener(button, 'click', function(evt) {
      layout.execute(parent);
    });
    this.el2.appendChild(button);

    // Adds a button to execute the layout
    button = document.createElement('button');
    mxUtils.write(button, 'Organic');

    mxEvent.addListener(button, 'click', function(evt) {
      organic.execute(parent);
    });

    this.el2.appendChild(button);

    // Load cells and layouts the graph
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, '1', 0, 0, 80, 30);
      const v2 = graph.insertVertex(parent, null, '2', 0, 0, 80, 30);
      const v3 = graph.insertVertex(parent, null, '3', 0, 0, 80, 30);
      const v4 = graph.insertVertex(parent, null, '4', 0, 0, 80, 30);
      const v5 = graph.insertVertex(parent, null, '5', 0, 0, 80, 30);
      const v6 = graph.insertVertex(parent, null, '6', 0, 0, 80, 30);
      const v7 = graph.insertVertex(parent, null, '7', 0, 0, 80, 30);
      const v8 = graph.insertVertex(parent, null, '8', 0, 0, 80, 30);
      const v9 = graph.insertVertex(parent, null, '9', 0, 0, 80, 30);

      const e1 = graph.insertEdge(parent, null, '', v1, v2);
      const e2 = graph.insertEdge(parent, null, '', v1, v3);
      const e3 = graph.insertEdge(parent, null, '', v3, v4);
      const e4 = graph.insertEdge(parent, null, '', v2, v5);
      const e5 = graph.insertEdge(parent, null, '', v1, v6);
      const e6 = graph.insertEdge(parent, null, '', v2, v3);
      const e7 = graph.insertEdge(parent, null, '', v6, v4);
      const e8 = graph.insertEdge(parent, null, '', v6, v1);
      const e9 = graph.insertEdge(parent, null, '', v6, v7);
      const e10 = graph.insertEdge(parent, null, '', v7, v8);
      const e11 = graph.insertEdge(parent, null, '', v7, v9);
      const e12 = graph.insertEdge(parent, null, '', v7, v6);
      const e13 = graph.insertEdge(parent, null, '', v7, v5);

      // Executes the layout
      layout.execute(parent);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default HierarchicalLayout;
