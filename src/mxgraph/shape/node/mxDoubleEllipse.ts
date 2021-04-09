/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxRectangle from '../../util/datatypes/mxRectangle';
import mxShape from '../mxShape';
import mxConstants from '../../util/mxConstants';
import mxUtils from '../../util/mxUtils';
import mxAbstractCanvas2D from '../../util/canvas/mxAbstractCanvas2D';
import mxSvgCanvas2D from '../../util/canvas/mxSvgCanvas2D';

/**
 * Class: mxDoubleEllipse
 *
 * Extends <mxShape> to implement a double ellipse shape. This shape is
 * registered under <mxConstants.SHAPE_DOUBLE_ELLIPSE> in <mxCellRenderer>.
 * Use the following override to only fill the inner ellipse in this shape:
 *
 * (code)
 * paintVertexShape = (c, x, y, w, h)=>
 * {
 *   c.ellipse(x, y, w, h);
 *   c.stroke();
 *
 *   let inset = mxUtils.getValue(this.style, mxConstants.STYLE_MARGIN, Math.min(3 + this.strokewidth, Math.min(w / 5, h / 5)));
 *   x += inset;
 *   y += inset;
 *   w -= 2 * inset;
 *   h -= 2 * inset;
 *
 *   if (w > 0 && h > 0)
 *   {
 *     c.ellipse(x, y, w, h);
 *   }
 *
 *   c.fillAndStroke();
 * };
 * (end)
 *
 * Constructor: mxDoubleEllipse
 *
 * Constructs a new ellipse shape.
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
class mxDoubleEllipse extends mxShape {
  strokewidth: number;

  constructor(
    bounds: mxRectangle,
    fill: string,
    stroke: string,
    strokewidth: number = 1
  ) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth;
  }

  /**
   * Function: paintBackground
   *
   * Paints the background.
   */
  paintBackground(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    c.ellipse(x, y, w, h);
    c.fillAndStroke();
  }

  /**
   * Function: paintForeground
   *
   * Paints the foreground.
   */
  paintForeground(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (!this.outline) {
      const margin = mxUtils.getValue(
        this.style,
        mxConstants.STYLE_MARGIN,
        Math.min(3 + this.strokewidth, Math.min(w / 5, h / 5))
      );
      x += margin;
      y += margin;
      w -= 2 * margin;
      h -= 2 * margin;

      // FIXME: Rounding issues in IE8 standards mode (not in 1.x)
      if (w > 0 && h > 0) {
        c.ellipse(x, y, w, h);
      }

      c.stroke();
    }
  }

  /**
   * Function: getLabelBounds
   *
   * Returns the bounds for the label.
   */
  getLabelBounds(rect: mxRectangle) {
    const margin =
      mxUtils.getValue(
        this.style,
        mxConstants.STYLE_MARGIN,
        Math.min(
          3 + this.strokewidth,
          Math.min(rect.width / 5 / this.scale, rect.height / 5 / this.scale)
        )
      ) * this.scale;

    return new mxRectangle(
      rect.x + margin,
      rect.y + margin,
      rect.width - 2 * margin,
      rect.height - 2 * margin
    );
  }
}

export default mxDoubleEllipse;
