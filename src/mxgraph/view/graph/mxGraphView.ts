/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxPoint from '../../util/datatypes/mxPoint';
import mxRectangle from '../../util/datatypes/mxRectangle';
import mxDictionary from '../../util/datatypes/mxDictionary';
import mxEventSource from '../../util/event/mxEventSource';
import mxEventObject from '../../util/event/mxEventObject';
import mxRectangleShape from '../../shape/node/mxRectangleShape';
import mxConstants from '../../util/mxConstants';
import mxClient from '../../mxClient';
import mxEvent from '../../util/event/mxEvent';
import mxUtils from '../../util/mxUtils';
import mxLog from '../../util/gui/mxLog';
import mxResources from '../../util/mxResources';
import mxCellState from '../../util/datatypes/mxCellState';
import mxUndoableEdit from '../../util/undo/mxUndoableEdit';
import mxImageShape from '../../shape/node/mxImageShape';
import mxMouseEvent from '../../util/event/mxMouseEvent';
import mxStyleRegistry from '../../util/datatypes/style/mxStyleRegistry';
import mxGraph from './mxGraph';
import mxCell from '../cell/mxCell';
import mxImage from '../../util/image/mxImage';
import mxCurrentRootChange from './mxCurrentRootChange';
import mxGraphModel from './mxGraphModel';
import mxShape from '../../shape/mxShape';

const validateBool = (x: any) => {
  if (x === true || x === false) {
    return x;
  }
  throw new Error(
    `Unsupported value: ${x} - must be either ` +
      `true or false (boolean values) only.`
  );
};

const validateString = (x: any) => {
  if (!(typeof x === 'string')) {
    throw new Error(`Unsupported value: ${x} - must be a string.`);
  }
  return x;
};

class mxGraphView extends mxEventSource {
  // TODO: Document me!
  backgroundImage: mxImageShape | null;

  backgroundPageShape: mxShape | null;

  EMPTY_POINT = new mxPoint();

  _canvas: HTMLElement;

  /**
   * Function: get canvas
   *
   * Returns the DOM node that contains the background-, draw- and
   * overlay- and decoratorpanes.
   */
  get canvas(): HTMLElement {
    return this._canvas;
  }

  _backgroundPane: HTMLElement;

  /**
   * Function: get backgroundPane
   *
   * Returns the DOM node that represents the background layer.
   */
  get backgroundPane(): HTMLElement {
    return this._backgroundPane;
  }

  _drawPane: HTMLElement;

  /**
   * Function: get drawPane
   *
   * Returns the DOM node that represents the main drawing layer.
   */
  get drawPane(): HTMLElement {
    return this._drawPane;
  }

  _overlayPane: HTMLElement;

  /**
   * Function: get overlayPane
   *
   * Returns the DOM node that represents the layer above the drawing layer.
   */
  get overlayPane(): HTMLElement {
    return this._overlayPane;
  }

  _decoratorPane: HTMLElement;

  /**
   * Function: get decoratorPane
   *
   * Returns the DOM node that represents the topmost drawing layer.
   */
  get decoratorPane(): HTMLElement {
    return this._decoratorPane;
  }

  _doneResource: string = mxClient.language !== 'none' ? 'done' : '';

  /**
   * Variable: doneResource
   *
   * Specifies the resource key for the status message after a long operation.
   * If the resource for this key does not exist then the value is used as
   * the status message. Default is 'done'.
   */
  get doneResource() {
    return this._doneResource;
  }

  set doneResource(value: string) {
    this._doneResource = validateString(value);
  }

  /**
   * Function: updatingDocumentResource
   *
   * Specifies the resource key for the status message while the document is
   * being updated. If the resource for this key does not exist then the
   * value is used as the status message. Default is 'updatingDocument'.
   */
  _updatingDocumentResource: string =
    mxClient.language !== 'none' ? 'updatingDocument' : '';

  get updatingDocumentResource() {
    return this._updatingDocumentResource;
  }

  set updatingDocumentResource(value: string) {
    this._updatingDocumentResource = validateString(value);
  }

  /**
   * Variable: allowEval
   *
   * Specifies if string values in cell styles should be evaluated using
   * <mxUtils.eval>. This will only be used if the string values can't be mapped
   * to objects using <mxStyleRegistry>. Default is false. NOTE: Enabling this
   * switch carries a possible security risk.
   */
  _allowEval: boolean = false;

  get allowEval() {
    return this._allowEval;
  }

  set allowEval(value) {
    this._allowEval = validateBool(value);
  }

  /**
   * Variable: captureDocumentGesture
   *
   * Specifies if a gesture should be captured when it goes outside of the
   * graph container. Default is true.
   */
  _captureDocumentGesture: boolean = true;

  get captureDocumentGesture() {
    return this._captureDocumentGesture;
  }

  set captureDocumentGesture(value) {
    this._captureDocumentGesture = validateBool(value);
    // this.refresh();
  }

  _rendering: boolean = true;

  /**
   * Function: get rendering
   *
   * Returns if shapes should be created, updated and destroyed using the
   * methods of <mxCellRenderer> in <graph>. Default is true.
   *
   * Returns <rendering>.
   */
  get rendering(): boolean {
    return this._rendering;
  }

  /**
   * Function: set rendering
   *
   * Sets whether shapes should be created, updated and destroyed using the
   * methods of <mxCellRenderer> in <graph>. Default is true.
   *
   * Sets <rendering>.
   */
  set rendering(value: boolean) {
    this._rendering = validateBool(value);
  }

  _graph: mxGraph = null;

  /**
   * Function: get graph
   *
   * Returns reference to the enclosing <mxGraph>.
   */
  get graph(): mxGraph {
    return this._graph;
  }

  /**
   * Variable: currentRoot
   *
   * <mxCell> that acts as the root of the displayed cell hierarchy.
   */
  _currentRoot: mxCell = null;

  get currentRoot(): mxCell {
    return this._currentRoot;
  }

  set currentRoot(value: mxCell) {
    this._currentRoot = value;
  }

  _graphBounds: mxRectangle = new mxRectangle();

  /**
   * Function: get graphBounds
   *
   * Returns the <mxRectangle> that caches the scales and translated bounds of the current view.
   */
  get graphBounds(): mxRectangle {
    return this._graphBounds;
  }

  /**
   * Function: set graphBounds
   *
   * Sets <graphBounds>.
   */
  set graphBounds(value: mxRectangle) {
    this._graphBounds = value;
    // this.refresh();
  }

  _scale: number = 1;

  /**
   * Function: get scale
   *
   * Returns the <scale>. Default is 1 (100%).
   */
  get scale(): number {
    return this._scale;
  }

  /**
   * Function: set scale
   *
   * Sets the scale and fires a <scale> event before calling <revalidate> followed
   * by <mxGraph.sizeDidChange>.
   *
   * Parameters:
   *
   * value - Decimal value that specifies the new scale (1 is 100%).
   */
  set scale(value: number) {
    const previousScale: number = this._scale;
    if (previousScale !== value) {
      this._scale = value;
      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }
    this.fireEvent(
      new mxEventObject(
        mxEvent.SCALE,
        'scale',
        value,
        'previousScale',
        previousScale
      )
    );
  }

  /**
   * Variable: translate
   *
   * <mxPoint> that specifies the current translation. Default is a new
   * empty <mxPoint>.
   */
  _translate: mxPoint = new mxPoint();

  /**
   * Function: getTranslate
   *
   * Returns the <translate>.
   */
  get translate() {
    return this._translate;
  }

  /**
   * Function: set translate
   *
   * Sets the translation and fires a <translate> event before calling
   * <revalidate> followed by <mxGraph.sizeDidChange>. The translation is the
   * negative of the origin.
   *
   * Parameters:
   *
   * dx - X-coordinate of the translation.
   * dy - Y-coordinate of the translation.
   */
  set translate(value: mxPoint) {
    const previousTranslate = new mxPoint(this._translate.x, this._translate.y);
    const dx = value.x;
    const dy = value.y;

    if (this._translate.x !== dx || this._translate.y !== dy) {
      this._translate.x = dx;
      this._translate.y = dy;

      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }

    this.fireEvent(
      new mxEventObject(
        mxEvent.TRANSLATE,
        'translate',
        this.translate,
        'previousTranslate',
        previousTranslate
      )
    );
  }

  _states: mxDictionary = new mxDictionary();

  /**
   * Function: get states
   *
   * Returns <states>.
   */
  get states(): mxDictionary {
    return this._states;
  }

  /**
   * Function: set states
   *
   * Sets <states>.
   */
  set states(value: mxDictionary) {
    this._states = value;
  }

  _updateStyle: boolean = false;

  /**
   * get updateStyle
   *
   * Specifies if the style should be updated in each validation step. If this
   * is false then the style is only updated if the state is created or if the
   * style of the cell was changed. Default is false.
   */
  get updateStyle(): boolean {
    return this._updateStyle;
  }

  /**
   * Variable: lastNode
   *
   * During validation, this contains the last DOM node that was processed.
   */
  lastNode: HTMLElement = null;

  /**
   * Variable: lastHtmlNode
   *
   * During validation, this contains the last HTML DOM node that was processed.
   */
  lastHtmlNode: HTMLElement = null;

