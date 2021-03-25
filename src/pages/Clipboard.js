/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from '../mxgraph/util/mxUtils';
import mxClipboard from '../mxgraph/util/mxClipboard';
import mxClient from '../mxgraph/mxClient';
import mxCodec from '../mxgraph/io/mxCodec';
import mxGraphModel from '../mxgraph/model/mxGraphModel';

class Clipboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    // A this.el for the graph
    return (
      <>
        <h1>Clipboard</h1>
        This example demonstrates using the clipboard
        for providing cross-tab and cross-browser copy and paste.

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
    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.el);

    // Creates the graph inside the given this.el
    const graph = new mxGraph(this.el);

    // Public helper method for shared clipboard.
    mxClipboard.cellsToString = function(cells) {
      const codec = new mxCodec();
      const model = new mxGraphModel();
      const parent = model.getChildAt(model.getRoot(), 0);

      for (let i = 0; i < cells.length; i++) {
        model.add(parent, cells[i]);
      }

      return mxUtils.getXml(codec.encode(model));
    };

    // Focused but invisible textarea during control or meta key events
    const textInput = document.createElement('textarea');
    mxUtils.setOpacity(textInput, 0);
    textInput.style.width = '1px';
    textInput.style.height = '1px';
    let restoreFocus = false;
    const gs = graph.gridSize;
    let lastPaste = null;
    let dx = 0;
    let dy = 0;

    // Workaround for no copy event in IE/FF if empty
    textInput.value = ' ';

    // Shows a textare when control/cmd is pressed to handle native clipboard actions
    mxEvent.addListener(document, 'keydown', function(evt) {
      // No dialog visible
      const source = mxEvent.getSource(evt);

      if (
        graph.isEnabled() &&
        !graph.isMouseDown &&
        !graph.isEditing() &&
        source.nodeName !== 'INPUT'
      ) {
        if (
          evt.keyCode === 224 /* FF */ ||
          (!mxClient.IS_MAC && evt.keyCode === 17) /* Control */ ||
          (mxClient.IS_MAC &&
            (evt.keyCode === 91 || evt.keyCode === 93)) /* Left/Right Meta */
        ) {
          // Cannot use parentNode for check in IE
          if (!restoreFocus) {
            // Avoid autoscroll but allow handling of events
            textInput.style.position = 'absolute';
            textInput.style.left = `${graph.container.scrollLeft + 10}px`;
            textInput.style.top = `${graph.container.scrollTop + 10}px`;
            graph.container.appendChild(textInput);

            restoreFocus = true;
            textInput.focus();
            textInput.select();
          }
        }
      }
    });

    // Restores focus on graph this.el and removes text input from DOM
    mxEvent.addListener(document, 'keyup', function(evt) {
      if (
        restoreFocus &&
        (evt.keyCode === 224 /* FF */ ||
        evt.keyCode === 17 /* Control */ ||
          evt.keyCode === 91 ||
          evt.keyCode === 93) /* Meta */
      ) {
        restoreFocus = false;

        if (!graph.isEditing()) {
          graph.container.focus();
        }

        textInput.parentNode.removeChild(textInput);
      }
    });

    // Inserts the XML for the given cells into the text input for copy
    const copyCells = function(graph, cells) {
      if (cells.length > 0) {
        const clones = graph.cloneCells(cells);

        // Checks for orphaned relative children and makes absolute
        for (let i = 0; i < clones.length; i++) {
          const state = graph.view.getState(cells[i]);

          if (state != null) {
            const geo = graph.getCellGeometry(clones[i]);

            if (geo != null && geo.relative) {
              geo.relative = false;
              geo.x = state.x / state.view.scale - state.view.translate.x;
              geo.y = state.y / state.view.scale - state.view.translate.y;
            }
          }
        }

        textInput.value = mxClipboard.cellsToString(clones);
      }

      textInput.select();
      lastPaste = textInput.value;
    };

    // Handles copy event by putting XML for current selection into text input
    mxEvent.addListener(
      textInput,
      'copy',
      mxUtils.bind(this, function(evt) {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
          copyCells(
            graph,
            mxUtils.sortCells(
              graph.model.getTopmostCells(graph.getSelectionCells())
            )
          );
          dx = 0;
          dy = 0;
        }
      })
    );

    // Handles cut event by removing cells putting XML into text input
    mxEvent.addListener(
      textInput,
      'cut',
      mxUtils.bind(this, function(evt) {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
          copyCells(graph, graph.removeCells());
          dx = -gs;
          dy = -gs;
        }
      })
    );

    // Merges XML into existing graph and layers
    const importXml = function(xml, dx, dy) {
      dx = dx != null ? dx : 0;
      dy = dy != null ? dy : 0;
      let cells = [];

      try {
        const doc = mxUtils.parseXml(xml);
        const node = doc.documentElement;

        if (node != null) {
          const model = new mxGraphModel();
          const codec = new mxCodec(node.ownerDocument);
          codec.decode(node, model);

          const childCount = model.getChildCount(model.getRoot());
          const targetChildCount = graph.model.getChildCount(
            graph.model.getRoot()
          );

          // Merges existing layers and adds new layers
          graph.model.beginUpdate();
          try {
            for (let i = 0; i < childCount; i++) {
              let parent = model.getChildAt(model.getRoot(), i);

              // Adds cells to existing layers if not locked
              if (targetChildCount > i) {
                // Inserts into active layer if only one layer is being pasted
                const target =
                  childCount === 1
                    ? graph.getDefaultParent()
                    : graph.model.getChildAt(graph.model.getRoot(), i);

                if (!graph.isCellLocked(target)) {
                  const children = model.getChildren(parent);
                  cells = cells.concat(
                    graph.importCells(children, dx, dy, target)
                  );
                }
              } else {
                // Delta is non cascading, needs separate move for layers
                parent = graph.importCells(
                  [parent],
                  0,
                  0,
                  graph.model.getRoot()
                )[0];
                const children = graph.model.getChildren(parent);
                graph.moveCells(children, dx, dy);
                cells = cells.concat(children);
              }
            }
          } finally {
            graph.model.endUpdate();
          }
        }
      } catch (e) {
        alert(e);
        throw e;
      }

      return cells;
    };

    // Parses and inserts XML into graph
    const pasteText = function(text) {
      const xml = mxUtils.trim(text);
      const x =
        graph.container.scrollLeft / graph.view.scale - graph.view.translate.x;
      const y =
        graph.container.scrollTop / graph.view.scale - graph.view.translate.y;

      if (xml.length > 0) {
        if (lastPaste !== xml) {
          lastPaste = xml;
          dx = 0;
          dy = 0;
        } else {
          dx += gs;
          dy += gs;
        }

        // Standard paste via control-v
        if (xml.substring(0, 14) === '<mxGraphModel>') {
          graph.setSelectionCells(importXml(xml, dx, dy));
          graph.scrollCellToVisible(graph.getSelectionCell());
        }
      }
    };

    // Cross-browser function to fetch text from paste events
    const extractGraphModelFromEvent = function(evt) {
      let data = null;

      if (evt != null) {
        const provider =
          evt.dataTransfer != null ? evt.dataTransfer : evt.clipboardData;

        if (provider != null) {
          if (document.documentMode === 10 || document.documentMode === 11) {
            data = provider.getData('Text');
          } else {
            data =
              mxUtils.indexOf(provider.types, 'text/html') >= 0
                ? provider.getData('text/html')
                : null;

            if (
              mxUtils.indexOf(
                provider.types,
                'text/plain' && (data == null || data.length === 0)
              )
            ) {
              data = provider.getData('text/plain');
            }
          }
        }
      }

      return data;
    };

    // Handles paste event by parsing and inserting XML
    mxEvent.addListener(textInput, 'paste', function(evt) {
      // Clears existing contents before paste - should not be needed
      // because all text is selected, but doesn't hurt since the
      // actual pasting of the new text is delayed in all cases.
      textInput.value = '';

      if (graph.isEnabled()) {
        const xml = extractGraphModelFromEvent(evt);

        if (xml != null && xml.length > 0) {
          pasteText(xml);
        } else {
          // Timeout for new value to appear
          window.setTimeout(
            mxUtils.bind(this, function() {
              pasteText(textInput.value);
            }),
            0
          );
        }
      }

      textInput.select();
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
  };
}

export default Clipboard;
