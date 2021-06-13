import Cell from './datatypes/Cell';
import StyleMap from '../style/StyleMap';
import Stylesheet from '../style/Stylesheet';
import CellArray from './datatypes/CellArray';
import utils, {
  contains,
  findNearestSegment,
  getBoundingBox,
  getRotatedPoint,
  getSizeForString,
  getValue,
  intersects,
  ptSegDistSq,
  removeDuplicates,
  setCellStyleFlags,
  setCellStyles,
  setStyle,
  toRadians,
} from '../../util/Utils';
import {
  ALIGN_BOTTOM,
  ALIGN_CENTER,
  ALIGN_MIDDLE,
  ALIGN_RIGHT,
  ALIGN_TOP,
  DEFAULT_FONTSIZE,
  DIRECTION_EAST,
  DIRECTION_NORTH,
  DIRECTION_SOUTH,
  DIRECTION_WEST,
  SHAPE_LABEL,
} from '../../util/Constants';
import Geometry from '../geometry/Geometry';
import EventObject from '../event/EventObject';
import InternalEvent from '../event/InternalEvent';
import ImageBundle from '../image/ImageBundle';
import Rectangle from '../geometry/Rectangle';
import Dictionary from '../../util/Dictionary';
import Point from '../geometry/Point';
import Label from '../geometry/shape/Label';
import { htmlEntities } from '../../util/StringUtils';
import InternalMouseEvent from '../event/InternalMouseEvent';
import Graph from '../Graph';
import CellState from './datatypes/CellState';

class GraphCells {
  constructor(graph: Graph) {
    this.graph = graph;
  }

  graph: Graph;

  /**
   * Specifies the return value for {@link isCellsResizable}.
   * @default true
   */
  cellsResizable: boolean = true;

  /**
   * Specifies the return value for {@link isCellsBendable}.
   * @default true
   */
  cellsBendable: boolean = true;

  /**
   * Specifies the return value for {@link isCellsSelectable}.
   * @default true
   */
  cellsSelectable: boolean = true;

  /**
   * Specifies the return value for {@link isCellsDisconnectable}.
   * @default true
   */
  cellsDisconnectable: boolean = true;

  /**
   * Specifies if the graph should automatically update the cell size after an
   * edit. This is used in {@link isAutoSizeCell}.
   * @default false
   */
  autoSizeCells: boolean = false;

  /**
   * Specifies if autoSize style should be applied when cells are added.
   * @default false
   */
  autoSizeCellsOnAdd: boolean = false;

  /**
   * Specifies the return value for {@link isCellLocked}.
   * @default false
   */
  cellsLocked: boolean = false;

  /**
   * Specifies the return value for {@link isCellCloneable}.
   * @default true
   */
  cellsCloneable: boolean = true;

  /**
   * Specifies the return value for {@link isCellDeletable}.
   * @default true
   */
  cellsDeletable: boolean = true;

  /**
   * Specifies the return value for {@link isCellMovable}.
   * @default true
   */
  cellsMovable: boolean = true;

  /**
   * Specifies if a parent should contain the child bounds after a resize of
   * the child. This has precedence over {@link constrainChildren}.
   * @default true
   */
  extendParents: boolean = true;

  /**
   * Specifies if parents should be extended according to the {@link extendParents}
   * switch if cells are added.
   * @default true
   */
  extendParentsOnAdd: boolean = true;

  /**
   * Specifies if parents should be extended according to the {@link extendParents}
   * switch if cells are added.
   * @default false (for backwards compatibility)
   */
  extendParentsOnMove: boolean = false;

