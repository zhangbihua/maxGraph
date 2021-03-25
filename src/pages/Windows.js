/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxLog from '../mxgraph/util/mxLog';
import mxWindow from '../mxgraph/util/mxWindow';
import mxUtils from '../mxgraph/util/mxUtils';
import mxKeyHandler from '../mxgraph/handler/mxKeyHandler';

class Windows extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Windows</h1>
        This example demonstrates using
        the mxWindow class for displaying windows.

        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'auto',
            position: 'relative',
            height: '500px',
            background: 'lightyellow',
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Note that we're using the container scrollbars for the graph so that the
    // container extends to the parent div inside the window
    let wnd = new mxWindow(
      'Scrollable, resizable, given height',
      this.el,
      50,
      50,
      220,
      224,
      true,
      true
    );

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Adds rubberband selection and keystrokes
    graph.setTooltips(true);
    graph.setPanning(true);
    const rubberband = new mxRubberband(graph);
    new mxKeyHandler(graph);

    mxEvent.disableContextMenu(this.el);

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

    wnd.setMaximizable(true);
    wnd.setResizable(true);
    wnd.setVisible(true);

    const lorem =
      'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ';
    let content = document.createElement('div');
    mxUtils.write(content, lorem + lorem + lorem);

    wnd = new mxWindow(
      'Scrollable, resizable, auto height',
      content,
      300,
      50,
      200,
      null,
      true,
      true
    );
    wnd.setMaximizable(true);
    wnd.setScrollable(true);
    wnd.setResizable(true);
    wnd.setVisible(true);

    content = content.cloneNode(true);
    content.style.width = '400px';

    wnd = new mxWindow(
      'Scrollable, resizable, fixed content',
      content,
      520,
      50,
      220,
      200,
      true,
      true
    );
    wnd.setMaximizable(true);
    wnd.setScrollable(true);
    wnd.setResizable(true);
    wnd.setVisible(true);

    mxLog.show();
  }
}

export default Windows;
