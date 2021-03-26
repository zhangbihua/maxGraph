/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/mxEvent';
import mxGraph from '../../mxgraph/view/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxConstants from '../../mxgraph/util/mxConstants';

class HoverStyle extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Hoverstyle</h1>
        This example shows hot to change the style of a vertex on mouseover.
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
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    function updateStyle(state, hover) {
      if (hover) {
        state.style[mxConstants.STYLE_FILLCOLOR] = '#ff0000';
      }

      // Sets rounded style for both cases since the rounded style
      // is not set in the default style and is therefore inherited
      // once it is set, whereas the above overrides the default value
      state.style[mxConstants.STYLE_ROUNDED] = hover ? '1' : '0';
      state.style[mxConstants.STYLE_STROKEWIDTH] = hover ? '4' : '1';
      state.style[mxConstants.STYLE_FONTSTYLE] = hover
        ? mxConstants.FONT_BOLD
        : '0';
    }

    // Changes fill color to red on mouseover
    graph.addMouseListener({
      currentState: null,
      previousStyle: null,
      mouseDown(sender, me) {
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove(sender, me) {
        if (this.currentState != null && me.getState() == this.currentState) {
          return;
        }

        let tmp = graph.view.getState(me.getCell());

        // Ignores everything but vertices
        if (
          graph.isMouseDown ||
          (tmp != null && !graph.getModel().isVertex(tmp.cell))
        ) {
          tmp = null;
        }

        if (tmp != this.currentState) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
          }

          this.currentState = tmp;

          if (this.currentState != null) {
            this.dragEnter(me.getEvent(), this.currentState);
          }
        }
      },
      mouseUp(sender, me) {},
      dragEnter(evt, state) {
        if (state != null) {
          this.previousStyle = state.style;
          state.style = mxUtils.clone(state.style);
          updateStyle(state, true);
          state.shape.apply(state);
          state.shape.redraw();

          if (state.text != null) {
            state.text.apply(state);
            state.text.redraw();
          }
        }
      },
      dragLeave(evt, state) {
        if (state != null) {
          state.style = this.previousStyle;
          updateStyle(state, false);
          state.shape.apply(state);
          state.shape.redraw();

          if (state.text != null) {
            state.text.apply(state);
            state.text.redraw();
          }
        }
      },
    });

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
  }
}

export default HoverStyle;
