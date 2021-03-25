/**
 * Copyright (c) 2006-2013, JGraph Ltd
  
  User object. This example demonstrates using
  XML objects as values for cells.
 */

import React from 'react';
import mxEvent from '../mxgraph/util/mxEvent';
import mxGraph from '../mxgraph/view/mxGraph';
import mxRubberband from '../mxgraph/handler/mxRubberband';
import mxUtils from "../mxgraph/util/mxUtils";
import mxConstants from "../mxgraph/util/mxConstants";
import mxForm from "../mxgraph/util/mxForm";
import mxCellAttributeChange from "../mxgraph/model/atomic_changes/mxCellAttributeChange";
import mxKeyHandler from "../mxgraph/handler/mxKeyHandler";
import mxRectangle from "../mxgraph/util/mxRectangle";
import mxEdgeStyle from "../mxgraph/view/mxEdgeStyle";

class UserObject extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>User object</h1>

        <table style={{
          position: 'relative'
        }}>
          <tr>
            <td>
              <div
                ref={el => {this.el = el;}}
                style={{
                  border: 'solid 1px black',
                  overflow: 'hidden',
                  height: '241px',
                  cursor: 'default'
                }}
              />
            </td>
            <td valign="top">
              <div
                ref={el => {this.propertiesEl = el;}}
                style={{
                  border: 'solid 1px black',
                  padding: '10px'
                }}
              />
            </td>
          </tr>
        </table>

        <div
          ref={el => {this.el2 = el;}}
        />
      </>
    );
  }

  componentDidMount() {
    // Note that these XML nodes will be enclosing the
    // mxCell nodes for the model cells in the output
    const doc = mxUtils.createXmlDocument();

    const person1 = doc.createElement('Person');
    person1.setAttribute('firstName', 'Daffy');
    person1.setAttribute('lastName', 'Duck');

    const person2 = doc.createElement('Person');
    person2.setAttribute('firstName', 'Bugs');
    person2.setAttribute('lastName', 'Bunny');

    const relation = doc.createElement('Knows');
    relation.setAttribute('since', '1985');

    // Creates the graph inside the given container
    const graph = new mxGraph(this.el);

    // Optional disabling of sizing
    graph.setCellsResizable(false);

    // Configures the graph contains to resize and
    // add a border at the bottom, right
    graph.setResizeContainer(true);
    graph.minimumContainerSize = new mxRectangle(0, 0, 500, 380);
    graph.setBorder(60);

    // Stops editing on enter key, handles escape
    new mxKeyHandler(graph);

    // Overrides method to disallow edge label editing
    graph.isCellEditable = function(cell) {
      return !this.getModel().isEdge(cell);
    };

    // Overrides method to provide a cell label in the display
    graph.convertValueToString = function(cell) {
      if (mxUtils.isNode(cell.value)) {
        if (cell.value.nodeName.toLowerCase() == 'person') {
          const firstName = cell.getAttribute('firstName', '');
          const lastName = cell.getAttribute('lastName', '');

          if (lastName != null && lastName.length > 0) {
            return `${lastName}, ${firstName}`;
          }

          return firstName;
        }
        if (cell.value.nodeName.toLowerCase() == 'knows') {
          return `${cell.value.nodeName} (Since ${cell.getAttribute(
            'since',
            ''
          )})`;
        }
      }

      return '';
    };

    // Overrides method to store a cell label in the model
    const { cellLabelChanged } = graph;
    graph.cellLabelChanged = function(cell, newValue, autoSize) {
      if (
        mxUtils.isNode(cell.value) &&
        cell.value.nodeName.toLowerCase() == 'person'
      ) {
        const pos = newValue.indexOf(' ');

        const firstName = pos > 0 ? newValue.substring(0, pos) : newValue;
        const lastName =
          pos > 0 ? newValue.substring(pos + 1, newValue.length) : '';

        // Clones the value for correct undo/redo
        const elt = cell.value.cloneNode(true);

        elt.setAttribute('firstName', firstName);
        elt.setAttribute('lastName', lastName);

        newValue = elt;
        autoSize = true;
      }

      cellLabelChanged.apply(this, arguments);
    };

    // Overrides method to create the editing value
    const { getEditingValue } = graph;
    graph.getEditingValue = function(cell) {
      if (
        mxUtils.isNode(cell.value) &&
        cell.value.nodeName.toLowerCase() == 'person'
      ) {
        const firstName = cell.getAttribute('firstName', '');
        const lastName = cell.getAttribute('lastName', '');

        return `${firstName} ${lastName}`;
      }
    };

    // Adds a special tooltip for edges
    graph.setTooltips(true);

    const { getTooltipForCell } = graph;
    graph.getTooltipForCell = function(cell) {
      // Adds some relation details for edges
      if (graph.getModel().isEdge(cell)) {
        const src = this.getLabel(this.getModel().getTerminal(cell, true));
        const trg = this.getLabel(this.getModel().getTerminal(cell, false));

        return `${src} ${cell.value.nodeName} ${trg}`;
      }

      return getTooltipForCell.apply(this, arguments);
    };

    // Enables rubberband selection
    new mxRubberband(graph);

    // Adds an option to view the XML of the graph
    this.el2.appendChild(
      mxUtils.button('View XML', function() {
        const encoder = new mxCodec();
        const node = encoder.encode(graph.getModel());
        mxUtils.popup(mxUtils.getPrettyXml(node), true);
      })
    );

    // Changes the style for match the markup
    // Creates the default style for vertices
    let style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_STROKECOLOR] = 'gray';
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_SHADOW] = true;
    style[mxConstants.STYLE_FILLCOLOR] = '#DFDFDF';
    style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_FONTSIZE] = '12';
    style[mxConstants.STYLE_SPACING] = 4;

    // Creates the default style for edges
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_STROKECOLOR] = '#0C0C0C';
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_FONTSIZE] = '10';

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, person1, 40, 40, 80, 30);
      const v2 = graph.insertVertex(parent, null, person2, 200, 150, 80, 30);
      const e1 = graph.insertEdge(parent, null, relation, v1, v2);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    // Implements a properties panel that uses
    // mxCellAttributeChange to change properties
    graph
      .getSelectionModel()
      .addListener(mxEvent.CHANGE, function(sender, evt) {
        this.selectionChanged(graph);
      });

    this.selectionChanged(graph);
  }

  /**
   * Updates the properties panel
   */
  selectionChanged(graph) {
    const div = this.propertiesEl;

    // Forces focusout in IE
    graph.container.focus();

    // Clears the DIV the non-DOM way
    div.innerHTML = '';

    // Gets the selection cell
    const cell = graph.getSelectionCell();

    if (cell == null) {
      mxUtils.writeln(div, 'Nothing selected.');
    } else {
      // Writes the title
      const center = document.createElement('center');
      mxUtils.writeln(center, `${cell.value.nodeName} (${cell.id})`);
      div.appendChild(center);
      mxUtils.br(div);

      // Creates the form from the attributes of the user object
      const form = new mxForm();

      const attrs = cell.value.attributes;

      for (let i = 0; i < attrs.length; i++) {
        this.createTextField(graph, form, cell, attrs[i]);
      }

      div.appendChild(form.getTable());
      mxUtils.br(div);
    }
  }

  /**
   * Creates the textfield for the given property.
   */
  createTextField(graph, form, cell, attribute) {
    const input = form.addText(`${attribute.nodeName}:`, attribute.nodeValue);

    const applyHandler = function() {
      const newValue = input.value || '';
      const oldValue = cell.getAttribute(attribute.nodeName, '');

      if (newValue != oldValue) {
        graph.getModel().beginUpdate();

        try {
          const edit = new mxCellAttributeChange(
            cell,
            attribute.nodeName,
            newValue
          );
          graph.getModel().execute(edit);
          graph.updateCellSize(cell);
        } finally {
          graph.getModel().endUpdate();
        }
      }
    };

    mxEvent.addListener(input, 'keypress', function(evt) {
      // Needs to take shift into account for textareas
      if (evt.keyCode == /* enter */ 13 && !mxEvent.isShiftDown(evt)) {
        input.blur();
      }
    });

    // Note: Known problem is the blurring of fields in
    // Firefox by changing the selection, in which case
    // no event is fired in FF and the change is lost.
    // As a workaround you should use a local variable
    // that stores the focused field and invoke blur
    // explicitely where we do the graph.focus above.
    mxEvent.addListener(input, 'blur', applyHandler);
  }
}

export default UserObject;
