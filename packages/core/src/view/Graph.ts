/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */

import Image from './image/Image';
import EventObject from './event/EventObject';
import EventSource from './event/EventSource';
import InternalEvent from './event/InternalEvent';
import Rectangle from './geometry/Rectangle';
import TooltipHandler from './popups_menus/TooltipHandler';
import mxClient from '../mxClient';
import mxSelectionCellsHandler from './selection/mxSelectionCellsHandler';
import mxConnectionHandler from './connection/mxConnectionHandler';
import GraphHandler from './GraphHandler';
import PanningHandler from './panning/PanningHandler';
import PopupMenuHandler from './popups_menus/PopupMenuHandler';
import mxGraphSelectionModel from './selection/mxGraphSelectionModel';
import GraphView from './view/GraphView';
import CellRenderer from './cell/CellRenderer';
import CellEditor from './editing/CellEditor';
import Point from './geometry/Point';
import utils, {contains, convertPoint,
  getBoundingBox,
  getRotatedPoint,
  getValue, hasScrollbars, intersects, ptSegDistSq, toRadians} from '../util/Utils';
import mxDictionary from '../util/mxDictionary';
import InternalMouseEvent from './event/InternalMouseEvent';
import Resources from '../util/Resources';
import Cell from './cell/datatypes/Cell';
import Model from './model/Model';
import Stylesheet from './style/Stylesheet';
import {
  ALIGN_MIDDLE,
  DEFAULT_STARTSIZE,
  DIALECT_SVG,
  DIRECTION_EAST,
  DIRECTION_NORTH,
  DIRECTION_SOUTH,
  DIRECTION_WEST,
  NONE,
  PAGE_FORMAT_A4_PORTRAIT,
  SHAPE_SWIMLANE,
} from '../util/Constants';

import ChildChange from './model/ChildChange';
import GeometryChange from './geometry/GeometryChange';
import RootChange from './model/RootChange';
import StyleChange from './style/StyleChange';
import TerminalChange from './cell/edge/TerminalChange';
import ValueChange from './cell/ValueChange';
import mxPolyline from './geometry/shape/edge/mxPolyline';
import CellState from './cell/datatypes/CellState';
import ImageBundle from './image/ImageBundle';
import Shape from './geometry/shape/Shape';
import { htmlEntities } from '../util/StringUtils';
import {
  getClientX,
  getClientY,
} from '../util/EventUtils';
import { isNode } from '../util/DomUtils';
import CellArray from "./cell/datatypes/CellArray";

/**
 * Extends {@link EventSource} to implement a graph component for
 * the browser. This is the main class of the package. To activate
 * panning and connections use {@link setPanning} and {@link setConnectable}.
 * For rubberband selection you must create a new instance of
 * {@link mxRubberband}. The following listeners are added to
 * {@link mouseListeners} by default:
 *
 * - tooltipHandler: {@link TooltipHandler} that displays tooltips
 * - panningHandler: {@link PanningHandler} for panning and popup menus
 * - connectionHandler: {@link mxConnectionHandler} for creating connections
 * - graphHandler: {@link GraphHandler} for moving and cloning cells
 *
 * These listeners will be called in the above order if they are enabled.
 * @class graph
 * @extends {EventSource}
 */
class Graph extends EventSource {
  constructor(
    container: HTMLElement,
    model: Model,
    renderHint: string = DIALECT_SVG,
    stylesheet: Stylesheet | null = null
  ) {
    super();

    // Converts the renderHint into a dialect
    this.renderHint = renderHint;
    this.dialect = 'svg';

    // Initializes the main members that do not require a container
    this.model = model != null ? model : new Model();
    this.cellRenderer = this.createCellRenderer();
    this.setSelectionModel(this.createSelectionModel());
    this.setStylesheet(
      stylesheet != null ? stylesheet : this.createStylesheet()
    );
    this.view = this.createGraphView();

    // Adds a graph model listener to update the view
    this.graphModelChangeListener = (sender: any, evt: EventObject) => {
      this.graphModelChanged(evt.getProperty('edit').changes);
    };

    this.getModel().addListener(InternalEvent.CHANGE, this.graphModelChangeListener);

    // Installs basic event handlers with disabled default settings.
    this.createHandlers();

    // Initializes the display if a container was specified
    if (container != null) {
      this.init(container);
    }

    this.getView().revalidate();
  }

  /**
   * Initializes the {@link container} and creates the respective datastructures.
   *
   * @param container DOM node that will contain the graph display.
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
    InternalEvent.addListener(container, 'mouseleave', (evt: Event) => {
      if (
        this.tooltipHandler != null &&
        this.tooltipHandler.div != null &&
        this.tooltipHandler.div != (<MouseEvent>evt).relatedTarget
      ) {
        this.tooltipHandler.hide();
      }
    });
  }

  // TODO: Document me!

  // @ts-ignore
  container: HTMLElement;
  destroyed: boolean = false;
  tooltipHandler: TooltipHandler | null = null;
  selectionCellsHandler: mxSelectionCellsHandler | null = null;
  popupMenuHandler: PopupMenuHandler | null = null;
  connectionHandler: mxConnectionHandler | null = null;
  graphHandler: GraphHandler | null = null;
  graphModelChangeListener: Function | null = null;
  horizontalPageBreaks: any[] | null = null;
  verticalPageBreaks: any[] | null = null;
  paintBackground: Function | null = null;

  /*****************************************************************************
   * Group: Variables
   *****************************************************************************/

  /**
   * Holds the {@link Model} that contains the cells to be displayed.
   */
  model: Model | null = null;

  /**
   * Holds the {@link GraphView} that caches the {@link CellState}s for the cells.
   */
  view: GraphView;

  /**
   * Holds the {@link Stylesheet} that defines the appearance of the cells.
   *
   * Use the following code to read a stylesheet into an existing graph.
   *
   * @example
   * ```javascript
   * var req = mxUtils.load('stylesheet.xml');
   * var root = req.getDocumentElement();
   * var dec = new mxCodec(root.ownerDocument);
   * dec.decode(root, graph.stylesheet);
   * ```
   */
  // @ts-ignore
  stylesheet: Stylesheet;

  /**
   * Holds the {@link mxGraphSelectionModel} that models the current selection.
   */
  selectionModel: mxGraphSelectionModel | null = null;

  /**
   * Holds the {@link CellEditor} that is used as the in-place editing.
   */
  // @ts-ignore
  cellEditor: CellEditor;

  /**
   * Holds the {@link CellRenderer} for rendering the cells in the graph.
   */
  cellRenderer: CellRenderer;

  /**
   * RenderHint as it was passed to the constructor.
   */
  renderHint: string | null = null;

  /**
   * Dialect to be used for drawing the graph. Possible values are all
   * constants in {@link mxConstants} with a DIALECT-prefix.
   */
  dialect: 'svg' | 'mixedHtml' | 'preferHtml' | 'strictHtml' = 'svg';

  /**
   * Specifies the grid size.
   * @default 10
   */
  gridSize: number = 10;

  /**
   * Specifies if the grid is enabled. This is used in {@link snap}.
   * @default true
   */
  gridEnabled: boolean = true;

  /**
   * Specifies if ports are enabled. This is used in {@link cellConnected} to update
   * the respective style.
   * @default true
   */
  portsEnabled: boolean = true;

  /**
   * Value returned by {@link getOverlap} if {@link isAllowOverlapParent} returns
   * `true` for the given cell. {@link getOverlap} is used in {@link constrainChild} if
   * {@link isConstrainChild} returns `true`. The value specifies the
   * portion of the child which is allowed to overlap the parent.
   */
  defaultOverlap: number = 0.5;

  /**
   * Specifies the default parent to be used to insert new cells.
   * This is used in {@link getDefaultParent}.
   * @default null
   */
  defaultParent: Cell | null = null;

  /**
   * Specifies the alternate edge style to be used if the main control point
   * on an edge is being double clicked.
   * @default null
   */
  alternateEdgeStyle: string | null = null;

  /**
   * Specifies the {@link Image} to be returned by {@link getBackgroundImage}.
   * @default null
   *
   * @example
   * ```javascript
   * var img = new mxImage('http://www.example.com/maps/examplemap.jpg', 1024, 768);
   * graph.setBackgroundImage(img);
   * graph.view.validate();
   * ```
   */
  backgroundImage: Image | null = null;

  /**
   * Specifies if the background page should be visible.
   * Not yet implemented.
   * @default false
   */
  pageVisible: boolean = false;

  /**
   * Specifies if a dashed line should be drawn between multiple pages.
   * If you change this value while a graph is being displayed then you
   * should call {@link sizeDidChange} to force an update of the display.
   * @default false
   */
  pageBreaksVisible: boolean = false;

  /**
   * Specifies the color for page breaks.
   * @default gray
   */
  pageBreakColor: string = 'gray';

  /**
   * Specifies the page breaks should be dashed.
   * @default true
   */
  pageBreakDashed: boolean = true;

  /**
   * Specifies the minimum distance in pixels for page breaks to be visible.
   * @default 20
   */
  minPageBreakDist: number = 20;

  /**
   * Specifies if the graph size should be rounded to the next page number in
   * {@link sizeDidChange}. This is only used if the graph container has scrollbars.
   * @default false
   */
  preferPageSize: boolean = false;

  /**
   * Specifies the page format for the background page.
   * This is used as the default in {@link printPreview} and for painting the background page
   * if {@link pageVisible} is `true` and the page breaks if {@link pageBreaksVisible} is `true`.
   * @default {@link mxConstants.PAGE_FORMAT_A4_PORTRAIT}
   */
  pageFormat: Rectangle = new Rectangle(...PAGE_FORMAT_A4_PORTRAIT);

  /**
   * Specifies the scale of the background page.
   * Not yet implemented.
   * @default 1.5
   */
  pageScale: number = 1.5;

  /**
   * Specifies the return value for {@link isEnabled}.
   * @default true
   */
  enabled: boolean = true;

  /**
   * Specifies the return value for {@link canExportCell}.
   * @default true
   */
  exportEnabled: boolean = true;

  /**
   * Specifies the return value for {@link canImportCell}.
   * @default true
   */
  importEnabled: boolean = true;

  /**
   * Specifies the return value for {@link isCellLocked}.
   * @default false
   */
  cellsLocked: boolean = false;

  /**
   * Specifies the return value for {@link isCellCloneable}.
   * @default true
   */
  cellsCloneable: boolean = true;

