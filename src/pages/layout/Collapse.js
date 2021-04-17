/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRectangle from '../../mxgraph/util/datatypes/mxRectangle';
import mxGraphModel from '../../mxgraph/view/graph/mxGraphModel';

class Collapse extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Collapse</h1>
        This example demonstrates changing the style of a cell based on its
        collapsed state.
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

  componentDidMount() {
    const graph = new mxGraph(this.el);
    const parent = graph.getDefaultParent();

    const getStyle = function() {
      // Extends mxGraphModel.getStyle to show an image when collapsed
      let style = super.getStyle();
      if (this.isCollapsed()) {
        style =
          `${style};shape=image;image=http://www.jgraph.com/images/mxgraph.gif;` +
          `noLabel=1;imageBackground=#C3D9FF;imageBorder=#6482B9`;
      }
      return style;
    }

    graph.batchUpdate(() => {
      const v1 = graph.insertVertex({
        parent,
        value: 'Container',
        position: [20, 20],
        size: [200, 200],
        style: 'shape=swimlane;startSize=20;',
      });
      v1.geometry.alternateBounds = new mxRectangle(0, 0, 110, 70);
      v1.getStyle = getStyle;

      const v11 = graph.insertVertex({
        parent: v1,
        value: 'Hello,',
        position: [10, 40],
        size: [120, 80],
      });
      v11.getStyle = getStyle;
    });
  };
}

export default Collapse;