  /**
   * Variable: lastForegroundNode
   *
   * During validation, this contains the last edge's DOM node that was processed.
   */
  lastForegroundNode: HTMLElement = null;

  /**
   * Variable: lastForegroundHtmlNode
   *
   * During validation, this contains the last edge HTML DOM node that was processed.
   */
  lastForegroundHtmlNode: HTMLElement = null;

  /**
   * Class: mxGraphView
   *
   * Extends <mxEventSource> to implement a view for a graph. This class is in
   * charge of computing the absolute coordinates for the relative child
   * geometries, the points for perimeters and edge styles and keeping them
   * cached in <mxCellStates> for faster retrieval. The states are updated
   * whenever the model or the view state (translate, scale) changes. The scale
   * and translate are honoured in the bounds.
   *
   * Event: mxEvent.UNDO
   *
   * Fires after the root was changed in <setCurrentRoot>. The <code>edit</code>
   * property contains the <mxUndoableEdit> which contains the
   * <mxCurrentRootChange>.
   *
   * Event: mxEvent.SCALE_AND_TRANSLATE
   *
   * Fires after the scale and translate have been changed in <scaleAndTranslate>.
   * The <code>scale</code>, <code>previousScale</code>, <code>translate</code>
   * and <code>previousTranslate</code> properties contain the new and previous
   * scale and translate, respectively.
   *
   * Event: mxEvent.SCALE
   *
   * Fires after the scale was changed in <setScale>. The <code>scale</code> and
   * <code>previousScale</code> properties contain the new and previous scale.
   *
   * Event: mxEvent.TRANSLATE
   *
   * Fires after the translate was changed in <setTranslate>. The
   * <code>translate</code> and <code>previousTranslate</code> properties contain
   * the new and previous value for translate.
   *
   * Event: mxEvent.DOWN and mxEvent.UP
   *
   * Fire if the current root is changed by executing an <mxCurrentRootChange>.
   * The event name depends on the location of the root in the cell hierarchy
   * with respect to the current root. The <code>root</code> and
   * <code>previous</code> properties contain the new and previous root,
   * respectively.
   *
   * Constructor: mxGraphView
   *
   * Constructs a new view for the given <mxGraph>.
   *
   * Parameters:
   *
   * graph - Reference to the enclosing <mxGraph>.
   */
  constructor(graph: mxGraph) {
    super();

    this._graph = graph;
  }

  // Backwards compatibility getters/setters

  getGraphBounds(): mxRectangle {
    return this.graphBounds;
  }

  setGraphBounds(value: mxRectangle) {
    this.graphBounds = value;
  }

  getScale(): number {
    return this.scale;
  }

  setScale(value) {
    this.scale = value;
  }

  getTranslate(): mxPoint {
    return this.translate;
  }

  setTranslate(dx: number, dy: number) {
    this.translate = new mxPoint(dx, dy);
  }

  isRendering(): boolean {
    return this.rendering;
  }

  setRendering(value: boolean) {
    this.rendering = value;
  }

  isAllowEval(): boolean {
    return this.allowEval;
  }

  setAllowEval(value: boolean) {
    this.allowEval = value;
  }

  getStates() {
    return this.states;
  }

  setStates(value) {
    this.states = value;
  }

  getCanvas(): HTMLElement {
    return this.canvas;
  }

  getBackgroundPane(): HTMLElement {
    return this.backgroundPane;
  }

  getDrawPane(): HTMLElement {
    return this.drawPane;
  }

  getOverlayPane(): HTMLElement {
    return this.overlayPane;
  }

  getDecoratorPane(): HTMLElement {
    return this.decoratorPane;
  }

