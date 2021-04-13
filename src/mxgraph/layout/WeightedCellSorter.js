/**
 * @class WeightedCellSorter
 *
 * A utility class used to track cells whilst sorting occurs on the weighted
 * sum of their connected edges. Does not violate (x.compareTo(y)==0) ==
 * (x.equals(y))
 *
 */
class WeightedCellSorter {
  constructor(cell, weightedValue) {
    this.cell = cell;
    this.weightedValue = weightedValue;
  }

  /**
   * The weighted value of the cell stored.
   */
  // weightedValue: number;
  weightedValue = 0;

  /**
   * Whether or not to flip equal weight values.
   */
  // nudge: boolean;
  nudge = false;

  /**
   * Whether or not this cell has been visited in the current assignment.
   */
  // visited: boolean;
  visited = false;

  /**
   * The index this cell is in the model rank.
   */
  // rankIndex: number;
  rankIndex = null;

  /**
   * The cell whose median value is being calculated.
   */
  // cell: mxCell;
  cell = null;

  /**
   * Compares two WeightedCellSorters.
   */
  // compare(a: WeightedCellSorter, b: WeightedCellSorter): number;
  compare(a, b) {
    if (a != null && b != null) {
      if (b.weightedValue > a.weightedValue) {
        return -1;
      }
      if (b.weightedValue < a.weightedValue) {
        return 1;
      }
      if (b.nudge) {
        return -1;
      }
      return 1;
    }
    return 0;
  }
}

export default WeightedCellSorter;
