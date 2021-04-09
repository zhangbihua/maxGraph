/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxImage from '../../util/image/mxImage';
import mxEventObject from '../../util/event/mxEventObject';
import mxEventSource from '../../util/event/mxEventSource';
import mxEvent from '../../util/event/mxEvent';
import mxEdgeStyle from '../../util/datatypes/style/mxEdgeStyle';
import mxRectangle from '../../util/datatypes/mxRectangle';
import mxPanningManager from '../../util/drag_pan/mxPanningManager';
import mxTooltipHandler from '../../handler/mxTooltipHandler';
import mxClient from '../../mxClient';
import mxSelectionCellsHandler from '../../handler/mxSelectionCellsHandler';
import mxConnectionHandler from '../../handler/mxConnectionHandler';
import mxGraphHandler from '../../handler/mxGraphHandler';
import mxPanningHandler from '../../handler/mxPanningHandler';
import mxPopupMenuHandler from '../../handler/mxPopupMenuHandler';
import mxGraphSelectionModel from './mxGraphSelectionModel';
import mxGraphView from './mxGraphView';
import mxCellRenderer from '../cell/mxCellRenderer';
import mxCellEditor from '../cell/mxCellEditor';
import mxCellOverlay from '../cell/mxCellOverlay';
import mxPoint from '../../util/datatypes/mxPoint';
import mxUtils from '../../util/mxUtils';
import mxConnectionConstraint from '../connection/mxConnectionConstraint';
import mxDictionary from '../../util/datatypes/mxDictionary';
import mxVertexHandler from '../../handler/mxVertexHandler';
import mxEdgeHandler from '../../handler/mxEdgeHandler';
import mxEdgeSegmentHandler from '../../handler/mxEdgeSegmentHandler';
import mxElbowEdgeHandler from '../../handler/mxElbowEdgeHandler';
import mxMouseEvent from '../../util/event/mxMouseEvent';
import mxResources from '../../util/mxResources';
import mxGeometry from '../../util/datatypes/mxGeometry';
import mxCell from '../cell/mxCell';
import mxGraphModel from './mxGraphModel';
import mxStylesheet from '../../util/datatypes/style/mxStylesheet';
import mxConstants from '../../util/mxConstants';
import mxMultiplicity from "../connection/mxMultiplicity";

import mxChildChange from '../../atomic_changes/mxChildChange';
import mxGeometryChange from '../../atomic_changes/mxGeometryChange';
import mxRootChange from '../../atomic_changes/mxRootChange';
import mxStyleChange from '../../atomic_changes/mxStyleChange';
import mxTerminalChange from '../../atomic_changes/mxTerminalChange';
import mxValueChange from '../../atomic_changes/mxValueChange';
import mxPolyline from '../../shape/edge/mxPolyline';
import mxCellState from '../../util/datatypes/mxCellState';
import mxImageBundle from "../../util/image/mxImageBundle";
import mxCodecRegistry from "../../serialization/mxCodecRegistry";
import mxShape from "../../shape/mxShape";
import mxLabel from "../../shape/mxLabel";

/**
 * Class: mxGraph
 *
 * Extends <mxEventSource> to implement a graph component for
 * the browser. This is the main class of the package. To activate
 * panning and connections use <setPanning> and <setConnectable>.
 * For rubberband selection you must create a new instance of
 * <mxRubberband>. The following listeners are added to
 * <mouseListeners> by default:
 *
 * - <tooltipHandler>: <mxTooltipHandler> that displays tooltips
 * - <panningHandler>: <mxPanningHandler> for panning and popup menus
 * - <connectionHandler>: <mxConnectionHandler> for creating connections
 * - <graphHandler>: <mxGraphHandler> for moving and cloning cells
 *
 * These listeners will be called in the above order if they are enabled.
 *
 * Background Images:
 *
 * To display a background image, set the image, image width and
 * image height using <setBackgroundImage>. If one of the
 * above values has changed then the <view>'s <mxGraphView.validate>
 * should be invoked.
 *
 * Cell Images:
 *
 * To use images in cells, a shape must be specified in the default
 * vertex style (or any named style). Possible shapes are
 * <mxConstants.SHAPE_IMAGE> and <mxConstants.SHAPE_LABEL>.
 * The code to change the shape used in the default vertex style,
 * the following code is used:
 *
 * (code)
 * let style = graph.getStylesheet().getDefaultVertexStyle();
 * style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
 * (end)
 *
 * For the default vertex style, the image to be displayed can be
 * specified in a cell's style using the <mxConstants.STYLE_IMAGE>
 * key and the image URL as a value, for example:
 *
 * (code)
 * image=http://www.example.com/image.gif
 * (end)
 *
 * For a named style, the the stylename must be the first element
 * of the cell style:
 *
 * (code)
 * stylename;image=http://www.example.com/image.gif
 * (end)
 *
 * A cell style can have any number of key=value pairs added, divided
 * by a semicolon as follows:
 *
 * (code)
 * [stylename;|key=value;]
 * (end)
 *
 * Labels:
 *
 * The cell labels are defined by <getLabel> which uses <convertValueToString>
 * if <labelsVisible> is true. If a label must be rendered as HTML markup, then
 * <isHtmlLabel> should return true for the respective cell. If all labels
 * contain HTML markup, <htmlLabels> can be set to true. NOTE: Enabling HTML
 * labels carries a possible security risk (see the section on security in
 * the manual).
 *
 * If wrapping is needed for a label, then <isHtmlLabel> and <isWrapping> must
 * return true for the cell whose label should be wrapped. See <isWrapping> for
 * an example.
 *
 * If clipping is needed to keep the rendering of a HTML label inside the
 * bounds of its vertex, then <isClipping> should return true for the
 * respective cell.
 *
 * By default, edge labels are movable and vertex labels are fixed. This can be
 * changed by setting <edgeLabelsMovable> and <vertexLabelsMovable>, or by
 * overriding <isLabelMovable>.
 *
 * In-place Editing:
 *
 * In-place editing is started with a doubleclick or by typing F2.
 * Programmatically, <edit> is used to check if the cell is editable
 * (<isCellEditable>) and call <startEditingAtCell>, which invokes
 * <mxCellEditor.startEditing>. The editor uses the value returned
 * by <getEditingValue> as the editing value.
 *
 * After in-place editing, <labelChanged> is called, which invokes
 * <mxGraphModel.setValue>, which in turn calls
 * <mxGraphModel.valueForCellChanged> via <mxValueChange>.
 *
 * The event that triggers in-place editing is passed through to the
 * <cellEditor>, which may take special actions depending on the type of the
 * event or mouse location, and is also passed to <getEditingValue>. The event
 * is then passed back to the event processing functions which can perform
 * specific actions based on the trigger event.
 *
 * Tooltips:
 *
 * Tooltips are implemented by <getTooltip>, which calls <getTooltipForCell>
 * if a cell is under the mousepointer. The default implementation checks if
 * the cell has a getTooltip function and calls it if it exists. Hence, in order
 * to provide custom tooltips, the cell must provide a getTooltip function, or
 * one of the two above functions must be overridden.
 *
 * Typically, for custom cell tooltips, the latter function is overridden as
 * follows:
 *
 * (code)
 * graph.getTooltipForCell = (cell)=>
 * {
 *   let label = this.convertValueToString(cell);
 *   return 'Tooltip for '+label;
 * }
 * (end)
 *
 * When using a config file, the function is overridden in the mxGraph section
 * using the following entry:
 *
 * (code)
 * <add as="getTooltipForCell"><![CDATA[
 *   (cell)=>
 *   {
 *     let label = this.convertValueToString(cell);
 *     return 'Tooltip for '+label;
 *   }
 * ]]></add>
 * (end)
 *
 * "this" refers to the graph in the implementation, so for example to check if
 * a cell is an edge, you use this.getModel().isEdge(cell)
 *
 * For replacing the default implementation of <getTooltipForCell> (rather than
 * replacing the function on a specific instance), the following code should be
 * used after loading the JavaScript files, but before creating a new mxGraph
 * instance using <mxGraph>:
 *
 * (code)
 * getTooltipForCell = (cell)=>
 * {
 *   let label = this.convertValueToString(cell);
 *   return 'Tooltip for '+label;
 * }
 * (end)
 *
 * Shapes & Styles:
 *
 * The implementation of new shapes is demonstrated in the examples. We'll assume
 * that we have implemented a custom shape with the name BoxShape which we want
 * to use for drawing vertices. To use this shape, it must first be registered in
 * the cell renderer as follows:
 *
 * (code)
 * mxCellRenderer.registerShape('box', BoxShape);
 * (end)
 *
 * The code registers the BoxShape constructor under the name box in the cell
 * renderer of the graph. The shape can now be referenced using the shape-key in
 * a style definition. (The cell renderer contains a set of additional shapes,
 * namely one for each constant with a SHAPE-prefix in <mxConstants>.)
 *
 * Styles are a collection of key, value pairs and a stylesheet is a collection
 * of named styles. The names are referenced by the cellstyle, which is stored
 * in <mxCell.style> with the following format: [stylename;|key=value;]. The
 * string is resolved to a collection of key, value pairs, where the keys are
 * overridden with the values in the string.
 *
 * When introducing a new shape, the name under which the shape is registered
 * must be used in the stylesheet. There are three ways of doing this:
 *
 *   - By changing the default style, so that all vertices will use the new
 *     shape
 *   - By defining a new style, so that only vertices with the respective
 *     cellstyle will use the new shape
 *   - By using shape=box in the cellstyle's optional list of key, value pairs
 *     to be overridden
 *
 * In the first case, the code to fetch and modify the default style for
 * vertices is as follows:
 *
 * (code)
 * let style = graph.getStylesheet().getDefaultVertexStyle();
 * style[mxConstants.STYLE_SHAPE] = 'box';
 * (end)
 *
 * The code takes the default vertex style, which is used for all vertices that
 * do not have a specific cellstyle, and modifies the value for the shape-key
 * in-place to use the new BoxShape for drawing vertices. This is done by
 * assigning the box value in the second line, which refers to the name of the
 * BoxShape in the cell renderer.
 *
 * In the second case, a collection of key, value pairs is created and then
 * added to the stylesheet under a new name. In order to distinguish the
 * shapename and the stylename we'll use boxstyle for the stylename:
 *
 * (code)
 * let style = {};
 * style[mxConstants.STYLE_SHAPE] = 'box';
 * style[mxConstants.STYLE_STROKECOLOR] = '#000000';
 * style[mxConstants.STYLE_FONTCOLOR] = '#000000';
 * graph.getStylesheet().putCellStyle('boxstyle', style);
 * (end)
 *
 * The code adds a new style with the name boxstyle to the stylesheet. To use
 * this style with a cell, it must be referenced from the cellstyle as follows:
 *
 * (code)
 * let vertex = graph.insertVertex(parent, null, 'Hello, World!', 20, 20, 80, 20,
 *         'boxstyle');
 * (end)
 *
 * To summarize, each new shape must be registered in the <mxCellRenderer> with
 * a unique name. That name is then used as the value of the shape-key in a
 * default or custom style. If there are multiple custom shapes, then there
 * should be a separate style for each shape.
 *
 * Inheriting Styles:
 *
 * For fill-, stroke-, gradient-, font- and indicatorColors special keywords
 * can be used. The inherit keyword for one of these colors will inherit the
 * color for the same key from the parent cell. The swimlane keyword does the
 * same, but inherits from the nearest swimlane in the ancestor hierarchy.
 * Finally, the indicated keyword will use the color of the indicator as the
 * color for the given key.
 *
 * Scrollbars:
 *
 * The <containers> overflow CSS property defines if scrollbars are used to
 * display the graph. For values of 'auto' or 'scroll', the scrollbars will
 * be shown. Note that the <resizeContainer> flag is normally not used
 * together with scrollbars, as it will resize the container to match the
 * size of the graph after each change.
 *
 * Multiplicities and Validation:
 *
 * To control the possible connections in mxGraph, <getEdgeValidationError> is
 * used. The default implementation of the function uses <multiplicities>,
 * which is an array of <mxMultiplicity>. Using this class allows to establish
 * simple multiplicities, which are enforced by the graph.
 *
 * The <mxMultiplicity> uses <mxCell.is> to determine for which terminals it
 * applies. The default implementation of <mxCell.is> works with DOM nodes (XML
 * nodes) and checks if the given type parameter matches the nodeName of the
 * node (case insensitive). Optionally, an attributename and value can be
 * specified which are also checked.
 *
 * <getEdgeValidationError> is called whenever the connectivity of an edge
 * changes. It returns an empty string or an error message if the edge is
 * invalid or null if the edge is valid. If the returned string is not empty
 * then it is displayed as an error message.
 *
 * <mxMultiplicity> allows to specify the multiplicity between a terminal and
 * its possible neighbors. For example, if any rectangle may only be connected
 * to, say, a maximum of two circles you can add the following rule to
 * <multiplicities>:
 *
 * (code)
 * graph.multiplicities.push(new mxMultiplicity(
 *   true, 'rectangle', null, null, 0, 2, ['circle'],
 *   'Only 2 targets allowed',
 *   'Only shape targets allowed'));
 * (end)
 *
 * This will display the first error message whenever a rectangle is connected
 * to more than two circles and the second error message if a rectangle is
 * connected to anything but a circle.
 *
 * For certain multiplicities, such as a minimum of 1 connection, which cannot
 * be enforced at cell creation time (unless the cell is created together with
 * the connection), mxGraph offers <validate> which checks all multiplicities
 * for all cells and displays the respective error messages in an overlay icon
 * on the cells.
 *
 * If a cell is collapsed and contains validation errors, a respective warning
 * icon is attached to the collapsed cell.
 *
 * Auto-Layout:
 *
 * For automatic layout, the <getLayout> hook is provided in <mxLayoutManager>.
 * It can be overridden to return a layout algorithm for the children of a
 * given cell.
 *
 * Unconnected edges:
 *
 * The default values for all switches are designed to meet the requirements of
 * general diagram drawing applications. A very typical set of settings to
 * avoid edges that are not connected is the following:
 *
 * (code)
 * graph.setAllowDanglingEdges(false);
 * graph.setDisconnectOnMove(false);
 * (end)
 *
 * Setting the <cloneInvalidEdges> switch to true is optional. This switch
 * controls if edges are inserted after a copy, paste or clone-drag if they are
 * invalid. For example, edges are invalid if copied or control-dragged without
 * having selected the corresponding terminals and allowDanglingEdges is
 * false, in which case the edges will not be cloned if the switch is false.
 *
 * Output:
 *
 * To produce an XML representation for a diagram, the following code can be
 * used.
 *
 * (code)
 * let enc = new mxCodec(mxUtils.createXmlDocument());
 * let node = enc.encode(graph.getModel());
 * (end)
 *
 * This will produce an XML node than can be handled using the DOM API or
 * turned into a string representation using the following code:
 *
 * (code)
 * let xml = mxUtils.getXml(node);
 * (end)
 *
 * To obtain a formatted string, mxUtils.getPrettyXml can be used instead.
 *
 * This string can now be stored in a local persistent storage (for example
 * using Google Gears) or it can be passed to a backend using mxUtils.post as
 * follows. The url variable is the URL of the Java servlet, PHP page or HTTP
 * handler, depending on the server.
 *
 * (code)
 * let xmlString = encodeURIComponent(mxUtils.getXml(node));
 * mxUtils.post(url, 'xml='+xmlString, (req)=>
 * {
 *   // Process server response using req of type mxXmlRequest
 * });
 * (end)
 *
 * Input:
 *
 * To load an XML representation of a diagram into an existing graph object
 * mxUtils.load can be used as follows. The url variable is the URL of the Java
 * servlet, PHP page or HTTP handler that produces the XML string.
 *
 * (code)
 * let xmlDoc = mxUtils.load(url).getXml();
 * let node = xmlDoc.documentElement;
 * let dec = new mxCodec(node.ownerDocument);
 * dec.decode(node, graph.getModel());
 * (end)
 *
 * For creating a page that loads the client and a diagram using a single
 * request please refer to the deployment examples in the backends.
 *
 * Functional dependencies:
 *
 * (see images/callgraph.png)
 *
 * Resources:
 *
 * resources/graph - Language resources for mxGraph
 *
 * Group: Events
 *
 * Event: mxEvent.ROOT
 *
 * Fires if the root in the model has changed. This event has no properties.
 *
 * Event: mxEvent.ALIGN_CELLS
 *
 * Fires between begin- and endUpdate in <alignCells>. The <code>cells</code>
 * and <code>align</code> properties contain the respective arguments that were
 * passed to <alignCells>.
 *
 * Event: mxEvent.FLIP_EDGE
 *
 * Fires between begin- and endUpdate in <flipEdge>. The <code>edge</code>
 * property contains the edge passed to <flipEdge>.
 *
 * Event: mxEvent.ORDER_CELLS
 *
 * Fires between begin- and endUpdate in <orderCells>. The <code>cells</code>
 * and <code>back</code> properties contain the respective arguments that were
 * passed to <orderCells>.
 *
 * Event: mxEvent.CELLS_ORDERED
 *
 * Fires between begin- and endUpdate in <cellsOrdered>. The <code>cells</code>
 * and <code>back</code> arguments contain the respective arguments that were
 * passed to <cellsOrdered>.
 *
 * Event: mxEvent.GROUP_CELLS
 *
 * Fires between begin- and endUpdate in <groupCells>. The <code>group</code>,
 * <code>cells</code> and <code>border</code> arguments contain the respective
 * arguments that were passed to <groupCells>.
 *
 * Event: mxEvent.UNGROUP_CELLS
 *
 * Fires between begin- and endUpdate in <ungroupCells>. The <code>cells</code>
 * property contains the array of cells that was passed to <ungroupCells>.
 *
 * Event: mxEvent.REMOVE_CELLS_FROM_PARENT
 *
 * Fires between begin- and endUpdate in <removeCellsFromParent>. The
 * <code>cells</code> property contains the array of cells that was passed to
 * <removeCellsFromParent>.
 *
 * Event: mxEvent.ADD_CELLS
 *
 * Fires between begin- and endUpdate in <addCells>. The <code>cells</code>,
 * <code>parent</code>, <code>index</code>, <code>source</code> and
 * <code>target</code> properties contain the respective arguments that were
 * passed to <addCells>.
 *
 * Event: mxEvent.CELLS_ADDED
 *
 * Fires between begin- and endUpdate in <cellsAdded>. The <code>cells</code>,
 * <code>parent</code>, <code>index</code>, <code>source</code>,
 * <code>target</code> and <code>absolute</code> properties contain the
 * respective arguments that were passed to <cellsAdded>.
 *
 * Event: mxEvent.REMOVE_CELLS
 *
 * Fires between begin- and endUpdate in <removeCells>. The <code>cells</code>
 * and <code>includeEdges</code> arguments contain the respective arguments
 * that were passed to <removeCells>.
 *
 * Event: mxEvent.CELLS_REMOVED
 *
 * Fires between begin- and endUpdate in <cellsRemoved>. The <code>cells</code>
 * argument contains the array of cells that was removed.
 *
 * Event: mxEvent.SPLIT_EDGE
 *
 * Fires between begin- and endUpdate in <splitEdge>. The <code>edge</code>
 * property contains the edge to be splitted, the <code>cells</code>,
 * <code>newEdge</code>, <code>dx</code> and <code>dy</code> properties contain
 * the respective arguments that were passed to <splitEdge>.
 *
 * Event: mxEvent.TOGGLE_CELLS
 *
 * Fires between begin- and endUpdate in <toggleCells>. The <code>show</code>,
 * <code>cells</code> and <code>includeEdges</code> properties contain the
 * respective arguments that were passed to <toggleCells>.
 *
 * Event: mxEvent.FOLD_CELLS
 *
 * Fires between begin- and endUpdate in <foldCells>. The
 * <code>collapse</code>, <code>cells</code> and <code>recurse</code>
 * properties contain the respective arguments that were passed to <foldCells>.
 *
 * Event: mxEvent.CELLS_FOLDED
 *
 * Fires between begin- and endUpdate in cellsFolded. The
 * <code>collapse</code>, <code>cells</code> and <code>recurse</code>
 * properties contain the respective arguments that were passed to
 * <cellsFolded>.
 *
 * Event: mxEvent.UPDATE_CELL_SIZE
 *
 * Fires between begin- and endUpdate in <updateCellSize>. The
 * <code>cell</code> and <code>ignoreChildren</code> properties contain the
 * respective arguments that were passed to <updateCellSize>.
 *
 * Event: mxEvent.RESIZE_CELLS
 *
 * Fires between begin- and endUpdate in <resizeCells>. The <code>cells</code>
 * and <code>bounds</code> properties contain the respective arguments that
 * were passed to <resizeCells>.
 *
 * Event: mxEvent.CELLS_RESIZED
 *
 * Fires between begin- and endUpdate in <cellsResized>. The <code>cells</code>
 * and <code>bounds</code> properties contain the respective arguments that
 * were passed to <cellsResized>.
 *
 * Event: mxEvent.MOVE_CELLS
 *
 * Fires between begin- and endUpdate in <moveCells>. The <code>cells</code>,
 * <code>dx</code>, <code>dy</code>, <code>clone</code>, <code>target</code>
 * and <code>event</code> properties contain the respective arguments that
 * were passed to <moveCells>.
 *
 * Event: mxEvent.CELLS_MOVED
 *
 * Fires between begin- and endUpdate in <cellsMoved>. The <code>cells</code>,
 * <code>dx</code>, <code>dy</code> and <code>disconnect</code> properties
 * contain the respective arguments that were passed to <cellsMoved>.
 *
 * Event: mxEvent.CONNECT_CELL
 *
 * Fires between begin- and endUpdate in <connectCell>. The <code>edge</code>,
 * <code>terminal</code> and <code>source</code> properties contain the
 * respective arguments that were passed to <connectCell>.
 *
 * Event: mxEvent.CELL_CONNECTED
 *
 * Fires between begin- and endUpdate in <cellConnected>. The
 * <code>edge</code>, <code>terminal</code> and <code>source</code> properties
 * contain the respective arguments that were passed to <cellConnected>.
 *
 * Event: mxEvent.REFRESH
 *
 * Fires after <refresh> was executed. This event has no properties.
 *
 * Event: mxEvent.CLICK
 *
 * Fires in <click> after a click event. The <code>event</code> property
 * contains the original mouse event and <code>cell</code> property contains
 * the cell under the mouse or null if the background was clicked.
 *
 * Event: mxEvent.DOUBLE_CLICK
 *
 * Fires in <dblClick> after a double click. The <code>event</code> property
 * contains the original mouse event and the <code>cell</code> property
 * contains the cell under the mouse or null if the background was clicked.
 *
 * Event: mxEvent.GESTURE
 *
 * Fires in <fireGestureEvent> after a touch gesture. The <code>event</code>
 * property contains the original gesture end event and the <code>cell</code>
 * property contains the optional cell associated with the gesture.
 *
 * Event: mxEvent.TAP_AND_HOLD
 *
 * Fires in <tapAndHold> if a tap and hold event was detected. The <code>event</code>
 * property contains the initial touch event and the <code>cell</code> property
 * contains the cell under the mouse or null if the background was clicked.
 *
 * Event: mxEvent.FIRE_MOUSE_EVENT
 *
 * Fires in <fireMouseEvent> before the mouse listeners are invoked. The
 * <code>eventName</code> property contains the event name and the
 * <code>event</code> property contains the <mxMouseEvent>.
 *
 * Event: mxEvent.SIZE
 *
 * Fires after <sizeDidChange> was executed. The <code>bounds</code> property
 * contains the new graph bounds.
 *
 * Event: mxEvent.START_EDITING
 *
 * Fires before the in-place editor starts in <startEditingAtCell>. The
 * <code>cell</code> property contains the cell that is being edited and the
 * <code>event</code> property contains the optional event argument that was
 * passed to <startEditingAtCell>.
 *
 * Event: mxEvent.EDITING_STARTED
 *
 * Fires after the in-place editor starts in <startEditingAtCell>. The
 * <code>cell</code> property contains the cell that is being edited and the
 * <code>event</code> property contains the optional event argument that was
 * passed to <startEditingAtCell>.
 *
 * Event: mxEvent.EDITING_STOPPED
 *
 * Fires after the in-place editor stops in <stopEditing>.
 *
 * Event: mxEvent.LABEL_CHANGED
 *
 * Fires between begin- and endUpdate in <cellLabelChanged>. The
 * <code>cell</code> property contains the cell, the <code>value</code>
 * property contains the new value for the cell, the <code>old</code> property
 * contains the old value and the optional <code>event</code> property contains
 * the mouse event that started the edit.
 *
 * Event: mxEvent.ADD_OVERLAY
 *
 * Fires after an overlay is added in <addCellOverlay>. The <code>cell</code>
 * property contains the cell and the <code>overlay</code> property contains
 * the <mxCellOverlay> that was added.
 *
 * Event: mxEvent.REMOVE_OVERLAY
 *
 * Fires after an overlay is removed in <removeCellOverlay> and
 * <removeCellOverlays>. The <code>cell</code> property contains the cell and
 * the <code>overlay</code> property contains the <mxCellOverlay> that was
 * removed.
 *
 * Constructor: mxGraph
 *
 * Constructs a new mxGraph in the specified container. Model is an optional
 * mxGraphModel. If no model is provided, a new mxGraphModel instance is
 * used as the model. The container must have a valid owner document prior
 * to calling this function in Internet Explorer.
 *
 * Example:
 *
 * To create a graph inside a DOM node with an id of graph:
 * (code)
 * let container = document.getElementById('graph');
 * let graph = new mxGraph(container);
 * (end)
 *
 * Parameters:
 *
 * container - Optional DOM node that acts as a container for the graph.
 * If this is null then the container can be initialized later using
 * <init>.
 * model - Optional <mxGraphModel> that constitutes the graph data.
 * stylesheet - Optional <mxStylesheet> to be used in the graph.
 */
class mxGraph extends mxEventSource {
  constructor(container: HTMLElement,
              model: mxGraphModel,
              renderHint: string=mxConstants.DIALECT_SVG,
              stylesheet: mxStylesheet | null=null) {
    super();

    // Initializes the variable in case the prototype has been
    // modified to hold some listeners (which is possible because
    // the createHandlers call is executed regardless of the
    // arguments passed into the ctor).
    this.mouseListeners = null;

    // Converts the renderHint into a dialect
    this.renderHint = renderHint;
    this.dialect = 'svg';

    // Initializes the main members that do not require a container
    this.model = model != null ? model : new mxGraphModel();
    this.multiplicities = [];
    this.imageBundles = [];
    this.cellRenderer = this.createCellRenderer();
    this.setSelectionModel(this.createSelectionModel());
    this.setStylesheet(
        stylesheet != null ? stylesheet : this.createStylesheet()
    );
    this.view = this.createGraphView();

    // Adds a graph model listener to update the view
    this.graphModelChangeListener = (sender: any, evt: mxEventObject) => {
      this.graphModelChanged(evt.getProperty('edit').changes);
    };

    this.getModel().addListener(mxEvent.CHANGE, this.graphModelChangeListener);

    // Installs basic event handlers with disabled default settings.
    this.createHandlers();

    // Initializes the display if a container was specified
    if (container != null) {
      this.init(container);
    }

    this.getView().revalidate();
  }

  /**
   * Function: init
   *
   * Initializes the <container> and creates the respective datastructures.
   *
   * Parameters:
   *
   * container - DOM node that will contain the graph display.
   */
  init(container: HTMLElement): void {
    this.container = container;

    // Initializes the in-place editor
    this.cellEditor = this.createCellEditor();

    // Initializes the container using the view
    this.getView().init();

    // Updates the size of the container for the current graph
    this.sizeDidChange();

    // Hides tooltips and resets tooltip timer if mouse leaves container
    mxEvent.addListener(
        container,
        'mouseleave',
        (evt: MouseEvent) => {
          if (
              this.tooltipHandler != null &&
              this.tooltipHandler.div != null &&
              this.tooltipHandler.div != evt.relatedTarget
          ) {
            this.tooltipHandler.hide();
          }
        }
    );
  }

  // TODO: Document me!
  container: HTMLElement | null = null;
  destroyed: boolean = false;
  tooltipHandler: mxTooltipHandler | null = null;
  selectionCellsHandler: mxSelectionCellsHandler | null = null;
  panningHandler: mxPanningHandler | null = null;
  popupMenuHandler: mxPopupMenuHandler | null = null;
  connectionHandler: mxConnectionHandler | null = null;
  graphHandler: mxGraphHandler | null = null;
  graphModelChangeListener: Function | null = null;
  shiftPreview1: HTMLElement | null = null;
  shiftPreview2: HTMLElement | null = null;
  panningManager: mxPanningManager | null = null;
  lastTouchEvent: mxMouseEvent | null = null;
  doubleClickCounter: number = 0;
  lastTouchCell: mxCell | null = null;
  fireDoubleClick: boolean | null = null;
  tapAndHoldThread: number | null = null;
  lastMouseX: number | null = null;
  lastMouseY: number | null = null;
  isMouseTrigger: boolean | null = null;
  ignoreMouseEvents: boolean | null = null;
  mouseMoveRedirect: Function | null = null;
  mouseUpRedirect: Function | null = null;
  lastEvent: any; // FIXME: Check if this can be more specific - DOM events or mxEventObjects!
  horizontalPageBreaks: any[] | null = null;
  verticalPageBreaks: any[] | null = null;
  paintBackground: Function | null = null;

  /**
   * Variable: mouseListeners
   *
   * Holds the mouse event listeners. See <fireMouseEvent>.
   */
  mouseListeners: any[] | null = null;

  /**
   * Group: Variables
   */
  /**
   * Variable: isMouseDown
   *
   * Holds the state of the mouse button.
   */
  isMouseDown: boolean = false;

  /**
   * Variable: model
   *
   * Holds the <mxGraphModel> that contains the cells to be displayed.
   */
  model: mxGraphModel | null = null;

  /**
   * Variable: view
   *
   * Holds the <mxGraphView> that caches the <mxCellStates> for the cells.
   */
  view: mxGraphView;

  /**
   * Variable: stylesheet
   *
   * Holds the <mxStylesheet> that defines the appearance of the cells.
   *
   *
   * Example:
   *
   * Use the following code to read a stylesheet into an existing graph.
   *
   * (code)
   * let req = mxUtils.load('stylesheet.xml');
   * let root = req.getDocumentElement();
   * let dec = new mxCodec(root.ownerDocument);
   * dec.decode(root, graph.stylesheet);
   * (end)
   */
  stylesheet: mxStylesheet | null = null;

  /**
   * Variable: selectionModel
   *
   * Holds the <mxGraphSelectionModel> that models the current selection.
   */
  selectionModel: mxGraphSelectionModel | null = null;

  /**
   * Variable: cellEditor
   *
   * Holds the <mxCellEditor> that is used as the in-place editing.
   */
  cellEditor: mxCellEditor | null = null;

  /**
   * Variable: cellRenderer
   *
   * Holds the <mxCellRenderer> for rendering the cells in the graph.
   */
  cellRenderer: mxCellRenderer;

  /**
   * Variable: multiplicities
   *
   * An array of <mxMultiplicities> describing the allowed
   * connections in a graph.
   */
  multiplicities: mxMultiplicity[] | null = null;

  /**
   * Variable: renderHint
   *
   * RenderHint as it was passed to the constructor.
   */
  renderHint: string | null = null;

  /**
   * Variable: dialect
   *
   * Dialect to be used for drawing the graph. Possible values are all
   * constants in <mxConstants> with a DIALECT-prefix.
   */
  dialect: 'svg' | 'mixedHtml' | 'preferHtml' | 'strictHtml' = 'svg';

  /**
   * Variable: gridSize
   *
   * Specifies the grid size. Default is 10.
   */
  gridSize: number = 10;

  /**
   * Variable: gridEnabled
   *
   * Specifies if the grid is enabled. This is used in <snap>. Default is
   * true.
   */
  gridEnabled: boolean = true;

  /**
   * Variable: portsEnabled
   *
   * Specifies if ports are enabled. This is used in <cellConnected> to update
   * the respective style. Default is true.
   */
  portsEnabled: boolean = true;

  /**
   * Variable: nativeDoubleClickEnabled
   *
   * Specifies if native double click events should be detected. Default is true.
   */
  nativeDblClickEnabled: boolean = true;

  /**
   * Variable: doubleTapEnabled
   *
   * Specifies if double taps on touch-based devices should be handled as a
   * double click. Default is true.
   */
  doubleTapEnabled: boolean = true;

  /**
   * Variable: doubleTapTimeout
   *
   * Specifies the timeout for double taps and non-native double clicks. Default
   * is 500 ms.
   */
  doubleTapTimeout: number = 500;

  /**
   * Variable: doubleTapTolerance
   *
   * Specifies the tolerance for double taps and double clicks in quirks mode.
   * Default is 25 pixels.
   */
  doubleTapTolerance: number = 25;

  /**
   * Variable: lastTouchX
   *
   * Holds the x-coordinate of the last touch event for double tap detection.
   */
  lastTouchX: number = 0;

  /**
   * Variable: lastTouchY
   *
   * Holds the y-coordinate of the last touch event for double tap detection.
   */
  lastTouchY: number = 0;

  /**
   * Variable: lastTouchTime
   *
   * Holds the time of the last touch event for double click detection.
   */
  lastTouchTime: number = 0;

  /**
   * Variable: tapAndHoldEnabled
   *
   * Specifies if tap and hold should be used for starting connections on touch-based
   * devices. Default is true.
   */
  tapAndHoldEnabled: boolean = true;

  /**
   * Variable: tapAndHoldDelay
   *
   * Specifies the time for a tap and hold. Default is 500 ms.
   */
  tapAndHoldDelay: number = 500;

  /**
   * Variable: tapAndHoldInProgress
   *
   * True if the timer for tap and hold events is running.
   */
  tapAndHoldInProgress: boolean = false;

  /**
   * Variable: tapAndHoldValid
   *
   * True as long as the timer is running and the touch events
   * stay within the given <tapAndHoldTolerance>.
   */
  tapAndHoldValid: boolean = false;

  /**
   * Variable: initialTouchX
   *
   * Holds the x-coordinate of the intial touch event for tap and hold.
   */
  initialTouchX: number = 0;

  /**
   * Variable: initialTouchY
   *
   * Holds the y-coordinate of the intial touch event for tap and hold.
   */
  initialTouchY: number = 0;

  /**
   * Variable: tolerance
   *
   * Tolerance for a move to be handled as a single click.
   * Default is 4 pixels.
   */
  tolerance: number = 4;

  /**
   * Variable: defaultOverlap
   *
   * Value returned by <getOverlap> if <isAllowOverlapParent> returns
   * true for the given cell. <getOverlap> is used in <constrainChild> if
   * <isConstrainChild> returns true. The value specifies the
   * portion of the child which is allowed to overlap the parent.
   */
  defaultOverlap: number = 0.5;

  /**
   * Variable: defaultParent
   *
   * Specifies the default parent to be used to insert new cells.
   * This is used in <getDefaultParent>. Default is null.
   */
  defaultParent: mxCell | null = null;

  /**
   * Variable: alternateEdgeStyle
   *
   * Specifies the alternate edge style to be used if the main control point
   * on an edge is being doubleclicked. Default is null.
   */
  alternateEdgeStyle: string | null = null;

  /**
   * Variable: backgroundImage
   *
   * Specifies the <mxImage> to be returned by <getBackgroundImage>. Default
   * is null.
   *
   * Example:
   *
   * (code)
   * let img = new mxImage('http://www.example.com/maps/examplemap.jpg', 1024, 768);
   * graph.setBackgroundImage(img);
   * graph.view.validate();
   * (end)
   */
  backgroundImage: mxImage | null = null;

  /**
   * Variable: pageVisible
   *
   * Specifies if the background page should be visible. Default is false.
   * Not yet implemented.
   */
  pageVisible: boolean = false;

  /**
   * Variable: pageBreaksVisible
   *
   * Specifies if a dashed line should be drawn between multiple pages. Default
   * is false. If you change this value while a graph is being displayed then you
   * should call <sizeDidChange> to force an update of the display.
   */
  pageBreaksVisible: boolean = false;

  /**
   * Variable: pageBreakColor
   *
   * Specifies the color for page breaks. Default is 'gray'.
   */
  pageBreakColor: string = 'gray';

  /**
   * Variable: pageBreakDashed
   *
   * Specifies the page breaks should be dashed. Default is true.
   */
  pageBreakDashed: boolean = true;

  /**
   * Variable: minPageBreakDist
   *
   * Specifies the minimum distance for page breaks to be visible. Default is
   * 20 (in pixels).
   */
  minPageBreakDist: number = 20;

  /**
   * Variable: preferPageSize
   *
   * Specifies if the graph size should be rounded to the next page number in
   * <sizeDidChange>. This is only used if the graph container has scrollbars.
   * Default is false.
   */
  preferPageSize: boolean = false;

  /**
   * Variable: pageFormat
   *
   * Specifies the page format for the background page. Default is
   * <mxConstants.PAGE_FORMAT_A4_PORTRAIT>. This is used as the default in
   * <mxPrintPreview> and for painting the background page if <pageVisible> is
   * true and the pagebreaks if <pageBreaksVisible> is true.
   */
  pageFormat: mxRectangle = mxConstants.PAGE_FORMAT_A4_PORTRAIT;

  /**
   * Variable: pageScale
   *
   * Specifies the scale of the background page. Default is 1.5.
   * Not yet implemented.
   */
  pageScale: number = 1.5;

  /**
   * Variable: enabled
   *
   * Specifies the return value for <isEnabled>. Default is true.
   */
  enabled: boolean = true;

  /**
   * Variable: escapeEnabled
   *
   * Specifies if <mxKeyHandler> should invoke <escape> when the escape key
   * is pressed. Default is true.
   */
  escapeEnabled: boolean = true;

  /**
   * Variable: invokesStopCellEditing
   *
   * If true, when editing is to be stopped by way of selection changing,
   * data in diagram changing or other means stopCellEditing is invoked, and
   * changes are saved. This is implemented in a focus handler in
   * <mxCellEditor>. Default is true.
   */
  invokesStopCellEditing: boolean = true;

  /**
   * Variable: enterStopsCellEditing
   *
   * If true, pressing the enter key without pressing control or shift will stop
   * editing and accept the new value. This is used in <mxCellEditor> to stop
   * cell editing. Note: You can always use F2 and escape to stop editing.
   * Default is false.
   */
  enterStopsCellEditing: boolean = false;

  /**
   * Variable: useScrollbarsForPanning
   *
   * Specifies if scrollbars should be used for panning in <panGraph> if
   * any scrollbars are available. If scrollbars are enabled in CSS, but no
   * scrollbars appear because the graph is smaller than the container size,
   * then no panning occurs if this is true. Default is true.
   */
  useScrollbarsForPanning: boolean = true;

  /**
   * Variable: exportEnabled
   *
   * Specifies the return value for <canExportCell>. Default is true.
   */
  exportEnabled: boolean = true;

  /**
   * Variable: importEnabled
   *
   * Specifies the return value for <canImportCell>. Default is true.
   */
  importEnabled: boolean = true;

  /**
   * Variable: cellsLocked
   *
   * Specifies the return value for <isCellLocked>. Default is false.
   */
  cellsLocked: boolean = false;

  /**
   * Variable: cellsCloneable
   *
   * Specifies the return value for <isCellCloneable>. Default is true.
   */
  cellsCloneable: boolean = true;

  /**
   * Variable: foldingEnabled
   *
   * Specifies if folding (collapse and expand via an image icon in the graph
   * should be enabled). Default is true.
   */
  foldingEnabled: boolean = true;

  /**
   * Variable: cellsEditable
   *
   * Specifies the return value for <isCellEditable>. Default is true.
   */
  cellsEditable: boolean = true;

  /**
   * Variable: cellsDeletable
   *
   * Specifies the return value for <isCellDeletable>. Default is true.
   */
  cellsDeletable: boolean = true;

  /**
   * Variable: cellsMovable
   *
   * Specifies the return value for <isCellMovable>. Default is true.
   */
  cellsMovable: boolean = true;

  /**
   * Variable: edgeLabelsMovable
   *
   * Specifies the return value for edges in <isLabelMovable>. Default is true.
   */
  edgeLabelsMovable: boolean = true;

  /**
   * Variable: vertexLabelsMovable
   *
   * Specifies the return value for vertices in <isLabelMovable>. Default is false.
   */
  vertexLabelsMovable: boolean = false;

  /**
   * Variable: dropEnabled
   *
   * Specifies the return value for <isDropEnabled>. Default is false.
   */
  dropEnabled: boolean = false;

  /**
   * Variable: splitEnabled
   *
   * Specifies if dropping onto edges should be enabled. This is ignored if
   * <dropEnabled> is false. If enabled, it will call <splitEdge> to carry
   * out the drop operation. Default is true.
   */
  splitEnabled: boolean = true;

  /**
   * Variable: cellsResizable
   *
   * Specifies the return value for <isCellResizable>. Default is true.
   */
  cellsResizable: boolean = true;

  /**
   * Variable: cellsBendable
   *
   * Specifies the return value for <isCellsBendable>. Default is true.
   */
  cellsBendable: boolean = true;

  /**
   * Variable: cellsSelectable
   *
   * Specifies the return value for <isCellSelectable>. Default is true.
   */
  cellsSelectable: boolean = true;

  /**
   * Variable: cellsDisconnectable
   *
   * Specifies the return value for <isCellDisconntable>. Default is true.
   */
  cellsDisconnectable: boolean = true;

  /**
   * Variable: autoSizeCells
   *
   * Specifies if the graph should automatically update the cell size after an
   * edit. This is used in <isAutoSizeCell>. Default is false.
   */
  autoSizeCells: boolean = false;

  /**
   * Variable: autoSizeCellsOnAdd
   *
   * Specifies if autoSize style should be applied when cells are added. Default is false.
   */
  autoSizeCellsOnAdd: boolean = false;

  /**
   * Variable: autoScroll
   *
   * Specifies if the graph should automatically scroll if the mouse goes near
   * the container edge while dragging. This is only taken into account if the
   * container has scrollbars. Default is true.
   *
   * If you need this to work without scrollbars then set <ignoreScrollbars> to
   * true. Please consult the <ignoreScrollbars> for details. In general, with
   * no scrollbars, the use of <allowAutoPanning> is recommended.
   */
  autoScroll: boolean = true;

  /**
   * Variable: ignoreScrollbars
   *
   * Specifies if the graph should automatically scroll regardless of the
   * scrollbars. This will scroll the container using positive values for
   * scroll positions (ie usually only rightwards and downwards). To avoid
   * possible conflicts with panning, set <translateToScrollPosition> to true.
   */
  ignoreScrollbars: boolean = false;

  /**
   * Variable: translateToScrollPosition
   *
   * Specifies if the graph should automatically convert the current scroll
   * position to a translate in the graph view when a mouseUp event is received.
   * This can be used to avoid conflicts when using <autoScroll> and
   * <ignoreScrollbars> with no scrollbars in the container.
   */
  translateToScrollPosition: boolean = false;

  /**
   * Variable: timerAutoScroll
   *
   * Specifies if autoscrolling should be carried out via mxPanningManager even
   * if the container has scrollbars. This disables <scrollPointToVisible> and
   * uses <mxPanningManager> instead. If this is true then <autoExtend> is
   * disabled. It should only be used with a scroll buffer or when scollbars
   * are visible and scrollable in all directions. Default is false.
   */
  timerAutoScroll: boolean = false;

  /**
   * Variable: allowAutoPanning
   *
   * Specifies if panning via <panGraph> should be allowed to implement autoscroll
   * if no scrollbars are available in <scrollPointToVisible>. To enable panning
   * inside the container, near the edge, set <mxPanningManager.border> to a
   * positive value. Default is false.
   */
  allowAutoPanning: boolean = false;

  /**
   * Variable: autoExtend
   *
   * Specifies if the size of the graph should be automatically extended if the
   * mouse goes near the container edge while dragging. This is only taken into
   * account if the container has scrollbars. Default is true. See <autoScroll>.
   */
  autoExtend: boolean = true;

  /**
   * Variable: maximumGraphBounds
   *
   * <mxRectangle> that specifies the area in which all cells in the diagram
   * should be placed. Uses in <getMaximumGraphBounds>. Use a width or height of
   * 0 if you only want to give a upper, left corner.
   */
  maximumGraphBounds: mxRectangle | null = null;

  /**
   * Variable: minimumGraphSize
   *
   * <mxRectangle> that specifies the minimum size of the graph. This is ignored
   * if the graph container has no scrollbars. Default is null.
   */
  minimumGraphSize: mxRectangle | null = null;

  /**
   * Variable: minimumContainerSize
   *
   * <mxRectangle> that specifies the minimum size of the <container> if
   * <resizeContainer> is true.
   */
  minimumContainerSize: mxRectangle | null = null;

  /**
   * Variable: maximumContainerSize
   *
   * <mxRectangle> that specifies the maximum size of the container if
   * <resizeContainer> is true.
   */
  maximumContainerSize: mxRectangle | null = null;

  /**
   * Variable: resizeContainer
   *
   * Specifies if the container should be resized to the graph size when
   * the graph size has changed. Default is false.
   */
  resizeContainer: boolean = false;

  /**
   * Variable: border
   *
   * Border to be added to the bottom and right side when the container is
   * being resized after the graph has been changed. Default is 0.
   */
  border: number = 0;

  /**
   * Variable: keepEdgesInForeground
   *
   * Specifies if edges should appear in the foreground regardless of their order
   * in the model. If <keepEdgesInForeground> and <keepEdgesInBackground> are
   * both true then the normal order is applied. Default is false.
   */
  keepEdgesInForeground: boolean = false;

  /**
   * Variable: keepEdgesInBackground
   *
   * Specifies if edges should appear in the background regardless of their order
   * in the model. If <keepEdgesInForeground> and <keepEdgesInBackground> are
   * both true then the normal order is applied. Default is false.
   */
  keepEdgesInBackground: boolean = false;

  /**
   * Variable: allowNegativeCoordinates
   *
   * Specifies if negative coordinates for vertices are allowed. Default is true.
   */
  allowNegativeCoordinates: boolean = true;

  /**
   * Variable: constrainChildren
   *
   * Specifies if a child should be constrained inside the parent bounds after a
   * move or resize of the child. Default is true.
   */
  constrainChildren: boolean = true;

  /**
   * Variable: constrainRelativeChildren
   *
   * Specifies if child cells with relative geometries should be constrained
   * inside the parent bounds, if <constrainChildren> is true, and/or the
   * <maximumGraphBounds>. Default is false.
   */
  constrainRelativeChildren: boolean = false;

  /**
   * Variable: extendParents
   *
   * Specifies if a parent should contain the child bounds after a resize of
   * the child. Default is true. This has precedence over <constrainChildren>.
   */
  extendParents: boolean = true;

  /**
   * Variable: extendParentsOnAdd
   *
   * Specifies if parents should be extended according to the <extendParents>
   * switch if cells are added. Default is true.
   */
  extendParentsOnAdd: boolean = true;

  /**
   * Variable: extendParentsOnAdd
   *
   * Specifies if parents should be extended according to the <extendParents>
   * switch if cells are added. Default is false for backwards compatiblity.
   */
  extendParentsOnMove: boolean = false;

  /**
   * Variable: recursiveResize
   *
   * Specifies the return value for <isRecursiveResize>. Default is
   * false for backwards compatiblity.
   */
  recursiveResize: boolean = false;

  /**
   * Variable: collapseToPreferredSize
   *
   * Specifies if the cell size should be changed to the preferred size when
   * a cell is first collapsed. Default is true.
   */
  collapseToPreferredSize: boolean = true;

  /**
   * Variable: zoomFactor
   *
   * Specifies the factor used for <zoomIn> and <zoomOut>. Default is 1.2
   * (120%).
   */
  zoomFactor: number = 1.2;

  /**
   * Variable: keepSelectionVisibleOnZoom
   *
   * Specifies if the viewport should automatically contain the selection cells
   * after a zoom operation. Default is false.
   */
  keepSelectionVisibleOnZoom: boolean = false;

  /**
   * Variable: centerZoom
   *
   * Specifies if the zoom operations should go into the center of the actual
   * diagram rather than going from top, left. Default is true.
   */
  centerZoom: boolean = true;

  /**
   * Variable: resetViewOnRootChange
   *
   * Specifies if the scale and translate should be reset if the root changes in
   * the model. Default is true.
   */
  resetViewOnRootChange: boolean = true;

  /**
   * Variable: resetEdgesOnResize
   *
   * Specifies if edge control points should be reset after the resize of a
   * connected cell. Default is false.
   */
  resetEdgesOnResize: boolean = false;

  /**
   * Variable: resetEdgesOnMove
   *
   * Specifies if edge control points should be reset after the move of a
   * connected cell. Default is false.
   */
  resetEdgesOnMove: boolean = false;

  /**
   * Variable: resetEdgesOnConnect
   *
   * Specifies if edge control points should be reset after the the edge has been
   * reconnected. Default is true.
   */
  resetEdgesOnConnect: boolean = true;

  /**
   * Variable: allowLoops
   *
   * Specifies if loops (aka self-references) are allowed. Default is false.
   */
  allowLoops: boolean = false;

  /**
   * Variable: defaultLoopStyle
   *
   * <mxEdgeStyle> to be used for loops. This is a fallback for loops if the
   * <mxConstants.STYLE_LOOP> is undefined. Default is <mxEdgeStyle.Loop>.
   */
  defaultLoopStyle = mxEdgeStyle.Loop;

  /**
   * Variable: multigraph
   *
   * Specifies if multiple edges in the same direction between the same pair of
   * vertices are allowed. Default is true.
   */
  multigraph: boolean = true;

  /**
   * Variable: connectableEdges
   *
   * Specifies if edges are connectable. Default is false. This overrides the
   * connectable field in edges.
   */
  connectableEdges: boolean = false;

  /**
   * Variable: allowDanglingEdges
   *
   * Specifies if edges with disconnected terminals are allowed in the graph.
   * Default is true.
   */
  allowDanglingEdges: boolean = true;

  /**
   * Variable: cloneInvalidEdges
   *
   * Specifies if edges that are cloned should be validated and only inserted
   * if they are valid. Default is true.
   */
  cloneInvalidEdges: boolean = false;

  /**
   * Variable: disconnectOnMove
   *
   * Specifies if edges should be disconnected from their terminals when they
   * are moved. Default is true.
   */
  disconnectOnMove: boolean = true;

  /**
   * Variable: labelsVisible
   *
   * Specifies if labels should be visible. This is used in <getLabel>. Default
   * is true.
   */
  labelsVisible: boolean = true;

  /**
   * Variable: htmlLabels
   *
   * Specifies the return value for <isHtmlLabel>. Default is false.
   */
  htmlLabels: boolean = false;

  /**
   * Variable: swimlaneSelectionEnabled
   *
   * Specifies if swimlanes should be selectable via the content if the
   * mouse is released. Default is true.
   */
  swimlaneSelectionEnabled: boolean = true;

  /**
   * Variable: swimlaneNesting
   *
   * Specifies if nesting of swimlanes is allowed. Default is true.
   */
  swimlaneNesting: boolean = true;

  /**
   * Variable: swimlaneIndicatorColorAttribute
   *
   * The attribute used to find the color for the indicator if the indicator
   * color is set to 'swimlane'. Default is <mxConstants.STYLE_FILLCOLOR>.
   */
  swimlaneIndicatorColorAttribute: string = mxConstants.STYLE_FILLCOLOR;

  /**
   * Variable: imageBundles
   *
   * Holds the list of image bundles.
   */
  imageBundles: mxImageBundle[] = [];

  /**
   * Variable: minFitScale
   *
   * Specifies the minimum scale to be applied in <fit>. Default is 0.1. Set this
   * to null to allow any value.
   */
  minFitScale: number = 0.1;

  /**
   * Variable: maxFitScale
   *
   * Specifies the maximum scale to be applied in <fit>. Default is 8. Set this
   * to null to allow any value.
   */
  maxFitScale: number = 8;

  /**
   * Variable: panDx
   *
   * Current horizontal panning value. Default is 0.
   */
  panDx: number = 0;

  /**
   * Variable: panDy
   *
   * Current vertical panning value. Default is 0.
   */
  panDy: number = 0;

  /**
   * Variable: collapsedImage
   *
   * Specifies the <mxImage> to indicate a collapsed state.
   * Default value is mxClient.imageBasePath + '/collapsed.gif'
   */
  collapsedImage: mxImage = new mxImage(`${mxClient.imageBasePath}/collapsed.gif`, 9, 9);

  /**
   * Variable: expandedImage
   *
   * Specifies the <mxImage> to indicate a expanded state.
   * Default value is mxClient.imageBasePath + '/expanded.gif'
   */
  expandedImage: mxImage = new mxImage(`${mxClient.imageBasePath}/expanded.gif`, 9, 9);

  /**
   * Variable: warningImage
   *
   * Specifies the <mxImage> for the image to be used to display a warning
   * overlay. See <setCellWarning>. Default value is mxClient.imageBasePath +
   * '/warning'.  The extension for the image depends on the platform. It is
   * '.png' on the Mac and '.gif' on all other platforms.
   */
  warningImage: mxImage = new mxImage(
    `${mxClient.imageBasePath}/warning${mxClient.IS_MAC ? '.png' : '.gif'}`,
    16,
    16
  );

  /**
   * Variable: alreadyConnectedResource
   *
   * Specifies the resource key for the error message to be displayed in
   * non-multigraphs when two vertices are already connected. If the resource
   * for this key does not exist then the value is used as the error message.
   * Default is 'alreadyConnected'.
   */
  alreadyConnectedResource: string =
    mxClient.language != 'none' ? 'alreadyConnected' : '';

  /**
   * Variable: containsValidationErrorsResource
   *
   * Specifies the resource key for the warning message to be displayed when
   * a collapsed cell contains validation errors. If the resource for this
   * key does not exist then the value is used as the warning message.
   * Default is 'containsValidationErrors'.
   */
  containsValidationErrorsResource: string =
    mxClient.language != 'none' ? 'containsValidationErrors' : '';

  /**
   * Variable: collapseExpandResource
   *
   * Specifies the resource key for the tooltip on the collapse/expand icon.
   * If the resource for this key does not exist then the value is used as
   * the tooltip. Default is 'collapse-expand'.
   */
  collapseExpandResource: string =
      mxClient.language != 'none' ? 'collapse-expand' : '';

  // TODO: Document me!!
  batchUpdate(fn: Function): void {
    (<mxGraphModel>this.getModel()).beginUpdate();
    try {
      fn()
    } finally {
      (<mxGraphModel>this.getModel()).endUpdate();
    }
  }

  /**
   * Function: createHandlers
   *
   * Creates the tooltip-, panning-, connection- and graph-handler (in this
   * order). This is called in the constructor before <init> is called.
   */
  createHandlers(): void {
    this.tooltipHandler = this.createTooltipHandler();
    this.tooltipHandler.setEnabled(false);
    this.selectionCellsHandler = this.createSelectionCellsHandler();
    this.connectionHandler = this.createConnectionHandler();
    this.connectionHandler.setEnabled(false);
    this.graphHandler = this.createGraphHandler();
    this.panningHandler = this.createPanningHandler();
    this.panningHandler.panningEnabled = false;
    this.popupMenuHandler = this.createPopupMenuHandler();
  }

  /**
   * Function: createTooltipHandler
   *
   * Creates and returns a new <mxTooltipHandler> to be used in this graph.
   */
  createTooltipHandler(): mxTooltipHandler {
    return new mxTooltipHandler(this);
  }

  /**
   * Function: createSelectionCellsHandler
   *
   * Creates and returns a new <mxTooltipHandler> to be used in this graph.
   */
  createSelectionCellsHandler(): mxSelectionCellsHandler {
    return new mxSelectionCellsHandler(this);
  }

  /**
   * Function: createConnectionHandler
   *
   * Creates and returns a new <mxConnectionHandler> to be used in this graph.
   */
  createConnectionHandler(): mxConnectionHandler {
    return new mxConnectionHandler(this);
  }

  /**
   * Function: createGraphHandler
   *
   * Creates and returns a new <mxGraphHandler> to be used in this graph.
   */
  createGraphHandler(): mxGraphHandler {
    return new mxGraphHandler(this);
  }

  /**
   * Function: createPanningHandler
   *
   * Creates and returns a new <mxPanningHandler> to be used in this graph.
   */
  createPanningHandler(): mxPanningHandler {
    return new mxPanningHandler(this);
  }

  /**
   * Function: createPopupMenuHandler
   *
   * Creates and returns a new <mxPopupMenuHandler> to be used in this graph.
   */
  createPopupMenuHandler(): mxPopupMenuHandler {
    return new mxPopupMenuHandler(this);
  }

  /**
   * Function: createSelectionModel
   *
   * Creates a new <mxGraphSelectionModel> to be used in this graph.
   */
  createSelectionModel(): mxGraphSelectionModel {
    return new mxGraphSelectionModel(this);
  }

  /**
   * Function: createStylesheet
   *
   * Creates a new <mxGraphSelectionModel> to be used in this graph.
   */
  createStylesheet(): mxStylesheet {
    return new mxStylesheet();
  }

  /**
   * Function: createGraphView
   *
   * Creates a new <mxGraphView> to be used in this graph.
   */
  createGraphView(): mxGraphView {
    return new mxGraphView(this);
  }

  /**
   * Function: createCellRenderer
   *
   * Creates a new <mxCellRenderer> to be used in this graph.
   */
  createCellRenderer(): mxCellRenderer {
    return new mxCellRenderer();
  }

  /**
   * Function: createCellEditor
   *
   * Creates a new <mxCellEditor> to be used in this graph.
   */
  createCellEditor(): mxCellEditor {
    return new mxCellEditor(this);
  }

  /**
   * Function: getModel
   *
   * Returns the <mxGraphModel> that contains the cells.
   */
  getModel(): mxGraphModel {
    return <mxGraphModel>this.model;
  }

  /**
   * Function: getView
   *
   * Returns the <mxGraphView> that contains the <mxCellStates>.
   */
  getView(): mxGraphView {
    return <mxGraphView>this.view;
  }

  /**
   * Function: getStylesheet
   *
   * Returns the <mxStylesheet> that defines the style.
   */
  getStylesheet(): mxStylesheet | null {
    return this.stylesheet;
  }

  /**
   * Function: setStylesheet
   *
   * Sets the <mxStylesheet> that defines the style.
   */
  setStylesheet(stylesheet: mxStylesheet | null): void {
    this.stylesheet = stylesheet;
  }

  /**
   * Function: getSelectionModel
   *
   * Returns the <mxGraphSelectionModel> that contains the selection.
   */
  getSelectionModel(): mxGraphSelectionModel {
    return <mxGraphSelectionModel>this.selectionModel;
  }

  /**
   * Function: setSelectionModel
   *
   * Sets the <mxSelectionModel> that contains the selection.
   */
  setSelectionModel(selectionModel: mxGraphSelectionModel): void {
    this.selectionModel = selectionModel;
  }

  /**
   * Function: getSelectionCellsForChanges
   *
   * Returns the cells to be selected for the given array of changes.
   *
   * Parameters:
   *
   * ignoreFn - Optional function that takes a change and returns true if the
   * change should be ignored.
   *
   */
  getSelectionCellsForChanges(changes: any[],
                              ignoreFn: Function | null=null): mxCell[] {

    const dict = new mxDictionary();
    const cells: mxCell[] = [];

    const addCell = (cell: mxCell) => {
      if (!dict.get(cell) && this.getModel().contains(cell)) {
        if (this.getModel().isEdge(cell) || this.getModel().isVertex(cell)) {
          dict.put(cell, true);
          cells.push(cell);
        } else {
          const childCount = this.getModel().getChildCount(cell);

          for (let i = 0; i < childCount; i += 1) {
            addCell(<mxCell>this.getModel().getChildAt(cell, i));
          }
        }
      }
    };

    for (let i = 0; i < changes.length; i += 1) {
      const change = changes[i];

      if (
        change.constructor !== mxRootChange &&
        (ignoreFn == null || !ignoreFn(change))
      ) {
        let cell = null;

        if (change instanceof mxChildChange) {
          cell = change.child;
        } else if (change.cell != null && change.cell instanceof mxCell) {
          cell = change.cell;
        }

        if (cell != null) {
          addCell(cell);
        }
      }
    }
    return cells;
  }

  /**
   * Function: graphModelChanged
   *
   * Called when the graph model changes. Invokes <processChange> on each
   * item of the given array to update the view accordingly.
   *
   * Parameters:
   *
   * changes - Array that contains the individual changes.
   */
  graphModelChanged(changes: any[]) {
    for (let i = 0; i < changes.length; i += 1) {
      this.processChange(changes[i]);
    }

    this.updateSelection();
    this.getView().validate();
    this.sizeDidChange();
  }

  /**
   * Function: updateSelection
   *
   * Removes selection cells that are not in the model from the selection.
   */
  updateSelection(): void {
    const cells = this.getSelectionCells();
    const removed = [];

    for (let i = 0; i < cells.length; i += 1) {
      if (!this.getModel().contains(cells[i]) || !this.isCellVisible(cells[i])) {
        removed.push(cells[i]);
      } else {
        let par = this.getModel().getParent(cells[i]);

        while (par != null && par !== this.getView().currentRoot) {
          if (this.isCellCollapsed(par) || !this.isCellVisible(par)) {
            removed.push(cells[i]);
            break;
          }

          par = this.getModel().getParent(par);
        }
      }
    }
    this.removeSelectionCells(removed);
  }

  /**
   * Function: processChange
   *
   * Processes the given change and invalidates the respective cached data
   * in <view>. This fires a <root> event if the root has changed in the
   * model.
   *
   * Parameters:
   *
   * change - Object that represents the change on the model.
   */
  processChange(change: any): void {
    // Resets the view settings, removes all cells and clears
    // the selection if the root changes.
    if (change instanceof mxRootChange) {
      this.clearSelection();
      this.setDefaultParent(null);
      this.removeStateForCell(change.previous);

      if (this.resetViewOnRootChange) {
        this.getView().scale = 1;
        this.getView().translate.x = 0;
        this.getView().translate.y = 0;
      }

      this.fireEvent(new mxEventObject(mxEvent.ROOT));
    }

    // Adds or removes a child to the view by online invaliding
    // the minimal required portions of the cache, namely, the
    // old and new parent and the child.
    else if (change instanceof mxChildChange) {
      const newParent = this.getModel().getParent(change.child);
      this.getView().invalidate(change.child, true, true);

      if (!this.getModel().contains(newParent) || this.isCellCollapsed(newParent)) {
        this.getView().invalidate(change.child, true, true);
        this.removeStateForCell(change.child);

        // Handles special case of current root of view being removed
        if (this.getView().currentRoot == change.child) {
          this.home();
        }
      }

      if (newParent != change.previous) {
        // Refreshes the collapse/expand icons on the parents
        if (newParent != null) {
          this.getView().invalidate(newParent, false, false);
        }

        if (change.previous != null) {
          this.getView().invalidate(change.previous, false, false);
        }
      }
    }

    // Handles two special cases where the shape does not need to be
    // recreated from scratch, it only needs to be invalidated.
    else if (
      change instanceof mxTerminalChange ||
      change instanceof mxGeometryChange
    ) {
      // Checks if the geometry has changed to avoid unnessecary revalidation
      if (
        change instanceof mxTerminalChange ||
        (change.previous == null && change.geometry != null) ||
        (change.previous != null && !change.previous.equals(change.geometry))
      ) {
        this.getView().invalidate(change.cell);
      }
    }

    // Handles two special cases where only the shape, but no
    // descendants need to be recreated
    else if (change instanceof mxValueChange) {
      this.getView().invalidate(change.cell, false, false);
    }

    // Requires a new mxShape in JavaScript
    else if (change instanceof mxStyleChange) {
      this.getView().invalidate(change.cell, true, true);
      const state = this.getView().getState(change.cell);

      if (state != null) {
        state.invalidStyle = true;
      }
    }

    // Removes the state from the cache by default
    else if (change.cell != null && change.cell instanceof mxCell) {
      this.removeStateForCell(change.cell);
    }
  }

  /**
   * Function: removeStateForCell
   *
   * Removes all cached information for the given cell and its descendants.
   * This is called when a cell was removed from the model.
   *
   * Paramters:
   *
   * cell - <mxCell> that was removed from the model.
   */
  removeStateForCell(cell: mxCell) {
    const childCount = this.getModel().getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      this.removeStateForCell(<mxCell>this.getModel().getChildAt(cell, i));
    }

    this.getView().invalidate(cell, false, true);
    this.getView().removeState(cell);
  }

  /**
   * Group: Overlays
   */

  /**
   * Function: addCellOverlay
   *
   * Adds an <mxCellOverlay> for the specified cell. This method fires an
   * <addoverlay> event and returns the new <mxCellOverlay>.
   *
   * Parameters:
   *
   * cell - <mxCell> to add the overlay for.
   * overlay - <mxCellOverlay> to be added for the cell.
   */
  addCellOverlay(cell: mxCell,
                 overlay: mxCellOverlay): mxCellOverlay {
    if (cell.overlays == null) {
      cell.overlays = [];
    }
    cell.overlays.push(overlay);

    // Immediately update the cell display if the state exists
    const state = this.getView().getState(cell);
    if (state != null) {
      this.cellRenderer.redraw(state);
    }

    this.fireEvent(
      new mxEventObject(mxEvent.ADD_OVERLAY, 'cell', cell, 'overlay', overlay)
    );
    return overlay;
  }

  /**
   * Function: getCellOverlays
   *
   * Returns the array of <mxCellOverlays> for the given cell or null, if
   * no overlays are defined.
   *
   * Parameters:
   *
   * cell - <mxCell> whose overlays should be returned.
   */
  getCellOverlays(cell: mxCell) {
    return cell.overlays;
  }

  /**
   * Function: removeCellOverlay
   *
   * Removes and returns the given <mxCellOverlay> from the given cell. This
   * method fires a <removeoverlay> event. If no overlay is given, then all
   * overlays are removed using <removeOverlays>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose overlay should be removed.
   * overlay - Optional <mxCellOverlay> to be removed.
   */
  removeCellOverlay(cell: mxCell,
                    overlay: mxCellOverlay | null=null): any {

    if (overlay == null) {
      this.removeCellOverlays(cell);
    } else {
      const index = mxUtils.indexOf(cell.overlays, overlay);

      if (index >= 0) {
        (<mxCellOverlay[]>cell.overlays).splice(index, 1);

        if ((<mxCellOverlay[]>cell.overlays).length === 0) {
          cell.overlays = null;
        }

        // Immediately updates the cell display if the state exists
        const state = this.getView().getState(cell);

        if (state != null) {
          this.cellRenderer.redraw(state);
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.REMOVE_OVERLAY,
            'cell',
            cell,
            'overlay',
            overlay
          )
        );
      } else {
        overlay = null;
      }
    }

    return overlay;
  }

  /**
   * Function: removeCellOverlays
   *
   * Removes all <mxCellOverlays> from the given cell. This method
   * fires a <removeoverlay> event for each <mxCellOverlay> and returns
   * the array of <mxCellOverlays> that was removed from the cell.
   *
   * Parameters:
   *
   * cell - <mxCell> whose overlays should be removed
   */
  removeCellOverlays(cell: mxCell): any[] {
    const { overlays } = cell;

    if (overlays != null) {
      cell.overlays = null;

      // Immediately updates the cell display if the state exists
      const state = this.getView().getState(cell);

      if (state != null) {
        this.cellRenderer.redraw(state);
      }

      for (let i = 0; i < overlays.length; i += 1) {
        this.fireEvent(
          new mxEventObject(
            mxEvent.REMOVE_OVERLAY,
            'cell',
            cell,
            'overlay',
            overlays[i]
          )
        );
      }
    }

    return <mxCellOverlay[]>overlays;
  }

  /**
   * Function: clearCellOverlays
   *
   * Removes all <mxCellOverlays> in the graph for the given cell and all its
   * descendants. If no cell is specified then all overlays are removed from
   * the graph. This implementation uses <removeCellOverlays> to remove the
   * overlays from the individual cells.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> that represents the root of the subtree to
   * remove the overlays from. Default is the root in the model.
   */
  clearCellOverlays(cell: mxCell | null=null): void {
    cell = cell != null ? cell : this.getModel().getRoot();
    this.removeCellOverlays(<mxCell>cell);

    // Recursively removes all overlays from the children
    const childCount = this.getModel().getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      const child = this.getModel().getChildAt(cell, i);
      this.clearCellOverlays(child); // recurse
    }
  }

  /**
   * Function: setCellWarning
   *
   * Creates an overlay for the given cell using the warning and image or
   * <warningImage> and returns the new <mxCellOverlay>. The warning is
   * displayed as a tooltip in a red font and may contain HTML markup. If
   * the warning is null or a zero length string, then all overlays are
   * removed from the cell.
   *
   * Example:
   *
   * (code)
   * graph.setCellWarning(cell, '<b>Warning:</b>: Hello, World!');
   * (end)
   *
   * Parameters:
   *
   * cell - <mxCell> whose warning should be set.
   * warning - String that represents the warning to be displayed.
   * img - Optional <mxImage> to be used for the overlay. Default is
   * <warningImage>.
   * isSelect - Optional boolean indicating if a click on the overlay
   * should select the corresponding cell. Default is false.
   */
  setCellWarning(cell: mxCell,
                 warning: string | null=null,
                 img: mxImage | null=null,
                 isSelect: boolean=false) {

    if (warning != null && warning.length > 0) {
      img = img != null ? img : this.warningImage;

      // Creates the overlay with the image and warning
      const overlay = new mxCellOverlay(
        img,
        `<font color=red>${warning}</font>`
      );

      // Adds a handler for single mouseclicks to select the cell
      if (isSelect) {
        overlay.addListener(mxEvent.CLICK, (sender: any, evt: mxMouseEvent) => {
          if (this.isEnabled()) {
            this.setSelectionCell(cell);
          }
        });
      }

      // Sets and returns the overlay in the graph
      return this.addCellOverlay(cell, overlay);
    }
    this.removeCellOverlays(cell);

    return null;
  }

  /**
   * Group: In-place editing
   */

  /**
   * Function: startEditing
   *
   * Calls <startEditingAtCell> using the given cell or the first selection
   * cell.
   *
   * Parameters:
   *
   * evt - Optional mouse event that triggered the editing.
   */
  startEditing(evt: MouseEvent) {
    this.startEditingAtCell(null, evt);
  }

  /**
   * Function: startEditingAtCell
   *
   * Fires a <startEditing> event and invokes <mxCellEditor.startEditing>
   * on <editor>. After editing was started, a <editingStarted> event is
   * fired.
   *
   * Parameters:
   *
   * cell - <mxCell> to start the in-place editor for.
   * evt - Optional mouse event that triggered the editing.
   */
  startEditingAtCell(cell: mxCell | null=null,
                     evt: MouseEvent): void {
    if (evt == null || !mxEvent.isMultiTouchEvent(evt)) {
      if (cell == null) {
        cell = this.getSelectionCell();
        if (cell != null && !this.isCellEditable(cell)) {
          cell = null;
        }
      }

      if (cell != null) {
        this.fireEvent(
          new mxEventObject(mxEvent.START_EDITING, 'cell', cell, 'event', evt)
        );
        (<mxCellEditor>this.cellEditor).startEditing(cell, evt);
        this.fireEvent(
          new mxEventObject(mxEvent.EDITING_STARTED, 'cell', cell, 'event', evt)
        );
      }
    }
  }

  /**
   * Function: getEditingValue
   *
   * Returns the initial value for in-place editing. This implementation
   * returns <convertValueToString> for the given cell. If this function is
   * overridden, then <mxGraphModel.valueForCellChanged> should take care
   * of correctly storing the actual new value inside the user object.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the initial editing value should be returned.
   * evt - Optional mouse event that triggered the editor.
   */
  getEditingValue(cell: mxCell,
                  evt: mxEventObject | mxMouseEvent): string | null {
    return this.convertValueToString(cell);
  }

  /**
   * Function: stopEditing
   *
   * Stops the current editing  and fires a <editingStopped> event.
   *
   * Parameters:
   *
   * cancel - Boolean that specifies if the current editing value
   * shouldn't be stored.
   */
  stopEditing(cancel: boolean=false): void {
    (<mxCellEditor>this.cellEditor).stopEditing(cancel);
    this.fireEvent(
      new mxEventObject(mxEvent.EDITING_STOPPED, 'cancel', cancel)
    );
  }

  /**
   * Function: labelChanged
   *
   * Sets the label of the specified cell to the given value using
   * <cellLabelChanged> and fires <mxEvent.LABEL_CHANGED> while the
   * transaction is in progress. Returns the cell whose label was changed.
   *
   * Parameters:
   *
   * cell - <mxCell> whose label should be changed.
   * value - New label to be assigned.
   * evt - Optional event that triggered the change.
   */
  labelChanged(cell: mxCell,
               value: any,
               evt: mxMouseEvent | mxEventObject): mxCell {

    this.getModel().beginUpdate();
    try {
      const old = cell.value;
      this.cellLabelChanged(cell, value, this.isAutoSizeCell(cell));
      this.fireEvent(
        new mxEventObject(
          mxEvent.LABEL_CHANGED,
          'cell', cell,
          'value', value,
          'old', old,
          'event', evt
        )
      );
    } finally {
      this.getModel().endUpdate();
    }
    return cell;
  }

  /**
   * Function: cellLabelChanged
   *
   * Sets the new label for a cell. If autoSize is true then
   * <cellSizeUpdated> will be called.
   *
   * In the following example, the function is extended to map changes to
   * attributes in an XML node, as shown in <convertValueToString>.
   * Alternatively, the handling of this can be implemented as shown in
   * <mxGraphModel.valueForCellChanged> without the need to clone the
   * user object.
   *
   * (code)
   * let graphCellLabelChanged = graph.cellLabelChanged;
   * graph.cellLabelChanged = (cell, newValue, autoSize)=>
   * {
   *   // Cloned for correct undo/redo
   *   let elt = cell.value.cloneNode(true);
   *  elt.setAttribute('label', newValue);
   *
   *  newValue = elt;
   *  graphCellLabelChanged.apply(this, arguments);
   * };
   * (end)
   *
   * Parameters:
   *
   * cell - <mxCell> whose label should be changed.
   * value - New label to be assigned.
   * autoSize - Boolean that specifies if <cellSizeUpdated> should be called.
   */
  cellLabelChanged(cell: mxCell,
                   value: any,
                   autoSize: boolean=false): void {

    this.getModel().beginUpdate();
    try {
      this.getModel().setValue(cell, value);
      if (autoSize) {
        this.cellSizeUpdated(cell, false);
      }
    } finally {
      this.getModel().endUpdate();
    }
  }

  /**
   * Group: Event processing
   */

  /**
   * Function: escape
   *
   * Processes an escape keystroke.
   *
   * Parameters:
   *
   * evt - Mouseevent that represents the keystroke.
   */
  escape(evt: mxMouseEvent): void {
    this.fireEvent(new mxEventObject(mxEvent.ESCAPE, 'event', evt));
  }

  /**
   * Function: click
   *
   * Processes a singleclick on an optional cell and fires a <click> event.
   * The click event is fired initially. If the graph is enabled and the
   * event has not been consumed, then the cell is selected using
   * <selectCellForEvent> or the selection is cleared using
   * <clearSelection>. The events consumed state is set to true if the
   * corresponding <mxMouseEvent> has been consumed.
   *
   * To handle a click event, use the following code.
   *
   * (code)
   * graph.addListener(mxEvent.CLICK, (sender, evt)=>
   * {
   *   let e = evt.getProperty('event'); // mouse event
   *   let cell = evt.getProperty('cell'); // cell may be null
   *
   *   if (cell != null)
   *   {
   *     // Do something useful with cell and consume the event
   *     evt.consume();
   *   }
   * });
   * (end)
   *
   * Parameters:
   *
   * me - <mxMouseEvent> that represents the single click.
   */
  click(me: mxMouseEvent): boolean {
    const evt = me.getEvent();
    let cell = me.getCell();
    const mxe = new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', cell);

    if (me.isConsumed()) {
      mxe.consume();
    }

    this.fireEvent(mxe);

    if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed()) {
      if (cell != null) {
        if (this.isTransparentClickEvent(evt)) {
          let active = false;

          const tmp = this.getCellAt(
            me.graphX,
            me.graphY,
            null,
            false,
            false,
              (state: mxCellState): boolean => {
              const selected = this.isCellSelected(<mxCell>state.cell);
              active = active || selected;

              return (
                !active ||
                selected ||
                (state.cell !== cell && this.getModel().isAncestor(state.cell, cell))
              );
            }
          );

          if (tmp != null) {
            cell = tmp;
          }
        }
      } else if (this.isSwimlaneSelectionEnabled()) {
        cell = this.getSwimlaneAt(me.getGraphX(), me.getGraphY());

        if (
          cell != null &&
          (!this.isToggleEvent(evt) || !mxEvent.isAltDown(evt))
        ) {
          let temp = cell;
          let swimlanes = [];

          while (temp != null) {
            temp = this.getModel().getParent(temp);
            const state = this.getView().getState(temp);

            if (this.isSwimlane(temp) && state != null) {
              swimlanes.push(temp);
            }
          }

          // Selects ancestors for selected swimlanes
          if (swimlanes.length > 0) {
            swimlanes = swimlanes.reverse();
            swimlanes.splice(0, 0, cell);
            swimlanes.push(cell);

            for (let i = 0; i < swimlanes.length - 1; i += 1) {
              if (this.isCellSelected(swimlanes[i])) {
                cell = swimlanes[this.isToggleEvent(evt) ? i : i + 1];
              }
            }
          }
        }
      }

      if (cell != null) {
        this.selectCellForEvent(cell, evt);
      } else if (!this.isToggleEvent(evt)) {
        this.clearSelection();
      }
    }
    return false;
  }

  /**
   * Function: isSiblingSelected
   *
   * Returns true if any sibling of the given cell is selected.
   */
  isSiblingSelected(cell: mxCell): boolean {
    const model = this.getModel();
    const parent = model.getParent(cell);
    const childCount = model.getChildCount(parent);

    for (let i = 0; i < childCount; i += 1) {
      const child = <mxCell>model.getChildAt(parent, i);
      if (cell !== child && this.isCellSelected(child)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Function: dblClick
   *
   * Processes a doubleclick on an optional cell and fires a <dblclick>
   * event. The event is fired initially. If the graph is enabled and the
   * event has not been consumed, then <edit> is called with the given
   * cell. The event is ignored if no cell was specified.
   *
   * Example for overriding this method.
   *
   * (code)
   * graph.dblClick = (evt, cell)=>
   * {
   *   let mxe = new mxEventObject(mxEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
   *   this.fireEvent(mxe);
   *
   *   if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed())
   *   {
   *      mxUtils.alert('Hello, World!');
   *     mxe.consume();
   *   }
   * }
   * (end)
   *
   * Example listener for this event.
   *
   * (code)
   * graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt)=>
   * {
   *   let cell = evt.getProperty('cell');
   *   // do something with the cell and consume the
   *   // event to prevent in-place editing from start
   * });
   * (end)
   *
   * Parameters:
   *
   * evt - Mouseevent that represents the doubleclick.
   * cell - Optional <mxCell> under the mousepointer.
   */
  dblClick(evt: MouseEvent,
           cell: mxCell | null=null): void {

    const mxe = new mxEventObject(
      mxEvent.DOUBLE_CLICK,
      'event',
      evt,
      'cell',
      cell
    );
    this.fireEvent(mxe);

    // Handles the event if it has not been consumed
    if (
      this.isEnabled() &&
      !mxEvent.isConsumed(evt) &&
      !mxe.isConsumed() &&
      cell != null &&
      this.isCellEditable(cell) &&
      !this.isEditing(cell)
    ) {
      this.startEditingAtCell(cell, evt);
      mxEvent.consume(evt);
    }
  }

  /**
   * Function: tapAndHold
   *
   * Handles the <mxMouseEvent> by highlighting the <mxCellState>.
   *
   * Parameters:
   *
   * me - <mxMouseEvent> that represents the touch event.
   * state - Optional <mxCellState> that is associated with the event.
   */
  tapAndHold(me: mxMouseEvent): void {
    const evt = me.getEvent();
    const mxe = new mxEventObject(
      mxEvent.TAP_AND_HOLD,
      'event',
      evt,
      'cell',
      me.getCell()
    );
    const panningHandler = <mxPanningHandler>this.panningHandler;
    const connectionHandler = <mxConnectionHandler>this.connectionHandler;

    // LATER: Check if event should be consumed if me is consumed
    this.fireEvent(mxe);

    if (mxe.isConsumed()) {
      // Resets the state of the panning handler
      panningHandler.panningTrigger = false;
    }

    // Handles the event if it has not been consumed
    if (
      this.isEnabled() &&
      !mxEvent.isConsumed(evt) &&
      !mxe.isConsumed() &&
        connectionHandler.isEnabled()
    ) {
      const state = this.getView().getState(
          connectionHandler.marker.getCell(me)
      );

      if (state != null) {
        connectionHandler.marker.currentColor = connectionHandler.marker.validColor;
        connectionHandler.marker.markedState = state;
        connectionHandler.marker.mark();

        connectionHandler.first = new mxPoint(
          me.getGraphX(),
          me.getGraphY()
        );
        connectionHandler.edgeState = connectionHandler.createEdgeState(
          me
        );
        connectionHandler.previous = state;
        connectionHandler.fireEvent(
          new mxEventObject(
            mxEvent.START,
            'state',
              connectionHandler.previous
          )
        );
      }
    }
  }

  /**
   * Function: scrollPointToVisible
   *
   * Scrolls the graph to the given point, extending the graph container if
   * specified.
   */
  scrollPointToVisible(x: number,
                       y: number,
                       extend: boolean,
                       border: number=20): void {

    if (
      !this.timerAutoScroll &&
      (this.ignoreScrollbars || mxUtils.hasScrollbars(this.container))
    ) {
      const c = <HTMLElement>this.container;

      if (
        x >= c.scrollLeft &&
        y >= c.scrollTop &&
        x <= c.scrollLeft + c.clientWidth &&
        y <= c.scrollTop + c.clientHeight
      ) {
        let dx = c.scrollLeft + c.clientWidth - x;

        if (dx < border) {
          const old = c.scrollLeft;
          c.scrollLeft += border - dx;

          // Automatically extends the canvas size to the bottom, right
          // if the event is outside of the canvas and the edge of the
          // canvas has been reached. Notes: Needs fix for IE.
          if (extend && old === c.scrollLeft) {
            // @ts-ignore
            const root = this.getView().getDrawPane().ownerSVGElement;
            const width = c.scrollWidth + border - dx;

            // Updates the clipping region. This is an expensive
            // operation that should not be executed too often.
            // @ts-ignore
            root.style.width = `${width}px`;

            c.scrollLeft += border - dx;
          }
        } else {
          dx = x - c.scrollLeft;

          if (dx < border) {
            c.scrollLeft -= border - dx;
          }
        }

        let dy = c.scrollTop + c.clientHeight - y;

        if (dy < border) {
          const old = c.scrollTop;
          c.scrollTop += border - dy;

          if (old == c.scrollTop && extend) {
            // @ts-ignore
            const root = this.getView().getDrawPane().ownerSVGElement;
            const height = c.scrollHeight + border - dy;

            // Updates the clipping region. This is an expensive
            // operation that should not be executed too often.
            // @ts-ignore
            root.style.height = `${height}px`;

            c.scrollTop += border - dy;
          }
        } else {
          dy = y - c.scrollTop;

          if (dy < border) {
            c.scrollTop -= border - dy;
          }
        }
      }
    } else if (this.allowAutoPanning && !(<mxPanningHandler>this.panningHandler).isActive()) {
      if (this.panningManager == null) {
        this.panningManager = this.createPanningManager();
      }
      this.panningManager.panTo(x + this.panDx, y + this.panDy);
    }
  }

  /**
   * Function: createPanningManager
   *
   * Creates and returns an <mxPanningManager>.
   */
  createPanningManager(): mxPanningManager {
    return new mxPanningManager(this);
  }

  /**
   * Function: getBorderSizes
   *
   * Returns the size of the border and padding on all four sides of the
   * container. The left, top, right and bottom borders are stored in the x, y,
   * width and height of the returned <mxRectangle>, respectively.
   */
  getBorderSizes(): mxRectangle {
    const css = <CSSStyleDeclaration>mxUtils.getCurrentStyle(this.container);

    return new mxRectangle(
      mxUtils.parseCssNumber(css.paddingLeft) +
        (css.borderLeftStyle != 'none'
          ? mxUtils.parseCssNumber(css.borderLeftWidth)
          : 0),
      mxUtils.parseCssNumber(css.paddingTop) +
        (css.borderTopStyle != 'none'
          ? mxUtils.parseCssNumber(css.borderTopWidth)
          : 0),
      mxUtils.parseCssNumber(css.paddingRight) +
        (css.borderRightStyle != 'none'
          ? mxUtils.parseCssNumber(css.borderRightWidth)
          : 0),
      mxUtils.parseCssNumber(css.paddingBottom) +
        (css.borderBottomStyle != 'none'
          ? mxUtils.parseCssNumber(css.borderBottomWidth)
          : 0)
    );
  }

  /**
   * Function: getPreferredPageSize
   *
   * Returns the preferred size of the background page if <preferPageSize> is true.
   */
  getPreferredPageSize(bounds: mxRectangle,
                       width: number,
                       height: number): mxRectangle {

    const { scale } = this.view;
    const tr = this.getView().translate;
    const fmt = this.pageFormat;
    const ps = this.pageScale;
    const page = new mxRectangle(
      0,
      0,
      Math.ceil(fmt.width * ps),
      Math.ceil(fmt.height * ps)
    );

    const hCount = this.pageBreaksVisible ? Math.ceil(width / page.width) : 1;
    const vCount = this.pageBreaksVisible ? Math.ceil(height / page.height) : 1;

    return new mxRectangle(
      0,
      0,
      hCount * page.width + 2 + tr.x,
      vCount * page.height + 2 + tr.y
    );
  }

  /**
   * Function: fit
   *
   * Scales the graph such that the complete diagram fits into <container> and
   * returns the current scale in the view. To fit an initial graph prior to
   * rendering, set <mxGraphView.rendering> to false prior to changing the model
   * and execute the following after changing the model.
   *
   * (code)
   * graph.fit();
   * graph.view.rendering = true;
   * graph.refresh();
   * (end)
   *
   * To fit and center the graph, the following code can be used.
   *
   * (code)
   * let margin = 2;
   * let max = 3;
   *
   * let bounds = graph.getGraphBounds();
   * let cw = graph.container.clientWidth - margin;
   * let ch = graph.container.clientHeight - margin;
   * let w = bounds.width / graph.view.scale;
   * let h = bounds.height / graph.view.scale;
   * let s = Math.min(max, Math.min(cw / w, ch / h));
   *
   * graph.view.scaleAndTranslate(s,
   *   (margin + cw - w * s) / (2 * s) - bounds.x / graph.view.scale,
   *   (margin + ch - h * s) / (2 * s) - bounds.y / graph.view.scale);
   * (end)
   *
   * Parameters:
   *
   * border - Optional number that specifies the border. Default is <border>.
   * keepOrigin - Optional boolean that specifies if the translate should be
   * changed. Default is false.
   * margin - Optional margin in pixels. Default is 0.
   * enabled - Optional boolean that specifies if the scale should be set or
   * just returned. Default is true.
   * ignoreWidth - Optional boolean that specifies if the width should be
   * ignored. Default is false.
   * ignoreHeight - Optional boolean that specifies if the height should be
   * ignored. Default is false.
   * maxHeight - Optional maximum height.
   */
  fit(border: number=this.getBorder(),
      keepOrigin: boolean=false,
      margin: number=0,
      enabled: boolean=true,
      ignoreWidth: boolean=false,
      ignoreHeight: boolean=false,
      maxHeight: number | null=null): number {

    if (this.container != null) {
      // Adds spacing and border from css
      const cssBorder = this.getBorderSizes();
      let w1: number = this.container.offsetWidth - cssBorder.x - cssBorder.width - 1;
      let h1: number = maxHeight != null
          ? maxHeight
          : this.container.offsetHeight - cssBorder.y - cssBorder.height - 1;
      let bounds = this.getView().getGraphBounds();

      if (bounds.width > 0 && bounds.height > 0) {
        if (keepOrigin && bounds.x != null && bounds.y != null) {
          bounds = bounds.clone();
          bounds.width += bounds.x;
          bounds.height += bounds.y;
          bounds.x = 0;
          bounds.y = 0;
        }

        // LATER: Use unscaled bounding boxes to fix rounding errors
        const s = this.getView().scale;
        let w2 = bounds.width / s;
        let h2 = bounds.height / s;

        // Fits to the size of the background image if required
        if (this.backgroundImage != null) {
          w2 = Math.max(w2, this.backgroundImage.width - bounds.x / s);
          h2 = Math.max(h2, this.backgroundImage.height - bounds.y / s);
        }

        const b: number = (keepOrigin ? border : 2 * border) + margin + 1;

        w1 -= b;
        h1 -= b;

        let s2 = ignoreWidth
          ? h1 / h2
          : ignoreHeight
          ? w1 / w2
          : Math.min(w1 / w2, h1 / h2);

        if (this.minFitScale != null) {
          s2 = Math.max(s2, this.minFitScale);
        }

        if (this.maxFitScale != null) {
          s2 = Math.min(s2, this.maxFitScale);
        }

        if (enabled) {
          if (!keepOrigin) {
            if (!mxUtils.hasScrollbars(this.container)) {
              const x0 =
                bounds.x != null
                  ? Math.floor(
                      this.getView().translate.x -
                        bounds.x / s +
                        border / s2 +
                        margin / 2
                    )
                  : border;
              const y0 =
                bounds.y != null
                  ? Math.floor(
                      this.getView().translate.y -
                        bounds.y / s +
                        border / s2 +
                        margin / 2
                    )
                  : border;

              this.getView().scaleAndTranslate(s2, x0, y0);
            } else {
              this.getView().setScale(s2);
              const b2 = this.getGraphBounds();

              if (b2.x != null) {
                this.container.scrollLeft = b2.x;
              }

              if (b2.y != null) {
                this.container.scrollTop = b2.y;
              }
            }
          } else if (this.getView().scale != s2) {
            this.getView().setScale(s2);
          }
        } else {
          return s2;
        }
      }
    }
    return this.getView().scale;
  }

  /**
   * Function: sizeDidChange
   *
   * Called when the size of the graph has changed. This implementation fires
   * a <size> event after updating the clipping region of the SVG element in
   * SVG-bases browsers.
   */
  sizeDidChange(): void {
    const bounds = this.getGraphBounds();

    if (this.container != null) {
      const border = this.getBorder();

      let width = Math.max(0, bounds.x) + bounds.width + 2 * border;
      let height = Math.max(0, bounds.y) + bounds.height + 2 * border;

      if (this.minimumContainerSize != null) {
        width = Math.max(width, this.minimumContainerSize.width);
        height = Math.max(height, this.minimumContainerSize.height);
      }

      if (this.resizeContainer) {
        this.doResizeContainer(width, height);
      }

      if (this.preferPageSize || this.pageVisible) {
        const size = this.getPreferredPageSize(
          bounds,
          Math.max(1, width),
          Math.max(1, height)
        );

        if (size != null) {
          width = size.width * this.getView().scale;
          height = size.height * this.getView().scale;
        }
      }

      if (this.minimumGraphSize != null) {
        width = Math.max(width, this.minimumGraphSize.width * this.getView().scale);
        height = Math.max(
          height,
          this.minimumGraphSize.height * this.getView().scale
        );
      }

      width = Math.ceil(width);
      height = Math.ceil(height);

      // @ts-ignore
      const root = this.getView().getDrawPane().ownerSVGElement;

      if (root != null) {
        root.style.minWidth = `${Math.max(1, width)}px`;
        root.style.minHeight = `${Math.max(1, height)}px`;
        root.style.width = '100%';
        root.style.height = '100%';
      }

      this.updatePageBreaks(this.pageBreaksVisible, width, height);
    }
    this.fireEvent(new mxEventObject(mxEvent.SIZE, 'bounds', bounds));
  }

  /**
   * Function: doResizeContainer
   *
   * Resizes the container for the given graph width and height.
   */
  doResizeContainer(width: number,
                    height: number): void {

    if (this.maximumContainerSize != null) {
      width = Math.min(this.maximumContainerSize.width, width);
      height = Math.min(this.maximumContainerSize.height, height);
    }
    const container = <HTMLElement>this.container;
    container.style.width = `${Math.ceil(width)}px`;
    container.style.height = `${Math.ceil(height)}px`;
  }

  /**
   * Function: updatePageBreaks
   *
   * Invokes from <sizeDidChange> to redraw the page breaks.
   *
   * Parameters:
   *
   * visible - Boolean that specifies if page breaks should be shown.
   * width - Specifies the width of the container in pixels.
   * height - Specifies the height of the container in pixels.
   */
  updatePageBreaks(visible: boolean,
                   width: number,
                   height: number) {

    const { scale } = this.view;
    const tr = this.getView().translate;
    const fmt = this.pageFormat;
    const ps = scale * this.pageScale;
    const bounds = new mxRectangle(0, 0, fmt.width * ps, fmt.height * ps);

    const gb = mxRectangle.fromRectangle(this.getGraphBounds());
    gb.width = Math.max(1, gb.width);
    gb.height = Math.max(1, gb.height);

    bounds.x =
      Math.floor((gb.x - tr.x * scale) / bounds.width) * bounds.width +
      tr.x * scale;
    bounds.y =
      Math.floor((gb.y - tr.y * scale) / bounds.height) * bounds.height +
      tr.y * scale;

    gb.width =
      Math.ceil((gb.width + (gb.x - bounds.x)) / bounds.width) * bounds.width;
    gb.height =
      Math.ceil((gb.height + (gb.y - bounds.y)) / bounds.height) *
      bounds.height;

    // Does not show page breaks if the scale is too small
    visible =
      visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;

    const horizontalCount = visible
      ? Math.ceil(gb.height / bounds.height) + 1
      : 0;
    const verticalCount = visible ? Math.ceil(gb.width / bounds.width) + 1 : 0;
    const right = (verticalCount - 1) * bounds.width;
    const bottom = (horizontalCount - 1) * bounds.height;

    if (this.horizontalPageBreaks == null && horizontalCount > 0) {
      this.horizontalPageBreaks = [];
    }

    if (this.verticalPageBreaks == null && verticalCount > 0) {
      this.verticalPageBreaks = [];
    }

    const drawPageBreaks = (breaks: any) => {
      if (breaks != null) {
        const count =
          breaks === this.horizontalPageBreaks
            ? horizontalCount
            : verticalCount;

        for (let i = 0; i <= count; i += 1) {
          const pts =
            breaks === this.horizontalPageBreaks
              ? [
                  new mxPoint(
                    Math.round(bounds.x),
                    Math.round(bounds.y + i * bounds.height)
                  ),
                  new mxPoint(
                    Math.round(bounds.x + right),
                    Math.round(bounds.y + i * bounds.height)
                  ),
                ]
              : [
                  new mxPoint(
                    Math.round(bounds.x + i * bounds.width),
                    Math.round(bounds.y)
                  ),
                  new mxPoint(
                    Math.round(bounds.x + i * bounds.width),
                    Math.round(bounds.y + bottom)
                  ),
                ];

          if (breaks[i] != null) {
            breaks[i].points = pts;
            breaks[i].redraw();
          } else {
            const pageBreak = new mxPolyline(pts, this.pageBreakColor);
            pageBreak.dialect = this.dialect;
            pageBreak.pointerEvents = false;
            pageBreak.isDashed = this.pageBreakDashed;
            pageBreak.init(this.getView().backgroundPane);
            pageBreak.redraw();

            breaks[i] = pageBreak;
          }
        }

        for (let i = count; i < breaks.length; i += 1) {
          breaks[i].destroy();
        }

        breaks.splice(count, breaks.length - count);
      }
    };

    drawPageBreaks(this.horizontalPageBreaks);
    drawPageBreaks(this.verticalPageBreaks);
  }

  /**
   * Group: Cell styles
   */

  /**
   * Function: getCurrentCellStyle
   *
   * Returns the style for the given cell from the cell state, if one exists,
   * or using <getCellStyle>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose style should be returned as an array.
   * ignoreState - Optional boolean that specifies if the cell state should be ignored.
   */
  getCurrentCellStyle(cell: mxCell | null,
                      ignoreState: boolean=false): any {

    const state = ignoreState ? null : this.getView().getState(cell);
    return state != null ? state.style : this.getCellStyle(cell);
  }

  /**
   * Function: getCellStyle
   *
   * Returns an array of key, value pairs representing the cell style for the
   * given cell. If no string is defined in the model that specifies the
   * style, then the default style for the cell is returned or an empty object,
   * if no style can be found. Note: You should try and get the cell state
   * for the given cell and use the cached style in the state before using
   * this method.
   *
   * Parameters:
   *
   * cell - <mxCell> whose style should be returned as an array.
   */
  getCellStyle(cell: mxCell | null): any {
    const stylename = this.getModel().getStyle(cell);
    let style = null;
    const stylesheet = <mxStylesheet>this.stylesheet;

    // Gets the default style for the cell
    if (this.getModel().isEdge(cell)) {
      style = stylesheet.getDefaultEdgeStyle();
    } else {
      style = stylesheet.getDefaultVertexStyle();
    }

    // Resolves the stylename using the above as the default
    if (stylename != null) {
      style = this.postProcessCellStyle(
          stylesheet.getCellStyle(stylename, style)
      );
    }

    // Returns a non-null value if no style can be found
    if (style == null) {
      style = {};
    }
    return style;
  }

  /**
   * Function: postProcessCellStyle
   *
   * Tries to resolve the value for the image style in the image bundles and
   * turns short data URIs as defined in mxImageBundle to data URIs as
   * defined in RFC 2397 of the IETF.
   */
  postProcessCellStyle(style: any): any {
    if (style != null) {
      const key = style[mxConstants.STYLE_IMAGE];
      let image = this.getImageFromBundles(key);

      if (image != null) {
        style[mxConstants.STYLE_IMAGE] = image;
      } else {
        image = key;
      }

      // Converts short data uris to normal data uris
      if (image != null && image.substring(0, 11) === 'data:image/') {
        if (image.substring(0, 20) === 'data:image/svg+xml,<') {
          // Required for FF and IE11
          image =
            image.substring(0, 19) + encodeURIComponent(image.substring(19));
        } else if (image.substring(0, 22) !== 'data:image/svg+xml,%3C') {
          const comma = image.indexOf(',');

          // Adds base64 encoding prefix if needed
          if (
            comma > 0 &&
            image.substring(comma - 7, comma + 1) !== ';base64,'
          ) {
            image = `${image.substring(0, comma)};base64,${image.substring(
              comma + 1
            )}`;
          }
        }

        style[mxConstants.STYLE_IMAGE] = image;
      }
    }
    return style;
  }

  /**
   * Function: setCellStyle
   *
   * Sets the style of the specified cells. If no cells are given, then the
   * selection cells are changed.
   *
   * Parameters:
   *
   * style - String representing the new style of the cells.
   * cells - Optional array of <mxCells> to set the style for. Default is the
   * selection cells.
   */
  setCellStyle(style: any,
               cells: mxCell[] | null=this.getSelectionCells()) {

    if (cells != null) {
      this.getModel().beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          this.getModel().setStyle(cells[i], style);
        }
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: toggleCellStyle
   *
   * Toggles the boolean value for the given key in the style of the given cell
   * and returns the new value as 0 or 1. If no cell is specified then the
   * selection cell is used.
   *
   * Parameter:
   *
   * key - String representing the key for the boolean value to be toggled.
   * defaultValue - Optional boolean default value if no value is defined.
   * Default is false.
   * cell - Optional <mxCell> whose style should be modified. Default is
   * the selection cell.
   */
  toggleCellStyle(key: string,
                  defaultValue: boolean=false,
                  cell: mxCell | null=this.getSelectionCell()) {

    return this.toggleCellStyles(key, defaultValue, [cell]);
  }

  /**
   * Function: toggleCellStyles
   *
   * Toggles the boolean value for the given key in the style of the given cells
   * and returns the new value as 0 or 1. If no cells are specified, then the
   * selection cells are used. For example, this can be used to toggle
   * <mxConstants.STYLE_ROUNDED> or any other style with a boolean value.
   *
   * Parameter:
   *
   * key - String representing the key for the boolean value to be toggled.
   * defaultValue - Optional boolean default value if no value is defined.
   * Default is false.
   * cells - Optional array of <mxCells> whose styles should be modified.
   * Default is the selection cells.
   */
  toggleCellStyles(key: string,
                   defaultValue: boolean=false,
                   cells: (mxCell | null)[]=this.getSelectionCells()) {

    let value = null;

    if (cells != null && cells.length > 0) {
      const style = this.getCurrentCellStyle(cells[0]);
      value = mxUtils.getValue(style, key, defaultValue) ? 0 : 1;
      this.setCellStyles(key, value, cells);
    }
    return value;
  }

  /**
   * Function: setCellStyles
   *
   * Sets the key to value in the styles of the given cells. This will modify
   * the existing cell styles in-place and override any existing assignment
   * for the given key. If no cells are specified, then the selection cells
   * are changed. If no value is specified, then the respective key is
   * removed from the styles.
   *
   * Parameters:
   *
   * key - String representing the key to be assigned.
   * value - String representing the new value for the key.
   * cells - Optional array of <mxCells> to change the style for. Default is
   * the selection cells.
   */
  setCellStyles(key: string,
                value: string | number | null=null,
                cells: (mxCell | null)[]=this.getSelectionCells()) {

    mxUtils.setCellStyles(this.model, cells, key, value);
  }

  /**
   * Function: toggleCellStyleFlags
   *
   * Toggles the given bit for the given key in the styles of the specified
   * cells.
   *
   * Parameters:
   *
   * key - String representing the key to toggle the flag in.
   * flag - Integer that represents the bit to be toggled.
   * cells - Optional array of <mxCells> to change the style for. Default is
   * the selection cells.
   */
  toggleCellStyleFlags(key: string,
                       flag: number,
                       cells: mxCell[]=this.getSelectionCells()) {

    this.setCellStyleFlags(key, flag, null, cells);
  }

  /**
   * Function: setCellStyleFlags
   *
   * Sets or toggles the given bit for the given key in the styles of the
   * specified cells.
   *
   * Parameters:
   *
   * key - String representing the key to toggle the flag in.
   * flag - Integer that represents the bit to be toggled.
   * value - Boolean value to be used or null if the value should be toggled.
   * cells - Optional array of <mxCells> to change the style for. Default is
   * the selection cells.
   */
  setCellStyleFlags(key: string,
                    flag: number,
                    value: boolean | null=null,
                    cells: mxCell[]=this.getSelectionCells()) {

    if (cells != null && cells.length > 0) {
      if (value == null) {
        const style = this.getCurrentCellStyle(cells[0]);
        const current = parseInt(style[key] || 0);
        value = !((current & flag) === flag);
      }
      mxUtils.setCellStyleFlags(this.model, cells, key, flag, value);
    }
  }

  /**
   * Group: Cell alignment and orientation
   */

  /**
   * Function: alignCells
   *
   * Aligns the given cells vertically or horizontally according to the given
   * alignment using the optional parameter as the coordinate.
   *
   * Parameters:
   *
   * align - Specifies the alignment. Possible values are all constants in
   * mxConstants with an ALIGN prefix.
   * cells - Array of <mxCells> to be aligned.
   * param - Optional coordinate for the alignment.
   */
  alignCells(align: string,
             cells: mxCell[],
             param: number | null=null) {

    if (cells == null) {
      cells = this.getSelectionCells();
    }

    if (cells != null && cells.length > 1) {
      // Finds the required coordinate for the alignment
      if (param == null) {
        for (let i = 0; i < cells.length; i += 1) {
          const state = this.getView().getState(cells[i]);

          if (state != null && !this.getModel().isEdge(cells[i])) {
            if (param == null) {
              if (align === mxConstants.ALIGN_CENTER) {
                param = state.x + state.width / 2;
                break;
              } else if (align === mxConstants.ALIGN_RIGHT) {
                param = state.x + state.width;
              } else if (align === mxConstants.ALIGN_TOP) {
                param = state.y;
              } else if (align === mxConstants.ALIGN_MIDDLE) {
                param = state.y + state.height / 2;
                break;
              } else if (align === mxConstants.ALIGN_BOTTOM) {
                param = state.y + state.height;
              } else {
                param = state.x;
              }
            } else if (align === mxConstants.ALIGN_RIGHT) {
              param = Math.max(param, state.x + state.width);
            } else if (align === mxConstants.ALIGN_TOP) {
              param = Math.min(param, state.y);
            } else if (align === mxConstants.ALIGN_BOTTOM) {
              param = Math.max(param, state.y + state.height);
            } else {
              param = Math.min(param, state.x);
            }
          }
        }
      }

      // Aligns the cells to the coordinate
      if (param != null) {
        const s = this.getView().scale;

        this.getModel().beginUpdate();
        try {
          for (let i = 0; i < cells.length; i += 1) {
            const state = this.getView().getState(cells[i]);

            if (state != null) {
              let geo = this.getCellGeometry(cells[i]);

              if (geo != null && !this.getModel().isEdge(cells[i])) {
                geo = <mxGeometry>geo.clone();

                if (align === mxConstants.ALIGN_CENTER) {
                  geo.x += (param - state.x - state.width / 2) / s;
                } else if (align === mxConstants.ALIGN_RIGHT) {
                  geo.x += (param - state.x - state.width) / s;
                } else if (align === mxConstants.ALIGN_TOP) {
                  geo.y += (param - state.y) / s;
                } else if (align === mxConstants.ALIGN_MIDDLE) {
                  geo.y += (param - state.y - state.height / 2) / s;
                } else if (align === mxConstants.ALIGN_BOTTOM) {
                  geo.y += (param - state.y - state.height) / s;
                } else {
                  geo.x += (param - state.x) / s;
                }

                this.resizeCell(cells[i], geo);
              }
            }
          }

          this.fireEvent(
            new mxEventObject(
              mxEvent.ALIGN_CELLS,
              'align',
              align,
              'cells',
              cells
            )
          );
        } finally {
          this.getModel().endUpdate();
        }
      }
    }

    return cells;
  }

  /**
   * Function: flipEdge
   *
   * Toggles the style of the given edge between null (or empty) and
   * <alternateEdgeStyle>. This method fires <mxEvent.FLIP_EDGE> while the
   * transaction is in progress. Returns the edge that was flipped.
   *
   * Here is an example that overrides this implementation to invert the
   * value of <mxConstants.STYLE_ELBOW> without removing any existing styles.
   *
   * (code)
   * graph.flipEdge = (edge)=>
   * {
   *   if (edge != null)
   *   {
   *     let style = this.getCurrentCellStyle(edge);
   *     let elbow = mxUtils.getValue(style, mxConstants.STYLE_ELBOW,
   *         mxConstants.ELBOW_HORIZONTAL);
   *     let value = (elbow === mxConstants.ELBOW_HORIZONTAL) ?
   *         mxConstants.ELBOW_VERTICAL : mxConstants.ELBOW_HORIZONTAL;
   *     this.setCellStyles(mxConstants.STYLE_ELBOW, value, [edge]);
   *   }
   * };
   * (end)
   *
   * Parameters:
   *
   * edge - <mxCell> whose style should be changed.
   */
  flipEdge(edge: mxCell): mxCell {
    if (edge != null && this.alternateEdgeStyle != null) {
      this.getModel().beginUpdate();
      try {
        const style = this.getModel().getStyle(edge);

        if (style == null || style.length === 0) {
          this.getModel().setStyle(edge, this.alternateEdgeStyle);
        } else {
          this.getModel().setStyle(edge, null);
        }

        // Removes all existing control points
        this.resetEdge(edge);
        this.fireEvent(new mxEventObject(mxEvent.FLIP_EDGE, 'edge', edge));
      } finally {
        this.getModel().endUpdate();
      }
    }
    return edge;
  }

  /**
   * Function: addImageBundle
   *
   * Adds the specified <mxImageBundle>.
   */
  addImageBundle(bundle: mxImageBundle): void {
    this.imageBundles.push(bundle);
  }

  /**
   * Function: removeImageBundle
   *
   * Removes the specified <mxImageBundle>.
   */
  removeImageBundle(bundle: mxImageBundle) {
    const tmp = [];
    for (let i = 0; i < this.imageBundles.length; i += 1) {
      if (this.imageBundles[i] !== bundle) {
        tmp.push(this.imageBundles[i]);
      }
    }
    this.imageBundles = tmp;
  }

  /**
   * Function: getImageFromBundles
   *
   * Searches all <imageBundles> for the specified key and returns the value
   * for the first match or null if the key is not found.
   */
  getImageFromBundles(key: string) {
    if (key != null) {
      for (let i = 0; i < this.imageBundles.length; i += 1) {
        const image = this.imageBundles[i].getImage(key);
        if (image != null) {
          return image;
        }
      }
    }
    return null;
  }

  /**
   * Group: Order
   */

  /**
   * Function: orderCells
   *
   * Moves the given cells to the front or back. The change is carried out
   * using <cellsOrdered>. This method fires <mxEvent.ORDER_CELLS> while the
   * transaction is in progress.
   *
   * Parameters:
   *
   * back - Boolean that specifies if the cells should be moved to back.
   * cells - Array of <mxCells> to move to the background. If null is
   * specified then the selection cells are used.
   */
  orderCells(back: boolean=false,
             cells: mxCell[]=this.getSelectionCells()): mxCell[] {

    if (cells == null) {
      cells = mxUtils.sortCells(this.getSelectionCells(), true);
    }

    this.getModel().beginUpdate();
    try {
      this.cellsOrdered(cells, back);
      this.fireEvent(
        new mxEventObject(mxEvent.ORDER_CELLS, 'back', back, 'cells', cells)
      );
    } finally {
      this.getModel().endUpdate();
    }
    return cells;
  }

  /**
   * Function: cellsOrdered
   *
   * Moves the given cells to the front or back. This method fires
   * <mxEvent.CELLS_ORDERED> while the transaction is in progress.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose order should be changed.
   * back - Boolean that specifies if the cells should be moved to back.
   */
  cellsOrdered(cells: mxCell[],
               back: boolean=false) {

    if (cells != null) {
      this.getModel().beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          const parent = this.getModel().getParent(cells[i]);

          if (back) {
            this.getModel().add(parent, cells[i], i);
          } else {
            this.getModel().add(
              parent,
              cells[i],
              this.getModel().getChildCount(parent) - 1
            );
          }
        }

        this.fireEvent(
          new mxEventObject(mxEvent.CELLS_ORDERED, 'back', back, 'cells', cells)
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Group: Grouping
   */

  /**
   * Function: groupCells
   *
   * Adds the cells into the given group. The change is carried out using
   * <cellsAdded>, <cellsMoved> and <cellsResized>. This method fires
   * <mxEvent.GROUP_CELLS> while the transaction is in progress. Returns the
   * new group. A group is only created if there is at least one entry in the
   * given array of cells.
   *
   * Parameters:
   *
   * group - <mxCell> that represents the target group. If null is specified
   * then a new group is created using <createGroupCell>.
   * border - Optional integer that specifies the border between the child
   * area and the group bounds. Default is 0.
   * cells - Optional array of <mxCells> to be grouped. If null is specified
   * then the selection cells are used.
   */
  groupCells(group: mxCell,
             border: number=0,
             cells: mxCell[]=mxUtils.sortCells(this.getSelectionCells(), true)) {

    cells = this.getCellsForGroup(cells);

    if (group == null) {
      group = this.createGroupCell(cells);
    }

    const bounds = this.getBoundsForGroup(group, cells, border);

    if (cells.length > 1 && bounds != null) {
      // Uses parent of group or previous parent of first child
      let parent = this.getModel().getParent(group);

      if (parent == null) {
        parent = this.getModel().getParent(cells[0]);
      }

      this.getModel().beginUpdate();
      try {
        // Checks if the group has a geometry and
        // creates one if one does not exist
        if (this.getCellGeometry(group) == null) {
          this.getModel().setGeometry(group, new mxGeometry());
        }

        // Adds the group into the parent
        let index = this.getModel().getChildCount(parent);
        this.cellsAdded(
          [group],
          parent,
          index,
          null,
          null,
          false,
          false,
          false
        );

        // Adds the children into the group and moves
        index = this.getModel().getChildCount(group);
        this.cellsAdded(cells, group, index, null, null, false, false, false);
        this.cellsMoved(cells, -bounds.x, -bounds.y, false, false, false);

        // Resizes the group
        this.cellsResized([group], [bounds], false);

        this.fireEvent(
          new mxEventObject(
            mxEvent.GROUP_CELLS,
            'group',
            group,
            'border',
            border,
            'cells',
            cells
          )
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
    return group;
  }

  /**
   * Function: getCellsForGroup
   *
   * Returns the cells with the same parent as the first cell
   * in the given array.
   */
  getCellsForGroup(cells: mxCell[]) {
    const result = [];
    if (cells != null && cells.length > 0) {
      const parent = this.getModel().getParent(cells[0]);
      result.push(cells[0]);

      // Filters selection cells with the same parent
      for (let i = 1; i < cells.length; i += 1) {
        if (this.getModel().getParent(cells[i]) === parent) {
          result.push(cells[i]);
        }
      }
    }
    return result;
  }

  /**
   * Function: getBoundsForGroup
   *
   * Returns the bounds to be used for the given group and children.
   */
  getBoundsForGroup(group: mxCell,
                    children: mxCell[],
                    border: number | null) {

    const result = this.getBoundingBoxFromGeometry(children, true);

    if (result != null) {
      if (this.isSwimlane(group)) {
        const size = this.getStartSize(group);

        result.x -= size.width;
        result.y -= size.height;
        result.width += size.width;
        result.height += size.height;
      }

      // Adds the border
      if (border != null) {
        result.x -= border;
        result.y -= border;
        result.width += 2 * border;
        result.height += 2 * border;
      }
    }

    return result;
  }

  /**
   * Function: createGroupCell
   *
   * Hook for creating the group cell to hold the given array of <mxCells> if
   * no group cell was given to the <group> function.
   *
   * The following code can be used to set the style of new group cells.
   *
   * (code)
   * let graphCreateGroupCell = graph.createGroupCell;
   * graph.createGroupCell = (cells)=>
   * {
   *   let group = graphCreateGroupCell.apply(this, arguments);
   *   group.setStyle('group');
   *
   *   return group;
   * };
   */
  createGroupCell(cells: mxCell[]) {
    const group = new mxCell('');
    group.setVertex(true);
    group.setConnectable(false);

    return group;
  }

  /**
   * Function: ungroupCells
   *
   * Ungroups the given cells by moving the children the children to their
   * parents parent and removing the empty groups. Returns the children that
   * have been removed from the groups.
   *
   * Parameters:
   *
   * cells - Array of cells to be ungrouped. If null is specified then the
   * selection cells are used.
   */
  ungroupCells(cells: mxCell[]) {
    let result: mxCell[] = [];

    if (cells == null) {
      cells = this.getCellsForUngroup();
    }

    if (cells != null && cells.length > 0) {
      this.getModel().beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          let children = this.getModel().getChildren(cells[i]);

          if (children != null && children.length > 0) {
            children = children.slice();
            const parent = this.getModel().getParent(cells[i]);
            const index = this.getModel().getChildCount(parent);

            this.cellsAdded(children, parent, index, null, null, true);
            result = result.concat(children);

            // Fix relative child cells
            for (let j = 0; j < children.length; j++) {
              const state = this.getView().getState(children[j]);
              let geo = this.getCellGeometry(children[j]);

              if (state != null && geo != null && geo.relative) {
                geo = <mxGeometry>geo.clone();
                geo.x = (<mxPoint>state.origin).x;
                geo.y = (<mxPoint>state.origin).y;
                geo.relative = false;

                this.getModel().setGeometry(children[j], geo);
              }
            }
          }
        }

        this.removeCellsAfterUngroup(cells);
        this.fireEvent(
          new mxEventObject(mxEvent.UNGROUP_CELLS, 'cells', cells)
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
    return result;
  }

  /**
   * Function: getCellsForUngroup
   *
   * Returns the selection cells that can be ungrouped.
   */
  getCellsForUngroup() {
    const cells = this.getSelectionCells();

    // Finds the cells with children
    const tmp = [];

    for (let i = 0; i < cells.length; i += 1) {
      if (
        this.getModel().isVertex(cells[i]) &&
        this.getModel().getChildCount(cells[i]) > 0
      ) {
        tmp.push(cells[i]);
      }
    }
    return tmp;
  }

  /**
   * Function: removeCellsAfterUngroup
   *
   * Hook to remove the groups after <ungroupCells>.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> that were ungrouped.
   */
  removeCellsAfterUngroup(cells: mxCell[]) {
    this.cellsRemoved(this.addAllEdges(cells));
  }

  /**
   * Function: removeCellsFromParent
   *
   * Removes the specified cells from their parents and adds them to the
   * default parent. Returns the cells that were removed from their parents.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be removed from their parents.
   */
  removeCellsFromParent(cells: mxCell[]) {
    if (cells == null) {
      cells = this.getSelectionCells();
    }
    this.getModel().beginUpdate();
    try {
      const parent = this.getDefaultParent();
      const index = this.getModel().getChildCount(parent);

      this.cellsAdded(cells, parent, index, null, null, true);
      this.fireEvent(
        new mxEventObject(mxEvent.REMOVE_CELLS_FROM_PARENT, 'cells', cells)
      );
    } finally {
      this.getModel().endUpdate();
    }
    return cells;
  }

  /**
   * Function: updateGroupBounds
   *
   * Updates the bounds of the given groups to include all children and returns
   * the passed-in cells. Call this with the groups in parent to child order,
   * top-most group first, the cells are processed in reverse order and cells
   * with no children are ignored.
   *
   * Parameters:
   *
   * cells - The groups whose bounds should be updated. If this is null, then
   * the selection cells are used.
   * border - Optional border to be added in the group. Default is 0.
   * moveGroup - Optional boolean that allows the group to be moved. Default
   * is false.
   * topBorder - Optional top border to be added in the group. Default is 0.
   * rightBorder - Optional top border to be added in the group. Default is 0.
   * bottomBorder - Optional top border to be added in the group. Default is 0.
   * leftBorder - Optional top border to be added in the group. Default is 0.
   */
  updateGroupBounds(
    cells: mxCell[],
    border: number=0,
    moveGroup: boolean=false,
    topBorder: number=0,
    rightBorder: number=0,
    bottomBorder: number=0,
    leftBorder: number=0
  ): mxCell[] {
    if (cells == null) {
      cells = this.getSelectionCells();
    }

    border = border != null ? border : 0;
    moveGroup = moveGroup != null ? moveGroup : false;
    topBorder = topBorder != null ? topBorder : 0;
    rightBorder = rightBorder != null ? rightBorder : 0;
    bottomBorder = bottomBorder != null ? bottomBorder : 0;
    leftBorder = leftBorder != null ? leftBorder : 0;

    this.getModel().beginUpdate();
    try {
      for (let i = cells.length - 1; i >= 0; i--) {
        let geo = this.getCellGeometry(cells[i]);

        if (geo != null) {
          const children = <mxCell[]>this.getChildCells(cells[i]);

          if (children != null && children.length > 0) {
            const bounds = this.getBoundingBoxFromGeometry(children, true);

            if (bounds != null && bounds.width > 0 && bounds.height > 0) {
              // Adds the size of the title area for swimlanes
              const size = <mxRectangle>(this.isSwimlane(cells[i])
                ? this.getActualStartSize(cells[i], true)
                : new mxRectangle());
              geo = <mxGeometry>geo.clone();

              if (moveGroup) {
                geo.x = Math.round(
                  geo.x + bounds.x - border - size.x - leftBorder
                );
                geo.y = Math.round(
                  geo.y + bounds.y - border - size.y - topBorder
                );
              }

              geo.width = Math.round(
                bounds.width +
                  2 * border +
                  size.x +
                  leftBorder +
                  rightBorder +
                  size.width
              );
              geo.height = Math.round(
                bounds.height +
                  2 * border +
                  size.y +
                  topBorder +
                  bottomBorder +
                  size.height
              );

              this.getModel().setGeometry(cells[i], geo);
              this.moveCells(
                children,
                border + size.x - bounds.x + leftBorder,
                border + size.y - bounds.y + topBorder
              );
            }
          }
        }
      }
    } finally {
      this.getModel().endUpdate();
    }

    return cells;
  }

  /**
   * Function: getBoundingBox
   *
   * Returns the bounding box for the given array of <mxCells>. The bounding box for
   * each cell and its descendants is computed using <mxGraphView.getBoundingBox>.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose bounding box should be returned.
   */
  getBoundingBox(cells: mxCell[]) {
    let result = null;

    if (cells != null && cells.length > 0) {
      for (let i = 0; i < cells.length; i += 1) {
        if (this.getModel().isVertex(cells[i]) || this.getModel().isEdge(cells[i])) {
          const bbox = this.getView().getBoundingBox(
            this.getView().getState(cells[i]),
            true
          );

          if (bbox != null) {
            if (result == null) {
              result = mxRectangle.fromRectangle(bbox);
            } else {
              result.add(bbox);
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Group: Cell cloning, insertion and removal
   */

  /**
   * Function: cloneCell
   *
   * Returns the clone for the given cell. Uses <cloneCells>.
   *
   * Parameters:
   *
   * cell - <mxCell> to be cloned.
   * allowInvalidEdges - Optional boolean that specifies if invalid edges
   * should be cloned. Default is true.
   * mapping - Optional mapping for existing clones.
   * keepPosition - Optional boolean indicating if the position of the cells should
   * be updated to reflect the lost parent cell. Default is false.
   */
  cloneCell(cell: mxCell,
            allowInvalidEdges: boolean=false,
            mapping: any=null,
            keepPosition: boolean=false): mxCell {

    return (<mxCell[]>this.cloneCells([cell], allowInvalidEdges, mapping, keepPosition))[0];
  }

  /**
   * Function: cloneCells
   *
   * Returns the clones for the given cells. The clones are created recursively
   * using <mxGraphModel.cloneCells>. If the terminal of an edge is not in the
   * given array, then the respective end is assigned a terminal point and the
   * terminal is removed.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be cloned.
   * allowInvalidEdges - Optional boolean that specifies if invalid edges
   * should be cloned. Default is true.
   * mapping - Optional mapping for existing clones.
   * keepPosition - Optional boolean indicating if the position of the cells should
   * be updated to reflect the lost parent cell. Default is false.
   */
  cloneCells(cells: mxCell[],
             allowInvalidEdges: boolean=true,
             mapping: any,
             keepPosition: boolean=false): mxCell[] | null {

    allowInvalidEdges = allowInvalidEdges != null ? allowInvalidEdges : true;
    let clones = null;

    if (cells != null) {
      // Creates a dictionary for fast lookups
      const dict = new mxDictionary();
      const tmp = [];

      for (let i = 0; i < cells.length; i += 1) {
        dict.put(cells[i], true);
        tmp.push(cells[i]);
      }

      if (tmp.length > 0) {
        const { scale } = this.view;
        const trans = this.getView().translate;
        clones = this.getModel().cloneCells(cells, true, mapping);

        for (let i = 0; i < cells.length; i += 1) {
          if (
            !allowInvalidEdges &&
            this.getModel().isEdge(clones[i]) &&
            this.getEdgeValidationError(
              <mxCell>clones[i],
                <mxCell>this.getModel().getTerminal(clones[i], true),
                <mxCell>this.getModel().getTerminal(clones[i], false)
            ) != null
          ) {
            clones[i] = null;
          } else {
            const g = this.getModel().getGeometry(clones[i]);

            if (g != null) {
              const state = this.getView().getState(cells[i]);
              const pstate = this.getView().getState(this.getModel().getParent(cells[i]));

              if (state != null && pstate != null) {
                const dx = keepPosition ? 0 : (<mxPoint>pstate.origin).x;
                const dy = keepPosition ? 0 : (<mxPoint>pstate.origin).y;

                if (this.getModel().isEdge(clones[i])) {
                  const pts = <mxPoint[]>state.absolutePoints;

                  if (pts != null) {
                    // Checks if the source is cloned or sets the terminal point
                    let src = this.getModel().getTerminal(cells[i], true);

                    while (src != null && !dict.get(src)) {
                      src = this.getModel().getParent(src);
                    }

                    if (src == null && pts[0] != null) {
                      g.setTerminalPoint(
                        new mxPoint(
                          pts[0].x / scale - trans.x,
                          pts[0].y / scale - trans.y
                        ),
                        true
                      );
                    }

                    // Checks if the target is cloned or sets the terminal point
                    let trg = this.getModel().getTerminal(cells[i], false);

                    while (trg != null && !dict.get(trg)) {
                      trg = this.getModel().getParent(trg);
                    }

                    const n = pts.length - 1;

                    if (trg == null && pts[n] != null) {
                      g.setTerminalPoint(
                        new mxPoint(
                          pts[n].x / scale - trans.x,
                          pts[n].y / scale - trans.y
                        ),
                        false
                      );
                    }

                    // Translates the control points
                    const { points } = g;

                    if (points != null) {
                      for (let j = 0; j < points.length; j++) {
                        points[j].x += dx;
                        points[j].y += dy;
                      }
                    }
                  }
                } else {
                  g.translate(dx, dy);
                }
              }
            }
          }
        }
      } else {
        clones = [];
      }
    }
    return clones;
  }

  /**
   * Function: insertVertex
   *
   * Adds a new vertex into the given parent <mxCell> using value as the user
   * object and the given coordinates as the <mxGeometry> of the new vertex.
   * The id and style are used for the respective properties of the new
   * <mxCell>, which is returned.
   *
   * When adding new vertices from a mouse event, one should take into
   * account the offset of the graph container and the scale and translation
   * of the view in order to find the correct unscaled, untranslated
   * coordinates using <mxGraph.getPointForEvent> as follows:
   *
   * (code)
   * let pt = graph.getPointForEvent(evt);
   * let parent = graph.getDefaultParent();
   * graph.insertVertex(parent, null,
   *       'Hello, World!', x, y, 220, 30);
   * (end)
   *
   * For adding image cells, the style parameter can be assigned as
   *
   * (code)
   * stylename;image=imageUrl
   * (end)
   *
   * See <mxGraph> for more information on using images.
   *
   * Parameters:
   *
   * parent - <mxCell> that specifies the parent of the new vertex.
   * id - Optional string that defines the Id of the new vertex.
   * value - Object to be used as the user object.
   * x - Integer that defines the x coordinate of the vertex.
   * y - Integer that defines the y coordinate of the vertex.
   * width - Integer that defines the width of the vertex.
   * height - Integer that defines the height of the vertex.
   * style - Optional string that defines the cell style.
   * relative - Optional boolean that specifies if the geometry is relative.
   * Default is false.
   */
  insertVertex = (...args: any[]): mxCell => {
    let parent;
    let id;
    let value;
    let x;
    let y;
    let width;
    let height;
    let style;
    let relative;

    if (args.length === 1) {
      // If only a single parameter, treat as an object
      // This syntax can be more readable
      const params = args[0];
      parent = params.parent;
      id = params.id;
      value = params.value;

      x = 'x' in params ? params.x : params.position[0];
      y = 'y' in params ? params.y : params.position[1];
      width = 'width' in params ? params.width : params.size[0];
      height = 'height' in params ? params.height : params.size[1];

      style = params.style;
      relative = params.relative;

    } else {
      // Otherwise treat as arguments
      [parent, id, value, x, y, width, height, style, relative] = args;
    }

    const vertex = this.createVertex(
      parent,
      id,
      value,
      x,
      y,
      width,
      height,
      style,
      relative
    );
    return this.addCell(vertex, parent);
  };

  /**
   * Function: createVertex
   *
   * Hook method that creates the new vertex for <insertVertex>.
   */
  createVertex(parent: mxCell,
               id: string,
               value: any,
               x: number,
               y: number,
               width: number,
               height: number,
               style: any,
               relative: boolean=false) {

    // Creates the geometry for the vertex
    const geometry = new mxGeometry(x, y, width, height);
    geometry.relative = relative != null ? relative : false;

    // Creates the vertex
    const vertex = new mxCell(value, geometry, style);
    vertex.setId(id);
    vertex.setVertex(true);
    vertex.setConnectable(true);

    return vertex;
  }

  /**
   * Function: insertEdge
   *
   * Adds a new edge into the given parent <mxCell> using value as the user
   * object and the given source and target as the terminals of the new edge.
   * The id and style are used for the respective properties of the new
   * <mxCell>, which is returned.
   *
   * Parameters:
   *
   * parent - <mxCell> that specifies the parent of the new edge.
   * id - Optional string that defines the Id of the new edge.
   * value - JavaScript object to be used as the user object.
   * source - <mxCell> that defines the source of the edge.
   * target - <mxCell> that defines the target of the edge.
   * style - Optional string that defines the cell style.
   */
  insertEdge(...args: any[]): mxCell {
    let parent: mxCell;
    let id: string = '';
    let value: any; // note me - can be a string or a class instance!!!
    let source: mxCell;
    let target: mxCell;
    let style: string;  // TODO: Also allow for an object or class instance??

    if (args.length === 1) {
      // If only a single parameter, treat as an object
      // This syntax can be more readable
      const params = args[0];
      parent = params.parent;
      id = params.id || '';
      value = params.value || '';
      source = params.source;
      target = params.target;
      style = params.style;
    } else {
      // otherwise treat as individual arguments
      [parent, id, value, source, target, style] = args;
    }

    const edge = this.createEdge(parent, id, value, source, target, style);
    return this.addEdge(edge, parent, source, target);
  };

  /**
   * Function: createEdge
   *
   * Hook method that creates the new edge for <insertEdge>. This
   * implementation does not set the source and target of the edge, these
   * are set when the edge is added to the model.
   *
   */
  createEdge(parent: mxCell | null=null,
             id: string,
             value: any,
             source: mxCell | null=null,
             target: mxCell | null=null,
             style: any) {

    // Creates the edge
    const edge = new mxCell(value, new mxGeometry(), style);
    edge.setId(id);
    edge.setEdge(true);
    (<mxGeometry>edge.geometry).relative = true;
    return edge;
  }

  /**
   * Function: addEdge
   *
   * Adds the edge to the parent and connects it to the given source and
   * target terminals. This is a shortcut method. Returns the edge that was
   * added.
   *
   * Parameters:
   *
   * edge - <mxCell> to be inserted into the given parent.
   * parent - <mxCell> that represents the new parent. If no parent is
   * given then the default parent is used.
   * source - Optional <mxCell> that represents the source terminal.
   * target - Optional <mxCell> that represents the target terminal.
   * index - Optional index to insert the cells at. Default is to append.
   */
  addEdge(edge: mxCell,
          parent: mxCell | null=null,
          source: mxCell | null=null,
          target: mxCell | null=null,
          index: number | null=null) {

    return this.addCell(edge, parent, index, source, target);
  }

  /**
   * Function: addCell
   *
   * Adds the cell to the parent and connects it to the given source and
   * target terminals. This is a shortcut method. Returns the cell that was
   * added.
   *
   * Parameters:
   *
   * cell - <mxCell> to be inserted into the given parent.
   * parent - <mxCell> that represents the new parent. If no parent is
   * given then the default parent is used.
   * index - Optional index to insert the cells at. Default is to append.
   * source - Optional <mxCell> that represents the source terminal.
   * target - Optional <mxCell> that represents the target terminal.
   */
  addCell(cell: mxCell,
          parent: mxCell | null=null,
          index: number | null=null,
          source: mxCell | null=null,
          target: mxCell | null=null): mxCell {

    return this.addCells([cell], parent, index, source, target)[0];
  }

  /**
   * Function: addCells
   *
   * Adds the cells to the parent at the given index, connecting each cell to
   * the optional source and target terminal. The change is carried out using
   * <cellsAdded>. This method fires <mxEvent.ADD_CELLS> while the
   * transaction is in progress. Returns the cells that were added.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be inserted.
   * parent - <mxCell> that represents the new parent. If no parent is
   * given then the default parent is used.
   * index - Optional index to insert the cells at. Default is to append.
   * source - Optional source <mxCell> for all inserted cells.
   * target - Optional target <mxCell> for all inserted cells.
   * absolute - Optional boolean indicating of cells should be kept at
   * their absolute position. Default is false.
   */
  addCells(cells: mxCell[],
           parent: mxCell | null=null,
           index: number | null=null,
           source: mxCell | null=null,
           target: mxCell | null=null,
           absolute: boolean=false) {

    if (parent == null) {
      parent = this.getDefaultParent();
    }

    if (index == null) {
      index = this.getModel().getChildCount(parent);
    }

    this.getModel().beginUpdate();
    try {
      this.cellsAdded(
        cells,
        parent,
        index,
        source,
        target,
        absolute != null ? absolute : false,
        true
      );
      this.fireEvent(
        new mxEventObject(
          mxEvent.ADD_CELLS,
          'cells',
          cells,
          'parent',
          parent,
          'index',
          index,
          'source',
          source,
          'target',
          target
        )
      );
    } finally {
      this.getModel().endUpdate();
    }

    return cells;
  }

  /**
   * Function: cellsAdded
   *
   * Adds the specified cells to the given parent. This method fires
   * <mxEvent.CELLS_ADDED> while the transaction is in progress.
   */
  cellsAdded(
    cells: mxCell[] | null=null,
    parent: mxCell | null=null,
    index: number | null=null,
    source: mxCell | null=null,
    target: mxCell | null=null,
    absolute: boolean=false,
    constrain: boolean=false,
    extend: boolean=true
  ): void {
    if (cells != null && parent != null && index != null) {
      this.getModel().beginUpdate();
      try {
        const parentState = absolute ? this.getView().getState(parent) : null;
        const o1 = parentState != null ? parentState.origin : null;
        const zero = new mxPoint(0, 0);

        for (let i = 0; i < cells.length; i += 1) {
          if (cells[i] == null) {
            index--;
          } else {
            const previous = this.getModel().getParent(cells[i]);

            // Keeps the cell at its absolute location
            if (o1 != null && cells[i] !== parent && parent !== previous) {
              const oldState = this.getView().getState(previous);
              const o2 = <mxPoint>(oldState != null ? oldState.origin : zero);
              let geo = this.getModel().getGeometry(cells[i]);

              if (geo != null) {
                const dx = o2.x - o1.x;
                const dy = o2.y - o1.y;

                // FIXME: Cells should always be inserted first before any other edit
                // to avoid forward references in sessions.
                geo = <mxGeometry>geo.clone();
                geo.translate(dx, dy);

                if (
                  !geo.relative &&
                  this.getModel().isVertex(cells[i]) &&
                  !this.isAllowNegativeCoordinates()
                ) {
                  geo.x = Math.max(0, geo.x);
                  geo.y = Math.max(0, geo.y);
                }

                this.getModel().setGeometry(cells[i], geo);
              }
            }

            // Decrements all following indices
            // if cell is already in parent
            if (
              parent === previous &&
              index + i > this.getModel().getChildCount(parent)
            ) {
              index--;
            }

            this.getModel().add(parent, cells[i], index + i);

            if (this.autoSizeCellsOnAdd) {
              this.autoSizeCell(cells[i], true);
            }

            // Extends the parent or constrains the child
            if (
              (extend == null || extend) &&
              this.isExtendParentsOnAdd(cells[i]) &&
              this.isExtendParent(cells[i])
            ) {
              this.extendParent(cells[i]);
            }

            // Additionally constrains the child after extending the parent
            if (constrain == null || constrain) {
              this.constrainChild(cells[i]);
            }

            // Sets the source terminal
            if (source != null) {
              this.cellConnected(cells[i], source, true);
            }

            // Sets the target terminal
            if (target != null) {
              this.cellConnected(cells[i], target, false);
            }
          }
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.CELLS_ADDED,
            'cells', cells,
            'parent', parent,
            'index', index,
            'source', source,
            'target', target,
            'absolute', absolute
          )
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: autoSizeCell
   *
   * Resizes the specified cell to just fit around the its label and/or children
   *
   * Parameters:
   *
   * cell - <mxCells> to be resized.
   * recurse - Optional boolean which specifies if all descendants should be
   * autosized. Default is true.
   */
  autoSizeCell(cell: mxCell,
               recurse: boolean=true) {

    if (recurse) {
      const childCount = this.getModel().getChildCount(cell);

      for (let i = 0; i < childCount; i += 1) {
        this.autoSizeCell(<mxCell>this.getModel().getChildAt(cell, i));
      }
    }

    if (this.getModel().isVertex(cell) && this.isAutoSizeCell(cell)) {
      this.updateCellSize(cell);
    }
  }

  /**
   * Function: removeCells
   *
   * Removes the given cells from the graph including all connected edges if
   * includeEdges is true. The change is carried out using <cellsRemoved>.
   * This method fires <mxEvent.REMOVE_CELLS> while the transaction is in
   * progress. The removed cells are returned as an array.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to remove. If null is specified then the
   * selection cells which are deletable are used.
   * includeEdges - Optional boolean which specifies if all connected edges
   * should be removed as well. Default is true.
   */
  removeCells(cells: mxCell[] | null=null,
              includeEdges: boolean=true) {

    includeEdges = includeEdges != null ? includeEdges : true;

    if (cells == null) {
      cells = <mxCell[]>this.getDeletableCells(this.getSelectionCells());
    }

    // Adds all edges to the cells
    if (includeEdges) {
      // FIXME: Remove duplicate cells in result or do not add if
      // in cells or descendant of cells
      cells = this.getDeletableCells(this.addAllEdges(cells));
    } else {
      cells = cells.slice();

      // Removes edges that are currently not
      // visible as those cannot be updated
      const edges = <mxCell[]>this.getDeletableCells(this.getAllEdges(cells));
      const dict = new mxDictionary();

      for (let i = 0; i < cells.length; i += 1) {
        dict.put(cells[i], true);
      }

      for (let i = 0; i < edges.length; i += 1) {
        if (this.getView().getState(edges[i]) == null && !dict.get(edges[i])) {
          dict.put(edges[i], true);
          cells.push(edges[i]);
        }
      }
    }

    this.getModel().beginUpdate();
    try {
      this.cellsRemoved(<mxCell[]>cells);
      this.fireEvent(
        new mxEventObject(
          mxEvent.REMOVE_CELLS,
          'cells',
          cells,
          'includeEdges',
          includeEdges
        )
      );
    } finally {
      this.getModel().endUpdate();
    }

    return cells;
  }

  /**
   * Function: cellsRemoved
   *
   * Removes the given cells from the model. This method fires
   * <mxEvent.CELLS_REMOVED> while the transaction is in progress.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to remove.
   */
  cellsRemoved(cells: mxCell[]) {
    if (cells != null && cells.length > 0) {
      const { scale } = this.view;
      const tr = this.getView().translate;

      this.getModel().beginUpdate();
      try {
        // Creates hashtable for faster lookup
        const dict = new mxDictionary();

        for (let i = 0; i < cells.length; i += 1) {
          dict.put(cells[i], true);
        }

        for (let i = 0; i < cells.length; i += 1) {
          // Disconnects edges which are not being removed
          const edges = this.getAllEdges([cells[i]]);

          const disconnectTerminal = mxUtils.bind(this, (edge: mxCell, source: boolean) => {
            let geo = this.getModel().getGeometry(edge);

            if (geo != null) {
              // Checks if terminal is being removed
              const terminal = this.getModel().getTerminal(edge, source);
              let connected = false;
              let tmp = terminal;

              while (tmp != null) {
                if (cells[i] === tmp) {
                  connected = true;
                  break;
                }

                tmp = this.getModel().getParent(tmp);
              }

              if (connected) {
                geo = <mxGeometry>geo.clone();
                const state = this.getView().getState(edge);

                if (state != null && state.absolutePoints != null) {
                  const pts = <mxPoint[]>state.absolutePoints;
                  const n = source ? 0 : pts.length - 1;

                  geo.setTerminalPoint(
                    new mxPoint(
                      pts[n].x / scale - tr.x - (<mxPoint>state.origin).x,
                      pts[n].y / scale - tr.y - (<mxPoint>state.origin).y
                    ),
                    source
                  );
                } else {
                  // Fallback to center of terminal if routing
                  // points are not available to add new point
                  // KNOWN: Should recurse to find parent offset
                  // of edge for nested groups but invisible edges
                  // should be removed in removeCells step
                  const tstate = this.getView().getState(terminal);

                  if (tstate != null) {
                    geo.setTerminalPoint(
                      new mxPoint(
                        tstate.getCenterX() / scale - tr.x,
                        tstate.getCenterY() / scale - tr.y
                      ),
                      source
                    );
                  }
                }

                this.getModel().setGeometry(edge, geo);
                this.getModel().setTerminal(edge, null, source);
              }
            }
          });

          for (let j = 0; j < edges.length; j++) {
            if (!dict.get(edges[j])) {
              dict.put(edges[j], true);
              disconnectTerminal(edges[j], true);
              disconnectTerminal(edges[j], false);
            }
          }

          this.getModel().remove(cells[i]);
        }

        this.fireEvent(
          new mxEventObject(mxEvent.CELLS_REMOVED, 'cells', cells)
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: splitEdge
   *
   * Splits the given edge by adding the newEdge between the previous source
   * and the given cell and reconnecting the source of the given edge to the
   * given cell. This method fires <mxEvent.SPLIT_EDGE> while the transaction
   * is in progress. Returns the new edge that was inserted.
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge to be splitted.
   * cells - <mxCells> that represents the cells to insert into the edge.
   * newEdge - <mxCell> that represents the edge to be inserted.
   * dx - Optional integer that specifies the vector to move the cells.
   * dy - Optional integer that specifies the vector to move the cells.
   * x - Integer that specifies the x-coordinate of the drop location.
   * y - Integer that specifies the y-coordinate of the drop location.
   * parent - Optional parent to insert the cell. If null the parent of
   * the edge is used.
   */
  splitEdge(edge: mxCell,
            cells: mxCell[],
            newEdge: mxCell,
            dx: number=0,
            dy: number=0,
            x: number,
            y: number,
            parent: mxCell | null=null) {

    parent = parent != null ? parent : this.getModel().getParent(edge);
    const source = this.getModel().getTerminal(edge, true);

    this.getModel().beginUpdate();
    try {
      if (newEdge == null) {
        newEdge = <mxCell>this.cloneCell(edge);

        // Removes waypoints before/after new cell
        const state = this.getView().getState(edge);
        let geo = this.getCellGeometry(newEdge);

        if (geo != null && geo.points != null && state != null) {
          const t = this.getView().translate;
          const s = this.getView().scale;
          const idx = mxUtils.findNearestSegment(
            state,
            (dx + t.x) * s,
            (dy + t.y) * s
          );

          geo.points = geo.points.slice(0, idx);
          geo = <mxGeometry>this.getCellGeometry(edge);

          if (geo != null && geo.points != null) {
            geo = <mxGeometry>geo.clone();
            geo.points = geo.points.slice(idx);
            this.getModel().setGeometry(edge, geo);
          }
        }
      }

      this.cellsMoved(cells, dx, dy, false, false);
      this.cellsAdded(
        cells,
        parent,
        this.getModel().getChildCount(parent),
        null,
        null,
        true
      );
      this.cellsAdded(
        [newEdge],
        parent,
        this.getModel().getChildCount(parent),
        source,
        cells[0],
        false
      );
      this.cellConnected(edge, cells[0], true);
      this.fireEvent(
        new mxEventObject(
          mxEvent.SPLIT_EDGE,
          'edge',
          edge,
          'cells',
          cells,
          'newEdge',
          newEdge,
          'dx',
          dx,
          'dy',
          dy
        )
      );
    } finally {
      this.getModel().endUpdate();
    }

    return newEdge;
  }

  /**
   * Group: Cell visibility
   */

  /**
   * Function: toggleCells
   *
   * Sets the visible state of the specified cells and all connected edges
   * if includeEdges is true. The change is carried out using <cellsToggled>.
   * This method fires <mxEvent.TOGGLE_CELLS> while the transaction is in
   * progress. Returns the cells whose visible state was changed.
   *
   * Parameters:
   *
   * show - Boolean that specifies the visible state to be assigned.
   * cells - Array of <mxCells> whose visible state should be changed. If
   * null is specified then the selection cells are used.
   * includeEdges - Optional boolean indicating if the visible state of all
   * connected edges should be changed as well. Default is true.
   */
  toggleCells(show: boolean=false,
              cells: mxCell[]=this.getSelectionCells(),
              includeEdges: boolean=true): mxCell[] | null {

    // Adds all connected edges recursively
    if (includeEdges) {
      cells = this.addAllEdges(cells);
    }

    this.getModel().beginUpdate();
    try {
      this.cellsToggled(cells, show);
      this.fireEvent(
        new mxEventObject(
          mxEvent.TOGGLE_CELLS,
          'show',
          show,
          'cells',
          cells,
          'includeEdges',
          includeEdges
        )
      );
    } finally {
      this.getModel().endUpdate();
    }
    return cells;
  }

  /**
   * Function: cellsToggled
   *
   * Sets the visible state of the specified cells.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose visible state should be changed.
   * show - Boolean that specifies the visible state to be assigned.
   */
  cellsToggled(cells: mxCell[] | null=null,
               show: boolean=false): void {

    if (cells != null && cells.length > 0) {
      this.getModel().beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          this.getModel().setVisible(cells[i], show);
        }
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Group: Folding
   */

  /**
   * Function: foldCells
   *
   * Sets the collapsed state of the specified cells and all descendants
   * if recurse is true. The change is carried out using <cellsFolded>.
   * This method fires <mxEvent.FOLD_CELLS> while the transaction is in
   * progress. Returns the cells whose collapsed state was changed.
   *
   * Parameters:
   *
   * collapsed - Boolean indicating the collapsed state to be assigned.
   * recurse - Optional boolean indicating if the collapsed state of all
   * descendants should be set. Default is false.
   * cells - Array of <mxCells> whose collapsed state should be set. If
   * null is specified then the foldable selection cells are used.
   * checkFoldable - Optional boolean indicating of isCellFoldable should be
   * checked. Default is false.
   * evt - Optional native event that triggered the invocation.
   */
  foldCells(collapse: boolean=false,
            recurse: boolean=false,
            cells: mxCell[] | null=null,
            checkFoldable: boolean=false,
            evt: mxEventObject | null=null): mxCell[] | null {

    if (cells == null) {
      cells = this.getFoldableCells(this.getSelectionCells(), collapse);
    }

    this.stopEditing(false);

    this.getModel().beginUpdate();
    try {
      this.cellsFolded(cells, collapse, recurse, checkFoldable);
      this.fireEvent(
        new mxEventObject(
          mxEvent.FOLD_CELLS,
          'collapse',
          collapse,
          'recurse',
          recurse,
          'cells',
          cells
        )
      );
    } finally {
      this.getModel().endUpdate();
    }
    return cells;
  }

  /**
   * Function: cellsFolded
   *
   * Sets the collapsed state of the specified cells. This method fires
   * <mxEvent.CELLS_FOLDED> while the transaction is in progress. Returns the
   * cells whose collapsed state was changed.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose collapsed state should be set.
   * collapsed - Boolean indicating the collapsed state to be assigned.
   * recurse - Boolean indicating if the collapsed state of all descendants
   * should be set.
   * checkFoldable - Optional boolean indicating of isCellFoldable should be
   * checked. Default is false.
   */
  cellsFolded(cells: mxCell[] | null=null,
              collapse: boolean=false,
              recurse: boolean=false,
              checkFoldable: boolean=false): void {

    if (cells != null && cells.length > 0) {
      this.getModel().beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          if (
            (!checkFoldable || this.isCellFoldable(cells[i], collapse)) &&
            collapse !== this.isCellCollapsed(cells[i])
          ) {
            this.getModel().setCollapsed(cells[i], collapse);
            this.swapBounds(cells[i], collapse);

            if (this.isExtendParent(cells[i])) {
              this.extendParent(cells[i]);
            }

            if (recurse) {
              const children = this.getModel().getChildren(cells[i]);
              this.cellsFolded(children, collapse, recurse);
            }

            this.constrainChild(cells[i]);
          }
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.CELLS_FOLDED,
            'cells',
            cells,
            'collapse',
            collapse,
            'recurse',
            recurse
          )
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: swapBounds
   *
   * Swaps the alternate and the actual bounds in the geometry of the given
   * cell invoking <updateAlternateBounds> before carrying out the swap.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the bounds should be swapped.
   * willCollapse - Boolean indicating if the cell is going to be collapsed.
   */
  swapBounds(cell: mxCell | null,
             willCollapse: boolean=false): void {

    if (cell != null) {
      let geo = this.getModel().getGeometry(cell);
      if (geo != null) {
        geo = <mxGeometry>geo.clone();

        this.updateAlternateBounds(cell, geo, willCollapse);
        geo.swap();

        this.getModel().setGeometry(cell, geo);
      }
    }
  }

  /**
   * Function: updateAlternateBounds
   *
   * Updates or sets the alternate bounds in the given geometry for the given
   * cell depending on whether the cell is going to be collapsed. If no
   * alternate bounds are defined in the geometry and
   * <collapseToPreferredSize> is true, then the preferred size is used for
   * the alternate bounds. The top, left corner is always kept at the same
   * location.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the geometry is being udpated.
   * g - <mxGeometry> for which the alternate bounds should be updated.
   * willCollapse - Boolean indicating if the cell is going to be collapsed.
   */
  updateAlternateBounds(cell: mxCell | null=null,
                        geo: mxGeometry | null=null,
                        willCollapse: boolean=false): void {

    if (cell != null && geo != null) {
      const style = this.getCurrentCellStyle(cell);

      if (geo.alternateBounds == null) {
        let bounds = geo;

        if (this.collapseToPreferredSize) {
          const tmp = this.getPreferredSizeForCell(cell);

          if (tmp != null) {
            bounds = <mxGeometry>tmp;

            const startSize = mxUtils.getValue(
              style,
              mxConstants.STYLE_STARTSIZE
            );

            if (startSize > 0) {
              bounds.height = Math.max(bounds.height, startSize);
            }
          }
        }

        geo.alternateBounds = new mxRectangle(
          0,
          0,
          bounds.width,
          bounds.height
        );
      }

      if (geo.alternateBounds != null) {
        geo.alternateBounds.x = geo.x;
        geo.alternateBounds.y = geo.y;

        const alpha = mxUtils.toRadians(style[mxConstants.STYLE_ROTATION] || 0);

        if (alpha !== 0) {
          const dx = geo.alternateBounds.getCenterX() - geo.getCenterX();
          const dy = geo.alternateBounds.getCenterY() - geo.getCenterY();

          const cos = Math.cos(alpha);
          const sin = Math.sin(alpha);

          const dx2 = cos * dx - sin * dy;
          const dy2 = sin * dx + cos * dy;

          geo.alternateBounds.x += dx2 - dx;
          geo.alternateBounds.y += dy2 - dy;
        }
      }
    }
  }

  /**
   * Function: addAllEdges
   *
   * Returns an array with the given cells and all edges that are connected
   * to a cell or one of its descendants.
   */
  addAllEdges(cells: mxCell[]): mxCell[] {
    const allCells = cells.slice();
    return mxUtils.removeDuplicates(allCells.concat(this.getAllEdges(cells)));
  }

  /**
   * Function: getAllEdges
   *
   * Returns all edges connected to the given cells or its descendants.
   */
  getAllEdges(cells: mxCell[] | null): mxCell[] {
    let edges: mxCell[] = [];
    if (cells != null) {
      for (let i = 0; i < cells.length; i += 1) {
        const edgeCount = this.getModel().getEdgeCount(cells[i]);

        for (let j = 0; j < edgeCount; j++) {
          edges.push(<mxCell>this.getModel().getEdgeAt(cells[i], j));
        }

        // Recurses
        const children = this.getModel().getChildren(cells[i]);
        edges = edges.concat(this.getAllEdges(<mxCell[]>children));
      }
    }
    return edges;
  }

  /**
   * Group: Cell sizing
   */

  /**
   * Function: updateCellSize
   *
   * Updates the size of the given cell in the model using <cellSizeUpdated>.
   * This method fires <mxEvent.UPDATE_CELL_SIZE> while the transaction is in
   * progress. Returns the cell whose size was updated.
   *
   * Parameters:
   *
   * cell - <mxCell> whose size should be updated.
   */
  updateCellSize(cell: mxCell,
                 ignoreChildren: boolean=false) {

    this.getModel().beginUpdate();
    try {
      this.cellSizeUpdated(cell, ignoreChildren);
      this.fireEvent(
        new mxEventObject(
          mxEvent.UPDATE_CELL_SIZE,
          'cell', cell,
          'ignoreChildren', ignoreChildren
        )
      );
    } finally {
      this.getModel().endUpdate();
    }
    return cell;
  }

  /**
   * Function: cellSizeUpdated
   *
   * Updates the size of the given cell in the model using
   * <getPreferredSizeForCell> to get the new size.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the size should be changed.
   */
  cellSizeUpdated(cell: mxCell | null=null,
                  ignoreChildren: boolean=false): void {

    if (cell != null) {
      this.getModel().beginUpdate();
      try {
        const size = this.getPreferredSizeForCell(cell);
        let geo = this.getModel().getGeometry(cell);

        if (size != null && geo != null) {
          const collapsed = this.isCellCollapsed(cell);
          geo = <mxGeometry>geo.clone();

          if (this.isSwimlane(cell)) {
            const style = this.getCellStyle(cell);
            let cellStyle = this.getModel().getStyle(cell);

            if (cellStyle == null) {
              cellStyle = '';
            }

            if (mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
              cellStyle = mxUtils.setStyle(
                cellStyle,
                mxConstants.STYLE_STARTSIZE,
                size.height + 8
              );

              if (collapsed) {
                geo.height = size.height + 8;
              }

              geo.width = size.width;
            } else {
              cellStyle = mxUtils.setStyle(
                cellStyle,
                mxConstants.STYLE_STARTSIZE,
                size.width + 8
              );

              if (collapsed) {
                geo.width = size.width + 8;
              }

              geo.height = size.height;
            }

            this.getModel().setStyle(cell, cellStyle);
          } else {
            const state = this.getView().createState(cell);
            const align =
              state.style[mxConstants.STYLE_ALIGN] || mxConstants.ALIGN_CENTER;

            if (align === mxConstants.ALIGN_RIGHT) {
              geo.x += geo.width - size.width;
            } else if (align === mxConstants.ALIGN_CENTER) {
              geo.x += Math.round((geo.width - size.width) / 2);
            }

            const valign = this.getVerticalAlign(state);

            if (valign === mxConstants.ALIGN_BOTTOM) {
              geo.y += geo.height - size.height;
            } else if (valign === mxConstants.ALIGN_MIDDLE) {
              geo.y += Math.round((geo.height - size.height) / 2);
            }

            geo.width = size.width;
            geo.height = size.height;
          }

          if (!ignoreChildren && !collapsed) {
            const bounds = this.getView().getBounds(<mxCell[]>this.getModel().getChildren(cell));

            if (bounds != null) {
              const tr = this.getView().translate;
              const { scale } = this.view;

              const width = (bounds.x + bounds.width) / scale - geo.x - tr.x;
              const height = (bounds.y + bounds.height) / scale - geo.y - tr.y;

              geo.width = Math.max(geo.width, width);
              geo.height = Math.max(geo.height, height);
            }
          }

          this.cellsResized([cell], [geo], false);
        }
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: getPreferredSizeForCell
   *
   * Returns the preferred width and height of the given <mxCell> as an
   * <mxRectangle>. To implement a minimum width, add a new style eg.
   * minWidth in the vertex and override this method as follows.
   *
   * (code)
   * let graphGetPreferredSizeForCell = graph.getPreferredSizeForCell;
   * graph.getPreferredSizeForCell = (cell)=>
   * {
   *   let result = graphGetPreferredSizeForCell.apply(this, arguments);
   *   let style = this.getCellStyle(cell);
   *
   *   if (style['minWidth'] > 0)
   *   {
   *     result.width = Math.max(style['minWidth'], result.width);
   *   }
   *
   *   return result;
   * };
   * (end)
   *
   * Parameters:
   *
   * cell - <mxCell> for which the preferred size should be returned.
   * textWidth - Optional maximum text width for word wrapping.
   */
  getPreferredSizeForCell(cell: mxCell,
                          textWidth: number | null=null): mxRectangle | null {
    let result = null;

    if (cell != null) {
      const state = this.getView().createState(cell);
      const { style } = state;

      if (!this.getModel().isEdge(cell)) {
        const fontSize =
          style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE;
        let dx = 0;
        let dy = 0;

        // Adds dimension of image if shape is a label
        if (
          this.getImage(state) != null ||
          style[mxConstants.STYLE_IMAGE] != null
        ) {
          if (style[mxConstants.STYLE_SHAPE] === mxConstants.SHAPE_LABEL) {
            if (
              style[mxConstants.STYLE_VERTICAL_ALIGN] ===
              mxConstants.ALIGN_MIDDLE
            ) {
              dx +=
                parseFloat(style[mxConstants.STYLE_IMAGE_WIDTH]) || new mxLabel().imageSize;
            }

            if (style[mxConstants.STYLE_ALIGN] !== mxConstants.ALIGN_CENTER) {
              dy +=
                parseFloat(style[mxConstants.STYLE_IMAGE_HEIGHT]) || new mxLabel().imageSize;
            }
          }
        }

        // Adds spacings
        dx += 2 * (style[mxConstants.STYLE_SPACING] || 0);
        dx += style[mxConstants.STYLE_SPACING_LEFT] || 0;
        dx += style[mxConstants.STYLE_SPACING_RIGHT] || 0;

        dy += 2 * (style[mxConstants.STYLE_SPACING] || 0);
        dy += style[mxConstants.STYLE_SPACING_TOP] || 0;
        dy += style[mxConstants.STYLE_SPACING_BOTTOM] || 0;

        // Add spacing for collapse/expand icon
        // LATER: Check alignment and use constants
        // for image spacing
        const image = this.getFoldingImage(state);

        if (image != null) {
          dx += image.width + 8;
        }

        // Adds space for label
        let value = <string>this.cellRenderer.getLabelValue(state);

        if (value != null && value.length > 0) {
          if (!this.isHtmlLabel(<mxCell>state.cell)) {
            value = mxUtils.htmlEntities(value, false);
          }

          value = value.replace(/\n/g, '<br>');

          const size = mxUtils.getSizeForString(
            value,
            fontSize,
            style[mxConstants.STYLE_FONTFAMILY],
            textWidth,
            style[mxConstants.STYLE_FONTSTYLE]
          );
          let width = size.width + dx;
          let height = size.height + dy;

          if (!mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
            const tmp = height;
            height = width;
            width = tmp;
          }

          if (this.gridEnabled) {
            width = this.snap(width + this.gridSize / 2);
            height = this.snap(height + this.gridSize / 2);
          }

          result = new mxRectangle(0, 0, width, height);
        } else {
          const gs2 = 4 * this.gridSize;
          result = new mxRectangle(0, 0, gs2, gs2);
        }
      }
    }

    return result;
  }

  /**
   * Function: resizeCell
   *
   * Sets the bounds of the given cell using <resizeCells>. Returns the
   * cell which was passed to the function.
   *
   * Parameters:
   *
   * cell - <mxCell> whose bounds should be changed.
   * bounds - <mxRectangle> that represents the new bounds.
   */
  resizeCell(cell: mxCell,
             bounds: mxRectangle,
             recurse: boolean=false): mxCell {

    return this.resizeCells([cell], [bounds], recurse)[0];
  }

  /**
   * Function: resizeCells
   *
   * Sets the bounds of the given cells and fires a <mxEvent.RESIZE_CELLS>
   * event while the transaction is in progress. Returns the cells which
   * have been passed to the function.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose bounds should be changed.
   * bounds - Array of <mxRectangles> that represent the new bounds.
   */
  resizeCells(cells: mxCell[],
              bounds: mxRectangle[],
              recurse: boolean=this.isRecursiveResize()): mxCell[] {

    this.getModel().beginUpdate();
    try {
      const prev = this.cellsResized(cells, bounds, recurse);
      this.fireEvent(
        new mxEventObject(
          mxEvent.RESIZE_CELLS,
          'cells',
          cells,
          'bounds',
          bounds,
          'previous',
          prev
        )
      );
    } finally {
      this.getModel().endUpdate();
    }
    return cells;
  }

  /**
   * Function: cellsResized
   *
   * Sets the bounds of the given cells and fires a <mxEvent.CELLS_RESIZED>
   * event. If <extendParents> is true, then the parent is extended if a
   * child size is changed so that it overlaps with the parent.
   *
   * The following example shows how to control group resizes to make sure
   * that all child cells stay within the group.
   *
   * (code)
   * graph.addListener(mxEvent.CELLS_RESIZED, (sender, evt)=>
   * {
   *   let cells = evt.getProperty('cells');
   *
   *   if (cells != null)
   *   {
   *     for (let i = 0; i < cells.length; i += 1)
   *     {
   *       if (graph.getModel().getChildCount(cells[i]) > 0)
   *       {
   *         let geo = graph.getCellGeometry(cells[i]);
   *
   *         if (geo != null)
   *         {
   *           let children = graph.getChildCells(cells[i], true, true);
   *           let bounds = graph.getBoundingBoxFromGeometry(children, true);
   *
   *           geo = geo.clone();
   *           geo.width = Math.max(geo.width, bounds.width);
   *           geo.height = Math.max(geo.height, bounds.height);
   *
   *           graph.getModel().setGeometry(cells[i], geo);
   *         }
   *       }
   *     }
   *   }
   * });
   * (end)
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose bounds should be changed.
   * bounds - Array of <mxRectangles> that represent the new bounds.
   * recurse - Optional boolean that specifies if the children should be resized.
   */
  cellsResized(cells: mxCell[] | null=null,
               bounds: mxRectangle[] | null=null,
               recurse: boolean=false): any[] {

    recurse = recurse != null ? recurse : false;
    const prev = [];

    if (cells != null && bounds != null && cells.length === bounds.length) {
      this.getModel().beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          prev.push(this.cellResized(cells[i], bounds[i], false, recurse));

          if (this.isExtendParent(cells[i])) {
            this.extendParent(cells[i]);
          }

          this.constrainChild(cells[i]);
        }

        if (this.resetEdgesOnResize) {
          this.resetEdges(cells);
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.CELLS_RESIZED,
            'cells',
            cells,
            'bounds',
            bounds,
            'previous',
            prev
          )
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
    return prev;
  }

  /**
   * Function: cellResized
   *
   * Resizes the parents recursively so that they contain the complete area
   * of the resized child cell.
   *
   * Parameters:
   *
   * cell - <mxCell> whose bounds should be changed.
   * bounds - <mxRectangles> that represent the new bounds.
   * ignoreRelative - Boolean that indicates if relative cells should be ignored.
   * recurse - Optional boolean that specifies if the children should be resized.
   */
  cellResized(cell: mxCell,
              bounds: mxRectangle,
              ignoreRelative: boolean=false,
              recurse: boolean=false): mxGeometry | null {

    const prev = this.getModel().getGeometry(cell);

    if (
      prev != null &&
      (prev.x !== bounds.x ||
        prev.y !== bounds.y ||
        prev.width !== bounds.width ||
        prev.height !== bounds.height)
    ) {
      const geo = prev.clone();

      if (!ignoreRelative && geo.relative) {
        const { offset } = geo;

        if (offset != null) {
          offset.x += bounds.x - geo.x;
          offset.y += bounds.y - geo.y;
        }
      } else {
        geo.x = bounds.x;
        geo.y = bounds.y;
      }

      geo.width = bounds.width;
      geo.height = bounds.height;

      if (
        !geo.relative &&
        this.getModel().isVertex(cell) &&
        !this.isAllowNegativeCoordinates()
      ) {
        geo.x = Math.max(0, geo.x);
        geo.y = Math.max(0, geo.y);
      }

      this.getModel().beginUpdate();
      try {
        if (recurse) {
          this.resizeChildCells(cell, geo);
        }

        this.getModel().setGeometry(cell, geo);
        this.constrainChildCells(cell);
      } finally {
        this.getModel().endUpdate();
      }
    }
    return prev;
  }

  /**
   * Function: resizeChildCells
   *
   * Resizes the child cells of the given cell for the given new geometry with
   * respect to the current geometry of the cell.
   *
   * Parameters:
   *
   * cell - <mxCell> that has been resized.
   * newGeo - <mxGeometry> that represents the new bounds.
   */
  resizeChildCells(cell: mxCell,
                   newGeo: mxGeometry): void {

    const geo = <mxGeometry>this.getModel().getGeometry(cell);
    const dx = geo.width !== 0 ? newGeo.width / geo.width : 1;
    const dy = geo.height !== 0 ? newGeo.height / geo.height : 1;
    const childCount = this.getModel().getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      this.scaleCell(<mxCell>this.getModel().getChildAt(cell, i), dx, dy, true);
    }
  }

  /**
   * Function: constrainChildCells
   *
   * Constrains the children of the given cell using <constrainChild>.
   *
   * Parameters:
   *
   * cell - <mxCell> that has been resized.
   */
  constrainChildCells(cell: mxCell) {
    const childCount = this.getModel().getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      this.constrainChild(<mxCell>this.getModel().getChildAt(cell, i));
    }
  }

  /**
   * Function: scaleCell
   *
   * Scales the points, position and size of the given cell according to the
   * given vertical and horizontal scaling factors.
   *
   * Parameters:
   *
   * cell - <mxCell> whose geometry should be scaled.
   * dx - Horizontal scaling factor.
   * dy - Vertical scaling factor.
   * recurse - Boolean indicating if the child cells should be scaled.
   */
  scaleCell(cell: mxCell,
            dx: number,
            dy: number,
            recurse: boolean=false): void {

    let geo = this.getModel().getGeometry(cell);

    if (geo != null) {
      const style = this.getCurrentCellStyle(cell);
      geo = <mxGeometry>geo.clone();

      // Stores values for restoring based on style
      const { x } = geo;
      const { y } = geo;
      const w = geo.width;
      const h = geo.height;

      geo.scale(dx, dy, style[mxConstants.STYLE_ASPECT] === 'fixed');

      if (style[mxConstants.STYLE_RESIZE_WIDTH] == '1') {
        geo.width = w * dx;
      } else if (style[mxConstants.STYLE_RESIZE_WIDTH] == '0') {
        geo.width = w;
      }

      if (style[mxConstants.STYLE_RESIZE_HEIGHT] == '1') {
        geo.height = h * dy;
      } else if (style[mxConstants.STYLE_RESIZE_HEIGHT] == '0') {
        geo.height = h;
      }

      if (!this.isCellMovable(cell)) {
        geo.x = x;
        geo.y = y;
      }

      if (!this.isCellResizable(cell)) {
        geo.width = w;
        geo.height = h;
      }

      if (this.getModel().isVertex(cell)) {
        this.cellResized(cell, geo, true, recurse);
      } else {
        this.getModel().setGeometry(cell, geo);
      }
    }
  }

  /**
   * Function: extendParent
   *
   * Resizes the parents recursively so that they contain the complete area
   * of the resized child cell.
   *
   * Parameters:
   *
   * cell - <mxCell> that has been resized.
   */
  extendParent(cell: mxCell | null=null): void {
    if (cell != null) {
      const parent = <mxCell>this.getModel().getParent(cell);
      let p = this.getCellGeometry(parent);

      if (parent != null && p != null && !this.isCellCollapsed(parent)) {
        const geo = this.getCellGeometry(cell);

        if (
          geo != null &&
          !geo.relative &&
          (p.width < geo.x + geo.width || p.height < geo.y + geo.height)
        ) {
          p = <mxGeometry>p.clone();

          p.width = Math.max(p.width, geo.x + geo.width);
          p.height = Math.max(p.height, geo.y + geo.height);

          this.cellsResized([parent], [p], false);
        }
      }
    }
  }

  /**
   * Group: Cell moving
   */

  /**
   * Function: importCells
   *
   * Clones and inserts the given cells into the graph using the move
   * method and returns the inserted cells. This shortcut is used if
   * cells are inserted via datatransfer.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be imported.
   * dx - Integer that specifies the x-coordinate of the vector. Default is 0.
   * dy - Integer that specifies the y-coordinate of the vector. Default is 0.
   * target - <mxCell> that represents the new parent of the cells.
   * evt - Mouseevent that triggered the invocation.
   * mapping - Optional mapping for existing clones.
   */
  importCells(cells: mxCell[] | null=null,
              dx: number,
              dy: number,
              target: mxCell | null=null,
              evt: mxMouseEvent,
              mapping: any): mxCell[] | null {
    return this.moveCells(cells, dx, dy, true, target, evt, mapping);
  }

  /**
   * Function: moveCells
   *
   * Moves or clones the specified cells and moves the cells or clones by the
   * given amount, adding them to the optional target cell. The evt is the
   * mouse event as the mouse was released. The change is carried out using
   * <cellsMoved>. This method fires <mxEvent.MOVE_CELLS> while the
   * transaction is in progress. Returns the cells that were moved.
   *
   * Use the following code to move all cells in the graph.
   *
   * (code)
   * graph.moveCells(graph.getChildCells(null, true, true), 10, 10);
   * (end)
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be moved, cloned or added to the target.
   * dx - Integer that specifies the x-coordinate of the vector. Default is 0.
   * dy - Integer that specifies the y-coordinate of the vector. Default is 0.
   * clone - Boolean indicating if the cells should be cloned. Default is false.
   * target - <mxCell> that represents the new parent of the cells.
   * evt - Mouseevent that triggered the invocation.
   * mapping - Optional mapping for existing clones.
   */
  moveCells(cells: mxCell[] | null=null,
            dx: number,
            dy: number,
            clone: boolean=false,
            target: mxCell | null=null,
            evt: mxMouseEvent | null=null,
            mapping: any=null): mxCell[] | null {

    dx = dx != null ? dx : 0;
    dy = dy != null ? dy : 0;
    clone = clone != null ? clone : false;

    // alert(`moveCells: ${cells} ${dx} ${dy} ${clone} ${target}`)

    if (cells != null && (dx !== 0 || dy !== 0 || clone || target != null)) {
      // Removes descendants with ancestors in cells to avoid multiple moving
      cells = this.getModel().getTopmostCells(cells);
      const origCells = cells;

      this.getModel().beginUpdate();
      try {
        // Faster cell lookups to remove relative edge labels with selected
        // terminals to avoid explicit and implicit move at same time
        const dict = new mxDictionary();

        for (let i = 0; i < cells.length; i += 1) {
          dict.put(cells[i], true);
        }

        const isSelected = (cell: mxCell | null) => {
          while (cell != null) {
            if (dict.get(cell)) {
              return true;
            }
            cell = <mxCell>this.getModel().getParent(cell);
          }
          return false;
        };

        // Removes relative edge labels with selected terminals
        const checked = [];

        for (let i = 0; i < cells.length; i += 1) {
          const geo = this.getCellGeometry(cells[i]);
          const parent = this.getModel().getParent(cells[i]);

          if (
            geo == null ||
            !geo.relative ||
            !this.getModel().isEdge(parent) ||
            (!isSelected(this.getModel().getTerminal(parent, true)) &&
              !isSelected(this.getModel().getTerminal(parent, false)))
          ) {
            checked.push(cells[i]);
          }
        }

        cells = checked;

        if (clone) {
          cells = <mxCell[]>this.cloneCells(cells, this.isCloneInvalidEdges(), mapping);

          if (target == null) {
            target = this.getDefaultParent();
          }
        }

        // FIXME: Cells should always be inserted first before any other edit
        // to avoid forward references in sessions.
        // Need to disable allowNegativeCoordinates if target not null to
        // allow for temporary negative numbers until cellsAdded is called.
        const previous = this.isAllowNegativeCoordinates();

        if (target != null) {
          this.setAllowNegativeCoordinates(true);
        }

        this.cellsMoved(
          cells,
          dx,
          dy,
          !clone && this.isDisconnectOnMove() && this.isAllowDanglingEdges(),
          target == null,
          this.isExtendParentsOnMove() && target == null
        );

        this.setAllowNegativeCoordinates(previous);

        if (target != null) {
          const index = this.getModel().getChildCount(target);
          this.cellsAdded(cells, target, index, null, null, true);

          // Restores parent edge on cloned edge labels
          if (clone) {
            for (let i = 0; i < cells.length; i += 1) {
              const geo = this.getCellGeometry(cells[i]);
              const parent = this.getModel().getParent(origCells[i]);

              if (
                geo != null &&
                geo.relative &&
                this.getModel().isEdge(parent) &&
                this.getModel().contains(parent)
              ) {
                this.getModel().add(parent, cells[i]);
              }
            }
          }
        }

        // Dispatches a move event
        this.fireEvent(
          new mxEventObject(
            mxEvent.MOVE_CELLS,
            'cells',
            cells,
            'dx',
            dx,
            'dy',
            dy,
            'clone',
            clone,
            'target',
            target,
            'event',
            evt
          )
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
    return cells;
  }

  /**
   * Function: cellsMoved
   *
   * Moves the specified cells by the given vector, disconnecting the cells
   * using disconnectGraph is disconnect is true. This method fires
   * <mxEvent.CELLS_MOVED> while the transaction is in progress.
   */
  cellsMoved(cells: mxCell[] | null,
             dx: number,
             dy: number,
             disconnect: boolean=false,
             constrain: boolean=false,
             extend: boolean=false): void {

    if (cells != null && (dx !== 0 || dy !== 0)) {
      this.getModel().beginUpdate();
      try {
        if (disconnect) {
          this.disconnectGraph(cells);
        }

        for (const cell of cells) {
          this.translateCell(cell, dx, dy);

          if (extend && this.isExtendParent(cell)) {
            this.extendParent(cell);
          } else if (constrain) {
            this.constrainChild(cell);
          }
        }

        if (this.resetEdgesOnMove) {
          this.resetEdges(cells);
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.CELLS_MOVED,
            'cells',
            cells,
            'dx',
            dx,
            'dy',
            dy,
            'disconnect',
            disconnect
          )
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: translateCell
   *
   * Translates the geometry of the given cell and stores the new,
   * translated geometry in the model as an atomic change.
   */
  translateCell(cell: mxCell,
                dx: number,
                dy: number): void {
    let geometry = this.getModel().getGeometry(cell);

    if (geometry != null) {
      dx = parseFloat(String(dx));
      dy = parseFloat(String(dy));
      geometry = <mxGeometry>geometry.clone();
      geometry.translate(dx, dy);

      if (
        !geometry.relative &&
        this.getModel().isVertex(cell) &&
        !this.isAllowNegativeCoordinates()
      ) {
        geometry.x = Math.max(0, geometry.x);
        geometry.y = Math.max(0, geometry.y);
      }

      if (geometry.relative && !this.getModel().isEdge(cell)) {
        const parent = <mxCell>this.getModel().getParent(cell);
        let angle = 0;

        if (this.getModel().isVertex(parent)) {
          const style = this.getCurrentCellStyle(parent);
          angle = mxUtils.getValue(style, mxConstants.STYLE_ROTATION, 0);
        }

        if (angle !== 0) {
          const rad = mxUtils.toRadians(-angle);
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const pt = mxUtils.getRotatedPoint(
            new mxPoint(dx, dy),
            cos,
            sin,
            new mxPoint(0, 0)
          );
          dx = pt.x;
          dy = pt.y;
        }

        if (geometry.offset == null) {
          geometry.offset = new mxPoint(dx, dy);
        } else {
          geometry.offset.x = parseFloat(geometry.offset.x) + dx;
          geometry.offset.y = parseFloat(geometry.offset.y) + dy;
        }
      }
      this.getModel().setGeometry(cell, geometry);
    }
  }

  /**
   * Function: getCellContainmentArea
   *
   * Returns the <mxRectangle> inside which a cell is to be kept.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the area should be returned.
   */
  getCellContainmentArea(cell: mxCell): mxRectangle | null {
    if (cell != null && !this.getModel().isEdge(cell)) {
      const parent = this.getModel().getParent(cell);

      if (parent != null && parent !== this.getDefaultParent()) {
        const g = this.getModel().getGeometry(parent);

        if (g != null) {
          let x = 0;
          let y = 0;
          let w = g.width;
          let h = g.height;

          if (this.isSwimlane(parent)) {
            const size = this.getStartSize(parent);
            const style = this.getCurrentCellStyle(parent);
            const dir = mxUtils.getValue(
              style,
              mxConstants.STYLE_DIRECTION,
              mxConstants.DIRECTION_EAST
            );
            const flipH =
              mxUtils.getValue(style, mxConstants.STYLE_FLIPH, 0) == 1;
            const flipV =
              mxUtils.getValue(style, mxConstants.STYLE_FLIPV, 0) == 1;

            if (
              dir === mxConstants.DIRECTION_SOUTH ||
              dir === mxConstants.DIRECTION_NORTH
            ) {
              const tmp = size.width;
              size.width = size.height;
              size.height = tmp;
            }

            if (
              (dir === mxConstants.DIRECTION_EAST && !flipV) ||
              (dir === mxConstants.DIRECTION_NORTH && !flipH) ||
              (dir === mxConstants.DIRECTION_WEST && flipV) ||
              (dir === mxConstants.DIRECTION_SOUTH && flipH)
            ) {
              x = size.width;
              y = size.height;
            }

            w -= size.width;
            h -= size.height;
          }

          return new mxRectangle(x, y, w, h);
        }
      }
    }
    return null;
  }

  /**
   * Function: getMaximumGraphBounds
   *
   * Returns the bounds inside which the diagram should be kept as an
   * <mxRectangle>.
   */
  getMaximumGraphBounds(): mxRectangle | null {
    return this.maximumGraphBounds;
  }

  /**
   * Function: constrainChild
   *
   * Keeps the given cell inside the bounds returned by
   * <getCellContainmentArea> for its parent, according to the rules defined by
   * <getOverlap> and <isConstrainChild>. This modifies the cell's geometry
   * in-place and does not clone it.
   *
   * Parameters:
   *
   * cells - <mxCell> which should be constrained.
   * sizeFirst - Specifies if the size should be changed first. Default is true.
   */
  constrainChild(cell: mxCell,
                 sizeFirst: boolean=true): void {

    if (cell != null) {
      let geo = this.getCellGeometry(cell);

      if (
        geo != null &&
        (this.isConstrainRelativeChildren() || !geo.relative)
      ) {
        const parent = this.getModel().getParent(cell);
        const pgeo = this.getCellGeometry(<mxCell>parent);
        let max = this.getMaximumGraphBounds();

        // Finds parent offset
        if (max != null) {
          const off = this.getBoundingBoxFromGeometry([<mxCell>parent], false);

          if (off != null) {
            max = mxRectangle.fromRectangle(max);

            max.x -= off.x;
            max.y -= off.y;
          }
        }

        if (this.isConstrainChild(cell)) {
          let tmp = this.getCellContainmentArea(cell);

          if (tmp != null) {
            const overlap = this.getOverlap(cell);

            if (overlap > 0) {
              tmp = mxRectangle.fromRectangle(tmp);

              tmp.x -= tmp.width * overlap;
              tmp.y -= tmp.height * overlap;
              tmp.width += 2 * tmp.width * overlap;
              tmp.height += 2 * tmp.height * overlap;
            }

            // Find the intersection between max and tmp
            if (max == null) {
              max = tmp;
            } else {
              max = mxRectangle.fromRectangle(max);
              max.intersect(tmp);
            }
          }
        }

        if (max != null) {
          const cells = [cell];

          if (!this.isCellCollapsed(cell)) {
            const desc = this.getModel().getDescendants(cell);

            for (let i = 0; i < desc.length; i += 1) {
              if (this.isCellVisible(desc[i])) {
                cells.push(desc[i]);
              }
            }
          }

          const bbox = this.getBoundingBoxFromGeometry(cells, false);

          if (bbox != null) {
            geo = <mxGeometry>geo.clone();

            // Cumulative horizontal movement
            let dx = 0;

            if (geo.width > max.width) {
              dx = geo.width - max.width;
              geo.width -= dx;
            }

            if (bbox.x + bbox.width > max.x + max.width) {
              dx -= bbox.x + bbox.width - max.x - max.width - dx;
            }

            // Cumulative vertical movement
            let dy = 0;

            if (geo.height > max.height) {
              dy = geo.height - max.height;
              geo.height -= dy;
            }

            if (bbox.y + bbox.height > max.y + max.height) {
              dy -= bbox.y + bbox.height - max.y - max.height - dy;
            }

            if (bbox.x < max.x) {
              dx -= bbox.x - max.x;
            }

            if (bbox.y < max.y) {
              dy -= bbox.y - max.y;
            }

            if (dx !== 0 || dy !== 0) {
              if (geo.relative) {
                // Relative geometries are moved via absolute offset
                if (geo.offset == null) {
                  geo.offset = new mxPoint();
                }

                geo.offset.x += dx;
                geo.offset.y += dy;
              } else {
                geo.x += dx;
                geo.y += dy;
              }
            }

            this.getModel().setGeometry(cell, geo);
          }
        }
      }
    }
  }

  /**
   * Function: resetEdges
   *
   * Resets the control points of the edges that are connected to the given
   * cells if not both ends of the edge are in the given cells array.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> for which the connected edges should be
   * reset.
   */
  resetEdges(cells: mxCell[]): void {
    if (cells != null) {
      // Prepares faster cells lookup
      const dict = new mxDictionary();

      for (let i = 0; i < cells.length; i += 1) {
        dict.put(cells[i], true);
      }

      this.getModel().beginUpdate();
      try {
        for (let i = 0; i < cells.length; i += 1) {
          const edges = this.getModel().getEdges(cells[i]);

          if (edges != null) {
            for (let j = 0; j < edges.length; j++) {
              const state = this.getView().getState(edges[j]);

              const source =
                state != null
                  ? state.getVisibleTerminal(true)
                  : this.getView().getVisibleTerminal(edges[j], true);
              const target =
                state != null
                  ? state.getVisibleTerminal(false)
                  : this.getView().getVisibleTerminal(edges[j], false);

              // Checks if one of the terminals is not in the given array
              if (!dict.get(source) || !dict.get(target)) {
                this.resetEdge(<mxCell>edges[j]);
              }
            }
          }

          this.resetEdges(<mxCell[]>this.getModel().getChildren(cells[i]));
        }
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: resetEdge
   *
   * Resets the control points of the given edge.
   *
   * Parameters:
   *
   * edge - <mxCell> whose points should be reset.
   */
  resetEdge(edge: mxCell): mxCell | null {
    let geo = this.getModel().getGeometry(edge);

    // Resets the control points
    if (geo != null && geo.points != null && geo.points.length > 0) {
      geo = <mxGeometry>geo.clone();
      geo.points = [];
      this.getModel().setGeometry(edge, geo);
    }
    return edge;
  }

  /**
   * Group: Cell connecting and connection constraints
   */

  /**
   * Function: getOutlineConstraint
   *
   * Returns the constraint used to connect to the outline of the given state.
   */
  getOutlineConstraint(point: mxPoint,
                       terminalState: mxCellState,
                       me: mxMouseEvent): mxConnectionConstraint | null {

    if (terminalState.shape != null) {
      const bounds = <mxRectangle>this.getView().getPerimeterBounds(terminalState);
      const direction = terminalState.style[mxConstants.STYLE_DIRECTION];

      if (
        direction === mxConstants.DIRECTION_NORTH ||
        direction === mxConstants.DIRECTION_SOUTH
      ) {
        bounds.x += bounds.width / 2 - bounds.height / 2;
        bounds.y += bounds.height / 2 - bounds.width / 2;
        const tmp = bounds.width;
        bounds.width = bounds.height;
        bounds.height = tmp;
      }

      const alpha = mxUtils.toRadians(terminalState.shape.getShapeRotation());

      if (alpha !== 0) {
        const cos = Math.cos(-alpha);
        const sin = Math.sin(-alpha);

        const ct = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
        point = mxUtils.getRotatedPoint(point, cos, sin, ct);
      }

      let sx = 1;
      let sy = 1;
      let dx = 0;
      let dy = 0;

      // LATER: Add flipping support for image shapes
      if (this.getModel().isVertex(<mxCell>terminalState.cell)) {
        let flipH = terminalState.style[mxConstants.STYLE_FLIPH];
        let flipV = terminalState.style[mxConstants.STYLE_FLIPV];

        // Legacy support for stencilFlipH/V
        if (
          terminalState.shape != null &&
          terminalState.shape.stencil != null
        ) {
          flipH =
            mxUtils.getValue(terminalState.style, 'stencilFlipH', 0) == 1 ||
            flipH;
          flipV =
            mxUtils.getValue(terminalState.style, 'stencilFlipV', 0) == 1 ||
            flipV;
        }

        if (
          direction === mxConstants.DIRECTION_NORTH ||
          direction === mxConstants.DIRECTION_SOUTH
        ) {
          const tmp = flipH;
          flipH = flipV;
          flipV = tmp;
        }

        if (flipH) {
          sx = -1;
          dx = -bounds.width;
        }

        if (flipV) {
          sy = -1;
          dy = -bounds.height;
        }
      }

      point = new mxPoint(
        (point.x - bounds.x) * sx - dx + bounds.x,
        (point.y - bounds.y) * sy - dy + bounds.y
      );

      const x =
        bounds.width === 0
          ? 0
          : Math.round(((point.x - bounds.x) * 1000) / bounds.width) / 1000;
      const y =
        bounds.height === 0
          ? 0
          : Math.round(((point.y - bounds.y) * 1000) / bounds.height) / 1000;

      return new mxConnectionConstraint(new mxPoint(x, y), false);
    }
    return null;
  }

  /**
   * Function: getAllConnectionConstraints
   *
   * Returns an array of all <mxConnectionConstraints> for the given terminal. If
   * the shape of the given terminal is a <mxStencilShape> then the constraints
   * of the corresponding <mxStencil> are returned.
   *
   * Parameters:
   *
   * terminal - <mxCellState> that represents the terminal.
   * source - Boolean that specifies if the terminal is the source or target.
   */
  getAllConnectionConstraints(terminal: mxCellState,
                              source: boolean): mxConnectionConstraint[] | null {
    if (
      terminal != null &&
      terminal.shape != null &&
      terminal.shape.stencil != null
    ) {
      return terminal.shape.stencil.constraints;
    }
    return null;
  }

  /**
   * Function: getConnectionConstraint
   *
   * Returns an <mxConnectionConstraint> that describes the given connection
   * point. This result can then be passed to <getConnectionPoint>.
   *
   * Parameters:
   *
   * edge - <mxCellState> that represents the edge.
   * terminal - <mxCellState> that represents the terminal.
   * source - Boolean indicating if the terminal is the source or target.
   */
  getConnectionConstraint(edge: mxCellState,
                          terminal: mxCellState | null=null,
                          source: boolean=false): mxConnectionConstraint {
    let point = null;
    // @ts-ignore
    const x = <string>edge.style[source ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X];

    if (x != null) {
      // @ts-ignore
      const y = <string>edge.style[source ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y];

      if (y != null) {
        point = new mxPoint(parseFloat(x), parseFloat(y));
      }
    }

    let perimeter = false;
    let dx = 0;
    let dy = 0;

    if (point != null) {
      perimeter = mxUtils.getValue(
        edge.style,
        source
          ? mxConstants.STYLE_EXIT_PERIMETER
          : mxConstants.STYLE_ENTRY_PERIMETER,
        true
      );

      // Add entry/exit offset
      // @ts-ignore
      dx = parseFloat(<string>edge.style[source ? mxConstants.STYLE_EXIT_DX : mxConstants.STYLE_ENTRY_DX]);
      // @ts-ignore
      dy = parseFloat(<string>edge.style[source ? mxConstants.STYLE_EXIT_DY : mxConstants.STYLE_ENTRY_DY]);

      dx = Number.isFinite(dx) ? dx : 0;
      dy = Number.isFinite(dy) ? dy : 0;
    }

    return new mxConnectionConstraint(point, perimeter, null, dx, dy);
  }

  /**
   * Function: setConnectionConstraint
   *
   * Sets the <mxConnectionConstraint> that describes the given connection point.
   * If no constraint is given then nothing is changed. To remove an existing
   * constraint from the given edge, use an empty constraint instead.
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge.
   * terminal - <mxCell> that represents the terminal.
   * source - Boolean indicating if the terminal is the source or target.
   * constraint - Optional <mxConnectionConstraint> to be used for this
   * connection.
   */
  setConnectionConstraint(edge: mxCell,
                          terminal: mxCell,
                          source: boolean=false,
                          constraint: mxConnectionConstraint | null=null) {

    if (constraint != null) {
      this.getModel().beginUpdate();

      try {
        if (constraint == null || constraint.point == null) {
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X,
            null,
            [edge]
          );
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y,
            null,
            [edge]
          );
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_DX : mxConstants.STYLE_ENTRY_DX,
            null,
            [edge]
          );
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_DY : mxConstants.STYLE_ENTRY_DY,
            null,
            [edge]
          );
          this.setCellStyles(
            source
              ? mxConstants.STYLE_EXIT_PERIMETER
              : mxConstants.STYLE_ENTRY_PERIMETER,
            null,
            [edge]
          );
        } else if (constraint.point != null) {
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X,
            constraint.point.x,
            [edge]
          );
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y,
            constraint.point.y,
            [edge]
          );
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_DX : mxConstants.STYLE_ENTRY_DX,
            constraint.dx,
            [edge]
          );
          this.setCellStyles(
            source ? mxConstants.STYLE_EXIT_DY : mxConstants.STYLE_ENTRY_DY,
            constraint.dy,
            [edge]
          );

          // Only writes 0 since 1 is default
          if (!constraint.perimeter) {
            this.setCellStyles(
              source
                ? mxConstants.STYLE_EXIT_PERIMETER
                : mxConstants.STYLE_ENTRY_PERIMETER,
              '0',
              [edge]
            );
          } else {
            this.setCellStyles(
              source
                ? mxConstants.STYLE_EXIT_PERIMETER
                : mxConstants.STYLE_ENTRY_PERIMETER,
              null,
              [edge]
            );
          }
        }
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: getConnectionPoint
   *
   * Returns the nearest point in the list of absolute points or the center
   * of the opposite terminal.
   *
   * Parameters:
   *
   * vertex - <mxCellState> that represents the vertex.
   * constraint - <mxConnectionConstraint> that represents the connection point
   * constraint as returned by <getConnectionConstraint>.
   */
  getConnectionPoint(vertex: mxCellState,
                     constraint: mxConnectionConstraint,
                     round: boolean=true): mxPoint {

    let point = null;

    if (vertex != null && constraint.point != null) {
      const bounds = <mxRectangle>this.getView().getPerimeterBounds(vertex);
      const cx = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
      const direction = vertex.style[mxConstants.STYLE_DIRECTION];
      let r1 = 0;

      // Bounds need to be rotated by 90 degrees for further computation
      if (
        direction != null &&
        mxUtils.getValue(
          vertex.style,
          mxConstants.STYLE_ANCHOR_POINT_DIRECTION,
          1
        ) == 1
      ) {
        if (direction === mxConstants.DIRECTION_NORTH) {
          r1 += 270;
        } else if (direction === mxConstants.DIRECTION_WEST) {
          r1 += 180;
        } else if (direction === mxConstants.DIRECTION_SOUTH) {
          r1 += 90;
        }

        // Bounds need to be rotated by 90 degrees for further computation
        if (
          direction === mxConstants.DIRECTION_NORTH ||
          direction === mxConstants.DIRECTION_SOUTH
        ) {
          bounds.rotate90();
        }
      }

      const { scale } = this.view;
      point = new mxPoint(
        bounds.x + constraint.point.x * bounds.width + <number>constraint.dx * scale,
        bounds.y + constraint.point.y * bounds.height + <number>constraint.dy * scale
      );

      // Rotation for direction before projection on perimeter
      let r2 = vertex.style[mxConstants.STYLE_ROTATION] || 0;

      if (constraint.perimeter) {
        if (r1 !== 0) {
          // Only 90 degrees steps possible here so no trig needed
          let cos = 0;
          let sin = 0;

          if (r1 === 90) {
            sin = 1;
          } else if (r1 === 180) {
            cos = -1;
          } else if (r1 === 270) {
            sin = -1;
          }

          point = mxUtils.getRotatedPoint(point, cos, sin, cx);
        }

        point = this.getView().getPerimeterPoint(vertex, point, false);
      } else {
        r2 += r1;

        if (this.getModel().isVertex(<mxCell>vertex.cell)) {
          let flipH = vertex.style[mxConstants.STYLE_FLIPH] == 1;
          let flipV = vertex.style[mxConstants.STYLE_FLIPV] == 1;

          // Legacy support for stencilFlipH/V
          if (vertex.shape != null && vertex.shape.stencil != null) {
            flipH =
              mxUtils.getValue(vertex.style, 'stencilFlipH', 0) == 1 || flipH;
            flipV =
              mxUtils.getValue(vertex.style, 'stencilFlipV', 0) == 1 || flipV;
          }

          if (
            direction === mxConstants.DIRECTION_NORTH ||
            direction === mxConstants.DIRECTION_SOUTH
          ) {
            const temp = flipH;
            flipH = flipV;
            flipV = temp;
          }

          if (flipH) {
            point.x = 2 * bounds.getCenterX() - point.x;
          }

          if (flipV) {
            point.y = 2 * bounds.getCenterY() - point.y;
          }
        }
      }

      // Generic rotation after projection on perimeter
      if (r2 !== 0 && point != null) {
        const rad = mxUtils.toRadians(r2);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        point = mxUtils.getRotatedPoint(point, cos, sin, cx);
      }
    }

    if (round && point != null) {
      point.x = Math.round(point.x);
      point.y = Math.round(point.y);
    }
    return point;
  }

  /**
   * Function: connectCell
   *
   * Connects the specified end of the given edge to the given terminal
   * using <cellConnected> and fires <mxEvent.CONNECT_CELL> while the
   * transaction is in progress. Returns the updated edge.
   *
   * Parameters:
   *
   * edge - <mxCell> whose terminal should be updated.
   * terminal - <mxCell> that represents the new terminal to be used.
   * source - Boolean indicating if the new terminal is the source or target.
   * constraint - Optional <mxConnectionConstraint> to be used for this
   * connection.
   */
  connectCell(edge: mxCell,
              terminal: mxCell,
              source: boolean=false,
              constraint: mxConnectionConstraint | null=null): mxCell {

    this.getModel().beginUpdate();
    try {
      const previous = this.getModel().getTerminal(edge, source);
      this.cellConnected(edge, terminal, source, constraint);
      this.fireEvent(
        new mxEventObject(
          mxEvent.CONNECT_CELL,
          'edge',
          edge,
          'terminal',
          terminal,
          'source',
          source,
          'previous',
          previous
        )
      );
    } finally {
      this.getModel().endUpdate();
    }
    return edge;
  }

  /**
   * Function: cellConnected
   *
   * Sets the new terminal for the given edge and resets the edge points if
   * <resetEdgesOnConnect> is true. This method fires
   * <mxEvent.CELL_CONNECTED> while the transaction is in progress.
   *
   * Parameters:
   *
   * edge - <mxCell> whose terminal should be updated.
   * terminal - <mxCell> that represents the new terminal to be used.
   * source - Boolean indicating if the new terminal is the source or target.
   * constraint - <mxConnectionConstraint> to be used for this connection.
   */
  cellConnected(
    edge: mxCell,
    terminal: mxCell,
    source: boolean=false,
    constraint: mxConnectionConstraint | null=null
  ): void {
    if (edge != null) {
      this.getModel().beginUpdate();
      try {
        const previous = this.getModel().getTerminal(edge, source);

        // Updates the constraint
        this.setConnectionConstraint(edge, terminal, source, constraint);

        // Checks if the new terminal is a port, uses the ID of the port in the
        // style and the parent of the port as the actual terminal of the edge.
        if (this.isPortsEnabled()) {
          let id = null;

          if (this.isPort(terminal)) {
            id = terminal.getId();
            terminal = <mxCell>this.getTerminalForPort(terminal, source);
          }

          // Sets or resets all previous information for connecting to a child port
          const key = source
            ? mxConstants.STYLE_SOURCE_PORT
            : mxConstants.STYLE_TARGET_PORT;
          this.setCellStyles(key, id, [edge]);
        }

        this.getModel().setTerminal(edge, terminal, source);

        if (this.resetEdgesOnConnect) {
          this.resetEdge(edge);
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.CELL_CONNECTED,
            'edge',
            edge,
            'terminal',
            terminal,
            'source',
            source,
            'previous',
            previous
          )
        );
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Function: disconnectGraph
   *
   * Disconnects the given edges from the terminals which are not in the
   * given array.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be disconnected.
   */
  disconnectGraph(cells: mxCell[] | null) {
    if (cells != null) {
      this.getModel().beginUpdate();
      try {
        const { scale } = this.view;
        const tr = this.getView().translate;

        // Fast lookup for finding cells in array
        const dict = new mxDictionary();

        for (let i = 0; i < cells.length; i += 1) {
          dict.put(cells[i], true);
        }

        for (const cell of cells) {
          if (this.getModel().isEdge(cell)) {
            let geo = <mxGeometry>this.getModel().getGeometry(cell);

            if (geo != null) {
              const state = this.getView().getState(cell);
              const pstate = <mxCellState>this.getView().getState(this.getModel().getParent(cell));

              if (state != null && pstate != null) {
                geo = geo.clone();

                // @ts-ignore
                const dx = -pstate.origin.x;
                // @ts-ignore
                const dy = -pstate.origin.y;
                const pts = <mxPoint[]>state.absolutePoints;

                let src = this.getModel().getTerminal(cell, true);

                if (
                  src != null &&
                  this.isCellDisconnectable(cell, src, true)
                ) {
                  while (src != null && !dict.get(src)) {
                    src = this.getModel().getParent(src);
                  }

                  if (src == null) {
                    geo.setTerminalPoint(
                      new mxPoint(
                        pts[0].x / scale - tr.x + dx,
                        pts[0].y / scale - tr.y + dy
                      ),
                      true
                    );
                    this.getModel().setTerminal(cell, null, true);
                  }
                }

                let trg = this.getModel().getTerminal(cell, false);

                if (
                  trg != null &&
                  this.isCellDisconnectable(cell, trg, false)
                ) {
                  while (trg != null && !dict.get(trg)) {
                    trg = this.getModel().getParent(trg);
                  }

                  if (trg == null) {
                    const n = pts.length - 1;
                    geo.setTerminalPoint(
                      new mxPoint(
                        (<number>(<mxPoint>pts[n]).x) / scale - tr.x + dx,
                        (<number>(<mxPoint>pts[n]).y) / scale - tr.y + dy
                      ),
                      false
                    );
                    this.getModel().setTerminal(cell, null, false);
                  }
                }

                this.getModel().setGeometry(cell, geo);
              }
            }
          }
        }
      } finally {
        this.getModel().endUpdate();
      }
    }
  }

  /**
   * Group: Drilldown
   */

  /**
   * Function: getCurrentRoot
   *
   * Returns the current root of the displayed cell hierarchy. This is a
   * shortcut to <mxGraphView.currentRoot> in <view>.
   */
  getCurrentRoot(): mxCell | null {
    return this.getView().currentRoot;
  }

  /**
   * Function: getTranslateForRoot
   *
   * Returns the translation to be used if the given cell is the root cell as
   * an <mxPoint>. This implementation returns null.
   *
   * Example:
   *
   * To keep the children at their absolute position while stepping into groups,
   * this function can be overridden as follows.
   *
   * (code)
   * let offset = new mxPoint(0, 0);
   *
   * while (cell != null)
   * {
   *   let geo = this.getModel().getGeometry(cell);
   *
   *   if (geo != null)
   *   {
   *     offset.x -= geo.x;
   *     offset.y -= geo.y;
   *   }
   *
   *   cell = this.getModel().getParent(cell);
   * }
   *
   * return offset;
   * (end)
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the root.
   */
  getTranslateForRoot(cell: mxCell): any {
    return null;
  }

  /**
   * Function: isPort
   *
   * Returns true if the given cell is a "port", that is, when connecting to
   * it, the cell returned by getTerminalForPort should be used as the
   * terminal and the port should be referenced by the ID in either the
   * mxConstants.STYLE_SOURCE_PORT or the or the
   * mxConstants.STYLE_TARGET_PORT. Note that a port should not be movable.
   * This implementation always returns false.
   *
   * A typical implementation is the following:
   *
   * (code)
   * graph.isPort = (cell)=>
   * {
   *   let geo = this.getCellGeometry(cell);
   *
   *   return (geo != null) ? geo.relative : false;
   * };
   * (end)
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the port.
   */
  isPort(cell: mxCell) {
    return false;
  }

  /**
   * Function: getTerminalForPort
   *
   * Returns the terminal to be used for a given port. This implementation
   * always returns the parent cell.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the port.
   * source - If the cell is the source or target port.
   */
  getTerminalForPort(cell: mxCell,
                     source: boolean=false): mxCell | null {
    return this.getModel().getParent(cell);
  }

  /**
   * Function: getChildOffsetForCell
   *
   * Returns the offset to be used for the cells inside the given cell. The
   * root and layer cells may be identified using <mxGraphModel.isRoot> and
   * <mxGraphModel.isLayer>. For all other current roots, the
   * <mxGraphView.currentRoot> field points to the respective cell, so that
   * the following holds: cell == this.getView().currentRoot. This implementation
   * returns null.
   *
   * Parameters:
   *
   * cell - <mxCell> whose offset should be returned.
   */
  getChildOffsetForCell(cell: mxCell): mxPoint | null {
    return null;
  }

  /**
   * Function: enterGroup
   *
   * Uses the given cell as the root of the displayed cell hierarchy. If no
   * cell is specified then the selection cell is used. The cell is only used
   * if <isValidRoot> returns true.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> to be used as the new root. Default is the
   * selection cell.
   */
  enterGroup(cell: mxCell): void {
    cell = cell || this.getSelectionCell();

    if (cell != null && this.isValidRoot(cell)) {
      this.getView().setCurrentRoot(cell);
      this.clearSelection();
    }
  }

  /**
   * Function: exitGroup
   *
   * Changes the current root to the next valid root in the displayed cell
   * hierarchy.
   */
  exitGroup(): void {
    const root = this.getModel().getRoot();
    const current = this.getCurrentRoot();

    if (current != null) {
      let next = <mxCell>this.getModel().getParent(current);

      // Finds the next valid root in the hierarchy
      while (
        next !== root &&
        !this.isValidRoot(next) &&
        this.getModel().getParent(next) !== root
      ) {
        next = <mxCell>this.getModel().getParent(next);
      }

      // Clears the current root if the new root is
      // the model's root or one of the layers.
      if (next === root || this.getModel().getParent(next) === root) {
        this.getView().setCurrentRoot(null);
      } else {
        this.getView().setCurrentRoot(next);
      }

      const state = this.getView().getState(current);

      // Selects the previous root in the graph
      if (state != null) {
        this.setSelectionCell(current);
      }
    }
  }

  /**
   * Function: home
   *
   * Uses the root of the model as the root of the displayed cell hierarchy
   * and selects the previous root.
   */
  home() {
    const current = this.getCurrentRoot();

    if (current != null) {
      this.getView().setCurrentRoot(null);
      const state = this.getView().getState(current);

      if (state != null) {
        this.setSelectionCell(current);
      }
    }
  }

  /**
   * Function: isValidRoot
   *
   * Returns true if the given cell is a valid root for the cell display
   * hierarchy. This implementation returns true for all non-null values.
   *
   * Parameters:
   *
   * cell - <mxCell> which should be checked as a possible root.
   */
  isValidRoot(cell: mxCell) {
    return cell != null;
  }

  /**
   * Group: Graph display
   */

  /**
   * Function: getGraphBounds
   *
   * Returns the bounds of the visible graph. Shortcut to
   * <mxGraphView.getGraphBounds>. See also: <getBoundingBoxFromGeometry>.
   */
  getGraphBounds(): mxRectangle {
    return this.getView().getGraphBounds();
  }

  /**
   * Function: getCellBounds
   *
   * Returns the scaled, translated bounds for the given cell. See
   * <mxGraphView.getBounds> for arrays.
   *
   * Parameters:
   *
   * cell - <mxCell> whose bounds should be returned.
   * includeEdge - Optional boolean that specifies if the bounds of
   * the connected edges should be included. Default is false.
   * includeDescendants - Optional boolean that specifies if the bounds
   * of all descendants should be included. Default is false.
   */
  getCellBounds(cell: mxCell,
                includeEdges: boolean=false,
                includeDescendants: boolean=false): mxRectangle | null {

    let cells = [cell];

    // Includes all connected edges
    if (includeEdges) {
      cells = cells.concat(<mxCell[]>this.getModel().getEdges(cell));
    }

    let result = this.getView().getBounds(cells);

    // Recursively includes the bounds of the children
    if (includeDescendants) {
      const childCount = this.getModel().getChildCount(cell);

      for (let i = 0; i < childCount; i += 1) {
        const tmp = this.getCellBounds(
          <mxCell>this.getModel().getChildAt(cell, i),
          includeEdges,
          true
        );

        if (result != null) {
          result.add(tmp);
        } else {
          result = tmp;
        }
      }
    }
    return result;
  }

  /**
   * Function: getBoundingBoxFromGeometry
   *
   * Returns the bounding box for the geometries of the vertices in the
   * given array of cells. This can be used to find the graph bounds during
   * a layout operation (ie. before the last endUpdate) as follows:
   *
   * (code)
   * let cells = graph.getChildCells(graph.getDefaultParent(), true, true);
   * let bounds = graph.getBoundingBoxFromGeometry(cells, true);
   * (end)
   *
   * This can then be used to move cells to the origin:
   *
   * (code)
   * if (bounds.x < 0 || bounds.y < 0)
   * {
   *   graph.moveCells(cells, -Math.min(bounds.x, 0), -Math.min(bounds.y, 0))
   * }
   * (end)
   *
   * Or to translate the graph view:
   *
   * (code)
   * if (bounds.x < 0 || bounds.y < 0)
   * {
   *   graph.view.setTranslate(-Math.min(bounds.x, 0), -Math.min(bounds.y, 0));
   * }
   * (end)
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose bounds should be returned.
   * includeEdges - Specifies if edge bounds should be included by computing
   * the bounding box for all points in geometry. Default is false.
   */
  getBoundingBoxFromGeometry(cells: mxCell[],
                             includeEdges: boolean=false): mxRectangle | null {

    includeEdges = includeEdges != null ? includeEdges : false;
    let result = null;
    let tmp: mxRectangle | null = null;

    if (cells != null) {
      for (const cell of cells) {
        if (includeEdges || this.getModel().isVertex(cell)) {
          // Computes the bounding box for the points in the geometry
          const geo = this.getCellGeometry(cell);

          if (geo != null) {
            let bbox = null;

            if (this.getModel().isEdge(cell)) {
              const addPoint = (pt: mxPoint | null) => {
                if (pt != null) {
                  if (tmp == null) {
                    tmp = new mxRectangle(pt.x, pt.y, 0, 0);
                  } else {
                    tmp.add(new mxRectangle(pt.x, pt.y, 0, 0));
                  }
                }
              };

              if (this.getModel().getTerminal(cell, true) == null) {
                addPoint(geo.getTerminalPoint(true));
              }

              if (this.getModel().getTerminal(cell, false) == null) {
                addPoint(geo.getTerminalPoint(false));
              }

              const pts = geo.points;

              if (pts != null && pts.length > 0) {
                tmp = new mxRectangle(pts[0].x, pts[0].y, 0, 0);

                for (let j = 1; j < pts.length; j++) {
                  addPoint(pts[j]);
                }
              }

              bbox = tmp;
            } else {
              const parent = <mxCell>this.getModel().getParent(cell);

              if (geo.relative) {
                if (
                  this.getModel().isVertex(parent) &&
                  parent !== this.getView().currentRoot
                ) {
                  tmp = this.getBoundingBoxFromGeometry([parent], false);

                  if (tmp != null) {
                    bbox = new mxRectangle(
                      geo.x * tmp.width,
                      geo.y * tmp.height,
                      geo.width,
                      geo.height
                    );

                    if (mxUtils.indexOf(cells, parent) >= 0) {
                      bbox.x += tmp.x;
                      bbox.y += tmp.y;
                    }
                  }
                }
              } else {
                bbox = mxRectangle.fromRectangle(geo);

                if (
                  this.getModel().isVertex(parent) &&
                  mxUtils.indexOf(cells, parent) >= 0
                ) {
                  tmp = this.getBoundingBoxFromGeometry([parent], false);

                  if (tmp != null) {
                    bbox.x += tmp.x;
                    bbox.y += tmp.y;
                  }
                }
              }

              if (bbox != null && geo.offset != null) {
                bbox.x += geo.offset.x;
                bbox.y += geo.offset.y;
              }

              const style = this.getCurrentCellStyle(cell);

              if (bbox != null) {
                const angle = mxUtils.getValue(
                  style,
                  mxConstants.STYLE_ROTATION,
                  0
                );

                if (angle !== 0) {
                  bbox = mxUtils.getBoundingBox(bbox, angle);
                }
              }
            }

            if (bbox != null) {
              if (result == null) {
                result = mxRectangle.fromRectangle(bbox);
              } else {
                result.add(bbox);
              }
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Function: refresh
   *
   * Clears all cell states or the states for the hierarchy starting at the
   * given cell and validates the graph. This fires a refresh event as the
   * last step.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> for which the cell states should be cleared.
   */
  refresh(cell: mxCell | null=null): void {
    this.getView().clear(cell, cell == null);
    this.getView().validate();
    this.sizeDidChange();
    this.fireEvent(new mxEventObject(mxEvent.REFRESH));
  }

  /**
   * Function: snap
   *
   * Snaps the given numeric value to the grid if <gridEnabled> is true.
   *
   * Parameters:
   *
   * value - Numeric value to be snapped to the grid.
   */
  snap(value: number): number {
    if (this.gridEnabled) {
      value = Math.round(value / this.gridSize) * this.gridSize;
    }
    return value;
  }

  /**
   * Function: snapDelta
   *
   * Snaps the given delta with the given scaled bounds.
   */
  snapDelta(delta: mxPoint,
            bounds: mxRectangle,
            ignoreGrid: boolean=false,
            ignoreHorizontal: boolean=false,
            ignoreVertical: boolean=false): mxPoint {

    const t = this.getView().translate;
    const s = this.getView().scale;

    if (!ignoreGrid && this.gridEnabled) {
      const tol = this.gridSize * s * 0.5;

      if (!ignoreHorizontal) {
        const tx = bounds.x - (this.snap(bounds.x / s - t.x) + t.x) * s;

        if (Math.abs(delta.x - tx) < tol) {
          delta.x = 0;
        } else {
          delta.x = this.snap(delta.x / s) * s - tx;
        }
      }

      if (!ignoreVertical) {
        const ty = bounds.y - (this.snap(bounds.y / s - t.y) + t.y) * s;

        if (Math.abs(delta.y - ty) < tol) {
          delta.y = 0;
        } else {
          delta.y = this.snap(delta.y / s) * s - ty;
        }
      }
    } else {
      const tol = 0.5 * s;

      if (!ignoreHorizontal) {
        const tx = bounds.x - (Math.round(bounds.x / s - t.x) + t.x) * s;

        if (Math.abs(delta.x - tx) < tol) {
          delta.x = 0;
        } else {
          delta.x = Math.round(delta.x / s) * s - tx;
        }
      }

      if (!ignoreVertical) {
        const ty = bounds.y - (Math.round(bounds.y / s - t.y) + t.y) * s;

        if (Math.abs(delta.y - ty) < tol) {
          delta.y = 0;
        } else {
          delta.y = Math.round(delta.y / s) * s - ty;
        }
      }
    }
    return delta;
  }

  /**
   * Function: panGraph
   *
   * Shifts the graph display by the given amount. This is used to preview
   * panning operations, use <mxGraphView.setTranslate> to set a persistent
   * translation of the view. Fires <mxEvent.PAN>.
   *
   * Parameters:
   *
   * dx - Amount to shift the graph along the x-axis.
   * dy - Amount to shift the graph along the y-axis.
   */
  panGraph(dx: number,
           dy: number): void {

    const container = <HTMLElement>this.container;

    if (this.useScrollbarsForPanning && mxUtils.hasScrollbars(container)) {
      container.scrollLeft = -dx;
      container.scrollTop = -dy;
    } else {
      const canvas = <SVGElement>this.getView().getCanvas();

      // Puts everything inside the container in a DIV so that it
      // can be moved without changing the state of the container
      if (dx === 0 && dy === 0) {
        canvas.removeAttribute('transform');

        if (this.shiftPreview1 != null) {
          let child = this.shiftPreview1.firstChild;

          while (child != null) {
            const next = child.nextSibling;
            container.appendChild(child);
            child = next;
          }

          if (this.shiftPreview1.parentNode != null) {
            this.shiftPreview1.parentNode.removeChild(this.shiftPreview1);
          }

          this.shiftPreview1 = null;

          container.appendChild(<Node>canvas.parentNode);
          const shiftPreview2 = <HTMLElement>this.shiftPreview2;
          child = shiftPreview2.firstChild;

          while (child != null) {
            const next = child.nextSibling;
            container.appendChild(child);
            child = next;
          }

          if (shiftPreview2.parentNode != null) {
            (shiftPreview2.parentNode).removeChild(shiftPreview2);
          }
          this.shiftPreview2 = null;
        }
      } else {
        canvas.setAttribute('transform', `translate(${dx},${dy})`);

        if (this.shiftPreview1 == null) {
          // Needs two divs for stuff before and after the SVG element
          this.shiftPreview1 = document.createElement('div');
          this.shiftPreview1.style.position = 'absolute';
          this.shiftPreview1.style.overflow = 'visible';

          this.shiftPreview2 = document.createElement('div');
          this.shiftPreview2.style.position = 'absolute';
          this.shiftPreview2.style.overflow = 'visible';

          let current = this.shiftPreview1;
          let child = container.firstChild;

          while (child != null) {
            const next = child.nextSibling;

            // SVG element is moved via transform attribute
            // @ts-ignore
            if (child !== canvas.parentNode) {
              current.appendChild(child);
            } else {
              current = this.shiftPreview2;
            }

            child = next;
          }

          // Inserts elements only if not empty
          if (this.shiftPreview1.firstChild != null) {
            container.insertBefore(
              this.shiftPreview1,
              canvas.parentNode
            );
          }

          if (this.shiftPreview2.firstChild != null) {
            container.appendChild(this.shiftPreview2);
          }
        }

        this.shiftPreview1.style.left = `${dx}px`;
        this.shiftPreview1.style.top = `${dy}px`;

        if (this.shiftPreview2) {
          this.shiftPreview2.style.left = `${dx}px`;
          this.shiftPreview2.style.top = `${dy}px`;
        }
      }

      this.panDx = dx;
      this.panDy = dy;

      this.fireEvent(new mxEventObject(mxEvent.PAN));
    }
  }

  /**
   * Function: zoomIn
   *
   * Zooms into the graph by <zoomFactor>.
   */
  zoomIn(): void {
    this.zoom(this.zoomFactor);
  }

  /**
   * Function: zoomOut
   *
   * Zooms out of the graph by <zoomFactor>.
   */
  zoomOut(): void {
    this.zoom(1 / this.zoomFactor);
  }

  /**
   * Function: zoomActual
   *
   * Resets the zoom and panning in the view.
   */
  zoomActual(): void {
    if (this.getView().scale === 1) {
      this.getView().setTranslate(0, 0);
    } else {
      this.getView().translate.x = 0;
      this.getView().translate.y = 0;

      this.getView().setScale(1);
    }
  }

  /**
   * Function: zoomTo
   *
   * Zooms the graph to the given scale with an optional boolean center
   * argument, which is passd to <zoom>.
   */
  zoomTo(scale: number,
         center: boolean=false): void {
    this.zoom(scale / this.getView().scale, center);
  }

  /**
   * Function: center
   *
   * Centers the graph in the container.
   *
   * Parameters:
   *
   * horizontal - Optional boolean that specifies if the graph should be centered
   * horizontally. Default is true.
   * vertical - Optional boolean that specifies if the graph should be centered
   * vertically. Default is true.
   * cx - Optional float that specifies the horizontal center. Default is 0.5.
   * cy - Optional float that specifies the vertical center. Default is 0.5.
   */
  center(horizontal: boolean=true,
         vertical: boolean=true,
         cx: number=0.5,
         cy: number=0.5): void {

    horizontal = horizontal != null ? horizontal : true;
    vertical = vertical != null ? vertical : true;
    cx = cx != null ? cx : 0.5;
    cy = cy != null ? cy : 0.5;

    const container = <HTMLElement>this.container;
    const hasScrollbars = mxUtils.hasScrollbars(this.container);
    const padding = 2 * this.getBorder();
    const cw = container.clientWidth - padding;
    const ch = container.clientHeight - padding;
    const bounds = this.getGraphBounds();

    const t = this.getView().translate;
    const s = this.getView().scale;

    let dx = horizontal ? cw - bounds.width : 0;
    let dy = vertical ? ch - bounds.height : 0;

    if (!hasScrollbars) {
      this.getView().setTranslate(
        horizontal ? Math.floor(t.x - bounds.x / s + (dx * cx) / s) : t.x,
        vertical ? Math.floor(t.y - bounds.y / s + (dy * cy) / s) : t.y
      );
    } else {
      bounds.x -= t.x;
      bounds.y -= t.y;

      const sw = container.scrollWidth;
      const sh = container.scrollHeight;

      if (sw > cw) {
        dx = 0;
      }

      if (sh > ch) {
        dy = 0;
      }

      this.getView().setTranslate(
        Math.floor(dx / 2 - bounds.x),
        Math.floor(dy / 2 - bounds.y)
      );
      container.scrollLeft = (sw - cw) / 2;
      container.scrollTop = (sh - ch) / 2;
    }
  }

  /**
   * Function: zoom
   *
   * Zooms the graph using the given factor. Center is an optional boolean
   * argument that keeps the graph scrolled to the center. If the center argument
   * is omitted, then <centerZoom> will be used as its value.
   */
  zoom(factor: number,
       center: boolean=this.centerZoom): void {

    const scale = Math.round(this.getView().scale * factor * 100) / 100;
    const state = this.getView().getState(this.getSelectionCell());
    const container = <HTMLElement>this.container;
    factor = scale / this.getView().scale;

    if (this.keepSelectionVisibleOnZoom && state != null) {
      const rect = new mxRectangle(
        state.x * factor,
        state.y * factor,
        state.width * factor,
        state.height * factor
      );

      // Refreshes the display only once if a scroll is carried out
      this.getView().scale = scale;

      if (!this.scrollRectToVisible(rect)) {
        this.getView().revalidate();

        // Forces an event to be fired but does not revalidate again
        this.getView().setScale(scale);
      }
    } else {
      const hasScrollbars = mxUtils.hasScrollbars(this.container);

      if (center && !hasScrollbars) {
        let dx = container.offsetWidth;
        let dy = container.offsetHeight;

        if (factor > 1) {
          const f = (factor - 1) / (scale * 2);
          dx *= -f;
          dy *= -f;
        } else {
          const f = (1 / factor - 1) / (this.getView().scale * 2);
          dx *= f;
          dy *= f;
        }

        this.getView().scaleAndTranslate(
          scale,
          this.getView().translate.x + dx,
          this.getView().translate.y + dy
        );
      } else {
        // Allows for changes of translate and scrollbars during setscale
        const tx = this.getView().translate.x;
        const ty = this.getView().translate.y;
        const sl = container.scrollLeft;
        const st = container.scrollTop;

        this.getView().setScale(scale);

        if (hasScrollbars) {
          let dx = 0;
          let dy = 0;

          if (center) {
            dx = (container.offsetWidth * (factor - 1)) / 2;
            dy = (container.offsetHeight * (factor - 1)) / 2;
          }

          container.scrollLeft =
            (this.getView().translate.x - tx) * this.getView().scale +
            Math.round(sl * factor + dx);
          container.scrollTop =
            (this.getView().translate.y - ty) * this.getView().scale +
            Math.round(st * factor + dy);
        }
      }
    }
  }

  /**
   * Function: zoomToRect
   *
   * Zooms the graph to the specified rectangle. If the rectangle does not have same aspect
   * ratio as the display container, it is increased in the smaller relative dimension only
   * until the aspect match. The original rectangle is centralised within this expanded one.
   *
   * Note that the input rectangular must be un-scaled and un-translated.
   *
   * Parameters:
   *
   * rect - The un-scaled and un-translated rectangluar region that should be just visible
   * after the operation
   */
  zoomToRect(rect: mxRectangle): void {
    const container = <HTMLElement>this.container;
    const scaleX = container.clientWidth / rect.width;
    const scaleY = container.clientHeight / rect.height;
    const aspectFactor = scaleX / scaleY;

    // Remove any overlap of the rect outside the client area
    rect.x = Math.max(0, rect.x);
    rect.y = Math.max(0, rect.y);
    let rectRight = Math.min(container.scrollWidth, rect.x + rect.width);
    let rectBottom = Math.min(
        container.scrollHeight,
      rect.y + rect.height
    );
    rect.width = rectRight - rect.x;
    rect.height = rectBottom - rect.y;

    // The selection area has to be increased to the same aspect
    // ratio as the container, centred around the centre point of the
    // original rect passed in.
    if (aspectFactor < 1.0) {
      // Height needs increasing
      const newHeight = rect.height / aspectFactor;
      const deltaHeightBuffer = (newHeight - rect.height) / 2.0;
      rect.height = newHeight;

      // Assign up to half the buffer to the upper part of the rect, not crossing 0
      // put the rest on the bottom
      const upperBuffer = Math.min(rect.y, deltaHeightBuffer);
      rect.y -= upperBuffer;

      // Check if the bottom has extended too far
      rectBottom = Math.min(container.scrollHeight, rect.y + rect.height);
      rect.height = rectBottom - rect.y;
    } else {
      // Width needs increasing
      const newWidth = rect.width * aspectFactor;
      const deltaWidthBuffer = (newWidth - rect.width) / 2.0;
      rect.width = newWidth;

      // Assign up to half the buffer to the upper part of the rect, not crossing 0
      // put the rest on the bottom
      const leftBuffer = Math.min(rect.x, deltaWidthBuffer);
      rect.x -= leftBuffer;

      // Check if the right hand side has extended too far
      rectRight = Math.min(container.scrollWidth, rect.x + rect.width);
      rect.width = rectRight - rect.x;
    }

    const scale = container.clientWidth / rect.width;
    const newScale = this.getView().scale * scale;

    if (!mxUtils.hasScrollbars(this.container)) {
      this.getView().scaleAndTranslate(
        newScale,
        this.getView().translate.x - rect.x / this.getView().scale,
        this.getView().translate.y - rect.y / this.getView().scale
      );
    } else {
      this.getView().setScale(newScale);
      container.scrollLeft = Math.round(rect.x * scale);
      container.scrollTop = Math.round(rect.y * scale);
    }
  }

  /**
   * Function: scrollCellToVisible
   *
   * Pans the graph so that it shows the given cell. Optionally the cell may
   * be centered in the container.
   *
   * To center a given graph if the <container> has no scrollbars, use the following code.
   *
   * [code]
   * let bounds = graph.getGraphBounds();
   * graph.view.setTranslate(-bounds.x - (bounds.width - container.clientWidth) / 2,
   *                -bounds.y - (bounds.height - container.clientHeight) / 2);
   * [/code]
   *
   * Parameters:
   *
   * cell - <mxCell> to be made visible.
   * center - Optional boolean flag. Default is false.
   */
  scrollCellToVisible(cell: mxCell,
                      center: boolean=false): void {

    const x = -this.getView().translate.x;
    const y = -this.getView().translate.y;

    const state = this.getView().getState(cell);

    if (state != null) {
      const bounds = new mxRectangle(
        x + state.x,
        y + state.y,
        state.width,
        state.height
      );

      if (center && this.container != null) {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;

        bounds.x = bounds.getCenterX() - w / 2;
        bounds.width = w;
        bounds.y = bounds.getCenterY() - h / 2;
        bounds.height = h;
      }

      const tr = new mxPoint(this.getView().translate.x, this.getView().translate.y);

      if (this.scrollRectToVisible(bounds)) {
        // Triggers an update via the view's event source
        const tr2 = new mxPoint(this.getView().translate.x, this.getView().translate.y);
        this.getView().translate.x = tr.x;
        this.getView().translate.y = tr.y;
        this.getView().setTranslate(tr2.x, tr2.y);
      }
    }
  }

  /**
   * Function: scrollRectToVisible
   *
   * Pans the graph so that it shows the given rectangle.
   *
   * Parameters:
   *
   * rect - <mxRectangle> to be made visible.
   */
  scrollRectToVisible(rect: mxRectangle): boolean {
    let isChanged = false;

    if (rect != null) {
      const container = <HTMLElement>this.container;
      const w = container.offsetWidth;
      const h = container.offsetHeight;

      const widthLimit = Math.min(w, rect.width);
      const heightLimit = Math.min(h, rect.height);

      if (mxUtils.hasScrollbars(container)) {
        rect.x += this.getView().translate.x;
        rect.y += this.getView().translate.y;
        let dx = container.scrollLeft - rect.x;
        const ddx = Math.max(dx - container.scrollLeft, 0);

        if (dx > 0) {
          container.scrollLeft -= dx + 2;
        } else {
          dx = rect.x + widthLimit - container.scrollLeft - container.clientWidth;

          if (dx > 0) {
            container.scrollLeft += dx + 2;
          }
        }

        let dy = container.scrollTop - rect.y;
        const ddy = Math.max(0, dy - container.scrollTop);

        if (dy > 0) {
          container.scrollTop -= dy + 2;
        } else {
          dy = rect.y + heightLimit - container.scrollTop - container.clientHeight;

          if (dy > 0) {
            container.scrollTop += dy + 2;
          }
        }

        if (!this.useScrollbarsForPanning && (ddx != 0 || ddy != 0)) {
          this.getView().setTranslate(ddx, ddy);
        }
      } else {
        const x = -this.getView().translate.x;
        const y = -this.getView().translate.y;

        const s = this.getView().scale;

        if (rect.x + widthLimit > x + w) {
          this.getView().translate.x -= (rect.x + widthLimit - w - x) / s;
          isChanged = true;
        }

        if (rect.y + heightLimit > y + h) {
          this.getView().translate.y -= (rect.y + heightLimit - h - y) / s;
          isChanged = true;
        }

        if (rect.x < x) {
          this.getView().translate.x += (x - rect.x) / s;
          isChanged = true;
        }

        if (rect.y < y) {
          this.getView().translate.y += (y - rect.y) / s;
          isChanged = true;
        }

        if (isChanged) {
          this.getView().refresh();

          // Repaints selection marker (ticket 18)
          if (this.selectionCellsHandler != null) {
            this.selectionCellsHandler.refresh();
          }
        }
      }
    }

    return isChanged;
  }

  /**
   * Function: getCellGeometry
   *
   * Returns the <mxGeometry> for the given cell. This implementation uses
   * <mxGraphModel.getGeometry>. Subclasses can override this to implement
   * specific geometries for cells in only one graph, that is, it can return
   * geometries that depend on the current state of the view.
   *
   * Parameters:
   *
   * cell - <mxCell> whose geometry should be returned.
   */
  getCellGeometry(cell: mxCell): mxGeometry | null {
    return this.getModel().getGeometry(cell);
  }

  /**
   * Function: isCellVisible
   *
   * Returns true if the given cell is visible in this graph. This
   * implementation uses <mxGraphModel.isVisible>. Subclassers can override
   * this to implement specific visibility for cells in only one graph, that
   * is, without affecting the visible state of the cell.
   *
   * When using dynamic filter expressions for cell visibility, then the
   * graph should be revalidated after the filter expression has changed.
   *
   * Parameters:
   *
   * cell - <mxCell> whose visible state should be returned.
   */
  isCellVisible(cell: mxCell | null): boolean {
    return this.getModel().isVisible(cell);
  }

  /**
   * Function: isCellCollapsed
   *
   * Returns true if the given cell is collapsed in this graph. This
   * implementation uses <mxGraphModel.isCollapsed>. Subclassers can override
   * this to implement specific collapsed states for cells in only one graph,
   * that is, without affecting the collapsed state of the cell.
   *
   * When using dynamic filter expressions for the collapsed state, then the
   * graph should be revalidated after the filter expression has changed.
   *
   * Parameters:
   *
   * cell - <mxCell> whose collapsed state should be returned.
   */
  isCellCollapsed(cell: mxCell | null): boolean {
    return this.getModel().isCollapsed(cell);
  }

  /**
   * Function: isCellConnectable
   *
   * Returns true if the given cell is connectable in this graph. This
   * implementation uses <mxGraphModel.isConnectable>. Subclassers can override
   * this to implement specific connectable states for cells in only one graph,
   * that is, without affecting the connectable state of the cell in the model.
   *
   * Parameters:
   *
   * cell - <mxCell> whose connectable state should be returned.
   */
  isCellConnectable(cell: mxCell): boolean {
    return this.getModel().isConnectable(cell);
  }

  /**
   * Function: isOrthogonal
   *
   * Returns true if perimeter points should be computed such that the
   * resulting edge has only horizontal or vertical segments.
   *
   * Parameters:
   *
   * edge - <mxCellState> that represents the edge.
   */
  isOrthogonal(edge: mxCellState): boolean {
    const orthogonal = edge.style[mxConstants.STYLE_ORTHOGONAL];

    if (orthogonal != null) {
      return orthogonal;
    }

    const tmp = this.getView().getEdgeStyle(edge);

    return (
      tmp === mxEdgeStyle.SegmentConnector ||
      tmp === mxEdgeStyle.ElbowConnector ||
      tmp === mxEdgeStyle.SideToSide ||
      tmp === mxEdgeStyle.TopToBottom ||
      tmp === mxEdgeStyle.EntityRelation ||
      tmp === mxEdgeStyle.OrthConnector
    );
  }

  /**
   * Function: isLoop
   *
   * Returns true if the given cell state is a loop.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents a potential loop.
   */
  isLoop(state: mxCellState): boolean {
    const src = state.getVisibleTerminalState(true);
    const trg = state.getVisibleTerminalState(false);
    return src != null && src == trg;
  }

  /**
   * Function: isCloneEvent
   *
   * Returns true if the given event is a clone event. This implementation
   * returns true if control is pressed.
   */
  isCloneEvent(evt: mxEventObject | mxMouseEvent): boolean {
    return mxEvent.isControlDown(evt);
  }

  /**
   * Function: isTransparentClickEvent
   *
   * Hook for implementing click-through behaviour on selected cells. If this
   * returns true the cell behind the selected cell will be selected. This
   * implementation returns false;
   */
  isTransparentClickEvent(evt: mxEventObject | mxMouseEvent): boolean {
    return false;
  }

  /**
   * Function: isToggleEvent
   *
   * Returns true if the given event is a toggle event. This implementation
   * returns true if the meta key (Cmd) is pressed on Macs or if control is
   * pressed on any other platform.
   */
  isToggleEvent(evt: mxEventObject | mxMouseEvent | mxMouseEvent): boolean {
    return mxClient.IS_MAC
      ? mxEvent.isMetaDown(evt)
      : mxEvent.isControlDown(evt);
  }

  /**
   * Function: isGridEnabledEvent
   *
   * Returns true if the given mouse event should be aligned to the grid.
   */
  isGridEnabledEvent(evt: mxEventObject | mxMouseEvent): boolean {
    return evt != null && !mxEvent.isAltDown(evt);
  }

  /**
   * Function: isConstrainedEvent
   *
   * Returns true if the given mouse event should be aligned to the grid.
   */
  isConstrainedEvent(evt: mxEventObject | mxMouseEvent): boolean {
    return mxEvent.isShiftDown(evt);
  }

  /**
   * Function: isIgnoreTerminalEvent
   *
   * Returns true if the given mouse event should not allow any connections to be
   * made. This implementation returns false.
   */
  isIgnoreTerminalEvent(evt: mxEventObject | mxMouseEvent): boolean {
    return false;
  }

  /**
   * Group: Validation
   */

  /**
   * Function: validationAlert
   *
   * Displays the given validation error in a dialog. This implementation uses
   * mxUtils.alert.
   */
  validationAlert(message: any): void {
    mxUtils.alert(message);
  }

  /**
   * Function: isEdgeValid
   *
   * Checks if the return value of <getEdgeValidationError> for the given
   * arguments is null.
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge to validate.
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   */
  isEdgeValid(edge: mxCell,
              source: mxCell,
              target: mxCell): boolean {
    return this.getEdgeValidationError(edge, source, target) == null;
  }

  /**
   * Function: getEdgeValidationError
   *
   * Returns the validation error message to be displayed when inserting or
   * changing an edges' connectivity. A return value of null means the edge
   * is valid, a return value of '' means it's not valid, but do not display
   * an error message. Any other (non-empty) string returned from this method
   * is displayed as an error message when trying to connect an edge to a
   * source and target. This implementation uses the <multiplicities>, and
   * checks <multigraph>, <allowDanglingEdges> and <allowLoops> to generate
   * validation errors.
   *
   * For extending this method with specific checks for source/target cells,
   * the method can be extended as follows. Returning an empty string means
   * the edge is invalid with no error message, a non-null string specifies
   * the error message, and null means the edge is valid.
   *
   * (code)
   * graph.getEdgeValidationError = (edge, source, target)=>
   * {
   *   if (source != null && target != null &&
   *     this.getModel().getValue(source) != null &&
   *     this.getModel().getValue(target) != null)
   *   {
   *     if (target is not valid for source)
   *     {
   *       return 'Invalid Target';
   *     }
   *   }
   *
   *   // "Supercall"
   *   return getEdgeValidationError.apply(this, arguments);
   * }
   * (end)
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge to validate.
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   */
  getEdgeValidationError(edge: mxCell | null=null,
                         source: mxCell | null=null,
                         target: mxCell | null=null): string | null {

    if (
      edge != null &&
      !this.isAllowDanglingEdges() &&
      (source == null || target == null)
    ) {
      return '';
    }

    if (
      edge != null &&
      this.getModel().getTerminal(edge, true) == null &&
      this.getModel().getTerminal(edge, false) == null
    ) {
      return null;
    }

    // Checks if we're dealing with a loop
    if (!this.allowLoops && source === target && source != null) {
      return '';
    }

    // Checks if the connection is generally allowed
    if (!this.isValidConnection(<mxCell>source, <mxCell>target)) {
      return '';
    }

    if (source != null && target != null) {
      let error = '';

      // Checks if the cells are already connected
      // and adds an error message if required
      if (!this.multigraph) {
        const tmp = this.getModel().getEdgesBetween(source, target, true);

        // Checks if the source and target are not connected by another edge
        if (tmp.length > 1 || (tmp.length === 1 && tmp[0] !== edge)) {
          error += `${mxResources.get(this.alreadyConnectedResource) ||
            this.alreadyConnectedResource}\n`;
        }
      }

      // Gets the number of outgoing edges from the source
      // and the number of incoming edges from the target
      // without counting the edge being currently changed.
      const sourceOut = this.getModel().getDirectedEdgeCount(source, true, edge);
      const targetIn = this.getModel().getDirectedEdgeCount(target, false, edge);

      // Checks the change against each multiplicity rule
      if (this.multiplicities != null) {
        for (let i = 0; i < this.multiplicities.length; i += 1) {
          const err = this.multiplicities[i].check(
            this,
            edge,
            source,
            target,
            sourceOut,
            targetIn
          );

          if (err != null) {
            error += err;
          }
        }
      }

      // Validates the source and target terminals independently
      const err = this.validateEdge(<mxCell>edge, source, target);
      if (err != null) {
        error += err;
      }
      return error.length > 0 ? error : null;
    }

    return this.allowDanglingEdges ? null : '';
  }

  /**
   * Function: validateEdge
   *
   * Hook method for subclassers to return an error message for the given
   * edge and terminals. This implementation returns null.
   *
   * Parameters:
   *
   * edge - <mxCell> that represents the edge to validate.
   * source - <mxCell> that represents the source terminal.
   * target - <mxCell> that represents the target terminal.
   */
  validateEdge(edge: mxCell,
               source: mxCell,
               target: mxCell): void | null {
    return null;
  }

  /**
   * Function: validateGraph
   *
   * Validates the graph by validating each descendant of the given cell or
   * the root of the model. Context is an object that contains the validation
   * state for the complete validation run. The validation errors are
   * attached to their cells using <setCellWarning>. Returns null in the case of
   * successful validation or an array of strings (warnings) in the case of
   * failed validations.
   *
   * Paramters:
   *
   * cell - Optional <mxCell> to start the validation recursion. Default is
   * the graph root.
   * context - Object that represents the global validation state.
   */
  validateGraph(cell: mxCell | null=null,
                context: any): string | null {

    cell = cell != null ? cell : this.getModel().getRoot();
    context = context != null ? context : {};

    let isValid = true;
    const childCount = this.getModel().getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      const tmp = <mxCell>this.getModel().getChildAt(cell, i);
      let ctx = context;

      if (this.isValidRoot(tmp)) {
        ctx = {};
      }

      const warn = this.validateGraph(tmp, ctx);

      if (warn != null) {
        this.setCellWarning(tmp, warn.replace(/\n/g, '<br>'));
      } else {
        this.setCellWarning(tmp, null);
      }

      isValid = isValid && warn == null;
    }

    let warning = '';

    // Adds error for invalid children if collapsed (children invisible)
    if (this.isCellCollapsed(cell) && !isValid) {
      warning += `${mxResources.get(this.containsValidationErrorsResource) ||
        this.containsValidationErrorsResource}\n`;
    }

    // Checks edges and cells using the defined multiplicities
    if (this.getModel().isEdge(cell)) {
      warning +=
        this.getEdgeValidationError(
          cell,
          this.getModel().getTerminal(cell, true),
          this.getModel().getTerminal(cell, false)
        ) || '';
    } else {
      warning += this.getCellValidationError(<mxCell>cell) || '';
    }

    // Checks custom validation rules
    const err = this.validateCell(<mxCell>cell, context);

    if (err != null) {
      warning += err;
    }

    // Updates the display with the warning icons
    // before any potential alerts are displayed.
    // LATER: Move this into addCellOverlay. Redraw
    // should check if overlay was added or removed.
    if (this.getModel().getParent(cell) == null) {
      this.getView().validate();
    }
    return warning.length > 0 || !isValid ? warning : null;
  }

  /**
   * Function: getCellValidationError
   *
   * Checks all <multiplicities> that cannot be enforced while the graph is
   * being modified, namely, all multiplicities that require a minimum of
   * 1 edge.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the multiplicities should be checked.
   */
  getCellValidationError(cell: mxCell): string | null {
    const outCount = this.getModel().getDirectedEdgeCount(cell, true);
    const inCount = this.getModel().getDirectedEdgeCount(cell, false);
    const value = this.getModel().getValue(cell);
    let error = '';

    if (this.multiplicities != null) {
      for (let i = 0; i < this.multiplicities.length; i += 1) {
        const rule = this.multiplicities[i];

        if (
          rule.source &&
          mxUtils.isNode(value, rule.type, rule.attr, rule.value) &&
          (outCount > rule.max || outCount < rule.min)
        ) {
          error += `${rule.countError}\n`;
        } else if (
          !rule.source &&
          mxUtils.isNode(value, rule.type, rule.attr, rule.value) &&
          (inCount > rule.max || inCount < rule.min)
        ) {
          error += `${rule.countError}\n`;
        }
      }
    }
    return error.length > 0 ? error : null;
  }

  /**
   * Function: validateCell
   *
   * Hook method for subclassers to return an error message for the given
   * cell and validation context. This implementation returns null. Any HTML
   * breaks will be converted to linefeeds in the calling method.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the cell to validate.
   * context - Object that represents the global validation state.
   */
  validateCell(cell: mxCell,
               context: mxCellState): void | null {
    return null;
  }

  /**
   * Group: Graph appearance
   */

  /**
   * Function: getBackgroundImage
   *
   * Returns the <backgroundImage> as an <mxImage>.
   */
  getBackgroundImage(): mxImage | null {
    return this.backgroundImage;
  }

  /**
   * Function: setBackgroundImage
   *
   * Sets the new <backgroundImage>.
   *
   * Parameters:
   *
   * image - New <mxImage> to be used for the background.
   */
  setBackgroundImage(image: mxImage | null): void {
    this.backgroundImage = image;
  }

  /**
   * Function: getFoldingImage
   *
   * Returns the <mxImage> used to display the collapsed state of
   * the specified cell state. This returns null for all edges.
   */
  getFoldingImage(state: mxCellState): mxImage | null {
    if (
      state != null &&
      this.foldingEnabled &&
      !this.getModel().isEdge(state.cell)
    ) {
      const tmp = this.isCellCollapsed(<mxCell>state.cell);

      if (this.isCellFoldable(state.cell, !tmp)) {
        return tmp ? this.collapsedImage : this.expandedImage;
      }
    }
    return null;
  }

  /**
   * Function: convertValueToString
   *
   * Returns the textual representation for the given cell. This
   * implementation returns the nodename or string-representation of the user
   * object.
   *
   * Example:
   *
   * The following returns the label attribute from the cells user
   * object if it is an XML node.
   *
   * (code)
   * graph.convertValueToString = (cell)=>
   * {
   *   return cell.getAttribute('label');
   * }
   * (end)
   *
   * See also: <cellLabelChanged>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose textual representation should be returned.
   */
  convertValueToString(cell: mxCell): string | null {
    const value = this.getModel().getValue(cell);

    if (value != null) {
      if (mxUtils.isNode(value)) {
        return value.nodeName;
      }
      if (typeof value.toString === 'function') {
        return value.toString();
      }
    }
    return '';
  }

  /**
   * Function: getLabel
   *
   * Returns a string or DOM node that represents the label for the given
   * cell. This implementation uses <convertValueToString> if <labelsVisible>
   * is true. Otherwise it returns an empty string.
   *
   * To truncate a label to match the size of the cell, the following code
   * can be used.
   *
   * (code)
   * graph.getLabel = (cell)=>
   * {
   *   let label = getLabel.apply(this, arguments);
   *
   *   if (label != null && this.getModel().isVertex(cell))
   *   {
   *     let geo = this.getCellGeometry(cell);
   *
   *     if (geo != null)
   *     {
   *       let max = parseInt(geo.width / 8);
   *
   *       if (label.length > max)
   *       {
   *         label = label.substring(0, max)+'...';
   *       }
   *     }
   *   }
   *   return mxUtils.htmlEntities(label);
   * }
   * (end)
   *
   * A resize listener is needed in the graph to force a repaint of the label
   * after a resize.
   *
   * (code)
   * graph.addListener(mxEvent.RESIZE_CELLS, (sender, evt)=>
   * {
   *   let cells = evt.getProperty('cells');
   *
   *   for (let i = 0; i < cells.length; i += 1)
   *   {
   *     this.getView().removeState(cells[i]);
   *   }
   * });
   * (end)
   *
   * Parameters:
   *
   * cell - <mxCell> whose label should be returned.
   */
  getLabel(cell: mxCell): string | null {
    let result: string | null = '';

    if (this.labelsVisible && cell != null) {
      const style = this.getCurrentCellStyle(cell);

      if (!mxUtils.getValue(style, mxConstants.STYLE_NOLABEL, false)) {
        result = this.convertValueToString(cell);
      }
    }
    return result;
  }

  /**
   * Function: isHtmlLabel
   *
   * Returns true if the label must be rendered as HTML markup. The default
   * implementation returns <htmlLabels>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose label should be displayed as HTML markup.
   */
  isHtmlLabel(cell: mxCell): boolean {
    return this.isHtmlLabels();
  }

  /**
   * Function: isHtmlLabels
   *
   * Returns <htmlLabels>.
   */
  isHtmlLabels(): boolean {
    return this.htmlLabels;
  }

  /**
   * Function: setHtmlLabels
   *
   * Sets <htmlLabels>.
   */
  setHtmlLabels(value: boolean) {
    this.htmlLabels = value;
  }

  /**
   * Function: isWrapping
   *
   * This enables wrapping for HTML labels.
   *
   * Returns true if no white-space CSS style directive should be used for
   * displaying the given cells label. This implementation returns true if
   * <mxConstants.STYLE_WHITE_SPACE> in the style of the given cell is 'wrap'.
   *
   * This is used as a workaround for IE ignoring the white-space directive
   * of child elements if the directive appears in a parent element. It
   * should be overridden to return true if a white-space directive is used
   * in the HTML markup that represents the given cells label. In order for
   * HTML markup to work in labels, <isHtmlLabel> must also return true
   * for the given cell.
   *
   * Example:
   *
   * (code)
   * graph.getLabel = (cell)=>
   * {
   *   let tmp = getLabel.apply(this, arguments); // "supercall"
   *
   *   if (this.getModel().isEdge(cell))
   *   {
   *     tmp = '<div style="width: 150px; white-space:normal;">'+tmp+'</div>';
   *   }
   *
   *   return tmp;
   * }
   *
   * graph.isWrapping = (state)=>
   * {
   *    return this.getModel().isEdge(state.cell);
   * }
   * (end)
   *
   * Makes sure no edge label is wider than 150 pixels, otherwise the content
   * is wrapped. Note: No width must be specified for wrapped vertex labels as
   * the vertex defines the width in its geometry.
   *
   * Parameters:
   *
   * state - <mxCell> whose label should be wrapped.
   */
  isWrapping(cell: mxCell): boolean {
    return (
      this.getCurrentCellStyle(cell)[mxConstants.STYLE_WHITE_SPACE] === 'wrap'
    );
  }

  /**
   * Function: isLabelClipped
   *
   * Returns true if the overflow portion of labels should be hidden. If this
   * returns true then vertex labels will be clipped to the size of the vertices.
   * This implementation returns true if <mxConstants.STYLE_OVERFLOW> in the
   * style of the given cell is 'hidden'.
   *
   * Parameters:
   *
   * state - <mxCell> whose label should be clipped.
   */
  isLabelClipped(cell: mxCell): boolean {
    return (
      this.getCurrentCellStyle(cell)[mxConstants.STYLE_OVERFLOW] === 'hidden'
    );
  }

  /**
   * Function: getTooltip
   *
   * Returns the string or DOM node that represents the tooltip for the given
   * state, node and coordinate pair. This implementation checks if the given
   * node is a folding icon or overlay and returns the respective tooltip. If
   * this does not result in a tooltip, the handler for the cell is retrieved
   * from <selectionCellsHandler> and the optional getTooltipForNode method is
   * called. If no special tooltip exists here then <getTooltipForCell> is used
   * with the cell in the given state as the argument to return a tooltip for the
   * given state.
   *
   * Parameters:
   *
   * state - <mxCellState> whose tooltip should be returned.
   * node - DOM node that is currently under the mouse.
   * x - X-coordinate of the mouse.
   * y - Y-coordinate of the mouse.
   */
  getTooltip(state: mxCellState,
             node: HTMLElement,
             x: number,
             y: number): string | null {

    let tip: string | null = null;

    if (state != null) {
      // Checks if the mouse is over the folding icon
      if (
        state.control != null &&
        // @ts-ignore
        (node === state.control.node || node.parentNode === state.control.node)
      ) {
        tip = this.collapseExpandResource;
        tip = mxUtils
          .htmlEntities(mxResources.get(tip) || tip)
          .replace(/\\n/g, '<br>');
      }

      if (tip == null && state.overlays != null) {
        state.overlays.visit((id: string, shape: mxShape) => {
          // LATER: Exit loop if tip is not null
          if (
            tip == null &&
            // @ts-ignore
            (node === shape.node || node.parentNode === shape.node)
          ) {
            // @ts-ignore
              tip = shape.overlay.toString();
          }
        });
      }

      if (tip == null) {
        const handler = (<mxSelectionCellsHandler>this.selectionCellsHandler)
            .getHandler(<mxCell>state.cell);
        if (
          handler != null &&
          typeof handler.getTooltipForNode === 'function'
        ) {
          tip = handler.getTooltipForNode(node);
        }
      }

      if (tip == null) {
        tip = this.getTooltipForCell(<mxCell>state.cell);
      }
    }
    return tip;
  }

  /**
   * Function: getTooltipForCell
   *
   * Returns the string or DOM node to be used as the tooltip for the given
   * cell. This implementation uses the cells getTooltip function if it
   * exists, or else it returns <convertValueToString> for the cell.
   *
   * Example:
   *
   * (code)
   * graph.getTooltipForCell = (cell)=>
   * {
   *   return 'Hello, World!';
   * }
   * (end)
   *
   * Replaces all tooltips with the string Hello, World!
   *
   * Parameters:
   *
   * cell - <mxCell> whose tooltip should be returned.
   */
  getTooltipForCell(cell: mxCell): string | null {
    let tip = null;

    if (cell != null && 'getTooltip' in cell) {
      // @ts-ignore
      tip = cell.getTooltip();
    } else {
      tip = this.convertValueToString(cell);
    }
    return tip;
  }

  /**
   * Function: getLinkForCell
   *
   * Returns the string to be used as the link for the given cell. This
   * implementation returns null.
   *
   * Parameters:
   *
   * cell - <mxCell> whose tooltip should be returned.
   */
  getLinkForCell(cell: mxCell): string | null {
    return null;
  }

  /**
   * Function: getCursorForMouseEvent
   *
   * Returns the cursor value to be used for the CSS of the shape for the
   * given event. This implementation calls <getCursorForCell>.
   *
   * Parameters:
   *
   * me - <mxMouseEvent> whose cursor should be returned.
   */
  getCursorForMouseEvent(me: mxMouseEvent): string | null {
    return this.getCursorForCell(me.getCell());
  }

  /**
   * Function: getCursorForCell
   *
   * Returns the cursor value to be used for the CSS of the shape for the
   * given cell. This implementation returns null.
   *
   * Parameters:
   *
   * cell - <mxCell> whose cursor should be returned.
   */
  getCursorForCell(cell: mxCell): string | null {
    return null;
  }

  /**
   * Function: getStartSize
   *
   * Returns the start size of the given swimlane, that is, the width or
   * height of the part that contains the title, depending on the
   * horizontal style. The return value is an <mxRectangle> with either
   * width or height set as appropriate.
   *
   * Parameters:
   *
   * swimlane - <mxCell> whose start size should be returned.
   * ignoreState - Optional boolean that specifies if cell state should be ignored.
   */
  getStartSize(swimlane: mxCell,
               ignoreState: boolean=false): mxRectangle {

    const result = new mxRectangle();
    const style = this.getCurrentCellStyle(swimlane, ignoreState);
    const size = parseInt(
      mxUtils.getValue(
        style,
        mxConstants.STYLE_STARTSIZE,
        mxConstants.DEFAULT_STARTSIZE
      )
    );

    if (mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
      result.height = size;
    } else {
      result.width = size;
    }
    return result;
  }

  /**
   * Function: getSwimlaneDirection
   *
   * Returns the direction for the given swimlane style.
   */
  getSwimlaneDirection(style: any): string {
    const dir = mxUtils.getValue(
      style,
      mxConstants.STYLE_DIRECTION,
      mxConstants.DIRECTION_EAST
    );
    const flipH = mxUtils.getValue(style, mxConstants.STYLE_FLIPH, 0) == 1;
    const flipV = mxUtils.getValue(style, mxConstants.STYLE_FLIPV, 0) == 1;
    const h = mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true);
    let n = h ? 0 : 3;

    if (dir === mxConstants.DIRECTION_NORTH) {
      n--;
    } else if (dir === mxConstants.DIRECTION_WEST) {
      n += 2;
    } else if (dir === mxConstants.DIRECTION_SOUTH) {
      n += 1;
    }

    const mod = mxUtils.mod(n, 2);

    if (flipH && mod === 1) {
      n += 2;
    }

    if (flipV && mod === 0) {
      n += 2;
    }

    return [
      mxConstants.DIRECTION_NORTH,
      mxConstants.DIRECTION_EAST,
      mxConstants.DIRECTION_SOUTH,
      mxConstants.DIRECTION_WEST,
    ][mxUtils.mod(n, 4)];
  }

  /**
   * Function: getActualStartSize
   *
   * Returns the actual start size of the given swimlane taking into account
   * direction and horizontal and vertial flip styles. The start size is
   * returned as an <mxRectangle> where top, left, bottom, right start sizes
   * are returned as x, y, height and width, respectively.
   *
   * Parameters:
   *
   * swimlane - <mxCell> whose start size should be returned.
   * ignoreState - Optional boolean that specifies if cell state should be ignored.
   */
  getActualStartSize(swimlane: mxCell,
                     ignoreState: boolean=false): mxRectangle {
    const result = new mxRectangle();

    if (this.isSwimlane(swimlane, ignoreState)) {
      const style = this.getCurrentCellStyle(swimlane, ignoreState);
      const size = parseInt(
        mxUtils.getValue(
          style,
          mxConstants.STYLE_STARTSIZE,
          mxConstants.DEFAULT_STARTSIZE
        )
      );
      const dir = this.getSwimlaneDirection(style);

      if (dir === mxConstants.DIRECTION_NORTH) {
        result.y = size;
      } else if (dir === mxConstants.DIRECTION_WEST) {
        result.x = size;
      } else if (dir === mxConstants.DIRECTION_SOUTH) {
        result.height = size;
      } else {
        result.width = size;
      }
    }
    return result;
  }

  /**
   * Function: getImage
   *
   * Returns the image URL for the given cell state. This implementation
   * returns the value stored under <mxConstants.STYLE_IMAGE> in the cell
   * style.
   *
   * Parameters:
   *
   * state - <mxCellState> whose image URL should be returned.
   */
  getImage(state: mxCellState): mxImage | null {
    return state != null && state.style != null
      ? state.style[mxConstants.STYLE_IMAGE]
      : null;
  }

  /**
   * Function: isTransparentState
   *
   * Returns true if the given state has no stroke- or fillcolor and no image.
   *
   * Parameters:
   *
   * state - <mxCellState> to check.
   */
  isTransparentState(state: mxCellState): boolean {
    let result = false;
    if (state != null) {
      const stroke = mxUtils.getValue(
        state.style,
        mxConstants.STYLE_STROKECOLOR,
        mxConstants.NONE
      );
      const fill = mxUtils.getValue(
        state.style,
        mxConstants.STYLE_FILLCOLOR,
        mxConstants.NONE
      );
      result =
        stroke === mxConstants.NONE &&
        fill === mxConstants.NONE &&
        this.getImage(state) == null;
    }
    return result;
  }

  /**
   * Function: getVerticalAlign
   *
   * Returns the vertical alignment for the given cell state. This
   * implementation returns the value stored under
   * <mxConstants.STYLE_VERTICAL_ALIGN> in the cell style.
   *
   * Parameters:
   *
   * state - <mxCellState> whose vertical alignment should be
   * returned.
   */
  getVerticalAlign(state: mxCellState): string | null {
    return state != null && state.style != null
      ? state.style[mxConstants.STYLE_VERTICAL_ALIGN] ||
          mxConstants.ALIGN_MIDDLE
      : null;
  }

  /**
   * Function: getIndicatorColor
   *
   * Returns the indicator color for the given cell state. This
   * implementation returns the value stored under
   * <mxConstants.STYLE_INDICATOR_COLOR> in the cell style.
   *
   * Parameters:
   *
   * state - <mxCellState> whose indicator color should be
   * returned.
   */
  getIndicatorColor(state: mxCellState): string | null {
    return state != null && state.style != null
      ? state.style[mxConstants.STYLE_INDICATOR_COLOR]
      : null;
  }

  /**
   * Function: getIndicatorGradientColor
   *
   * Returns the indicator gradient color for the given cell state. This
   * implementation returns the value stored under
   * <mxConstants.STYLE_INDICATOR_GRADIENTCOLOR> in the cell style.
   *
   * Parameters:
   *
   * state - <mxCellState> whose indicator gradient color should be
   * returned.
   */
  getIndicatorGradientColor(state: mxCellState): string | null {
    return state != null && state.style != null
      ? state.style[mxConstants.STYLE_INDICATOR_GRADIENTCOLOR]
      : null;
  }

  /**
   * Function: getIndicatorShape
   *
   * Returns the indicator shape for the given cell state. This
   * implementation returns the value stored under
   * <mxConstants.STYLE_INDICATOR_SHAPE> in the cell style.
   *
   * Parameters:
   *
   * state - <mxCellState> whose indicator shape should be returned.
   */
  getIndicatorShape(state: mxCellState): string | null {
    return state != null && state.style != null
      ? state.style[mxConstants.STYLE_INDICATOR_SHAPE]
      : null;
  }

  /**
   * Function: getIndicatorImage
   *
   * Returns the indicator image for the given cell state. This
   * implementation returns the value stored under
   * <mxConstants.STYLE_INDICATOR_IMAGE> in the cell style.
   *
   * Parameters:
   *
   * state - <mxCellState> whose indicator image should be returned.
   */
  getIndicatorImage(state: mxCellState): mxImage | null {
    return state != null && state.style != null
      ? state.style[mxConstants.STYLE_INDICATOR_IMAGE]
      : null;
  }

  /**
   * Function: getBorder
   *
   * Returns the value of <border>.
   */
  getBorder(): number {
    return this.border;
  }

  /**
   * Function: setBorder
   *
   * Sets the value of <border>.
   *
   * Parameters:
   *
   * value - Positive integer that represents the border to be used.
   */
  setBorder(value: number) {
    this.border = value;
  }

  /**
   * Function: isSwimlane
   *
   * Returns true if the given cell is a swimlane in the graph. A swimlane is
   * a container cell with some specific behaviour. This implementation
   * checks if the shape associated with the given cell is a <mxSwimlane>.
   *
   * Parameters:
   *
   * cell - <mxCell> to be checked.
   * ignoreState - Optional boolean that specifies if the cell state should be ignored.
   */
  isSwimlane(cell: mxCell,
             ignoreState: boolean=false): boolean {
    if (
      cell != null &&
      this.getModel().getParent(cell) !== this.getModel().getRoot() &&
      !this.getModel().isEdge(cell)
    ) {
      return (
        this.getCurrentCellStyle(cell, ignoreState)[mxConstants.STYLE_SHAPE] ===
        mxConstants.SHAPE_SWIMLANE
      );
    }
    return false;
  }

  /**
   * Group: Graph behaviour
   */

  /**
   * Function: isResizeContainer
   *
   * Returns <resizeContainer>.
   */
  isResizeContainer(): boolean {
    return this.resizeContainer;
  }

  /**
   * Function: setResizeContainer
   *
   * Sets <resizeContainer>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the container should be resized.
   */
  setResizeContainer(value: boolean) {
    this.resizeContainer = value;
  }

  /**
   * Function: isEnabled
   *
   * Returns true if the graph is <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Specifies if the graph should allow any interactions. This
   * implementation updates <enabled>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph should be enabled.
   */
  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  /**
   * Function: isEscapeEnabled
   *
   * Returns <escapeEnabled>.
   */
  isEscapeEnabled(): boolean {
    return this.escapeEnabled;
  }

  /**
   * Function: setEscapeEnabled
   *
   * Sets <escapeEnabled>.
   *
   * Parameters:
   *
   * enabled - Boolean indicating if escape should be enabled.
   */
  setEscapeEnabled(value: boolean): void {
    this.escapeEnabled = value;
  }

  /**
   * Function: isInvokesStopCellEditing
   *
   * Returns <invokesStopCellEditing>.
   */
  isInvokesStopCellEditing(): boolean {
    return this.invokesStopCellEditing;
  }

  /**
   * Function: setInvokesStopCellEditing
   *
   * Sets <invokesStopCellEditing>.
   */
  setInvokesStopCellEditing(value: boolean): void {
    this.invokesStopCellEditing = value;
  }

  /**
   * Function: isEnterStopsCellEditing
   *
   * Returns <enterStopsCellEditing>.
   */
  isEnterStopsCellEditing(): boolean {
    return this.enterStopsCellEditing;
  }

  /**
   * Function: setEnterStopsCellEditing
   *
   * Sets <enterStopsCellEditing>.
   */
  setEnterStopsCellEditing(value: boolean): void {
    this.enterStopsCellEditing = value;
  }

  /**
   * Function: isCellLocked
   *
   * Returns true if the given cell may not be moved, sized, bended,
   * disconnected, edited or selected. This implementation returns true for
   * all vertices with a relative geometry if <locked> is false.
   *
   * Parameters:
   *
   * cell - <mxCell> whose locked state should be returned.
   */
  isCellLocked(cell: mxCell): boolean {
    const geometry = this.getModel().getGeometry(cell);

    return (
      this.isCellsLocked() ||
      (geometry != null && this.getModel().isVertex(cell) && geometry.relative)
    );
  }

  /**
   * Function: isCellsLocked
   *
   * Returns true if every cell may not be moved, sized, bended,
   * disconnected, edited or selected. This implementation returns true for
   * all vertices with a relative geometry if <locked> is false.
   */
  isCellsLocked(): boolean {
    return this.cellsLocked;
  }

  /**
   * Function: setCellsLocked
   *
   * Sets if any cell may be moved, sized, bended, disconnected, edited or
   * selected.
   *
   * Parameters:
   *
   * value - Boolean that defines the new value for <cellsLocked>.
   */
  setCellsLocked(value: boolean) {
    this.cellsLocked = value;
  }

  /**
   * Function: getCloneableCells
   *
   * Returns the cells which may be exported in the given array of cells.
   */
  getCloneableCells(cells: mxCell[]): mxCell[] | null {
    return this.getModel().filterCells(
      cells, (cell: mxCell) => {
        return this.isCellCloneable(cell);
      }
    );
  }

  /**
   * Function: isCellCloneable
   *
   * Returns true if the given cell is cloneable. This implementation returns
   * <isCellsCloneable> for all cells unless a cell style specifies
   * <mxConstants.STYLE_CLONEABLE> to be 0.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> whose cloneable state should be returned.
   */
  isCellCloneable(cell: mxCell): boolean {
    const style = this.getCurrentCellStyle(cell);
    return this.isCellsCloneable() && style[mxConstants.STYLE_CLONEABLE] !== 0;
  }

  /**
   * Function: isCellsCloneable
   *
   * Returns <cellsCloneable>, that is, if the graph allows cloning of cells
   * by using control-drag.
   */
  isCellsCloneable(): boolean {
    return this.cellsCloneable;
  }

  /**
   * Function: setCellsCloneable
   *
   * Specifies if the graph should allow cloning of cells by holding down the
   * control key while cells are being moved. This implementation updates
   * <cellsCloneable>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph should be cloneable.
   */
  setCellsCloneable(value: boolean): void {
    this.cellsCloneable = value;
  }

  /**
   * Function: getExportableCells
   *
   * Returns the cells which may be exported in the given array of cells.
   */
  getExportableCells(cells: mxCell[]): mxCell[] | null {
    return this.getModel().filterCells(
      cells, (cell: mxCell) => {
        return this.canExportCell(cell);
      }
    );
  }

  /**
   * Function: canExportCell
   *
   * Returns true if the given cell may be exported to the clipboard. This
   * implementation returns <exportEnabled> for all cells.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the cell to be exported.
   */
  canExportCell(cell: mxCell | null=null): boolean {
    return this.exportEnabled;
  }

  /**
   * Function: getImportableCells
   *
   * Returns the cells which may be imported in the given array of cells.
   */
  getImportableCells(cells: mxCell[]): mxCell[] | null {
    return this.getModel().filterCells(
      cells, (cell: mxCell) => {
        return this.canImportCell(cell);
      }
    );
  }

  /**
   * Function: canImportCell
   *
   * Returns true if the given cell may be imported from the clipboard.
   * This implementation returns <importEnabled> for all cells.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the cell to be imported.
   */
  canImportCell(cell: mxCell | null=null): boolean {
    return this.importEnabled;
  }

  /**
   * Function: isCellSelectable
   *
   * Returns true if the given cell is selectable. This implementation
   * returns <cellsSelectable>.
   *
   * To add a new style for making cells (un)selectable, use the following code.
   *
   * (code)
   * isCellSelectable = (cell)=>
   * {
   *   let style = this.getCurrentCellStyle(cell);
   *
   *   return this.isCellsSelectable() && !this.isCellLocked(cell) && style['selectable'] != 0;
   * };
   * (end)
   *
   * You can then use the new style as shown in this example.
   *
   * (code)
   * graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30, 'selectable=0');
   * (end)
   *
   * Parameters:
   *
   * cell - <mxCell> whose selectable state should be returned.
   */
  isCellSelectable(cell: mxCell): boolean {
    return this.isCellsSelectable();
  }

  /**
   * Function: isCellsSelectable
   *
   * Returns <cellsSelectable>.
   */
  isCellsSelectable(): boolean {
    return this.cellsSelectable;
  }

  /**
   * Function: setCellsSelectable
   *
   * Sets <cellsSelectable>.
   */
  setCellsSelectable(value: boolean): void {
    this.cellsSelectable = value;
  }

  /**
   * Function: getDeletableCells
   *
   * Returns the cells which may be exported in the given array of cells.
   */
  getDeletableCells(cells: mxCell[]): mxCell[] | null {
    return this.getModel().filterCells(
      cells, (cell: mxCell) => {
        return this.isCellDeletable(cell);
      }
    );
  }

  /**
   * Function: isCellDeletable
   *
   * Returns true if the given cell is moveable. This returns
   * <cellsDeletable> for all given cells if a cells style does not specify
   * <mxConstants.STYLE_DELETABLE> to be 0.
   *
   * Parameters:
   *
   * cell - <mxCell> whose deletable state should be returned.
   */
  isCellDeletable(cell: mxCell): boolean {
    const style = this.getCurrentCellStyle(cell);
    return this.isCellsDeletable() && style[mxConstants.STYLE_DELETABLE] !== 0;
  }

  /**
   * Function: isCellsDeletable
   *
   * Returns <cellsDeletable>.
   */
  isCellsDeletable(): boolean {
    return this.cellsDeletable;
  }

  /**
   * Function: setCellsDeletable
   *
   * Sets <cellsDeletable>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph should allow deletion of cells.
   */
  setCellsDeletable(value: boolean): void {
    this.cellsDeletable = value;
  }

  /**
   * Function: isLabelMovable
   *
   * Returns true if the given edges's label is moveable. This returns
   * <movable> for all given cells if <isLocked> does not return true
   * for the given cell.
   *
   * Parameters:
   *
   * cell - <mxCell> whose label should be moved.
   */
  isLabelMovable(cell: mxCell): boolean {
    return (
      !this.isCellLocked(cell) &&
      ((this.getModel().isEdge(cell) && this.edgeLabelsMovable) ||
        (this.getModel().isVertex(cell) && this.vertexLabelsMovable))
    );
  }

  /**
   * Function: isCellRotatable
   *
   * Returns true if the given cell is rotatable. This returns true for the given
   * cell if its style does not specify <mxConstants.STYLE_ROTATABLE> to be 0.
   *
   * Parameters:
   *
   * cell - <mxCell> whose rotatable state should be returned.
   */
  isCellRotatable(cell: mxCell): boolean {
    const style = this.getCurrentCellStyle(cell);
    return style[mxConstants.STYLE_ROTATABLE] !== 0;
  }

  /**
   * Function: getMovableCells
   *
   * Returns the cells which are movable in the given array of cells.
   */
  getMovableCells(cells: mxCell[]): mxCell[] | null {
    return this.getModel().filterCells(
      cells, (cell: mxCell) => {
        return this.isCellMovable(cell);
      }
    );
  }

  /**
   * Function: isCellMovable
   *
   * Returns true if the given cell is moveable. This returns <cellsMovable>
   * for all given cells if <isCellLocked> does not return true for the given
   * cell and its style does not specify <mxConstants.STYLE_MOVABLE> to be 0.
   *
   * Parameters:
   *
   * cell - <mxCell> whose movable state should be returned.
   */
  isCellMovable(cell: mxCell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return (
      this.isCellsMovable() &&
      !this.isCellLocked(cell) &&
      style[mxConstants.STYLE_MOVABLE] !== 0
    );
  }

  /**
   * Function: isCellsMovable
   *
   * Returns <cellsMovable>.
   */
  isCellsMovable(): boolean {
    return this.cellsMovable;
  }

  /**
   * Function: setCellsMovable
   *
   * Specifies if the graph should allow moving of cells. This implementation
   * updates <cellsMsovable>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph should allow moving of cells.
   */
  setCellsMovable(value: boolean): void {
    this.cellsMovable = value;
  }

  /**
   * Function: isGridEnabled
   *
   * Returns <gridEnabled> as a boolean.
   */
  isGridEnabled(): boolean {
    return this.gridEnabled;
  }

  /**
   * Function: setGridEnabled
   *
   * Specifies if the grid should be enabled.
   *
   * Parameters:
   *
   * value - Boolean indicating if the grid should be enabled.
   */
  setGridEnabled(value: boolean): void {
    this.gridEnabled = value;
  }

  /**
   * Function: isPortsEnabled
   *
   * Returns <portsEnabled> as a boolean.
   */
  isPortsEnabled(): boolean {
    return this.portsEnabled;
  }

  /**
   * Function: setPortsEnabled
   *
   * Specifies if the ports should be enabled.
   *
   * Parameters:
   *
   * value - Boolean indicating if the ports should be enabled.
   */
  setPortsEnabled(value: boolean): void {
    this.portsEnabled = value;
  }

  /**
   * Function: getGridSize
   *
   * Returns <gridSize>.
   */
  getGridSize(): number {
    return this.gridSize;
  }

  /**
   * Function: setGridSize
   *
   * Sets <gridSize>.
   */
  setGridSize(value: number): void {
    this.gridSize = value;
  }

  /**
   * Function: getTolerance
   *
   * Returns <tolerance>.
   */
  getTolerance(): number {
    return this.tolerance;
  }

  /**
   * Function: setTolerance
   *
   * Sets <tolerance>.
   */
  setTolerance(value: number): void {
    this.tolerance = value;
  }

  /**
   * Function: isVertexLabelsMovable
   *
   * Returns <vertexLabelsMovable>.
   */
  isVertexLabelsMovable(): boolean {
    return this.vertexLabelsMovable;
  }

  /**
   * Function: setVertexLabelsMovable
   *
   * Sets <vertexLabelsMovable>.
   */
  setVertexLabelsMovable(value: boolean): void {
    this.vertexLabelsMovable = value;
  }

  /**
   * Function: isEdgeLabelsMovable
   *
   * Returns <edgeLabelsMovable>.
   */
  isEdgeLabelsMovable(): boolean {
    return this.edgeLabelsMovable;
  }

  /**
   * Function: isEdgeLabelsMovable
   *
   * Sets <edgeLabelsMovable>.
   */
  setEdgeLabelsMovable(value: boolean): void {
    this.edgeLabelsMovable = value;
  }

  /**
   * Function: isSwimlaneNesting
   *
   * Returns <swimlaneNesting> as a boolean.
   */
  isSwimlaneNesting(): boolean {
    return this.swimlaneNesting;
  }

  /**
   * Function: setSwimlaneNesting
   *
   * Specifies if swimlanes can be nested by drag and drop. This is only
   * taken into account if dropEnabled is true.
   *
   * Parameters:
   *
   * value - Boolean indicating if swimlanes can be nested.
   */
  setSwimlaneNesting(value: boolean): void {
    this.swimlaneNesting = value;
  }

  /**
   * Function: isSwimlaneSelectionEnabled
   *
   * Returns <swimlaneSelectionEnabled> as a boolean.
   */
  isSwimlaneSelectionEnabled(): boolean {
    return this.swimlaneSelectionEnabled;
  }

  /**
   * Function: setSwimlaneSelectionEnabled
   *
   * Specifies if swimlanes should be selected if the mouse is released
   * over their content area.
   *
   * Parameters:
   *
   * value - Boolean indicating if swimlanes content areas
   * should be selected when the mouse is released over them.
   */
  setSwimlaneSelectionEnabled(value: boolean): void {
    this.swimlaneSelectionEnabled = value;
  }

  /**
   * Function: isMultigraph
   *
   * Returns <multigraph> as a boolean.
   */
  isMultigraph() {
    return this.multigraph;
  }

  /**
   * Function: setMultigraph
   *
   * Specifies if the graph should allow multiple connections between the
   * same pair of vertices.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph allows multiple connections
   * between the same pair of vertices.
   */
  setMultigraph(value: boolean): void {
    this.multigraph = value;
  }

  /**
   * Function: isAllowLoops
   *
   * Returns <allowLoops> as a boolean.
   */
  isAllowLoops(): boolean {
    return this.allowLoops;
  }

  /**
   * Function: setAllowDanglingEdges
   *
   * Specifies if dangling edges are allowed, that is, if edges are allowed
   * that do not have a source and/or target terminal defined.
   *
   * Parameters:
   *
   * value - Boolean indicating if dangling edges are allowed.
   */
  setAllowDanglingEdges(value: boolean): void {
    this.allowDanglingEdges = value;
  }

  /**
   * Function: isAllowDanglingEdges
   *
   * Returns <allowDanglingEdges> as a boolean.
   */
  isAllowDanglingEdges(): boolean {
    return this.allowDanglingEdges;
  }

  /**
   * Function: setConnectableEdges
   *
   * Specifies if edges should be connectable.
   *
   * Parameters:
   *
   * value - Boolean indicating if edges should be connectable.
   */
  setConnectableEdges(value: boolean): void {
    this.connectableEdges = value;
  }

  /**
   * Function: isConnectableEdges
   *
   * Returns <connectableEdges> as a boolean.
   */
  isConnectableEdges(): boolean {
    return this.connectableEdges;
  }

  /**
   * Function: setCloneInvalidEdges
   *
   * Specifies if edges should be inserted when cloned but not valid wrt.
   * <getEdgeValidationError>. If false such edges will be silently ignored.
   *
   * Parameters:
   *
   * value - Boolean indicating if cloned invalid edges should be
   * inserted into the graph or ignored.
   */
  setCloneInvalidEdges(value: boolean): void {
    this.cloneInvalidEdges = value;
  }

  /**
   * Function: isCloneInvalidEdges
   *
   * Returns <cloneInvalidEdges> as a boolean.
   */
  isCloneInvalidEdges(): boolean {
    return this.cloneInvalidEdges;
  }

  /**
   * Function: setAllowLoops
   *
   * Specifies if loops are allowed.
   *
   * Parameters:
   *
   * value - Boolean indicating if loops are allowed.
   */
  setAllowLoops(value: boolean) {
    this.allowLoops = value;
  }

  /**
   * Function: isDisconnectOnMove
   *
   * Returns <disconnectOnMove> as a boolean.
   */
  isDisconnectOnMove(): boolean {
    return this.disconnectOnMove;
  }

  /**
   * Function: setDisconnectOnMove
   *
   * Specifies if edges should be disconnected when moved. (Note: Cloned
   * edges are always disconnected.)
   *
   * Parameters:
   *
   * value - Boolean indicating if edges should be disconnected
   * when moved.
   */
  setDisconnectOnMove(value: boolean): void {
    this.disconnectOnMove = value;
  }

  /**
   * Function: isDropEnabled
   *
   * Returns <dropEnabled> as a boolean.
   */
  isDropEnabled(): boolean {
    return this.dropEnabled;
  }

  /**
   * Function: setDropEnabled
   *
   * Specifies if the graph should allow dropping of cells onto or into other
   * cells.
   *
   * Parameters:
   *
   * dropEnabled - Boolean indicating if the graph should allow dropping
   * of cells into other cells.
   */
  setDropEnabled(value: boolean): void {
    this.dropEnabled = value;
  }

  /**
   * Function: isSplitEnabled
   *
   * Returns <splitEnabled> as a boolean.
   */
  isSplitEnabled(): boolean {
    return this.splitEnabled;
  }

  /**
   * Function: setSplitEnabled
   *
   * Specifies if the graph should allow dropping of cells onto or into other
   * cells.
   *
   * Parameters:
   *
   * dropEnabled - Boolean indicating if the graph should allow dropping
   * of cells into other cells.
   */
  setSplitEnabled(value: boolean): void {
    this.splitEnabled = value;
  }

  /**
   * Function: isCellResizable
   *
   * Returns true if the given cell is resizable. This returns
   * <cellsResizable> for all given cells if <isCellLocked> does not return
   * true for the given cell and its style does not specify
   * <mxConstants.STYLE_RESIZABLE> to be 0.
   *
   * Parameters:
   *
   * cell - <mxCell> whose resizable state should be returned.
   */
  isCellResizable(cell: mxCell): boolean {
    const style = this.getCurrentCellStyle(cell);

    const r =
      this.isCellsResizable() &&
      !this.isCellLocked(cell) &&
      mxUtils.getValue(style, mxConstants.STYLE_RESIZABLE, '1') != '0';
    // alert(r);
    return r;
  }

  /**
   * Function: isCellsResizable
   *
   * Returns <cellsResizable>.
   */
  isCellsResizable(): boolean {
    return this.cellsResizable;
  }

  /**
   * Function: setCellsResizable
   *
   * Specifies if the graph should allow resizing of cells. This
   * implementation updates <cellsResizable>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph should allow resizing of
   * cells.
   */
  setCellsResizable(value: boolean): void {
    this.cellsResizable = value;
  }

  /**
   * Function: isTerminalPointMovable
   *
   * Returns true if the given terminal point is movable. This is independent
   * from <isCellConnectable> and <isCellDisconnectable> and controls if terminal
   * points can be moved in the graph if the edge is not connected. Note that it
   * is required for this to return true to connect unconnected edges. This
   * implementation returns true.
   *
   * Parameters:
   *
   * cell - <mxCell> whose terminal point should be moved.
   * source - Boolean indicating if the source or target terminal should be moved.
   */
  isTerminalPointMovable(cell: mxCell,
                         source: boolean): boolean {
    return true;
  }

  /**
   * Function: isCellBendable
   *
   * Returns true if the given cell is bendable. This returns <cellsBendable>
   * for all given cells if <isLocked> does not return true for the given
   * cell and its style does not specify <mxConstants.STYLE_BENDABLE> to be 0.
   *
   * Parameters:
   *
   * cell - <mxCell> whose bendable state should be returned.
   */
  isCellBendable(cell: mxCell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return (
      this.isCellsBendable() &&
      !this.isCellLocked(cell) &&
      style[mxConstants.STYLE_BENDABLE] !== 0
    );
  }

  /**
   * Function: isCellsBendable
   *
   * Returns <cellsBenadable>.
   */
  isCellsBendable(): boolean {
    return this.cellsBendable;
  }

  /**
   * Function: setCellsBendable
   *
   * Specifies if the graph should allow bending of edges. This
   * implementation updates <bendable>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph should allow bending of
   * edges.
   */
  setCellsBendable(value: boolean) {
    this.cellsBendable = value;
  }

  /**
   * Function: isCellEditable
   *
   * Returns true if the given cell is editable. This returns <cellsEditable> for
   * all given cells if <isCellLocked> does not return true for the given cell
   * and its style does not specify <mxConstants.STYLE_EDITABLE> to be 0.
   *
   * Parameters:
   *
   * cell - <mxCell> whose editable state should be returned.
   */
  isCellEditable(cell: mxCell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return (
      this.isCellsEditable() &&
      !this.isCellLocked(cell) &&
      style[mxConstants.STYLE_EDITABLE] != 0
    );
  }

  /**
   * Function: isCellsEditable
   *
   * Returns <cellsEditable>.
   */
  isCellsEditable(): boolean {
    return this.cellsEditable;
  }

  /**
   * Function: setCellsEditable
   *
   * Specifies if the graph should allow in-place editing for cell labels.
   * This implementation updates <cellsEditable>.
   *
   * Parameters:
   *
   * value - Boolean indicating if the graph should allow in-place
   * editing.
   */
  setCellsEditable(value: boolean): void {
    this.cellsEditable = value;
  }

  /**
   * Function: isCellDisconnectable
   *
   * Returns true if the given cell is disconnectable from the source or
   * target terminal. This returns <isCellsDisconnectable> for all given
   * cells if <isCellLocked> does not return true for the given cell.
   *
   * Parameters:
   *
   * cell - <mxCell> whose disconnectable state should be returned.
   * terminal - <mxCell> that represents the source or target terminal.
   * source - Boolean indicating if the source or target terminal is to be
   * disconnected.
   */
  isCellDisconnectable(cell: mxCell,
                       terminal: mxCell | null=null,
                       source: boolean=false): boolean {
    return this.isCellsDisconnectable() && !this.isCellLocked(cell);
  }

  /**
   * Function: isCellsDisconnectable
   *
   * Returns <cellsDisconnectable>.
   */
  isCellsDisconnectable(): boolean {
    return this.cellsDisconnectable;
  }

  /**
   * Function: setCellsDisconnectable
   *
   * Sets <cellsDisconnectable>.
   */
  setCellsDisconnectable(value: boolean): void {
    this.cellsDisconnectable = value;
  }

  /**
   * Function: isValidSource
   *
   * Returns true if the given cell is a valid source for new connections.
   * This implementation returns true for all non-null values and is
   * called by is called by <isValidConnection>.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents a possible source or null.
   */
  isValidSource(cell: mxCell): boolean {
    return (
      (cell == null && this.allowDanglingEdges) ||
      (cell != null &&
        (!this.getModel().isEdge(cell) || this.connectableEdges) &&
        this.isCellConnectable(cell))
    );
  }

  /**
   * Function: isValidTarget
   *
   * Returns <isValidSource> for the given cell. This is called by
   * <isValidConnection>.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents a possible target or null.
   */
  isValidTarget(cell: mxCell): boolean {
    return this.isValidSource(cell);
  }

  /**
   * Function: isValidConnection
   *
   * Returns true if the given target cell is a valid target for source.
   * This is a boolean implementation for not allowing connections between
   * certain pairs of vertices and is called by <getEdgeValidationError>.
   * This implementation returns true if <isValidSource> returns true for
   * the source and <isValidTarget> returns true for the target.
   *
   * Parameters:
   *
   * source - <mxCell> that represents the source cell.
   * target - <mxCell> that represents the target cell.
   */
  isValidConnection(source: mxCell, target: mxCell): boolean {
    return this.isValidSource(source) && this.isValidTarget(target);
  }

  /**
   * Function: setConnectable
   *
   * Specifies if the graph should allow new connections. This implementation
   * updates <mxConnectionHandler.enabled> in <connectionHandler>.
   *
   * Parameters:
   *
   * connectable - Boolean indicating if new connections should be allowed.
   */
  setConnectable(connectable: boolean): void {
    (<mxConnectionHandler>this.connectionHandler).setEnabled(connectable);
  }

  /**
   * Function: isConnectable
   *
   * Returns true if the <connectionHandler> is enabled.
   */
  isConnectable(): boolean {
    return (<mxConnectionHandler>this.connectionHandler).isEnabled();
  }

  /**
   * Function: setTooltips
   *
   * Specifies if tooltips should be enabled. This implementation updates
   * <mxTooltipHandler.enabled> in <tooltipHandler>.
   *
   * Parameters:
   *
   * enabled - Boolean indicating if tooltips should be enabled.
   */
  setTooltips(enabled: boolean): void {
    (<mxTooltipHandler>this.tooltipHandler).setEnabled(enabled);
  }

  /**
   * Function: setPanning
   *
   * Specifies if panning should be enabled. This implementation updates
   * <mxPanningHandler.panningEnabled> in <panningHandler>.
   *
   * Parameters:
   *
   * enabled - Boolean indicating if panning should be enabled.
   */
  setPanning(enabled: boolean): void {
    (<mxPanningHandler>this.panningHandler).panningEnabled = enabled;
  }

  /**
   * Function: isEditing
   *
   * Returns true if the given cell is currently being edited.
   * If no cell is specified then this returns true if any
   * cell is currently being edited.
   *
   * Parameters:
   *
   * cell - <mxCell> that should be checked.
   */
  isEditing(cell: mxCell | null=null): boolean {
    if (this.cellEditor != null) {
      const editingCell = this.cellEditor.getEditingCell();
      return cell == null ? editingCell != null : cell === editingCell;
    }
    return false;
  }

  /**
   * Function: isAutoSizeCell
   *
   * Returns true if the size of the given cell should automatically be
   * updated after a change of the label. This implementation returns
   * <autoSizeCells> or checks if the cell style does specify
   * <mxConstants.STYLE_AUTOSIZE> to be 1.
   *
   * Parameters:
   *
   * cell - <mxCell> that should be resized.
   */
  isAutoSizeCell(cell: mxCell) {
    const style = this.getCurrentCellStyle(cell);

    return this.isAutoSizeCells() || style[mxConstants.STYLE_AUTOSIZE] == 1;
  }

  /**
   * Function: isAutoSizeCells
   *
   * Returns <autoSizeCells>.
   */
  isAutoSizeCells() {
    return this.autoSizeCells;
  }

  /**
   * Function: setAutoSizeCells
   *
   * Specifies if cell sizes should be automatically updated after a label
   * change. This implementation sets <autoSizeCells> to the given parameter.
   * To update the size of cells when the cells are added, set
   * <autoSizeCellsOnAdd> to true.
   *
   * Parameters:
   *
   * value - Boolean indicating if cells should be resized
   * automatically.
   */
  setAutoSizeCells(value: boolean) {
    this.autoSizeCells = value;
  }

  /**
   * Function: isExtendParent
   *
   * Returns true if the parent of the given cell should be extended if the
   * child has been resized so that it overlaps the parent. This
   * implementation returns <isExtendParents> if the cell is not an edge.
   *
   * Parameters:
   *
   * cell - <mxCell> that has been resized.
   */
  isExtendParent(cell: mxCell): boolean {
    return !this.getModel().isEdge(cell) && this.isExtendParents();
  }

  /**
   * Function: isExtendParents
   *
   * Returns <extendParents>.
   */
  isExtendParents(): boolean {
    return this.extendParents;
  }

  /**
   * Function: setExtendParents
   *
   * Sets <extendParents>.
   *
   * Parameters:
   *
   * value - New boolean value for <extendParents>.
   */
  setExtendParents(value: boolean) {
    this.extendParents = value;
  }

  /**
   * Function: isExtendParentsOnAdd
   *
   * Returns <extendParentsOnAdd>.
   */
  isExtendParentsOnAdd(cell: mxCell): boolean {
    return this.extendParentsOnAdd;
  }

  /**
   * Function: setExtendParentsOnAdd
   *
   * Sets <extendParentsOnAdd>.
   *
   * Parameters:
   *
   * value - New boolean value for <extendParentsOnAdd>.
   */
  setExtendParentsOnAdd(value: boolean) {
    this.extendParentsOnAdd = value;
  }

  /**
   * Function: isExtendParentsOnMove
   *
   * Returns <extendParentsOnMove>.
   */
  isExtendParentsOnMove(): boolean {
    return this.extendParentsOnMove;
  }

  /**
   * Function: setExtendParentsOnMove
   *
   * Sets <extendParentsOnMove>.
   *
   * Parameters:
   *
   * value - New boolean value for <extendParentsOnAdd>.
   */
  setExtendParentsOnMove(value: boolean) {
    this.extendParentsOnMove = value;
  }

  /**
   * Function: isRecursiveResize
   *
   * Returns <recursiveResize>.
   *
   * Parameters:
   *
   * state - <mxCellState> that is being resized.
   */
  isRecursiveResize(state: mxCellState | null=null): boolean {
    return this.recursiveResize;
  }

  /**
   * Function: setRecursiveResize
   *
   * Sets <recursiveResize>.
   *
   * Parameters:
   *
   * value - New boolean value for <recursiveResize>.
   */
  setRecursiveResize(value: boolean): void {
    this.recursiveResize = value;
  }

  /**
   * Function: isConstrainChild
   *
   * Returns true if the given cell should be kept inside the bounds of its
   * parent according to the rules defined by <getOverlap> and
   * <isAllowOverlapParent>. This implementation returns false for all children
   * of edges and <isConstrainChildren> otherwise.
   *
   * Parameters:
   *
   * cell - <mxCell> that should be constrained.
   */
  isConstrainChild(cell: mxCell): boolean {
    return (
      this.isConstrainChildren() &&
      !this.getModel().isEdge(this.getModel().getParent(cell))
    );
  }

  /**
   * Function: isConstrainChildren
   *
   * Returns <constrainChildren>.
   */
  isConstrainChildren(): boolean {
    return this.constrainChildren;
  }

  /**
   * Function: setConstrainChildren
   *
   * Sets <constrainChildren>.
   */
  setConstrainChildren(value: boolean) {
    this.constrainChildren = value;
  }

  /**
   * Function: isConstrainRelativeChildren
   *
   * Returns <constrainRelativeChildren>.
   */
  isConstrainRelativeChildren(): boolean {
    return this.constrainRelativeChildren;
  }

  /**
   * Function: setConstrainRelativeChildren
   *
   * Sets <constrainRelativeChildren>.
   */
  setConstrainRelativeChildren(value: boolean) {
    this.constrainRelativeChildren = value;
  }

  /**
   * Function: isConstrainChildren
   *
   * Returns <allowNegativeCoordinates>.
   */
  isAllowNegativeCoordinates(): boolean {
    return this.allowNegativeCoordinates;
  }

  /**
   * Function: setConstrainChildren
   *
   * Sets <allowNegativeCoordinates>.
   */
  setAllowNegativeCoordinates(value: boolean) {
    this.allowNegativeCoordinates = value;
  }

  /**
   * Function: getOverlap
   *
   * Returns a decimal number representing the amount of the width and height
   * of the given cell that is allowed to overlap its parent. A value of 0
   * means all children must stay inside the parent, 1 means the child is
   * allowed to be placed outside of the parent such that it touches one of
   * the parents sides. If <isAllowOverlapParent> returns false for the given
   * cell, then this method returns 0.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the overlap ratio should be returned.
   */
  getOverlap(cell: mxCell): number {
    return this.isAllowOverlapParent(cell) ? this.defaultOverlap : 0;
  }

  /**
   * Function: isAllowOverlapParent
   *
   * Returns true if the given cell is allowed to be placed outside of the
   * parents area.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the child to be checked.
   */
  isAllowOverlapParent(cell: mxCell): boolean {
    return false;
  }

  /**
   * Function: getFoldableCells
   *
   * Returns the cells which are movable in the given array of cells.
   */
  getFoldableCells(cells: mxCell[],
                   collapse: boolean=false): mxCell[] | null {
    return this.getModel().filterCells(
      cells, (cell: mxCell) => {
        return this.isCellFoldable(cell, collapse);
      }
    );
  }

  /**
   * Function: isCellFoldable
   *
   * Returns true if the given cell is foldable. This implementation
   * returns true if the cell has at least one child and its style
   * does not specify <mxConstants.STYLE_FOLDABLE> to be 0.
   *
   * Parameters:
   *
   * cell - <mxCell> whose foldable state should be returned.
   */
  isCellFoldable(cell: mxCell,
                 collapse: boolean=false): boolean {

    const style = this.getCurrentCellStyle(cell);
    return (
      this.getModel().getChildCount(cell) > 0 &&
      style[mxConstants.STYLE_FOLDABLE] != 0
    );
  }

  /**
   * Function: isValidDropTarget
   *
   * Returns true if the given cell is a valid drop target for the specified
   * cells. If <splitEnabled> is true then this returns <isSplitTarget> for
   * the given arguments else it returns true if the cell is not collapsed
   * and its child count is greater than 0.
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the possible drop target.
   * cells - <mxCells> that should be dropped into the target.
   * evt - Mouseevent that triggered the invocation.
   */
  isValidDropTarget(cell: mxCell,
                    cells: mxCell[],
                    evt: mxMouseEvent): boolean {

    return (
      cell != null &&
      ((this.isSplitEnabled() && this.isSplitTarget(cell, cells, evt)) ||
        (!this.getModel().isEdge(cell) &&
          (this.isSwimlane(cell) ||
            (this.getModel().getChildCount(cell) > 0 &&
              !this.isCellCollapsed(cell)))))
    );
  }

  /**
   * Function: isSplitTarget
   *
   * Returns true if the given edge may be splitted into two edges with the
   * given cell as a new terminal between the two.
   *
   * Parameters:
   *
   * target - <mxCell> that represents the edge to be splitted.
   * cells - <mxCells> that should split the edge.
   * evt - Mouseevent that triggered the invocation.
   */
  isSplitTarget(target: mxCell,
                cells: mxCell[],
                evt: mxMouseEvent): boolean {

    if (
      this.getModel().isEdge(target) &&
      cells != null &&
      cells.length == 1 &&
      this.isCellConnectable(cells[0]) &&
      this.getEdgeValidationError(
        target,
        this.getModel().getTerminal(target, true),
        cells[0]
      ) == null
    ) {
      const src = this.getModel().getTerminal(target, true);
      const trg = this.getModel().getTerminal(target, false);

      return (
        !this.getModel().isAncestor(cells[0], src) &&
        !this.getModel().isAncestor(cells[0], trg)
      );
    }
    return false;
  }

  /**
   * Function: getDropTarget
   *
   * Returns the given cell if it is a drop target for the given cells or the
   * nearest ancestor that may be used as a drop target for the given cells.
   * If the given array contains a swimlane and <swimlaneNesting> is false
   * then this always returns null. If no cell is given, then the bottommost
   * swimlane at the location of the given event is returned.
   *
   * This function should only be used if <isDropEnabled> returns true.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> which are to be dropped onto the target.
   * evt - Mouseevent for the drag and drop.
   * cell - <mxCell> that is under the mousepointer.
   * clone - Optional boolean to indicate of cells will be cloned.
   */
  getDropTarget(cells: mxCell[],
                evt: mxMouseEvent,
                cell: mxCell | null=null,
                clone: boolean=false): mxCell | null {

    if (!this.isSwimlaneNesting()) {
      for (let i = 0; i < cells.length; i += 1) {
        if (this.isSwimlane(cells[i])) {
          return null;
        }
      }
    }

    const pt = mxUtils.convertPoint(
      this.container,
      mxEvent.getClientX(evt),
      mxEvent.getClientY(evt)
    );
    pt.x -= this.panDx;
    pt.y -= this.panDy;
    const swimlane = this.getSwimlaneAt(pt.x, pt.y);

    if (cell == null) {
      cell = swimlane;
    } else if (swimlane != null) {
      // Checks if the cell is an ancestor of the swimlane
      // under the mouse and uses the swimlane in that case
      let tmp = this.getModel().getParent(swimlane);

      while (tmp != null && this.isSwimlane(tmp) && tmp != cell) {
        tmp = this.getModel().getParent(tmp);
      }

      if (tmp == cell) {
        cell = swimlane;
      }
    }

    while (
      cell != null &&
      !this.isValidDropTarget(cell, cells, evt) &&
      !this.getModel().isLayer(cell)
    ) {
      cell = this.getModel().getParent(cell);
    }

    // Checks if parent is dropped into child if not cloning
    if (!clone) {
      let parent = cell;
      while (parent != null && mxUtils.indexOf(cells, parent) < 0) {
        parent = this.getModel().getParent(parent);
      }
    }

    return !this.getModel().isLayer(cell) && parent == null ? cell : null;
  }

  /**
   * Group: Cell retrieval
   */

  /**
   * Function: getDefaultParent
   *
   * Returns <defaultParent> or <mxGraphView.currentRoot> or the first child
   * child of <mxGraphModel.root> if both are null. The value returned by
   * this function should be used as the parent for new cells (aka default
   * layer).
   */
  getDefaultParent(): mxCell {
    let parent = this.getCurrentRoot();

    if (parent == null) {
      parent = this.defaultParent;

      if (parent == null) {
        const root = this.getModel().getRoot();
        parent = this.getModel().getChildAt(root, 0);
      }
    }
    return <mxCell>parent;
  }

  /**
   * Function: setDefaultParent
   *
   * Sets the <defaultParent> to the given cell. Set this to null to return
   * the first child of the root in getDefaultParent.
   */
  setDefaultParent(cell: mxCell | null): void {
    this.defaultParent = cell;
  }

  /**
   * Function: getSwimlane
   *
   * Returns the nearest ancestor of the given cell which is a swimlane, or
   * the given cell, if it is itself a swimlane.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the ancestor swimlane should be returned.
   */
  getSwimlane(cell: mxCell | null=null): mxCell | null {
    while (cell != null && !this.isSwimlane(cell)) {
      cell = <mxCell>this.getModel().getParent(cell);
    }
    return cell;
  }

  /**
   * Function: getSwimlaneAt
   *
   * Returns the bottom-most swimlane that intersects the given point (x, y)
   * in the cell hierarchy that starts at the given parent.
   *
   * Parameters:
   *
   * x - X-coordinate of the location to be checked.
   * y - Y-coordinate of the location to be checked.
   * parent - <mxCell> that should be used as the root of the recursion.
   * Default is <defaultParent>.
   */
  getSwimlaneAt(x: number,
                y: number,
                parent: mxCell=this.getDefaultParent()): mxCell | null {

    if (parent == null) {
      parent = <mxCell>this.getCurrentRoot();

      if (parent == null) {
        parent = <mxCell>this.getModel().getRoot();
      }
    }

    if (parent != null) {
      const childCount = this.getModel().getChildCount(parent);

      for (let i = 0; i < childCount; i += 1) {
        const child = this.getModel().getChildAt(parent, i);

        if (child != null) {
          const result = this.getSwimlaneAt(x, y, child);

          if (result != null) {
            return result;
          }
          if (this.isCellVisible(child) && this.isSwimlane(child)) {
            const state = this.getView().getState(child);

            if (this.intersects(state, x, y)) {
              return child;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Function: getCellAt
   *
   * Returns the bottom-most cell that intersects the given point (x, y) in
   * the cell hierarchy starting at the given parent. This will also return
   * swimlanes if the given location intersects the content area of the
   * swimlane. If this is not desired, then the <hitsSwimlaneContent> may be
   * used if the returned cell is a swimlane to determine if the location
   * is inside the content area or on the actual title of the swimlane.
   *
   * Parameters:
   *
   * x - X-coordinate of the location to be checked.
   * y - Y-coordinate of the location to be checked.
   * parent - <mxCell> that should be used as the root of the recursion.
   * Default is current root of the view or the root of the model.
   * vertices - Optional boolean indicating if vertices should be returned.
   * Default is true.
   * edges - Optional boolean indicating if edges should be returned. Default
   * is true.
   * ignoreFn - Optional function that returns true if cell should be ignored.
   * The function is passed the cell state and the x and y parameter.
   */
  getCellAt(x: number,
            y: number,
            parent: mxCell | null=null,
            vertices: boolean=true,
            edges: boolean=true,
            ignoreFn: Function | null=null): mxCell | null {

    if (parent == null) {
      parent = <mxCell>this.getCurrentRoot();

      if (parent == null) {
        parent = <mxCell>this.getModel().getRoot();
      }
    }

    if (parent != null) {
      const childCount = this.getModel().getChildCount(parent);

      for (let i = childCount - 1; i >= 0; i--) {
        const cell = <mxCell>this.getModel().getChildAt(parent, i);
        const result = this.getCellAt(x, y, cell, vertices, edges, ignoreFn);

        if (result != null) {
          return result;
        }
        if (
          this.isCellVisible(cell) &&
          ((edges && this.getModel().isEdge(cell)) ||
            (vertices && this.getModel().isVertex(cell)))
        ) {
          const state = this.getView().getState(cell);

          if (
            state != null &&
            (ignoreFn == null || !ignoreFn(state, x, y)) &&
            this.intersects(state, x, y)
          ) {
            return cell;
          }
        }
      }
    }
    return null;
  }

  /**
   * Function: intersects
   *
   * Returns the bottom-most cell that intersects the given point (x, y) in
   * the cell hierarchy that starts at the given parent.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the cell state.
   * x - X-coordinate of the location to be checked.
   * y - Y-coordinate of the location to be checked.
   */
  intersects(state: mxCellState | null=null,
             x: number,
             y: number): boolean {

    if (state != null) {
      const pts = <mxPoint[]>state.absolutePoints;

      if (pts != null) {
        const t2 = this.tolerance * this.tolerance;
        let pt = pts[0];

        for (let i = 1; i < pts.length; i += 1) {
          const next = pts[i];
          const dist = mxUtils.ptSegDistSq(pt.x, pt.y, next.x, next.y, x, y);

          if (dist <= t2) {
            return true;
          }

          pt = next;
        }
      } else {
        const alpha = mxUtils.toRadians(
          mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0
        );

        if (alpha != 0) {
          const cos = Math.cos(-alpha);
          const sin = Math.sin(-alpha);
          const cx = new mxPoint(state.getCenterX(), state.getCenterY());
          const pt = mxUtils.getRotatedPoint(new mxPoint(x, y), cos, sin, cx);
          x = pt.x;
          y = pt.y;
        }

        if (mxUtils.contains(state, x, y)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Function: hitsSwimlaneContent
   *
   * Returns true if the given coordinate pair is inside the content
   * are of the given swimlane.
   *
   * Parameters:
   *
   * swimlane - <mxCell> that specifies the swimlane.
   * x - X-coordinate of the mouse event.
   * y - Y-coordinate of the mouse event.
   */
  hitsSwimlaneContent(swimlane: mxCell,
                      x: number,
                      y: number): boolean {

    const state = this.getView().getState(swimlane);
    const size = this.getStartSize(swimlane);

    if (state != null) {
      const scale = this.getView().getScale();
      x -= state.x;
      y -= state.y;

      if (size.width > 0 && x > 0 && x > size.width * scale) {
        return true;
      }
      if (size.height > 0 && y > 0 && y > size.height * scale) {
        return true;
      }
    }
    return false;
  }

  /**
   * Function: getChildVertices
   *
   * Returns the visible child vertices of the given parent.
   *
   * Parameters:
   *
   * parent - <mxCell> whose children should be returned.
   */
  getChildVertices(parent: mxCell): (mxCell | null)[] {
    return this.getChildCells(parent, true, false);
  }

  /**
   * Function: getChildEdges
   *
   * Returns the visible child edges of the given parent.
   *
   * Parameters:
   *
   * parent - <mxCell> whose child vertices should be returned.
   */
  getChildEdges(parent: mxCell): (mxCell | null)[] {
    return this.getChildCells(parent, false, true);
  }

  /**
   * Function: getChildCells
   *
   * Returns the visible child vertices or edges in the given parent. If
   * vertices and edges is false, then all children are returned.
   *
   * Parameters:
   *
   * parent - <mxCell> whose children should be returned.
   * vertices - Optional boolean that specifies if child vertices should
   * be returned. Default is false.
   * edges - Optional boolean that specifies if child edges should
   * be returned. Default is false.
   */
  getChildCells(parent: mxCell | null=this.getDefaultParent(),
                vertices: boolean=false,
                edges: boolean=false): (mxCell | null)[] {

    const cells = this.getModel().getChildCells(parent, vertices, edges);
    const result = [];

    // Filters out the non-visible child cells
    for (let i = 0; i < cells.length; i += 1) {
      if (this.isCellVisible(<mxCell>cells[i])) {
        result.push(cells[i]);
      }
    }
    return result;
  }

  /**
   * Function: getConnections
   *
   * Returns all visible edges connected to the given cell without loops.
   *
   * Parameters:
   *
   * cell - <mxCell> whose connections should be returned.
   * parent - Optional parent of the opposite end for a connection to be
   * returned.
   */
  getConnections(cell: mxCell,
                 parent: mxCell | null=null): mxCell[] {
    return this.getEdges(cell, parent, true, true, false);
  }

  /**
   * Function: getIncomingEdges
   *
   * Returns the visible incoming edges for the given cell. If the optional
   * parent argument is specified, then only child edges of the given parent
   * are returned.
   *
   * Parameters:
   *
   * cell - <mxCell> whose incoming edges should be returned.
   * parent - Optional parent of the opposite end for an edge to be
   * returned.
   */
  getIncomingEdges(cell: mxCell,
                   parent: mxCell | null=null): mxCell[] {
    return this.getEdges(cell, parent, true, false, false);
  }

  /**
   * Function: getOutgoingEdges
   *
   * Returns the visible outgoing edges for the given cell. If the optional
   * parent argument is specified, then only child edges of the given parent
   * are returned.
   *
   * Parameters:
   *
   * cell - <mxCell> whose outgoing edges should be returned.
   * parent - Optional parent of the opposite end for an edge to be
   * returned.
   */
  getOutgoingEdges(cell: mxCell,
                   parent: mxCell | null=null): mxCell[] {
    return this.getEdges(cell, parent, false, true, false);
  }

  /**
   * Function: getEdges
   *
   * Returns the incoming and/or outgoing edges for the given cell.
   * If the optional parent argument is specified, then only edges are returned
   * where the opposite is in the given parent cell. If at least one of incoming
   * or outgoing is true, then loops are ignored, if both are false, then all
   * edges connected to the given cell are returned including loops.
   *
   * Parameters:
   *
   * cell - <mxCell> whose edges should be returned.
   * parent - Optional parent of the opposite end for an edge to be
   * returned.
   * incoming - Optional boolean that specifies if incoming edges should
   * be included in the result. Default is true.
   * outgoing - Optional boolean that specifies if outgoing edges should
   * be included in the result. Default is true.
   * includeLoops - Optional boolean that specifies if loops should be
   * included in the result. Default is true.
   * recurse - Optional boolean the specifies if the parent specified only
   * need be an ancestral parent, true, or the direct parent, false.
   * Default is false
   */
  getEdges(cell: mxCell,
           parent: mxCell | null=null,
           incoming: boolean=true,
           outgoing: boolean=true,
           includeLoops: boolean=true,
           recurse: boolean=false): mxCell[] {

    let edges: mxCell[] = [];
    const isCollapsed = this.isCellCollapsed(cell);
    const childCount = this.getModel().getChildCount(cell);

    for (let i = 0; i < childCount; i += 1) {
      const child = this.getModel().getChildAt(cell, i);

      if (isCollapsed || !this.isCellVisible(<mxCell>child)) {
        edges = edges.concat(<mxCell[]>this.getModel().getEdges(<mxCell>child, incoming, outgoing));
      }
    }

    edges = edges.concat(<mxCell[]>this.getModel().getEdges(cell, incoming, outgoing));
    const result = [];

    for (let i = 0; i < edges.length; i += 1) {
      const state = this.getView().getState(edges[i]);

      const source =
        state != null
          ? state.getVisibleTerminal(true)
          : this.getView().getVisibleTerminal(edges[i], true);
      const target =
        state != null
          ? state.getVisibleTerminal(false)
          : this.getView().getVisibleTerminal(edges[i], false);

      if (
        (includeLoops && source == target) ||
        (source != target &&
          ((incoming &&
            target == cell &&
            (parent == null ||
              this.isValidAncestor(<mxCell>source, parent, recurse))) ||
            (outgoing &&
              source == cell &&
              (parent == null ||
                this.isValidAncestor(<mxCell>target, parent, recurse)))))
      ) {
        result.push(edges[i]);
      }
    }
    return result;
  }

  /**
   * Function: isValidAncestor
   *
   * Returns whether or not the specified parent is a valid
   * ancestor of the specified cell, either direct or indirectly
   * based on whether ancestor recursion is enabled.
   *
   * Parameters:
   *
   * cell - <mxCell> the possible child cell
   * parent - <mxCell> the possible parent cell
   * recurse - boolean whether or not to recurse the child ancestors
   */
  isValidAncestor(cell: mxCell,
                  parent: mxCell,
                  recurse: boolean=false): boolean {

    return recurse
      ? this.getModel().isAncestor(parent, cell)
      : this.getModel().getParent(cell) == parent;
  }

  /**
   * Function: getOpposites
   *
   * Returns all distinct visible opposite cells for the specified terminal
   * on the given edges.
   *
   * Parameters:
   *
   * edges - Array of <mxCells> that contains the edges whose opposite
   * terminals should be returned.
   * terminal - Terminal that specifies the end whose opposite should be
   * returned.
   * sources - Optional boolean that specifies if source terminals should be
   * included in the result. Default is true.
   * targets - Optional boolean that specifies if targer terminals should be
   * included in the result. Default is true.
   */
  getOpposites(edges: mxCell[],
               terminal: mxCell | null=null,
               sources: boolean=true,
               targets: boolean=true): mxCell[] {

    const terminals = [];

    // Fast lookup to avoid duplicates in terminals array
    const dict = new mxDictionary();

    if (edges != null) {
      for (let i = 0; i < edges.length; i += 1) {
        const state = this.getView().getState(edges[i]);

        const source =
          state != null
            ? state.getVisibleTerminal(true)
            : this.getView().getVisibleTerminal(edges[i], true);
        const target =
          state != null
            ? state.getVisibleTerminal(false)
            : this.getView().getVisibleTerminal(edges[i], false);

        // Checks if the terminal is the source of the edge and if the
        // target should be stored in the result
        if (
          source == terminal &&
          target != null &&
          target != terminal &&
          targets
        ) {
          if (!dict.get(target)) {
            dict.put(target, true);
            terminals.push(target);
          }
        }

        // Checks if the terminal is the taget of the edge and if the
        // source should be stored in the result
        else if (
          target == terminal &&
          source != null &&
          source != terminal &&
          sources
        ) {
          if (!dict.get(source)) {
            dict.put(source, true);
            terminals.push(source);
          }
        }
      }
    }
    return terminals;
  }

  /**
   * Function: getEdgesBetween
   *
   * Returns the edges between the given source and target. This takes into
   * account collapsed and invisible cells and returns the connected edges
   * as displayed on the screen.
   *
   * Parameters:
   *
   * source -
   * target -
   * directed -
   */
  getEdgesBetween(source: mxCell,
                  target: mxCell,
                  directed: boolean=false) {

    const edges = this.getEdges(source);
    const result = [];

    // Checks if the edge is connected to the correct
    // cell and returns the first match
    for (let i = 0; i < edges.length; i += 1) {
      const state = this.getView().getState(edges[i]);

      const src =
        state != null
          ? state.getVisibleTerminal(true)
          : this.getView().getVisibleTerminal(edges[i], true);
      const trg =
        state != null
          ? state.getVisibleTerminal(false)
          : this.getView().getVisibleTerminal(edges[i], false);

      if (
        (src == source && trg == target) ||
        (!directed && src == target && trg == source)
      ) {
        result.push(edges[i]);
      }
    }
    return result;
  }

  /**
   * Function: getPointForEvent
   *
   * Returns an <mxPoint> representing the given event in the unscaled,
   * non-translated coordinate space of <container> and applies the grid.
   *
   * Parameters:
   *
   * evt - Mousevent that contains the mouse pointer location.
   * addOffset - Optional boolean that specifies if the position should be
   * offset by half of the <gridSize>. Default is true.
   */
  getPointForEvent(evt: mxMouseEvent,
                   addOffset: boolean=true) {

    const p = mxUtils.convertPoint(
      this.container,
      mxEvent.getClientX(evt),
      mxEvent.getClientY(evt)
    );

    const s = this.getView().scale;
    const tr = this.getView().translate;
    const off = addOffset ? this.gridSize / 2 : 0;

    p.x = this.snap(p.x / s - tr.x - off);
    p.y = this.snap(p.y / s - tr.y - off);
    return p;
  }

  /**
   * Function: getCells
   *
   * Returns the child vertices and edges of the given parent that are contained
   * in the given rectangle. The result is added to the optional result array,
   * which is returned. If no result array is specified then a new array is
   * created and returned.
   *
   * Parameters:
   *
   * x - X-coordinate of the rectangle.
   * y - Y-coordinate of the rectangle.
   * width - Width of the rectangle.
   * height - Height of the rectangle.
   * parent - <mxCell> that should be used as the root of the recursion.
   * Default is current root of the view or the root of the model.
   * result - Optional array to store the result in.
   * intersection - Optional <mxRectangle> to check vertices for intersection.
   * ignoreFn - Optional function to check if a cell state is ignored.
   * includeDescendants - Optional boolean flag to add descendants to the result.
   * Default is false.
   */
  getCells(x: number,
           y: number,
           width: number,
           height: number,
           parent: mxCell | null=null,
           result: mxCell[]=[],
           intersection: mxRectangle | null=null,
           ignoreFn: Function | null=null,
           includeDescendants: boolean=false): mxCell[] {

    if (width > 0 || height > 0 || intersection != null) {
      const model = this.getModel();
      const right = x + width;
      const bottom = y + height;

      if (parent == null) {
        parent = this.getCurrentRoot();

        if (parent == null) {
          parent = model.getRoot();
        }
      }

      if (parent != null) {
        const childCount = model.getChildCount(parent);

        for (let i = 0; i < childCount; i += 1) {
          const cell = <mxCell>model.getChildAt(parent, i);
          const state: mxCellState = <mxCellState>this.getView().getState(cell);

          if (
            state != null &&
            this.isCellVisible(cell) &&
            (ignoreFn == null || !ignoreFn(state))
          ) {
            const deg =
              mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0;

            let box: mxCellState | mxRectangle = state; // TODO: CHECK ME!!!! ==========================================================
            if (deg != 0) {
              box = <mxRectangle>mxUtils.getBoundingBox(box, deg);
            }

            const hit =
              (intersection != null &&
                model.isVertex(cell) &&
                mxUtils.intersects(intersection, box)) ||
              (intersection == null &&
                (model.isEdge(cell) || model.isVertex(cell)) &&
                box.x >= x &&
                box.y + box.height <= bottom &&
                box.y >= y &&
                box.x + box.width <= right);

            if (hit) {
              result.push(cell);
            }

            if (!hit || includeDescendants) {
              this.getCells(
                x,
                y,
                width,
                height,
                cell,
                result,
                intersection,
                ignoreFn,
                includeDescendants
              );
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Function: getCellsBeyond
   *
   * Returns the children of the given parent that are contained in the
   * halfpane from the given point (x0, y0) rightwards or downwards
   * depending on rightHalfpane and bottomHalfpane.
   *
   * Parameters:
   *
   * x0 - X-coordinate of the origin.
   * y0 - Y-coordinate of the origin.
   * parent - Optional <mxCell> whose children should be checked. Default is
   * <defaultParent>.
   * rightHalfpane - Boolean indicating if the cells in the right halfpane
   * from the origin should be returned.
   * bottomHalfpane - Boolean indicating if the cells in the bottom halfpane
   * from the origin should be returned.
   */
  getCellsBeyond(x0: number,
                 y0: number,
                 parent: mxCell | null=null,
                 rightHalfpane: boolean=false,
                 bottomHalfpane: boolean=false) {

    const result = [];

    if (rightHalfpane || bottomHalfpane) {
      if (parent == null) {
        parent = <mxCell>this.getDefaultParent();
      }

      if (parent != null) {
        const childCount = this.getModel().getChildCount(parent);

        for (let i = 0; i < childCount; i += 1) {
          const child = <mxCell>this.getModel().getChildAt(parent, i);
          const state = this.getView().getState(child);

          if (this.isCellVisible(child) && state != null) {
            if (
              (!rightHalfpane || state.x >= x0) &&
              (!bottomHalfpane || state.y >= y0)
            ) {
              result.push(child);
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Group: Tree and traversal-related
   */

  /**
   * Function: findTreeRoots
   *
   * Returns all children in the given parent which do not have incoming
   * edges. If the result is empty then the with the greatest difference
   * between incoming and outgoing edges is returned.
   *
   * Parameters:
   *
   * parent - <mxCell> whose children should be checked.
   * isolate - Optional boolean that specifies if edges should be ignored if
   * the opposite end is not a child of the given parent cell. Default is
   * false.
   * invert - Optional boolean that specifies if outgoing or incoming edges
   * should be counted for a tree root. If false then outgoing edges will be
   * counted. Default is false.
   */
  findTreeRoots(parent: mxCell,
                isolate: boolean=false,
                invert: boolean=false): mxCell[] {

    const roots: mxCell[] = [];

    if (parent != null) {
      const model = this.getModel();
      const childCount = model.getChildCount(parent);
      let best = null;
      let maxDiff = 0;

      for (let i = 0; i < childCount; i += 1) {
        const cell = <mxCell>model.getChildAt(parent, i);

        if (this.getModel().isVertex(cell) && this.isCellVisible(cell)) {
          const conns = this.getConnections(cell, isolate ? parent : null);
          let fanOut = 0;
          let fanIn = 0;

          for (let j = 0; j < conns.length; j++) {
            const src = this.getView().getVisibleTerminal(conns[j], true);

            if (src == cell) {
              fanOut++;
            } else {
              fanIn++;
            }
          }

          if (
            (invert && fanOut == 0 && fanIn > 0) ||
            (!invert && fanIn == 0 && fanOut > 0)
          ) {
            roots.push(cell);
          }

          const diff = invert ? fanIn - fanOut : fanOut - fanIn;

          if (diff > maxDiff) {
            maxDiff = diff;
            best = cell;
          }
        }
      }

      if (roots.length == 0 && best != null) {
        roots.push(best);
      }
    }
    return roots;
  }

  /**
   * Function: traverse
   *
   * Traverses the (directed) graph invoking the given function for each
   * visited vertex and edge. The function is invoked with the current vertex
   * and the incoming edge as a parameter. This implementation makes sure
   * each vertex is only visited once. The function may return false if the
   * traversal should stop at the given vertex.
   *
   * Example:
   *
   * (code)
   * mxLog.show();
   * let cell = graph.getSelectionCell();
   * graph.traverse(cell, false, (vertex, edge)=>
   * {
   *   mxLog.debug(graph.getLabel(vertex));
   * });
   * (end)
   *
   * Parameters:
   *
   * vertex - <mxCell> that represents the vertex where the traversal starts.
   * directed - Optional boolean indicating if edges should only be traversed
   * from source to target. Default is true.
   * func - Visitor function that takes the current vertex and the incoming
   * edge as arguments. The traversal stops if the function returns false.
   * edge - Optional <mxCell> that represents the incoming edge. This is
   * null for the first step of the traversal.
   * visited - Optional <mxDictionary> from cells to true for the visited cells.
   * inverse - Optional boolean to traverse in inverse direction. Default is false.
   * This is ignored if directed is false.
   */
  traverse(vertex: mxCell | null=null,
           directed: boolean=true,
           func: Function | null=null,
           edge: mxCell | null=null,
           visited: mxDictionary | null=null,
           inverse: boolean=false): void {

    if (func != null && vertex != null) {
      directed = directed != null ? directed : true;
      inverse = inverse != null ? inverse : false;
      visited = visited || new mxDictionary();

      if (!visited.get(vertex)) {
        visited.put(vertex, true);
        const result = func(vertex, edge);

        if (result == null || result) {
          const edgeCount = this.getModel().getEdgeCount(vertex);

          if (edgeCount > 0) {
            for (let i = 0; i < edgeCount; i += 1) {
              const e = this.getModel().getEdgeAt(vertex, i);
              const isSource = this.getModel().getTerminal(e, true) == vertex;

              if (!directed || !inverse == isSource) {
                const next = this.getModel().getTerminal(e, !isSource);
                this.traverse(next, directed, func, e, visited, inverse);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Group: Selection
   */

  /**
   * Function: isCellSelected
   *
   * Returns true if the given cell is selected.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the selection state should be returned.
   */
  isCellSelected(cell: mxCell): boolean {
    return this.getSelectionModel().isSelected(cell);
  }

  /**
   * Function: isSelectionEmpty
   *
   * Returns true if the selection is empty.
   */
  isSelectionEmpty(): boolean {
    return this.getSelectionModel().isEmpty();
  }

  /**
   * Function: clearSelection
   *
   * Clears the selection using <mxGraphSelectionModel.clear>.
   */
  clearSelection(): void {
    return this.getSelectionModel().clear();
  }

  /**
   * Function: getSelectionCount
   *
   * Returns the number of selected cells.
   */
  getSelectionCount(): number {
    return this.getSelectionModel().cells.length;
  }

  /**
   * Function: getSelectionCell
   *
   * Returns the first cell from the array of selected <mxCells>.
   */
  getSelectionCell(): mxCell {
    return this.getSelectionModel().cells[0];
  }

  /**
   * Function: getSelectionCells
   *
   * Returns the array of selected <mxCells>.
   */
  getSelectionCells(): mxCell[] {
    return this.getSelectionModel().cells.slice();
  }

  /**
   * Function: setSelectionCell
   *
   * Sets the selection cell.
   *
   * Parameters:
   *
   * cell - <mxCell> to be selected.
   */
  setSelectionCell(cell: mxCell | null): void {
    this.getSelectionModel().setCell(cell);
  }

  /**
   * Function: setSelectionCells
   *
   * Sets the selection cell.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be selected.
   */
  setSelectionCells(cells: mxCell[]): void {
    this.getSelectionModel().setCells(cells);
  }

  /**
   * Function: addSelectionCell
   *
   * Adds the given cell to the selection.
   *
   * Parameters:
   *
   * cell - <mxCell> to be add to the selection.
   */
  addSelectionCell(cell: mxCell): void {
    this.getSelectionModel().addCell(cell);
  }

  /**
   * Function: addSelectionCells
   *
   * Adds the given cells to the selection.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be added to the selection.
   */
  addSelectionCells(cells: mxCell[]): void {
    this.getSelectionModel().addCells(cells);
  }

  /**
   * Function: removeSelectionCell
   *
   * Removes the given cell from the selection.
   *
   * Parameters:
   *
   * cell - <mxCell> to be removed from the selection.
   */
  removeSelectionCell(cell: mxCell): void {
    this.getSelectionModel().removeCell(cell);
  }

  /**
   * Function: removeSelectionCells
   *
   * Removes the given cells from the selection.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be removed from the selection.
   */
  removeSelectionCells(cells: mxCell[]): void {
    this.getSelectionModel().removeCells(cells);
  }

  /**
   * Function: selectRegion
   *
   * Selects and returns the cells inside the given rectangle for the
   * specified event.
   *
   * Parameters:
   *
   * rect - <mxRectangle> that represents the region to be selected.
   * evt - Mouseevent that triggered the selection.
   */
  selectRegion(rect: mxRectangle,
               evt: mxMouseEvent): mxCell[] | null {
    const cells = this.getCells(rect.x, rect.y, rect.width, rect.height);
    this.selectCellsForEvent(cells, evt);
    return cells;
  }

  /**
   * Function: selectNextCell
   *
   * Selects the next cell.
   */
  selectNextCell(): void {
    this.selectCell(true);
  }

  /**
   * Function: selectPreviousCell
   *
   * Selects the previous cell.
   */
  selectPreviousCell(): void {
    this.selectCell();
  }

  /**
   * Function: selectParentCell
   *
   * Selects the parent cell.
   */
  selectParentCell(): void {
    this.selectCell(false, true);
  }

  /**
   * Function: selectChildCell
   *
   * Selects the first child cell.
   */
  selectChildCell(): void {
    this.selectCell(false, false, true);
  }

  /**
   * Function: selectCell
   *
   * Selects the next, parent, first child or previous cell, if all arguments
   * are false.
   *
   * Parameters:
   *
   * isNext - Boolean indicating if the next cell should be selected.
   * isParent - Boolean indicating if the parent cell should be selected.
   * isChild - Boolean indicating if the first child cell should be selected.
   */
  selectCell(isNext: boolean=false,
             isParent: boolean=false,
             isChild: boolean=false): void {

    const sel = <mxGraphSelectionModel>this.selectionModel;
    const cell = sel.cells.length > 0 ? sel.cells[0] : null;

    if (sel.cells.length > 1) {
      sel.clear();
    }

    const parent =
      cell != null ? this.getModel().getParent(cell) : this.getDefaultParent();

    const childCount = this.getModel().getChildCount(parent);

    if (cell == null && childCount > 0) {
      const child = this.getModel().getChildAt(parent, 0);
      this.setSelectionCell(child);
    } else if (
      (cell == null || isParent) &&
      this.getView().getState(parent) != null &&
      this.getModel().getGeometry(parent) != null
    ) {
      if (this.getCurrentRoot() != parent) {
        this.setSelectionCell(parent);
      }
    } else if (cell != null && isChild) {
      const tmp = this.getModel().getChildCount(cell);

      if (tmp > 0) {
        const child = this.getModel().getChildAt(cell, 0);
        this.setSelectionCell(child);
      }
    } else if (childCount > 0) {
      let i = (<mxCell>parent).getIndex(cell);

      if (isNext) {
        i++;
        const child = this.getModel().getChildAt(parent, i % childCount);
        this.setSelectionCell(child);
      } else {
        i--;
        const index = i < 0 ? childCount - 1 : i;
        const child = this.getModel().getChildAt(parent, index);
        this.setSelectionCell(child);
      }
    }
  }

  /**
   * Function: selectAll
   *
   * Selects all children of the given parent cell or the children of the
   * default parent if no parent is specified. To select leaf vertices and/or
   * edges use <selectCells>.
   *
   * Parameters:
   *
   * parent - Optional <mxCell> whose children should be selected.
   * Default is <defaultParent>.
   * descendants - Optional boolean specifying whether all descendants should be
   * selected. Default is false.
   */
  selectAll(parent: mxCell=this.getDefaultParent(),
            descendants: boolean=false): void {

    const cells = descendants
      ? this.getModel().filterDescendants(
          (cell: mxCell) => {
            return cell != parent && this.getView().getState(cell) != null;
          },
          parent
        )
      : this.getModel().getChildren(parent);

    if (cells != null) {
      this.setSelectionCells(cells);
    }
  }

  /**
   * Function: selectVertices
   *
   * Select all vertices inside the given parent or the default parent.
   */
  selectVertices(parent: mxCell,
                 selectGroups: boolean=false): void {
    this.selectCells(true, false, parent, selectGroups);
  }

  /**
   * Function: selectVertices
   *
   * Select all vertices inside the given parent or the default parent.
   */
  selectEdges(parent: mxCell): void {
    this.selectCells(false, true, parent);
  }

  /**
   * Function: selectCells
   *
   * Selects all vertices and/or edges depending on the given boolean
   * arguments recursively, starting at the given parent or the default
   * parent if no parent is specified. Use <selectAll> to select all cells.
   * For vertices, only cells with no children are selected.
   *
   * Parameters:
   *
   * vertices - Boolean indicating if vertices should be selected.
   * edges - Boolean indicating if edges should be selected.
   * parent - Optional <mxCell> that acts as the root of the recursion.
   * Default is <defaultParent>.
   * selectGroups - Optional boolean that specifies if groups should be
   * selected. Default is false.
   */
  selectCells(vertices: boolean=false,
              edges: boolean=false,
              parent: mxCell=this.getDefaultParent(),
              selectGroups: boolean=false): void {

    const filter = (cell: mxCell) => {
      return (
        this.getView().getState(cell) != null &&
        (((selectGroups || this.getModel().getChildCount(cell) == 0) &&
          this.getModel().isVertex(cell) &&
          vertices &&
          !this.getModel().isEdge(this.getModel().getParent(cell))) ||
          (this.getModel().isEdge(cell) && edges))
      );
    };

    const cells = this.getModel().filterDescendants(filter, parent);
    if (cells != null) {
      this.setSelectionCells(cells);
    }
  }

  /**
   * Function: selectCellForEvent
   *
   * Selects the given cell by either adding it to the selection or
   * replacing the selection depending on whether the given mouse event is a
   * toggle event.
   *
   * Parameters:
   *
   * cell - <mxCell> to be selected.
   * evt - Optional mouseevent that triggered the selection.
   */
  selectCellForEvent(cell: mxCell,
                     evt: mxMouseEvent): void {
    const isSelected = this.isCellSelected(cell);

    if (this.isToggleEvent(evt)) {
      if (isSelected) {
        this.removeSelectionCell(cell);
      } else {
        this.addSelectionCell(cell);
      }
    } else if (!isSelected || this.getSelectionCount() != 1) {
      this.setSelectionCell(cell);
    }
  }

  /**
   * Function: selectCellsForEvent
   *
   * Selects the given cells by either adding them to the selection or
   * replacing the selection depending on whether the given mouse event is a
   * toggle event.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be selected.
   * evt - Optional mouseevent that triggered the selection.
   */
  selectCellsForEvent(cells: mxCell[],
                      evt: mxMouseEvent) {
    if (this.isToggleEvent(evt)) {
      this.addSelectionCells(cells);
    } else {
      this.setSelectionCells(cells);
    }
  }

  /**
   * Group: Selection state
   */

  /**
   * Function: createHandler
   *
   * Creates a new handler for the given cell state. This implementation
   * returns a new <mxEdgeHandler> of the corresponding cell is an edge,
   * otherwise it returns an <mxVertexHandler>.
   *
   * Parameters:
   *
   * state - <mxCellState> whose handler should be created.
   */
  createHandler(state: mxCellState | null=null): mxEdgeHandler | mxVertexHandler | null {
    let result: mxEdgeHandler | mxVertexHandler | null = null;

    if (state != null) {
      if (this.getModel().isEdge(state.cell)) {
        const source = state.getVisibleTerminalState(true);
        const target = state.getVisibleTerminalState(false);
        const geo = this.getCellGeometry(<mxCell>state.cell);

        const edgeStyle = this.getView().getEdgeStyle(
          state,
          geo != null ? geo.points : null,
          <mxCellState>source,
          <mxCellState>target
        );
        result = this.createEdgeHandler(state, edgeStyle);
      } else {
        result = this.createVertexHandler(state);
      }
    }
    return result;
  }

  /**
   * Function: createVertexHandler
   *
   * Hooks to create a new <mxVertexHandler> for the given <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> to create the handler for.
   */
  createVertexHandler(state: mxCellState): mxVertexHandler {
    return new mxVertexHandler(state);
  }

  /**
   * Function: createEdgeHandler
   *
   * Hooks to create a new <mxEdgeHandler> for the given <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> to create the handler for.
   */
  createEdgeHandler(state: mxCellState,
                    edgeStyle: any): mxEdgeHandler {

    let result = null;
    if (
      edgeStyle == mxEdgeStyle.Loop ||
      edgeStyle == mxEdgeStyle.ElbowConnector ||
      edgeStyle == mxEdgeStyle.SideToSide ||
      edgeStyle == mxEdgeStyle.TopToBottom
    ) {
      result = this.createElbowEdgeHandler(state);
    } else if (
      edgeStyle == mxEdgeStyle.SegmentConnector ||
      edgeStyle == mxEdgeStyle.OrthConnector
    ) {
      result = this.createEdgeSegmentHandler(state);
    } else {
      result = new mxEdgeHandler(state);
    }
    return result;
  }

  /**
   * Function: createEdgeSegmentHandler
   *
   * Hooks to create a new <mxEdgeSegmentHandler> for the given <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> to create the handler for.
   */
  createEdgeSegmentHandler(state: mxCellState): mxEdgeSegmentHandler {
    return new mxEdgeSegmentHandler(state);
  }

  /**
   * Function: createElbowEdgeHandler
   *
   * Hooks to create a new <mxElbowEdgeHandler> for the given <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> to create the handler for.
   */
  createElbowEdgeHandler(state: mxCellState) {
    return new mxElbowEdgeHandler(state);
  }

  /**
   * Group: Graph events
   */

  /**
   * Function: addMouseListener
   *
   * Adds a listener to the graph event dispatch loop. The listener
   * must implement the mouseDown, mouseMove and mouseUp methods
   * as shown in the <mxMouseEvent> class.
   *
   * Parameters:
   *
   * listener - Listener to be added to the graph event listeners.
   */
  addMouseListener(listener: any): void {
    if (this.mouseListeners == null) {
      this.mouseListeners = [];
    }
    this.mouseListeners.push(listener);
  }

  /**
   * Function: removeMouseListener
   *
   * Removes the specified graph listener.
   *
   * Parameters:
   *
   * listener - Listener to be removed from the graph event listeners.
   */
  removeMouseListener(listener: any) {
    if (this.mouseListeners != null) {
      for (let i = 0; i < this.mouseListeners.length; i += 1) {
        if (this.mouseListeners[i] === listener) {
          this.mouseListeners.splice(i, 1);
          break;
        }
      }
    }
  }

  /**
   * Function: updateMouseEvent
   *
   * Sets the graphX and graphY properties if the given <mxMouseEvent> if
   * required and returned the event.
   *
   * Parameters:
   *
   * me - <mxMouseEvent> to be updated.
   * evtName - Name of the mouse event.
   */
  updateMouseEvent(me: mxMouseEvent,
                   evtName: string) {

    if (me.graphX == null || me.graphY == null) {
      const pt = mxUtils.convertPoint(this.container, me.getX(), me.getY());

      me.graphX = pt.x - this.panDx;
      me.graphY = pt.y - this.panDy;

      // Searches for rectangles using method if native hit detection is disabled on shape
      if (
        me.getCell() == null &&
        this.isMouseDown &&
        evtName === mxEvent.MOUSE_MOVE
      ) {
        me.state = this.getView().getState(
          this.getCellAt(pt.x, pt.y, null, true, true, (state: mxCellState) => {
            return (
              state.shape == null ||
              state.shape.paintBackground !== this.paintBackground ||
              mxUtils.getValue(
                state.style,
                mxConstants.STYLE_POINTER_EVENTS,
                '1'
              ) == '1' ||
              (state.shape.fill != null &&
                state.shape.fill !== mxConstants.NONE)
            );
          })
        );
      }
    }

    return me;
  }

  /**
   * Function: getStateForEvent
   *
   * Returns the state for the given touch event.
   */
  getStateForTouchEvent(evt: mxMouseEvent) {
    const x = mxEvent.getClientX(evt);
    const y = mxEvent.getClientY(evt);

    // Dispatches the drop event to the graph which
    // consumes and executes the source function
    const pt = mxUtils.convertPoint(this.container, x, y);

    return this.getView().getState(this.getCellAt(pt.x, pt.y));
  }

  /**
   * Function: isEventIgnored
   *
   * Returns true if the event should be ignored in <fireMouseEvent>.
   */
  isEventIgnored(evtName: string,
                 me: mxMouseEvent,
                 sender: any): boolean {

    const mouseEvent = mxEvent.isMouseEvent(me.getEvent());
    let result = false;

    // Drops events that are fired more than once
    if (me.getEvent() === this.lastEvent) {
      result = true;
    } else {
      this.lastEvent = me.getEvent();
    }

    // Installs event listeners to capture the complete gesture from the event source
    // for non-MS touch events as a workaround for all events for the same geture being
    // fired from the event source even if that was removed from the DOM.
    if (this.eventSource != null && evtName !== mxEvent.MOUSE_MOVE) {
      mxEvent.removeGestureListeners(
        this.eventSource,
        null,
        this.mouseMoveRedirect,
        this.mouseUpRedirect
      );
      this.mouseMoveRedirect = null;
      this.mouseUpRedirect = null;
      this.eventSource = null;
    } else if (
      !mxClient.IS_GC &&
      this.eventSource != null &&
      me.getSource() !== this.eventSource
    ) {
      result = true;
    } else if (
      mxClient.IS_TOUCH &&
      evtName === mxEvent.MOUSE_DOWN &&
      !mouseEvent &&
      !mxEvent.isPenEvent(me.getEvent())
    ) {
      this.eventSource = me.getSource();

      this.mouseMoveRedirect = (evt: mxMouseEvent) => {
        this.fireMouseEvent(
          mxEvent.MOUSE_MOVE,
          new mxMouseEvent(evt, this.getStateForTouchEvent(evt))
        );
      };
      this.mouseUpRedirect = (evt: mxMouseEvent) => {
        this.fireMouseEvent(
          mxEvent.MOUSE_UP,
          new mxMouseEvent(evt, this.getStateForTouchEvent(evt))
        );
      };

      mxEvent.addGestureListeners(
        this.eventSource,
        null,
        this.mouseMoveRedirect,
        this.mouseUpRedirect
      );
    }

    // Factored out the workarounds for FF to make it easier to override/remove
    // Note this method has side-effects!
    if (this.isSyntheticEventIgnored(evtName, me, sender)) {
      result = true;
    }

    // Never fires mouseUp/-Down for double clicks
    if (
      !mxEvent.isPopupTrigger(this.lastEvent) &&
      evtName !== mxEvent.MOUSE_MOVE &&
      this.lastEvent.detail === 2
    ) {
      return true;
    }

    // Filters out of sequence events or mixed event types during a gesture
    if (evtName === mxEvent.MOUSE_UP && this.isMouseDown) {
      this.isMouseDown = false;
    } else if (evtName === mxEvent.MOUSE_DOWN && !this.isMouseDown) {
      this.isMouseDown = true;
      this.isMouseTrigger = mouseEvent;
    }
    // Drops mouse events that are fired during touch gestures as a workaround for Webkit
    // and mouse events that are not in sync with the current internal button state
    else if (
      !result &&
      (((!mxClient.IS_FF || evtName !== mxEvent.MOUSE_MOVE) &&
        this.isMouseDown &&
        this.isMouseTrigger !== mouseEvent) ||
        (evtName === mxEvent.MOUSE_DOWN && this.isMouseDown) ||
        (evtName === mxEvent.MOUSE_UP && !this.isMouseDown))
    ) {
      result = true;
    }

    if (!result && evtName === mxEvent.MOUSE_DOWN) {
      this.lastMouseX = me.getX();
      this.lastMouseY = me.getY();
    }

    return result;
  }

  /**
   * Function: isSyntheticEventIgnored
   *
   * Hook for ignoring synthetic mouse events after touchend in Firefox.
   */
  isSyntheticEventIgnored(evtName: string,
                          me: mxMouseEvent,
                          sender: any): boolean {
    let result = false;
    const mouseEvent = mxEvent.isMouseEvent(me.getEvent());

    // LATER: This does not cover all possible cases that can go wrong in FF
    if (
      this.ignoreMouseEvents &&
      mouseEvent &&
      evtName !== mxEvent.MOUSE_MOVE
    ) {
      this.ignoreMouseEvents = evtName !== mxEvent.MOUSE_UP;
      result = true;
    } else if (mxClient.IS_FF && !mouseEvent && evtName === mxEvent.MOUSE_UP) {
      this.ignoreMouseEvents = true;
    }
    return result;
  }

  /**
   * Function: isEventSourceIgnored
   *
   * Returns true if the event should be ignored in <fireMouseEvent>. This
   * implementation returns true for select, option and input (if not of type
   * checkbox, radio, button, submit or file) event sources if the event is not
   * a mouse event or a left mouse button press event.
   *
   * Parameters:
   *
   * evtName - The name of the event.
   * me - <mxMouseEvent> that should be ignored.
   */
  isEventSourceIgnored(evtName: string,
                       me: mxMouseEvent): boolean {

    const source = me.getSource();
    const name = source.nodeName != null ? source.nodeName.toLowerCase() : '';
    const candidate =
      !mxEvent.isMouseEvent(me.getEvent()) ||
      mxEvent.isLeftMouseButton(me.getEvent());

    return (
      evtName === mxEvent.MOUSE_DOWN &&
      candidate &&
      (name === 'select' ||
        name === 'option' ||
        (name === 'input' &&
          source.type !== 'checkbox' &&
          source.type !== 'radio' &&
          source.type !== 'button' &&
          source.type !== 'submit' &&
          source.type !== 'file'))
    );
  }

  /**
   * Function: getEventState
   *
   * Returns the <mxCellState> to be used when firing the mouse event for the
   * given state. This implementation returns the given state.
   *
   * Parameters:
   *
   * <mxCellState> - State whose event source should be returned.
   */
  getEventState(state: mxCellState) {
    return state;
  }

  /**
   * Function: fireMouseEvent
   *
   * Dispatches the given event in the graph event dispatch loop. Possible
   * event names are <mxEvent.MOUSE_DOWN>, <mxEvent.MOUSE_MOVE> and
   * <mxEvent.MOUSE_UP>. All listeners are invoked for all events regardless
   * of the consumed state of the event.
   *
   * Parameters:
   *
   * evtName - String that specifies the type of event to be dispatched.
   * me - <mxMouseEvent> to be fired.
   * sender - Optional sender argument. Default is this.
   */
  fireMouseEvent(evtName: string,
                 me: mxMouseEvent,
                 sender: any=this): void {

    if (this.isEventSourceIgnored(evtName, me)) {
      if (this.tooltipHandler != null) {
        this.tooltipHandler.hide();
      }
      return;
    }

    if (sender == null) {
      sender = this;
    }

    // Updates the graph coordinates in the event
    me = this.updateMouseEvent(me, evtName);

    // Detects and processes double taps for touch-based devices which do not have native double click events
    // or where detection of double click is not always possible (quirks, IE10+). Note that this can only handle
    // double clicks on cells because the sequence of events in IE prevents detection on the background, it fires
    // two mouse ups, one of which without a cell but no mousedown for the second click which means we cannot
    // detect which mouseup(s) are part of the first click, ie we do not know when the first click ends.
    if (
      (!this.nativeDblClickEnabled && !mxEvent.isPopupTrigger(me.getEvent())) ||
      (this.doubleTapEnabled &&
        mxClient.IS_TOUCH &&
        (mxEvent.isTouchEvent(me.getEvent()) ||
          mxEvent.isPenEvent(me.getEvent())))
    ) {
      const currentTime = new Date().getTime();

      if (evtName === mxEvent.MOUSE_DOWN) {
        if (
          this.lastTouchEvent != null &&
          this.lastTouchEvent !== me.getEvent() &&
          currentTime - this.lastTouchTime < this.doubleTapTimeout &&
          Math.abs(this.lastTouchX - me.getX()) < this.doubleTapTolerance &&
          Math.abs(this.lastTouchY - me.getY()) < this.doubleTapTolerance &&
          this.doubleClickCounter < 2
        ) {
          this.doubleClickCounter += 1;
          let doubleClickFired = false;

          if (evtName === mxEvent.MOUSE_UP) {
            if (
              me.getCell() === this.lastTouchCell &&
              this.lastTouchCell !== null
            ) {
              this.lastTouchTime = 0;
              const cell = this.lastTouchCell;
              this.lastTouchCell = null;

              this.dblClick(me.getEvent(), cell);
              doubleClickFired = true;
            }
          } else {
            this.fireDoubleClick = true;
            this.lastTouchTime = 0;
          }

          if (doubleClickFired) {
            mxEvent.consume(me.getEvent());
            return;
          }
        } else if (
          this.lastTouchEvent == null ||
          this.lastTouchEvent !== me.getEvent()
        ) {
          this.lastTouchCell = me.getCell();
          this.lastTouchX = me.getX();
          this.lastTouchY = me.getY();
          this.lastTouchTime = currentTime;
          this.lastTouchEvent = me.getEvent();
          this.doubleClickCounter = 0;
        }
      } else if (
        (this.isMouseDown || evtName === mxEvent.MOUSE_UP) &&
        this.fireDoubleClick
      ) {
        this.fireDoubleClick = false;
        const cell = this.lastTouchCell;
        this.lastTouchCell = null;
        this.isMouseDown = false;

        // Workaround for Chrome/Safari not firing native double click events for double touch on background
        const valid =
          cell != null ||
          ((mxEvent.isTouchEvent(me.getEvent()) ||
            mxEvent.isPenEvent(me.getEvent())) &&
            (mxClient.IS_GC || mxClient.IS_SF));

        if (
          valid &&
          Math.abs(this.lastTouchX - me.getX()) < this.doubleTapTolerance &&
          Math.abs(this.lastTouchY - me.getY()) < this.doubleTapTolerance
        ) {
          this.dblClick(me.getEvent(), cell);
        } else {
          mxEvent.consume(me.getEvent());
        }

        return;
      }
    }

    if (!this.isEventIgnored(evtName, me, sender)) {
      // Updates the event state via getEventState
      me.state = this.getEventState(me.getState());
      this.fireEvent(
        new mxEventObject(
          mxEvent.FIRE_MOUSE_EVENT,
          'eventName',
          evtName,
          'event',
          me
        )
      );

      if (
        mxClient.IS_SF ||
        mxClient.IS_GC ||
        me.getEvent().target !== this.container
      ) {
        const container = <HTMLElement>this.container;

        if (
          evtName === mxEvent.MOUSE_MOVE &&
          this.isMouseDown &&
          this.autoScroll &&
          !mxEvent.isMultiTouchEvent(me.getEvent)
        ) {
          this.scrollPointToVisible(
            me.getGraphX(),
            me.getGraphY(),
            this.autoExtend
          );
        } else if (
          evtName === mxEvent.MOUSE_UP &&
          this.ignoreScrollbars &&
          this.translateToScrollPosition &&
          (container.scrollLeft !== 0 || container.scrollTop !== 0)
        ) {
          const s = this.getView().scale;
          const tr = this.getView().translate;
          this.getView().setTranslate(
            tr.x - container.scrollLeft / s,
            tr.y - container.scrollTop / s
          );
          container.scrollLeft = 0;
          container.scrollTop = 0;
        }

        if (this.mouseListeners != null) {
          const args = [sender, me];
          const mouseListeners = this.mouseListeners;

          // Does not change returnValue in Opera
          if (!me.getEvent().preventDefault) {
            me.getEvent().returnValue = true;
          }

          for (const l of mouseListeners) {
            if (evtName === mxEvent.MOUSE_DOWN) {
              l.mouseDown.apply(l, args);
            } else if (evtName === mxEvent.MOUSE_MOVE) {
              l.mouseMove.apply(l, args);
            } else if (evtName === mxEvent.MOUSE_UP) {
              l.mouseUp.apply(l, args);
            }
          }
        }

        // Invokes the click handler
        if (evtName === mxEvent.MOUSE_UP) {
          this.click(me);
        }
      }

      // Detects tapAndHold events using a timer
      if (
        (mxEvent.isTouchEvent(me.getEvent()) ||
          mxEvent.isPenEvent(me.getEvent())) &&
        evtName === mxEvent.MOUSE_DOWN &&
        this.tapAndHoldEnabled &&
        !this.tapAndHoldInProgress
      ) {
        this.tapAndHoldInProgress = true;
        this.initialTouchX = me.getGraphX();
        this.initialTouchY = me.getGraphY();

        const handler = () => {
          if (this.tapAndHoldValid) {
            this.tapAndHold(me);
          }

          this.tapAndHoldInProgress = false;
          this.tapAndHoldValid = false;
        };

        if (this.tapAndHoldThread) {
          window.clearTimeout(this.tapAndHoldThread);
        }

        this.tapAndHoldThread = window.setTimeout(
          mxUtils.bind(this, handler),
          this.tapAndHoldDelay
        );
        this.tapAndHoldValid = true;
      } else if (evtName === mxEvent.MOUSE_UP) {
        this.tapAndHoldInProgress = false;
        this.tapAndHoldValid = false;
      } else if (this.tapAndHoldValid) {
        this.tapAndHoldValid =
          Math.abs(this.initialTouchX - me.getGraphX()) < this.tolerance &&
          Math.abs(this.initialTouchY - me.getGraphY()) < this.tolerance;
      }

      // Stops editing for all events other than from cellEditor
      if (
        evtName === mxEvent.MOUSE_DOWN &&
        this.isEditing() &&
        !(<mxCellEditor>this.cellEditor).isEventSource(me.getEvent())
      ) {
        this.stopEditing(!this.isInvokesStopCellEditing());
      }

      this.consumeMouseEvent(evtName, me, sender);
    }
  }

  /**
   * Function: consumeMouseEvent
   *
   * Consumes the given <mxMouseEvent> if it's a touchStart event.
   */
  consumeMouseEvent(evtName: string,
                    me: mxMouseEvent,
                    sender: any=this) {
    // Workaround for duplicate click in Windows 8 with Chrome/FF/Opera with touch
    if (evtName === mxEvent.MOUSE_DOWN && mxEvent.isTouchEvent(me.getEvent())) {
      me.consume(false);
    }
  }

  /**
   * Function: fireGestureEvent
   *
   * Dispatches a <mxEvent.GESTURE> event. The following example will resize the
   * cell under the mouse based on the scale property of the native touch event.
   *
   * (code)
   * graph.addListener(mxEvent.GESTURE, (sender, eo)=>
   * {
   *   let evt = eo.getProperty('event');
   *   let state = graph.view.getState(eo.getProperty('cell'));
   *
   *   if (graph.isEnabled() && graph.isCellResizable(state.cell) && Math.abs(1 - evt.scale) > 0.2)
   *   {
   *     let scale = graph.view.scale;
   *     let tr = graph.view.translate;
   *
   *     let w = state.width * evt.scale;
   *     let h = state.height * evt.scale;
   *     let x = state.x - (w - state.width) / 2;
   *     let y = state.y - (h - state.height) / 2;
   *
   *     let bounds = new mxRectangle(graph.snap(x / scale) - tr.x,
   *         graph.snap(y / scale) - tr.y, graph.snap(w / scale), graph.snap(h / scale));
   *     graph.resizeCell(state.cell, bounds);
   *     eo.consume();
   *   }
   * });
   * (end)
   *
   * Parameters:
   *
   * evt - Gestureend event that represents the gesture.
   * cell - Optional <mxCell> associated with the gesture.
   */
  fireGestureEvent(evt: MouseEvent,
                   cell: mxCell | null=null): void {
    // Resets double tap event handling when gestures take place
    this.lastTouchTime = 0;
    this.fireEvent(
      new mxEventObject(mxEvent.GESTURE, 'event', evt, 'cell', cell)
    );
  }

  /**
   * Function: destroy
   *
   * Destroys the graph and all its resources.
   */
  destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true;
      this.container = null;

      this.tooltipHandler?.destroy?.();
      this.selectionCellsHandler?.destroy?.();
      this.panningHandler?.destroy?.();
      this.popupMenuHandler?.destroy?.();
      this.connectionHandler?.destroy?.();
      this.graphHandler?.destroy?.();
      this.cellEditor?.destroy?.();
      this.view?.destroy?.();

      if (this.model != null && this.graphModelChangeListener != null) {
        this.getModel().removeListener(this.graphModelChangeListener);
        this.graphModelChangeListener = null;
      }
    }
  }
}

export default mxGraph;
import("../../serialization/mxGraphCodec");
