/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import Shape from '../Shape';
import { LINE_ARCSIZE } from '../../../../util/Constants';
import utils, { getValue } from '../../../../util/Utils';
import Point from '../../Point';
import mxAbstractCanvas2D from '../../../../util/canvas/mxAbstractCanvas2D';

/**
 * Class: mxPolyline
 *
 * Extends <mxShape> to implement a polyline (a line with multiple points).
 * This shape is registered under <mxConstants.SHAPE_POLYLINE> in
 * <mxCellRenderer>.
 *
 * Constructor: mxPolyline
 *
 * Constructs a new polyline shape.
 *
 * Parameters:
 *
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * stroke - String that defines the stroke color. Default is 'black'. This is
 * stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
class Polyline extends Shape {
  constructor(points: Point[], stroke: string, strokewidth: number) {
    super();
    this.points = points;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  /**
   * Returns 0.
   */
  getRotation(): number {
    return 0;
  }

  /**
   * Returns 0.
   */
  getShapeRotation(): number {
    return 0;
  }

  /**
   * Returns false.
   */
  isPaintBoundsInverted(): boolean {
    return false;
  }

  /**
   * Paints the line shape.
   */
  paintEdgeShape(c: mxAbstractCanvas2D, pts: Point[]): void {
    const prev = c.pointerEventsValue;
    c.pointerEventsValue = 'stroke';

    if (this.style == null || this.style.curved != 1) {
      this.paintLine(c, pts, this.isRounded);
    } else {
      this.paintCurvedLine(c, pts);
    }
    c.pointerEventsValue = prev;
  }

  /**
   * Paints the line shape.
   */
  paintLine(c: mxAbstractCanvas2D, pts: Point[], rounded?: boolean): void {
    const arcSize = getValue(this.style, 'arcSize', LINE_ARCSIZE) / 2;
    c.begin();
    this.addPoints(c, pts, rounded, arcSize, false);
    c.stroke();
  }

  /**
   * Paints the line shape.
   */
  paintCurvedLine(c: mxAbstractCanvas2D, pts: Point[]): void {
    c.begin();

    const pt = pts[0];
    const n = pts.length;
    c.moveTo(pt.x, pt.y);

    for (let i = 1; i < n - 2; i += 1) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const ix = (p0.x + p1.x) / 2;
      const iy = (p0.y + p1.y) / 2;
      c.quadTo(p0.x, p0.y, ix, iy);
    }

    const p0 = pts[n - 2];
    const p1 = pts[n - 1];
    c.quadTo(p0.x, p0.y, p1.x, p1.y);

    c.stroke();
  }
}

export default Polyline;
