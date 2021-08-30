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

import * as Constants from './util/Constants';
import Guide from './util/Guide';
import Resources from './util/Resources';
import utils from './util/Utils';
import * as CloneUtils from './util/CloneUtils';
import * as DomUtils from './util/DomUtils';
import * as EventUtils from './util/EventUtils';
import * as GestureUtils from './util/GestureUtils';
import * as StringUtils from './util/StringUtils';
import * as XmlUtils from './util/XmlUtils';

import mxAnimation from './util/animate/mxAnimation';
import mxEffects from './util/animate/mxEffects';
import mxMorphing from './util/animate/mxMorphing';

import AbstractCanvas2D from './util/canvas/AbstractCanvas2D';
import SvgCanvas2D from './util/canvas/SvgCanvas2D';
import mxXmlCanvas2D from './util/canvas/mxXmlCanvas2D';

import Dictionary from './util/Dictionary';
import Geometry from './view/geometry/Geometry';
import ObjectIdentity from './util/ObjectIdentity';
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
import PopupMenu from './util/gui/PopupMenu';
import mxToolbar from './util/gui/mxToolbar';
import mxWindow from './util/gui/mxWindow';

import ImageBox from './view/image/ImageBox';
import ImageBundle from './view/image/ImageBundle';
import ImageExport from './view/image/ImageExport';

import mxUrlConverter from './util/network/mxUrlConverter';
import mxXmlRequest from './util/network/mxXmlRequest';

import mxAutoSaveManager from './util/storage/mxAutoSaveManager';
import Clipboard from './util/storage/Clipboard';

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

import Graph from './view/Graph';
import Model from './view/model/Model';
import GraphView from './view/view/GraphView';
import LayoutManager from './view/layout/LayoutManager';
import Outline from './view/Outline';
import PrintPreview from './view/printing/PrintPreview';
import SwimlaneManager from './view/layout/SwimlaneManager';

import '../css/common.css';

export default {
  mxClient,
  mxLog,
  ObjectIdentity,
  Dictionary,
  Resources,
  Point,
  Rectangle,
  mxEffects,
  utils,
  Constants,
  EventObject,
  InternalMouseEvent,
  EventSource,
  InternalEvent,
  mxXmlRequest,
  Clipboard,
  mxWindow,
  mxForm,
  Image,
  mxDivResizer,
  DragSource,
  mxToolbar,
  UndoableEdit,
  mxUndoManager,
  mxUrlConverter,
  PanningManager,
  PopupMenu,
  mxAutoSaveManager,
  mxAnimation,
  mxMorphing,
  ImageBox,
  ImageBundle,
  ImageExport,
  AbstractCanvas2D,
  mxXmlCanvas2D,
  SvgCanvas2D,
  Guide,
  Shape,
  StencilShape,
  StencilShapeRegistry,
  Marker,
  Actor,
  CloudShape,
  RectangleShape,
  EllipseShape,
  DoubleEllipseShape,
  RhombusShape,
  Polyline,
  Arrow,
  ArrowConnector,
  TextShape,
  TriangleShape,
  HexagonShape,
  Line,
  ImageShape,
  Label,
  CylinderShape,
  Connector,
  SwimlaneShape,
  GraphLayout,
  StackLayout,
  PartitionLayout,
  CompactTreeLayout,
  RadialTreeLayout,
  MxFastOrganicLayout,
  CircleLayout,
  ParallelEdgeLayout,
  CompositeLayout,
  EdgeLabelLayout,
  MxGraphAbstractHierarchyCell,
  GraphHierarchyNode,
  GraphHierarchyEdge,
  GraphHierarchyModel,
  SwimlaneModel,
  MxHierarchicalLayoutStage,
  MedianHybridCrossingReduction,
  MinimumCycleRemover,
  CoordinateAssignment,
  mxSwimlaneOrdering,
  mxHierarchicalLayout,
  SwimlaneLayout,
  Model,
  Cell,
  Geometry,
  CellPath,
  Perimeter,
  PrintPreview,
  Stylesheet,
  CellState,
  CellEditor,
  CellRenderer,
  EdgeStyle,
  StyleRegistry,
  GraphView,
  Graph,
  CellOverlay,
  Outline,
  Multiplicity,
  LayoutManager,
  SwimlaneManager,
  TemporaryCellStates,
  CellStatePreview,
  ConnectionConstraint,
  GraphHandler,
  PanningHandler,
  PopupMenuHandler,
  CellMarker,
  SelectionCellsHandler,
  ConnectionHandler,
  ConstraintHandler,
  RubberBand,
  VertexHandle,
  VertexHandler,
  EdgeHandler,
  ElbowEdgeHandler,
  EdgeSegmentHandler,
  mxKeyHandler,
  TooltipHandler,
  CellTracker,
  CellHighlight,
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
  CloneUtils,
  DomUtils,
  EventUtils,
  GestureUtils,
  StringUtils,
  XmlUtils,
  mxDomHelpers,
  CellAttributeChange,
  ChildChange,
  CollapseChange,
  CurrentRootChange,
  GeometryChange,
  RootChange,
  SelectionChange,
  StyleChange,
  TerminalChange,
  ValueChange,
  VisibleChange,
};
