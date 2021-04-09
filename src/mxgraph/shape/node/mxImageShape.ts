/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxUtils from '../../util/mxUtils';
import mxConstants from '../../util/mxConstants';
import mxRectangleShape from './mxRectangleShape';
import mxRectangle from '../../util/datatypes/mxRectangle';
import mxCellState from '../../util/datatypes/mxCellState';
import mxSvgCanvas2D from '../../util/canvas/mxSvgCanvas2D';
import mxCellOverlay from '../../view/cell/mxCellOverlay';

/**
 * Class: mxImageShape
 *
 * Extends <mxShape> to implement an image shape. This shape is registered
 * under <mxConstants.SHAPE_IMAGE> in <mxCellRenderer>.
 *
 * Constructor: mxImageShape
 *
 * Constructs a new image shape.
 *
 * Parameters:
 *
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * image - String that specifies the URL of the image. This is stored in
 * <image>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
class mxImageShape extends mxRectangleShape {
  constructor(
    bounds: mxRectangle,
    image: string,
    fill: string = '#FFFFFF',
    stroke: string = '#000000',
    strokewidth: number = 1
  ) {
    super();
    this.bounds = bounds;
    this.image = image;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth;
    this.shadow = false;
  }

  // TODO: Document me!!
  shadow: boolean;

  image: string;

  // Used in mxCellRenderer
  overlay: mxCellOverlay | null = null;

  /**
   * Variable: preserveImageAspect
   *
   * Switch to preserve image aspect. Default is true.
   */
  preserveImageAspect = true;

  /**
   * Function: getSvgScreenOffset
   */
  getSvgScreenOffset(): number {
    return 0;
  }

  /**
   * Function: apply
   *
   * Overrides <mxShape.apply> to replace the fill and stroke colors with the
   * respective values from <mxConstants.STYLE_IMAGE_BACKGROUND> and
   * <mxConstants.STYLE_IMAGE_BORDER>.
   *
   * Applies the style of the given <mxCellState> to the shape. This
   * implementation assigns the following styles to local fields:
   *
   * - <mxConstants.STYLE_IMAGE_BACKGROUND> => fill
   * - <mxConstants.STYLE_IMAGE_BORDER> => stroke
   *
   * Parameters:
   *
   * state - <mxCellState> of the corresponding cell.
   */
  apply(state: mxCellState) {
    super.apply(state);

    this.fill = null;
    this.stroke = null;
    this.gradient = null;

    if (this.style != null) {
      this.preserveImageAspect =
        mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_ASPECT, 1) == 1;

      // Legacy support for imageFlipH/V
      this.flipH =
        this.flipH || mxUtils.getValue(this.style, 'imageFlipH', 0) == 1;
      this.flipV =
        this.flipV || mxUtils.getValue(this.style, 'imageFlipV', 0) == 1;
    }
  }

  /**
   * Function: isHtmlAllowed
   *
   * Returns true if HTML is allowed for this shape. This implementation always
   * returns false.
   */
  isHtmlAllowed(): boolean {
    return !this.preserveImageAspect;
  }

  /**
   * Function: createHtml
   *
   * Creates and returns the HTML DOM node(s) to represent
   * this shape. This implementation falls back to <createVml>
   * so that the HTML creation is optional.
   */
  createHtml(): HTMLElement {
    const node = document.createElement('div');
    node.style.position = 'absolute';
    return node;
  }

  /**
   * Function: isRoundable
   *
   * Disables inherited roundable support.
   */
  isRoundable(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): boolean {
    return false;
  }

  /**
   * Function: paintVertexShape
   *
   * Generic background painting implementation.
   */
  paintVertexShape(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (this.image != null) {
      const fill = mxUtils.getValue(
        this.style,
        mxConstants.STYLE_IMAGE_BACKGROUND,
        null
      );
      let stroke = mxUtils.getValue(
        this.style,
        mxConstants.STYLE_IMAGE_BORDER,
        null
      );

      if (fill != null) {
        // Stroke rendering required for shadow
        c.setFillColor(fill);
        c.setStrokeColor(stroke);
        c.rect(x, y, w, h);
        c.fillAndStroke();
      }

      // FlipH/V are implicit via mxShape.updateTransform
      c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);

      stroke = mxUtils.getValue(
        this.style,
        mxConstants.STYLE_IMAGE_BORDER,
        null
      );

      if (stroke != null) {
        c.setShadow(false);
        c.setStrokeColor(stroke);
        c.rect(x, y, w, h);
        c.stroke();
      }
    } else {
      this.paintBackground(c, x, y, w, h);
    }
  }
}

export default mxImageShape;
