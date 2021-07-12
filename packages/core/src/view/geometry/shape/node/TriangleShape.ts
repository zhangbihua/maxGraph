/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */

import Point from '../../Point';
import Actor from '../Actor';
import utils, { getValue } from '../../../../util/Utils';
import { LINE_ARCSIZE } from '../../../../util/Constants';
import mxSvgCanvas2D from '../../../../util/canvas/mxSvgCanvas2D';

/**
 * Implementation of the triangle shape.
 * @class TriangleShape
 * @extends {Actor}
 */
class TriangleShape extends Actor {
  constructor() {
    super();
  }

  /**
   * Adds roundable support.
   * @returns {boolean}
   */
  isRoundable(): boolean {
    return true;
  }

  /**
   * Draws the path for this shape.
   * @param {mxAbstractCanvas2D} c
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  redrawPath(
    c: mxSvgCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    const arcSize: number =
      getValue(this.style, 'arcSize', LINE_ARCSIZE) / 2;

    this.addPoints(
      c,
      [new Point(0, 0), new Point(w, 0.5 * h), new Point(0, h)],
      this.isRounded,
      arcSize,
      true
    );
  }
}

export default TriangleShape;
