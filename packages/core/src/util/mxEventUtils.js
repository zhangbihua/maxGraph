/**
 * Returns the touch or mouse event that contains the mouse coordinates.
 */

import mxClient from "../mxClient";

// static getMainEvent(e: MouseEvent): MouseEvent;
export const getMainEvent = (e) => {
  if (
    (e.type == 'touchstart' || e.type == 'touchmove') &&
    e.touches != null &&
    e.touches[0] != null
  ) {
    e = e.touches[0];
  } else if (
    e.type == 'touchend' &&
    e.changedTouches != null &&
    e.changedTouches[0] != null
  ) {
    e = e.changedTouches[0];
  }
  return e;
};

/**
 * Returns true if the meta key is pressed for the given event.
 */
// static getClientX(e: TouchEvent | MouseEvent): number;
export const getClientX = (e) => {
  return getMainEvent(e).clientX;
};

/**
 * Returns true if the meta key is pressed for the given event.
 */
// static getClientY(e: TouchEvent | MouseEvent): number;
export const getClientY = (e) => {
  return getMainEvent(e).clientY;
};

/**
 * Function: getSource
 *
 * Returns the event's target or srcElement depending on the browser.
 */
export const getSource = (evt) => {
  return evt.srcElement != null ? evt.srcElement : evt.target;
};

/**
 * Returns true if the event has been consumed using {@link consume}.
 */
// static isConsumed(evt: mxEventObject | mxMouseEvent | Event): boolean;
export const isConsumed = (evt) => {
  return evt.isConsumed != null && evt.isConsumed;
};

/**
 * Returns true if the event was generated using a touch device (not a pen or mouse).
 */
// static isTouchEvent(evt: Event): boolean;
export const isTouchEvent = (evt) => {
  return evt.pointerType != null
    ? evt.pointerType == 'touch' ||
        evt.pointerType === evt.MSPOINTER_TYPE_TOUCH
    : evt.mozInputSource != null
    ? evt.mozInputSource == 5
    : evt.type.indexOf('touch') == 0;
};

/**
 * Returns true if the event was generated using a pen (not a touch device or mouse).
 */
// static isPenEvent(evt: Event): boolean;
export const isPenEvent = (evt) => {
  return evt.pointerType != null
    ? evt.pointerType == 'pen' || evt.pointerType === evt.MSPOINTER_TYPE_PEN
    : evt.mozInputSource != null
    ? evt.mozInputSource == 2
    : evt.type.indexOf('pen') == 0;
};

/**
 * Returns true if the event was generated using a touch device (not a pen or mouse).
 */
// static isMultiTouchEvent(evt: Event): boolean;
export const isMultiTouchEvent = (evt) => {
  return (
    evt.type != null &&
    evt.type.indexOf('touch') == 0 &&
    evt.touches != null &&
    evt.touches.length > 1
  );
};

/**
 * Returns true if the event was generated using a mouse (not a pen or touch device).
 */
// static isMouseEvent(evt: Event): boolean;
export const isMouseEvent = (evt) => {
  return evt.pointerType != null
    ? evt.pointerType == 'mouse' ||
        evt.pointerType === evt.MSPOINTER_TYPE_MOUSE
    : evt.mozInputSource != null
    ? evt.mozInputSource == 1
    : evt.type.indexOf('mouse') == 0;
};

/**
 * Returns true if the left mouse button is pressed for the given event.
 * To check if a button is pressed during a mouseMove you should use the
 * {@link mxGraph.isMouseDown} property. Note that this returns true in Firefox
 * for control+left-click on the Mac.
 */
// static isLeftMouseButton(evt: MouseEvent): boolean;
export const isLeftMouseButton = (evt) => {
  // Special case for mousemove and mousedown we check the buttons
  // if it exists because which is 0 even if no button is pressed
  if (
    'buttons' in evt &&
    (evt.type == 'mousedown' || evt.type == 'mousemove')
  ) {
    return evt.buttons == 1;
  }
  if ('which' in evt) {
    return evt.which === 1;
  }
  return evt.button === 1;
};

/**
 * Returns true if the middle mouse button is pressed for the given event.
 * To check if a button is pressed during a mouseMove you should use the
 * {@link mxGraph.isMouseDown} property.
 */
// static isMiddleMouseButton(evt: MouseEvent): boolean;
export const isMiddleMouseButton = (evt) => {
  if ('which' in evt) {
    return evt.which === 2;
  }
  return evt.button === 4;
};

/**
 * Returns true if the right mouse button was pressed. Note that this
 * button might not be available on some systems. For handling a popup
 * trigger {@link isPopupTrigger} should be used.
 */
// static isRightMouseButton(evt: MouseEvent): boolean;
export const isRightMouseButton = (evt) => {
  if ('which' in evt) {
    return evt.which === 3;
  }
  return evt.button === 2;
};

/**
 * Returns true if the event is a popup trigger. This implementation
 * returns true if the right button or the left button and control was
 * pressed on a Mac.
 */
// static isPopupTrigger(evt: Event): boolean;
export const isPopupTrigger = (evt) => {
  return (
    isRightMouseButton(evt) ||
    (mxClient.IS_MAC &&
      isControlDown(evt) &&
      !isShiftDown(evt) &&
      !isMetaDown(evt) &&
      !isAltDown(evt))
  );
};

/**
 * Returns true if the shift key is pressed for the given event.
 */
// static isShiftDown(evt: MouseEvent): boolean;
export const isShiftDown = (evt) => {
  return evt != null ? evt.shiftKey : false;
};

/**
 * Returns true if the alt key is pressed for the given event.
 */
// static isAltDown(evt: MouseEvent): boolean;
export const isAltDown = (evt) => {
  return evt != null ? evt.altKey : false;
};

/**
 * Returns true if the control key is pressed for the given event.
 */
// static isControlDown(evt: MouseEvent): boolean;
export const isControlDown = (evt) => {
  return evt != null ? evt.ctrlKey : false;
};

/**
 * Returns true if the meta key is pressed for the given event.
 */
// static isMetaDown(evt: MouseEvent): boolean;
export const isMetaDown = (evt) => {
  return evt != null ? evt.metaKey : false;
};