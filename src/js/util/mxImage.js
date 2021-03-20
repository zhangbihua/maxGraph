/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */

class mxImage {
  /**
   * Variable: src
   *
   * String that specifies the URL of the image.
   */
  src = null;

  /**
   * Variable: width
   *
   * Integer that specifies the width of the image.
   */
  width = null;

  /**
   * Variable: height
   *
   * Integer that specifies the height of the image.
   */
  height = null;

  /**
   * Class: mxImage
   *
   * Encapsulates the URL, width and height of an image.
   *
   * Constructor: mxImage
   *
   * Constructs a new image.
   */
  constructor(src, width, height) {
    this.src = src;
    this.width = width;
    this.height = height;
  };
}

export default mxImage;
