/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */

import mxUtils from '../../util/mxUtils';
import mxConstants from '../../util/mxConstants';
import mxGeometry from '../../util/datatypes/mxGeometry';
import mxCellOverlay from './mxCellOverlay';
import { clone } from '../../util/mxCloneUtils';

/**
 * Cells are the elements of the graph model. They represent the state
 * of the groups, vertices and edges in a graph.
 *
 * ### Custom attributes
 * For custom attributes we recommend using an XML node as the value of a cell.
 * The following code can be used to create a cell with an XML node as the value:
 * @example
 * ```javascript
 * var doc = mxUtils.createXmlDocument();
 * var node = doc.createElement('MyNode')
 * node.setAttribute('label', 'MyLabel');
 * node.setAttribute('attribute1', 'value1');
 * graph.insertVertex(graph.getDefaultParent(), null, node, 40, 40, 80, 30);
 * ```
 *
 * For the label to work, {@link mxGraph.convertValueToString} and
 * {@link mxGraph.cellLabelChanged} should be overridden as follows:
 *
 * @example
 * ```javascript
 * graph.convertValueToString(cell)
 * {
 *   if (mxUtils.isNode(cell.value))
 *   {
 *     return cell.getAttribute('label', '')
 *   }
 * };
 *
 * var cellLabelChanged = graph.cellLabelChanged;
 * graph.cellLabelChanged(cell, newValue, autoSize)
 * {
 *   if (mxUtils.isNode(cell.value))
 *   {
 *     // Clones the value for correct undo/redo
 *     var elt = cell.value.cloneNode(true);
 *     elt.setAttribute('label', newValue);
 *     newValue = elt;
 *   }
 *
 *   cellLabelChanged.apply(this, arguments);
 * };
 * ```
 * @class mxCell
 */
class mxCell {
  constructor(
    value: any = null,
    geometry: mxGeometry | null = null,
    style: string | null = null
  ) {
    this.value = value;
    this.setGeometry(geometry);
    this.setStyle(style);

    if (this.onInit != null) {
      this.onInit();
    }
  }

  // TODO: Document me!!!
  getChildren(): mxCell[] {
    return this.children || [];
  }

  // TODO: Document me!
  // used by invalidate() of mxGraphView
  invalidating: boolean = false;

  onInit: Function | null = null;

  // used by addCellOverlay() of mxGraph
  overlays: mxCellOverlay[] | null = null;

  /**
   * Holds the Id. Default is null.
   */
  // id: string;
  id: string | null = null;

  /**
   * Holds the user object. Default is null.
   */
  // value: any;
  value: any = null;

  /**
   * Holds the <mxGeometry>. Default is null.
   */
  // geometry: mxGeometry;
  geometry: mxGeometry | null = null;

  /**
   * Holds the style as a string of the form [(stylename|key=value);]. Default is
   * null.
   */
  // style: string;
  style: string | null = null;

  /**
   * Specifies whether the cell is a vertex. Default is false.
   */
  // vertex: boolean;
  vertex: boolean = false;

  /**
   * Specifies whether the cell is an edge. Default is false.
   */
  // edge: boolean;
  edge: boolean = false;

  /**
   * Specifies whether the cell is connectable. Default is true.
   */
  // connectable: boolean;
  connectable: boolean = true;

  /**
   * Specifies whether the cell is visible. Default is true.
   */
  // visible: boolean;
  visible: boolean = true;

  /**
   * Specifies whether the cell is collapsed. Default is false.
   */
  // collapsed: boolean;
  collapsed: boolean = false;

  /**
   * Reference to the parent cell.
   */
  // parent: mxCell;
  parent: mxCell | null = null;

  /**
   * Reference to the source terminal.
   */
  // source: mxCell;
  source: mxCell | null = null;

  /**
   * Reference to the target terminal.
   */
  // target: mxCell;
  target: mxCell | null = null;

  /**
   * Holds the child cells.
   */
  // children: Array<mxCell>;
  children: mxCell[] | null = null;

  /**
   * Holds the edges.
   */
  // edges: Array<mxCell>;
  edges: mxCell[] | null = null;

