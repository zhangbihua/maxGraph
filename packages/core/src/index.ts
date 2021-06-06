import mxClient from './mxClient';

import CellAttributeChange from './view/cell/CellAttributeChange';
import ChildChange from './view/model/ChildChange';
import CollapseChange from './view/folding/CollapseChange';
import CurrentRootChange from './view/view/CurrentRootChange';
import GeometryChange from './view/geometry/GeometryChange';
import RootChange from './view/model/RootChange';
import SelectionChange from './view/selection/SelectionChange';
import StyleChange from './view/style/StyleChange';
import TerminalChange from './view/cell/edge/TerminalChange';
import ValueChange from './view/cell/ValueChange';
import VisibleChange from './view/style/VisibleChange';

import mxDefaultKeyHandler from './editor/mxDefaultKeyHandler';
import mxDefaultPopupMenu from './editor/mxDefaultPopupMenu';
import mxDefaultToolbar from './editor/mxDefaultToolbar';
import mxEditor from './editor/mxEditor';

import mxCellHighlight from './view/selection/mxCellHighlight';
import CellMarker from './view/cell/CellMarker';
import mxCellTracker from './view/event/mxCellTracker';
import mxConnectionHandler from './view/connection/mxConnectionHandler';
import mxConstraintHandler from './view/connection/mxConstraintHandler';
import mxEdgeHandler from './view/cell/edge/mxEdgeHandler';
import mxEdgeSegmentHandler from './view/cell/edge/mxEdgeSegmentHandler';
import mxElbowEdgeHandler from './view/cell/edge/mxElbowEdgeHandler';
import GraphHandler from './view/GraphHandler';
import mxHandle from './view/cell/edge/mxHandle';
import mxKeyHandler from './view/event/mxKeyHandler';
import PanningHandler from './view/panning/PanningHandler';
import PopupMenuHandler from './view/popups_menus/PopupMenuHandler';
import mxRubberband from './view/selection/mxRubberband';
import mxSelectionCellsHandler from './view/selection/mxSelectionCellsHandler';
import TooltipHandler from './view/tooltip/TooltipHandler';
import mxVertexHandler from './view/cell/vertex/mxVertexHandler';

import mxCircleLayout from './view/layout/layout/mxCircleLayout';
import mxCompactTreeLayout from './view/layout/layout/mxCompactTreeLayout';
import mxCompositeLayout from './view/layout/layout/mxCompositeLayout';
import mxEdgeLabelLayout from './view/layout/layout/mxEdgeLabelLayout';
import mxFastOrganicLayout from './view/layout/layout/mxFastOrganicLayout';
import mxGraphLayout from './view/layout/layout/mxGraphLayout';
import mxParallelEdgeLayout from './view/layout/layout/mxParallelEdgeLayout';
import mxPartitionLayout from './view/layout/layout/mxPartitionLayout';
import mxRadialTreeLayout from './view/layout/layout/mxRadialTreeLayout';
import mxStackLayout from './view/layout/layout/mxStackLayout';

import mxHierarchicalEdgeStyle from './view/layout/layout/hierarchical/mxHierarchicalEdgeStyle';
import mxHierarchicalLayout from './view/layout/layout/hierarchical/mxHierarchicalLayout';
import mxSwimlaneLayout from './view/layout/layout/hierarchical/mxSwimlaneLayout';

import mxGraphAbstractHierarchyCell from './view/layout/layout/hierarchical/model/mxGraphAbstractHierarchyCell';
import mxGraphHierarchyEdge from './view/layout/layout/hierarchical/model/mxGraphHierarchyEdge';
import mxGraphHierarchyModel from './view/layout/layout/hierarchical/model/mxGraphHierarchyModel';
import mxGraphHierarchyNode from './view/layout/layout/hierarchical/model/mxGraphHierarchyNode';
import mxSwimlaneModel from './view/layout/layout/hierarchical/model/mxSwimlaneModel';

