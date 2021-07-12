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

import CellHighlight from './view/selection/CellHighlight';
import CellMarker from './view/cell/CellMarker';
import CellTracker from './view/event/CellTracker';
import ConnectionHandler from './view/connection/ConnectionHandler';
import ConstraintHandler from './view/connection/ConstraintHandler';
import EdgeHandler from './view/cell/edge/EdgeHandler';
import EdgeSegmentHandler from './view/cell/edge/EdgeSegmentHandler';
import ElbowEdgeHandler from './view/cell/edge/ElbowEdgeHandler';
import GraphHandler from './view/GraphHandler';
import VertexHandle from './view/cell/vertex/VertexHandle';
import mxKeyHandler from './view/event/mxKeyHandler';
import PanningHandler from './view/panning/PanningHandler';
import PopupMenuHandler from './view/popups_menus/PopupMenuHandler';
import RubberBand from './view/selection/RubberBand';
import SelectionCellsHandler from './view/selection/SelectionCellsHandler';
import TooltipHandler from './view/tooltip/TooltipHandler';
import VertexHandler from './view/cell/vertex/VertexHandler';

import CircleLayout from './view/layout/layout/CircleLayout';
import CompactTreeLayout from './view/layout/layout/CompactTreeLayout';
import CompositeLayout from './view/layout/layout/CompositeLayout';
import EdgeLabelLayout from './view/layout/layout/EdgeLabelLayout';
import MxFastOrganicLayout from './view/layout/layout/FastOrganicLayout';
import GraphLayout from './view/layout/layout/GraphLayout';
import ParallelEdgeLayout from './view/layout/layout/ParallelEdgeLayout';
import PartitionLayout from './view/layout/layout/PartitionLayout';
import RadialTreeLayout from './view/layout/layout/RadialTreeLayout';
import StackLayout from './view/layout/layout/StackLayout';

import HierarchicalEdgeStyle from './view/layout/layout/hierarchical/HierarchicalEdgeStyle';
import mxHierarchicalLayout from './view/layout/layout/hierarchical/mxHierarchicalLayout';
import SwimlaneLayout from './view/layout/layout/hierarchical/SwimlaneLayout';

import MxGraphAbstractHierarchyCell from './view/layout/layout/hierarchical/model/GraphAbstractHierarchyCell';
import GraphHierarchyEdge from './view/layout/layout/hierarchical/model/GraphHierarchyEdge';
import GraphHierarchyModel from './view/layout/layout/hierarchical/model/GraphHierarchyModel';
import GraphHierarchyNode from './view/layout/layout/hierarchical/model/GraphHierarchyNode';
import SwimlaneModel from './view/layout/layout/hierarchical/model/SwimlaneModel';

import CoordinateAssignment from './view/layout/layout/hierarchical/stage/CoordinateAssignment';
import MxHierarchicalLayoutStage from './view/layout/layout/hierarchical/stage/HierarchicalLayoutStage';
import MedianHybridCrossingReduction from './view/layout/layout/hierarchical/stage/MedianHybridCrossingReduction';
import MinimumCycleRemover from './view/layout/layout/hierarchical/stage/MinimumCycleRemover';
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
import Label from './view/geometry/shape/node/LabelShape';
import Shape from './view/geometry/shape/Shape';
import SwimlaneShape from './view/geometry/shape/node/SwimlaneShape';
import TextShape from './view/geometry/shape/node/TextShape';
import TriangleShape from './view/geometry/shape/node/TriangleShape';

import Arrow from './view/geometry/shape/edge/Arrow';
import ArrowConnector from './view/geometry/shape/edge/ArrowConnector';
import Connector from './view/geometry/shape/edge/Connector';
import Line from './view/geometry/shape/edge/Line';
import Marker from './view/geometry/shape/edge/Marker';
import Polyline from './view/geometry/shape/edge/Polyline';

