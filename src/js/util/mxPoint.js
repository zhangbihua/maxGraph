/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */

import mxUtils from "../util/mxUtils";

class mxPoint {
  /**
   * Variable: x
   *
   * Holds the x-coordinate of the point. Default is 0.
   */
  x = null;
  /**
   * Variable: y
   *
   * Holds the y-coordinate of the point. Default is 0.
   */
  y = null;

  /**
   * Class: mxPoint
   *
   * Implements a 2-dimensional vector with double precision coordinates.
   *
   * Constructor: mxPoint
   *
   * Constructs a new point for the optional x and y coordinates. If no
   * coordinates are given, then the default values for <x> and <y> are used.
   */
  constructor(...args) {
    // forward to this._constructor to allow not calling
    // the constructor from mxRectangle/mxCellState
    this._constructor(...args);
  };

  _constructor(x, y) {
    this.x = (x != null) ? x : 0;
    this.y = (y != null) ? y : 0;
  }

  /**
   * Function: equals
   *
   * Returns true if the given object equals this point.
   */
  equals = (obj) => {
    return obj != null && obj.x == this.x && obj.y == this.y;
  };

  /**
   * Function: clone
   *
   * Returns a clone of this <mxPoint>.
   */
  clone = () => {
    // Handles subclasses as well
    return mxUtils.clone(this);
  };
}

export default mxPoint;
