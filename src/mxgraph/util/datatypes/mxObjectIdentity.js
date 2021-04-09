/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */

import mxUtils from '../mxUtils';

/**
 * @class
 *
 * Identity for JavaScript objects and functions. This is implemented using
 * a simple incrementing counter which is stored in each object under
 * {@link FIELD_NAME}.
 *
 * The identity for an object does not change during its lifecycle.
 */
class mxObjectIdentity {
  /**
   * Name of the field to be used to store the object ID. Default is
   * <code>mxObjectId</code>.
   */
  // static FIELD_NAME: string;
  static FIELD_NAME = 'mxObjectId';

  /**
   * Current counter.
   */
  // static counter: number;
  static counter = 0;

  /**
   * Returns the ID for the given object or function or null if no object
   * is specified.
   */
  // static get(obj: any): any;
  static get(obj) {
    if (obj != null) {
      if (obj[mxObjectIdentity.FIELD_NAME] == null) {
        if (typeof obj === 'object') {
          const ctor = mxUtils.getFunctionName(obj.constructor);
          obj[
            mxObjectIdentity.FIELD_NAME
          ] = `${ctor}#${mxObjectIdentity.counter++}`;
        } else if (typeof obj === 'function') {
          obj[
            mxObjectIdentity.FIELD_NAME
          ] = `Function#${mxObjectIdentity.counter++}`;
        }
      }

      return obj[mxObjectIdentity.FIELD_NAME];
    }

    return null;
  }

  /**
   * Deletes the ID from the given object or function.
   */
  // static clear(obj: any): void;
  static clear(obj) {
    if (typeof obj === 'object' || typeof obj === 'function') {
      delete obj[mxObjectIdentity.FIELD_NAME];
    }
  }
}

export default mxObjectIdentity;
