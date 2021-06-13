import Graph from "../Graph";
import ImageBundle from "../../util/image/ImageBundle";
import ImageBundle from "./ImageBundle";

class GraphImage {
  constructor(graph: Graph) {
    this.imageBundles = [];
  }

  /**
   * Holds the list of image bundles.
   */
  imageBundles: ImageBundle[] = [];

  /*****************************************************************************
   * Group: Image bundles
   *****************************************************************************/

  /**
   * Adds the specified {@link ImageBundle}.
   */
  addImageBundle(bundle: ImageBundle): void {
    this.imageBundles.push(bundle);
  }

  /**
   * Removes the specified {@link ImageBundle}.
   */
  removeImageBundle(bundle: ImageBundle): void {
    const tmp = [];
    for (let i = 0; i < this.imageBundles.length; i += 1) {
      if (this.imageBundles[i] !== bundle) {
        tmp.push(this.imageBundles[i]);
      }
    }
    this.imageBundles = tmp;
  }

  /**
   * Searches all {@link imageBundles} for the specified key and returns the value
   * for the first match or null if the key is not found.
   */
  getImageFromBundles(key: string): string {
    if (key != null) {
      for (let i = 0; i < this.imageBundles.length; i += 1) {
        const image = this.imageBundles[i].getImage(key);
        if (image != null) {
          return image;
        }
      }
    }
    return null;
  }
}

export default GraphImage;
