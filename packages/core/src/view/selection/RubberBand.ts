/**
 * Copyright (c) 2006-2016, JGraph Ltd
 * Copyright (c) 2006-2016, Gaudenz Alder
 */

import {
  convertPoint,
  getOffset,
  getScrollOrigin,
  setOpacity,
  setPrefixedStyle,
} from '../../util/Utils';
import InternalEvent from '../event/InternalEvent';
import Point from '../geometry/Point';
import InternalMouseEvent from '../event/InternalMouseEvent';
import mxClient from '../../mxClient';
import Rectangle from '../geometry/Rectangle';
import { isAltDown, isMultiTouchEvent } from '../../util/EventUtils';
import { clearSelection } from '../../util/DomUtils';
import Graph from '../Graph';
import { GraphPlugin } from '../../types';
import EventObject from '../event/EventObject';

/**
 * Event handler that selects rectangular regions.
 * This is not built-into [mxGraph].
 * To enable rubberband selection in a graph, use the following code.
 */
class RubberBand implements GraphPlugin {
  forceRubberbandHandler?: Function;
  panHandler?: Function;
  gestureHandler?: Function;
  graph?: Graph;
  first: Point | null = null;
  destroyed: boolean = false;
  dragHandler?: Function;
  dropHandler?: Function;

  constructor() {}

  onInit(graph: Graph) {
    this.graph = graph;
    this.graph.addMouseListener(this);

    // Handles force rubberband event
    this.forceRubberbandHandler = (sender: any, evt: EventObject) => {
      const evtName = evt.getProperty('eventName');
      const me = evt.getProperty('event');

      if (evtName === InternalEvent.MOUSE_DOWN && this.isForceRubberbandEvent(me)) {
        const offset = getOffset(this.graph.container);
        const origin = getScrollOrigin(this.graph.container);
        origin.x -= offset.x;
        origin.y -= offset.y;
        this.start(me.getX() + origin.x, me.getY() + origin.y);
        me.consume(false);
      }
    };

    this.graph.addListener(InternalEvent.FIRE_MOUSE_EVENT, this.forceRubberbandHandler);

    // Repaints the marquee after autoscroll
    this.panHandler = () => {
      this.repaint();
    };

    this.graph.addListener(InternalEvent.PAN, this.panHandler);

    // Does not show menu if any touch gestures take place after the trigger
    this.gestureHandler = (sender, eo) => {
      if (this.first != null) {
        this.reset();
      }
    };

    this.graph.addListener(InternalEvent.GESTURE, this.gestureHandler);
  }

  /**
   * Specifies the default opacity to be used for the rubberband div.  Default is 20.
   */
  defaultOpacity: number = 20;

  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   */
  enabled = true;

  /**
   * Variable: div
   *
   * Holds the DIV element which is currently visible.
   */
  div = null;

  /**
   * Variable: sharedDiv
   *
   * Holds the DIV element which is used to display the rubberband.
   */
  sharedDiv = null;

  /**
   * Variable: currentX
   *
   * Holds the value of the x argument in the last call to <update>.
   */
  currentX = 0;

  /**
   * Variable: currentY
   *
   * Holds the value of the y argument in the last call to <update>.
   */
  currentY = 0;

  /**
   * Optional fade out effect.  Default is false.
   */
  fadeOut: boolean = false;

  /**
   * Creates the rubberband selection shape.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Enables or disables event handling. This implementation updates
   * <enabled>.
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Function: isForceRubberbandEvent
   *
   * Returns true if the given <mxMouseEvent> should start rubberband selection.
   * This implementation returns true if the alt key is pressed.
   */
  isForceRubberbandEvent(me: InternalMouseEvent) {
    return isAltDown(me.getEvent());
  }

  /**
   * Function: mouseDown
   *
   * Handles the event by initiating a rubberband selection. By consuming the
   * event all subsequent events of the gesture are redirected to this
   * handler.
   */
  mouseDown(sender: any, me: InternalMouseEvent): void {
    if (
      !me.isConsumed() &&
      this.isEnabled() &&
      this.graph.isEnabled() &&
      me.getState() == null &&
      !isMultiTouchEvent(me.getEvent())
    ) {
      const offset = getOffset(this.graph.container);
      const origin = getScrollOrigin(this.graph.container);
      origin.x -= offset.x;
      origin.y -= offset.y;
      this.start(me.getX() + origin.x, me.getY() + origin.y);

      // Does not prevent the default for this event so that the
      // event processing chain is still executed even if we start
      // rubberbanding. This is required eg. in ExtJs to hide the
      // current context menu. In mouseMove we'll make sure we're
      // not selecting anything while we're rubberbanding.
      me.consume(false);
    }
  }