  /**
   * List of members that should not be cloned inside <clone>. This field is
   * passed to <mxUtils.clone> and is not made persistent in <mxCellCodec>.
   * This is not a convention for all classes, it is only used in this class
   * to mark transient fields since transient modifiers are not supported by
   * the language.
   */
  // mxTransient: Array<string>;
  mxTransient: string[] = [
    'id',
    'value',
    'parent',
    'source',
    'target',
    'children',
    'edges',
  ];

  /**
   * Returns the Id of the cell as a string.
   */
  // getId(): string;
  getId(): string | null {
    return this.id;
  }

  /**
   * Sets the Id of the cell to the given string.
   */
  // setId(id: string): void;
  setId(id: string): void {
    this.id = id;
  }

  /**
   * Returns the user object of the cell. The user
   * object is stored in <value>.
   */
  // getValue(): any;
  getValue(): any {
    return this.value;
  }

  /**
   * Sets the user object of the cell. The user object
   * is stored in <value>.
   */
  // setValue(value: any): void;
  setValue(value: number): void {
    this.value = value;
  }

  /**
   * Changes the user object after an in-place edit
   * and returns the previous value. This implementation
   * replaces the user object with the given value and
   * returns the old user object.
   */
  // valueChanged(newValue: any): any;
  valueChanged(newValue: any): any {
    const previous = this.getValue();
    this.setValue(newValue);
    return previous;
  }

  /**
   * Returns the <mxGeometry> that describes the <geometry>.
   */
  // getGeometry(): mxGeometry;
  getGeometry(): mxGeometry | null {
    return this.geometry;
  }

  /**
   * Sets the <mxGeometry> to be used as the <geometry>.
   */
  // setGeometry(geometry: mxGeometry): void;
  setGeometry(geometry: mxGeometry | null): void {
    this.geometry = geometry;
  }

  /**
   * Returns a string that describes the <style>.
   */
  // getStyle(): string;
  getStyle(): any {
    return this.style;
  }

  /**
   * Sets the string to be used as the <style>.
   */
  // setStyle(style: string): void;
  setStyle(style: string | null): void {
    this.style = style;
  }

  /**
   * Returns true if the cell is a vertex.
   */
  // isVertex(): boolean;
  isVertex(): boolean {
    return this.vertex;
  }

  /**
   * Specifies if the cell is a vertex. This should only be assigned at
   * construction of the cell and not be changed during its lifecycle.
   *
   * Parameters:
   *
   * @param vertex Boolean that specifies if the cell is a vertex.
   */
  // setVertex(vertex: boolean): void;
  setVertex(vertex: boolean) {
    this.vertex = vertex;
  }

  /**
   * Returns true if the cell is an edge.
   */
  // isEdge(): boolean;
  isEdge(): boolean {
    return this.edge;
  }

  /**
   * Specifies if the cell is an edge. This should only be assigned at
   * construction of the cell and not be changed during its lifecycle.
   *
   * Parameters:
   *
   * @param edge Boolean that specifies if the cell is an edge.
   */
  // setEdge(edge: boolean): void;
  setEdge(edge: boolean) {
    this.edge = edge;
  }

  /**
   * Returns true if the cell is connectable.
   */
  // isConnectable(): boolean;
  isConnectable(): boolean {
    return this.connectable;
  }

  /**
   * Sets the connectable state.
   *
   * Parameters:
   *
   * @param connectable Boolean that specifies the new connectable state.
   */
  // setConnectable(connectable: boolean): void;
  setConnectable(connectable: boolean) {
    this.connectable = connectable;
  }

  /**
   * Returns true if the cell is visibile.
   */
  // isVisible(): boolean;
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Specifies if the cell is visible.
   *
   * Parameters:
   *
   * @param visible Boolean that specifies the new visible state.
   */
  // setVisible(visible: boolean): void;
  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * Returns true if the cell is collapsed.
   */
  // isCollapsed(): boolean;
  isCollapsed(): boolean {
    return this.collapsed;
  }

  /**
   * Sets the collapsed state.
   *
   * Parameters:
   *
   * @param collapsed Boolean that specifies the new collapsed state.
   */
  // setCollapsed(collapsed: boolean): void;
  setCollapsed(collapsed: boolean): void {
    this.collapsed = collapsed;
  }

  /**
   * Returns the cell's parent.
   */
  // getParent(): mxCell;
  getParent(): mxCell | null {
    return this.parent;
  }

  /**
   * Sets the parent cell.
   *
   * Parameters:
   *
   * @param parent<mxCell> that represents the new parent.
   */
  // setParent(parent: mxCell): void;
  setParent(parent: mxCell | null): void {
    this.parent = parent;
  }