import CloudShape from './view/geometry/shape/node/CloudShape';
import CylinderShape from './view/geometry/shape/node/CylinderShape';
import DoubleEllipseShape from './view/geometry/shape/node/DoubleEllipseShape';
import EllipseShape from './view/geometry/shape/node/EllipseShape';
import HexagonShape from './view/geometry/shape/node/HexagonShape';
import ImageShape from './view/geometry/shape/node/ImageShape';
import RectangleShape from './view/geometry/shape/node/RectangleShape';
import RhombusShape from './view/geometry/shape/node/RhombusShape';
import StencilShape from './view/geometry/shape/node/StencilShape';
import StencilShapeRegistry from './view/geometry/shape/node/StencilShapeRegistry';

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

import Dictionary from './util/Dictionary';
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

import UndoableEdit from './view/model/UndoableEdit';
import mxUndoManager from './util/mxUndoManager';

import Cell from './view/cell/datatypes/Cell';
import CellEditor from './view/editing/CellEditor';
import CellOverlay from './view/cell/CellOverlay';
import CellPath from './view/cell/datatypes/CellPath';
import CellRenderer from './view/cell/CellRenderer';
import CellState from './view/cell/datatypes/CellState';
import CellStatePreview from './view/cell/CellStatePreview';
import TemporaryCellStates from './view/cell/TemporaryCellStates';

import ConnectionConstraint from './view/connection/ConnectionConstraint';
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
  mxDictionary: Dictionary,
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
  mxUndoableEdit: UndoableEdit,
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
  mxStencil: StencilShape,
  mxStencilRegistry: StencilShapeRegistry,
  mxMarker: Marker,
  mxActor: Actor,
  mxCloud: CloudShape,
  mxRectangleShape: RectangleShape,
  mxEllipse: EllipseShape,
  mxDoubleEllipse: DoubleEllipseShape,
  mxRhombus: RhombusShape,
  mxPolyline: Polyline,
  mxArrow: Arrow,
  mxArrowConnector: ArrowConnector,
  mxText: TextShape,
  mxTriangle: TriangleShape,
  mxHexagon: HexagonShape,
  mxLine: Line,
  mxImageShape: ImageShape,
  mxLabel: Label,
  mxCylinder: CylinderShape,
  mxConnector: Connector,
  mxSwimlane: SwimlaneShape,
  mxGraphLayout: GraphLayout,
  mxStackLayout: StackLayout,
  mxPartitionLayout: PartitionLayout,
  mxCompactTreeLayout: CompactTreeLayout,
  mxRadialTreeLayout: RadialTreeLayout,
  mxFastOrganicLayout: MxFastOrganicLayout,
  mxCircleLayout: CircleLayout,
  mxParallelEdgeLayout: ParallelEdgeLayout,
  mxCompositeLayout: CompositeLayout,
  mxEdgeLabelLayout: EdgeLabelLayout,
  mxGraphAbstractHierarchyCell: MxGraphAbstractHierarchyCell,
  mxGraphHierarchyNode: GraphHierarchyNode,
  mxGraphHierarchyEdge: GraphHierarchyEdge,
  mxGraphHierarchyModel: GraphHierarchyModel,
  mxSwimlaneModel: SwimlaneModel,
  mxHierarchicalLayoutStage: MxHierarchicalLayoutStage,
  mxMedianHybridCrossingReduction: MedianHybridCrossingReduction,
  mxMinimumCycleRemover: MinimumCycleRemover,
  mxCoordinateAssignment: CoordinateAssignment,
  mxSwimlaneOrdering,
  mxHierarchicalLayout,
  mxSwimlaneLayout: SwimlaneLayout,
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
  mxConnectionConstraint: ConnectionConstraint,
  mxGraphHandler: GraphHandler,
  mxPanningHandler: PanningHandler,
  mxPopupMenuHandler: PopupMenuHandler,
  mxCellMarker: CellMarker,
  mxSelectionCellsHandler: SelectionCellsHandler,
  mxConnectionHandler: ConnectionHandler,
  mxConstraintHandler: ConstraintHandler,
  mxRubberband: RubberBand,
  mxHandle: VertexHandle,
  mxVertexHandler: VertexHandler,
  mxEdgeHandler: EdgeHandler,
  mxElbowEdgeHandler: ElbowEdgeHandler,
  mxEdgeSegmentHandler: EdgeSegmentHandler,
  mxKeyHandler,
  mxTooltipHandler: TooltipHandler,
  mxCellTracker: CellTracker,
  mxCellHighlight: CellHighlight,
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
