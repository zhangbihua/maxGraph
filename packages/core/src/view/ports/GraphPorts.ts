import Cell from '../cell/datatypes/Cell';

class GraphPorts {
  /**
   * Specifies if ports are enabled. This is used in {@link cellConnected} to update
   * the respective style.
   * @default true
   */
  portsEnabled: boolean = true;

  /*****************************************************************************
   * Group: Drilldown
   *****************************************************************************/

  /**
   * Returns true if the given cell is a "port", that is, when connecting to
   * it, the cell returned by getTerminalForPort should be used as the
   * terminal and the port should be referenced by the ID in either the
   * mxConstants.STYLE_SOURCE_PORT or the or the
   * mxConstants.STYLE_TARGET_PORT. Note that a port should not be movable.
   * This implementation always returns false.
   *
   * A typical implementation is the following:
   *
   * ```javascript
   * graph.isPort = function(cell)
   * {
   *   var geo = cell.getGeometry();
   *
   *   return (geo != null) ? geo.relative : false;
   * };
   * ```
   *
   * @param cell {@link mxCell} that represents the port.
   */
  isPort(cell: Cell | null) {
    return false;
  }

  /**
   * Returns the terminal to be used for a given port. This implementation
   * always returns the parent cell.
   *
   * @param cell {@link mxCell} that represents the port.
   * @param source If the cell is the source or target port.
   */
  getTerminalForPort(cell: Cell, source: boolean = false): Cell | null {
    return cell.getParent();
  }

  /*****************************************************************************
   * Group: Graph behaviour
   *****************************************************************************/

  /**
   * Returns {@link portsEnabled} as a boolean.
   */
  isPortsEnabled(): boolean {
    return this.portsEnabled;
  }

  /**
   * Specifies if the ports should be enabled.
   *
   * @param value Boolean indicating if the ports should be enabled.
   */
  setPortsEnabled(value: boolean): void {
    this.portsEnabled = value;
  }
}

export default GraphPorts;
