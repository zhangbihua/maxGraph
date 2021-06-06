class GraphDragDrop {
  /**
   * Specifies if the graph should automatically scroll if the mouse goes near
   * the container edge while dragging. This is only taken into account if the
   * container has scrollbars.
   *
   * If you need this to work without scrollbars then set {@link ignoreScrollbars} to
   * true. Please consult the {@link ignoreScrollbars} for details. In general, with
   * no scrollbars, the use of {@link allowAutoPanning} is recommended.
   * @default true
   */
  autoScroll: boolean = true;

  /**
   * Specifies if the size of the graph should be automatically extended if the
   * mouse goes near the container edge while dragging. This is only taken into
   * account if the container has scrollbars. See {@link autoScroll}.
   * @default true
   */
  autoExtend: boolean = true;
}

export default GraphDragDrop;