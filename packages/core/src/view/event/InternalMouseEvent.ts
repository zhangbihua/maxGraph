/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import {getClientX, getClientY, getSource, isMouseEvent, isPopupTrigger} from '../../util/EventUtils';
import { isAncestorNode } from '../../util/DomUtils';
import CellState from '../cell/datatypes/CellState';
import Shape from '../geometry/shape/Shape';
import Cell from '../cell/datatypes/Cell';

/**
 * Class: mxMouseEvent
 *
 * Base class for all mouse events in mxGraph. A listener for this event should
 * implement the following methods:
 *
 * (code)
 * graph.addMouseListener(
 * {
 *   mouseDown: (sender, evt)=>
 *   {
 *     mxLog.debug('mouseDown');
 *   },
 *   mouseMove: (sender, evt)=>
 *   {
 *     mxLog.debug('mouseMove');
 *   },
 *   mouseUp: (sender, evt)=>
 *   {
 *     mxLog.debug('mouseUp');
 *   }
 * });
 * (end)
 *
 * Constructor: mxMouseEvent
 *
 * Constructs a new event object for the given arguments.
 *
 * Parameters:
 *
 * evt - Native mouse event.
 * state - Optional <mxCellState> under the mouse.
 *
 */
class InternalMouseEvent {
  constructor(evt: MouseEvent, state?: CellState) {
    this.evt = evt;
    this.state = state;
    this.sourceState = state;
  }

  /**
   * Variable: consumed
   *
   * Holds the consumed state of this event.
   */
  consumed: boolean = false;

  /**
   * Variable: evt
   *
   * Holds the inner event object.
   */
  evt: MouseEvent;

  /**
   * Variable: graphX
   *
   * Holds the x-coordinate of the event in the graph. This value is set in
   * <mxGraph.fireMouseEvent>.
   */
  graphX?: number;

  /**
   * Variable: graphY
   *
   * Holds the y-coordinate of the event in the graph. This value is set in
   * <mxGraph.fireMouseEvent>.
   */
  graphY?: number;

  /**
   * Variable: state
   *
   * Holds the optional <mxCellState> associated with this event.
   */
  state?: CellState;

  /**
   * Variable: sourceState
   *
   * Holds the <mxCellState> that was passed to the constructor. This can be
   * different from <state> depending on the result of <mxGraph.getEventState>.
   */
  sourceState?: CellState;

  /**
   * Function: getEvent
   *
   * Returns <evt>.
   */
  getEvent(): MouseEvent {
    return this.evt;
  }

  /**
   * Function: getSource
   *
   * Returns the target DOM element using <mxEvent.getSource> for <evt>.
   */
  getSource(): Element {
    return getSource(this.evt);
  }

  /**
   * Function: isSource
   *
   * Returns true if the given <mxShape> is the source of <evt>.
   */
  isSource(shape: Shape): boolean {
    if (shape != null) {
      return isAncestorNode(shape.node, this.getSource());
    }
    return false;
  }

  /**
   * Function: getX
   *
   * Returns <evt.clientX>.
   */
  getX(): number {
    return getClientX(this.getEvent());
  }

  /**
   * Function: getY
   *
   * Returns <evt.clientY>.
   */
  getY(): number {
    return getClientY(this.getEvent());
  }

  /**
   * Function: getGraphX
   *
   * Returns <graphX>.
   */
  getGraphX(): number | undefined {
    return this.graphX;
  }

  /**
   * Function: getGraphY
   *
   * Returns <graphY>.
   */
  getGraphY(): number | undefined {
    return this.graphY;
  }

  /**
   * Function: getState
   *
   * Returns <state>.
   */
  getState(): CellState | undefined {
    return this.state;
  }

  /**
   * Function: getCell
   *
   * Returns the <mxCell> in <state> is not null.
   */
  getCell(): Cell | null {
    const state = this.getState();
    if (state != null) {
      return state.cell;
    }
    return null;
  }

  /**
   * Function: isPopupTrigger
   *
   * Returns true if the event is a popup trigger.
   */
  isPopupTrigger(): boolean {
    return isPopupTrigger(this.getEvent());
  }

  /**
   * Function: isConsumed
   *
   * Returns <consumed>.
   */
  isConsumed(): boolean {
    return this.consumed;
  }

  /**
   * Function: consume
   *
   * Sets <consumed> to true and invokes preventDefault on the native event
   * if such a method is defined. This is used mainly to avoid the cursor from
   * being changed to a text cursor in Webkit. You can use the preventDefault
   * flag to disable this functionality.
   *
   * Parameters:
   *
   * preventDefault - Specifies if the native event should be canceled. Default
   * is true.
   */
  consume(preventDefault?: boolean): void {
    preventDefault =
      preventDefault != null
        ? preventDefault
        : this.evt.touches != null || isMouseEvent(this.evt);

    if (preventDefault && this.evt.preventDefault) {
      this.evt.preventDefault();
    }

    // Sets local consumed state
    this.consumed = true;
  }
}

export default InternalMouseEvent;
