/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import Shape from './Shape';
import Rectangle from '../Rectangle';
import {
  DEFAULT_STARTSIZE,
  DIRECTION_NORTH,
  DIRECTION_SOUTH,
  DIRECTION_WEST,
  LINE_ARCSIZE,
  NONE,
  RECTANGLE_ROUNDING_FACTOR,
} from '../../../util/Constants';
import utils from '../../../util/Utils';

/**
 * Extends {@link Shape} to implement a swimlane shape.
 * This shape is registered under {@link mxConstants.SHAPE_SWIMLANE} in {@link mxCellRenderer}.
 * Use the {@link mxConstants.STYLE_STYLE_STARTSIZE} to define the size of the title
 * region, `'swimLaneFillColor'` for the content area fill,
 * `'separatorColor'` to draw an additional vertical separator and
 * {@link mxConstants.STYLE_SWIMLANE_LINE} to hide the line between the title region and
 * the content area.
 * The {@link 'horizontal'} affects the orientation of this shape,
 * not only its label.
 *
 * @class Swimlane
 * @extends {Shape}
 */
class Swimlane extends Shape {
  constructor(bounds, fill, stroke, strokewidth) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  /**
   *
   * Default imagewidth and imageheight if an image but no imagewidth
   * and imageheight are defined in the style. Value is 16.
   * @type {number}
   * @default 16
   */
  // imageSize: number;
  imageSize = 16;

  /**
   * Adds roundable support.
   * @param {mxAbstractCanvas2D} c
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @returns {boolean}
   */
  // isRoundable(c?: mxAbstractCanvas2D, x?: number, y?: number, w?: number, h?: number): boolean;
  isRoundable(c, x, y, w, h) {
    return true;
  }

  /**
   * Returns the bounding box for the gradient box for this shape.
   */
  // getTitleSize(): number;
  getTitleSize() {
    return Math.max(
      0,
      utils.getValue(this.style, 'startSize', DEFAULT_STARTSIZE)
    );
  }

  /**
   * Returns the bounding box for the gradient box for this shape.
   */
  // getLabelBounds(rect: mxRectangle): mxRectangle;
  getLabelBounds(rect) {
    const start = this.getTitleSize();
    const bounds = new Rectangle(rect.x, rect.y, rect.width, rect.height);
    const horizontal = this.isHorizontal();

    const flipH = utils.getValue(this.style, 'flipH', 0) == 1;
    const flipV = utils.getValue(this.style, 'flipV', 0) == 1;

    // East is default
    const shapeVertical =
      this.direction === DIRECTION_NORTH || this.direction === DIRECTION_SOUTH;
    const realHorizontal = horizontal == !shapeVertical;

    const realFlipH =
      !realHorizontal &&
      flipH !=
        (this.direction === DIRECTION_SOUTH ||
          this.direction === DIRECTION_WEST);
    const realFlipV =
      realHorizontal &&
      flipV !=
        (this.direction === DIRECTION_SOUTH ||
          this.direction === DIRECTION_WEST);

    // Shape is horizontal
    if (!shapeVertical) {
      const tmp = Math.min(bounds.height, start * this.scale);

      if (realFlipH || realFlipV) {
        bounds.y += bounds.height - tmp;
      }

      bounds.height = tmp;
    } else {
      const tmp = Math.min(bounds.width, start * this.scale);

      if (realFlipH || realFlipV) {
        bounds.x += bounds.width - tmp;
      }

      bounds.width = tmp;
    }

    return bounds;
  }

  /**
   * Returns the bounding box for the gradient box for this shape.
   */
  // getGradientBounds(c: mxAbstractCanvas2D, x: number, y: number, w: number, h: number): mxRectangle;
  getGradientBounds(c, x, y, w, h) {
    let start = this.getTitleSize();

    if (this.isHorizontal()) {
      start = Math.min(start, h);
      return new Rectangle(x, y, w, start);
    }
    start = Math.min(start, w);
    return new Rectangle(x, y, start, h);
  }

  /**
   * Function: getSwimlaneArcSize
   *
   * Returns the arcsize for the swimlane.
   */
  getSwimlaneArcSize(w, h, start) {
    if (utils.getValue(this.style, 'absoluteArcSize', 0) == '1') {
      return Math.min(
        w / 2,
        Math.min(
          h / 2,
          utils.getValue(this.style, 'arcSize', LINE_ARCSIZE) / 2
        )
      );
    }
    const f =
      utils.getValue(
        this.style,
        'arcSize',
        RECTANGLE_ROUNDING_FACTOR * 100
      ) / 100;

    return start * f * 3;
  }

  /**
   * Paints the swimlane vertex shape.
   */
  // isHorizontal(): boolean;
  isHorizontal() {
    return utils.getValue(this.style, 'horizontal', 1) == 1;
  }

