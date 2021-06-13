import InternalMouseEvent from "./InternalMouseEvent";
import EventObject from "./EventObject";
import InternalEvent from "./InternalEvent";
import {
  getClientX,
  getClientY,
  isAltDown,
  isConsumed, isControlDown, isLeftMouseButton, isMetaDown,
  isMouseEvent, isMultiTouchEvent,
  isPenEvent,
  isPopupTrigger, isShiftDown, isTouchEvent
} from "../../util/EventUtils";
import CellState from "../cell/datatypes/CellState";
import Cell from "../cell/datatypes/Cell";
import PanningHandler from "../panning/PanningHandler";
import ConnectionHandler from "../connection/ConnectionHandler";
import Point from "../geometry/Point";
import {convertPoint, getValue} from "../../util/Utils";
import {NONE, SHAPE_SWIMLANE} from "../../util/Constants";
import mxClient from "../../mxClient";
import EventSource from "./EventSource";
import CellEditor from "../editing/CellEditor";
import Graph from "../Graph";

class GraphEvents {
  constructor(graph: Graph) {
    this.graph = graph;

    // Initializes the variable in case the prototype has been
    // modified to hold some listeners (which is possible because
    // the createHandlers call is executed regardless of the
    // arguments passed into the ctor).
    this.mouseListeners = null;
  }

  graph: Graph;

  /**
   * Holds the mouse event listeners. See {@link fireMouseEvent}.
   */
  mouseListeners: any[] | null = null;
  
  // TODO: Document me!
  lastTouchEvent: InternalMouseEvent | null = null;
  doubleClickCounter: number = 0;
  lastTouchCell: Cell | null = null;
  fireDoubleClick: boolean | null = null;
  tapAndHoldThread: number | null = null;
  lastMouseX: number | null = null;
  lastMouseY: number | null = null;
  isMouseTrigger: boolean | null = null;
  ignoreMouseEvents: boolean | null = null;
  mouseMoveRedirect: EventListener | null = null;
  mouseUpRedirect: EventListener | null = null;
  lastEvent: any; // FIXME: Check if this can be more specific - DOM events or mxEventObjects!

  /**
   * Specifies if {@link mxKeyHandler} should invoke {@link escape} when the escape key
   * is pressed.
   * @default true
   */
  escapeEnabled: boolean = true;

  /**
   * If `true`, when editing is to be stopped by way of selection changing,
   * data in diagram changing or other means stopCellEditing is invoked, and
   * changes are saved. This is implemented in a focus handler in
   * {@link CellEditor}.
   * @default true
   */
  invokesStopCellEditing: boolean = true;

  /**
   * If `true`, pressing the enter key without pressing control or shift will stop
   * editing and accept the new value. This is used in {@link CellEditor} to stop
   * cell editing. Note: You can always use F2 and escape to stop editing.
   * @default false
   */
  enterStopsCellEditing: boolean = false;

  /**
   * Holds the state of the mouse button.
   */
  isMouseDown: boolean = false;


  /**
   * Specifies if native double click events should be detected.
   * @default true
   */
  nativeDblClickEnabled: boolean = true;

  /**
   * Specifies if double taps on touch-based devices should be handled as a
   * double click.
   * @default true
   */
  doubleTapEnabled: boolean = true;

  /**
   * Specifies the timeout in milliseconds for double taps and non-native double clicks.
   * @default 500
   */
  doubleTapTimeout: number = 500;

  /**
   * Specifies the tolerance in pixels for double taps and double clicks in quirks mode.
   * @default 25
   */
  doubleTapTolerance: number = 25;

  /**
   * Variable: lastTouchX
   *
   * Holds the x-coordinate of the last touch event for double tap detection.
   */
  lastTouchX: number = 0;

  /**
   * Holds the x-coordinate of the last touch event for double tap detection.
   */
  lastTouchY: number = 0;

  /**
   * Holds the time of the last touch event for double click detection.
   */
  lastTouchTime: number = 0;

  /**
   * Specifies if tap and hold should be used for starting connections on touch-based
   * devices.
   * @default true
   */
  tapAndHoldEnabled: boolean = true;

  /**
   * Specifies the time in milliseconds for a tap and hold.
   * @default 500
   */
  tapAndHoldDelay: number = 500;

  /**
   * `True` if the timer for tap and hold events is running.
   */
  tapAndHoldInProgress: boolean = false;

