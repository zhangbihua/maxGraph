/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

/**
 * Class: mxImage
 *
 * Encapsulates the URL, width and height of an image.
 *
 * Constructor: mxImage
 *
 * Constructs a new image.
 */
class mxImage {
  constructor(src, width, height) {
    this.src = src;
    this.width = width;
    this.height = height;
  }

  /**
   * Variable: src
   *
   * String that specifies the URL of the image.
   */
  // src: string;
  src = null;

  /**
   * Variable: width
   *
   * Integer that specifies the width of the image.
   */
  // width: number;
  width = null;

  /**
   * Variable: height
   *
   * Integer that specifies the height of the image.
   */
  // height: number;
  height = null;
}

export default mxImage;
