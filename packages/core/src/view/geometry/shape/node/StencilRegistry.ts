/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 *
 * Code to add stencils.
 *
 * (code)
 * let req = mxUtils.load('test/stencils.xml');
 * let root = req.getDocumentElement();
 * let shape = root.firstChild;
 *
 * while (shape != null)
 * {
 *    if (shape.nodeType === mxConstants.NODETYPE_ELEMENT)
 *   {
 *     mxStencilRegistry.addStencil(shape.getAttribute('name'), new mxStencil(shape));
 *   }
 *
 *   shape = shape.nextSibling;
 * }
 * (end)
 */

import Stencil from './Stencil';

type Stencils = {
  [k: string]: Stencil;
};

/**
 * A singleton class that provides a registry for stencils and the methods
 * for painting those stencils onto a canvas or into a DOM.
 *
 * @class StencilRegistry
 */
class StencilRegistry {
  static stencils: Stencils = {};

  /**
   * Adds the given <mxStencil>.
   * @static
   * @param {string} name
   * @param {Stencil} stencil
   */
  static addStencil(name: string, stencil: Stencil) {
    StencilRegistry.stencils[name] = stencil;
  }

  /**
   * Returns the <mxStencil> for the given name.
   * @static
   * @param {string} name
   * @returns {Stencil}
   */
  static getStencil(name: string) {
    return StencilRegistry.stencils[name];
  }
}

export default StencilRegistry;