  /**
   * Function: getBounds
   *
   * Returns the union of all <mxCellStates> for the given array of <mxCells>.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> whose bounds should be returned.
   */
  getBounds(cells: mxCell[]): mxRectangle {
    let result = null;

    if (cells != null && cells.length > 0) {
      const model = this.graph.getModel();

      for (let i = 0; i < cells.length; i += 1) {
        if (model.isVertex(cells[i]) || model.isEdge(cells[i])) {
          const state = this.getState(cells[i]);

          if (state != null) {
            if (result == null) {
              result = mxRectangle.fromRectangle(state);
            } else {
              result.add(state);
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Function: setCurrentRoot
   *
   * Sets and returns the current root and fires an <undo> event before
   * calling <mxGraph.sizeDidChange>.
   *
   * Parameters:
   *
   * root - <mxCell> that specifies the root of the displayed cell hierarchy.
   */
  setCurrentRoot(root: mxCell): mxCell {
    if (this.currentRoot != root) {
      const change = new mxCurrentRootChange(this, root);
      change.execute();

      const edit = new mxUndoableEdit(this, true);
      edit.add(change);

      this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
      this.graph.sizeDidChange();

      this.currentRoot = root;
    }
    return root;
  }

  /**
   * Function: scaleAndTranslate
   *
   * Sets the scale and translation and fires a <scale> and <translate> event
   * before calling <revalidate> followed by <mxGraph.sizeDidChange>.
   *
   * Parameters:
   *
   * scale - Decimal value that specifies the new scale (1 is 100%).
   * dx - X-coordinate of the translation.
   * dy - Y-coordinate of the translation.
   */
  scaleAndTranslate(scale, dx, dy) {
    const previousScale = this.scale;
    const previousTranslate = new mxPoint(this.translate.x, this.translate.y);

    if (
      this.scale != scale ||
      this.translate.x != dx ||
      this.translate.y != dy
    ) {
      this.scale = scale;

      this.translate.x = dx;
      this.translate.y = dy;

      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }

    this.fireEvent(
      new mxEventObject(
        mxEvent.SCALE_AND_TRANSLATE,
        'scale',
        scale,
        'previousScale',
        previousScale,
        'translate',
        this.translate,
        'previousTranslate',
        previousTranslate
      )
    );
  }

  /**
   * Function: viewStateChanged
   *
   * Invoked after <scale> and/or <translate> has changed.
   */
  viewStateChanged() {
    this.revalidate();
    this.graph.sizeDidChange();
  }

  /**
   * Function: refresh
   *
   * Clears the view if <currentRoot> is not null and revalidates.
   */
  refresh() {
    if (this.currentRoot != null) {
      this.clear();
    }
    this.revalidate();
  }

  /**
   * Function: revalidate
   *
   * Revalidates the complete view with all cell states.
   */
  revalidate() {
    this.invalidate();
    this.validate();
  }

  /**
   * Function: clear
   *
   * Removes the state of the given cell and all descendants if the given
   * cell is not the current root.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> for which the state should be removed. Default
   * is the root of the model.
   * force - Boolean indicating if the current root should be ignored for
   * recursion.
   */
  clear(
    cell: mxCell | null = null,
    force: boolean = false,
    recurse: boolean = true
  ) {
    const model: mxGraphModel = this.graph.getModel();
    cell = cell || model.getRoot();

    this.removeState(cell);

    if (recurse && (force || cell != this.currentRoot)) {
      const childCount: number = model.getChildCount(cell);

      for (let i = 0; i < childCount; i += 1) {
        this.clear(model.getChildAt(cell, i), force);
      }
    } else {
      this.invalidate(cell);
    }
  }

  /**
   * Function: invalidate
   *
   * Invalidates the state of the given cell, all its descendants and
   * connected edges.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> to be invalidated. Default is the root of the
   * model.
   */
  invalidate(
    cell: mxCell | null = null,
    recurse: boolean = true,
    includeEdges: boolean = true
  ) {
    const model: mxGraphModel = this.graph.getModel();
    const state: mxCellState = this.getState(cell);

    cell = cell || model.getRoot();

    if (state != null) {
      state.invalid = true;
    }

    // Avoids infinite loops for invalid graphs
    if (!cell.invalidating) {
      cell.invalidating = true;

      // Recursively invalidates all descendants
      if (recurse) {
        const childCount = model.getChildCount(cell);

        for (let i = 0; i < childCount; i += 1) {
          const child = model.getChildAt(cell, i);
          this.invalidate(child, recurse, includeEdges);
        }
      }

      // Propagates invalidation to all connected edges
      if (includeEdges) {
        const edgeCount = model.getEdgeCount(cell);

        for (let i = 0; i < edgeCount; i += 1) {
          this.invalidate(model.getEdgeAt(cell, i), recurse, includeEdges);
        }
      }
    }
  }

  /**
   * Function: validate
   *
   * Calls <validateCell> and <validateCellState> and updates the <graphBounds>
   * using <getBoundingBox>. Finally the background is validated using
   * <validateBackground>.
   *
   * Parameters:
   *
   * cell - Optional <mxCell> to be used as the root of the validation.
   * Default is <currentRoot> or the root of the model.
   */
  validate(cell: mxCell | null = null) {
    const t0 = mxLog.enter('mxGraphView.validate');
    window.status =
      mxResources.get(this.updatingDocumentResource) ||
      this.updatingDocumentResource;

    this.resetValidationState();

    const graphBounds = this.getBoundingBox(
      this.validateCellState(
        this.validateCell(
          cell ||
            (this.currentRoot != null
              ? this.currentRoot
              : this.graph.getModel().getRoot())
        )
      )
    );
    this.setGraphBounds(
      graphBounds != null ? graphBounds : this.getEmptyBounds()
    );
    this.validateBackground();

    this.resetValidationState();

    window.status = mxResources.get(this.doneResource) || this.doneResource;
    mxLog.leave('mxGraphView.validate', t0);
  }

  // TODO: Document me!!
  get emptyBounds() {
    return this.getEmptyBounds();
  }

  /**
   * Function: getEmptyBounds
   *
   * Returns the bounds for an empty graph. This returns a rectangle at
   * <translate> with the size of 0 x 0.
   */
  getEmptyBounds() {
    return new mxRectangle(
      this.translate.x * this.scale,
      this.translate.y * this.scale
    );
  }

  /**
   * Function: getBoundingBox
   *
   * Returns the bounding box of the shape and the label for the given
   * <mxCellState> and its children if recurse is true.
   *
   * Parameters:
   *
   * state - <mxCellState> whose bounding box should be returned.
   * recurse - Optional boolean indicating if the children should be included.
   * Default is true.
   */
  getBoundingBox(state: mxCellState | null = null, recurse: boolean = true) {
    let bbox = null;

    if (state != null) {
      if (state.shape != null && state.shape.boundingBox != null) {
        bbox = state.shape.boundingBox.clone();
      }

      // Adds label bounding box to graph bounds
      if (state.text != null && state.text.boundingBox != null) {
        if (bbox != null) {
          bbox.add(state.text.boundingBox);
        } else {
          bbox = state.text.boundingBox.clone();
        }
      }

      if (recurse) {
        const model = this.graph.getModel();
        const childCount = model.getChildCount(state.cell);

        for (let i = 0; i < childCount; i += 1) {
          const bounds = this.getBoundingBox(
            this.getState(model.getChildAt(state.cell, i))
          );

          if (bounds != null) {
            if (bbox == null) {
              bbox = bounds;
            } else {
              bbox.add(bounds);
            }
          }
        }
      }
    }
    return bbox;
  }

  /**
   * Function: createBackgroundPageShape
   *
   * Creates and returns the shape used as the background page.
   *
   * Parameters:
   *
   * bounds - <mxRectangle> that represents the bounds of the shape.
   */
  createBackgroundPageShape(bounds) {
    return new mxRectangleShape(bounds, 'white', 'black');
  }

  /**
   * Function: validateBackground
   *
   * Calls <validateBackgroundImage> and <validateBackgroundPage>.
   */
  validateBackground() {
    this.validateBackgroundImage();
    this.validateBackgroundPage();
  }

  /**
   * Function: validateBackgroundImage
   *
   * Validates the background image.
   */
  validateBackgroundImage() {
    const bg = this.graph.getBackgroundImage();

    if (bg != null) {
      if (
        this.backgroundImage == null ||
        this.backgroundImage.image !== bg.src
      ) {
        if (this.backgroundImage != null) {
          this.backgroundImage.destroy();
        }

        const bounds = new mxRectangle(0, 0, 1, 1);

        this.backgroundImage = new mxImageShape(bounds, bg.src);
        this.backgroundImage.dialect = this.graph.dialect;
        this.backgroundImage.init(this.backgroundPane);
        this.backgroundImage.redraw();
      }

      this.redrawBackgroundImage(this.backgroundImage, bg);
    } else if (this.backgroundImage != null) {
      this.backgroundImage.destroy();
      this.backgroundImage = null;
    }
  }

  /**
   * Function: validateBackgroundPage
   *
   * Validates the background page.
   */
  validateBackgroundPage(): void {
    if (this.graph.pageVisible) {
      const bounds = this.getBackgroundPageBounds();

      if (this.backgroundPageShape == null) {
        this.backgroundPageShape = this.createBackgroundPageShape(bounds);
        this.backgroundPageShape.scale = this.scale;
        this.backgroundPageShape.isShadow = true;
        this.backgroundPageShape.dialect = this.graph.dialect;
        this.backgroundPageShape.init(this.backgroundPane);
        this.backgroundPageShape.redraw();

        // Adds listener for double click handling on background
        if (this.graph.nativeDblClickEnabled) {
          mxEvent.addListener(
            this.backgroundPageShape.node,
            'dblclick',
            mxUtils.bind(this, evt => {
              this.graph.dblClick(evt);
            })
          );
        }

        // Adds basic listeners for graph event dispatching outside of the
        // container and finishing the handling of a single gesture
        mxEvent.addGestureListeners(
          this.backgroundPageShape.node,
          mxUtils.bind(this, evt => {
            this.graph.fireMouseEvent(
              mxEvent.MOUSE_DOWN,
              new mxMouseEvent(evt)
            );
          }),
          mxUtils.bind(this, evt => {
            // Hides the tooltip if mouse is outside container
            if (
              this.graph.tooltipHandler != null &&
              this.graph.tooltipHandler.isHideOnHover()
            ) {
              this.graph.tooltipHandler.hide();
            }

            if (this.graph.isMouseDown && !mxEvent.isConsumed(evt)) {
              this.graph.fireMouseEvent(
                mxEvent.MOUSE_MOVE,
                new mxMouseEvent(evt)
              );
            }
          }),
          mxUtils.bind(this, evt => {
            this.graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
          })
        );
      } else {
        this.backgroundPageShape.scale = this.scale;
        this.backgroundPageShape.bounds = bounds;
        this.backgroundPageShape.redraw();
      }
    } else if (this.backgroundPageShape != null) {
      this.backgroundPageShape.destroy();
      this.backgroundPageShape = null;
    }
  }

  // TODO: Document me!!
  get backgroundPageBounds(): mxRectangle {
    return this.getBackgroundPageBounds();
  }

  /**
   * Function: getBackgroundPageBounds
   *
   * Returns the bounds for the background page.
   */
  getBackgroundPageBounds(): mxRectangle {
    const fmt = this.graph.pageFormat;
    const ps = this.scale * this.graph.pageScale;

    return new mxRectangle(
      this.scale * this.translate.x,
      this.scale * this.translate.y,
      fmt.width * ps,
      fmt.height * ps
    );
  }

  /**
   * Function: redrawBackgroundImage
   *
   * Updates the bounds and redraws the background image.
   *
   * Example:
   *
   * If the background image should not be scaled, this can be replaced with
   * the following.
   *
   * (code)
   * redrawBackground = (backgroundImage, bg)=>
   * {
   *   backgroundImage.bounds.x = this.translate.x;
   *   backgroundImage.bounds.y = this.translate.y;
   *   backgroundImage.bounds.width = bg.width;
   *   backgroundImage.bounds.height = bg.height;
   *
   *   backgroundImage.redraw();
   * };
   * (end)
   *
   * Parameters:
   *
   * backgroundImage - <mxImageShape> that represents the background image.
   * bg - <mxImage> that specifies the image and its dimensions.
   */
  redrawBackgroundImage(backgroundImage: mxImageShape, bg: mxImage): void {
    backgroundImage.scale = this.scale;
    backgroundImage.bounds.x = this.scale * this.translate.x;
    backgroundImage.bounds.y = this.scale * this.translate.y;
    backgroundImage.bounds.width = this.scale * bg.width;
    backgroundImage.bounds.height = this.scale * bg.height;
    backgroundImage.redraw();
  }

  /**
   * Function: validateCell
   *
   * Recursively creates the cell state for the given cell if visible is true and
   * the given cell is visible. If the cell is not visible but the state exists
   * then it is removed using <removeState>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose <mxCellState> should be created.
   * visible - Optional boolean indicating if the cell should be visible. Default
   * is true.
   */
  validateCell(cell: mxCell, visible: boolean = true) {
    if (cell != null) {
      visible = visible && this.graph.isCellVisible(cell);
      const state = this.getState(cell, visible);

      if (state != null && !visible) {
        this.removeState(cell);
      } else {
        const model = this.graph.getModel();
        const childCount = model.getChildCount(cell);

        for (let i = 0; i < childCount; i += 1) {
          this.validateCell(
            model.getChildAt(cell, i),
            visible &&
              (!this.isCellCollapsed(cell) || cell === this.currentRoot)
          );
        }
      }
    }
    return cell;
  }

  /**
   * Function: validateCellState
   *
   * Validates and repaints the <mxCellState> for the given <mxCell>.
   *
   * Parameters:
   *
   * cell - <mxCell> whose <mxCellState> should be validated.
   * recurse - Optional boolean indicating if the children of the cell should be
   * validated. Default is true.
   */
  validateCellState(cell: mxCell, recurse: boolean = true): mxCellState | null {
    let state: mxCellState | null = null;

    if (cell != null) {
      state = this.getState(cell);

      if (state != null) {
        const model = this.graph.getModel();

        if (state.invalid) {
          state.invalid = false;

          if (state.style == null || state.invalidStyle) {
            state.style = this.graph.getCellStyle(state.cell);
            state.invalidStyle = false;
          }

          if (cell !== this.currentRoot) {
            this.validateCellState(model.getParent(cell), false);
          }

          state.setVisibleTerminalState(
            this.validateCellState(this.getVisibleTerminal(cell, true), false),
            true
          );
          state.setVisibleTerminalState(
            this.validateCellState(this.getVisibleTerminal(cell, false), false),
            false
          );

          this.updateCellState(state);

          // Repaint happens immediately after the cell is validated
          if (cell !== this.currentRoot && !state.invalid) {
            this.graph.cellRenderer.redraw(state, false, this.isRendering());

            // Handles changes to invertex paintbounds after update of rendering shape
            state.updateCachedBounds();
          }
        }

        if (recurse && !state.invalid) {
          // Updates order in DOM if recursively traversing
          if (state.shape != null) {
            this.stateValidated(state);
          }

          const childCount = model.getChildCount(cell);
          for (let i = 0; i < childCount; i += 1) {
            this.validateCellState(model.getChildAt(cell, i));
          }
        }
      }
    }
    return state;
  }

  /**
   * Function: updateCellState
   *
   * Updates the given <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> to be updated.
   */
  updateCellState(state: mxCellState) {
    state.absoluteOffset.x = 0;
    state.absoluteOffset.y = 0;
    state.origin.x = 0;
    state.origin.y = 0;
    state.length = 0;

    if (state.cell !== this.currentRoot) {
      const model = this.graph.getModel();
      const pState = this.getState(model.getParent(state.cell));

      if (pState != null && pState.cell !== this.currentRoot) {
        state.origin.x += pState.origin.x;
        state.origin.y += pState.origin.y;
      }

      let offset = this.graph.getChildOffsetForCell(state.cell);

      if (offset != null) {
        state.origin.x += offset.x;
        state.origin.y += offset.y;
      }

      const geo = this.graph.getCellGeometry(state.cell);

      if (geo != null) {
        if (!model.isEdge(state.cell)) {
          offset = geo.offset != null ? geo.offset : this.EMPTY_POINT;

          if (geo.relative && pState != null) {
            if (model.isEdge(pState.cell)) {
              const origin = this.getPoint(pState, geo);

              if (origin != null) {
                state.origin.x +=
                  origin.x / this.scale - pState.origin.x - this.translate.x;
                state.origin.y +=
                  origin.y / this.scale - pState.origin.y - this.translate.y;
              }
            } else {
              state.origin.x += geo.x * pState.unscaledWidth + offset.x;
              state.origin.y += geo.y * pState.unscaledHeight + offset.y;
            }
          } else {
            state.absoluteOffset.x = this.scale * offset.x;
            state.absoluteOffset.y = this.scale * offset.y;
            state.origin.x += geo.x;
            state.origin.y += geo.y;
          }
        }

        state.x = this.scale * (this.translate.x + state.origin.x);
        state.y = this.scale * (this.translate.y + state.origin.y);
        state.width = this.scale * geo.width;
        state.unscaledWidth = geo.width;
        state.height = this.scale * geo.height;
        state.unscaledHeight = geo.height;

        if (model.isVertex(state.cell)) {
          this.updateVertexState(state, geo);
        }

        if (model.isEdge(state.cell)) {
          this.updateEdgeState(state, geo);
        }
      }
    }

    state.updateCachedBounds();
  }

  /**
   * Function: isCellCollapsed
   *
   * Returns true if the children of the given cell should not be visible in the
   * view. This implementation uses <mxGraph.isCellVisible> but it can be
   * overidden to use a separate condition.
   */
  isCellCollapsed(cell) {
    return this.graph.isCellCollapsed(cell);
  }

  /**
   * Function: updateVertexState
   *
   * Validates the given cell state.
   */
  updateVertexState(state, geo) {
    const model = this.graph.getModel();
    const pState = this.getState(model.getParent(state.cell));

    if (geo.relative && pState != null && !model.isEdge(pState.cell)) {
      const alpha = mxUtils.toRadians(
        pState.style[mxConstants.STYLE_ROTATION] || '0'
      );
      if (alpha !== 0) {
        const cos = Math.cos(alpha);
        const sin = Math.sin(alpha);

        const ct = new mxPoint(state.getCenterX(), state.getCenterY());
        const cx = new mxPoint(pState.getCenterX(), pState.getCenterY());
        const pt = mxUtils.getRotatedPoint(ct, cos, sin, cx);
        state.x = pt.x - state.width / 2;
        state.y = pt.y - state.height / 2;
      }
    }
    this.updateVertexLabelOffset(state);
  }

  /**
   * Function: updateEdgeState
   *
   * Validates the given cell state.
   */
  updateEdgeState(state, geo) {
    const source = state.getVisibleTerminalState(true);
    const target = state.getVisibleTerminalState(false);

    // This will remove edges with no terminals and no terminal points
    // as such edges are invalid and produce NPEs in the edge styles.
    // Also removes connected edges that have no visible terminals.
    if (
      (this.graph.model.getTerminal(state.cell, true) != null &&
        source == null) ||
      (source == null && geo.getTerminalPoint(true) == null) ||
      (this.graph.model.getTerminal(state.cell, false) != null &&
        target == null) ||
      (target == null && geo.getTerminalPoint(false) == null)
    ) {
      this.clear(state.cell, true);
    } else {
      this.updateFixedTerminalPoints(state, source, target);
      this.updatePoints(state, geo.points, source, target);
      this.updateFloatingTerminalPoints(state, source, target);

      const pts = state.absolutePoints;

      if (
        state.cell !== this.currentRoot &&
        (pts == null ||
          pts.length < 2 ||
          pts[0] == null ||
          pts[pts.length - 1] == null)
      ) {
        // This will remove edges with invalid points from the list of states in the view.
        // Happens if the one of the terminals and the corresponding terminal point is null.
        this.clear(state.cell, true);
      } else {
        this.updateEdgeBounds(state);
        this.updateEdgeLabelOffset(state);
      }
    }
  }

  /**
   * Function: updateVertexLabelOffset
   *
   * Updates the absoluteOffset of the given vertex cell state. This takes
   * into account the label position styles.
   *
   * Parameters:
   *
   * state - <mxCellState> whose absolute offset should be updated.
   */
  updateVertexLabelOffset(state: mxCellState) {
    const h = mxUtils.getValue(
      state.style,
      mxConstants.STYLE_LABEL_POSITION,
      mxConstants.ALIGN_CENTER
    );

    if (h === mxConstants.ALIGN_LEFT) {
      let lw = mxUtils.getValue(
        state.style,
        mxConstants.STYLE_LABEL_WIDTH,
        null
      );

      if (lw != null) {
        lw *= this.scale;
      } else {
        lw = state.width;
      }

      state.absoluteOffset.x -= lw;
    } else if (h === mxConstants.ALIGN_RIGHT) {
      state.absoluteOffset.x += state.width;
    } else if (h === mxConstants.ALIGN_CENTER) {
      const lw = mxUtils.getValue(
        state.style,
        mxConstants.STYLE_LABEL_WIDTH,
        null
      );

      if (lw != null) {
        // Aligns text block with given width inside the vertex width
        const align = mxUtils.getValue(
          state.style,
          mxConstants.STYLE_ALIGN,
          mxConstants.ALIGN_CENTER
        );
        let dx = 0;

        if (align === mxConstants.ALIGN_CENTER) {
          dx = 0.5;
        } else if (align === mxConstants.ALIGN_RIGHT) {
          dx = 1;
        }

        if (dx !== 0) {
          state.absoluteOffset.x -= (lw * this.scale - state.width) * dx;
        }
      }
    }

    const v = mxUtils.getValue(
      state.style,
      mxConstants.STYLE_VERTICAL_LABEL_POSITION,
      mxConstants.ALIGN_MIDDLE
    );

    if (v === mxConstants.ALIGN_TOP) {
      state.absoluteOffset.y -= state.height;
    } else if (v === mxConstants.ALIGN_BOTTOM) {
      state.absoluteOffset.y += state.height;
    }
  }

  /**
   * Function: resetValidationState
   *
   * Resets the current validation state.
   */
  resetValidationState() {
    this.lastNode = null;
    this.lastHtmlNode = null;
    this.lastForegroundNode = null;
    this.lastForegroundHtmlNode = null;
  }

  /**
   * Function: stateValidated
   *
   * Invoked when a state has been processed in <validatePoints>. This is used
   * to update the order of the DOM nodes of the shape.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the cell state.
   */
  stateValidated(state: mxCellState) {
    const fg =
      (this.graph.getModel().isEdge(state.cell) &&
        this.graph.keepEdgesInForeground) ||
      (this.graph.getModel().isVertex(state.cell) &&
        this.graph.keepEdgesInBackground);
    const htmlNode = fg
      ? this.lastForegroundHtmlNode || this.lastHtmlNode
      : this.lastHtmlNode;
    const node = fg ? this.lastForegroundNode || this.lastNode : this.lastNode;
    const result = this.graph.cellRenderer.insertStateAfter(
      state,
      node,
      htmlNode
    );

    if (fg) {
      this.lastForegroundHtmlNode = result[1];
      this.lastForegroundNode = result[0];
    } else {
      this.lastHtmlNode = result[1];
      this.lastNode = result[0];
    }
  }

  /**
   * Function: updateFixedTerminalPoints
   *
   * Sets the initial absolute terminal points in the given state before the edge
   * style is computed.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose initial terminal points should be updated.
   * source - <mxCellState> which represents the source terminal.
   * target - <mxCellState> which represents the target terminal.
   */
  updateFixedTerminalPoints(edge, source, target) {
    this.updateFixedTerminalPoint(
      edge,
      source,
      true,
      this.graph.getConnectionConstraint(edge, source, true)
    );
    this.updateFixedTerminalPoint(
      edge,
      target,
      false,
      this.graph.getConnectionConstraint(edge, target, false)
    );
  }

  /**
   * Function: updateFixedTerminalPoint
   *
   * Sets the fixed source or target terminal point on the given edge.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be updated.
   * terminal - <mxCellState> which represents the actual terminal.
   * source - Boolean that specifies if the terminal is the source.
   * constraint - <mxConnectionConstraint> that specifies the connection.
   */
  updateFixedTerminalPoint(edge, terminal, source, constraint) {
    edge.setAbsoluteTerminalPoint(
      this.getFixedTerminalPoint(edge, terminal, source, constraint),
      source
    );
  }

  /**
   * Function: getFixedTerminalPoint
   *
   * Returns the fixed source or target terminal point for the given edge.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be returned.
   * terminal - <mxCellState> which represents the actual terminal.
   * source - Boolean that specifies if the terminal is the source.
   * constraint - <mxConnectionConstraint> that specifies the connection.
   */
  getFixedTerminalPoint(edge, terminal, source, constraint) {
    let pt = null;

    if (constraint != null) {
      pt = this.graph.getConnectionPoint(terminal, constraint, false); // FIXME Rounding introduced bugs when calculating label positions -> , this.graph.isOrthogonal(edge));
    }

    if (pt == null && terminal == null) {
      const s = this.scale;
      const tr = this.translate;
      const orig = edge.origin;
      const geo = this.graph.getCellGeometry(edge.cell);
      pt = geo.getTerminalPoint(source);

      if (pt != null) {
        pt = new mxPoint(
          s * (tr.x + pt.x + orig.x),
          s * (tr.y + pt.y + orig.y)
        );
      }
    }

    return pt;
  }

  /**
   * Function: updateBoundsFromStencil
   *
   * Updates the bounds of the given cell state to reflect the bounds of the stencil
   * if it has a fixed aspect and returns the previous bounds as an <mxRectangle> if
   * the bounds have been modified or null otherwise.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose bounds should be updated.
   */
  updateBoundsFromStencil(state: mxCellState) {
    let previous = null;

    if (
      state != null &&
      state.shape != null &&
      state.shape.stencil != null &&
      state.shape.stencil.aspect === 'fixed'
    ) {
      previous = mxRectangle.fromRectangle(state);
      const asp = state.shape.stencil.computeAspect(
        state.style,
        state.x,
        state.y,
        state.width,
        state.height
      );
      state.setRect(
        asp.x,
        asp.y,
        state.shape.stencil.w0 * asp.width,
        state.shape.stencil.h0 * asp.height
      );
    }

    return previous;
  }

  /**
   * Function: updatePoints
   *
   * Updates the absolute points in the given state using the specified array
   * of <mxPoints> as the relative points.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose absolute points should be updated.
   * points - Array of <mxPoints> that constitute the relative points.
   * source - <mxCellState> that represents the source terminal.
   * target - <mxCellState> that represents the target terminal.
   */
  updatePoints(edge, points, source, target) {
    if (edge != null) {
      const pts = [];
      pts.push(edge.absolutePoints[0]);
      const edgeStyle = this.getEdgeStyle(edge, points, source, target);

      if (edgeStyle != null) {
        const src = this.getTerminalPort(edge, source, true);
        const trg = this.getTerminalPort(edge, target, false);

        // Uses the stencil bounds for routing and restores after routing
        const srcBounds = this.updateBoundsFromStencil(src);
        const trgBounds = this.updateBoundsFromStencil(trg);

        edgeStyle(edge, src, trg, points, pts);

        // Restores previous bounds
        if (srcBounds != null) {
          src.setRect(
            srcBounds.x,
            srcBounds.y,
            srcBounds.width,
            srcBounds.height
          );
        }

        if (trgBounds != null) {
          trg.setRect(
            trgBounds.x,
            trgBounds.y,
            trgBounds.width,
            trgBounds.height
          );
        }
      } else if (points != null) {
        for (let i = 0; i < points.length; i += 1) {
          if (points[i] != null) {
            const pt = mxUtils.clone(points[i]);
            pts.push(this.transformControlPoint(edge, pt));
          }
        }
      }

      const tmp = edge.absolutePoints;
      pts.push(tmp[tmp.length - 1]);

      edge.absolutePoints = pts;
    }
  }

  /**
   * Function: transformControlPoint
   *
   * Transforms the given control point to an absolute point.
   */
  transformControlPoint(state, pt, ignoreScale) {
    if (state != null && pt != null) {
      const orig = state.origin;
      const scale = ignoreScale ? 1 : this.scale;

      return new mxPoint(
        scale * (pt.x + this.translate.x + orig.x),
        scale * (pt.y + this.translate.y + orig.y)
      );
    }
    return null;
  }

  /**
   * Function: isLoopStyleEnabled
   *
   * Returns true if the given edge should be routed with <mxGraph.defaultLoopStyle>
   * or the <mxConstants.STYLE_LOOP> defined for the given edge. This implementation
   * returns true if the given edge is a loop and does not have connections constraints
   * associated.
   */
  isLoopStyleEnabled(edge, points, source, target) {
    const sc = this.graph.getConnectionConstraint(edge, source, true);
    const tc = this.graph.getConnectionConstraint(edge, target, false);

    if (
      (points == null || points.length < 2) &&
      (!mxUtils.getValue(
        edge.style,
        mxConstants.STYLE_ORTHOGONAL_LOOP,
        false
      ) ||
        ((sc == null || sc.point == null) && (tc == null || tc.point == null)))
    ) {
      return source != null && source === target;
    }
    return false;
  }

  /**
   * Function: getEdgeStyle
   *
   * Returns the edge style function to be used to render the given edge state.
   */
  getEdgeStyle(edge, points, source, target) {
    let edgeStyle = this.isLoopStyleEnabled(edge, points, source, target)
      ? mxUtils.getValue(
          edge.style,
          mxConstants.STYLE_LOOP,
          this.graph.defaultLoopStyle
        )
      : !mxUtils.getValue(edge.style, mxConstants.STYLE_NOEDGESTYLE, false)
      ? edge.style[mxConstants.STYLE_EDGE]
      : null;

    // Converts string values to objects
    if (typeof edgeStyle === 'string') {
      let tmp = mxStyleRegistry.getValue(edgeStyle);
      if (tmp == null && this.isAllowEval()) {
        tmp = mxUtils.eval(edgeStyle);
      }
      edgeStyle = tmp;
    }

    if (typeof edgeStyle === 'function') {
      return edgeStyle;
    }
    return null;
  }

  /**
   * Function: updateFloatingTerminalPoints
   *
   * Updates the terminal points in the given state after the edge style was
   * computed for the edge.
   *
   * Parameters:
   *
   * state - <mxCellState> whose terminal points should be updated.
   * source - <mxCellState> that represents the source terminal.
   * target - <mxCellState> that represents the target terminal.
   */
  updateFloatingTerminalPoints(state, source, target) {
    const pts = state.absolutePoints;
    const p0 = pts[0];
    const pe = pts[pts.length - 1];

    if (pe == null && target != null) {
      this.updateFloatingTerminalPoint(state, target, source, false);
    }

    if (p0 == null && source != null) {
      this.updateFloatingTerminalPoint(state, source, target, true);
    }
  }

  /**
   * Function: updateFloatingTerminalPoint
   *
   * Updates the absolute terminal point in the given state for the given
   * start and end state, where start is the source if source is true.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be updated.
   * start - <mxCellState> for the terminal on "this" side of the edge.
   * end - <mxCellState> for the terminal on the other side of the edge.
   * source - Boolean indicating if start is the source terminal state.
   */
  updateFloatingTerminalPoint(edge, start, end, source) {
    edge.setAbsoluteTerminalPoint(
      this.getFloatingTerminalPoint(edge, start, end, source),
      source
    );
  }

  /**
   * Function: getFloatingTerminalPoint
   *
   * Returns the floating terminal point for the given edge, start and end
   * state, where start is the source if source is true.
   *
   * Parameters:
   *
   * edge - <mxCellState> whose terminal point should be returned.
   * start - <mxCellState> for the terminal on "this" side of the edge.
   * end - <mxCellState> for the terminal on the other side of the edge.
   * source - Boolean indicating if start is the source terminal state.
   */
  getFloatingTerminalPoint(edge, start, end, source) {
    start = this.getTerminalPort(edge, start, source);
    let next = this.getNextPoint(edge, end, source);

    const orth = this.graph.isOrthogonal(edge);
    const alpha = mxUtils.toRadians(
      Number(start.style[mxConstants.STYLE_ROTATION] || '0')
    );
    const center = new mxPoint(start.getCenterX(), start.getCenterY());

    if (alpha !== 0) {
      const cos = Math.cos(-alpha);
      const sin = Math.sin(-alpha);
      next = mxUtils.getRotatedPoint(next, cos, sin, center);
    }

    let border = parseFloat(
      edge.style[mxConstants.STYLE_PERIMETER_SPACING] || 0
    );
    border += parseFloat(
      edge.style[
        source
          ? mxConstants.STYLE_SOURCE_PERIMETER_SPACING
          : mxConstants.STYLE_TARGET_PERIMETER_SPACING
      ] || 0
    );
    let pt = this.getPerimeterPoint(start, next, alpha === 0 && orth, border);

    if (alpha !== 0) {
      const cos = Math.cos(alpha);
      const sin = Math.sin(alpha);
      pt = mxUtils.getRotatedPoint(pt, cos, sin, center);
    }

    return pt;
  }

  /**
   * Function: getTerminalPort
   *
   * Returns an <mxCellState> that represents the source or target terminal or
   * port for the given edge.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the state of the edge.
   * terminal - <mxCellState> that represents the terminal.
   * source - Boolean indicating if the given terminal is the source terminal.
   */
  getTerminalPort(state, terminal, source) {
    const key = source
      ? mxConstants.STYLE_SOURCE_PORT
      : mxConstants.STYLE_TARGET_PORT;
    const id = mxUtils.getValue(state.style, key);

    if (id != null) {
      const tmp = this.getState(this.graph.getModel().getCell(id), false);

      // Only uses ports where a cell state exists
      if (tmp != null) {
        terminal = tmp;
      }
    }
    return terminal;
  }

  /**
   * Function: getPerimeterPoint
   *
   * Returns an <mxPoint> that defines the location of the intersection point between
   * the perimeter and the line between the center of the shape and the given point.
   *
   * Parameters:
   *
   * terminal - <mxCellState> for the source or target terminal.
   * next - <mxPoint> that lies outside of the given terminal.
   * orthogonal - Boolean that specifies if the orthogonal projection onto
   * the perimeter should be returned. If this is false then the intersection
   * of the perimeter and the line between the next and the center point is
   * returned.
   * border - Optional border between the perimeter and the shape.
   */
  getPerimeterPoint(terminal, next, orthogonal, border) {
    let point = null;

    if (terminal != null) {
      const perimeter = this.getPerimeterFunction(terminal);

      if (perimeter != null && next != null) {
        const bounds = this.getPerimeterBounds(terminal, border);

        if (bounds.width > 0 || bounds.height > 0) {
          point = new mxPoint(next.x, next.y);
          let flipH = false;
          let flipV = false;

          if (this.graph.model.isVertex(terminal.cell)) {
            flipH =
              mxUtils.getValue(terminal.style, mxConstants.STYLE_FLIPH, 0) == 1;
            flipV =
              mxUtils.getValue(terminal.style, mxConstants.STYLE_FLIPV, 0) == 1;

            // Legacy support for stencilFlipH/V
            if (terminal.shape != null && terminal.shape.stencil != null) {
              flipH =
                mxUtils.getValue(terminal.style, 'stencilFlipH', 0) == 1 ||
                flipH;
              flipV =
                mxUtils.getValue(terminal.style, 'stencilFlipV', 0) == 1 ||
                flipV;
            }

            if (flipH) {
              point.x = 2 * bounds.getCenterX() - point.x;
            }

            if (flipV) {
              point.y = 2 * bounds.getCenterY() - point.y;
            }
          }

          point = perimeter(bounds, terminal, point, orthogonal);

          if (point != null) {
            if (flipH) {
              point.x = 2 * bounds.getCenterX() - point.x;
            }

            if (flipV) {
              point.y = 2 * bounds.getCenterY() - point.y;
            }
          }
        }
      }

      if (point == null) {
        point = this.getPoint(terminal);
      }
    }
    return point;
  }

  /**
   * Function: getRoutingCenterX
   *
   * Returns the x-coordinate of the center point for automatic routing.
   */
  getRoutingCenterX(state: mxCellState) {
    const f =
      state.style != null
        ? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_X]) || 0
        : 0;
    return state.getCenterX() + f * state.width;
  }

  /**
   * Function: getRoutingCenterY
   *
   * Returns the y-coordinate of the center point for automatic routing.
   */
  getRoutingCenterY(state: mxCellState) {
    const f =
      state.style != null
        ? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_Y]) || 0
        : 0;
    return state.getCenterY() + f * state.height;
  }

  /**
   * Function: getPerimeterBounds
   *
   * Returns the perimeter bounds for the given terminal, edge pair as an
   * <mxRectangle>.
   *
   * If you have a model where each terminal has a relative child that should
   * act as the graphical endpoint for a connection from/to the terminal, then
   * this method can be replaced as follows:
   *
   * (code)
   * let oldGetPerimeterBounds = getPerimeterBounds;
   * getPerimeterBounds = (terminal, edge, isSource)=>
   * {
   *   let model = this.graph.getModel();
   *   let childCount = model.getChildCount(terminal.cell);
   *
   *   if (childCount > 0)
   *   {
   *     let child = model.getChildAt(terminal.cell, 0);
   *     let geo = model.getGeometry(child);
   *
   *     if (geo != null &&
   *         geo.relative)
   *     {
   *       let state = this.getState(child);
   *
   *       if (state != null)
   *       {
   *         terminal = state;
   *       }
   *     }
   *   }
   *
   *   return oldGetPerimeterBounds.apply(this, arguments);
   * };
   * (end)
   *
   * Parameters:
   *
   * terminal - <mxCellState> that represents the terminal.
   * border - Number that adds a border between the shape and the perimeter.
   */
  getPerimeterBounds(
    terminal: mxCell | null = null,
    border: number = 0
  ): mxRectangle | null {
    if (terminal != null) {
      border += parseFloat(
        terminal.style[mxConstants.STYLE_PERIMETER_SPACING] || 0
      );
    }
    return terminal.getPerimeterBounds(border * this.scale, 0);
  }

  /**
   * Function: getPerimeterFunction
   *
   * Returns the perimeter function for the given state.
   */
  getPerimeterFunction(state: mxCellState) {
    let perimeter = state.style[mxConstants.STYLE_PERIMETER];

    // Converts string values to objects
    if (typeof perimeter === 'string') {
      let tmp = mxStyleRegistry.getValue(perimeter);
      if (tmp == null && this.isAllowEval()) {
        tmp = mxUtils.eval(perimeter);
      }
      perimeter = tmp;
    }

    if (typeof perimeter === 'function') {
      return perimeter;
    }
    return null;
  }

  /**
   * Function: getNextPoint
   *
   * Returns the nearest point in the list of absolute points or the center
   * of the opposite terminal.
   *
   * Parameters:
   *
   * edge - <mxCellState> that represents the edge.
   * opposite - <mxCellState> that represents the opposite terminal.
   * source - Boolean indicating if the next point for the source or target
   * should be returned.
   */
  getNextPoint(edge, opposite, source) {
    const pts = edge.absolutePoints;
    let point = null;

    if (pts != null && pts.length >= 2) {
      const count = pts.length;
      point = pts[source ? Math.min(1, count - 1) : Math.max(0, count - 2)];
    }

    if (point == null && opposite != null) {
      point = new mxPoint(opposite.getCenterX(), opposite.getCenterY());
    }

    return point;
  }

  /**
   * Function: getVisibleTerminal
   *
   * Returns the nearest ancestor terminal that is visible. The edge appears
   * to be connected to this terminal on the display. The result of this method
   * is cached in <mxCellState.getVisibleTerminalState>.
   *
   * Parameters:
   *
   * edge - <mxCell> whose visible terminal should be returned.
   * source - Boolean that specifies if the source or target terminal
   * should be returned.
   */
  getVisibleTerminal(edge, source) {
    const model = this.graph.getModel();
    let result = model.getTerminal(edge, source);
    let best = result;

    while (result != null && result != this.currentRoot) {
      if (!this.graph.isCellVisible(best) || this.isCellCollapsed(result)) {
        best = result;
      }

      result = model.getParent(result);
    }

    // Checks if the result is valid for the current view state
    if (
      best != null &&
      (!model.contains(best) ||
        model.getParent(best) === model.getRoot() ||
        best === this.currentRoot)
    ) {
      best = null;
    }

    return best;
  }

  /**
   * Function: updateEdgeBounds
   *
   * Updates the given state using the bounding box of t
   * he absolute points.
   * Also updates <mxCellState.terminalDistance>, <mxCellState.length> and
   * <mxCellState.segments>.
   *
   * Parameters:
   *
   * state - <mxCellState> whose bounds should be updated.
   */
  updateEdgeBounds(state: mxCellState) {
    const points = state.absolutePoints;
    const p0 = points[0];
    const pe = points[points.length - 1];

    if (p0.x !== pe.x || p0.y !== pe.y) {
      const dx = pe.x - p0.x;
      const dy = pe.y - p0.y;
      state.terminalDistance = Math.sqrt(dx * dx + dy * dy);
    } else {
      state.terminalDistance = 0;
    }

    let length = 0;
    const segments = [];
    let pt = p0;

    if (pt != null) {
      let minX = pt.x;
      let minY = pt.y;
      let maxX = minX;
      let maxY = minY;

      for (let i = 1; i < points.length; i += 1) {
        const tmp = points[i];

        if (tmp != null) {
          const dx = pt.x - tmp.x;
          const dy = pt.y - tmp.y;

          const segment = Math.sqrt(dx * dx + dy * dy);
          segments.push(segment);
          length += segment;

          pt = tmp;

          minX = Math.min(pt.x, minX);
          minY = Math.min(pt.y, minY);
          maxX = Math.max(pt.x, maxX);
          maxY = Math.max(pt.y, maxY);
        }
      }

      state.length = length;
      state.segments = segments;

      const markerSize = 1; // TODO: include marker size

      state.x = minX;
      state.y = minY;
      state.width = Math.max(markerSize, maxX - minX);
      state.height = Math.max(markerSize, maxY - minY);
    }
  }

  /**
   * Function: getPoint
   *
   * Returns the absolute point on the edge for the given relative
   * <mxGeometry> as an <mxPoint>. The edge is represented by the given
   * <mxCellState>.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the state of the parent edge.
   * geometry - <mxGeometry> that represents the relative location.
   */
  getPoint(state, geometry) {
    let x = state.getCenterX();
    let y = state.getCenterY();

    if (state.segments != null && (geometry == null || geometry.relative)) {
      const gx = geometry != null ? geometry.x / 2 : 0;
      const pointCount = state.absolutePoints.length;
      const dist = Math.round((gx + 0.5) * state.length);
      let segment = state.segments[0];
      let length = 0;
      let index = 1;

      while (dist >= Math.round(length + segment) && index < pointCount - 1) {
        length += segment;
        segment = state.segments[index++];
      }

      const factor = segment === 0 ? 0 : (dist - length) / segment;
      const p0 = state.absolutePoints[index - 1];
      const pe = state.absolutePoints[index];

      if (p0 != null && pe != null) {
        let gy = 0;
        let offsetX = 0;
        let offsetY = 0;

        if (geometry != null) {
          gy = geometry.y;
          const { offset } = geometry;

          if (offset != null) {
            offsetX = offset.x;
            offsetY = offset.y;
          }
        }

        const dx = pe.x - p0.x;
        const dy = pe.y - p0.y;
        const nx = segment === 0 ? 0 : dy / segment;
        const ny = segment === 0 ? 0 : dx / segment;

        x = p0.x + dx * factor + (nx * gy + offsetX) * this.scale;
        y = p0.y + dy * factor - (ny * gy - offsetY) * this.scale;
      }
    } else if (geometry != null) {
      const { offset } = geometry;

      if (offset != null) {
        x += offset.x;
        y += offset.y;
      }
    }

    return new mxPoint(x, y);
  }

  /**
   * Function: getRelativePoint
   *
   * Gets the relative point that describes the given, absolute label
   * position for the given edge state.
   *
   * Parameters:
   *
   * state - <mxCellState> that represents the state of the parent edge.
   * x - Specifies the x-coordinate of the absolute label location.
   * y - Specifies the y-coordinate of the absolute label location.
   */
  getRelativePoint(edgeState, x, y) {
    const model = this.graph.getModel();
    const geometry = model.getGeometry(edgeState.cell);

    if (geometry != null) {
      const pointCount = edgeState.absolutePoints.length;

      if (geometry.relative && pointCount > 1) {
        const totalLength = edgeState.length;
        const { segments } = edgeState;

        // Works out which line segment the point of the label is closest to
        let p0 = edgeState.absolutePoints[0];
        let pe = edgeState.absolutePoints[1];
        let minDist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
        let length = 0;
        let index = 0;
        let tmp = 0;

        for (let i = 2; i < pointCount; i += 1) {
          p0 = pe;
          pe = edgeState.absolutePoints[i];
          const dist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
          tmp += segments[i - 2];

          if (dist <= minDist) {
            minDist = dist;
            index = i - 1;
            length = tmp;
          }
        }

        const seg = segments[index];
        p0 = edgeState.absolutePoints[index];
        pe = edgeState.absolutePoints[index + 1];

        const x2 = p0.x;
        const y2 = p0.y;

        const x1 = pe.x;
        const y1 = pe.y;

        let px = x;
        let py = y;

        const xSegment = x2 - x1;
        const ySegment = y2 - y1;

        px -= x1;
        py -= y1;
        let projlenSq = 0;

        px = xSegment - px;
        py = ySegment - py;
        const dotprod = px * xSegment + py * ySegment;

        if (dotprod <= 0.0) {
          projlenSq = 0;
        } else {
          projlenSq =
            (dotprod * dotprod) / (xSegment * xSegment + ySegment * ySegment);
        }

        let projlen = Math.sqrt(projlenSq);

        if (projlen > seg) {
          projlen = seg;
        }

        let yDistance = Math.sqrt(
          mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y)
        );
        const direction = mxUtils.relativeCcw(p0.x, p0.y, pe.x, pe.y, x, y);

        if (direction === -1) {
          yDistance = -yDistance;
        }

        // Constructs the relative point for the label
        return new mxPoint(
          ((totalLength / 2 - length - projlen) / totalLength) * -2,
          yDistance / this.scale
        );
      }
    }
    return new mxPoint();
  }

  /**
   * Function: updateEdgeLabelOffset
   *
   * Updates <mxCellState.absoluteOffset> for the given state. The absolute
   * offset is normally used for the position of the edge label. Is is
   * calculated from the geometry as an absolute offset from the center
   * between the two endpoints if the geometry is absolute, or as the
   * relative distance between the center along the line and the absolute
   * orthogonal distance if the geometry is relative.
   *
   * Parameters:
   *
   * state - <mxCellState> whose absolute offset should be updated.
   */
  updateEdgeLabelOffset(state: mxCellState) {
    const points = state.absolutePoints;

    state.absoluteOffset.x = state.getCenterX();
    state.absoluteOffset.y = state.getCenterY();

    if (points != null && points.length > 0 && state.segments != null) {
      const geometry = this.graph.getCellGeometry(state.cell);

      if (geometry.relative) {
        const offset = this.getPoint(state, geometry);

        if (offset != null) {
          state.absoluteOffset = offset;
        }
      } else {
        const p0 = points[0];
        const pe = points[points.length - 1];

        if (p0 != null && pe != null) {
          const dx = pe.x - p0.x;
          const dy = pe.y - p0.y;
          let x0 = 0;
          let y0 = 0;

          const off = geometry.offset;

          if (off != null) {
            x0 = off.x;
            y0 = off.y;
          }

          const x = p0.x + dx / 2 + x0 * this.scale;
          const y = p0.y + dy / 2 + y0 * this.scale;

          state.absoluteOffset.x = x;
          state.absoluteOffset.y = y;
        }
      }
    }
  }

  /**
   * Function: getState
   *
   * Returns the <mxCellState> for the given cell. If create is true, then
   * the state is created if it does not yet exist.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the <mxCellState> should be returned.
   * create - Optional boolean indicating if a new state should be created
   * if it does not yet exist. Default is false.
   */
  getState(cell: mxCell | null, create: boolean = false) {
    let state: mxCellState = null;

    if (cell != null) {
      state = this.states.get(cell);

      if (
        create &&
        (state == null || this.updateStyle) &&
        this.graph.isCellVisible(cell)
      ) {
        if (state == null) {
          state = this.createState(cell);
          this.states.put(cell, state);
        } else {
          state.style = this.graph.getCellStyle(cell);
        }
      }
    }
    return state;
  }

  /**
   * Function: getCellStates
   *
   * Returns the <mxCellStates> for the given array of <mxCells>. The array
   * contains all states that are not null, that is, the returned array may
   * have less elements than the given array. If no argument is given, then
   * this returns <states>.
   */
  getCellStates(cells: mxCell[] | null): mxCellState[] | null {
    if (cells == null) {
      return this.states;
    }

    const result: mxCellState[] = [];
    for (const cell of cells) {
      const state = this.getState(cell);
      if (state != null) {
        result.push(state);
      }
    }
    return result;
  }

  /**
   * Function: removeState
   *
   * Removes and returns the <mxCellState> for the given cell.
   *
   * Parameters:
   *
   * cell - <mxCell> for which the <mxCellState> should be removed.
   */
  removeState(cell: mxCell): mxCellState {
    let state: mxCellState = null;

    if (cell != null) {
      state = this.states.remove(cell);

      if (state != null) {
        this.graph.cellRenderer.destroy(state);
        state.invalid = true;
        state.destroy();
      }
    }
    return state;
  }

  /**
   * Function: createState
   *
   * Creates and returns an <mxCellState> for the given cell and initializes
   * it using <mxCellRenderer.initialize>.
   *
   * Parameters:
   *
   * cell - <mxCell> for which a new <mxCellState> should be created.
   */
  createState(cell: mxCell): mxCellState {
    return new mxCellState(this, cell, this.graph.getCellStyle(cell));
  }

  /**
   * Function: isContainerEvent
   *
   * Returns true if the event origin is one of the drawing panes or
   * containers of the view.
   */
  isContainerEvent(evt) {
    const source = mxEvent.getSource(evt);

    return (
      source === this.graph.container ||
      source.parentNode === this.backgroundPane ||
      (source.parentNode != null &&
        source.parentNode.parentNode === this.backgroundPane) ||
      source === this.canvas.parentNode ||
      source === this.canvas ||
      source === this.backgroundPane ||
      source === this.drawPane ||
      source === this.overlayPane ||
      source === this.decoratorPane
    );
  }

  /**
   * Function: isScrollEvent
   *
   * Returns true if the event origin is one of the scrollbars of the
   * container in IE. Such events are ignored.
   */
  isScrollEvent(evt) {
    const offset = mxUtils.getOffset(this.graph.container);
    const pt = new mxPoint(evt.clientX - offset.x, evt.clientY - offset.y);

    const outWidth = this.graph.container.offsetWidth;
    const inWidth = this.graph.container.clientWidth;

    if (outWidth > inWidth && pt.x > inWidth + 2 && pt.x <= outWidth) {
      return true;
    }

    const outHeight = this.graph.container.offsetHeight;
    const inHeight = this.graph.container.clientHeight;

    return outHeight > inHeight && pt.y > inHeight + 2 && pt.y <= outHeight;
  }

  /**
   * Function: init
   *
   * Initializes the graph event dispatch loop for the specified container
   * and invokes <create> to create the required DOM nodes for the display.
   */
  init() {
    this.installListeners();

    // Creates the DOM nodes for the respective display dialect
    const { graph } = this;

    if (graph.dialect === mxConstants.DIALECT_SVG) {
      this.createSvg();
    } else {
      this.createHtml();
    }
  }

  /**
   * Function: installListeners
   *
   * Installs the required listeners in the container.
   */
  installListeners() {
    const { graph } = this;
    const { container } = graph;

    if (container != null) {
      // Support for touch device gestures (eg. pinch to zoom)
      // Double-tap handling is implemented in mxGraph.fireMouseEvent
      if (mxClient.IS_TOUCH) {
        mxEvent.addListener(container, 'gesturestart', evt => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });

        mxEvent.addListener(container, 'gesturechange', evt => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });

        mxEvent.addListener(container, 'gestureend', evt => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });
      }

