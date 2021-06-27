/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import mxPopupMenu from '../../util/gui/mxPopupMenu';
import InternalEvent from '../event/InternalEvent';
import utils from '../../util/Utils';
import { getMainEvent, isMultiTouchEvent } from '../../util/EventUtils';
import Graph from '../Graph';
import InternalMouseEvent from '../event/InternalMouseEvent';
import Cell from '../cell/datatypes/Cell';

/**
 * Class: mxPopupMenuHandler
 *
 * Event handler that creates popupmenus.
 *
 * Constructor: mxPopupMenuHandler
 *
 * Constructs an event handler that creates a <mxPopupMenu>.
 */
class PopupMenuHandler extends mxPopupMenu {
  constructor(graph: Graph, factoryMethod: any) {
    super();

    if (graph != null) {
      this.graph = graph;
      this.factoryMethod = factoryMethod;
      this.graph.addMouseListener(this);

      // Does not show menu if any touch gestures take place after the trigger
      this.gestureHandler = (sender, eo) => {
        this.inTolerance = false;
      };

      this.graph.addListener(InternalEvent.GESTURE, this.gestureHandler);

      this.init();
    }
  }

  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  // @ts-ignore
  graph: Graph;

  /**
   * Variable: selectOnPopup
   *
   * Specifies if cells should be selected if a popupmenu is displayed for
   * them. Default is true.
   */
  selectOnPopup: boolean = true;

  /**
   * Variable: clearSelectionOnBackground
   *
   * Specifies if cells should be deselected if a popupmenu is displayed for
   * the diagram background. Default is true.
   */
  clearSelectionOnBackground: boolean = true;

  /**
   * Variable: triggerX
   *
   * X-coordinate of the mouse down event.
   */
  triggerX: number | null = null;

  /**
   * Variable: triggerY
   *
   * Y-coordinate of the mouse down event.
   */
  triggerY: number | null = null;

  /**
   * Variable: screenX
   *
   * Screen X-coordinate of the mouse down event.
   */
  screenX: number | null = null;

  /**
   * Variable: screenY
   *
   * Screen Y-coordinate of the mouse down event.
   */
  screenY: number | null = null;

  /**
   * Function: init
   *
   * Initializes the shapes required for this vertex handler.
   */
  init(): void {
    // Supercall
    super.init();

    // Hides the tooltip if the mouse is over
    // the context menu
    InternalEvent.addGestureListeners(
      this.div,
       evt => {
        this.graph.tooltipHandler.hide();
      }
    );
  }

  /**
   * Function: isSelectOnPopup
   *
   * Hook for returning if a cell should be selected for a given <mxMouseEvent>.
   * This implementation returns <selectOnPopup>.
   */
  isSelectOnPopup(me: InternalMouseEvent): boolean {
    return this.selectOnPopup;
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by initiating the panning. By consuming the event all
   * subsequent events of the gesture are redirected to this handler.
   */
  mouseDown(sender: any,
            me: InternalMouseEvent): void {

    if (this.isEnabled() && !isMultiTouchEvent(me.getEvent())) {
      // Hides the popupmenu if is is being displayed
      this.hideMenu();
      this.triggerX = me.getGraphX();
      this.triggerY = me.getGraphY();
      this.screenX = getMainEvent(me.getEvent()).screenX;
      this.screenY = getMainEvent(me.getEvent()).screenY;
      this.popupTrigger = this.isPopupTrigger(me);
      this.inTolerance = true;
    }
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating the panning on the graph.
   */
  mouseMove(sender: any,
            me: InternalMouseEvent): void {

    // Popup trigger may change on mouseUp so ignore it
    if (this.inTolerance && this.screenX != null && this.screenY != null) {
      if (
        Math.abs(getMainEvent(me.getEvent()).screenX - this.screenX) >
          this.graph.tolerance ||
        Math.abs(getMainEvent(me.getEvent()).screenY - this.screenY) >
          this.graph.tolerance
      ) {
        this.inTolerance = false;
      }
    }
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by setting the translation on the view or showing the
   * popupmenu.
   */
  mouseUp(sender: any,
          me: InternalMouseEvent): void {
    if (
      this.popupTrigger &&
      this.inTolerance &&
      this.triggerX != null &&
      this.triggerY != null
    ) {
      const cell = this.getCellForPopupEvent(me);

      // Selects the cell for which the context menu is being displayed
      if (
        this.graph.isEnabled() &&
        this.isSelectOnPopup(me) &&
        cell != null &&
        !this.graph.isCellSelected(cell)
      ) {
        this.graph.setSelectionCell(cell);
      } else if (this.clearSelectionOnBackground && cell == null) {
        this.graph.clearSelection();
      }

      // Hides the tooltip if there is one
      this.graph.tooltipHandler.hide();

      // Menu is shifted by 1 pixel so that the mouse up event
      // is routed via the underlying shape instead of the DIV
      const origin = utils.getScrollOrigin();
      this.popup(
        me.getX() + origin.x + 1,
        me.getY() + origin.y + 1,
        cell,
        me.getEvent()
      );
      me.consume();
    }

    this.popupTrigger = false;
    this.inTolerance = false;
  }

  /**
   * Function: getCellForPopupEvent
   *
   * Hook to return the cell for the mouse up popup trigger handling.
   */
  getCellForPopupEvent(me: InternalMouseEvent): Cell {
    return me.getCell();
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.removeMouseListener(this);
    this.graph.removeListener(this.gestureHandler);

    // Supercall
    super.destroy();
  }
}

export default PopupMenuHandler;
