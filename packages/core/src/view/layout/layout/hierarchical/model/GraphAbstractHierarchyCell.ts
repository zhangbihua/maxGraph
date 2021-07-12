/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import Cell from '../../../../cell/datatypes/Cell';
import CellArray from '../../../../cell/datatypes/CellArray';

class MxGraphAbstractHierarchyCell {
  /**
   * Variable: maxRank
   *
   * The maximum rank this cell occupies. Default is -1.
   */
  maxRank: number = -1;

  /**
   * Variable: minRank
   *
   * The minimum rank this cell occupies. Default is -1.
   */
  minRank: number = -1;

  /**
   * Variable: x
   *
   * The x position of this cell for each layer it occupies
   */
  x: number = null;

  /**
   * Variable: y
   *
   * The y position of this cell for each layer it occupies
   */
  y: number = null;

  /**
   * Variable: width
   *
   * The width of this cell. Default is 0.
   */
  width: number = 0;

  /**
   * Variable: height
   *
   * The height of this cell. Default is 0.
   */
  height: number = 0;

  /**
   * Variable: nextLayerConnectedCells
   *
   * A cached version of the cells this cell connects to on the next layer up
   */
  nextLayerConnectedCells: CellArray | null = null;

  /**
   * Variable: previousLayerConnectedCells
   *
   * A cached version of the cells this cell connects to on the next layer down
   */
  previousLayerConnectedCells: CellArray | null = null;

  /**
   * Variable: temp
   *
   * Temporary variable for general use. Generally, try to avoid
   * carrying information between stages. Currently, the longest
   * path layering sets temp to the rank position in fixRanks()
   * and the crossing reduction uses this. This meant temp couldn't
   * be used for hashing the nodes in the model dfs and so hashCode
   * was created
   */
  temp: any = null;

  /**
   * Class: mxGraphAbstractHierarchyCell
   *
   * An abstraction of an internal hierarchy node or edge
   *
   * Constructor: mxGraphAbstractHierarchyCell
   *
   * Constructs a new hierarchical layout algorithm.
   */
  constructor() {
    this.x = [];
    this.y = [];
    this.temp = [];
  }

  /**
   * Function: getNextLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer up
   */
  getNextLayerConnectedCells(layer: number): Cell | null {
    return null;
  }

  /**
   * Function: getPreviousLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer down
   */
  getPreviousLayerConnectedCells(layer: number): Cell | null {
    return null;
  }

  /**
   * Function: isEdge
   *
   * Returns whether or not this cell is an edge
   */
  isEdge(): boolean {
    return false;
  }

  /**
   * Function: isVertex
   *
   * Returns whether or not this cell is a node
   */
  isVertex(): boolean {
    return false;
  }

  /**
   * Function: getGeneralPurposeVariable
   *
   * Gets the value of temp for the specified layer
   */
  getGeneralPurposeVariable(layer: number): null | number {
    return null;
  }

  /**
   * Function: setGeneralPurposeVariable
   *
   * Set the value of temp for the specified layer
   */
  setGeneralPurposeVariable(layer: number, value: number): null | void {
    return null;
  }

  /**
   * Function: setX
   *
   * Set the value of x for the specified layer
   */
  setX(layer: number, value: number): void {
    if (this.isVertex()) {
      this.x[0] = value;
    } else if (this.isEdge()) {
      this.x[layer - this.minRank - 1] = value;
    }
  }

  /**
   * Function: getX
   *
   * Gets the value of x on the specified layer
   */
  getX(layer: number): number {
    if (this.isVertex()) {
      return this.x[0];
    }
    if (this.isEdge()) {
      return this.x[layer - this.minRank - 1];
    }
    return 0.0;
  }

  /**
   * Function: setY
   *
   * Set the value of y for the specified layer
   */
  setY(layer: number, value: number): void {
    if (this.isVertex()) {
      this.y[0] = value;
    } else if (this.isEdge()) {
      this.y[layer - this.minRank - 1] = value;
    }
  }
}

export default MxGraphAbstractHierarchyCell;