      // Fires event only for one pointer per gesture
      let pointerId = null;

      // Adds basic listeners for graph event dispatching
      mxEvent.addGestureListeners(
        container,
        mxUtils.bind(this, evt => {
          // Condition to avoid scrollbar events starting a rubberband selection
          if (
            this.isContainerEvent(evt) &&
            ((!mxClient.IS_GC && !mxClient.IS_SF) || !this.isScrollEvent(evt))
          ) {
            graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
            pointerId = evt.pointerId;
          }
        }),
        mxUtils.bind(this, evt => {
          if (
            this.isContainerEvent(evt) &&
            (pointerId == null || evt.pointerId === pointerId)
          ) {
            graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
          }
        }),
        mxUtils.bind(this, evt => {
          if (this.isContainerEvent(evt)) {
            graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
          }

          pointerId = null;
        })
      );

      // Adds listener for double click handling on background, this does always
      // use native event handler, we assume that the DOM of the background
      // does not change during the double click
      mxEvent.addListener(
        container,
        'dblclick',
        mxUtils.bind(this, evt => {
          if (this.isContainerEvent(evt)) {
            graph.dblClick(evt);
          }
        })
      );

      // Workaround for touch events which started on some DOM node
      // on top of the container, in which case the cells under the
      // mouse for the move and up events are not detected.
      const getState = evt => {
        let state = null;

        // Workaround for touch events which started on some DOM node
        // on top of the container, in which case the cells under the
        // mouse for the move and up events are not detected.
        if (mxClient.IS_TOUCH) {
          const x = mxEvent.getClientX(evt);
          const y = mxEvent.getClientY(evt);

          // Dispatches the drop event to the graph which
          // consumes and executes the source function
          const pt = mxUtils.convertPoint(container, x, y);
          state = graph.view.getState(graph.getCellAt(pt.x, pt.y));
        }

        return state;
      };

