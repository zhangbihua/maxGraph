/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  Template. This is used as a template HTML file by the
  backends to demonstrate the deployment of the client with a graph embedded
  in the page as XML data (see graph variable in the onload-handler).
  
  *** THIS FILE MUST BE DEPLOYED BY ONE OF THE BACKENDS! ***
 */

import React from 'react';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxCodec from '../mxgraph/io/mxCodec';

class Template extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Hello, World!</h1>
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '241px',
            background:
              "url('/mxgraph/javascript/examples/editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Adds rubberband selection to the graph
    new mxRubberband(graph);

    const doc = mxUtils.parseXml(xml);
    const codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
  }
}

export default Template;