  /**
   * Paints the swimlane vertex shape.
   */
  // paintVertexShape(c: mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void;
  paintVertexShape(c, x, y, w, h) {
    let start = this.getTitleSize();
    const fill = utils.getValue(this.style, 'swimlaneFillColor', NONE);
    const swimlaneLine =
      utils.getValue(this.style, 'swimlaneLine', 1) == 1;
    let r = 0;

    if (this.isHorizontal()) {
      start = Math.min(start, h);
    } else {
      start = Math.min(start, w);
    }

    c.translate(x, y);

    if (!this.isRounded) {
      this.paintSwimlane(c, x, y, w, h, start, fill, swimlaneLine);
    } else {
      r = this.getSwimlaneArcSize(w, h, start);
      r = Math.min((this.isHorizontal() ? h : w) - start, Math.min(start, r));
      this.paintRoundedSwimlane(c, x, y, w, h, start, r, fill, swimlaneLine);
    }

    const sep = utils.getValue(this.style, 'separatorColor', NONE);
    this.paintSeparator(c, x, y, w, h, start, sep);

    if (this.image != null) {
      const bounds = this.getImageBounds(x, y, w, h);
      c.image(
        bounds.x - x,
        bounds.y - y,
        bounds.width,
        bounds.height,
        this.image,
        false,
        false,
        false
      );
    }

    if (this.glass) {
      c.setShadow(false);
      this.paintGlassEffect(c, 0, 0, w, start, r);
    }
  }

  /**
   * Function: paintSwimlane
   *
   * Paints the swimlane vertex shape.
   */
  paintSwimlane(c, x, y, w, h, start, fill, swimlaneLine) {
    c.begin();

    let events = true;

    if (this.style != null) {
      events = utils.getValue(this.style, 'pointerEvents', '1') == '1';
    }

    if (!events && (this.fill == null || this.fill === NONE)) {
      c.pointerEvents = false;
    }

    if (this.isHorizontal()) {
      c.moveTo(0, start);
      c.lineTo(0, 0);
      c.lineTo(w, 0);
      c.lineTo(w, start);
      c.fillAndStroke();

      if (start < h) {
        if (fill === NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill !== NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(0, start);
        c.lineTo(0, h);
        c.lineTo(w, h);
        c.lineTo(w, start);

        if (fill === NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    } else {
      c.moveTo(start, 0);
      c.lineTo(0, 0);
      c.lineTo(0, h);
      c.lineTo(start, h);
      c.fillAndStroke();

      if (start < w) {
        if (fill === NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill !== NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(start, 0);
        c.lineTo(w, 0);
        c.lineTo(w, h);
        c.lineTo(start, h);

        if (fill === NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    }

    if (swimlaneLine) {
      this.paintDivider(c, x, y, w, h, start, fill === NONE);
    }
  }

  /**
   * Function: paintRoundedSwimlane
   *
   * Paints the swimlane vertex shape.
   */
  paintRoundedSwimlane(c, x, y, w, h, start, r, fill, swimlaneLine) {
    c.begin();

    let events = true;

    if (this.style != null) {
      events = utils.getValue(this.style, 'pointerEvents', '1') == '1';
    }

    if (!events && (this.fill == null || this.fill === NONE)) {
      c.pointerEvents = false;
    }

    if (this.isHorizontal()) {
      c.moveTo(w, start);
      c.lineTo(w, r);
      c.quadTo(w, 0, w - Math.min(w / 2, r), 0);
      c.lineTo(Math.min(w / 2, r), 0);
      c.quadTo(0, 0, 0, r);
      c.lineTo(0, start);
      c.fillAndStroke();

      if (start < h) {
        if (fill === NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill !== NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(0, start);
        c.lineTo(0, h - r);
        c.quadTo(0, h, Math.min(w / 2, r), h);
        c.lineTo(w - Math.min(w / 2, r), h);
        c.quadTo(w, h, w, h - r);
        c.lineTo(w, start);

        if (fill === NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    } else {
      c.moveTo(start, 0);
      c.lineTo(r, 0);
      c.quadTo(0, 0, 0, Math.min(h / 2, r));
      c.lineTo(0, h - Math.min(h / 2, r));
      c.quadTo(0, h, r, h);
      c.lineTo(start, h);
      c.fillAndStroke();

      if (start < w) {
        if (fill === NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill !== NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(start, h);
        c.lineTo(w - r, h);
        c.quadTo(w, h, w, h - Math.min(h / 2, r));
        c.lineTo(w, Math.min(h / 2, r));
        c.quadTo(w, 0, w - r, 0);
        c.lineTo(start, 0);

        if (fill === NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    }

    if (swimlaneLine) {
      this.paintDivider(c, x, y, w, h, start, fill === NONE);
    }
  }

  /**
   * Function: paintDivider
   *
   * Paints the divider between swimlane title and content area.
   */
  paintDivider(c, x, y, w, h, start, shadow) {
    if (!shadow) {
      c.setShadow(false);
    }

    c.begin();

    if (this.isHorizontal()) {
      c.moveTo(0, start);
      c.lineTo(w, start);
    } else {
      c.moveTo(start, 0);
      c.lineTo(start, h);
    }

    c.stroke();
  }

  /**
   * Function: paintSeparator
   *
   * Paints the vertical or horizontal separator line between swimlanes.
   */
  paintSeparator(c, x, y, w, h, start, color) {
    if (color !== NONE) {
      c.setStrokeColor(color);
      c.setDashed(true);
      c.begin();

      if (this.isHorizontal()) {
        c.moveTo(w, start);
        c.lineTo(w, h);
      } else {
        c.moveTo(start, 0);
        c.lineTo(w, 0);
      }

      c.stroke();
      c.setDashed(false);
    }
  }

  /**
   * Paints the swimlane vertex shape.
   */
  // getImageBounds(x: number, y: number, w: number, h: number): mxRectangle;
  getImageBounds(x, y, w, h) {
    if (this.isHorizontal()) {
      return new Rectangle(
        x + w - this.imageSize,
        y,
        this.imageSize,
        this.imageSize
      );
    }
    return new Rectangle(x, y, this.imageSize, this.imageSize);
  }
}

export default Swimlane;
