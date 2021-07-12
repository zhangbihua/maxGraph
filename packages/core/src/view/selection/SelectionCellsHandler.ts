/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */
import EventSource from '../event/EventSource';
import Dictionary from '../../util/Dictionary';
import EventObject from '../event/EventObject';
import InternalEvent from '../event/InternalEvent';
import utils, { sortCells } from '../../util/Utils';
import Graph from '../Graph';
import Cell from '../cell/datatypes/Cell';
import CellArray from '../cell/datatypes/CellArray';
import CellState from '../cell/datatypes/CellState';

/**
 * Class: mxSelectionCellsHandler
 *
 * An event handler that manages cell handlers and invokes their mouse event
 * processing functions.
 *
 * Group: Events
 *
 * Event: mxEvent.ADD
 *
 * Fires if a cell has been added to the selection. The <code>state</code>
 * property contains the <mxCellState> that has been added.
 *
 * Event: mxEvent.REMOVE
 *
 * Fires if a cell has been remove from the selection. The <code>state</code>
 * property contains the <mxCellState> that has been removed.
 *
 * Parameters:
 *
 * graph - Reference to the enclosing <mxGraph>.
 */
class SelectionCellsHandler extends EventSource {
  constructor(graph: Graph) {
    super();

    this.graph = graph;
    this.handlers = new Dictionary();
    this.graph.addMouseListener(this);

    this.refreshHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.refresh();
      }
    };

    this.graph.getSelectionModel().addListener(InternalEvent.CHANGE, this.refreshHandler);
    this.graph.getModel().addListener(InternalEvent.CHANGE, this.refreshHandler);
    this.graph.getView().addListener(InternalEvent.SCALE, this.refreshHandler);
    this.graph.getView().addListener(InternalEvent.TRANSLATE, this.refreshHandler);
    this.graph
      .getView()
      .addListener(InternalEvent.SCALE_AND_TRANSLATE, this.refreshHandler);
    this.graph.getView().addListener(InternalEvent.DOWN, this.refreshHandler);
    this.graph.getView().addListener(InternalEvent.UP, this.refreshHandler);
  }

  /**
   * Variable: graph
   *
   * Reference to the enclosing <mxGraph>.
   */
  graph: Graph;

  /**
   * Variable: enabled
   *
   * Specifies if events are handled. Default is true.
   */
  enabled: boolean = true;

  /**
   * Variable: refreshHandler
   *
   * Keeps a reference to an event listener for later removal.
   */
  refreshHandler: any = null;

  /**
   * Variable: maxHandlers
   *
   * Defines the maximum number of handlers to paint individually. Default is 100.
   */
  maxHandlers: number = 100;

  /**
   * Variable: handlers
   *
   * <mxDictionary> that maps from cells to handlers.
   */
  handlers: Dictionary<string, any>;

  /**
   * Function: isEnabled
   *
   * Returns <enabled>.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Function: setEnabled
   *
   * Sets <enabled>.
   */
  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  /**
   * Function: getHandler
   *
   * Returns the handler for the given cell.
   */
  getHandler(cell: Cell): any {
    return this.handlers.get(cell);
  }

  /**
   * Function: isHandled
   *
   * Returns true if the given cell has a handler.
   */
  isHandled(cell: Cell): boolean {
    return this.getHandler(cell) != null;
  }

  /**
   * Function: reset
   *
   * Resets all handlers.
   */
  reset(): void {
    this.handlers.visit((key, handler) => {
      handler.reset.apply(handler);
    });
  }

  /**
   * Function: getHandledSelectionCells
   *
   * Reloads or updates all handlers.
   */
  getHandledSelectionCells(): CellArray {
    return this.graph.selection.getSelectionCells();
  }

  /**
   * Function: refresh
   *
   * Reloads or updates all handlers.
   */
  refresh(): void {
    // Removes all existing handlers
    const oldHandlers = this.handlers;
    this.handlers = new Dictionary();

    // Creates handles for all selection cells
    const tmp = sortCells(this.getHandledSelectionCells(), false);

    // Destroys or updates old handlers
    for (let i = 0; i < tmp.length; i += 1) {
      const state = this.graph.view.getState(tmp[i]);

      if (state != null) {
        let handler = oldHandlers.remove(tmp[i]);

        if (handler != null) {
          if (handler.state !== state) {
            handler.destroy();
            handler = null;
          } else if (!this.isHandlerActive(handler)) {
            if (handler.refresh != null) {
              handler.refresh();
            }

            handler.redraw();
          }
        }

        if (handler != null) {
          this.handlers.put(tmp[i], handler);
        }
      }
    }

    // Destroys unused handlers
    oldHandlers.visit((key, handler) => {
      this.fireEvent(new EventObject(InternalEvent.REMOVE, 'state', handler.state));
      handler.destroy();
    });

    // Creates new handlers and updates parent highlight on existing handlers
    for (let i = 0; i < tmp.length; i += 1) {
      const state = this.graph.view.getState(tmp[i]);

      if (state != null) {
        let handler = this.handlers.get(tmp[i]);

        if (handler == null) {
          handler = this.graph.createHandler(state);
          this.fireEvent(new EventObject(InternalEvent.ADD, 'state', state));
          this.handlers.put(tmp[i], handler);
        } else {
          handler.updateParentHighlight();
        }
      }
    }
  }

  /**
   * Function: isHandlerActive
   *
   * Returns true if the given handler is active and should not be redrawn.
   */
  isHandlerActive(handler: any): boolean {
    return handler.index != null;
  }

  /**
   * Function: updateHandler
   *
   * Updates the handler for the given shape if one exists.
   */
  updateHandler(state: CellState): void {
    let handler = this.handlers.remove(state.cell);

    if (handler != null) {
      // Transfers the current state to the new handler
      const { index } = handler;
      const x = handler.startX;
      const y = handler.startY;

      handler.destroy();
      handler = this.graph.createHandler(state);

      if (handler != null) {
        this.handlers.put(state.cell, handler);

        if (index != null && x != null && y != null) {
          handler.start(x, y, index);
        }
      }
    }
  }

  /**
   * Function: mouseDown
   *
   * Redirects the given event to the handlers.
   */
  mouseDown(sender: Event, me: Event): void {
    if (this.graph.isEnabled() && this.isEnabled()) {
      const args = [sender, me];

      this.handlers.visit((key, handler) => {
        handler.mouseDown.apply(handler, args);
      });
    }
  }

  /**
   * Function: mouseMove
   *
   * Redirects the given event to the handlers.
   */
  mouseMove(sender: Event, me: Event): void {
    if (this.graph.isEnabled() && this.isEnabled()) {
      const args = [sender, me];

      this.handlers.visit((key, handler) => {
        handler.mouseMove.apply(handler, args);
      });
    }
  }

  /**
   * Function: mouseUp
   *
   * Redirects the given event to the handlers.
   */
  mouseUp(sender: Event, me: Event): void {
    if (this.graph.isEnabled() && this.isEnabled()) {
      const args = [sender, me];

      this.handlers.visit((key, handler) => {
        handler.mouseUp.apply(handler, args);
      });
    }
  }

  /**
   * Function: destroy
   *
   * Destroys the handler and all its resources and DOM nodes.
   */
  destroy(): void {
    this.graph.removeMouseListener(this);

    if (this.refreshHandler != null) {
      this.graph.selection.getSelectionModel().removeListener(this.refreshHandler);
      this.graph.getModel().removeListener(this.refreshHandler);
      this.graph.getView().removeListener(this.refreshHandler);
      this.refreshHandler = null;
    }
  }
}

export default SelectionCellsHandler;
