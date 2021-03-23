/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */
import mxActor from './mxActor';
import mxPoint from '../util/mxPoint';
import mxUtils from '../util/mxUtils';
import mxConstants from '../util/mxConstants';

class mxHexagon extends mxActor {
  /**
   * Class: mxHexagon
   *
   * Implementation of the hexagon shape.
   *
   * Constructor: mxHexagon
   *
   * Constructs a new hexagon shape.
   */
  constructor() {
    super();
  }

  /**
   * Function: redrawPath
   *
   * Draws the path for this shape.
   */
  redrawPath(c, x, y, w, h) {
    const arcSize =
      mxUtils.getValue(
        this.style,
        mxConstants.STYLE_ARCSIZE,
        mxConstants.LINE_ARCSIZE
      ) / 2;
    this.addPoints(
      c,
      [
        new mxPoint(0.25 * w, 0),
        new mxPoint(0.75 * w, 0),
        new mxPoint(w, 0.5 * h),
        new mxPoint(0.75 * w, h),
        new mxPoint(0.25 * w, h),
        new mxPoint(0, 0.5 * h),
      ],
      this.isRounded,
      arcSize,
      true
    );
  }
}

export default mxHexagon;
