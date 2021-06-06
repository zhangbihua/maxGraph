/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import Rectangle from '../Rectangle';
import Shape from './Shape';
import mxSvgCanvas2D from '../../../util/canvas/mxSvgCanvas2D';

/**
 * Extends {@link Shape} to implement an actor shape. If a custom shape with one
 * filled area is needed, then this shape's {@link redrawPath} method should be overridden.
 *
 * This shape is registered under {@link mxConstants.SHAPE_ACTOR} in {@link cellRenderer}.
 *
 * @example
 * ```javascript
 * function SampleShape() { }
 *
 * SampleShape.prototype = new mxActor();
 * SampleShape.prototype.constructor = vsAseShape;
 *
 * mxCellRenderer.registerShape('sample', SampleShape);
 * SampleShape.prototype.redrawPath = function(path, x, y, w, h)
 * {
 *   path.moveTo(0, 0);
 *   path.lineTo(w, h);
 *   // ...
 *   path.close();
 * }
 * ```
 */
class Actor extends Shape {
  constructor(
    bounds: Rectangle | null = null,
    fill: string | null = null,
    stroke: string | null = null,
    strokewidth: number = 1
  ) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth;
  }

  /**
   * Redirects to redrawPath for subclasses to work.
   */
  // paintVertexShape(c: mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void;
  paintVertexShape(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    c.translate(x, y);
    c.begin();
    this.redrawPath(c, x, y, w, h);
    c.fillAndStroke();
  }

  /**
   * Draws the path for this shape.
   */
  // redrawPath(c: mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void;
  redrawPath(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    const width = w / 3;
    c.moveTo(0, h);
    c.curveTo(0, (3 * h) / 5, 0, (2 * h) / 5, w / 2, (2 * h) / 5);
    c.curveTo(w / 2 - width, (2 * h) / 5, w / 2 - width, 0, w / 2, 0);
    c.curveTo(w / 2 + width, 0, w / 2 + width, (2 * h) / 5, w / 2, (2 * h) / 5);
    c.curveTo(w, (2 * h) / 5, w, (3 * h) / 5, w, h);
    c.close();
  }
}

export default Actor;