  /**
   * Specifies the return value for {@link isCellEditable}.
   * @default true
   */
  cellsEditable: boolean = true;

  /**
   * Specifies the return value for {@link isCellDeletable}.
   * @default true
   */
  cellsDeletable: boolean = true;

  /**
   * Specifies the return value for {@link isCellMovable}.
   * @default true
   */
  cellsMovable: boolean = true;

  /**
   * Specifies the return value for edges in {@link isLabelMovable}.
   * @default true
   */
  edgeLabelsMovable: boolean = true;

  /**
   * Specifies the return value for {@link isDropEnabled}.
   * @default false
   */
  dropEnabled: boolean = false;

  /**
   * Specifies if dropping onto edges should be enabled. This is ignored if
   * {@link dropEnabled} is `false`. If enabled, it will call {@link splitEdge} to carry
   * out the drop operation.
   * @default true
   */
  splitEnabled: boolean = true;

  /**
   * Specifies the return value for {@link isCellsResizable}.
   * @default true
   */
  cellsResizable: boolean = true;

  /**
   * Specifies the return value for {@link isCellsBendable}.
   * @default true
   */
  cellsBendable: boolean = true;

  /**
   * Specifies the return value for {@link isCellsSelectable}.
   * @default true
   */
  cellsSelectable: boolean = true;

  /**
   * Specifies the return value for {@link isCellsDisconnectable}.
   * @default true
   */
  cellsDisconnectable: boolean = true;

  /**
   * Specifies if the graph should automatically update the cell size after an
   * edit. This is used in {@link isAutoSizeCell}.
   * @default false
   */
  autoSizeCells: boolean = false;

  /**
   * Specifies if autoSize style should be applied when cells are added.
   * @default false
   */
  autoSizeCellsOnAdd: boolean = false;

  /**
   * Specifies if the graph should automatically scroll regardless of the
   * scrollbars. This will scroll the container using positive values for
   * scroll positions (ie usually only rightwards and downwards). To avoid
   * possible conflicts with panning, set {@link translateToScrollPosition} to `true`.
   */
  ignoreScrollbars: boolean = false;

  /**
   * Specifies if the graph should automatically convert the current scroll
   * position to a translate in the graph view when a mouseUp event is received.
   * This can be used to avoid conflicts when using {@link autoScroll} and
   * {@link ignoreScrollbars} with no scrollbars in the container.
   */
  translateToScrollPosition: boolean = false;

  /**
   * {@link Rectangle} that specifies the area in which all cells in the diagram
   * should be placed. Uses in {@link getMaximumGraphBounds}. Use a width or height of
   * `0` if you only want to give a upper, left corner.
   */
  maximumGraphBounds: Rectangle | null = null;

  /**
   * {@link Rectangle} that specifies the minimum size of the graph. This is ignored
   * if the graph container has no scrollbars.
   * @default null
   */
  minimumGraphSize: Rectangle | null = null;

  /**
   * {@link Rectangle} that specifies the minimum size of the {@link container} if
   * {@link resizeContainer} is `true`.
   */
  minimumContainerSize: Rectangle | null = null;

  /**
   * {@link Rectangle} that specifies the maximum size of the container if
   * {@link resizeContainer} is `true`.
   */
  maximumContainerSize: Rectangle | null = null;

  /**
   * Specifies if the container should be resized to the graph size when
   * the graph size has changed.
   * @default false
   */
  resizeContainer: boolean = false;

  /**
   * Border to be added to the bottom and right side when the container is
   * being resized after the graph has been changed.
   * @default 0
   */
  border: number = 0;

  /**
   * Specifies if edges should appear in the foreground regardless of their order
   * in the model. If {@link keepEdgesInForeground} and {@link keepEdgesInBackground} are
   * both `true` then the normal order is applied.
   * @default false
   */
  keepEdgesInForeground: boolean = false;

  /**
   * Specifies if edges should appear in the background regardless of their order
   * in the model. If {@link keepEdgesInForeground} and {@link keepEdgesInBackground} are
   * both `true` then the normal order is applied.
   * @default false
   */
  keepEdgesInBackground: boolean = false;

  /**
   * Specifies if negative coordinates for vertices are allowed.
   * @default true
   */
  allowNegativeCoordinates: boolean = true;

  /**
   * Specifies if a child should be constrained inside the parent bounds after a
   * move or resize of the child.
   * @default true
   */
  constrainChildren: boolean = true;

  /**
   * Specifies if child cells with relative geometries should be constrained
   * inside the parent bounds, if {@link constrainChildren} is `true`, and/or the
   * {@link maximumGraphBounds}.
   * @default false
   */
  constrainRelativeChildren: boolean = false;

  /**
   * Specifies if a parent should contain the child bounds after a resize of
   * the child. This has precedence over {@link constrainChildren}.
   * @default true
   */
  extendParents: boolean = true;

  /**
   * Specifies if parents should be extended according to the {@link extendParents}
   * switch if cells are added.
   * @default true
   */
  extendParentsOnAdd: boolean = true;

  /**
   * Specifies if parents should be extended according to the {@link extendParents}
   * switch if cells are added.
   * @default false (for backwards compatibility)
   */
  extendParentsOnMove: boolean = false;

  /**
   * Specifies the return value for {@link isRecursiveResize}.
   * @default false (for backwards compatibility)
   */
  recursiveResize: boolean = false;

  /**
   * Specifies the factor used for {@link zoomIn} and {@link zoomOut}.
   * @default 1.2 (120%)
   */
  zoomFactor: number = 1.2;

  /**
   * Specifies if the viewport should automatically contain the selection cells after a zoom operation.
   * @default false
   */
  keepSelectionVisibleOnZoom: boolean = false;

  /**
   * Specifies if the zoom operations should go into the center of the actual
   * diagram rather than going from top, left.
   * @default true
   */
  centerZoom: boolean = true;

  /**
   * Specifies if the scale and translate should be reset if the root changes in
   * the model.
   * @default true
   */
  resetViewOnRootChange: boolean = true;

  /**
   * Specifies if edge control points should be reset after the resize of a
   * connected cell.
   * @default false
   */
  resetEdgesOnResize: boolean = false;

  /**
   * Specifies if edge control points should be reset after the move of a
   * connected cell.
   * @default false
   */
  resetEdgesOnMove: boolean = false;

  /**
   * Specifies if edge control points should be reset after the the edge has been
   * reconnected.
   * @default true
   */
  resetEdgesOnConnect: boolean = true;

  /**
   * Specifies if loops (aka self-references) are allowed.
   * @default false
   */
  allowLoops: boolean = false;

  /**
   * {@link EdgeStyle} to be used for loops. This is a fallback for loops if the
   * {@link mxConstants.STYLE_LOOP} is undefined.
   * @default {@link EdgeStyle.Loop}
   */
  defaultLoopStyle = mxEdgeStyle.Loop;

  /**
   * Specifies if multiple edges in the same direction between the same pair of
   * vertices are allowed.
   * @default true
   */
  multigraph: boolean = true;

  /**
   * Specifies if edges are connectable. This overrides the connectable field in edges.
   * @default false
   */
  connectableEdges: boolean = false;

  /**
   * Specifies if edges with disconnected terminals are allowed in the graph.
   * @default true
   */
  allowDanglingEdges: boolean = true;

  /**
   * Specifies if edges that are cloned should be validated and only inserted
   * if they are valid.
   * @default true
   */
  cloneInvalidEdges: boolean = false;

  /**
   * Specifies if edges should be disconnected from their terminals when they
   * are moved.
   * @default true
   */
  disconnectOnMove: boolean = true;

  /**
   * Specifies if labels should be visible. This is used in {@link getLabel}. Default
   * is true.
   */
  labelsVisible: boolean = true;

  /**
   * Specifies the return value for {@link isHtmlLabel}.
   * @default false
   */
  htmlLabels: boolean = false;

  /**
   * Specifies if swimlanes should be selectable via the content if the
   * mouse is released.
   * @default true
   */
  swimlaneSelectionEnabled: boolean = true;

  /**
   * Specifies if nesting of swimlanes is allowed.
   * @default true
   */
  swimlaneNesting: boolean = true;

  /**
   * The attribute used to find the color for the indicator if the indicator
   * color is set to 'swimlane'.
   * @default {@link 'fillColor'}
   */
  swimlaneIndicatorColorAttribute: string = 'fillColor';

  /**
   * Specifies the minimum scale to be applied in {@link fit}. Set this to `null` to allow any value.
   * @default 0.1
   */
  minFitScale: number = 0.1;

  /**
   * Specifies the maximum scale to be applied in {@link fit}. Set this to `null` to allow any value.
   * @default 8
   */
  maxFitScale: number = 8;

  /**
   * Specifies the {@link Image} for the image to be used to display a warning
   * overlay. See {@link setCellWarning}. Default value is mxClient.imageBasePath +
   * '/warning'.  The extension for the image depends on the platform. It is
   * '.png' on the Mac and '.gif' on all other platforms.
   */
  warningImage: Image = new Image(
    `${mxClient.imageBasePath}/warning${mxClient.IS_MAC ? '.png' : '.gif'}`,
    16,
    16
  );

  /**
   * Specifies the resource key for the error message to be displayed in
   * non-multigraphs when two vertices are already connected. If the resource
   * for this key does not exist then the value is used as the error message.
   * @default 'alreadyConnected'
   */
  alreadyConnectedResource: string =
    mxClient.language != 'none' ? 'alreadyConnected' : '';

  /**
   * Specifies the resource key for the warning message to be displayed when
   * a collapsed cell contains validation errors. If the resource for this
   * key does not exist then the value is used as the warning message.
   * @default 'containsValidationErrors'
   */
  containsValidationErrorsResource: string =
    mxClient.language != 'none' ? 'containsValidationErrors' : '';

  /**
   * Specifies the resource key for the tooltip on the collapse/expand icon.
   * If the resource for this key does not exist then the value is used as
   * the tooltip.
   * @default 'collapse-expand'
   */
  collapseExpandResource: string =
    mxClient.language != 'none' ? 'collapse-expand' : '';

  // TODO: Document me!!
  batchUpdate(fn: Function): void {
    (<Model>this.getModel()).beginUpdate();
    try {
      fn();
    } finally {
      (<Model>this.getModel()).endUpdate();
    }
  }

