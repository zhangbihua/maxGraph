/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRectangle from '../mxgraph/util/mxRectangle';

class Collapse extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A container for the graph
    return (
      <>
        <h1>Collapse</h1>
        This example demonstrates changing
        the style of a cell based on its collapsed state.

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  };

  componentDidMount = () => {
    const graph = new mxGraph(this.el);
    const parent = graph.getDefaultParent();

    // Extends mxGraphModel.getStyle to show an image when collapsed
    const modelGetStyle = graph.model.getStyle;
    graph.model.getStyle = function(cell) {
      if (cell != null) {
        let style = modelGetStyle.apply(this, arguments);

        if (this.isCollapsed(cell)) {
          style =
            `${style};shape=image;image=http://www.jgraph.com/images/mxgraph.gif;` +
            `noLabel=1;imageBackground=#C3D9FF;imageBorder=#6482B9`;
        }

        return style;
      }

      return null;
    };

    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(
        parent,
        null,
        'Container',
        20,
        20,
        200,
        200,
        'shape=swimlane;startSize=20;'
      );
      v1.geometry.alternateBounds = new mxRectangle(0, 0, 110, 70);
      const v11 = graph.insertVertex(v1, null, 'Hello,', 10, 40, 120, 80);
    } finally {
      graph.getModel().endUpdate();
    }
  };
}

export default Collapse;
