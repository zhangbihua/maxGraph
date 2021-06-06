/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import Shape from '../Shape';
import mxSvgCanvas2D from '../../../../util/canvas/mxSvgCanvas2D';
import Rectangle from '../../Rectangle';

/**
 * Extends mxShape to implement an ellipse shape.
 * This shape is registered under mxConstants.SHAPE_ELLIPSE in mxCellRenderer.
 */
class Ellipse extends Shape {
  constructor(
    bounds: Rectangle,
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
   * Paints the ellipse shape.
   */
  // paintVertexShape(c: mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void;
  paintVertexShape(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    c.ellipse(x, y, w, h);
    c.fillAndStroke();
  }
}

export default Ellipse;