  /**
   * Creates the tooltip-, panning-, connection- and graph-handler (in this
   * order). This is called in the constructor before {@link init} is called.
   */
  createHandlers(): void {
    this.tooltipHandler = this.createTooltipHandler();
    this.tooltipHandler.setEnabled(false);
    this.selectionCellsHandler = this.createSelectionCellsHandler();
    this.connectionHandler = this.createConnectionHandler();
    this.connectionHandler.setEnabled(false);
    this.graphHandler = this.createGraphHandler();
    this.popupMenuHandler = this.createPopupMenuHandler();
  }

  /**
   * Creates and returns a new {@link TooltipHandler} to be used in this graph.
   */
  createTooltipHandler(): TooltipHandler {
    return new TooltipHandler(this);
  }

  /**
   * Creates and returns a new {@link TooltipHandler} to be used in this graph.
   */
  createSelectionCellsHandler(): mxSelectionCellsHandler {
    return new mxSelectionCellsHandler(this);
  }

  /**
   * Creates and returns a new {@link mxConnectionHandler} to be used in this graph.
   */
  createConnectionHandler(): mxConnectionHandler {
    return new mxConnectionHandler(this);
  }

  /**
   * Creates and returns a new {@link GraphHandler} to be used in this graph.
   */
  createGraphHandler(): mxGraphHandler {
    return new mxGraphHandler(this);
  }

  /**
   * Creates and returns a new {@link PopupMenuHandler} to be used in this graph.
   */
  createPopupMenuHandler(): PopupMenuHandler {
    return new PopupMenuHandler(this);
  }

  /**
   * Creates a new {@link mxGraphSelectionModel} to be used in this graph.
   */
  createSelectionModel(): mxGraphSelectionModel {
    return new mxGraphSelectionModel(this);
  }

  /**
   * Creates a new {@link mxGraphSelectionModel} to be used in this graph.
   */
  createStylesheet(): Stylesheet {
    return new Stylesheet();
  }

  /**
   * Creates a new {@link GraphView} to be used in this graph.
   */
  createGraphView(): GraphView {
    return new GraphView(this);
  }

  /**
   * Creates a new {@link CellRenderer} to be used in this graph.
   */
  createCellRenderer(): CellRenderer {
    return new CellRenderer();
  }

  /**
   * Creates a new {@link CellEditor} to be used in this graph.
   */
  createCellEditor(): CellEditor {
    return new CellEditor(this);
  }

  /**
   * Returns the {@link Model} that contains the cells.
   */
  getModel(): Model {
    return <Model>this.model;
  }

  /**
   * Returns the {@link GraphView} that contains the {@link mxCellStates}.
   */
  getView(): GraphView {
    return <GraphView>this.view;
  }

  /**
   * Returns the {@link Stylesheet} that defines the style.
   */
  getStylesheet(): Stylesheet | null {
    return this.stylesheet;
  }

