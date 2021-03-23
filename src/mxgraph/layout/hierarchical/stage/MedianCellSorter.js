class MedianCellSorter {
  constructor() {
    // empty
  }

  /**
   * Function: compare
   *
   * Compares two MedianCellSorters.
   */
  compare(a, b) {
    if (a != null && b != null) {
      if (b.medianValue > a.medianValue) {
        return -1;
      }
      if (b.medianValue < a.medianValue) {
        return 1;
      }
      return 0;
    }
    return 0;
  }
}

export default MedianCellSorter;