  /**
   * Creates the rubberband selection shape.
   */
  start(x: number, y: number): void {
    this.first = new Point(x, y);

    const { container } = this.graph;

    function createMouseEvent(evt) {
      const me = new InternalMouseEvent(evt);
      const pt = convertPoint(container, me.getX(), me.getY());

      me.graphX = pt.x;
      me.graphY = pt.y;

      return me;
    }

    this.dragHandler = (evt) => {
      this.mouseMove(this.graph, createMouseEvent(evt));
    };

    this.dropHandler = (evt) => {
      this.mouseUp(this.graph, createMouseEvent(evt));
    };

    // Workaround for rubberband stopping if the mouse leaves the container in Firefox
    if (mxClient.IS_FF) {
      InternalEvent.addGestureListeners(
        document,
        null,
        this.dragHandler,
        this.dropHandler
      );
    }
  }

  /**
   * Function: mouseMove
   *
   * Handles the event by updating therubberband selection.
   */
  mouseMove(sender: any, me: InternalMouseEvent): void {
    if (!me.isConsumed() && this.first != null) {
      const origin = getScrollOrigin(this.graph.container);
      const offset = getOffset(this.graph.container);
      origin.x -= offset.x;
      origin.y -= offset.y;
      const x = me.getX() + origin.x;
      const y = me.getY() + origin.y;
      const dx = this.first.x - x;
      const dy = this.first.y - y;
      const tol = this.graph.tolerance;

      if (this.div != null || Math.abs(dx) > tol || Math.abs(dy) > tol) {
        if (this.div == null) {
          this.div = this.createShape();
        }

        // Clears selection while rubberbanding. This is required because
        // the event is not consumed in mouseDown.
        clearSelection();

        this.update(x, y);
        me.consume();
      }
    }
  }

  /**
   * Creates the rubberband selection shape.
   */
  createShape(): HTMLElement | null {
    if (this.sharedDiv == null) {
      this.sharedDiv = document.createElement('div');
      this.sharedDiv.className = 'mxRubberband';
      setOpacity(this.sharedDiv, this.defaultOpacity);
    }

    this.graph.container.appendChild(this.sharedDiv);
    const result = this.sharedDiv;

    if (mxClient.IS_SVG && this.fadeOut) {
      this.sharedDiv = null;
    }

    return result;
  }

  /**
   * Function: isActive
   *
   * Returns true if this handler is active.
   */
  isActive(sender: any, me: InternalMouseEvent): boolean {
    return this.div != null && this.div.style.display !== 'none';
  }

  /**
   * Function: mouseUp
   *
   * Handles the event by selecting the region of the rubberband using
   * <mxGraph.selectRegion>.
   */
  mouseUp(sender: any, me: InternalMouseEvent): void {
    const active = this.isActive();
    this.reset();

    if (active) {
      this.execute(me.getEvent());
      me.consume();
    }
  }

  /**
   * Function: execute
   *
   * Resets the state of this handler and selects the current region
   * for the given event.
   */
  execute(evt) {
    const rect = new Rectangle(this.x, this.y, this.width, this.height);
    this.graph.selectRegion(rect, evt);
  }

  /**
   * Function: reset
   *
   * Resets the state of the rubberband selection.
   */
  reset() {
    if (this.div != null) {
      if (mxClient.IS_SVG && this.fadeOut) {
        const temp = this.div;
        setPrefixedStyle(temp.style, 'transition', 'all 0.2s linear');
        temp.style.pointerEvents = 'none';
        temp.style.opacity = 0;

        window.setTimeout(() => {
          temp.parentNode.removeChild(temp);
        }, 200);
      } else {
        this.div.parentNode.removeChild(this.div);
      }
    }

    InternalEvent.removeGestureListeners(
      document,
      null,
      this.dragHandler,
      this.dropHandler
    );
    this.dragHandler = null;
    this.dropHandler = null;

    this.currentX = 0;
    this.currentY = 0;
    this.first = null;
    this.div = null;
  }

  /**
   * Function: update
   *
   * Sets <currentX> and <currentY> and calls <repaint>.
   */
  update(x, y) {
    this.currentX = x;
    this.currentY = y;

    this.repaint();
  }

  /**
   * Function: repaint
   *
   * Computes the bounding box and updates the style of the <div>.
   */
  repaint() {
    if (this.div != null) {
      const x = this.currentX - this.graph.panDx;
      const y = this.currentY - this.graph.panDy;

      this.x = Math.min(this.first.x, x);
      this.y = Math.min(this.first.y, y);
      this.width = Math.max(this.first.x, x) - this.x;
      this.height = Math.max(this.first.y, y) - this.y;

      const dx = 0;
      const dy = 0;

      this.div.style.left = `${this.x + dx}px`;
      this.div.style.top = `${this.y + dy}px`;
      this.div.style.width = `${Math.max(1, this.width)}px`;
      this.div.style.height = `${Math.max(1, this.height)}px`;
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes. This does
   * normally not need to be called, it is called automatically when the
   * window unloads.
   */
  onDestroy() {
    if (!this.destroyed) {
      this.destroyed = true;
      this.graph.removeMouseListener(this);
      this.graph.removeListener(this.forceRubberbandHandler);
      this.graph.removeListener(this.panHandler);
      this.reset();

      if (this.sharedDiv != null) {
        this.sharedDiv = null;
      }
    }
  }
}

export default RubberBand;