import mxCoordinateAssignment from './view/layout/layout/hierarchical/stage/mxCoordinateAssignment';
import mxHierarchicalLayoutStage from './view/layout/layout/hierarchical/stage/mxHierarchicalLayoutStage';
import mxMedianHybridCrossingReduction from './view/layout/layout/hierarchical/stage/mxMedianHybridCrossingReduction';
import mxMinimumCycleRemover from './view/layout/layout/hierarchical/stage/mxMinimumCycleRemover';
import mxSwimlaneOrdering from './view/layout/layout/hierarchical/stage/mxSwimlaneOrdering';

import mxCellCodec from './util/serialization/mxCellCodec';
import mxChildChangeCodec from './util/serialization/mxChildChangeCodec';
import mxCodec from './util/serialization/mxCodec';
import mxCodecRegistry from './util/serialization/mxCodecRegistry';
import mxDefaultKeyHandlerCodec from './util/serialization/mxDefaultKeyHandlerCodec';
import mxDefaultPopupMenuCodec from './util/serialization/mxDefaultPopupMenuCodec';
import mxDefaultToolbarCodec from './util/serialization/mxDefaultToolbarCodec';
import mxEditorCodec from './util/serialization/mxEditorCodec';
import mxGenericChangeCodec from './util/serialization/mxGenericChangeCodec';
import mxGraphCodec from './util/serialization/mxGraphCodec';
import mxGraphViewCodec from './util/serialization/mxGraphViewCodec';
import mxModelCodec from './util/serialization/mxModelCodec';
import mxObjectCodec from './util/serialization/mxObjectCodec';
import mxRootChangeCodec from './util/serialization/mxRootChangeCodec';
import mxStylesheetCodec from './util/serialization/mxStylesheetCodec';
import mxTerminalChangeCodec from './util/serialization/mxTerminalChangeCodec';

import Actor from './view/geometry/shape/Actor';
import Label from './view/geometry/shape/Label';
import Shape from './view/geometry/shape/Shape';
import Swimlane from './view/geometry/shape/Swimlane';
import mxText from './view/geometry/shape/mxText';
import Triangle from './view/geometry/shape/Triangle';

import mxArrow from './view/geometry/shape/edge/mxArrow';
import mxArrowConnector from './view/geometry/shape/edge/mxArrowConnector';
import mxConnector from './view/geometry/shape/edge/mxConnector';
import mxLine from './view/geometry/shape/edge/mxLine';
import mxMarker from './view/geometry/shape/edge/mxMarker';
import mxPolyline from './view/geometry/shape/edge/mxPolyline';

import Cloud from './view/geometry/shape/node/Cloud';
import Cylinder from './view/geometry/shape/node/Cylinder';
import DoubleEllipse from './view/geometry/shape/node/DoubleEllipse';
import Ellipse from './view/geometry/shape/node/Ellipse';
import Hexagon from './view/geometry/shape/node/Hexagon';
import ImageShape from './view/geometry/shape/node/ImageShape';
import RectangleShape from './view/geometry/shape/node/RectangleShape';
import Rhombus from './view/geometry/shape/node/Rhombus';
import Stencil from './view/geometry/shape/node/Stencil';
import StencilRegistry from './view/geometry/shape/node/StencilRegistry';

import * as mxConstants from './util/Constants';
import mxGuide from './util/Guide';
import Resources from './util/Resources';
import utils from './util/Utils';
import * as mxCloneUtils from './util/CloneUtils';
import * as mxDomUtils from './util/DomUtils';
import * as mxEventUtils from './util/EventUtils';
import * as mxGestureUtils from './util/GestureUtils';
import * as mxStringUtils from './util/StringUtils';
import * as mxXmlUtils from './util/XmlUtils';

import mxAnimation from './util/animate/mxAnimation';
import mxEffects from './util/animate/mxEffects';
import mxMorphing from './util/animate/mxMorphing';

import mxAbstractCanvas2D from './util/canvas/mxAbstractCanvas2D';
import mxSvgCanvas2D from './util/canvas/mxSvgCanvas2D';
import mxXmlCanvas2D from './util/canvas/mxXmlCanvas2D';