  /**
   * `True` as long as the timer is running and the touch events
   * stay within the given {@link tapAndHoldTolerance}.
   */
  tapAndHoldValid: boolean = false;

  /**
   * Holds the x-coordinate of the initial touch event for tap and hold.
   */
  initialTouchX: number = 0;

  /**
   * Holds the y-coordinate of the initial touch event for tap and hold.
   */
  initialTouchY: number = 0;

  /**
   * Tolerance in pixels for a move to be handled as a single click.
   * @default 4
   */
  tolerance: number = 4;

  /*****************************************************************************
   * Group: Event processing
   *****************************************************************************/

  /**
   * Processes an escape keystroke.
   *
   * @param evt Mouseevent that represents the keystroke.
   */
  escape(evt: InternalMouseEvent): void {
    this.graph.fireEvent(new EventObject(InternalEvent.ESCAPE, 'event', evt));
  }

  /**
   * Processes a singleclick on an optional cell and fires a {@link click} event.
   * The click event is fired initially. If the graph is enabled and the
   * event has not been consumed, then the cell is selected using
   * {@link selectCellForEvent} or the selection is cleared using
   * {@link clearSelection}. The events consumed state is set to true if the
   * corresponding {@link InternalMouseEvent} has been consumed.
   *
   * To handle a click event, use the following code.
   *
   * ```javascript
   * graph.addListener(mxEvent.CLICK, function(sender, evt)
   * {
   *   var e = evt.getProperty('event'); // mouse event
   *   var cell = evt.getProperty('cell'); // cell may be null
   *
   *   if (cell != null)
   *   {
   *     // Do something useful with cell and consume the event
   *     evt.consume();
   *   }
   * });
   * ```
   *
   * @param me {@link mxMouseEvent} that represents the single click.
   */
  click(me: InternalMouseEvent): boolean {
    const evt = me.getEvent();
    let cell = me.getCell();
    const mxe = new EventObject(InternalEvent.CLICK, 'event', evt, 'cell', cell);

    if (me.isConsumed()) {
      mxe.consume();
    }

    this.graph.fireEvent(mxe);

    if (this.graph.isEnabled() && !isConsumed(evt) && !mxe.isConsumed()) {
      if (cell != null) {
        if (this.isTransparentClickEvent(evt)) {
          let active = false;

          const tmp = this.getCellAt(
            me.graphX,
            me.graphY,
            null,
            false,
            false,
            (state: CellState): boolean => {
              const selected = this.isCellSelected(<Cell>state.cell);
              active = active || selected;

              return (
                !active ||
                selected ||
                (state.cell !== cell &&
                  state.cell.isAncestor(cell))
              );
            }
          );

          if (tmp != null) {
            cell = tmp;
          }
        }
      } else if (this.isSwimlaneSelectionEnabled()) {
        cell = this.getSwimlaneAt(me.getGraphX(), me.getGraphY());

        if (cell != null && (!this.isToggleEvent(evt) || !isAltDown(evt))) {
          let temp = cell;
          let swimlanes = [];

          while (temp != null) {
            temp = temp.getParent();
            const state = this.graph.view.getState(temp);

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
   * Processes a doubleclick on an optional cell and fires a {@link dblclick}
   * event. The event is fired initially. If the graph is enabled and the
   * event has not been consumed, then {@link edit} is called with the given
   * cell. The event is ignored if no cell was specified.
   *
   * Example for overriding this method.
   *
   * ```javascript
   * graph.dblClick = function(evt, cell)
   * {
   *   var mxe = new mxEventObject(mxEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
   *   this.graph.fireEvent(mxe);
   *
   *   if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed())
   *   {
   * 	   mxUtils.alert('Hello, World!');
   *     mxe.consume();
   *   }
   * }
   * ```
   *
   * Example listener for this event.
   *
   * ```javascript
   * graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt)
   * {
   *   var cell = evt.getProperty('cell');
   *   // do something with the cell and consume the
   *   // event to prevent in-place editing from start
   * });
   * ```
   *
   * @param evt Mouseevent that represents the doubleclick.
   * @param cell Optional {@link Cell} under the mousepointer.
   */
  dblClick(evt: MouseEvent, cell?: Cell): void {
    const mxe = new EventObject(
      InternalEvent.DOUBLE_CLICK,
      'event',
      evt,
      'cell',
      cell
    );
    this.graph.fireEvent(mxe);

    // Handles the event if it has not been consumed
    if (
      this.isEnabled() &&
      !isConsumed(evt) &&
      !mxe.isConsumed() &&
      cell != null &&
      this.isCellEditable(cell) &&
      !this.isEditing(cell)
    ) {
      this.startEditingAtCell(cell, evt);
      InternalEvent.consume(evt);
    }
  }

  /**
   * Handles the {@link InternalMouseEvent} by highlighting the {@link CellState}.
   *
   * @param me {@link mxMouseEvent} that represents the touch event.
   * @param state Optional {@link CellState} that is associated with the event.
   */
  tapAndHold(me: InternalMouseEvent): void {
    const evt = me.getEvent();
    const mxe = new EventObject(
      InternalEvent.TAP_AND_HOLD,
      'event',
      evt,
      'cell',
      me.getCell()
    );
    const panningHandler = <PanningHandler>this.panningHandler;
    const connectionHandler = <ConnectionHandler>this.connectionHandler;

    // LATER: Check if event should be consumed if me is consumed
    this.graph.fireEvent(mxe);

    if (mxe.isConsumed()) {
      // Resets the state of the panning handler
      panningHandler.panningTrigger = false;
    }

    // Handles the event if it has not been consumed
    if (
      this.graph.isEnabled() &&
      !isConsumed(evt) &&
      !mxe.isConsumed() &&
      connectionHandler.isEnabled()
    ) {
      const state = this.graph.view.getState(
        connectionHandler.marker.getCell(me)
      );

      if (state != null) {
        connectionHandler.marker.currentColor =
          connectionHandler.marker.validColor;
        connectionHandler.marker.markedState = state;
        connectionHandler.marker.mark();

        connectionHandler.first = new Point(me.getGraphX(), me.getGraphY());
        connectionHandler.edgeState = connectionHandler.createEdgeState(me);
        connectionHandler.previous = state;
        connectionHandler.fireEvent(
          new EventObject(InternalEvent.START, 'state', connectionHandler.previous)
        );
      }
    }
  }

  /*****************************************************************************
   * Group: Graph events
   *****************************************************************************/

  /**
   * Adds a listener to the graph event dispatch loop. The listener
   * must implement the mouseDown, mouseMove and mouseUp methods
   * as shown in the {@link InternalMouseEvent} class.
   *
   * @param listener Listener to be added to the graph event listeners.
   */
  // addMouseListener(listener: { [key: string]: (sender: mxEventSource, me: mxMouseEvent) => void }): void;
  addMouseListener(listener: any): void {
    if (this.mouseListeners == null) {
      this.mouseListeners = [];
    }
    this.mouseListeners.push(listener);
  }

  /**
   * Removes the specified graph listener.
   *
   * @param listener Listener to be removed from the graph event listeners.
   */
  // removeMouseListener(listener: { [key: string]: (sender: mxEventSource, me: mxMouseEvent) => void }): void;
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
   * Sets the graphX and graphY properties if the given {@link InternalMouseEvent} if
   * required and returned the event.
   *
   * @param me {@link mxMouseEvent} to be updated.
   * @param evtName Name of the mouse event.
   */
  // updateMouseEvent(me: mxMouseEvent, evtName: string): mxMouseEvent;
  updateMouseEvent(me: InternalMouseEvent, evtName: string) {
    if (me.graphX == null || me.graphY == null) {
      const pt = convertPoint(this.container, me.getX(), me.getY());

      me.graphX = pt.x - this.panDx;
      me.graphY = pt.y - this.panDy;

      // Searches for rectangles using method if native hit detection is disabled on shape
      if (
        me.getCell() == null &&
        this.isMouseDown &&
        evtName === InternalEvent.MOUSE_MOVE
      ) {
        me.state = this.graph.view.getState(
          this.getCellAt(pt.x, pt.y, null, true, true, (state: CellState) => {
            return (
              state.shape == null ||
              state.shape.paintBackground !== this.paintBackground ||
              getValue(state.style, 'pointerEvents', '1') == '1' ||
              (state.shape.fill != null && state.shape.fill !== NONE)
            );
          })
        );
      }
    }

    return me;
  }

  /**
   * Returns the state for the given touch event.
   */
  // getStateForTouchEvent(evt: MouseEvent | TouchEvent): mxCellState;
  getStateForTouchEvent(evt: InternalMouseEvent) {
    const x = getClientX(evt);
    const y = getClientY(evt);

    // Dispatches the drop event to the graph which
    // consumes and executes the source function
    const pt = convertPoint(this.container, x, y);

    return this.graph.view.getState(this.getCellAt(pt.x, pt.y));
  }

  /**
   * Returns true if the event should be ignored in {@link fireMouseEvent}.
   */
  // isEventIgnored(evtName: string, me: mxMouseEvent, sender: mxEventSource): boolean;
  isEventIgnored(evtName: string, me: InternalMouseEvent, sender: any): boolean {
    const mouseEvent = isMouseEvent(me.getEvent());
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
    if (this.eventSource != null && evtName !== InternalEvent.MOUSE_MOVE) {
      InternalEvent.removeGestureListeners(
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
      evtName === InternalEvent.MOUSE_DOWN &&
      !mouseEvent &&
      !isPenEvent(me.getEvent())
    ) {
      this.eventSource = me.getSource();

      this.mouseMoveRedirect = (evt: InternalMouseEvent) => {
        this.fireMouseEvent(
          InternalEvent.MOUSE_MOVE,
          new InternalMouseEvent(evt, this.getStateForTouchEvent(evt))
        );
      };
      this.mouseUpRedirect = (evt: InternalMouseEvent) => {
        this.fireMouseEvent(
          InternalEvent.MOUSE_UP,
          new InternalMouseEvent(evt, this.getStateForTouchEvent(evt))
        );
      };

      InternalEvent.addGestureListeners(
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
      !isPopupTrigger(this.lastEvent) &&
      evtName !== InternalEvent.MOUSE_MOVE &&
      this.lastEvent.detail === 2
    ) {
      return true;
    }

    // Filters out of sequence events or mixed event types during a gesture
    if (evtName === InternalEvent.MOUSE_UP && this.isMouseDown) {
      this.isMouseDown = false;
    } else if (evtName === InternalEvent.MOUSE_DOWN && !this.isMouseDown) {
      this.isMouseDown = true;
      this.isMouseTrigger = mouseEvent;
    }
      // Drops mouse events that are fired during touch gestures as a workaround for Webkit
    // and mouse events that are not in sync with the current internal button state
    else if (
      !result &&
      (((!mxClient.IS_FF || evtName !== InternalEvent.MOUSE_MOVE) &&
        this.isMouseDown &&
        this.isMouseTrigger !== mouseEvent) ||
        (evtName === InternalEvent.MOUSE_DOWN && this.isMouseDown) ||
        (evtName === InternalEvent.MOUSE_UP && !this.isMouseDown))
    ) {
      result = true;
    }

    if (!result && evtName === InternalEvent.MOUSE_DOWN) {
      this.lastMouseX = me.getX();
      this.lastMouseY = me.getY();
    }

    return result;
  }

  /**
   * Hook for ignoring synthetic mouse events after touchend in Firefox.
   */
  // isSyntheticEventIgnored(evtName: string, me: mxMouseEvent, sender: mxEventSource): boolean;
  isSyntheticEventIgnored(
    evtName: string,
    me: InternalMouseEvent,
    sender: any
  ): boolean {
    let result = false;
    const mouseEvent = isMouseEvent(me.getEvent());

    // LATER: This does not cover all possible cases that can go wrong in FF
    if (
      this.ignoreMouseEvents &&
      mouseEvent &&
      evtName !== InternalEvent.MOUSE_MOVE
    ) {
      this.ignoreMouseEvents = evtName !== InternalEvent.MOUSE_UP;
      result = true;
    } else if (mxClient.IS_FF && !mouseEvent && evtName === InternalEvent.MOUSE_UP) {
      this.ignoreMouseEvents = true;
    }
    return result;
  }

  /**
   * Returns true if the event should be ignored in {@link fireMouseEvent}. This
   * implementation returns true for select, option and input (if not of type
   * checkbox, radio, button, submit or file) event sources if the event is not
   * a mouse event or a left mouse button press event.
   *
   * @param evtName The name of the event.
   * @param me {@link mxMouseEvent} that should be ignored.
   */
  isEventSourceIgnored(evtName: string, me: InternalMouseEvent): boolean {
    const source = me.getSource();
    const name = source.nodeName != null ? source.nodeName.toLowerCase() : '';
    const candidate =
      !isMouseEvent(me.getEvent()) || isLeftMouseButton(me.getEvent());

    return (
      evtName === InternalEvent.MOUSE_DOWN &&
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
   * Returns the {@link CellState} to be used when firing the mouse event for the
   * given state. This implementation returns the given state.
   *
   * {@link CellState} - State whose event source should be returned.
   */
  getEventState(state: CellState): CellState {
    return state;
  }

  /**
   * Dispatches the given event in the graph event dispatch loop. Possible
   * event names are {@link InternalEvent.MOUSE_DOWN}, {@link InternalEvent.MOUSE_MOVE} and
   * {@link InternalEvent.MOUSE_UP}. All listeners are invoked for all events regardless
   * of the consumed state of the event.
   *
   * @param evtName String that specifies the type of event to be dispatched.
   * @param me {@link mxMouseEvent} to be fired.
   * @param sender Optional sender argument. Default is `this`.
   */
  fireMouseEvent(evtName: string,
                 me: InternalMouseEvent,
                 sender: EventSource = this): void {

    if (this.isEventSourceIgnored(evtName, me)) {
      if (this.graph.tooltipHandler != null) {
        this.graph.tooltipHandler.hide();
      }
      return;
    }

    if (sender == null) {
      sender = this.graph;
    }

    // Updates the graph coordinates in the event
    me = this.updateMouseEvent(me, evtName);

    // Detects and processes double taps for touch-based devices which do not have native double click events
    // or where detection of double click is not always possible (quirks, IE10+). Note that this can only handle
    // double clicks on cells because the sequence of events in IE prevents detection on the background, it fires
    // two mouse ups, one of which without a cell but no mousedown for the second click which means we cannot
    // detect which mouseup(s) are part of the first click, ie we do not know when the first click ends.
    if (
      (!this.nativeDblClickEnabled && !isPopupTrigger(me.getEvent())) ||
      (this.doubleTapEnabled &&
        mxClient.IS_TOUCH &&
        (isTouchEvent(me.getEvent()) || isPenEvent(me.getEvent())))
    ) {
      const currentTime = new Date().getTime();

      if (evtName === InternalEvent.MOUSE_DOWN) {
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

          if (evtName === InternalEvent.MOUSE_UP) {
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
            InternalEvent.consume(me.getEvent());
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
        (this.isMouseDown || evtName === InternalEvent.MOUSE_UP) &&
        this.fireDoubleClick
      ) {
        this.fireDoubleClick = false;
        const cell = this.lastTouchCell;
        this.lastTouchCell = null;
        this.isMouseDown = false;

        // Workaround for Chrome/Safari not firing native double click events for double touch on background
        const valid =
          cell != null ||
          ((isTouchEvent(me.getEvent()) || isPenEvent(me.getEvent())) &&
            (mxClient.IS_GC || mxClient.IS_SF));

        if (
          valid &&
          Math.abs(this.lastTouchX - me.getX()) < this.doubleTapTolerance &&
          Math.abs(this.lastTouchY - me.getY()) < this.doubleTapTolerance
        ) {
          this.dblClick(me.getEvent(), cell);
        } else {
          InternalEvent.consume(me.getEvent());
        }

        return;
      }
    }

    if (!this.isEventIgnored(evtName, me, sender)) {
      // Updates the event state via getEventState
      me.state = this.getEventState(me.getState());
      this.graph.fireEvent(
        new EventObject(
          InternalEvent.FIRE_MOUSE_EVENT,
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
          evtName === InternalEvent.MOUSE_MOVE &&
          this.isMouseDown &&
          this.autoScroll &&
          !isMultiTouchEvent(me.getEvent)
        ) {
          this.scrollPointToVisible(
            me.getGraphX(),
            me.getGraphY(),
            this.autoExtend
          );
        } else if (
          evtName === InternalEvent.MOUSE_UP &&
          this.ignoreScrollbars &&
          this.translateToScrollPosition &&
          (container.scrollLeft !== 0 || container.scrollTop !== 0)
        ) {
          const s = this.graph.view.scale;
          const tr = this.graph.view.translate;
          this.graph.view.setTranslate(
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
            if (evtName === InternalEvent.MOUSE_DOWN) {
              l.mouseDown.apply(l, args);
            } else if (evtName === InternalEvent.MOUSE_MOVE) {
              l.mouseMove.apply(l, args);
            } else if (evtName === InternalEvent.MOUSE_UP) {
              l.mouseUp.apply(l, args);
            }
          }
        }

        // Invokes the click handler
        if (evtName === InternalEvent.MOUSE_UP) {
          this.click(me);
        }
      }

      // Detects tapAndHold events using a timer
      if (
        (isTouchEvent(me.getEvent()) || isPenEvent(me.getEvent())) &&
        evtName === InternalEvent.MOUSE_DOWN &&
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
          handler,
          this.tapAndHoldDelay
        );
        this.tapAndHoldValid = true;
      } else if (evtName === InternalEvent.MOUSE_UP) {
        this.tapAndHoldInProgress = false;
        this.tapAndHoldValid = false;
      } else if (this.tapAndHoldValid) {
        this.tapAndHoldValid =
          Math.abs(this.initialTouchX - me.getGraphX()) < this.tolerance &&
          Math.abs(this.initialTouchY - me.getGraphY()) < this.tolerance;
      }

      // Stops editing for all events other than from cellEditor
      if (
        evtName === InternalEvent.MOUSE_DOWN &&
        this.isEditing() &&
        !(<CellEditor>this.cellEditor).isEventSource(me.getEvent())
      ) {
        this.stopEditing(!this.isInvokesStopCellEditing());
      }

      this.consumeMouseEvent(evtName, me, sender);
    }
  }

  /**
   * Consumes the given {@link InternalMouseEvent} if it's a touchStart event.
   */
  // consumeMouseEvent(evtName: string, me: mxMouseEvent, sender: mxEventSource): void;
  consumeMouseEvent(evtName: string, me: InternalMouseEvent, sender: any = this) {
    // Workaround for duplicate click in Windows 8 with Chrome/FF/Opera with touch
    if (evtName === InternalEvent.MOUSE_DOWN && isTouchEvent(me.getEvent())) {
      me.consume(false);
    }
  }

  /**
   * Dispatches a {@link InternalEvent.GESTURE} event. The following example will resize the
   * cell under the mouse based on the scale property of the native touch event.
   *
   * ```javascript
   * graph.addListener(mxEvent.GESTURE, function(sender, eo)
   * {
   *   var evt = eo.getProperty('event');
   *   var state = graph.view.getState(eo.getProperty('cell'));
   *
   *   if (graph.isEnabled() && graph.isCellResizable(state.cell) && Math.abs(1 - evt.scale) > 0.2)
   *   {
   *     var scale = graph.view.scale;
   *     var tr = graph.view.translate;
   *
   *     var w = state.width * evt.scale;
   *     var h = state.height * evt.scale;
   *     var x = state.x - (w - state.width) / 2;
   *     var y = state.y - (h - state.height) / 2;
   *
   *     var bounds = new mxRectangle(graph.snap(x / scale) - tr.x,
   *     		graph.snap(y / scale) - tr.y, graph.snap(w / scale), graph.snap(h / scale));
   *     graph.resizeCell(state.cell, bounds);
   *     eo.consume();
   *   }
   * });
   * ```
   *
   * @param evt Gestureend event that represents the gesture.
   * @param cell Optional {@link Cell} associated with the gesture.
   */
  // fireGestureEvent(evt: any, cell?: mxCell): void;
  fireGestureEvent(evt: MouseEvent, cell: Cell | null = null): void {
    // Resets double tap event handling when gestures take place
    this.lastTouchTime = 0;
    this.graph.fireEvent(
      new EventObject(InternalEvent.GESTURE, 'event', evt, 'cell', cell)
    );
  }

  /**
   * Called when the size of the graph has changed. This implementation fires
   * a {@link size} event after updating the clipping region of the SVG element in
   * SVG-bases browsers.
   */
  sizeDidChange(): void {
    const bounds = this.getGraphBounds();

    if (this.graph.container != null) {
      const border = this.graph.getBorder();

      let width = Math.max(0, bounds.x) + bounds.width + 2 * border;
      let height = Math.max(0, bounds.y) + bounds.height + 2 * border;

      if (this.graph.minimumContainerSize != null) {
        width = Math.max(width, this.graph.minimumContainerSize.width);
        height = Math.max(height, this.graph.minimumContainerSize.height);
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
          width = size.width * this.graph.view.scale;
          height = size.height * this.graph.view.scale;
        }
      }

      if (this.graph.minimumGraphSize != null) {
        width = Math.max(
          width,
          this.graph.minimumGraphSize.width * this.graph.view.scale
        );
        height = Math.max(
          height,
          this.graph.minimumGraphSize.height * this.graph.view.scale
        );
      }

      width = Math.ceil(width);
      height = Math.ceil(height);

      // @ts-ignore
      const root = this.graph.view.getDrawPane().ownerSVGElement;

      if (root != null) {
        root.style.minWidth = `${Math.max(1, width)}px`;
        root.style.minHeight = `${Math.max(1, height)}px`;
        root.style.width = '100%';
        root.style.height = '100%';
      }

      this.graph.updatePageBreaks(this.graph.pageBreaksVisible, width, height);
    }
    this.graph.fireEvent(new EventObject(InternalEvent.SIZE, 'bounds', bounds));
  }

  /*****************************************************************************
   * Group: Graph display
   *****************************************************************************/

  /**
   * Returns true if the given event is a clone event. This implementation
   * returns true if control is pressed.
   */
  // isCloneEvent(evt: MouseEvent): boolean;
  isCloneEvent(evt: EventObject | InternalMouseEvent): boolean {
    return isControlDown(evt);
  }

  /**
   * Hook for implementing click-through behaviour on selected cells. If this
   * returns true the cell behind the selected cell will be selected. This
   * implementation returns false;
   */
  // isTransparentClickEvent(evt: MouseEvent): boolean;
  isTransparentClickEvent(evt: EventObject | InternalMouseEvent): boolean {
    return false;
  }

  /**
   * Returns true if the given event is a toggle event. This implementation
   * returns true if the meta key (Cmd) is pressed on Macs or if control is
   * pressed on any other platform.
   */
  // isToggleEvent(evt: MouseEvent): boolean;
  isToggleEvent(evt: EventObject | InternalMouseEvent): boolean {
    return mxClient.IS_MAC ? isMetaDown(evt) : isControlDown(evt);
  }

  /**
   * Returns true if the given mouse event should be aligned to the grid.
   */
  // isGridEnabledEvent(evt: MouseEvent): boolean;
  isGridEnabledEvent(evt: EventObject | InternalMouseEvent): boolean {
    return evt != null && !isAltDown(evt);
  }

  /**
   * Returns true if the given mouse event should be aligned to the grid.
   */
  // isConstrainedEvent(evt: MouseEvent): boolean;
  isConstrainedEvent(evt: EventObject | InternalMouseEvent): boolean {
    return isShiftDown(evt);
  }

  /**
   * Returns true if the given mouse event should not allow any connections to be
   * made. This implementation returns false.
   */
  // isIgnoreTerminalEvent(evt: MouseEvent): boolean;
  isIgnoreTerminalEvent(evt: EventObject | InternalMouseEvent): boolean {
    return false;
  }






  /**
   * Returns an {@link Point} representing the given event in the unscaled,
   * non-translated coordinate space of {@link container} and applies the grid.
   *
   * @param evt Mousevent that contains the mouse pointer location.
   * @param addOffset Optional boolean that specifies if the position should be
   * offset by half of the {@link gridSize}. Default is `true`.
   */
  getPointForEvent(evt: InternalMouseEvent, addOffset: boolean = true): Point {
    const p = convertPoint(this.container, getClientX(evt), getClientY(evt));
    const s = this.graph.view.scale;
    const tr = this.graph.view.translate;
    const off = addOffset ? this.gridSize / 2 : 0;

    p.x = this.snap(p.x / s - tr.x - off);
    p.y = this.snap(p.y / s - tr.y - off);
    return p;
  }

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

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

  /*****************************************************************************
   * Group: Graph appearance
   *****************************************************************************/

  /**
   * Returns the cursor value to be used for the CSS of the shape for the
   * given event. This implementation calls {@link getCursorForCell}.
   *
   * @param me {@link mxMouseEvent} whose cursor should be returned.
   */
  getCursorForMouseEvent(me: InternalMouseEvent): string | null {
    return this.getCursorForCell(me.getCell());
  }
}

export default GraphEvents;