  /**
   * Returns the source or target terminal.
   *
   * Parameters:
   *
   * @param source Boolean that specifies if the source terminal should be
   * returned.
   */
  // getTerminal(source: boolean): mxCell;
  getTerminal(source: boolean = false): mxCell | null {
    return source ? this.source : this.target;
  }

  /**
   * Sets the source or target terminal and returns the new terminal.
   *
   * @param {mxCell} terminal     mxCell that represents the new source or target terminal.
   * @param {boolean} isSource  boolean that specifies if the source or target terminal
   * should be set.
   */
  // setTerminal(terminal: mxCell, isSource: boolean): mxCell;
  setTerminal(terminal: mxCell | null, isSource: boolean): mxCell | null {
    if (isSource) {
      this.source = terminal;
    } else {
      this.target = terminal;
    }
    return terminal;
  }

  /**
   * Returns the number of child cells.
   */
  // getChildCount(): number;
  getChildCount(): number {
    return this.children == null ? 0 : this.children.length;
  }

  /**
   * Returns the index of the specified child in the child array.
   *
   * Parameters:
   *
   * @param childChild whose index should be returned.
   */
  // getIndex(child: mxCell): number;
  getIndex(child: mxCell | null): number {
    return mxUtils.indexOf(this.children, child);
  }

  /**
   * Returns the child at the specified index.
   *
   * Parameters:
   *
   * @param indexInteger that specifies the child to be returned.
   */
  // getChildAt(index: number): mxCell;
  getChildAt(index: number): mxCell | null {
    return this.children == null ? null : this.children[index];
  }

  /**
   * Inserts the specified child into the child array at the specified index
   * and updates the parent reference of the child. If not childIndex is
   * specified then the child is appended to the child array. Returns the
   * inserted child.
   *
   * Parameters:
   *
   * @param child<mxCell> to be inserted or appended to the child array.
   * @param indexOptional integer that specifies the index at which the child
   * should be inserted into the child array.
   */
  // insert(child: mxCell, index: number): mxCell;
  insert(child: mxCell | null = null, index: number | null = null) {
    if (child != null) {
      if (index == null) {
        index = this.getChildCount();

        if (child.getParent() === this) {
          index--;
        }
      }

      child.removeFromParent();
      child.setParent(this);

      if (this.children == null) {
        this.children = [];
        this.children.push(child);
      } else {
        this.children.splice(index, 0, child);
      }
    }
    return child;
  }

  /**
   * Removes the child at the specified index from the child array and
   * returns the child that was removed. Will remove the parent reference of
   * the child.
   *
   * Parameters:
   *
   * @param indexInteger that specifies the index of the child to be
   * removed.
   */
  // remove(index: number): mxCell;
  remove(index: number): mxCell | null {
    let child = null;
    if (this.children != null && index >= 0) {
      child = this.getChildAt(index);
      if (child != null) {
        this.children.splice(index, 1);
        child.setParent(null);
      }
    }
    return child;
  }

  /**
   * Removes the cell from its parent.
   */
  // removeFromParent(): mxCell;
  removeFromParent(): void {
    if (this.parent != null) {
      const index = this.parent.getIndex(this);
      this.parent.remove(index);
    }
  }

  /**
   * Returns the number of edges in the edge array.
   */
  // getEdgeCount(): number;
  getEdgeCount(): number {
    return this.edges == null ? 0 : this.edges.length;
  }

  /**
   * Returns the index of the specified edge in <edges>.
   *
   * Parameters:
   *
   * @param edge<mxCell> whose index in <edges> should be returned.
   */
  // getEdgeIndex(edge: mxCell): number;
  getEdgeIndex(edge: mxCell): number {
    return mxUtils.indexOf(this.edges, edge);
  }

  /**
   * Returns the edge at the specified index in <edges>.
   *
   * Parameters:
   *
   * @param indexInteger that specifies the index of the edge to be returned.
   */
  // getEdgeAt(index: number): mxCell;
  getEdgeAt(index: number): mxCell | null {
    return this.edges == null ? null : this.edges[index];
  }