import mxDictionary from './util/mxDictionary';
import Geometry from './view/geometry/Geometry';
import mxObjectIdentity from './util/mxObjectIdentity';
import Point from './view/geometry/Point';
import Rectangle from './view/geometry/Rectangle';

import EdgeStyle from './view/style/EdgeStyle';
import Perimeter from './view/style/Perimeter';
import StyleRegistry from './view/style/StyleRegistry';
import Stylesheet from './view/style/Stylesheet';

import mxDivResizer from './util/dom/mxDivResizer';
import * as mxDomHelpers from './util/dom/mxDomHelpers';

import DragSource from './view/drag_drop/DragSource';
import PanningManager from './view/panning/PanningManager';

import InternalEvent from './view/event/InternalEvent';
import EventObject from './view/event/EventObject';
import EventSource from './view/event/EventSource';
import InternalMouseEvent from './view/event/InternalMouseEvent';

import mxForm from './util/gui/mxForm';
import mxLog from './util/gui/mxLog';
import mxPopupMenu from './util/gui/mxPopupMenu';
import mxToolbar from './util/gui/mxToolbar';
import mxWindow from './util/gui/mxWindow';

import Image from './view/image/Image';
import ImageBundle from './view/image/ImageBundle';
import ImageExport from './view/image/ImageExport';

import mxUrlConverter from './util/network/mxUrlConverter';
import mxXmlRequest from './util/network/mxXmlRequest';

import mxAutoSaveManager from './util/storage/mxAutoSaveManager';
import mxClipboard from './util/storage/mxClipboard';

import mxUndoableEdit from './view/model/mxUndoableEdit';
import mxUndoManager from './util/mxUndoManager';

import Cell from './view/cell/datatypes/Cell';
import CellEditor from './view/editing/CellEditor';
import CellOverlay from './view/cell/CellOverlay';
import CellPath from './view/cell/datatypes/CellPath';
import CellRenderer from './view/cell/CellRenderer';
import CellState from './view/cell/datatypes/CellState';
import CellStatePreview from './view/cell/CellStatePreview';
import TemporaryCellStates from './view/cell/TemporaryCellStates';

import mxConnectionConstraint from './view/connection/mxConnectionConstraint';
import Multiplicity from './view/validation/Multiplicity';

import graph from './view/Graph';
import Model from './view/model/Model';
import mxGraphSelectionModel from './view/selection/mxGraphSelectionModel';
import GraphView from './view/view/GraphView';
import LayoutManager from './view/layout/LayoutManager';
import Outline from './view/Outline';
import PrintPreview from './view/printing/PrintPreview';
import SwimlaneManager from './view/layout/SwimlaneManager';

import '../css/common.css';

