import Rectangle from "../geometry/Rectangle";
import {hasScrollbars} from "../../util/Utils";

class GraphZoom {
  /**
   * Specifies the factor used for {@link zoomIn} and {@link zoomOut}.
   * @default 1.2 (120%)
   */
  zoomFactor: number = 1.2;

  /**
   * Specifies if the viewport should automatically contain the selection cells after a zoom operation.
   * @default false
   */
  keepSelectionVisibleOnZoom: boolean = false;

  /**
   * Specifies if the zoom operations should go into the center of the actual
   * diagram rather than going from top, left.
   * @default true
   */
  centerZoom: boolean = true;

  /*****************************************************************************
   * Group: Graph display
   *****************************************************************************/

  /**
   * Zooms into the graph by {@link zoomFactor}.
   */
  zoomIn(): void {
    this.zoom(this.zoomFactor);
  }

  /**
   * Zooms out of the graph by {@link zoomFactor}.
   */
  zoomOut(): void {
    this.zoom(1 / this.zoomFactor);
  }

  /**
   * Resets the zoom and panning in the view.
   */
  zoomActual(): void {
    if (this.view.scale === 1) {
      this.view.setTranslate(0, 0);
    } else {
      this.view.translate.x = 0;
      this.view.translate.y = 0;

      this.view.setScale(1);
    }
  }

  /**
   * Zooms the graph to the given scale with an optional boolean center
   * argument, which is passd to {@link zoom}.
   */
  zoomTo(scale: number, center: boolean = false): void {
    this.zoom(scale / this.view.scale, center);
  }

  /**
   * Zooms the graph using the given factor. Center is an optional boolean
   * argument that keeps the graph scrolled to the center. If the center argument
   * is omitted, then {@link centerZoom} will be used as its value.
   */
  zoom(factor: number, center: boolean = this.centerZoom): void {
    const scale = Math.round(this.view.scale * factor * 100) / 100;
    const state = this.view.getState(this.getSelectionCell());
    const container = <HTMLElement>this.container;
    factor = scale / this.view.scale;

    if (this.keepSelectionVisibleOnZoom && state != null) {
      const rect = new Rectangle(
        state.x * factor,
        state.y * factor,
        state.width * factor,
        state.height * factor
      );

      // Refreshes the display only once if a scroll is carried out
      this.view.scale = scale;

      if (!this.scrollRectToVisible(rect)) {
        this.view.revalidate();

        // Forces an event to be fired but does not revalidate again
        this.view.setScale(scale);
      }
    } else {
      const _hasScrollbars = hasScrollbars(this.container);

      if (center && !_hasScrollbars) {
        let dx = container.offsetWidth;
        let dy = container.offsetHeight;

        if (factor > 1) {
          const f = (factor - 1) / (scale * 2);
          dx *= -f;
          dy *= -f;
        } else {
          const f = (1 / factor - 1) / (this.view.scale * 2);
          dx *= f;
          dy *= f;
        }

        this.view.scaleAndTranslate(
          scale,
          this.view.translate.x + dx,
          this.view.translate.y + dy
        );
      } else {
        // Allows for changes of translate and scrollbars during setscale
        const tx = this.view.translate.x;
        const ty = this.view.translate.y;
        const sl = container.scrollLeft;
        const st = container.scrollTop;

        this.view.setScale(scale);

        if (_hasScrollbars) {
          let dx = 0;
          let dy = 0;

          if (center) {
            dx = (container.offsetWidth * (factor - 1)) / 2;
            dy = (container.offsetHeight * (factor - 1)) / 2;
          }

          container.scrollLeft =
            (this.view.translate.x - tx) * this.view.scale +
            Math.round(sl * factor + dx);
          container.scrollTop =
            (this.view.translate.y - ty) * this.view.scale +
            Math.round(st * factor + dy);
        }
      }
    }
  }

  /**
   * Zooms the graph to the specified rectangle. If the rectangle does not have same aspect
   * ratio as the display container, it is increased in the smaller relative dimension only
   * until the aspect match. The original rectangle is centralised within this expanded one.
   *
   * Note that the input rectangular must be un-scaled and un-translated.
   *
   * @param rect The un-scaled and un-translated rectangluar region that should be just visible
   * after the operation
   */
  zoomToRect(rect: Rectangle): void {
    const container = <HTMLElement>this.container;
    const scaleX = container.clientWidth / rect.width;
    const scaleY = container.clientHeight / rect.height;
    const aspectFactor = scaleX / scaleY;

    // Remove any overlap of the rect outside the client area
    rect.x = Math.max(0, rect.x);
    rect.y = Math.max(0, rect.y);
    let rectRight = Math.min(container.scrollWidth, rect.x + rect.width);
    let rectBottom = Math.min(container.scrollHeight, rect.y + rect.height);
    rect.width = rectRight - rect.x;
    rect.height = rectBottom - rect.y;

    // The selection area has to be increased to the same aspect
    // ratio as the container, centred around the centre point of the
    // original rect passed in.
    if (aspectFactor < 1.0) {
      // Height needs increasing
      const newHeight = rect.height / aspectFactor;
      const deltaHeightBuffer = (newHeight - rect.height) / 2.0;
      rect.height = newHeight;

      // Assign up to half the buffer to the upper part of the rect, not crossing 0
      // put the rest on the bottom
      const upperBuffer = Math.min(rect.y, deltaHeightBuffer);
      rect.y -= upperBuffer;

      // Check if the bottom has extended too far
      rectBottom = Math.min(container.scrollHeight, rect.y + rect.height);
      rect.height = rectBottom - rect.y;
    } else {
      // Width needs increasing
      const newWidth = rect.width * aspectFactor;
      const deltaWidthBuffer = (newWidth - rect.width) / 2.0;
      rect.width = newWidth;

      // Assign up to half the buffer to the upper part of the rect, not crossing 0
      // put the rest on the bottom
      const leftBuffer = Math.min(rect.x, deltaWidthBuffer);
      rect.x -= leftBuffer;

      // Check if the right hand side has extended too far
      rectRight = Math.min(container.scrollWidth, rect.x + rect.width);
      rect.width = rectRight - rect.x;
    }

    const scale = container.clientWidth / rect.width;
    const newScale = this.view.scale * scale;

    if (!hasScrollbars(this.container)) {
      this.view.scaleAndTranslate(
        newScale,
        this.view.translate.x - rect.x / this.view.scale,
        this.view.translate.y - rect.y / this.view.scale
      );
    } else {
      this.view.setScale(newScale);
      container.scrollLeft = Math.round(rect.x * scale);
      container.scrollTop = Math.round(rect.y * scale);
    }
  }
}

export default GraphZoom;