      // Adds basic listeners for graph event dispatching outside of the
      // container and finishing the handling of a single gesture
      // Implemented via graph event dispatch loop to avoid duplicate events
      // in Firefox and Chrome
      graph.addMouseListener({
        mouseDown: (sender, me) => {
          graph.popupMenuHandler.hideMenu();
        },
        mouseMove: () => {},
        mouseUp: () => {},
      });

      this.moveHandler = mxUtils.bind(this, evt => {
        // Hides the tooltip if mouse is outside container
        if (
          graph.tooltipHandler != null &&
          graph.tooltipHandler.isHideOnHover()
        ) {
          graph.tooltipHandler.hide();
        }

        if (
          this.captureDocumentGesture &&
          graph.isMouseDown &&
          graph.container != null &&
          !this.isContainerEvent(evt) &&
          graph.container.style.display !== 'none' &&
          graph.container.style.visibility !== 'hidden' &&
          !mxEvent.isConsumed(evt)
        ) {
          graph.fireMouseEvent(
            mxEvent.MOUSE_MOVE,
            new mxMouseEvent(evt, getState(evt))
          );
        }
      });

      this.endHandler = mxUtils.bind(this, evt => {
        if (
          this.captureDocumentGesture &&
          graph.isMouseDown &&
          graph.container != null &&
          !this.isContainerEvent(evt) &&
          graph.container.style.display !== 'none' &&
          graph.container.style.visibility !== 'hidden'
        ) {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
        }
      });