  /**
   * Inserts the specified edge into the edge array and returns the edge.
   * Will update the respective terminal reference of the edge.
   *
   * Parameters:
   *
   * @param edge              <mxCell> to be inserted into the edge array.
   * @param isOutgoing Boolean that specifies if the edge is outgoing.
   */
  // insertEdge(edge: mxCell, isOutgoing: boolean): mxCell;
  insertEdge(edge: mxCell | null, isOutgoing: boolean) {
    if (edge != null) {
      edge.removeFromTerminal(isOutgoing);
      edge.setTerminal(this, isOutgoing);

      if (
        this.edges == null ||
        edge.getTerminal(!isOutgoing) !== this ||
        mxUtils.indexOf(this.edges, edge) < 0
      ) {
        if (this.edges == null) {
          this.edges = [];
        }
        this.edges.push(edge);
      }
    }
    return edge;
  }

  /**
   * Removes the specified edge from the edge array and returns the edge.
   * Will remove the respective terminal reference from the edge.
   *
   * Parameters:
   *
   * @param edge<mxCell> to be removed from the edge array.
   * @param isOutgoing Boolean that specifies if the edge is outgoing.
   */
  // removeEdge(edge: mxCell, isOutgoing: boolean): mxCell;
  removeEdge(edge: mxCell | null, isOutgoing: boolean = false): mxCell | null {
    if (edge != null) {
      if (edge.getTerminal(!isOutgoing) !== this && this.edges != null) {
        const index = this.getEdgeIndex(edge);

        if (index >= 0) {
          this.edges.splice(index, 1);
        }
      }
      edge.setTerminal(null, isOutgoing);
    }
    return edge;
  }

  /**
   * Removes the edge from its source or target terminal.
   *
   * Parameters:
   *
   * @param isSource Boolean that specifies if the edge should be removed from its source or target terminal.
   */
  // removeFromTerminal(isSource: boolean): mxCell;
  removeFromTerminal(isSource: boolean): void {
    const terminal = this.getTerminal(isSource);
    if (terminal != null) {
      terminal.removeEdge(this, isSource);
    }
  }

  /**
   * Returns true if the user object is an XML node that contains the given
   * attribute.
   *
   * Parameters:
   *
   * @param nameName nameName of the attribute.
   */
  // hasAttribute(name: string): boolean;
  hasAttribute(name: string): boolean {
    const userObject = this.getValue();
    return (
      userObject != null &&
      (userObject.nodeType === mxConstants.NODETYPE_ELEMENT &&
      userObject.hasAttribute
        ? userObject.hasAttribute(name)
        : userObject.getAttribute(name) != null)
    );
  }

  /**
   * Returns the specified attribute from the user object if it is an XML
   * node.
   *
   * Parameters:
   *
   * @param nameName              of the attribute whose value should be returned.
   * @param defaultValueOptional  default value to use if the attribute has no
   * value.
   */
  // getAttribute(name: string, defaultValue: any): any;
  getAttribute(name: string, defaultValue: any): any {
    const userObject = this.getValue();
    const val =
      userObject != null && userObject.nodeType === mxConstants.NODETYPE_ELEMENT
        ? userObject.getAttribute(name)
        : null;
    return val != null ? val : defaultValue;
  }

  /**
   * Sets the specified attribute on the user object if it is an XML node.
   *
   * Parameters:
   *
   * @param nameName    of the attribute whose value should be set.
   * @param valueNew    value of the attribute.
   */
  // setAttribute(name: string, value: any): void;
  setAttribute(name: string, value: any): void {
    const userObject = this.getValue();
    if (
      userObject != null &&
      userObject.nodeType === mxConstants.NODETYPE_ELEMENT
    ) {
      userObject.setAttribute(name, value);
    }
  }

  /**
   * Returns a clone of the cell. Uses <cloneValue> to clone
   * the user object. All fields in <mxTransient> are ignored
   * during the cloning.
   */
  // clone(): mxCell;
  clone(): mxCell {
    const c = clone(this, this.mxTransient);
    c.setValue(this.cloneValue());
    return c;
  }

  /**
   * Returns a clone of the cell's user object.
   */
  // cloneValue(): any;
  cloneValue(): any {
    let value = this.getValue();
    if (value != null) {
      if (typeof value.clone === 'function') {
        value = value.clone();
      } else if (value.nodeType != null) {
        value = value.cloneNode(true);
      }
    }
    return value;
  }
}

export default mxCell;
// import('../../serialization/mxCellCodec');