  /**
   * Returns the bounding box for the given array of {@link Cell}. The bounding box for
   * each cell and its descendants is computed using {@link view.getBoundingBox}.
   *
   * @param cells Array of {@link Cell} whose bounding box should be returned.
   */
  getBoundingBox(cells: CellArray): Rectangle {
    let result = null;

    if (cells.length > 0) {
      for (const cell of cells) {
        if (cell.isVertex() || cell.isEdge()) {
          const bbox = this.graph.view.getBoundingBox(
            this.graph.view.getState(cell),
            true
          );

          if (bbox != null) {
            if (result == null) {
              result = Rectangle.fromRectangle(bbox);
            } else {
              result.add(bbox);
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Removes all cached information for the given cell and its descendants.
   * This is called when a cell was removed from the model.
   *
   * Paramters:
   *
   * @param cell {@link mxCell} that was removed from the model.
   */
  removeStateForCell(cell: Cell): void {
    for (const child of cell.getChildren()) {
      this.removeStateForCell(child);
    }
    this.graph.view.invalidate(cell, false, true);
    this.graph.view.removeState(cell);
  }

  /*****************************************************************************
   * Group: Cell styles
   *****************************************************************************/

  /**
   * Returns the style for the given cell from the cell state, if one exists,
   * or using {@link getCellStyle}.
   *
   * @param cell {@link mxCell} whose style should be returned as an array.
   * @param ignoreState Optional boolean that specifies if the cell state should be ignored.
   */
  getCurrentCellStyle(cell: Cell, ignoreState: boolean = false): StyleMap {
    const state = ignoreState ? null : this.graph.view.getState(cell);
    return state != null ? state.style : this.getCellStyle(cell);
  }

  /**
   * Returns an array of key, value pairs representing the cell style for the
   * given cell. If no string is defined in the model that specifies the
   * style, then the default style for the cell is returned or an empty object,
   * if no style can be found. Note: You should try and get the cell state
   * for the given cell and use the cached style in the state before using
   * this method.
   *
   * @param cell {@link mxCell} whose style should be returned as an array.
   */
  getCellStyle(cell: Cell): StyleMap {
    const stylename = cell.getStyle();
    let style;
    const stylesheet = <Stylesheet>this.graph.stylesheet;

    // Gets the default style for the cell
    if (cell.isEdge()) {
      style = stylesheet.getDefaultEdgeStyle();
    } else {
      style = stylesheet.getDefaultVertexStyle();
    }

    // Resolves the stylename using the above as the default
    if (stylename != null) {
      style = this.postProcessCellStyle(stylesheet.getCellStyle(stylename, style));
    }

    // Returns a non-null value if no style can be found
    if (style == null) {
      style = new StyleMap();
    }
    return style;
  }

  /**
   * Tries to resolve the value for the image style in the image bundles and
   * turns short data URIs as defined in mxImageBundle to data URIs as
   * defined in RFC 2397 of the IETF.
   */
  postProcessCellStyle(style: StyleMap): StyleMap {
    const key = style.image;
    let image = this.graph.image.getImageFromBundles(key);

    if (image != null) {
      style.image = image;
    } else {
      image = key;
    }

    // Converts short data uris to normal data uris
    if (image != null && image.substring(0, 11) === 'data:image/') {
      if (image.substring(0, 20) === 'data:image/svg+xml,<') {
        // Required for FF and IE11
        image = image.substring(0, 19) + encodeURIComponent(image.substring(19));
      } else if (image.substring(0, 22) !== 'data:image/svg+xml,%3C') {
        const comma = image.indexOf(',');

        // Adds base64 encoding prefix if needed
        if (comma > 0 && image.substring(comma - 7, comma + 1) !== ';base64,') {
          image = `${image.substring(0, comma)};base64,${image.substring(comma + 1)}`;
        }
      }

      style.image = image;
    }
    return style;
  }

  /**
   * Sets the style of the specified cells. If no cells are given, then the
   * selection cells are changed.
   *
   * @param style String representing the new style of the cells.
   * @param cells Optional array of {@link Cell} to set the style for. Default is the
   * selection cells.
   */
  setCellStyle(style: any, cells: CellArray = this.graph.selection.getSelectionCells()) {
    this.graph.batchUpdate(() => {
      for (const cell of cells) {
        this.graph.model.setStyle(cell, style);
      }
    });
  }

  /**
   * Toggles the boolean value for the given key in the style of the given cell
   * and returns the new value as 0 or 1. If no cell is specified then the
   * selection cell is used.
   *
   * Parameter:
   *
   * @param key String representing the key for the boolean value to be toggled.
   * @param defaultValue Optional boolean default value if no value is defined.
   * Default is `false`.
   * @param cell Optional {@link Cell} whose style should be modified. Default is
   * the selection cell.
   */
  toggleCellStyle(
    key: string,
    defaultValue: boolean = false,
    cell: Cell = this.graph.selection.getSelectionCell()
  ) {
    return this.toggleCellStyles(key, defaultValue, new CellArray(cell));
  }

  /**
   * Toggles the boolean value for the given key in the style of the given cells
   * and returns the new value as 0 or 1. If no cells are specified, then the
   * selection cells are used. For example, this can be used to toggle
   * {@link 'rounded'} or any other style with a boolean value.
   *
   * Parameter:
   *
   * @param key String representing the key for the boolean value to be toggled.
   * @param defaultValue Optional boolean default value if no value is defined.
   * Default is `false`.
   * @param cells Optional array of {@link Cell} whose styles should be modified.
   * Default is the selection cells.
   */
  toggleCellStyles(
    key: string,
    defaultValue: boolean = false,
    cells: CellArray = this.graph.selection.getSelectionCells()
  ) {
    let value = null;

    if (cells != null && cells.length > 0) {
      const style = this.getCurrentCellStyle(<Cell>cells[0]);
      value = getValue(style, key, defaultValue) ? 0 : 1;
      this.setCellStyles(key, value, cells);
    }
    return value;
  }

  /**
   * Sets the key to value in the styles of the given cells. This will modify
   * the existing cell styles in-place and override any existing assignment
   * for the given key. If no cells are specified, then the selection cells
   * are changed. If no value is specified, then the respective key is
   * removed from the styles.
   *
   * @param key String representing the key to be assigned.
   * @param value String representing the new value for the key.
   * @param cells Optional array of {@link Cell} to change the style for. Default is
   * the selection cells.
   */
  setCellStyles(
    key: string,
    value: string | number | null = null,
    cells: CellArray = this.graph.selection.getSelectionCells()
  ): void {
    setCellStyles(this.graph.model, cells, key, value);
  }

  /**
   * Toggles the given bit for the given key in the styles of the specified
   * cells.
   *
   * @param key String representing the key to toggle the flag in.
   * @param flag Integer that represents the bit to be toggled.
   * @param cells Optional array of {@link Cell} to change the style for. Default is
   * the selection cells.
   */
  // toggleCellStyleFlags(key: string, flag: number, cells?: mxCellArray): void;
  toggleCellStyleFlags(
    key: string,
    flag: number,
    cells: CellArray = this.graph.selection.getSelectionCells()
  ) {
    this.setCellStyleFlags(key, flag, null, cells);
  }

  /**
   * Sets or toggles the given bit for the given key in the styles of the
   * specified cells.
   *
   * @param key String representing the key to toggle the flag in.
   * @param flag Integer that represents the bit to be toggled.
   * @param value Boolean value to be used or null if the value should be toggled.
   * @param cells Optional array of {@link Cell} to change the style for. Default is
   * the selection cells.
   */
  // setCellStyleFlags(key: string, flag: number, value: boolean, cells?: mxCellArray): void;
  setCellStyleFlags(
    key: string,
    flag: number,
    value: boolean | null = null,
    cells: CellArray = this.graph.selection.getSelectionCells()
  ) {
    if (cells != null && cells.length > 0) {
      if (value == null) {
        const style = this.getCurrentCellStyle(cells[0]);
        // @ts-ignore
        const current = parseInt(style[key] || 0);
        value = !((current & flag) === flag);
      }
      setCellStyleFlags(this.graph.model, cells, key, flag, value);
    }
  }

  /*****************************************************************************
   * Group: Cell alignment and orientation
   *****************************************************************************/

  /**
   * Aligns the given cells vertically or horizontally according to the given
   * alignment using the optional parameter as the coordinate.
   *
   * @param align Specifies the alignment. Possible values are all constants in
   * mxConstants with an ALIGN prefix.
   * @param cells Array of {@link Cell} to be aligned.
   * @param param Optional coordinate for the alignment.
   */
  alignCells(align: string, cells: CellArray, param: number | null = null): CellArray {
    if (cells == null) {
      cells = this.graph.selection.getSelectionCells();
    }

    if (cells != null && cells.length > 1) {
      // Finds the required coordinate for the alignment
      if (param == null) {
        for (const cell of cells) {
          const state = this.graph.view.getState(cell);

          if (state != null && !cell.isEdge()) {
            if (param == null) {
              if (align === ALIGN_CENTER) {
                param = state.x + state.width / 2;
                break;
              } else if (align === ALIGN_RIGHT) {
                param = state.x + state.width;
              } else if (align === ALIGN_TOP) {
                param = state.y;
              } else if (align === ALIGN_MIDDLE) {
                param = state.y + state.height / 2;
                break;
              } else if (align === ALIGN_BOTTOM) {
                param = state.y + state.height;
              } else {
                param = state.x;
              }
            } else if (align === ALIGN_RIGHT) {
              param = Math.max(param, state.x + state.width);
            } else if (align === ALIGN_TOP) {
              param = Math.min(param, state.y);
            } else if (align === ALIGN_BOTTOM) {
              param = Math.max(param, state.y + state.height);
            } else {
              param = Math.min(param, state.x);
            }
          }
        }
      }

      // Aligns the cells to the coordinate
      if (param != null) {
        const s = this.graph.view.scale;

        this.graph.batchUpdate(() => {
          for (const cell of cells) {
            const state = this.graph.view.getState(cell);

            if (state != null) {
              let geo = cell.getGeometry();

              if (geo != null && !cell.isEdge()) {
                geo = <Geometry>geo.clone();

                if (align === ALIGN_CENTER) {
                  geo.x += (param - state.x - state.width / 2) / s;
                } else if (align === ALIGN_RIGHT) {
                  geo.x += (param - state.x - state.width) / s;
                } else if (align === ALIGN_TOP) {
                  geo.y += (param - state.y) / s;
                } else if (align === ALIGN_MIDDLE) {
                  geo.y += (param - state.y - state.height / 2) / s;
                } else if (align === ALIGN_BOTTOM) {
                  geo.y += (param - state.y - state.height) / s;
                } else {
                  geo.x += (param - state.x) / s;
                }

                this.resizeCell(cell, geo);
              }
            }
          }

          this.graph.fireEvent(
            new EventObject(InternalEvent.ALIGN_CELLS, { align, cells })
          );
        });
      }
    }

    return cells;
  }

  /*****************************************************************************
   * Group: Cell cloning, insertion and removal
   *****************************************************************************/

  /**
   * Returns the clone for the given cell. Uses {@link cloneCells}.
   *
   * @param cell {@link mxCell} to be cloned.
   * @param allowInvalidEdges Optional boolean that specifies if invalid edges
   * should be cloned. Default is `true`.
   * @param mapping Optional mapping for existing clones.
   * @param keepPosition Optional boolean indicating if the position of the cells should
   * be updated to reflect the lost parent cell. Default is `false`.
   */
  // cloneCell(cell: mxCell, allowInvalidEdges?: boolean, mapping?: any, keepPosition?: boolean): mxCellArray;
  cloneCell(
    cell: Cell,
    allowInvalidEdges: boolean = false,
    mapping: any = null,
    keepPosition: boolean = false
  ): Cell {
    return (<CellArray>(
      this.cloneCells(new CellArray(cell), allowInvalidEdges, mapping, keepPosition)
    ))[0];
  }

  /**
   * Returns the clones for the given cells. The clones are created recursively
   * using {@link mxGraphModel.cloneCells}. If the terminal of an edge is not in the
   * given array, then the respective end is assigned a terminal point and the
   * terminal is removed.
   *
   * @param cells Array of {@link Cell} to be cloned.
   * @param allowInvalidEdges Optional boolean that specifies if invalid edges
   * should be cloned. Default is `true`.
   * @param mapping Optional mapping for existing clones.
   * @param keepPosition Optional boolean indicating if the position of the cells should
   * be updated to reflect the lost parent cell. Default is `false`.
   */
  // cloneCells(cells: mxCellArray, allowInvalidEdges?: boolean, mapping?: any, keepPosition?: boolean): mxCellArray;
  cloneCells(
    cells: CellArray,
    allowInvalidEdges: boolean = true,
    mapping: any = {},
    keepPosition: boolean = false
  ): CellArray | null {
    allowInvalidEdges = allowInvalidEdges != null ? allowInvalidEdges : true;
    let clones;

    // Creates a dictionary for fast lookups
    const dict = new Dictionary();
    const tmp = [];

    for (const cell of cells) {
      dict.put(cell, true);
      tmp.push(cell);
    }

    if (tmp.length > 0) {
      const { scale } = this.graph.view;
      const trans = this.graph.view.translate;
      const out: CellArray = new CellArray();
      clones = cells.cloneCells(true, mapping);

      for (let i = 0; i < cells.length; i += 1) {
        const cell = cells[i];
        const clone = clones[i];

        if (
          !allowInvalidEdges &&
          clone.isEdge() &&
          this.getEdgeValidationError(
            clone,
            clone.getTerminal(true),
            clone.getTerminal(false)
          ) != null
        ) {
          //clones[i] = null;
        } else {
          out.push(clone);
          const g = clone.getGeometry();

          if (g != null) {
            const state = this.graph.view.getState(cell);
            const pstate = this.graph.view.getState(cell.getParent());

            if (state != null && pstate != null) {
              const dx = keepPosition ? 0 : (<Point>pstate.origin).x;
              const dy = keepPosition ? 0 : (<Point>pstate.origin).y;

              if (clone.isEdge()) {
                const pts = <Point[]>state.absolutePoints;

                if (pts != null) {
                  // Checks if the source is cloned or sets the terminal point
                  let src = cell.getTerminal(true);

                  while (src != null && !dict.get(src)) {
                    src = src.getParent();
                  }

                  if (src == null && pts[0] != null) {
                    g.setTerminalPoint(
                      new Point(pts[0].x / scale - trans.x, pts[0].y / scale - trans.y),
                      true
                    );
                  }

                  // Checks if the target is cloned or sets the terminal point
                  let trg = cell.getTerminal(false);
                  while (trg != null && !dict.get(trg)) {
                    trg = trg.getParent();
                  }

                  const n = pts.length - 1;

                  if (trg == null && pts[n] != null) {
                    g.setTerminalPoint(
                      new Point(pts[n].x / scale - trans.x, pts[n].y / scale - trans.y),
                      false
                    );
                  }

                  // Translates the control points
                  const { points } = g;
                  if (points != null) {
                    for (const point of points) {
                      point.x += dx;
                      point.y += dy;
                    }
                  }
                }
              } else {
                g.translate(dx, dy);
              }
            }
          }
        }
      }
      clones = out;
    } else {
      clones = new CellArray();
    }
    return clones;
  }

  /**
   * Adds the cell to the parent and connects it to the given source and
   * target terminals. This is a shortcut method. Returns the cell that was
   * added.
   *
   * @param cell {@link mxCell} to be inserted into the given parent.
   * @param parent {@link mxCell} that represents the new parent. If no parent is
   * given then the default parent is used.
   * @param index Optional index to insert the cells at. Default is 'to append'.
   * @param source Optional {@link Cell} that represents the source terminal.
   * @param target Optional {@link Cell} that represents the target terminal.
   */
  addCell(
    cell: Cell,
    parent: Cell | null = null,
    index: number | null = null,
    source: Cell | null = null,
    target: Cell | null = null
  ): Cell {
    return this.addCells(new CellArray(cell), parent, index, source, target)[0];
  }

  /**
   * Function: addCells
   *
   * Adds the cells to the parent at the given index, connecting each cell to
   * the optional source and target terminal. The change is carried out using
   * <cellsAdded>. This method fires <mxEvent.ADD_CELLS> while the
   * transaction is in progress. Returns the cells that were added.
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be inserted.
   * parent - <mxCell> that represents the new parent. If no parent is
   * given then the default parent is used.
   * index - Optional index to insert the cells at. Default is to append.
   * source - Optional source <mxCell> for all inserted cells.
   * target - Optional target <mxCell> for all inserted cells.
   * absolute - Optional boolean indicating of cells should be kept at
   * their absolute position. Default is false.
   */
  addCells(
    cells: CellArray,
    parent: Cell | null = null,
    index: number | null = null,
    source: Cell | null = null,
    target: Cell | null = null,
    absolute: boolean = false
  ) {
    if (parent == null) {
      parent = this.getDefaultParent();
    }

    if (index == null) {
      index = parent.getChildCount();
    }

    this.graph.batchUpdate(() => {
      this.cellsAdded(
        cells,
        parent,
        index,
        source,
        target,
        absolute != null ? absolute : false,
        true
      );
      this.graph.fireEvent(
        new EventObject(InternalEvent.ADD_CELLS, { cells, parent, index, source, target })
      );
    });

    return cells;
  }

  /**
   * Function: cellsAdded
   *
   * Adds the specified cells to the given parent. This method fires
   * <mxEvent.CELLS_ADDED> while the transaction is in progress.
   */
  cellsAdded(
    cells: CellArray,
    parent: Cell,
    index: number,
    source: Cell | null = null,
    target: Cell | null = null,
    absolute: boolean = false,
    constrain: boolean = false,
    extend: boolean = true
  ): void {
    this.graph.batchUpdate(() => {
      const parentState = absolute ? this.graph.view.getState(parent) : null;
      const o1 = parentState != null ? parentState.origin : null;
      const zero = new Point(0, 0);

      cells.forEach((cell, i) => {
        if (cell == null) {
          index--;
        } else {
          const previous = cell.getParent();

          // Keeps the cell at its absolute location
          if (o1 != null && cell !== parent && parent !== previous) {
            const oldState = this.graph.view.getState(previous);
            const o2 = <Point>(oldState != null ? oldState.origin : zero);
            let geo = cell.getGeometry();

            if (geo != null) {
              const dx = o2.x - o1.x;
              const dy = o2.y - o1.y;

              // FIXME: Cells should always be inserted first before any other edit
              // to avoid forward references in sessions.
              geo = <Geometry>geo.clone();
              geo.translate(dx, dy);

              if (
                !geo.relative &&
                cell.isVertex() &&
                !this.isAllowNegativeCoordinates()
              ) {
                geo.x = Math.max(0, geo.x);
                geo.y = Math.max(0, geo.y);
              }

              this.graph.model.setGeometry(cell, geo);
            }
          }

          // Decrements all following indices
          // if cell is already in parent
          if (parent === previous && index + i > parent.getChildCount()) {
            index--;
          }

          this.graph.model.add(parent, cell, index + i);

          if (this.autoSizeCellsOnAdd) {
            this.autoSizeCell(cell, true);
          }

          // Extends the parent or constrains the child
          if (
            (extend == null || extend) &&
            this.isExtendParentsOnAdd(cell) &&
            this.isExtendParent(cell)
          ) {
            this.extendParent(cell);
          }

          // Additionally constrains the child after extending the parent
          if (constrain == null || constrain) {
            this.constrainChild(cell);
          }

          // Sets the source terminal
          if (source != null) {
            this.cellConnected(cell, source, true);
          }

          // Sets the target terminal
          if (target != null) {
            this.cellConnected(cell, target, false);
          }
        }
      });

      this.graph.fireEvent(
        new EventObject(InternalEvent.CELLS_ADDED, {
          cells,
          parent,
          index,
          source,
          target,
          absolute,
        })
      );
    });
  }

  /**
   * Resizes the specified cell to just fit around the its label and/or children
   *
   * @param cell {@link mxCell} to be resized.
   * @param recurse Optional boolean which specifies if all descendants should be
   * autosized. Default is `true`.
   */
  autoSizeCell(cell: Cell, recurse: boolean = true) {
    if (recurse) {
      for (const child of cell.getChildren()) {
        this.autoSizeCell(child);
      }
    }

    if (cell.isVertex() && this.isAutoSizeCell(cell)) {
      this.updateCellSize(cell);
    }
  }

  /**
   * Removes the given cells from the graph including all connected edges if
   * includeEdges is true. The change is carried out using {@link cellsRemoved}.
   * This method fires {@link InternalEvent.REMOVE_CELLS} while the transaction is in
   * progress. The removed cells are returned as an array.
   *
   * @param cells Array of {@link Cell} to remove. If null is specified then the
   * selection cells which are deletable are used.
   * @param includeEdges Optional boolean which specifies if all connected edges
   * should be removed as well. Default is `true`.
   */
  removeCells(
    cells: CellArray | null = null,
    includeEdges: boolean = true
  ): CellArray | null {
    includeEdges = includeEdges != null ? includeEdges : true;

    if (cells == null) {
      cells = <CellArray>this.getDeletableCells(this.graph.selection.getSelectionCells());
    }

    // Adds all edges to the cells
    if (includeEdges) {
      // FIXME: Remove duplicate cells in result or do not add if
      // in cells or descendant of cells
      cells = this.getDeletableCells(this.addAllEdges(cells));
    } else {
      cells = cells.slice();

      // Removes edges that are currently not
      // visible as those cannot be updated
      const edges = <CellArray>this.getDeletableCells(this.graph.edge.getAllEdges(cells));
      const dict = new Dictionary();

      for (const cell of cells) {
        dict.put(cell, true);
      }

      for (const edge of edges) {
        if (this.graph.view.getState(edge) == null && !dict.get(edge)) {
          dict.put(edge, true);
          cells.push(edge);
        }
      }
    }

    this.graph.batchUpdate(() => {
      this.cellsRemoved(<CellArray>cells);
      this.graph.fireEvent(
        new EventObject(InternalEvent.REMOVE_CELLS, { cells, includeEdges })
      );
    });

    return cells;
  }

  /**
   * Removes the given cells from the model. This method fires
   * {@link InternalEvent.CELLS_REMOVED} while the transaction is in progress.
   *
   * @param cells Array of {@link Cell} to remove.
   */
  cellsRemoved(cells: CellArray): void {
    if (cells.length > 0) {
      const { scale } = this.graph.view;
      const tr = this.graph.view.translate;

      this.graph.batchUpdate(() => {
        // Creates hashtable for faster lookup
        const dict = new Dictionary();

        for (const cell of cells) {
          dict.put(cell, true);
        }

        for (const cell of cells) {
          // Disconnects edges which are not being removed
          const edges = this.getAllEdges(new CellArray(cell));

          const disconnectTerminal = (edge: Cell, source: boolean) => {
            let geo = edge.getGeometry();

            if (geo != null) {
              // Checks if terminal is being removed
              const terminal = edge.getTerminal(source);
              let connected = false;
              let tmp = terminal;

              while (tmp != null) {
                if (cell === tmp) {
                  connected = true;
                  break;
                }
                tmp = tmp.getParent();
              }

              if (connected) {
                geo = <Geometry>geo.clone();
                const state = this.graph.view.getState(edge);

                if (state != null && state.absolutePoints != null) {
                  const pts = <Point[]>state.absolutePoints;
                  const n = source ? 0 : pts.length - 1;

                  geo.setTerminalPoint(
                    new Point(
                      pts[n].x / scale - tr.x - (<Point>state.origin).x,
                      pts[n].y / scale - tr.y - (<Point>state.origin).y
                    ),
                    source
                  );
                } else {
                  // Fallback to center of terminal if routing
                  // points are not available to add new point
                  // KNOWN: Should recurse to find parent offset
                  // of edge for nested groups but invisible edges
                  // should be removed in removeCells step
                  const tstate = this.graph.view.getState(terminal);

                  if (tstate != null) {
                    geo.setTerminalPoint(
                      new Point(
                        tstate.getCenterX() / scale - tr.x,
                        tstate.getCenterY() / scale - tr.y
                      ),
                      source
                    );
                  }
                }

                this.graph.model.setGeometry(edge, geo);
                this.graph.model.setTerminal(edge, null, source);
              }
            }
          };

          for (const edge of edges) {
            if (!dict.get(edge)) {
              dict.put(edge, true);
              disconnectTerminal(edge, true);
              disconnectTerminal(edge, false);
            }
          }

          this.graph.model.remove(cell);
        }

        this.graph.fireEvent(new EventObject(InternalEvent.CELLS_REMOVED, { cells }));
      });
    }
  }

  /*****************************************************************************
   * Group: Cell visibility
   *****************************************************************************/

  /**
   * Sets the visible state of the specified cells and all connected edges
   * if includeEdges is true. The change is carried out using {@link cellsToggled}.
   * This method fires {@link InternalEvent.TOGGLE_CELLS} while the transaction is in
   * progress. Returns the cells whose visible state was changed.
   *
   * @param show Boolean that specifies the visible state to be assigned.
   * @param cells Array of {@link Cell} whose visible state should be changed. If
   * null is specified then the selection cells are used.
   * @param includeEdges Optional boolean indicating if the visible state of all
   * connected edges should be changed as well. Default is `true`.
   */
  toggleCells(
    show: boolean = false,
    cells: CellArray = this.getSelectionCells(),
    includeEdges: boolean = true
  ): CellArray | null {
    // Adds all connected edges recursively
    if (includeEdges) {
      cells = this.addAllEdges(cells);
    }

    this.graph.batchUpdate(() => {
      this.cellsToggled(cells, show);
      this.graph.fireEvent(
        new EventObject(InternalEvent.TOGGLE_CELLS, { show, cells, includeEdges })
      );
    });
    return cells;
  }

  /**
   * Sets the visible state of the specified cells.
   *
   * @param cells Array of {@link Cell} whose visible state should be changed.
   * @param show Boolean that specifies the visible state to be assigned.
   */
  cellsToggled(cells: CellArray, show: boolean = false): void {
    if (cells.length > 0) {
      this.graph.batchUpdate(() => {
        for (const cell of cells) {
          this.graph.model.setVisible(cell, show);
        }
      });
    }
  }

  /*****************************************************************************
   * Group: Cell sizing
   *****************************************************************************/

  /**
   * Updates the size of the given cell in the model using {@link cellSizeUpdated}.
   * This method fires {@link InternalEvent.UPDATE_CELL_SIZE} while the transaction is in
   * progress. Returns the cell whose size was updated.
   *
   * @param cell {@link mxCell} whose size should be updated.
   */
  updateCellSize(cell: Cell, ignoreChildren: boolean = false): Cell {
    this.graph.batchUpdate(() => {
      this.cellSizeUpdated(cell, ignoreChildren);
      this.graph.fireEvent(
        new EventObject(InternalEvent.UPDATE_CELL_SIZE, { cell, ignoreChildren })
      );
    });
    return cell;
  }

  /**
   * Updates the size of the given cell in the model using
   * {@link getPreferredSizeForCell} to get the new size.
   *
   * @param cell {@link mxCell} for which the size should be changed.
   */
  cellSizeUpdated(cell: Cell, ignoreChildren: boolean = false): void {
    this.graph.batchUpdate(() => {
      const size = this.getPreferredSizeForCell(cell);
      let geo = cell.getGeometry();

      if (size != null && geo != null) {
        const collapsed = cell.isCollapsed();
        geo = <Geometry>geo.clone();

        if (this.graph.swimlane.isSwimlane(cell)) {
          const style = this.getCellStyle(cell);
          let cellStyle = cell.getStyle();

          if (cellStyle == null) {
            cellStyle = '';
          }

          if (getValue(style, 'horizontal', true)) {
            cellStyle = setStyle(cellStyle, 'startSize', size.height + 8);

            if (collapsed) {
              geo.height = size.height + 8;
            }

            geo.width = size.width;
          } else {
            cellStyle = setStyle(cellStyle, 'startSize', size.width + 8);

            if (collapsed) {
              geo.width = size.width + 8;
            }

            geo.height = size.height;
          }

          this.graph.model.setStyle(cell, cellStyle);
        } else {
          const state = this.graph.view.createState(cell);
          const align = state.style.align || ALIGN_CENTER;

          if (align === ALIGN_RIGHT) {
            geo.x += geo.width - size.width;
          } else if (align === ALIGN_CENTER) {
            geo.x += Math.round((geo.width - size.width) / 2);
          }

          const valign = state.getVerticalAlign();

          if (valign === ALIGN_BOTTOM) {
            geo.y += geo.height - size.height;
          } else if (valign === ALIGN_MIDDLE) {
            geo.y += Math.round((geo.height - size.height) / 2);
          }

          geo.width = size.width;
          geo.height = size.height;
        }

        if (!ignoreChildren && !collapsed) {
          const bounds = this.graph.view.getBounds(cell.getChildren());

          if (bounds != null) {
            const tr = this.graph.view.translate;
            const { scale } = this.view;

            const width = (bounds.x + bounds.width) / scale - geo.x - tr.x;
            const height = (bounds.y + bounds.height) / scale - geo.y - tr.y;

            geo.width = Math.max(geo.width, width);
            geo.height = Math.max(geo.height, height);
          }
        }

        this.cellsResized(new CellArray(cell), [geo], false);
      }
    });
  }

  /**
   * Returns the preferred width and height of the given {@link Cell} as an
   * {@link Rectangle}. To implement a minimum width, add a new style eg.
   * minWidth in the vertex and override this method as follows.
   *
   * ```javascript
   * var graphGetPreferredSizeForCell = graph.getPreferredSizeForCell;
   * graph.getPreferredSizeForCell = function(cell)
   * {
   *   var result = graphGetPreferredSizeForCell.apply(this, arguments);
   *   var style = this.getCellStyle(cell);
   *
   *   if (style.minWidth > 0)
   *   {
   *     result.width = Math.max(style.minWidth, result.width);
   *   }
   *
   *   return result;
   * };
   * ```
   *
   * @param cell {@link mxCell} for which the preferred size should be returned.
   * @param textWidth Optional maximum text width for word wrapping.
   */
  getPreferredSizeForCell(cell: Cell, textWidth: number | null = null): Rectangle | null {
    let result = null;

    const state = this.graph.view.createState(cell);
    const { style } = state;

    if (!cell.isEdge()) {
      const fontSize = style.fontSize || DEFAULT_FONTSIZE;
      let dx = 0;
      let dy = 0;

      // Adds dimension of image if shape is a label
      if (state.getImage() != null || style.image != null) {
        if (style.shape === SHAPE_LABEL) {
          if (style.verticalAlign === ALIGN_MIDDLE) {
            dx += parseFloat(style.imageWidth) || new Label().imageSize;
          }

          if (style.align !== ALIGN_CENTER) {
            dy += parseFloat(style.imageHeight) || new Label().imageSize;
          }
        }
      }

      // Adds spacings
      dx += 2 * (style.spacing || 0);
      dx += style.spacingLeft || 0;
      dx += style.spacingRight || 0;

      dy += 2 * (style.spacing || 0);
      dy += style.spacingTop || 0;
      dy += style.spacingBottom || 0;

      // Add spacing for collapse/expand icon
      // LATER: Check alignment and use constants
      // for image spacing
      const image = this.getFoldingImage(state);

      if (image != null) {
        dx += image.width + 8;
      }

      // Adds space for label
      let value = <string>this.cellRenderer.getLabelValue(state);

      if (value != null && value.length > 0) {
        if (!this.isHtmlLabel(<Cell>state.cell)) {
          value = htmlEntities(value, false);
        }

        value = value.replace(/\n/g, '<br>');

        const size = getSizeForString(
          value,
          fontSize,
          style.fontFamily,
          textWidth,
          style.fontStyle
        );
        let width = size.width + dx;
        let height = size.height + dy;

        if (!getValue(style, 'horizontal', true)) {
          const tmp = height;
          height = width;
          width = tmp;
        }

        if (this.gridEnabled) {
          width = this.snap(width + this.gridSize / 2);
          height = this.snap(height + this.gridSize / 2);
        }

        result = new Rectangle(0, 0, width, height);
      } else {
        const gs2 = 4 * this.gridSize;
        result = new Rectangle(0, 0, gs2, gs2);
      }
    }

    return result;
  }

  /**
   * Sets the bounds of the given cell using {@link resizeCells}. Returns the
   * cell which was passed to the function.
   *
   * @param cell {@link mxCell} whose bounds should be changed.
   * @param bounds {@link mxRectangle} that represents the new bounds.
   */
  resizeCell(cell: Cell, bounds: Rectangle, recurse: boolean = false): Cell {
    return this.resizeCells(new CellArray(cell), [bounds], recurse)[0];
  }

  /**
   * Sets the bounds of the given cells and fires a {@link InternalEvent.RESIZE_CELLS}
   * event while the transaction is in progress. Returns the cells which
   * have been passed to the function.
   *
   * @param cells Array of {@link Cell} whose bounds should be changed.
   * @param bounds Array of {@link mxRectangles} that represent the new bounds.
   */
  resizeCells(
    cells: CellArray,
    bounds: Rectangle[],
    recurse: boolean = this.isRecursiveResize()
  ): CellArray {
    this.graph.batchUpdate(() => {
      const prev = this.cellsResized(cells, bounds, recurse);
      this.graph.fireEvent(
        new EventObject(InternalEvent.RESIZE_CELLS, { cells, bounds, prev })
      );
    });
    return cells;
  }

  /**
   * Sets the bounds of the given cells and fires a {@link InternalEvent.CELLS_RESIZED}
   * event. If {@link extendParents} is true, then the parent is extended if a
   * child size is changed so that it overlaps with the parent.
   *
   * The following example shows how to control group resizes to make sure
   * that all child cells stay within the group.
   *
   * ```javascript
   * graph.addListener(mxEvent.CELLS_RESIZED, function(sender, evt)
   * {
   *   var cells = evt.getProperty('cells');
   *
   *   if (cells != null)
   *   {
   *     for (var i = 0; i < cells.length; i++)
   *     {
   *       if (graph.getModel().getChildCount(cells[i]) > 0)
   *       {
   *         var geo = cells[i].getGeometry();
   *
   *         if (geo != null)
   *         {
   *           var children = graph.getChildCells(cells[i], true, true);
   *           var bounds = graph.getBoundingBoxFromGeometry(children, true);
   *
   *           geo = geo.clone();
   *           geo.width = Math.max(geo.width, bounds.width);
   *           geo.height = Math.max(geo.height, bounds.height);
   *
   *           graph.getModel().setGeometry(cells[i], geo);
   *         }
   *       }
   *     }
   *   }
   * });
   * ```
   *
   * @param cells Array of {@link Cell} whose bounds should be changed.
   * @param bounds Array of {@link mxRectangles} that represent the new bounds.
   * @param recurse Optional boolean that specifies if the children should be resized.
   */
  cellsResized(
    cells: CellArray,
    bounds: Rectangle[],
    recurse: boolean = false
  ): (Geometry | null)[] {
    const prev = [];

    if (cells.length === bounds.length) {
      this.graph.batchUpdate(() => {
        cells.forEach((cell, i) => {
          prev.push(this.cellResized(cell, bounds[i], false, recurse));

          if (this.isExtendParent(cell)) {
            this.extendParent(cell);
          }

          this.constrainChild(cell);
        });

        if (this.resetEdgesOnResize) {
          this.resetEdges(cells);
        }

        this.graph.fireEvent(
          new EventObject(InternalEvent.CELLS_RESIZED, { cells, bounds, prev })
        );
      });
    }
    return prev;
  }

  /**
   * Resizes the parents recursively so that they contain the complete area
   * of the resized child cell.
   *
   * @param cell {@link mxCell} whose bounds should be changed.
   * @param bounds {@link mxRectangles} that represent the new bounds.
   * @param ignoreRelative Boolean that indicates if relative cells should be ignored.
   * @param recurse Optional boolean that specifies if the children should be resized.
   */
  cellResized(
    cell: Cell,
    bounds: Rectangle,
    ignoreRelative: boolean = false,
    recurse: boolean = false
  ): Geometry | null {
    const prev = cell.getGeometry();

    if (
      prev != null &&
      (prev.x !== bounds.x ||
        prev.y !== bounds.y ||
        prev.width !== bounds.width ||
        prev.height !== bounds.height)
    ) {
      const geo = prev.clone();

      if (!ignoreRelative && geo.relative) {
        const { offset } = geo;

        if (offset != null) {
          offset.x += bounds.x - geo.x;
          offset.y += bounds.y - geo.y;
        }
      } else {
        geo.x = bounds.x;
        geo.y = bounds.y;
      }

      geo.width = bounds.width;
      geo.height = bounds.height;

      if (!geo.relative && cell.isVertex() && !this.isAllowNegativeCoordinates()) {
        geo.x = Math.max(0, geo.x);
        geo.y = Math.max(0, geo.y);
      }

      this.graph.batchUpdate(() => {
        if (recurse) {
          this.resizeChildCells(cell, geo);
        }

        this.graph.model.setGeometry(cell, geo);
        this.constrainChildCells(cell);
      });
    }
    return prev;
  }

  /**
   * Resizes the child cells of the given cell for the given new geometry with
   * respect to the current geometry of the cell.
   *
   * @param cell {@link mxCell} that has been resized.
   * @param newGeo {@link mxGeometry} that represents the new bounds.
   */
  resizeChildCells(cell: Cell, newGeo: Geometry): void {
    const geo = <Geometry>cell.getGeometry();
    const dx = geo.width !== 0 ? newGeo.width / geo.width : 1;
    const dy = geo.height !== 0 ? newGeo.height / geo.height : 1;

    for (const child of cell.getChildren()) {
      this.scaleCell(child, dx, dy, true);
    }
  }

  /**
   * Constrains the children of the given cell using {@link constrainChild}.
   *
   * @param cell {@link mxCell} that has been resized.
   */
  constrainChildCells(cell: Cell): void {
    for (const child of cell.getChildren()) {
      this.constrainChild(child);
    }
  }

  /**
   * Scales the points, position and size of the given cell according to the
   * given vertical and horizontal scaling factors.
   *
   * @param cell {@link mxCell} whose geometry should be scaled.
   * @param dx Horizontal scaling factor.
   * @param dy Vertical scaling factor.
   * @param recurse Boolean indicating if the child cells should be scaled.
   */
  scaleCell(cell: Cell, dx: number, dy: number, recurse: boolean = false): void {
    let geo = cell.getGeometry();

    if (geo != null) {
      const style = this.getCurrentCellStyle(cell);
      geo = <Geometry>geo.clone();

      // Stores values for restoring based on style
      const { x } = geo;
      const { y } = geo;
      const w = geo.width;
      const h = geo.height;

      geo.scale(dx, dy, style.aspect === 'fixed');

      if (style.resizeWidth == '1') {
        geo.width = w * dx;
      } else if (style.resizeWidth == '0') {
        geo.width = w;
      }

      if (style.resizeHeight == '1') {
        geo.height = h * dy;
      } else if (style.resizeHeight == '0') {
        geo.height = h;
      }

      if (!this.isCellMovable(cell)) {
        geo.x = x;
        geo.y = y;
      }

      if (!this.isCellResizable(cell)) {
        geo.width = w;
        geo.height = h;
      }

      if (cell.isVertex()) {
        this.cellResized(cell, geo, true, recurse);
      } else {
        this.graph.model.setGeometry(cell, geo);
      }
    }
  }

  /**
   * Resizes the parents recursively so that they contain the complete area
   * of the resized child cell.
   *
   * @param cell {@link mxCell} that has been resized.
   */
  extendParent(cell: Cell): void {
    const parent = <Cell>cell.getParent();
    let p = parent.getGeometry();

    if (parent != null && p != null && !parent.isCollapsed()) {
      const geo = cell.getGeometry();

      if (
        geo != null &&
        !geo.relative &&
        (p.width < geo.x + geo.width || p.height < geo.y + geo.height)
      ) {
        p = <Geometry>p.clone();

        p.width = Math.max(p.width, geo.x + geo.width);
        p.height = Math.max(p.height, geo.y + geo.height);

        this.cellsResized(new CellArray(parent), [p], false);
      }
    }
  }

  /*****************************************************************************
   * Group: Cell moving
   *****************************************************************************/

  /**
   * Clones and inserts the given cells into the graph using the move
   * method and returns the inserted cells. This shortcut is used if
   * cells are inserted via datatransfer.
   *
   * @param cells Array of {@link Cell} to be imported.
   * @param dx Integer that specifies the x-coordinate of the vector. Default is `0`.
   * @param dy Integer that specifies the y-coordinate of the vector. Default is `0`.
   * @param target {@link mxCell} that represents the new parent of the cells.
   * @param evt Mouseevent that triggered the invocation.
   * @param mapping Optional mapping for existing clones.
   */
  importCells(
    cells: CellArray,
    dx: number,
    dy: number,
    target: Cell | null = null,
    evt: InternalMouseEvent | null = null,
    mapping: any = {}
  ): CellArray | null {
    return this.moveCells(cells, dx, dy, true, target, evt, mapping);
  }

  /**
   * Function: moveCells
   *
   * Moves or clones the specified cells and moves the cells or clones by the
   * given amount, adding them to the optional target cell. The evt is the
   * mouse event as the mouse was released. The change is carried out using
   * <cellsMoved>. This method fires <mxEvent.MOVE_CELLS> while the
   * transaction is in progress. Returns the cells that were moved.
   *
   * Use the following code to move all cells in the graph.
   *
   * (code)
   * graph.moveCells(graph.getChildCells(null, true, true), 10, 10);
   * (end)
   *
   * Parameters:
   *
   * cells - Array of <mxCells> to be moved, cloned or added to the target.
   * dx - Integer that specifies the x-coordinate of the vector. Default is 0.
   * dy - Integer that specifies the y-coordinate of the vector. Default is 0.
   * clone - Boolean indicating if the cells should be cloned. Default is false.
   * target - <mxCell> that represents the new parent of the cells.
   * evt - Mouseevent that triggered the invocation.
   * mapping - Optional mapping for existing clones.
   */
  moveCells(
    cells: CellArray,
    dx: number,
    dy: number,
    clone: boolean = false,
    target: Cell | null = null,
    evt: InternalMouseEvent | null = null,
    mapping: any = null
  ): CellArray | null {
    dx = dx != null ? dx : 0;
    dy = dy != null ? dy : 0;
    clone = clone != null ? clone : false;

    // alert(`moveCells: ${cells} ${dx} ${dy} ${clone} ${target}`)

    if (dx !== 0 || dy !== 0 || clone || target != null) {
      // Removes descendants with ancestors in cells to avoid multiple moving
      cells = cells.getTopmostCells();
      const origCells = cells;

      this.graph.batchUpdate(() => {
        // Faster cell lookups to remove relative edge labels with selected
        // terminals to avoid explicit and implicit move at same time
        const dict = new Dictionary();

        for (const cell of cells) {
          dict.put(cell, true);
        }

        const isSelected = (cell: Cell | null) => {
          while (cell != null) {
            if (dict.get(cell)) {
              return true;
            }
            cell = <Cell>cell.getParent();
          }
          return false;
        };

        // Removes relative edge labels with selected terminals
        const checked = new CellArray();

        for (const cell of cells) {
          const geo = cell.getGeometry();
          const parent = cell.getParent();

          if (
            geo == null ||
            !geo.relative ||
            (parent && !parent.isEdge()) ||
            (parent &&
              !isSelected(parent.getTerminal(true)) &&
              !isSelected(parent.getTerminal(false)))
          ) {
            checked.push(cell);
          }
        }

        cells = checked;

        if (clone) {
          cells = <CellArray>this.cloneCells(cells, this.isCloneInvalidEdges(), mapping);

          if (target == null) {
            target = this.getDefaultParent();
          }
        }

        // FIXME: Cells should always be inserted first before any other edit
        // to avoid forward references in sessions.
        // Need to disable allowNegativeCoordinates if target not null to
        // allow for temporary negative numbers until cellsAdded is called.
        const previous = this.isAllowNegativeCoordinates();

        if (target != null) {
          this.setAllowNegativeCoordinates(true);
        }

        this.cellsMoved(
          cells,
          dx,
          dy,
          !clone && this.isDisconnectOnMove() && this.isAllowDanglingEdges(),
          target == null,
          this.isExtendParentsOnMove() && target == null
        );

        this.setAllowNegativeCoordinates(previous);

        if (target != null) {
          const index = target.getChildCount();
          this.cellsAdded(cells, target, index, null, null, true);

          // Restores parent edge on cloned edge labels
          if (clone) {
            cells.forEach((cell, i) => {
              const geo = cell.getGeometry();
              const parent = <Cell>origCells[i].getParent();

              if (
                geo != null &&
                geo.relative &&
                parent.isEdge() &&
                this.graph.model.contains(parent)
              ) {
                this.graph.model.add(parent, cell);
              }
            });
          }
        }

        // Dispatches a move event
        this.graph.fireEvent(
          new EventObject(InternalEvent.MOVE_CELLS, {
            cells,
            dx,
            dy,
            clone,
            target,
            event: evt,
          })
        );
      });
    }
    return cells;
  }

  /**
   * Function: cellsMoved
   *
   * Moves the specified cells by the given vector, disconnecting the cells
   * using disconnectGraph is disconnect is true. This method fires
   * <mxEvent.CELLS_MOVED> while the transaction is in progress.
   */
  cellsMoved(
    cells: CellArray,
    dx: number,
    dy: number,
    disconnect: boolean = false,
    constrain: boolean = false,
    extend: boolean = false
  ): void {
    if (dx !== 0 || dy !== 0) {
      this.graph.batchUpdate(() => {
        if (disconnect) {
          this.disconnectGraph(cells);
        }

        for (const cell of cells) {
          this.translateCell(cell, dx, dy);

          if (extend && this.isExtendParent(cell)) {
            this.extendParent(cell);
          } else if (constrain) {
            this.constrainChild(cell);
          }
        }

        if (this.resetEdgesOnMove) {
          this.resetEdges(cells);
        }

        this.graph.fireEvent(
          new EventObject(InternalEvent.CELLS_MOVED, { cells, dx, dy, disconnect })
        );
      });
    }
  }

  /**
   * Translates the geometry of the given cell and stores the new,
   * translated geometry in the model as an atomic change.
   */
  translateCell(cell: Cell, dx: number, dy: number): void {
    let geometry = cell.getGeometry();

    if (geometry != null) {
      dx = parseFloat(String(dx));
      dy = parseFloat(String(dy));
      geometry = <Geometry>geometry.clone();
      geometry.translate(dx, dy);

      if (!geometry.relative && cell.isVertex() && !this.isAllowNegativeCoordinates()) {
        geometry.x = Math.max(0, geometry.x);
        geometry.y = Math.max(0, geometry.y);
      }

      if (geometry.relative && !cell.isEdge()) {
        const parent = <Cell>cell.getParent();
        let angle = 0;

        if (parent.isVertex()) {
          const style = this.getCurrentCellStyle(parent);
          angle = getValue(style, 'rotation', 0);
        }

        if (angle !== 0) {
          const rad = toRadians(-angle);
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const pt = getRotatedPoint(new Point(dx, dy), cos, sin, new Point(0, 0));
          dx = pt.x;
          dy = pt.y;
        }

        if (geometry.offset == null) {
          geometry.offset = new Point(dx, dy);
        } else {
          geometry.offset.x = parseFloat(geometry.offset.x) + dx;
          geometry.offset.y = parseFloat(geometry.offset.y) + dy;
        }
      }
      this.graph.model.setGeometry(cell, geometry);
    }
  }

  /**
   * Returns the {@link Rectangle} inside which a cell is to be kept.
   *
   * @param cell {@link mxCell} for which the area should be returned.
   */
  getCellContainmentArea(cell: Cell): Rectangle | null {
    if (!cell.isEdge()) {
      const parent = cell.getParent();

      if (parent != null && parent !== this.getDefaultParent()) {
        const g = parent.getGeometry();

        if (g != null) {
          let x = 0;
          let y = 0;
          let w = g.width;
          let h = g.height;

          if (this.isSwimlane(parent)) {
            const size = this.getStartSize(parent);
            const style = this.getCurrentCellStyle(parent);
            const dir = getValue(style, 'direction', DIRECTION_EAST);
            const flipH = getValue(style, 'flipH', 0) == 1;
            const flipV = getValue(style, 'flipV', 0) == 1;

            if (dir === DIRECTION_SOUTH || dir === DIRECTION_NORTH) {
              const tmp = size.width;
              size.width = size.height;
              size.height = tmp;
            }

            if (
              (dir === DIRECTION_EAST && !flipV) ||
              (dir === DIRECTION_NORTH && !flipH) ||
              (dir === DIRECTION_WEST && flipV) ||
              (dir === DIRECTION_SOUTH && flipH)
            ) {
              x = size.width;
              y = size.height;
            }

            w -= size.width;
            h -= size.height;
          }

          return new Rectangle(x, y, w, h);
        }
      }
    }
    return null;
  }

  /**
   * Keeps the given cell inside the bounds returned by
   * {@link getCellContainmentArea} for its parent, according to the rules defined by
   * {@link getOverlap} and {@link isConstrainChild}. This modifies the cell's geometry
   * in-place and does not clone it.
   *
   * @param cell {@link mxCell} which should be constrained.
   * @param sizeFirst Specifies if the size should be changed first. Default is `true`.
   */
  constrainChild(cell: Cell, sizeFirst: boolean = true): void {
    let geo = cell.getGeometry();

    if (geo != null && (this.isConstrainRelativeChildren() || !geo.relative)) {
      const parent = cell.getParent();
      const pgeo = (<Cell>parent).getGeometry();
      let max = this.getMaximumGraphBounds();

      // Finds parent offset
      if (max != null) {
        const off = this.getBoundingBoxFromGeometry(new CellArray(<Cell>parent), false);

        if (off != null) {
          max = Rectangle.fromRectangle(max);

          max.x -= off.x;
          max.y -= off.y;
        }
      }

      if (this.isConstrainChild(cell)) {
        let tmp = this.getCellContainmentArea(cell);

        if (tmp != null) {
          const overlap = this.getOverlap(cell);

          if (overlap > 0) {
            tmp = Rectangle.fromRectangle(tmp);

            tmp.x -= tmp.width * overlap;
            tmp.y -= tmp.height * overlap;
            tmp.width += 2 * tmp.width * overlap;
            tmp.height += 2 * tmp.height * overlap;
          }

          // Find the intersection between max and tmp
          if (max == null) {
            max = tmp;
          } else {
            max = Rectangle.fromRectangle(max);
            max.intersect(tmp);
          }
        }
      }

      if (max != null) {
        const cells = new CellArray(cell);

        if (!cell.isCollapsed()) {
          const desc = cell.getDescendants();

          for (const descItem of desc) {
            if (descItem.isVisible()) {
              cells.push(descItem);
            }
          }
        }

        const bbox = this.getBoundingBoxFromGeometry(cells, false);

        if (bbox != null) {
          geo = <Geometry>geo.clone();

          // Cumulative horizontal movement
          let dx = 0;

          if (geo.width > max.width) {
            dx = geo.width - max.width;
            geo.width -= dx;
          }

          if (bbox.x + bbox.width > max.x + max.width) {
            dx -= bbox.x + bbox.width - max.x - max.width - dx;
          }

          // Cumulative vertical movement
          let dy = 0;

          if (geo.height > max.height) {
            dy = geo.height - max.height;
            geo.height -= dy;
          }

          if (bbox.y + bbox.height > max.y + max.height) {
            dy -= bbox.y + bbox.height - max.y - max.height - dy;
          }

          if (bbox.x < max.x) {
            dx -= bbox.x - max.x;
          }

          if (bbox.y < max.y) {
            dy -= bbox.y - max.y;
          }

          if (dx !== 0 || dy !== 0) {
            if (geo.relative) {
              // Relative geometries are moved via absolute offset
              if (geo.offset == null) {
                geo.offset = new Point();
              }

              geo.offset.x += dx;
              geo.offset.y += dy;
            } else {
              geo.x += dx;
              geo.y += dy;
            }
          }

          this.graph.model.setGeometry(cell, geo);
        }
      }
    }
  }

  /*****************************************************************************
   * Group: Cell retrieval
   *****************************************************************************/

  /**
   * Returns the visible child vertices or edges in the given parent. If
   * vertices and edges is false, then all children are returned.
   *
   * @param parent {@link mxCell} whose children should be returned.
   * @param vertices Optional boolean that specifies if child vertices should
   * be returned. Default is `false`.
   * @param edges Optional boolean that specifies if child edges should
   * be returned. Default is `false`.
   */
  getChildCells(
    parent: Cell = this.getDefaultParent(),
    vertices: boolean = false,
    edges: boolean = false
  ): CellArray {
    const cells = parent.getChildCells(vertices, edges);
    const result = new CellArray();

    // Filters out the non-visible child cells
    for (const cell of cells) {
      if (cell.isVisible()) {
        result.push(cell);
      }
    }
    return result;
  }

  /**
   * Returns the bottom-most cell that intersects the given point (x, y) in
   * the cell hierarchy starting at the given parent. This will also return
   * swimlanes if the given location intersects the content area of the
   * swimlane. If this is not desired, then the {@link hitsSwimlaneContent} may be
   * used if the returned cell is a swimlane to determine if the location
   * is inside the content area or on the actual title of the swimlane.
   *
   * @param x X-coordinate of the location to be checked.
   * @param y Y-coordinate of the location to be checked.
   * @param parent {@link mxCell} that should be used as the root of the recursion.
   * Default is current root of the view or the root of the model.
   * @param vertices Optional boolean indicating if vertices should be returned.
   * Default is `true`.
   * @param edges Optional boolean indicating if edges should be returned. Default
   * is `true`.
   * @param ignoreFn Optional function that returns true if cell should be ignored.
   * The function is passed the cell state and the x and y parameter.
   */
  getCellAt(
    x: number,
    y: number,
    parent: Cell,
    vertices: boolean = true,
    edges: boolean = true,
    ignoreFn: Function | null = null
  ): Cell | null {
    if (parent == null) {
      parent = <Cell>this.getCurrentRoot();

      if (parent == null) {
        parent = <Cell>this.graph.model.getRoot();
      }
    }

    if (parent != null) {
      const childCount = parent.getChildCount();

      for (let i = childCount - 1; i >= 0; i--) {
        const cell = <Cell>parent.getChildAt(i);
        const result = this.getCellAt(x, y, cell, vertices, edges, ignoreFn);

        if (result != null) {
          return result;
        }
        if (
          cell.isVisible() &&
          ((edges && cell.isEdge()) || (vertices && cell.isVertex()))
        ) {
          const state = this.graph.view.getState(cell);

          if (
            state != null &&
            (ignoreFn == null || !ignoreFn(state, x, y)) &&
            this.intersects(state, x, y)
          ) {
            return cell;
          }
        }
      }
    }
    return null;
  }

  /**
   * Returns the child vertices and edges of the given parent that are contained
   * in the given rectangle. The result is added to the optional result array,
   * which is returned. If no result array is specified then a new array is
   * created and returned.
   *
   * @param x X-coordinate of the rectangle.
   * @param y Y-coordinate of the rectangle.
   * @param width Width of the rectangle.
   * @param height Height of the rectangle.
   * @param parent {@link mxCell} that should be used as the root of the recursion.
   * Default is current root of the view or the root of the model.
   * @param result Optional array to store the result in.
   */
  getCells(
    x: number,
    y: number,
    width: number,
    height: number,
    parent: Cell | null = null,
    result: CellArray = new CellArray(),
    intersection: Rectangle | null = null,
    ignoreFn: Function | null = null,
    includeDescendants: boolean = false
  ): CellArray {
    if (width > 0 || height > 0 || intersection != null) {
      const model = this.graph.model;
      const right = x + width;
      const bottom = y + height;

      if (parent == null) {
        parent = this.getCurrentRoot();

        if (parent == null) {
          parent = model.getRoot();
        }
      }

      if (parent != null) {
        const childCount = parent.getChildCount();

        for (const cell of parent.getChildren()) {
          const state: CellState = <CellState>this.graph.view.getState(cell);

          if (
            state != null &&
            cell.isVisible() &&
            (ignoreFn == null || !ignoreFn(state))
          ) {
            const deg = getValue(state.style, 'rotation') || 0;

            let box: CellState | Rectangle = state; // TODO: CHECK ME!!!! ==========================================================
            if (deg != 0) {
              box = <Rectangle>getBoundingBox(box, deg);
            }

            const hit =
              (intersection != null &&
                cell.isVertex() &&
                intersects(intersection, box)) ||
              (intersection == null &&
                (cell.isEdge() || cell.isVertex()) &&
                box.x >= x &&
                box.y + box.height <= bottom &&
                box.y >= y &&
                box.x + box.width <= right);

            if (hit) {
              result.push(cell);
            }

            if (!hit || includeDescendants) {
              this.getCells(
                x,
                y,
                width,
                height,
                cell,
                result,
                intersection,
                ignoreFn,
                includeDescendants
              );
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Function: getCellsBeyond
   *
   * Returns the children of the given parent that are contained in the
   * halfpane from the given point (x0, y0) rightwards or downwards
   * depending on rightHalfpane and bottomHalfpane.
   *
   * Parameters:
   *
   * x0 - X-coordinate of the origin.
   * y0 - Y-coordinate of the origin.
   * parent - Optional <mxCell> whose children should be checked. Default is
   * <defaultParent>.
   * rightHalfpane - Boolean indicating if the cells in the right halfpane
   * from the origin should be returned.
   * bottomHalfpane - Boolean indicating if the cells in the bottom halfpane
   * from the origin should be returned.
   */
  getCellsBeyond(
    x0: number,
    y0: number,
    parent: Cell | null = null,
    rightHalfpane: boolean = false,
    bottomHalfpane: boolean = false
  ) {
    const result = [];

    if (rightHalfpane || bottomHalfpane) {
      if (parent == null) {
        parent = <Cell>this.graph.getDefaultParent();
      }

      if (parent != null) {
        for (const child of parent.getChildren()) {
          const state = this.graph.view.getState(child);
          if (child.isVisible() && state != null) {
            if ((!rightHalfpane || state.x >= x0) && (!bottomHalfpane || state.y >= y0)) {
              result.push(child);
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Returns the bottom-most cell that intersects the given point (x, y) in
   * the cell hierarchy that starts at the given parent.
   *
   * @param state {@link mxCellState} that represents the cell state.
   * @param x X-coordinate of the location to be checked.
   * @param y Y-coordinate of the location to be checked.
   */
  intersects(state: CellState, x: number, y: number): boolean {
    const pts = <Point[]>state.absolutePoints;

    if (pts != null) {
      const t2 = this.tolerance * this.tolerance;
      let pt = pts[0];

      for (let i = 1; i < pts.length; i += 1) {
        const next = pts[i];
        const dist = ptSegDistSq(pt.x, pt.y, next.x, next.y, x, y);

        if (dist <= t2) {
          return true;
        }

        pt = next;
      }
    } else {
      const alpha = toRadians(getValue(state.style, 'rotation') || 0);

      if (alpha != 0) {
        const cos = Math.cos(-alpha);
        const sin = Math.sin(-alpha);
        const cx = new Point(state.getCenterX(), state.getCenterY());
        const pt = getRotatedPoint(new Point(x, y), cos, sin, cx);
        x = pt.x;
        y = pt.y;
      }

      if (contains(state, x, y)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns whether or not the specified parent is a valid
   * ancestor of the specified cell, either direct or indirectly
   * based on whether ancestor recursion is enabled.
   *
   * @param cell {@link mxCell} the possible child cell
   * @param parent {@link mxCell} the possible parent cell
   * @param recurse boolean whether or not to recurse the child ancestors
   */
  isValidAncestor(cell: Cell, parent: Cell, recurse: boolean = false): boolean {
    return recurse ? parent.isAncestor(cell) : cell.getParent() == parent;
  }

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Returns true if the given cell may not be moved, sized, bended,
   * disconnected, edited or selected. This implementation returns true for
   * all vertices with a relative geometry if {@link locked} is false.
   *
   * @param cell {@link mxCell} whose locked state should be returned.
   */
  isCellLocked(cell: Cell): boolean {
    const geometry = cell.getGeometry();

    return (
      this.isCellsLocked() || (geometry != null && cell.isVertex() && geometry.relative)
    );
  }

  /**
   * Returns true if the given cell may not be moved, sized, bended,
   * disconnected, edited or selected. This implementation returns true for
   * all vertices with a relative geometry if {@link locked} is false.
   *
   * @param cell {@link mxCell} whose locked state should be returned.
   */
  isCellsLocked(): boolean {
    return this.cellsLocked;
  }

  /**
   * Sets if any cell may be moved, sized, bended, disconnected, edited or
   * selected.
   *
   * @param value Boolean that defines the new value for {@link cellsLocked}.
   */
  setCellsLocked(value: boolean) {
    this.cellsLocked = value;
  }

  /**
   * Returns the cells which may be exported in the given array of cells.
   */
  getCloneableCells(cells: CellArray): CellArray | null {
    return this.graph.model.filterCells(cells, (cell: Cell) => {
      return this.isCellCloneable(cell);
    });
  }

  /**
   * Returns true if the given cell is cloneable. This implementation returns
   * {@link isCellsCloneable} for all cells unless a cell style specifies
   * {@link mxConstants.STYLE_CLONEABLE} to be 0.
   *
   * @param cell Optional {@link Cell} whose cloneable state should be returned.
   */
  isCellCloneable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);
    return this.isCellsCloneable() && style.cloneable !== 0;
  }

  /**
   * Returns {@link cellsCloneable}, that is, if the graph allows cloning of cells
   * by using control-drag.
   */
  isCellsCloneable(): boolean {
    return this.cellsCloneable;
  }

  /**
   * Specifies if the graph should allow cloning of cells by holding down the
   * control key while cells are being moved. This implementation updates
   * {@link cellsCloneable}.
   *
   * @param value Boolean indicating if the graph should be cloneable.
   */
  setCellsCloneable(value: boolean): void {
    this.cellsCloneable = value;
  }

  /**
   * Returns the cells which may be exported in the given array of cells.
   */
  getExportableCells(cells: CellArray): CellArray | null {
    return this.graph.model.filterCells(cells, (cell: Cell) => {
      return this.canExportCell(cell);
    });
  }

  /**
   * Returns true if the given cell may be exported to the clipboard. This
   * implementation returns {@link exportEnabled} for all cells.
   *
   * @param cell {@link mxCell} that represents the cell to be exported.
   */
  canExportCell(cell: Cell | null = null): boolean {
    return this.exportEnabled;
  }

  /**
   * Returns the cells which may be imported in the given array of cells.
   */
  getImportableCells(cells: CellArray): CellArray | null {
    return this.graph.model.filterCells(cells, (cell: Cell) => {
      return this.canImportCell(cell);
    });
  }

  /**
   * Returns true if the given cell may be imported from the clipboard.
   * This implementation returns {@link importEnabled} for all cells.
   *
   * @param cell {@link mxCell} that represents the cell to be imported.
   */
  canImportCell(cell: Cell | null = null): boolean {
    return this.importEnabled;
  }

  /**
   * Returns true if the given cell is selectable. This implementation
   * returns {@link cellsSelectable}.
   *
   * To add a new style for making cells (un)selectable, use the following code.
   *
   * ```javascript
   * isCellSelectable = function(cell)
   * {
   *   var style = this.getCurrentCellStyle(cell);
   *
   *   return this.isCellsSelectable() && !this.isCellLocked(cell) && style.selectable != 0;
   * };
   * ```
   *
   * You can then use the new style as shown in this example.
   *
   * ```javascript
   * graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30, 'selectable=0');
   * ```
   *
   * @param cell {@link mxCell} whose selectable state should be returned.
   */
  isCellSelectable(cell: Cell): boolean {
    return this.isCellsSelectable();
  }

  /**
   * Returns {@link cellsSelectable}.
   */
  isCellsSelectable(): boolean {
    return this.cellsSelectable;
  }

  /**
   * Sets {@link cellsSelectable}.
   */
  setCellsSelectable(value: boolean): void {
    this.cellsSelectable = value;
  }

  /**
   * Returns the cells which may be exported in the given array of cells.
   */
  getDeletableCells(cells: CellArray): CellArray | null {
    return this.graph.model.filterCells(cells, (cell: Cell) => {
      return this.isCellDeletable(cell);
    });
  }

  /**
   * Returns true if the given cell is moveable. This returns
   * {@link cellsDeletable} for all given cells if a cells style does not specify
   * {@link 'deletable'} to be 0.
   *
   * @param cell {@link mxCell} whose deletable state should be returned.
   */
  isCellDeletable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);
    return this.isCellsDeletable() && style.deletable !== 0;
  }

  /**
   * Returns {@link cellsDeletable}.
   */
  isCellsDeletable(): boolean {
    return this.cellsDeletable;
  }

  /**
   * Sets {@link cellsDeletable}.
   *
   * @param value Boolean indicating if the graph should allow deletion of cells.
   */
  setCellsDeletable(value: boolean): void {
    this.cellsDeletable = value;
  }

  /**
   * Returns true if the given cell is rotatable. This returns true for the given
   * cell if its style does not specify {@link 'rotatable'} to be 0.
   *
   * @param cell {@link mxCell} whose rotatable state should be returned.
   */
  isCellRotatable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);
    return style.rotatable !== 0;
  }

  /**
   * Returns the cells which are movable in the given array of cells.
   */
  getMovableCells(cells: CellArray): CellArray | null {
    return this.graph.model.filterCells(cells, (cell: Cell) => {
      return this.isCellMovable(cell);
    });
  }

  /**
   * Returns true if the given cell is moveable. This returns {@link cellsMovable}
   * for all given cells if {@link isCellLocked} does not return true for the given
   * cell and its style does not specify {@link 'movable'} to be 0.
   *
   * @param cell {@link mxCell} whose movable state should be returned.
   */
  isCellMovable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return this.isCellsMovable() && !this.isCellLocked(cell) && style.movable !== 0;
  }

  /**
   * Returns {@link cellsMovable}.
   */
  isCellsMovable(): boolean {
    return this.cellsMovable;
  }

  /**
   * Specifies if the graph should allow moving of cells. This implementation
   * updates {@link cellsMsovable}.
   *
   * @param value Boolean indicating if the graph should allow moving of cells.
   */
  setCellsMovable(value: boolean): void {
    this.cellsMovable = value;
  }

  /**
   * Returns true if the given cell is resizable. This returns
   * {@link cellsResizable} for all given cells if {@link isCellLocked} does not return
   * true for the given cell and its style does not specify
   * {@link 'resizable'} to be 0.
   *
   * @param cell {@link mxCell} whose resizable state should be returned.
   */
  isCellResizable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);

    const r =
      this.isCellsResizable() &&
      !this.isCellLocked(cell) &&
      getValue(style, 'resizeable', '1') != '0';
    // alert(r);
    return r;
  }

  /**
   * Returns {@link cellsResizable}.
   */
  isCellsResizable(): boolean {
    return this.cellsResizable;
  }

  /**
   * Specifies if the graph should allow resizing of cells. This
   * implementation updates {@link cellsResizable}.
   *
   * @param value Boolean indicating if the graph should allow resizing of
   * cells.
   */
  setCellsResizable(value: boolean): void {
    this.cellsResizable = value;
  }

  /**
   * Returns true if the given cell is bendable. This returns {@link cellsBendable}
   * for all given cells if {@link isLocked} does not return true for the given
   * cell and its style does not specify {@link mxConstants.STYLE_BENDABLE} to be 0.
   *
   * @param cell {@link mxCell} whose bendable state should be returned.
   */
  isCellBendable(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return this.isCellsBendable() && !this.isCellLocked(cell) && style.bendable !== 0;
  }

  /**
   * Returns {@link cellsBenadable}.
   */
  isCellsBendable(): boolean {
    return this.cellsBendable;
  }

  /**
   * Specifies if the graph should allow bending of edges. This
   * implementation updates {@link bendable}.
   *
   * @param value Boolean indicating if the graph should allow bending of
   * edges.
   */
  setCellsBendable(value: boolean): void {
    this.cellsBendable = value;
  }

  /**
   * Returns true if the size of the given cell should automatically be
   * updated after a change of the label. This implementation returns
   * {@link autoSizeCells} or checks if the cell style does specify
   * {@link 'autoSize'} to be 1.
   *
   * @param cell {@link mxCell} that should be resized.
   */
  isAutoSizeCell(cell: Cell): boolean {
    const style = this.getCurrentCellStyle(cell);

    return this.isAutoSizeCells() || style.autosize == 1;
  }

  /**
   * Returns {@link autoSizeCells}.
   */
  isAutoSizeCells(): boolean {
    return this.autoSizeCells;
  }

  /**
   * Specifies if cell sizes should be automatically updated after a label
   * change. This implementation sets {@link autoSizeCells} to the given parameter.
   * To update the size of cells when the cells are added, set
   * {@link autoSizeCellsOnAdd} to true.
   *
   * @param value Boolean indicating if cells should be resized
   * automatically.
   */
  setAutoSizeCells(value: boolean): void {
    this.autoSizeCells = value;
  }

  /**
   * Returns true if the parent of the given cell should be extended if the
   * child has been resized so that it overlaps the parent. This
   * implementation returns {@link isExtendParents} if the cell is not an edge.
   *
   * @param cell {@link mxCell} that has been resized.
   */
  isExtendParent(cell: Cell): boolean {
    return !cell.isEdge() && this.isExtendParents();
  }

  /**
   * Returns {@link extendParents}.
   */
  isExtendParents(): boolean {
    return this.extendParents;
  }

  /**
   * Sets {@link extendParents}.
   *
   * @param value New boolean value for {@link extendParents}.
   */
  setExtendParents(value: boolean): void {
    this.extendParents = value;
  }

  /**
   * Returns {@link extendParentsOnAdd}.
   */
  isExtendParentsOnAdd(cell: Cell): boolean {
    return this.extendParentsOnAdd;
  }

  /**
   * Sets {@link extendParentsOnAdd}.
   *
   * @param value New boolean value for {@link extendParentsOnAdd}.
   */
  setExtendParentsOnAdd(value: boolean): void {
    this.extendParentsOnAdd = value;
  }

  /**
   * Returns {@link extendParentsOnMove}.
   */
  isExtendParentsOnMove(): boolean {
    return this.extendParentsOnMove;
  }

  /**
   * Sets {@link extendParentsOnMove}.
   *
   * @param value New boolean value for {@link extendParentsOnAdd}.
   */
  setExtendParentsOnMove(value: boolean): void {
    this.extendParentsOnMove = value;
  }

  /*****************************************************************************
   * Group: Graph appearance
   *****************************************************************************/

  /**
   * Returns the cursor value to be used for the CSS of the shape for the
   * given cell. This implementation returns null.
   *
   * @param cell {@link mxCell} whose cursor should be returned.
   */
  getCursorForCell(cell: Cell): string | null {
    return null;
  }

  /*****************************************************************************
   * Group: Graph display
   *****************************************************************************/

  /**
   * Returns the scaled, translated bounds for the given cell. See
   * {@link GraphView.getBounds} for arrays.
   *
   * @param cell {@link mxCell} whose bounds should be returned.
   * @param includeEdges Optional boolean that specifies if the bounds of
   * the connected edges should be included. Default is `false`.
   * @param includeDescendants Optional boolean that specifies if the bounds
   * of all descendants should be included. Default is `false`.
   */
  getCellBounds(
    cell: Cell,
    includeEdges: boolean = false,
    includeDescendants: boolean = false
  ): Rectangle | null {
    let cells = new CellArray(cell);

    // Includes all connected edges
    if (includeEdges) {
      cells = cells.concat(<CellArray>cell.getEdges());
    }

    let result = this.view.getBounds(cells);

    // Recursively includes the bounds of the children
    if (includeDescendants) {
      for (const child of cell.getChildren()) {
        const tmp = this.getCellBounds(child, includeEdges, true);

        if (result != null) {
          result.add(tmp);
        } else {
          result = tmp;
        }
      }
    }
    return result;
  }

  /**
   * Returns the bounding box for the geometries of the vertices in the
   * given array of cells. This can be used to find the graph bounds during
   * a layout operation (ie. before the last endUpdate) as follows:
   *
   * ```javascript
   * var cells = graph.getChildCells(graph.getDefaultParent(), true, true);
   * var bounds = graph.getBoundingBoxFromGeometry(cells, true);
   * ```
   *
   * This can then be used to move cells to the origin:
   *
   * ```javascript
   * if (bounds.x < 0 || bounds.y < 0)
   * {
   *   graph.moveCells(cells, -Math.min(bounds.x, 0), -Math.min(bounds.y, 0))
   * }
   * ```
   *
   * Or to translate the graph view:
   *
   * ```javascript
   * if (bounds.x < 0 || bounds.y < 0)
   * {
   *   graph.view.setTranslate(-Math.min(bounds.x, 0), -Math.min(bounds.y, 0));
   * }
   * ```
   *
   * @param cells Array of {@link Cell} whose bounds should be returned.
   * @param includeEdges Specifies if edge bounds should be included by computing
   * the bounding box for all points in geometry. Default is `false`.
   */
  getBoundingBoxFromGeometry(
    cells: CellArray,
    includeEdges: boolean = false
  ): Rectangle | null {
    includeEdges = includeEdges != null ? includeEdges : false;
    let result = null;
    let tmp: Rectangle | null = null;

    for (const cell of cells) {
      if (includeEdges || cell.isVertex()) {
        // Computes the bounding box for the points in the geometry
        const geo = cell.getGeometry();

        if (geo != null) {
          let bbox = null;

          if (cell.isEdge()) {
            const addPoint = (pt: Point | null) => {
              if (pt != null) {
                if (tmp == null) {
                  tmp = new Rectangle(pt.x, pt.y, 0, 0);
                } else {
                  tmp.add(new Rectangle(pt.x, pt.y, 0, 0));
                }
              }
            };

            if (cell.getTerminal(true) == null) {
              addPoint(geo.getTerminalPoint(true));
            }

            if (cell.getTerminal(false) == null) {
              addPoint(geo.getTerminalPoint(false));
            }

            const pts = geo.points;

            if (pts != null && pts.length > 0) {
              tmp = new Rectangle(pts[0].x, pts[0].y, 0, 0);

              for (let j = 1; j < pts.length; j++) {
                addPoint(pts[j]);
              }
            }

            bbox = tmp;
          } else {
            const parent = <Cell>cell.getParent();

            if (geo.relative) {
              if (
                parent.isVertex() &&
                parent !== this.view.currentRoot
              ) {
                tmp = this.getBoundingBoxFromGeometry(new CellArray(parent), false);

                if (tmp != null) {
                  bbox = new Rectangle(
                    geo.x * tmp.width,
                    geo.y * tmp.height,
                    geo.width,
                    geo.height
                  );

                  if (cells.indexOf(parent) >= 0) {
                    bbox.x += tmp.x;
                    bbox.y += tmp.y;
                  }
                }
              }
            } else {
              bbox = Rectangle.fromRectangle(geo);

              if (parent.isVertex() && cells.indexOf(parent) >= 0) {
                tmp = this.getBoundingBoxFromGeometry(new CellArray(parent), false);

                if (tmp != null) {
                  bbox.x += tmp.x;
                  bbox.y += tmp.y;
                }
              }
            }

            if (bbox != null && geo.offset != null) {
              bbox.x += geo.offset.x;
              bbox.y += geo.offset.y;
            }

            const style = this.getCurrentCellStyle(cell);

            if (bbox != null) {
              const angle = getValue(style, 'rotation', 0);

              if (angle !== 0) {
                bbox = getBoundingBox(bbox, angle);
              }
            }
          }

          if (bbox != null) {
            if (result == null) {
              result = Rectangle.fromRectangle(bbox);
            } else {
              result.add(bbox);
            }
          }
        }
      }
    }
    return result;
  }
}

export default GraphCells;