      mxEvent.addGestureListeners(
        document,
        null,
        this.moveHandler,
        this.endHandler
      );
    }
  }

  /**
   * Function: createHtml
   *
   * Creates the DOM nodes for the HTML display.
   */
  createHtml() {
    const { container } = this.graph;

    if (container != null) {
      this.canvas = this.createHtmlPane('100%', '100%');
      this.canvas.style.overflow = 'hidden';

      // Uses minimal size for inner DIVs on Canvas. This is required
      // for correct event processing in IE. If we have an overlapping
      // DIV then the events on the cells are only fired for labels.
      this.backgroundPane = this.createHtmlPane('1px', '1px');
      this.drawPane = this.createHtmlPane('1px', '1px');
      this.overlayPane = this.createHtmlPane('1px', '1px');
      this.decoratorPane = this.createHtmlPane('1px', '1px');

      this.canvas.appendChild(this.backgroundPane);
      this.canvas.appendChild(this.drawPane);
      this.canvas.appendChild(this.overlayPane);
      this.canvas.appendChild(this.decoratorPane);

      container.appendChild(this.canvas);
      this.updateContainerStyle(container);
    }
  }

  /**
   * Function: updateHtmlCanvasSize
   *
   * Updates the size of the HTML canvas.
   */
  updateHtmlCanvasSize(width, height) {
    if (this.graph.container != null) {
      const ow = this.graph.container.offsetWidth;
      const oh = this.graph.container.offsetHeight;

      if (ow < width) {
        this.canvas.style.width = `${width}px`;
      } else {
        this.canvas.style.width = '100%';
      }

      if (oh < height) {
        this.canvas.style.height = `${height}px`;
      } else {
        this.canvas.style.height = '100%';
      }
    }
  }

  /**
   * Function: createHtmlPane
   *
   * Creates and returns a drawing pane in HTML (DIV).
   */
  createHtmlPane(width, height) {
    const pane = document.createElement('DIV');

    if (width != null && height != null) {
      pane.style.position = 'absolute';
      pane.style.left = '0px';
      pane.style.top = '0px';

      pane.style.width = width;
      pane.style.height = height;
    } else {
      pane.style.position = 'relative';
    }

    return pane;
  }

  /**
   * Function: createSvg
   *
   * Creates and returns the DOM nodes for the SVG display.
   */
  createSvg() {
    const { container } = this.graph;
    this.canvas = document.createElementNS(mxConstants.NS_SVG, 'g');

    // For background image
    this.backgroundPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.backgroundPane);

    // Adds two layers (background is early feature)
    this.drawPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.drawPane);

    this.overlayPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.overlayPane);

    this.decoratorPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.decoratorPane);

    const root = document.createElementNS(mxConstants.NS_SVG, 'svg');
    root.style.left = '0px';
    root.style.top = '0px';
    root.style.width = '100%';
    root.style.height = '100%';

    // NOTE: In standards mode, the SVG must have block layout
    // in order for the container DIV to not show scrollbars.
    root.style.display = 'block';
    root.appendChild(this.canvas);

    if (container != null) {
      container.appendChild(root);
      this.updateContainerStyle(container);
    }
  }

  /**
   * Function: updateContainerStyle
   *
   * Updates the style of the container after installing the SVG DOM elements.
   */
  updateContainerStyle(container) {
    // Workaround for offset of container
    const style = mxUtils.getCurrentStyle(container);

    if (style != null && style.position == 'static') {
      container.style.position = 'relative';
    }

    // Disables built-in pan and zoom in IE10 and later
    if (mxClient.IS_POINTER) {
      container.style.touchAction = 'none';
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the view and all its resources.
   */
  destroy() {
    let root = this.canvas != null ? this.canvas.ownerSVGElement : null;

    if (root == null) {
      root = this.canvas;
    }

    if (root != null && root.parentNode != null) {
      this.clear(this.currentRoot, true);
      mxEvent.removeGestureListeners(
        document,
        null,
        this.moveHandler,
        this.endHandler
      );
      mxEvent.release(this.graph.container);
      root.parentNode.removeChild(root);

      this.moveHandler = null;
      this.endHandler = null;
      this.canvas = null;
      this.backgroundPane = null;
      this.drawPane = null;
      this.overlayPane = null;
      this.decoratorPane = null;
    }
  }
}

export default mxGraphView;
import('../../serialization/mxGraphViewCodec');
