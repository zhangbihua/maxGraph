/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxConstants from '../mxgraph/util/mxConstants';
import mxEdgeStyle from '../mxgraph/view/mxEdgeStyle';
import mxKeyHandler from '../mxgraph/handler/mxKeyHandler';

class Indicators extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Indicators</h1>
        This example demonstrates the use of indicators, which are small
        subshapes inside a parent shape, typically an mxLabel.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '300ph',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);
    graph.setConnectable(true);
    new mxKeyHandler(graph);

    // Enables moving of vertex labels
    graph.vertexLabelsMovable = true;

    // Creates a style with an indicator
    let style = graph.getStylesheet().getDefaultVertexStyle();

    style[mxConstants.STYLE_SHAPE] = 'label';
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'bottom';
    style[mxConstants.STYLE_INDICATOR_SHAPE] = 'ellipse';
    style[mxConstants.STYLE_INDICATOR_WIDTH] = 34;
    style[mxConstants.STYLE_INDICATOR_HEIGHT] = 34;
    style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = 'top'; // indicator v-alignment
    style[mxConstants.STYLE_IMAGE_ALIGN] = 'center';
    style[mxConstants.STYLE_INDICATOR_COLOR] = 'green';
    delete style[mxConstants.STYLE_STROKECOLOR]; // transparent
    delete style[mxConstants.STYLE_FILLCOLOR]; // transparent

    // Creates a style with an indicator
    style = graph.getStylesheet().getDefaultEdgeStyle();

    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ELBOW] = mxConstants.ELBOW_VERTICAL;
    style[mxConstants.STYLE_ROUNDED] = true;

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      graph.insertVertex(parent, null, 'Bottom Label', 80, 80, 80, 60);
      graph.insertVertex(
        parent,
        null,
        'Top Label',
        200,
        80,
        60,
        60,
        'indicatorShape=actor;indicatorWidth=28;indicatorColor=blue;imageVerticalAlign=bottom;verticalAlign=top'
      );
      graph.insertVertex(
        parent,
        null,
        'Right Label',
        300,
        80,
        120,
        60,
        'indicatorShape=cloud;indicatorWidth=40;indicatorColor=#00FFFF;imageVerticalAlign=center;verticalAlign=middle;imageAlign=left;align=left;spacingLeft=44'
      );
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
}

export default Indicators;
