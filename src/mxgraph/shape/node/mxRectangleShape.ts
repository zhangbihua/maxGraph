/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxConstants from '../../util/mxConstants';
import mxUtils from '../../util/mxUtils';
import mxShape from '../mxShape';
import mxAbstractCanvas2D from "../../util/canvas/mxAbstractCanvas2D";
import mxRectangle from '../../util/datatypes/mxRectangle';

class mxRectangleShape extends mxShape {
  /**
   * Class: mxRectangleShape
   *
   * Extends <mxShape> to implement a rectangle shape.
   * This shape is registered under <mxConstants.SHAPE_RECTANGLE>
   * in <mxCellRenderer>.
   *
   * Constructor: mxRectangleShape
   *
   * Constructs a new rectangle shape.
   *
   * Parameters:
   *
   * bounds - <mxRectangle> that defines the bounds. This is stored in
   * <mxShape.bounds>.
   * fill - String that defines the fill color. This is stored in <fill>.
   * stroke - String that defines the stroke color. This is stored in <stroke>.
   * strokewidth - Optional integer that defines the stroke width. Default is
   * 1. This is stored in <strokewidth>.
   */
  constructor(bounds: mxRectangle,
              fill: string='#FFFFFF',
              stroke: string='#000000',
              strokewidth: number=1) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth;
  }

  /**
   * Function: isHtmlAllowed
   *
   * Returns true for non-rounded, non-rotated shapes with no glass gradient.
   */
  isHtmlAllowed(): boolean {
    let events = true;

    if (this.style != null) {
      events =
        mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') ==
        '1';
    }

    return (
      !this.isRounded &&
      !this.glass &&
      this.rotation === 0 &&
      (events || (this.fill != null && this.fill !== mxConstants.NONE))
    );
  }

  /**
   * Function: paintBackground
   *
   * Generic background painting implementation.
   */
  paintBackground(c: mxAbstractCanvas2D,
                  x: number,
                  y: number,
                  w: number,
                  h: number): void {
    let events = true;

    if (this.style != null) {
      events =
        mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') ==
        '1';
    }

    if (
      events ||
      (this.fill != null && this.fill !== mxConstants.NONE) ||
      (this.stroke != null && this.stroke !== mxConstants.NONE)
    ) {
      if (!events && (this.fill == null || this.fill === mxConstants.NONE)) {
        c.pointerEvents = false;
      }

      if (this.isRounded) {
        let r = 0;

        if (
          mxUtils.getValue(this.style, mxConstants.STYLE_ABSOLUTE_ARCSIZE, 0) ==
          '1'
        ) {
          r = Math.min(
            w / 2,
            Math.min(
              h / 2,
              mxUtils.getValue(
                this.style,
                mxConstants.STYLE_ARCSIZE,
                mxConstants.LINE_ARCSIZE
              ) / 2
            )
          );
        } else {
          const f =
            mxUtils.getValue(
              this.style,
              mxConstants.STYLE_ARCSIZE,
              mxConstants.RECTANGLE_ROUNDING_FACTOR * 100
            ) / 100;
          r = Math.min(w * f, h * f);
        }

        c.roundrect(x, y, w, h, r, r);
      } else {
        c.rect(x, y, w, h);
      }

      c.fillAndStroke();
    }
  }

  /**
   * Function: isRoundable
   *
   * Adds roundable support.
   */
  isRoundable(c: mxAbstractCanvas2D,
              x: number,
              y: number,
              w: number,
              h: number): boolean {
    return true;
  }

  /**
   * Function: paintForeground
   *
   * Generic background painting implementation.
   */
  paintForeground(c: mxAbstractCanvas2D,
                  x: number,
                  y: number,
                  w: number,
                  h: number): void {
    if (
      this.glass &&
      !this.outline &&
      this.fill != null &&
      this.fill !== mxConstants.NONE
    ) {
      this.paintGlassEffect(
        c,
        x,
        y,
        w,
        h,
        this.getArcSize(w + this.strokewidth, h + this.strokewidth)
      );
    }
  }
}

export default mxRectangleShape;
