/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import {
  DEFAULT_MARKERSIZE,
  NONE,
} from '../../../../util/Constants';
import mxPolyline from './mxPolyline';
import utils from '../../../../util/Utils';
import mxMarker from './mxMarker';

/**
 * Extends {@link mxShape} to implement a connector shape.
 * The connector shape allows for arrow heads on either side.
 * This shape is registered under {@link mxConstants.SHAPE_CONNECTOR} in {@link mxCellRenderer}.
 *
 * @class mxConnector
 * @extends {mxPolyline}
 */
class mxConnector extends mxPolyline {
  constructor(points, stroke, strokewidth) {
    super(points, stroke, strokewidth);
  }

  /**
   * Updates the <boundingBox> for this shape using <createBoundingBox>
   * and augmentBoundingBox and stores the result in <boundingBox>.
   */
  // updateBoundingBox(): void;
  updateBoundingBox() {
    this.useSvgBoundingBox =
      this.style != null && this.style.curved === 1;
    super.updateBoundingBox();
  }

  /**
   * Paints the line shape.
   */
  // paintEdgeShape(c: mxAbstractCanvas2D, pts: mxPoint[]): void;
  paintEdgeShape(c, pts) {
    // The indirection via functions for markers is needed in
    // order to apply the offsets before painting the line and
    // paint the markers after painting the line.
    const sourceMarker = this.createMarker(c, pts, true);
    const targetMarker = this.createMarker(c, pts, false);

    super.paintEdgeShape(c, pts);

    // Disables shadows, dashed styles and fixes fill color for markers
    c.setFillColor(this.stroke);
    c.setShadow(false);
    c.setDashed(false);

    if (sourceMarker != null) {
      sourceMarker();
    }

    if (targetMarker != null) {
      targetMarker();
    }
  }

  /**
   * Prepares the marker by adding offsets in pts and returning a function to paint the marker.
   */
  // createMarker(c: mxAbstractCanvas2D, pts: mxPoint[], source: boolean): mxMarker;
  createMarker(c, pts, source) {
    let result = null;
    const n = pts.length;
    const type = utils.getValue(
      this.style,
      source ? 'startArrow' : 'endArrow'
    );
    let p0 = source ? pts[1] : pts[n - 2];
    const pe = source ? pts[0] : pts[n - 1];

    if (type != null && p0 != null && pe != null) {
      let count = 1;

      // Uses next non-overlapping point
      while (
        count < n - 1 &&
        Math.round(p0.x - pe.x) === 0 &&
        Math.round(p0.y - pe.y) === 0
      ) {
        p0 = source ? pts[1 + count] : pts[n - 2 - count];
        count++;
      }

      // Computes the norm and the inverse norm
      const dx = pe.x - p0.x;
      const dy = pe.y - p0.y;

      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));

      const unitX = dx / dist;
      const unitY = dy / dist;

      const size = utils.getNumber(
        this.style,
        source ? 'startSize' : 'endSize',
        DEFAULT_MARKERSIZE
      );

      // Allow for stroke width in the end point used and the
      // orthogonal vectors describing the direction of the marker
      const filled = this.style[source ? 'startFill' : 'endFill'] !== 0;

      result = mxMarker.createMarker(
        c,
        this,
        type,
        pe,
        unitX,
        unitY,
        size,
        source,
        this.strokewidth,
        filled
      );
    }

    return result;
  }

  /**
   * Augments the bounding box with the strokewidth and shadow offsets.
   */
  // augmentBoundingBox(bbox: mxRectangle): void;
  augmentBoundingBox(bbox) {
    super.augmentBoundingBox(bbox);

    // Adds marker sizes
    let size = 0;

    if (utils.getValue(this.style, 'startArrow', NONE) !== NONE) {
      size =
        utils.getNumber(this.style, 'startSize', DEFAULT_MARKERSIZE) + 1;
    }

    if (utils.getValue(this.style, 'endArrow', NONE) !== NONE) {
      size =
        Math.max(
          size,
          utils.getNumber(this.style, 'endSize', DEFAULT_MARKERSIZE)
        ) + 1;
    }

    bbox.grow(size * this.scale);
  }
}

export default mxConnector;
