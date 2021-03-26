/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../../mxgraph/util/mxEvent';
import mxGraph from '../../mxgraph/view/mxGraph';
import mxCellTracker from '../../mxgraph/handler/mxCellTracker';
import mxCellOverlay from '../../mxgraph/view/mxCellOverlay';
import mxImage from '../../mxgraph/util/mxImage';
import mxUtils from '../../mxgraph/util/mxUtils';

class Overlays extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Overlays</h1>
        This example demonstrates cell highlighting, overlays and handling click
        and double click events. See also: events.html for more event handling.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '241px',
            background: "url('editors/images/grid.gif')",
          }}
        />
      </>
    );
  }

  componentDidMount() {
    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Disables basic selection and cell handling
    graph.setEnabled(false);

    // Highlights the vertices when the mouse enters
    const highlight = new mxCellTracker(graph, '#00FF00');

    // Enables tooltips for the overlays
    graph.setTooltips(true);

    // Installs a handler for click events in the graph
    // that toggles the overlay for the respective cell
    graph.addListener(mxEvent.CLICK, (sender, evt) => {
      const cell = evt.getProperty('cell');

      if (cell != null) {
        const overlays = graph.getCellOverlays(cell);

        if (overlays == null) {
          // Creates a new overlay with an image and a tooltip
          const overlay = new mxCellOverlay(
            new mxImage('editors/images/overlays/check.png', 16, 16),
            'Overlay tooltip'
          );

          // Installs a handler for clicks on the overlay
          overlay.addListener(mxEvent.CLICK, (sender, evt2) => {
            mxUtils.alert('Overlay clicked');
          });

          // Sets the overlay for the cell in the graph
          graph.addCellOverlay(cell, overlay);
        } else {
          graph.removeCellOverlays(cell);
        }
      }
    });

    // Installs a handler for double click events in the graph
    // that shows an alert box
    graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
      const cell = evt.getProperty('cell');
      mxUtils.alert(`Doubleclick: ${cell != null ? 'Cell' : 'Graph'}`);
      evt.consume();
    });

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.batchUpdate(() => {
      const v1 = graph.insertVertex({
        parent,
        value: 'Click,',
        position: [20, 20],
        size: [60, 40],
      });
      const v2 = graph.insertVertex({
        parent,
        value: 'Doubleclick',
        position: [200, 150],
        size: [100, 40],
      });
      const e1 = graph.insertEdge({
        parent,
        source: v1,
        target: v2,
      });
    });
  }
}

export default Overlays;
