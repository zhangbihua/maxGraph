/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxGraph from "FIXME";
import mxCodecRegistry from "./mxCodecRegistry";

class mxGraphCodec extends mxObjectCodec {
  /**
   * Class: mxGraphCodec
   *
   * Codec for <mxGraph>s. This class is created and registered
   * dynamically at load time and used implicitly via <mxCodec>
   * and the <mxCodecRegistry>.
   *
   * Transient Fields:
   *
   * - graphListeners
   * - eventListeners
   * - view
   * - container
   * - cellRenderer
   * - editor
   * - selection
   */
  constructor() {
    super(new mxGraph(), ['graphListeners', 'eventListeners', 'view', 'container',
      'cellRenderer', 'editor', 'selection']);
  }
}

mxCodecRegistry.register(new mxGraphCodec());
export default mxGraphCodec;