export default {
  mxClient,
  mxLog,
  mxObjectIdentity,
  mxDictionary,
  mxResources: Resources,
  mxPoint: Point,
  mxRectangle: Rectangle,
  mxEffects,
  mxUtils: utils,
  mxConstants,
  mxEventObject: EventObject,
  mxMouseEvent: InternalMouseEvent,
  mxEventSource: EventSource,
  mxEvent: InternalEvent,
  mxXmlRequest,
  mxClipboard,
  mxWindow,
  mxForm,
  mxImage: Image,
  mxDivResizer,
  mxDragSource: DragSource,
  mxToolbar,
  mxUndoableEdit,
  mxUndoManager,
  mxUrlConverter,
  mxPanningManager: PanningManager,
  mxPopupMenu,
  mxAutoSaveManager,
  mxAnimation,
  mxMorphing,
  mxImageBundle: ImageBundle,
  mxImageExport: ImageExport,
  mxAbstractCanvas2D,
  mxXmlCanvas2D,
  mxSvgCanvas2D,
  mxGuide,
  mxShape: Shape,
  mxStencil: Stencil,
  mxStencilRegistry: StencilRegistry,
  mxMarker,
  mxActor: Actor,
  mxCloud: Cloud,
  mxRectangleShape: RectangleShape,
  mxEllipse: Ellipse,
  mxDoubleEllipse: DoubleEllipse,
  mxRhombus: Rhombus,
  mxPolyline,
  mxArrow,
  mxArrowConnector,
  mxText,
  mxTriangle: Triangle,
  mxHexagon: Hexagon,
  mxLine,
  mxImageShape: ImageShape,
  mxLabel: Label,
  mxCylinder: Cylinder,
  mxConnector,
  mxSwimlane: Swimlane,
  mxGraphLayout,
  mxStackLayout,
  mxPartitionLayout,
  mxCompactTreeLayout,
  mxRadialTreeLayout,
  mxFastOrganicLayout,
  mxCircleLayout,
  mxParallelEdgeLayout,
  mxCompositeLayout,
  mxEdgeLabelLayout,
  mxGraphAbstractHierarchyCell,
  mxGraphHierarchyNode,
  mxGraphHierarchyEdge,
  mxGraphHierarchyModel,
  mxSwimlaneModel,
  mxHierarchicalLayoutStage,
  mxMedianHybridCrossingReduction,
  mxMinimumCycleRemover,
  mxCoordinateAssignment,
  mxSwimlaneOrdering,
  mxHierarchicalLayout,
  mxSwimlaneLayout,
  mxGraphModel: Model,
  mxCell: Cell,
  mxGeometry: Geometry,
  mxCellPath: CellPath,
  mxPerimeter: Perimeter,
  mxPrintPreview: PrintPreview,
  mxStylesheet: Stylesheet,
  mxCellState: CellState,
  mxGraphSelectionModel,
  mxCellEditor: CellEditor,
  mxCellRenderer: CellRenderer,
  mxEdgeStyle: EdgeStyle,
  mxStyleRegistry: StyleRegistry,
  mxGraphView: GraphView,
  mxGraph: graph,
  mxCellOverlay: CellOverlay,
  mxOutline: Outline,
  mxMultiplicity: Multiplicity,
  mxLayoutManager: LayoutManager,
  mxSwimlaneManager: SwimlaneManager,
  mxTemporaryCellStates: TemporaryCellStates,
  mxCellStatePreview: CellStatePreview,
  mxConnectionConstraint,
  mxGraphHandler: GraphHandler,
  mxPanningHandler: PanningHandler,
  mxPopupMenuHandler: PopupMenuHandler,
  mxCellMarker: CellMarker,
  mxSelectionCellsHandler,
  mxConnectionHandler,
  mxConstraintHandler,
  mxRubberband,
  mxHandle,
  mxVertexHandler,
  mxEdgeHandler,
  mxElbowEdgeHandler,
  mxEdgeSegmentHandler,
  mxKeyHandler,
  mxTooltipHandler: TooltipHandler,
  mxCellTracker,
  mxCellHighlight,
  mxDefaultKeyHandler,
  mxDefaultPopupMenu,
  mxDefaultToolbar,
  mxEditor,
  mxCodecRegistry,
  mxCodec,
  mxObjectCodec,
  mxCellCodec,
  mxModelCodec,
  mxRootChangeCodec,
  mxChildChangeCodec,
  mxTerminalChangeCodec,
  mxGenericChangeCodec,
  // mxGraphCodec,
  // mxGraphViewCodec,
  // mxStylesheetCodec,
  // mxDefaultKeyHandlerCodec,
  // mxDefaultToolbarCodec,
  // mxDefaultPopupMenuCodec,
  // mxEditorCodec,
  mxCloneUtils,
  mxDomUtils,
  mxEventUtils,
  mxGestureUtils,
  mxStringUtils,
  mxXmlUtils,
  mxDomHelpers,
  mxCellAttributeChange: CellAttributeChange,
  mxChildChange: ChildChange,
  mxCollapseChange: CollapseChange,
  mxCurrentRootChange: CurrentRootChange,
  mxGeometryChange: GeometryChange,
  mxRootChange: RootChange,
  mxSelectionChange: SelectionChange,
  mxStyleChange: StyleChange,
  mxTerminalChange: TerminalChange,
  mxValueChange: ValueChange,
  mxVisibleChange: VisibleChange,
};
