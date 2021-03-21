class WeightedCellSorter {
  /**
   * Variable: weightedValue
   *
   * The weighted value of the cell stored.
   */
  weightedValue = 0;

  /**
   * Variable: nudge
   *
   * Whether or not to flip equal weight values.
   */
  nudge = false;

  /**
   * Variable: visited
   *
   * Whether or not this cell has been visited in the current assignment.
   */
  visited = false;

  /**
   * Variable: rankIndex
   *
   * The index this cell is in the model rank.
   */
  rankIndex = null;

  /**
   * Variable: cell
   *
   * The cell whose median value is being calculated.
   */
  cell = null;

  /**
   * Class: WeightedCellSorter
   *
   * A utility class used to track cells whilst sorting occurs on the weighted
   * sum of their connected edges. Does not violate (x.compareTo(y)==0) ==
   * (x.equals(y))
   *
   * Constructor: WeightedCellSorter
   *
   * Constructs a new weighted cell sorted for the given cell and weight.
   */
  constructor(cell, weightedValue) {
    this.cell = cell;
    this.weightedValue = weightedValue;
  };

  /**
   * Function: compare
   *
   * Compares two WeightedCellSorters.
   */
  compare = (a, b) => {
    if (a != null && b != null) {
      if (b.weightedValue > a.weightedValue) {
        return -1;
      } else if (b.weightedValue < a.weightedValue) {
        return 1;
      } else {
        if (b.nudge) {
          return -1;
        } else {
          return 1;
        }
      }
    } else {
      return 0;
    }
  };
}

export default WeightedCellSorter;