  /**
   * Sets the {@link Stylesheet} that defines the style.
   */
  setStylesheet(stylesheet: Stylesheet | null): void {
    this.stylesheet = stylesheet;
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
  getSelectionCellsForChanges(
    changes: any[],
    ignoreFn: Function | null = null
  ): CellArray {
    const dict = new mxDictionary();
    const cells: CellArray = new CellArray();

    const addCell = (cell: Cell) => {
      if (!dict.get(cell) && this.getModel().contains(cell)) {
        if (cell.isEdge() || cell.isVertex()) {
          dict.put(cell, true);
          cells.push(cell);
        } else {
          const childCount = cell.getChildCount();

          for (let i = 0; i < childCount; i += 1) {
            addCell(<Cell>cell.getChildAt(i));
          }
        }
      }
    };

    for (let i = 0; i < changes.length; i += 1) {
      const change = changes[i];

      if (
        change.constructor !== RootChange &&
        (ignoreFn == null || !ignoreFn(change))
      ) {
        let cell = null;

        if (change instanceof ChildChange) {
          cell = change.child;
        } else if (change.cell != null && change.cell instanceof Cell) {
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
   * Called when the graph model changes. Invokes {@link processChange} on each
   * item of the given array to update the view accordingly.
   *
   * @param changes Array that contains the individual changes.
   */
  graphModelChanged(changes: any[]) {
    for (const change of changes) {
      this.processChange(change);
    }

    this.updateSelection();
    this.getView().validate();
    this.sizeDidChange();
  }

  /**
   * Removes selection cells that are not in the model from the selection.
   */
  updateSelection(): void {
    const cells = this.getSelectionCells();
    const removed = new CellArray();

    for (const cell of cells) {
      if (!this.getModel().contains(cell) || !cell.isVisible()) {
        removed.push(cell);
      } else {
        let par = cell.getParent();

        while (par != null && par !== this.getView().currentRoot) {
          if (par.isCollapsed() || !par.isVisible()) {
            removed.push(cell);
            break;
          }

          par = par.getParent();
        }
      }
    }
    this.removeSelectionCells(removed);
  }

  /**
   * Processes the given change and invalidates the respective cached data
   * in {@link GraphView}. This fires a {@link root} event if the root has changed in the
   * model.
   *
   * @param {(RootChange|ChildChange|TerminalChange|GeometryChange|ValueChange|StyleChange)} change - Object that represents the change on the model.
   */
  processChange(change: any): void {
    // Resets the view settings, removes all cells and clears
    // the selection if the root changes.
    if (change instanceof RootChange) {
      this.clearSelection();
      this.setDefaultParent(null);
      this.removeStateForCell(change.previous);

      if (this.resetViewOnRootChange) {
        this.getView().scale = 1;
        this.getView().translate.x = 0;
        this.getView().translate.y = 0;
      }

      this.fireEvent(new EventObject(InternalEvent.ROOT));
    }

    // Adds or removes a child to the view by online invaliding
    // the minimal required portions of the cache, namely, the
    // old and new parent and the child.
    else if (change instanceof ChildChange) {
      const newParent = change.child.getParent();
      this.getView().invalidate(change.child, true, true);

      if (!this.getModel().contains(newParent) || newParent.isCollapsed()) {
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
      change instanceof TerminalChange ||
      change instanceof GeometryChange
    ) {
      // Checks if the geometry has changed to avoid unnessecary revalidation
      if (
        change instanceof TerminalChange ||
        (change.previous == null && change.geometry != null) ||
        (change.previous != null && !change.previous.equals(change.geometry))
      ) {
        this.getView().invalidate(change.cell);
      }
    }

    // Handles two special cases where only the shape, but no
    // descendants need to be recreated
    else if (change instanceof ValueChange) {
      this.getView().invalidate(change.cell, false, false);
    }

    // Requires a new mxShape in JavaScript
    else if (change instanceof StyleChange) {
      this.getView().invalidate(change.cell, true, true);
      const state = this.getView().getState(change.cell);

      if (state != null) {
        state.invalidStyle = true;
      }
    }

    // Removes the state from the cache by default
    else if (change.cell != null && change.cell instanceof Cell) {
      this.removeStateForCell(change.cell);
    }
  }

  // ???

  /**
   * Scrolls the graph to the given point, extending the graph container if
   * specified.
   */
  scrollPointToVisible(
    x: number,
    y: number,
    extend: boolean = false,
    border: number = 20
  ): void {
    if (
      !this.timerAutoScroll &&
      (this.ignoreScrollbars || hasScrollbars(this.container))
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
    } else if (
      this.allowAutoPanning &&
      !(<PanningHandler>this.panningHandler).isActive()
    ) {
      if (this.panningManager == null) {
        this.panningManager = this.createPanningManager();
      }
      this.panningManager.panTo(x + this.panDx, y + this.panDy);
    }
  }

  /**
   * Returns the size of the border and padding on all four sides of the
   * container. The left, top, right and bottom borders are stored in the x, y,
   * width and height of the returned {@link Rectangle}, respectively.
   */
  getBorderSizes(): Rectangle {
    const css = <CSSStyleDeclaration>utils.getCurrentStyle(this.container);

    return new Rectangle(
      utils.parseCssNumber(css.paddingLeft) +
        (css.borderLeftStyle != 'none'
          ? utils.parseCssNumber(css.borderLeftWidth)
          : 0),
      utils.parseCssNumber(css.paddingTop) +
        (css.borderTopStyle != 'none'
          ? utils.parseCssNumber(css.borderTopWidth)
          : 0),
      utils.parseCssNumber(css.paddingRight) +
        (css.borderRightStyle != 'none'
          ? utils.parseCssNumber(css.borderRightWidth)
          : 0),
      utils.parseCssNumber(css.paddingBottom) +
        (css.borderBottomStyle != 'none'
          ? utils.parseCssNumber(css.borderBottomWidth)
          : 0)
    );
  }

  /**
   * Returns the preferred size of the background page if {@link preferPageSize} is true.
   */
  getPreferredPageSize(
    bounds: Rectangle,
    width: number,
    height: number
  ): Rectangle {
    const { scale } = this.view;
    const tr = this.getView().translate;
    const fmt = this.pageFormat;
    const ps = this.pageScale;
    const page = new Rectangle(
      0,
      0,
      Math.ceil(fmt.width * ps),
      Math.ceil(fmt.height * ps)
    );

    const hCount = this.pageBreaksVisible ? Math.ceil(width / page.width) : 1;
    const vCount = this.pageBreaksVisible ? Math.ceil(height / page.height) : 1;

    return new Rectangle(
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
  fit(
    border: number = this.getBorder(),
    keepOrigin: boolean = false,
    margin: number = 0,
    enabled: boolean = true,
    ignoreWidth: boolean = false,
    ignoreHeight: boolean = false,
    maxHeight: number | null = null
  ): number {
    if (this.container != null) {
      // Adds spacing and border from css
      const cssBorder = this.getBorderSizes();
      let w1: number =
        this.container.offsetWidth - cssBorder.x - cssBorder.width - 1;
      let h1: number =
        maxHeight != null
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
            if (!hasScrollbars(this.container)) {
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
   * Resizes the container for the given graph width and height.
   */
  doResizeContainer(width: number, height: number): void {
    if (this.maximumContainerSize != null) {
      width = Math.min(this.maximumContainerSize.width, width);
      height = Math.min(this.maximumContainerSize.height, height);
    }
    const container = <HTMLElement>this.container;
    container.style.width = `${Math.ceil(width)}px`;
    container.style.height = `${Math.ceil(height)}px`;
  }

  /**
   * Invokes from {@link sizeDidChange} to redraw the page breaks.
   *
   * @param visible Boolean that specifies if page breaks should be shown.
   * @param width Specifies the width of the container in pixels.
   * @param height Specifies the height of the container in pixels.
   */
  updatePageBreaks(visible: boolean, width: number, height: number): void {
    const { scale } = this.view;
    const tr = this.getView().translate;
    const fmt = this.pageFormat;
    const ps = scale * this.pageScale;
    const bounds = new Rectangle(0, 0, fmt.width * ps, fmt.height * ps);

    const gb = Rectangle.fromRectangle(this.getGraphBounds());
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
                  new Point(
                    Math.round(bounds.x),
                    Math.round(bounds.y + i * bounds.height)
                  ),
                  new Point(
                    Math.round(bounds.x + right),
                    Math.round(bounds.y + i * bounds.height)
                  ),
                ]
              : [
                  new Point(
                    Math.round(bounds.x + i * bounds.width),
                    Math.round(bounds.y)
                  ),
                  new Point(
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

  /*****************************************************************************
   * Group: Drilldown
   *****************************************************************************/

  /**
   * Returns the current root of the displayed cell hierarchy. This is a
   * shortcut to {@link GraphView.currentRoot} in {@link GraphView}.
   */
  getCurrentRoot(): Cell | null {
    return this.getView().currentRoot;
  }

  /**
   * Returns the translation to be used if the given cell is the root cell as
   * an {@link Point}. This implementation returns null.
   *
   * To keep the children at their absolute position while stepping into groups,
   * this function can be overridden as follows.
   *
   * @example
   * ```javascript
   * var offset = new mxPoint(0, 0);
   *
   * while (cell != null)
   * {
   *   var geo = this.model.getGeometry(cell);
   *
   *   if (geo != null)
   *   {
   *     offset.x -= geo.x;
   *     offset.y -= geo.y;
   *   }
   *
   *   cell = this.model.getParent(cell);
   * }
   *
   * return offset;
   * ```
   *
   * @param cell {@link mxCell} that represents the root.
   */
  getTranslateForRoot(cell: Cell): Point | null {
    return null;
  }

  /**
   * Returns true if the given cell is a "port", that is, when connecting to
   * it, the cell returned by getTerminalForPort should be used as the
   * terminal and the port should be referenced by the ID in either the
   * mxConstants.STYLE_SOURCE_PORT or the or the
   * mxConstants.STYLE_TARGET_PORT. Note that a port should not be movable.
   * This implementation always returns false.
   *
   * A typical implementation is the following:
   *
   * ```javascript
   * graph.isPort = function(cell)
   * {
   *   var geo = cell.getGeometry();
   *
   *   return (geo != null) ? geo.relative : false;
   * };
   * ```
   *
   * @param cell {@link mxCell} that represents the port.
   */
  isPort(cell: Cell): boolean {
    return false;
  }

  /**
   * Returns the terminal to be used for a given port. This implementation
   * always returns the parent cell.
   *
   * @param cell {@link mxCell} that represents the port.
   * @param source If the cell is the source or target port.
   */
  getTerminalForPort(cell: Cell, source: boolean = false): Cell | null {
    return cell.getParent();
  }

  /**
   * Returns the offset to be used for the cells inside the given cell. The
   * root and layer cells may be identified using {@link Model.isRoot} and
   * {@link Model.isLayer}. For all other current roots, the
   * {@link GraphView.currentRoot} field points to the respective cell, so that
   * the following holds: cell == this.view.currentRoot. This implementation
   * returns null.
   *
   * @param cell {@link mxCell} whose offset should be returned.
   */
  // getChildOffsetForCell(cell: mxCell): number;
  getChildOffsetForCell(cell: Cell): Point | null {
    return null;
  }

  /**
   * Uses the given cell as the root of the displayed cell hierarchy. If no
   * cell is specified then the selection cell is used. The cell is only used
   * if {@link isValidRoot} returns true.
   *
   * @param cell Optional {@link Cell} to be used as the new root. Default is the
   * selection cell.
   */
  enterGroup(cell: Cell): void {
    cell = cell || this.getSelectionCell();

    if (cell != null && this.isValidRoot(cell)) {
      this.getView().setCurrentRoot(cell);
      this.clearSelection();
    }
  }

  /**
   * Changes the current root to the next valid root in the displayed cell
   * hierarchy.
   */
  exitGroup(): void {
    const root = this.getModel().getRoot();
    const current = this.getCurrentRoot();

    if (current != null) {
      let next = <Cell>current.getParent();

      // Finds the next valid root in the hierarchy
      while (
        next !== root &&
        !this.isValidRoot(next) &&
        next.getParent() !== root
      ) {
        next = <Cell>next.getParent();
      }

      // Clears the current root if the new root is
      // the model's root or one of the layers.
      if (next === root || next.getParent() === root) {
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
   * Returns true if the given cell is a valid root for the cell display
   * hierarchy. This implementation returns true for all non-null values.
   *
   * @param cell {@link mxCell} which should be checked as a possible root.
   */
  isValidRoot(cell: Cell) {
    return cell != null;
  }

  /*****************************************************************************
   * Group: Graph display
   *****************************************************************************/

  /**
   * Returns the bounds of the visible graph. Shortcut to
   * {@link GraphView.getGraphBounds}. See also: {@link getBoundingBoxFromGeometry}.
   */
  getGraphBounds(): Rectangle {
    return this.getView().getGraphBounds();
  }

  /**
   * Returns the scaled, translated bounds for the given cell. See
   * {@link GraphView.getBounds} for arrays.
   *
   * @param cell {@link mxCell} whose bounds should be returned.
   * @param includeEdges Optional boolean that specifies if the bounds of
   * the connected edges should be included. Default is `false`.
   * @param includeDescendants Optional boolean that specifies if the bounds
   * of all descendants should be included. Default is `false`.
   */
  getCellBounds(
    cell: Cell,
    includeEdges: boolean = false,
    includeDescendants: boolean = false
  ): Rectangle | null {
    let cells = new CellArray(cell);

    // Includes all connected edges
    if (includeEdges) {
      cells = cells.concat(<CellArray>cell.getEdges());
    }

    let result = this.getView().getBounds(cells);

    // Recursively includes the bounds of the children
    if (includeDescendants) {
      for (const child of cell.getChildren()) {
        const tmp = this.getCellBounds(child, includeEdges, true);

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
   * Returns the bounding box for the geometries of the vertices in the
   * given array of cells. This can be used to find the graph bounds during
   * a layout operation (ie. before the last endUpdate) as follows:
   *
   * ```javascript
   * var cells = graph.getChildCells(graph.getDefaultParent(), true, true);
   * var bounds = graph.getBoundingBoxFromGeometry(cells, true);
   * ```
   *
   * This can then be used to move cells to the origin:
   *
   * ```javascript
   * if (bounds.x < 0 || bounds.y < 0)
   * {
   *   graph.moveCells(cells, -Math.min(bounds.x, 0), -Math.min(bounds.y, 0))
   * }
   * ```
   *
   * Or to translate the graph view:
   *
   * ```javascript
   * if (bounds.x < 0 || bounds.y < 0)
   * {
   *   graph.view.setTranslate(-Math.min(bounds.x, 0), -Math.min(bounds.y, 0));
   * }
   * ```
   *
   * @param cells Array of {@link Cell} whose bounds should be returned.
   * @param includeEdges Specifies if edge bounds should be included by computing
   * the bounding box for all points in geometry. Default is `false`.
   */
  getBoundingBoxFromGeometry(
    cells: CellArray,
    includeEdges: boolean = false
  ): Rectangle | null {
    includeEdges = includeEdges != null ? includeEdges : false;
    let result = null;
    let tmp: Rectangle | null = null;

    if (cells != null) {
      for (const cell of cells) {
        if (includeEdges || cell.isVertex()) {
          // Computes the bounding box for the points in the geometry
          const geo = cell.getGeometry();

          if (geo != null) {
            let bbox = null;

            if (cell.isEdge()) {
              const addPoint = (pt: Point | null) => {
                if (pt != null) {
                  if (tmp == null) {
                    tmp = new Rectangle(pt.x, pt.y, 0, 0);
                  } else {
                    tmp.add(new Rectangle(pt.x, pt.y, 0, 0));
                  }
                }
              };

              if (cell.getTerminal(true) == null) {
                addPoint(geo.getTerminalPoint(true));
              }

              if (cell.getTerminal(false) == null) {
                addPoint(geo.getTerminalPoint(false));
              }

              const pts = geo.points;

              if (pts != null && pts.length > 0) {
                tmp = new Rectangle(pts[0].x, pts[0].y, 0, 0);

                for (let j = 1; j < pts.length; j++) {
                  addPoint(pts[j]);
                }
              }

              bbox = tmp;
            } else {
              const parent = <Cell>cell.getParent();

              if (geo.relative) {
                if (
                  parent.isVertex() &&
                  parent !== this.getView().currentRoot
                ) {
                  tmp = this.getBoundingBoxFromGeometry(new CellArray(parent), false);

                  if (tmp != null) {
                    bbox = new Rectangle(
                      geo.x * tmp.width,
                      geo.y * tmp.height,
                      geo.width,
                      geo.height
                    );

                    if (cells.indexOf(parent) >= 0) {
                      bbox.x += tmp.x;
                      bbox.y += tmp.y;
                    }
                  }
                }
              } else {
                bbox = Rectangle.fromRectangle(geo);

                if (parent.isVertex() && cells.indexOf(parent) >= 0) {
                  tmp = this.getBoundingBoxFromGeometry(new CellArray(parent), false);

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
                const angle = getValue(style, 'rotation', 0);

                if (angle !== 0) {
                  bbox = getBoundingBox(bbox, angle);
                }
              }
            }

            if (bbox != null) {
              if (result == null) {
                result = Rectangle.fromRectangle(bbox);
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
   * Clears all cell states or the states for the hierarchy starting at the
   * given cell and validates the graph. This fires a refresh event as the
   * last step.
   *
   * @param cell Optional {@link Cell} for which the cell states should be cleared.
   */
  refresh(cell: Cell | null = null): void {
    if (cell) {
      this.getView().clear(cell, false);
    } else {
      this.getView().clear(undefined, true);
    }
    this.getView().validate();
    this.sizeDidChange();
    this.fireEvent(new EventObject(InternalEvent.REFRESH));
  }

  /**
   * Snaps the given numeric value to the grid if {@link gridEnabled} is true.
   *
   * @param value Numeric value to be snapped to the grid.
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
  snapDelta(
    delta: Point,
    bounds: Rectangle,
    ignoreGrid: boolean = false,
    ignoreHorizontal: boolean = false,
    ignoreVertical: boolean = false
  ): Point {
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
   * Zooms into the graph by {@link zoomFactor}.
   */
  zoomIn(): void {
    this.zoom(this.zoomFactor);
  }

  /**
   * Zooms out of the graph by {@link zoomFactor}.
   */
  zoomOut(): void {
    this.zoom(1 / this.zoomFactor);
  }

  /**
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
   * Zooms the graph to the given scale with an optional boolean center
   * argument, which is passd to {@link zoom}.
   */
  zoomTo(scale: number, center: boolean = false): void {
    this.zoom(scale / this.getView().scale, center);
  }

  /**
   * Centers the graph in the container.
   *
   * @param horizontal Optional boolean that specifies if the graph should be centered
   * horizontally. Default is `true`.
   * @param vertical Optional boolean that specifies if the graph should be centered
   * vertically. Default is `true`.
   * @param cx Optional float that specifies the horizontal center. Default is `0.5`.
   * @param cy Optional float that specifies the vertical center. Default is `0.5`.
   */
  center(
    horizontal: boolean = true,
    vertical: boolean = true,
    cx: number = 0.5,
    cy: number = 0.5
  ): void {

    const container = <HTMLElement>this.container;
    const _hasScrollbars = hasScrollbars(this.container);
    const padding = 2 * this.getBorder();
    const cw = container.clientWidth - padding;
    const ch = container.clientHeight - padding;
    const bounds = this.getGraphBounds();

    const t = this.getView().translate;
    const s = this.getView().scale;

    let dx = horizontal ? cw - bounds.width : 0;
    let dy = vertical ? ch - bounds.height : 0;

    if (!_hasScrollbars) {
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
   * Zooms the graph using the given factor. Center is an optional boolean
   * argument that keeps the graph scrolled to the center. If the center argument
   * is omitted, then {@link centerZoom} will be used as its value.
   */
  zoom(factor: number, center: boolean = this.centerZoom): void {
    const scale = Math.round(this.getView().scale * factor * 100) / 100;
    const state = this.getView().getState(this.getSelectionCell());
    const container = <HTMLElement>this.container;
    factor = scale / this.getView().scale;

    if (this.keepSelectionVisibleOnZoom && state != null) {
      const rect = new Rectangle(
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
      const _hasScrollbars = hasScrollbars(this.container);

      if (center && !_hasScrollbars) {
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

        if (_hasScrollbars) {
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
   * Zooms the graph to the specified rectangle. If the rectangle does not have same aspect
   * ratio as the display container, it is increased in the smaller relative dimension only
   * until the aspect match. The original rectangle is centralised within this expanded one.
   *
   * Note that the input rectangular must be un-scaled and un-translated.
   *
   * @param rect The un-scaled and un-translated rectangluar region that should be just visible
   * after the operation
   */
  zoomToRect(rect: Rectangle): void {
    const container = <HTMLElement>this.container;
    const scaleX = container.clientWidth / rect.width;
    const scaleY = container.clientHeight / rect.height;
    const aspectFactor = scaleX / scaleY;

    // Remove any overlap of the rect outside the client area
    rect.x = Math.max(0, rect.x);
    rect.y = Math.max(0, rect.y);
    let rectRight = Math.min(container.scrollWidth, rect.x + rect.width);
    let rectBottom = Math.min(container.scrollHeight, rect.y + rect.height);
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

    if (!hasScrollbars(this.container)) {
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
   * Returns true if perimeter points should be computed such that the
   * resulting edge has only horizontal or vertical segments.
   *
   * @param edge {@link mxCellState} that represents the edge.
   */
  isOrthogonal(edge: CellState): boolean {
    /*
    'orthogonal' defines if the connection points on either end of the edge should
    be computed so that the edge is vertical or horizontal if possible
    and if the point is not at a fixed location. Default is false.
    This also returns true if the edgeStyle of the edge is an elbow or
    entity.
     */
    const orthogonal = edge.style.orthogonal;

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

  /*****************************************************************************
   * Group: Graph appearance
   *****************************************************************************/

  /**
   * Returns the {@link backgroundImage} as an {@link Image}.
   */
  getBackgroundImage(): Image | null {
    return this.backgroundImage;
  }

  /**
   * Sets the new {@link backgroundImage}.
   *
   * @param image New {@link Image} to be used for the background.
   */
  setBackgroundImage(image: Image | null): void {
    this.backgroundImage = image;
  }

  /**
   * Returns the textual representation for the given cell. This
   * implementation returns the nodename or string-representation of the user
   * object.
   *
   *
   * The following returns the label attribute from the cells user
   * object if it is an XML node.
   *
   * @example
   * ```javascript
   * graph.convertValueToString = function(cell)
   * {
   * 	return cell.getAttribute('label');
   * }
   * ```
   *
   * See also: {@link cellLabelChanged}.
   *
   * @param cell {@link mxCell} whose textual representation should be returned.
   */
  convertValueToString(cell: Cell): string | null {
    const value = cell.getValue();

    if (value != null) {
      if (isNode(value)) {
        return value.nodeName;
      }
      if (typeof value.toString === 'function') {
        return value.toString();
      }
    }
    return '';
  }

  /**
   * Returns a string or DOM node that represents the label for the given
   * cell. This implementation uses {@link convertValueToString} if {@link labelsVisible}
   * is true. Otherwise it returns an empty string.
   *
   * To truncate a label to match the size of the cell, the following code
   * can be used.
   *
   * ```javascript
   * graph.getLabel = function(cell)
   * {
   *   var label = getLabel.apply(this, arguments);
   *
   *   if (label != null && this.model.isVertex(cell))
   *   {
   *     var geo = cell.getCellGeometry();
   *
   *     if (geo != null)
   *     {
   *       var max = parseInt(geo.width / 8);
   *
   *       if (label.length > max)
   *       {
   *         label = label.substring(0, max)+'...';
   *       }
   *     }
   *   }
   *   return mxUtils.htmlEntities(label);
   * }
   * ```
   *
   * A resize listener is needed in the graph to force a repaint of the label
   * after a resize.
   *
   * ```javascript
   * graph.addListener(mxEvent.RESIZE_CELLS, function(sender, evt)
   * {
   *   var cells = evt.getProperty('cells');
   *
   *   for (var i = 0; i < cells.length; i++)
   *   {
   *     this.view.removeState(cells[i]);
   *   }
   * });
   * ```
   *
   * @param cell {@link mxCell} whose label should be returned.
   */
  getLabel(cell: Cell): string | Node | null {
    let result: string | null = '';

    if (this.labelsVisible && cell != null) {
      const style = this.getCurrentCellStyle(cell);

      if (!getValue(style, 'noLabel', false)) {
        result = this.convertValueToString(cell);
      }
    }
    return result;
  }

  /**
   * Returns true if the label must be rendered as HTML markup. The default
   * implementation returns {@link htmlLabels}.
   *
   * @param cell {@link mxCell} whose label should be displayed as HTML markup.
   */
  isHtmlLabel(cell: Cell): boolean {
    return this.isHtmlLabels();
  }

  /**
   * Returns {@link htmlLabels}.
   */
  isHtmlLabels(): boolean {
    return this.htmlLabels;
  }

  /**
   * Sets {@link htmlLabels}.
   */
  setHtmlLabels(value: boolean): void {
    this.htmlLabels = value;
  }

  /**
   * This enables wrapping for HTML labels.
   *
   * Returns true if no white-space CSS style directive should be used for
   * displaying the given cells label. This implementation returns true if
   * {@link 'whiteSpace'} in the style of the given cell is 'wrap'.
   *
   * This is used as a workaround for IE ignoring the white-space directive
   * of child elements if the directive appears in a parent element. It
   * should be overridden to return true if a white-space directive is used
   * in the HTML markup that represents the given cells label. In order for
   * HTML markup to work in labels, {@link isHtmlLabel} must also return true
   * for the given cell.
   *
   * @example
   *
   * ```javascript
   * graph.getLabel = function(cell)
   * {
   *   var tmp = getLabel.apply(this, arguments); // "supercall"
   *
   *   if (this.model.isEdge(cell))
   *   {
   *     tmp = '<div style="width: 150px; white-space:normal;">'+tmp+'</div>';
   *   }
   *
   *   return tmp;
   * }
   *
   * graph.isWrapping = function(state)
   * {
   * 	 return this.model.isEdge(state.cell);
   * }
   * ```
   *
   * Makes sure no edge label is wider than 150 pixels, otherwise the content
   * is wrapped. Note: No width must be specified for wrapped vertex labels as
   * the vertex defines the width in its geometry.
   *
   * @param state {@link mxCell} whose label should be wrapped.
   */
  isWrapping(cell: Cell): boolean {
    return this.getCurrentCellStyle(cell).whiteSpace === 'wrap';
  }

  /**
   * Returns true if the overflow portion of labels should be hidden. If this
   * returns true then vertex labels will be clipped to the size of the vertices.
   * This implementation returns true if `overflow` in the
   * style of the given cell is 'hidden'.
   *
   * @param state {@link mxCell} whose label should be clipped.
   */
  isLabelClipped(cell: Cell): boolean {
    return this.getCurrentCellStyle(cell).overflow === 'hidden';
  }

  /**
   * Returns the string or DOM node that represents the tooltip for the given
   * state, node and coordinate pair. This implementation checks if the given
   * node is a folding icon or overlay and returns the respective tooltip. If
   * this does not result in a tooltip, the handler for the cell is retrieved
   * from {@link selectionCellsHandler} and the optional getTooltipForNode method is
   * called. If no special tooltip exists here then {@link getTooltipForCell} is used
   * with the cell in the given state as the argument to return a tooltip for the
   * given state.
   *
   * @param state {@link mxCellState} whose tooltip should be returned.
   * @param node DOM node that is currently under the mouse.
   * @param x X-coordinate of the mouse.
   * @param y Y-coordinate of the mouse.
   */
  // getTooltip(state: mxCellState, node: Node, x: number, y: number): string;
  getTooltip(
    state: CellState,
    node: HTMLElement,
    x: number,
    y: number
  ): string | null {
    let tip: string | null = null;

    if (state != null) {
      // Checks if the mouse is over the folding icon
      if (
        state.control != null &&
        // @ts-ignore
        (node === state.control.node || node.parentNode === state.control.node)
      ) {
        tip = this.collapseExpandResource;
        tip = htmlEntities(Resources.get(tip) || tip, true).replace(
          /\\n/g,
          '<br>'
        );
      }

      if (tip == null && state.overlays != null) {
        state.overlays.visit((id: string, shape: Shape) => {
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
        const handler = (<mxSelectionCellsHandler>(
          this.selectionCellsHandler
        )).getHandler(<Cell>state.cell);
        if (
          handler != null &&
          typeof handler.getTooltipForNode === 'function'
        ) {
          tip = handler.getTooltipForNode(node);
        }
      }

      if (tip == null) {
        tip = this.getTooltipForCell(<Cell>state.cell);
      }
    }
    return tip;
  }

  /**
   * Returns the string or DOM node to be used as the tooltip for the given
   * cell. This implementation uses the cells getTooltip function if it
   * exists, or else it returns {@link convertValueToString} for the cell.
   *
   * @example
   *
   * ```javascript
   * graph.getTooltipForCell = function(cell)
   * {
   *   return 'Hello, World!';
   * }
   * ```
   *
   * Replaces all tooltips with the string Hello, World!
   *
   * @param cell {@link mxCell} whose tooltip should be returned.
   */
  getTooltipForCell(cell: Cell): string | null {
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
   * Returns the string to be used as the link for the given cell. This
   * implementation returns null.
   *
   * @param cell {@link mxCell} whose tooltip should be returned.
   */
  getLinkForCell(cell: Cell): string | null {
    return null;
  }

  /**
   * Returns the cursor value to be used for the CSS of the shape for the
   * given event. This implementation calls {@link getCursorForCell}.
   *
   * @param me {@link mxMouseEvent} whose cursor should be returned.
   */
  getCursorForMouseEvent(me: InternalMouseEvent): string | null {
    return this.getCursorForCell(me.getCell());
  }

  /**
   * Returns the cursor value to be used for the CSS of the shape for the
   * given cell. This implementation returns null.
   *
   * @param cell {@link mxCell} whose cursor should be returned.
   */
  getCursorForCell(cell: Cell): string | null {
    return null;
  }

  /**
   * Returns the start size of the given swimlane, that is, the width or
   * height of the part that contains the title, depending on the
   * horizontal style. The return value is an {@link Rectangle} with either
   * width or height set as appropriate.
   *
   * @param swimlane {@link mxCell} whose start size should be returned.
   * @param ignoreState Optional boolean that specifies if cell state should be ignored.
   */
  getStartSize(swimlane: Cell, ignoreState: boolean = false): Rectangle {
    const result = new Rectangle();
    const style = this.getCurrentCellStyle(swimlane, ignoreState);
    const size = parseInt(
      getValue(style, 'startSize', DEFAULT_STARTSIZE)
    );

    if (getValue(style, 'horizontal', true)) {
      result.height = size;
    } else {
      result.width = size;
    }
    return result;
  }

  /**
   * Returns the direction for the given swimlane style.
   */
  getSwimlaneDirection(style: any): string {
    const dir = getValue(style, 'direction', DIRECTION_EAST);
    const flipH = getValue(style, 'flipH', 0) == 1;
    const flipV = getValue(style, 'flipV', 0) == 1;
    const h = getValue(style, 'horizontal', true);
    let n = h ? 0 : 3;

    if (dir === DIRECTION_NORTH) {
      n--;
    } else if (dir === DIRECTION_WEST) {
      n += 2;
    } else if (dir === DIRECTION_SOUTH) {
      n += 1;
    }

    const mod = utils.mod(n, 2);

    if (flipH && mod === 1) {
      n += 2;
    }

    if (flipV && mod === 0) {
      n += 2;
    }

    return [DIRECTION_NORTH, DIRECTION_EAST, DIRECTION_SOUTH, DIRECTION_WEST][
      utils.mod(n, 4)
    ];
  }

  /**
   * Returns the actual start size of the given swimlane taking into account
   * direction and horizontal and vertial flip styles. The start size is
   * returned as an {@link Rectangle} where top, left, bottom, right start sizes
   * are returned as x, y, height and width, respectively.
   *
   * @param swimlane {@link mxCell} whose start size should be returned.
   * @param ignoreState Optional boolean that specifies if cell state should be ignored.
   */
  getActualStartSize(
    swimlane: Cell,
    ignoreState: boolean = false
  ): Rectangle {
    const result = new Rectangle();

    if (this.isSwimlane(swimlane, ignoreState)) {
      const style = this.getCurrentCellStyle(swimlane, ignoreState);
      const size = parseInt(getValue(style, 'startSize', DEFAULT_STARTSIZE));
      const dir = this.getSwimlaneDirection(style);

      if (dir === DIRECTION_NORTH) {
        result.y = size;
      } else if (dir === DIRECTION_WEST) {
        result.x = size;
      } else if (dir === DIRECTION_SOUTH) {
        result.height = size;
      } else {
        result.width = size;
      }
    }
    return result;
  }

  /**
   * Returns the image URL for the given cell state. This implementation
   * returns the value stored under {@link 'image'} in the cell
   * style.
   *
   * @param state {@link mxCellState} whose image URL should be returned.
   */
  getImage(state: CellState): Image | null {
    return state != null && state.style != null
      ? state.style.image
      : null;
  }

  /**
   * Returns true if the given state has no stroke- or fillcolor and no image.
   *
   * @param state {@link mxCellState} to check.
   */
  isTransparentState(state: CellState): boolean {
    let result = false;
    if (state != null) {
      const stroke = getValue(state.style, 'strokeColor', NONE);
      const fill = getValue(state.style, 'fillColor', NONE);
      result = stroke === NONE && fill === NONE && this.getImage(state) == null;
    }
    return result;
  }

  /**
   * Returns the vertical alignment for the given cell state. This
   * implementation returns the value stored under
   * {@link 'verticalAlign'} in the cell style.
   *
   * @param state {@link mxCellState} whose vertical alignment should be
   * returned.
   */
  getVerticalAlign(state: CellState): string | null {
    return state != null && state.style != null
      ? state.style.verticalAlign || ALIGN_MIDDLE
      : null;
  }

  /**
   * Returns the indicator color for the given cell state. This
   * implementation returns the value stored under
   * {@link mxConstants.STYLE_INDICATOR_COLOR} in the cell style.
   *
   * @param state {@link mxCellState} whose indicator color should be
   * returned.
   */
  getIndicatorColor(state: CellState): string | null {
    return state != null && state.style != null
      ? state.style.indicatorColor
      : null;
  }

  /**
   * Returns the indicator gradient color for the given cell state. This
   * implementation returns the value stored under
   * {@link mxConstants.STYLE_INDICATOR_GRADIENTCOLOR} in the cell style.
   *
   * @param state {@link mxCellState} whose indicator gradient color should be
   * returned.
   */
  getIndicatorGradientColor(state: CellState): string | null {
    return state != null && state.style != null
      ? state.style.gradientColor
      : null;
  }

  /**
   * Returns the indicator shape for the given cell state. This
   * implementation returns the value stored under
   * {@link mxConstants.STYLE_INDICATOR_SHAPE} in the cell style.
   *
   * @param state {@link mxCellState} whose indicator shape should be returned.
   */
  getIndicatorShape(state: CellState): string | null {
    return state != null && state.style != null
      ? state.style.indicatorShape
      : null;
  }

  /**
   * Returns the indicator image for the given cell state. This
   * implementation returns the value stored under
   * {@link mxConstants.STYLE_INDICATOR_IMAGE} in the cell style.
   *
   * @param state {@link mxCellState} whose indicator image should be returned.
   */
  getIndicatorImage(state: CellState): Image | null {
    return state != null && state.style != null
      ? state.style.indicatorImage
      : null;
  }

  /**
   * Returns the value of {@link border}.
   */
  getBorder(): number {
    return this.border;
  }

  /**
   * Sets the value of {@link border}.
   *
   * @param value Positive integer that represents the border to be used.
   */
  setBorder(value: number): void {
    this.border = value;
  }

  /**
   * Returns true if the given cell is a swimlane in the graph. A swimlane is
   * a container cell with some specific behaviour. This implementation
   * checks if the shape associated with the given cell is a {@link mxSwimlane}.
   *
   * @param cell {@link mxCell} to be checked.
   * @param ignoreState Optional boolean that specifies if the cell state should be ignored.
   */
  isSwimlane(cell: Cell, ignoreState: boolean = false): boolean {
    if (
      cell != null &&
      cell.getParent() !== this.getModel().getRoot() &&
      !cell.isEdge()
    ) {
      return (
        this.getCurrentCellStyle(cell, ignoreState).shape ===
        SHAPE_SWIMLANE
      );
    }
    return false;
  }

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Returns {@link resizeContainer}.
   */
  isResizeContainer(): boolean {
    return this.resizeContainer;
  }

  /**
   * Sets {@link resizeContainer}.
   *
   * @param value Boolean indicating if the container should be resized.
   */
  setResizeContainer(value: boolean) {
    this.resizeContainer = value;
  }

  /**
   * Returns true if the graph is {@link enabled}.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Specifies if the graph should allow any interactions. This
   * implementation updates {@link enabled}.
   *
   * @param value Boolean indicating if the graph should be enabled.
   */
  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  /**
   * Returns {@link escapeEnabled}.
   */
  isEscapeEnabled(): boolean {
    return this.escapeEnabled;
  }

  /**
   * Sets {@link escapeEnabled}.
   *
   * @param enabled Boolean indicating if escape should be enabled.
   */
  setEscapeEnabled(value: boolean): void {
    this.escapeEnabled = value;
  }

  /**
   * Returns {@link invokesStopCellEditing}.
   */
  isInvokesStopCellEditing(): boolean {
    return this.invokesStopCellEditing;
  }

  /**
   * Sets {@link invokesStopCellEditing}.
   */
  setInvokesStopCellEditing(value: boolean): void {
    this.invokesStopCellEditing = value;
  }

  /**
   * Returns {@link enterStopsCellEditing}.
   */
  isEnterStopsCellEditing(): boolean {
    return this.enterStopsCellEditing;
  }

  /**
   * Sets {@link enterStopsCellEditing}.
   */
  setEnterStopsCellEditing(value: boolean): void {
    this.enterStopsCellEditing = value;
  }

  /**
   * Returns true if the given edges's label is moveable. This returns
   * {@link movable} for all given cells if {@link isLocked} does not return true
   * for the given cell.
   *
   * @param cell {@link mxCell} whose label should be moved.
   */
  isLabelMovable(cell: Cell): boolean {
    return (
      !this.isCellLocked(cell) &&
      ((cell.isEdge() && this.edgeLabelsMovable) ||
        (cell.isVertex() && this.vertexLabelsMovable))
    );
  }

  /**
   * Returns {@link gridEnabled} as a boolean.
   */
  isGridEnabled(): boolean {
    return this.gridEnabled;
  }

  /**
   * Specifies if the grid should be enabled.
   *
   * @param value Boolean indicating if the grid should be enabled.
   */
  setGridEnabled(value: boolean): void {
    this.gridEnabled = value;
  }

  /**
   * Returns {@link portsEnabled} as a boolean.
   */
  isPortsEnabled(): boolean {
    return this.portsEnabled;
  }

  /**
   * Specifies if the ports should be enabled.
   *
   * @param value Boolean indicating if the ports should be enabled.
   */
  setPortsEnabled(value: boolean): void {
    this.portsEnabled = value;
  }

  /**
   * Returns {@link gridSize}.
   */
  getGridSize(): number {
    return this.gridSize;
  }

  /**
   * Sets {@link gridSize}.
   */
  setGridSize(value: number): void {
    this.gridSize = value;
  }

  /**
   * Returns {@link tolerance}.
   */
  getTolerance(): number {
    return this.tolerance;
  }

  /**
   * Sets {@link tolerance}.
   */
  setTolerance(value: number): void {
    this.tolerance = value;
  }

  /**
   * Returns {@link swimlaneNesting} as a boolean.
   */
  isSwimlaneNesting(): boolean {
    return this.swimlaneNesting;
  }

  /**
   * Specifies if swimlanes can be nested by drag and drop. This is only
   * taken into account if dropEnabled is true.
   *
   * @param value Boolean indicating if swimlanes can be nested.
   */
  setSwimlaneNesting(value: boolean): void {
    this.swimlaneNesting = value;
  }

  /**
   * Returns {@link swimlaneSelectionEnabled} as a boolean.
   */
  isSwimlaneSelectionEnabled(): boolean {
    return this.swimlaneSelectionEnabled;
  }

  /**
   * Specifies if swimlanes should be selected if the mouse is released
   * over their content area.
   *
   * @param value Boolean indicating if swimlanes content areas
   * should be selected when the mouse is released over them.
   */
  setSwimlaneSelectionEnabled(value: boolean): void {
    this.swimlaneSelectionEnabled = value;
  }

  /**
   * Returns {@link multigraph} as a boolean.
   */
  isMultigraph(): boolean {
    return this.multigraph;
  }

  /**
   * Specifies if the graph should allow multiple connections between the
   * same pair of vertices.
   *
   * @param value Boolean indicating if the graph allows multiple connections
   * between the same pair of vertices.
   */
  setMultigraph(value: boolean): void {
    this.multigraph = value;
  }

  /**
   * Returns {@link allowLoops} as a boolean.
   */
  isAllowLoops(): boolean {
    return this.allowLoops;
  }

  /**
   * Specifies if loops are allowed.
   *
   * @param value Boolean indicating if loops are allowed.
   */
  setAllowLoops(value: boolean): void {
    this.allowLoops = value;
  }

  /**
   * Returns {@link disconnectOnMove} as a boolean.
   */
  isDisconnectOnMove(): boolean {
    return this.disconnectOnMove;
  }

  /**
   * Specifies if edges should be disconnected when moved. (Note: Cloned
   * edges are always disconnected.)
   *
   * @param value Boolean indicating if edges should be disconnected
   * when moved.
   */
  setDisconnectOnMove(value: boolean): void {
    this.disconnectOnMove = value;
  }

  /**
   * Returns {@link dropEnabled} as a boolean.
   */
  isDropEnabled(): boolean {
    return this.dropEnabled;
  }

  /**
   * Specifies if the graph should allow dropping of cells onto or into other
   * cells.
   *
   * @param dropEnabled Boolean indicating if the graph should allow dropping
   * of cells into other cells.
   */
  setDropEnabled(value: boolean): void {
    this.dropEnabled = value;
  }

  /**
   * Returns {@link splitEnabled} as a boolean.
   */
  isSplitEnabled(): boolean {
    return this.splitEnabled;
  }

  /**
   * Specifies if the graph should allow dropping of cells onto or into other
   * cells.
   *
   * @param dropEnabled Boolean indicating if the graph should allow dropping
   * of cells into other cells.
   */
  setSplitEnabled(value: boolean): void {
    this.splitEnabled = value;
  }

  /**
   * Returns true if the given terminal point is movable. This is independent
   * from {@link isCellConnectable} and {@link isCellDisconnectable} and controls if terminal
   * points can be moved in the graph if the edge is not connected. Note that it
   * is required for this to return true to connect unconnected edges. This
   * implementation returns true.
   *
   * @param cell {@link mxCell} whose terminal point should be moved.
   * @param source Boolean indicating if the source or target terminal should be moved.
   */
  isTerminalPointMovable(cell: Cell, source: boolean): boolean {
    return true;
  }

  /**
   * Returns true if the given cell is bendable. This returns {@link cellsBendable}
   * for all given cells if {@link isLocked} does not return true for the given
   * cell and its style does not specify {@link mxConstants.STYLE_BENDABLE} to be 0.
   *
   * @param cell {@link mxCell} whose bendable state should be returned.
   */
  isCellBendable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return (
      this.isCellsBendable() &&
      !this.isCellLocked(cell) &&
      style.bendable !== 0
    );
  }

  /**
   * Returns {@link cellsBenadable}.
   */
  isCellsBendable(): boolean {
    return this.cellsBendable;
  }

  /**
   * Specifies if the graph should allow bending of edges. This
   * implementation updates {@link bendable}.
   *
   * @param value Boolean indicating if the graph should allow bending of
   * edges.
   */
  setCellsBendable(value: boolean): void {
    this.cellsBendable = value;
  }

  /**
   * Returns true if the given cell is editable. This returns {@link cellsEditable} for
   * all given cells if {@link isCellLocked} does not return true for the given cell
   * and its style does not specify {@link 'editable'} to be 0.
   *
   * @param cell {@link mxCell} whose editable state should be returned.
   */
  isCellEditable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return (
      this.isCellsEditable() &&
      !this.isCellLocked(cell) &&
      style.editable != 0
    );
  }

  /**
   * Returns {@link cellsEditable}.
   */
  isCellsEditable(): boolean {
    return this.cellsEditable;
  }

  /**
   * Specifies if the graph should allow in-place editing for cell labels.
   * This implementation updates {@link cellsEditable}.
   *
   * @param value Boolean indicating if the graph should allow in-place
   * editing.
   */
  setCellsEditable(value: boolean): void {
    this.cellsEditable = value;
  }

  /**
   * Returns true if the given cell is disconnectable from the source or
   * target terminal. This returns {@link isCellsDisconnectable} for all given
   * cells if {@link isCellLocked} does not return true for the given cell.
   *
   * @param cell {@link mxCell} whose disconnectable state should be returned.
   * @param terminal {@link mxCell} that represents the source or target terminal.
   * @param source Boolean indicating if the source or target terminal is to be
   * disconnected.
   */
  isCellDisconnectable(
    cell: Cell,
    terminal: Cell | null = null,
    source: boolean = false
  ): boolean {
    return this.isCellsDisconnectable() && !this.isCellLocked(cell);
  }

  /**
   * Returns {@link cellsDisconnectable}.
   */
  isCellsDisconnectable(): boolean {
    return this.cellsDisconnectable;
  }

  /**
   * Sets {@link cellsDisconnectable}.
   */
  setCellsDisconnectable(value: boolean): void {
    this.cellsDisconnectable = value;
  }

  /**
   * Returns true if the given cell is a valid source for new connections.
   * This implementation returns true for all non-null values and is
   * called by is called by {@link isValidConnection}.
   *
   * @param cell {@link mxCell} that represents a possible source or null.
   */
  isValidSource(cell: Cell): boolean {
    return (
      (cell == null && this.allowDanglingEdges) ||
      (cell != null &&
        (!cell.isEdge() || this.connectableEdges) &&
        cell.isConnectable())
    );
  }

  /**
   * Returns {@link isValidSource} for the given cell. This is called by
   * {@link isValidConnection}.
   *
   * @param cell {@link mxCell} that represents a possible target or null.
   */
  isValidTarget(cell: Cell): boolean {
    return this.isValidSource(cell);
  }

  /**
   * Returns true if the given target cell is a valid target for source.
   * This is a boolean implementation for not allowing connections between
   * certain pairs of vertices and is called by {@link getEdgeValidationError}.
   * This implementation returns true if {@link isValidSource} returns true for
   * the source and {@link isValidTarget} returns true for the target.
   *
   * @param source {@link mxCell} that represents the source cell.
   * @param target {@link mxCell} that represents the target cell.
   */
  isValidConnection(source: Cell, target: Cell): boolean {
    return this.isValidSource(source) && this.isValidTarget(target);
  }

  /**
   * Specifies if the graph should allow new connections. This implementation
   * updates {@link mxConnectionHandler.enabled} in {@link connectionHandler}.
   *
   * @param connectable Boolean indicating if new connections should be allowed.
   */
  setConnectable(connectable: boolean): void {
    (<mxConnectionHandler>this.connectionHandler).setEnabled(connectable);
  }

  /**
   * Returns true if the {@link connectionHandler} is enabled.
   */
  isConnectable(): boolean {
    return (<mxConnectionHandler>this.connectionHandler).isEnabled();
  }

  /**
   * Specifies if tooltips should be enabled. This implementation updates
   * {@link TooltipHandler.enabled} in {@link tooltipHandler}.
   *
   * @param enabled Boolean indicating if tooltips should be enabled.
   */
  setTooltips(enabled: boolean): void {
    (<TooltipHandler>this.tooltipHandler).setEnabled(enabled);
  }

  /**
   * Specifies if panning should be enabled. This implementation updates
   * {@link PanningHandler.panningEnabled} in {@link panningHandler}.
   *
   * @param enabled Boolean indicating if panning should be enabled.
   */
  setPanning(enabled: boolean): void {
    (<PanningHandler>this.panningHandler).panningEnabled = enabled;
  }

  /**
   * Returns true if the given cell is currently being edited.
   * If no cell is specified then this returns true if any
   * cell is currently being edited.
   *
   * @param cell {@link mxCell} that should be checked.
   */
  isEditing(cell: Cell | null = null): boolean {
    if (this.cellEditor != null) {
      const editingCell = this.cellEditor.getEditingCell();
      return cell == null ? editingCell != null : cell === editingCell;
    }
    return false;
  }

  /**
   * Returns true if the size of the given cell should automatically be
   * updated after a change of the label. This implementation returns
   * {@link autoSizeCells} or checks if the cell style does specify
   * {@link 'autoSize'} to be 1.
   *
   * @param cell {@link mxCell} that should be resized.
   */
  isAutoSizeCell(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return this.isAutoSizeCells() || style.autosize == 1;
  }

  /**
   * Returns {@link autoSizeCells}.
   */
  isAutoSizeCells(): boolean {
    return this.autoSizeCells;
  }

  /**
   * Specifies if cell sizes should be automatically updated after a label
   * change. This implementation sets {@link autoSizeCells} to the given parameter.
   * To update the size of cells when the cells are added, set
   * {@link autoSizeCellsOnAdd} to true.
   *
   * @param value Boolean indicating if cells should be resized
   * automatically.
   */
  setAutoSizeCells(value: boolean): void {
    this.autoSizeCells = value;
  }

  /**
   * Returns true if the parent of the given cell should be extended if the
   * child has been resized so that it overlaps the parent. This
   * implementation returns {@link isExtendParents} if the cell is not an edge.
   *
   * @param cell {@link mxCell} that has been resized.
   */
  isExtendParent(cell: Cell): boolean {
    return !cell.isEdge() && this.isExtendParents();
  }

  /**
   * Returns {@link extendParents}.
   */
  isExtendParents(): boolean {
    return this.extendParents;
  }

  /**
   * Sets {@link extendParents}.
   *
   * @param value New boolean value for {@link extendParents}.
   */
  setExtendParents(value: boolean): void {
    this.extendParents = value;
  }

  /**
   * Returns {@link extendParentsOnAdd}.
   */
  isExtendParentsOnAdd(cell: Cell): boolean {
    return this.extendParentsOnAdd;
  }

  /**
   * Sets {@link extendParentsOnAdd}.
   *
   * @param value New boolean value for {@link extendParentsOnAdd}.
   */
  setExtendParentsOnAdd(value: boolean): void {
    this.extendParentsOnAdd = value;
  }

  /**
   * Returns {@link extendParentsOnMove}.
   */
  isExtendParentsOnMove(): boolean {
    return this.extendParentsOnMove;
  }

  /**
   * Sets {@link extendParentsOnMove}.
   *
   * @param value New boolean value for {@link extendParentsOnAdd}.
   */
  setExtendParentsOnMove(value: boolean): void {
    this.extendParentsOnMove = value;
  }

  /**
   * Returns {@link recursiveResize}.
   *
   * @param state {@link mxCellState} that is being resized.
   */
  isRecursiveResize(state: CellState | null = null): boolean {
    return this.recursiveResize;
  }

  /**
   * Sets {@link recursiveResize}.
   *
   * @param value New boolean value for {@link recursiveResize}.
   */
  setRecursiveResize(value: boolean): void {
    this.recursiveResize = value;
  }

  /**
   * Returns {@link allowNegativeCoordinates}.
   */
  isAllowNegativeCoordinates(): boolean {
    return this.allowNegativeCoordinates;
  }

  /**
   * Sets {@link allowNegativeCoordinates}.
   */
  setAllowNegativeCoordinates(value: boolean): void {
    this.allowNegativeCoordinates = value;
  }

  /**
   * Returns a decimal number representing the amount of the width and height
   * of the given cell that is allowed to overlap its parent. A value of 0
   * means all children must stay inside the parent, 1 means the child is
   * allowed to be placed outside of the parent such that it touches one of
   * the parents sides. If {@link isAllowOverlapParent} returns false for the given
   * cell, then this method returns 0.
   *
   * @param cell {@link mxCell} for which the overlap ratio should be returned.
   */
  getOverlap(cell: Cell): number {
    return this.isAllowOverlapParent(cell) ? this.defaultOverlap : 0;
  }

  /**
   * Returns true if the given cell is allowed to be placed outside of the
   * parents area.
   *
   * @param cell {@link mxCell} that represents the child to be checked.
   */
  isAllowOverlapParent(cell: Cell): boolean {
    return false;
  }

  /**
   * Returns true if the given cell is a valid drop target for the specified
   * cells. If {@link splitEnabled} is true then this returns {@link isSplitTarget} for
   * the given arguments else it returns true if the cell is not collapsed
   * and its child count is greater than 0.
   *
   * @param cell {@link mxCell} that represents the possible drop target.
   * @param cells {@link mxCell} that should be dropped into the target.
   * @param evt Mouseevent that triggered the invocation.
   */
  // isValidDropTarget(cell: mxCell, cells: mxCellArray, evt: Event): boolean;
  isValidDropTarget(cell: Cell, cells: CellArray, evt: InternalMouseEvent): boolean {
    return (
      cell != null &&
      ((this.isSplitEnabled() && this.isSplitTarget(cell, cells, evt)) ||
        (!cell.isEdge() &&
          (this.isSwimlane(cell) ||
            (cell.getChildCount() > 0 && !cell.isCollapsed()))))
    );
  }

  /**
   * Returns true if the given edge may be splitted into two edges with the
   * given cell as a new terminal between the two.
   *
   * @param target {@link mxCell} that represents the edge to be splitted.
   * @param cells {@link mxCell} that should split the edge.
   * @param evt Mouseevent that triggered the invocation.
   */
  // isSplitTarget(target: mxCell, cells: mxCellArray, evt: Event): boolean;
  isSplitTarget(target: Cell, cells: CellArray, evt: InternalMouseEvent): boolean {
    if (
      target.isEdge() &&
      cells != null &&
      cells.length == 1 &&
      cells[0].isConnectable() &&
      this.getEdgeValidationError(target, target.getTerminal(true), cells[0]) ==
        null
    ) {
      const src = <Cell>target.getTerminal(true);
      const trg = <Cell>target.getTerminal(false);

      return (
        !cells[0].isAncestor(src) &&
        !cells[0].isAncestor(trg)
      );
    }
    return false;
  }

  /**
   * Returns the given cell if it is a drop target for the given cells or the
   * nearest ancestor that may be used as a drop target for the given cells.
   * If the given array contains a swimlane and {@link swimlaneNesting} is false
   * then this always returns null. If no cell is given, then the bottommost
   * swimlane at the location of the given event is returned.
   *
   * This function should only be used if {@link isDropEnabled} returns true.
   *
   * @param cells Array of {@link Cell} which are to be dropped onto the target.
   * @param evt Mouseevent for the drag and drop.
   * @param cell {@link mxCell} that is under the mousepointer.
   * @param clone Optional boolean to indicate of cells will be cloned.
   */
  // getDropTarget(cells: mxCellArray, evt: Event, cell: mxCell, clone?: boolean): mxCell;
  getDropTarget(
    cells: CellArray,
    evt: InternalMouseEvent,
    cell: Cell | null = null,
    clone: boolean = false
  ): Cell | null {
    if (!this.isSwimlaneNesting()) {
      for (let i = 0; i < cells.length; i += 1) {
        if (this.isSwimlane(cells[i])) {
          return null;
        }
      }
    }

    const pt = convertPoint(
      this.container,
      getClientX(evt),
      getClientY(evt)
    );
    pt.x -= this.panDx;
    pt.y -= this.panDy;
    const swimlane = this.getSwimlaneAt(pt.x, pt.y);

    if (cell == null) {
      cell = swimlane;
    } else if (swimlane != null) {
      // Checks if the cell is an ancestor of the swimlane
      // under the mouse and uses the swimlane in that case
      let tmp = swimlane.getParent();

      while (tmp != null && this.isSwimlane(tmp) && tmp != cell) {
        tmp = tmp.getParent();
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
      cell = cell.getParent();
    }

    // Checks if parent is dropped into child if not cloning
    if (!clone) {
      let parent = cell;
      while (parent != null && cells.indexOf(parent) < 0) {
        parent = parent.getParent();
      }
    }

    return !this.getModel().isLayer(<Cell>cell) && parent == null
      ? cell
      : null;
  }

  /*****************************************************************************
   * Group: Cell retrieval
   *****************************************************************************/

  /**
   * Returns {@link defaultParent} or {@link GraphView.currentRoot} or the first child
   * child of {@link Model.root} if both are null. The value returned by
   * this function should be used as the parent for new cells (aka default
   * layer).
   */
  getDefaultParent(): Cell {
    let parent = this.getCurrentRoot();

    if (parent == null) {
      parent = this.defaultParent;

      if (parent == null) {
        const root = <Cell>this.getModel().getRoot();
        parent = root.getChildAt(0);
      }
    }
    return <Cell>parent;
  }

  /**
   * Sets the {@link defaultParent} to the given cell. Set this to null to return
   * the first child of the root in getDefaultParent.
   */
  setDefaultParent(cell: Cell | null): void {
    this.defaultParent = cell;
  }

  /**
   * Returns all distinct visible opposite cells for the specified terminal
   * on the given edges.
   *
   * @param edges Array of {@link Cell} that contains the edges whose opposite
   * terminals should be returned.
   * @param terminal Terminal that specifies the end whose opposite should be
   * returned.
   * @param sources Optional boolean that specifies if source terminals should be
   * included in the result. Default is `true`.
   * @param targets Optional boolean that specifies if targer terminals should be
   * included in the result. Default is `true`.
   */
  getOpposites(
    edges: CellArray,
    terminal: Cell | null = null,
    sources: boolean = true,
    targets: boolean = true
  ): CellArray {
    const terminals = new CellArray();

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
   * Destroys the graph and all its resources.
   */
  destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true;
      // @ts-ignore
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

export default Graph;
// import("../../serialization/mxGraphCodec");
