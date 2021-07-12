/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import GraphAbstractHierarchyCell from './GraphAbstractHierarchyCell';
import mxObjectIdentity from '../../../../../util/mxObjectIdentity';
import CellArray from '../../../../cell/datatypes/CellArray';
import Cell from '../../../../cell/datatypes/Cell';

class GraphHierarchyEdge extends GraphAbstractHierarchyCell {
  /**
   * Variable: edges
   *
   * The graph edge(s) this object represents. Parallel edges are all grouped
   * together within one hierarchy edge.
   */
  edges: CellArray;

  /**
   * Variable: ids
   *
   * The object identities of the wrapped cells
   */
  ids = null;

  /**
   * Variable: source
   *
   * The node this edge is sourced at
   */
  source: Cell | null = null;

  /**
   * Variable: target
   *
   * The node this edge targets
   */
  target: Cell | null = null;

  /**
   * Variable: isReversed
   *
   * Whether or not the direction of this edge has been reversed
   * internally to create a DAG for the hierarchical layout
   */
  isReversed: boolean = false;

  /**
   * Class: mxGraphHierarchyEdge
   *
   * An abstraction of a hierarchical edge for the hierarchy layout
   *
   * Constructor: mxGraphHierarchyEdge
   *
   * Constructs a hierarchy edge
   *
   * Arguments:
   *
   * edges - a list of real graph edges this abstraction represents
   */
  constructor(edges: CellArray) {
    super(edges);
    this.edges = edges;
    this.ids = [];

    for (let i = 0; i < edges.length; i += 1) {
      this.ids.push(mxObjectIdentity.get(edges[i]));
    }
  }

  /**
   * Function: invert
   *
   * Inverts the direction of this internal edge(s)
   */
  invert(layer) {
    const temp = this.source;
    this.source = this.target;
    this.target = temp;
    this.isReversed = !this.isReversed;
  }

  /**
   * Function: getNextLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer up
   */
  getNextLayerConnectedCells(layer: Cell): CellArray {
    if (this.nextLayerConnectedCells == null) {
      this.nextLayerConnectedCells = [];

      for (let i = 0; i < this.temp.length; i += 1) {
        this.nextLayerConnectedCells[i] = [];

        if (i === this.temp.length - 1) {
          this.nextLayerConnectedCells[i].push(this.source);
        } else {
          this.nextLayerConnectedCells[i].push(this);
        }
      }
    }
    return this.nextLayerConnectedCells[layer - this.minRank - 1];
  }

  /**
   * Function: getPreviousLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer down
   */
  getPreviousLayerConnectedCells(layer: Cell): CellArray {
    if (this.previousLayerConnectedCells == null) {
      this.previousLayerConnectedCells = [];

      for (let i = 0; i < this.temp.length; i += 1) {
        this.previousLayerConnectedCells[i] = [];

        if (i === 0) {
          this.previousLayerConnectedCells[i].push(this.target);
        } else {
          this.previousLayerConnectedCells[i].push(this);
        }
      }
    }
    return this.previousLayerConnectedCells[layer - this.minRank - 1];
  }

  /**
   * Function: isEdge
   *
   * Returns true.
   */
  isEdge(): boolean {
    return true;
  }

  /**
   * Function: getGeneralPurposeVariable
   *
   * Gets the value of temp for the specified layer
   */
  getGeneralPurposeVariable(layer: number): any {
    return this.temp[layer - this.minRank - 1];
  }

  /**
   * Function: setGeneralPurposeVariable
   *
   * Set the value of temp for the specified layer
   */
  setGeneralPurposeVariable(layer: number, value: any): void {
    this.temp[layer - this.minRank - 1] = value;
  }

  /**
   * Function: getCoreCell
   *
   * Gets the first core edge associated with this wrapper
   */
  getCoreCell(): Cell | null {
    if (this.edges != null && this.edges.length > 0) {
      return this.edges[0];
    }
    return null;
  }
}

export default GraphHierarchyEdge;
