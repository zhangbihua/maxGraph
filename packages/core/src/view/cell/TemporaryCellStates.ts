/**
 * Copyright (c) 2006-2017, JGraph Ltd
 * Copyright (c) 2006-2017, Gaudenz Alder
 */
/**
 * Class: mxTemporaryCellStates
 *
 * Creates a temporary set of cell states.
 */

import Rectangle from '../geometry/Rectangle';
import mxDictionary from '../../util/mxDictionary';
import GraphView from '../view/GraphView';
import Cell from './datatypes/Cell';
import CellState from './datatypes/CellState';
import Shape from "../geometry/shape/Shape";
import graph from "../Graph";

class TemporaryCellStates {
  constructor(
      view: GraphView,
      scale: number = 1,
      cells: Cell[],
      isCellVisibleFn: Function | null = null,
      getLinkForCellState: Function | null = null
  ) {
    this.view = view;

    // Stores the previous state
    this.oldValidateCellState = view.validateCellState;
    this.oldBounds = view.getGraphBounds();
    this.oldStates = view.getStates();
    this.oldScale = view.getScale();
    this.oldDoRedrawShape = (<graph>view.graph).cellRenderer.doRedrawShape;

    const self = this;

    // Overrides doRedrawShape and paint shape to add links on shapes
    if (getLinkForCellState != null) {
      (<graph>view.graph).cellRenderer.doRedrawShape = (state: CellState) => {
        const shape = <Shape>state?.shape;
        const oldPaint = shape.paint;

        shape.paint = c => {
          const link = getLinkForCellState(state);
          if (link != null) {
            c.setLink(link);
          }
          oldPaint.apply(this, [c]);
          if (link != null) {
            c.setLink(null);
          }
        };

        (<Function>self.oldDoRedrawShape).apply((<graph>view.graph).cellRenderer, [state]);
        shape.paint = oldPaint;
      };
    }

    // Overrides validateCellState to ignore invisible cells
    view.validateCellState = (cell, recurse) => {
      if (cell == null || isCellVisibleFn == null || isCellVisibleFn(cell)) {
        return (<Function>self.oldDoRedrawShape).apply(view, [cell, recurse]);
      }
      return null;
    };

    // Creates space for new states
    view.setStates(new mxDictionary());
    view.setScale(scale);

    if (cells != null) {
      view.resetValidationState();
      let bbox = null;

      // Validates the vertices and edges without adding them to
      // the model so that the original cells are not modified
      for (const cell of cells) {
        const bounds = view.getBoundingBox(
            view.validateCellState(<Cell>view.validateCell(<Cell>cell))
        );
        if (bbox == null) {
          bbox = bounds;
        } else {
          bbox.add(bounds);
        }
      }
      view.setGraphBounds(bbox || new Rectangle());
    }
  }

  oldValidateCellState: Function | null;

  oldDoRedrawShape: Function | null;

  /**
   * Holds the width of the rectangle.
   * @default 0
   */
  // view: number;
  view: mxGraphView | null = null;

  /**
   * Holds the height of the rectangle.
   * @default 0
   */
  // oldStates: number;
  oldStates: mxDictionary | null = null;

  /**
   * Holds the height of the rectangle.
   * @default 0
   */
  // oldBounds: number;
  oldBounds: Rectangle | null = null;

  /**
   * Holds the height of the rectangle.
   * @default 0
   */
  // oldScale: number;
  oldScale: number = 0;

  /**
   * Holds the height of the rectangle.
   * @default 0
   */
  // destroy(): void;
  destroy(): void {
    const view = <mxGraphView>this.view;
    view.setScale(this.oldScale);
    view.setStates(this.oldStates);
    view.setGraphBounds(<Rectangle>this.oldBounds);
    // @ts-ignore
    view.validateCellState = <Function>this.oldValidateCellState;
    // @ts-ignore
    view.graph.cellRenderer.doRedrawShape = <Function>this.oldDoRedrawShape;
  }
}

export default TemporaryCellStates;
