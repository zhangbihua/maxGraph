/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxConstants from '../../mxConstants';
import mxEdgeStyle from './mxEdgeStyle';
import mxPerimeter from './mxPerimeter';

const mxStyleRegistry = {
  /**
   * Class: mxStyleRegistry
   *
   * Singleton class that acts as a global converter from string to object values
   * in a style. This is currently only used to perimeters and edge styles.
   *
   * Variable: values
   *
   * Maps from strings to objects.
   */
  values: [],

  /**
   * Function: putValue
   *
   * Puts the given object into the registry under the given name.
   */
  putValue: (name: string, obj: any): void => {
    mxStyleRegistry.values[name] = obj;
  },

  /**
   * Function: getValue
   *
   * Returns the value associated with the given name.
   */
  getValue: (name: string): any => {
    return mxStyleRegistry.values[name];
  },

  /**
   * Function: getName
   *
   * Returns the name for the given value.
   */
  getName: (value: any): string => {
    for (const key in mxStyleRegistry.values) {
      if (mxStyleRegistry.values[key] === value) {
        return key;
      }
    }
    return null;
  },
};

mxStyleRegistry.putValue(
  mxConstants.EDGESTYLE_ELBOW,
  mxEdgeStyle.ElbowConnector
);
mxStyleRegistry.putValue(
  mxConstants.EDGESTYLE_ENTITY_RELATION,
  mxEdgeStyle.EntityRelation
);
mxStyleRegistry.putValue(mxConstants.EDGESTYLE_LOOP, mxEdgeStyle.Loop);
mxStyleRegistry.putValue(
  mxConstants.EDGESTYLE_SIDETOSIDE,
  mxEdgeStyle.SideToSide
);
mxStyleRegistry.putValue(
  mxConstants.EDGESTYLE_TOPTOBOTTOM,
  mxEdgeStyle.TopToBottom
);
mxStyleRegistry.putValue(
  mxConstants.EDGESTYLE_ORTHOGONAL,
  mxEdgeStyle.OrthConnector
);
mxStyleRegistry.putValue(
  mxConstants.EDGESTYLE_SEGMENT,
  mxEdgeStyle.SegmentConnector
);

mxStyleRegistry.putValue(
  mxConstants.PERIMETER_ELLIPSE,
  mxPerimeter.EllipsePerimeter
);
mxStyleRegistry.putValue(
  mxConstants.PERIMETER_RECTANGLE,
  mxPerimeter.RectanglePerimeter
);
mxStyleRegistry.putValue(
  mxConstants.PERIMETER_RHOMBUS,
  mxPerimeter.RhombusPerimeter
);
mxStyleRegistry.putValue(
  mxConstants.PERIMETER_TRIANGLE,
  mxPerimeter.TrianglePerimeter
);
mxStyleRegistry.putValue(
  mxConstants.PERIMETER_HEXAGON,
  mxPerimeter.HexagonPerimeter
);

export default mxStyleRegistry;
