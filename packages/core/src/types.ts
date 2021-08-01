import type Cell from './view/cell/datatypes/Cell';
import CellState from './view/cell/datatypes/CellState';
import RectangleShape from './view/geometry/shape/node/RectangleShape';
import type Shape from './view/geometry/shape/Shape';
import type Graph from './view/Graph';
import ImageBox from './view/image/ImageBox';

export type CellMap = {
  [id: string]: Cell;
};

export type FilterFunction = (cell: Cell) => boolean;

export type UndoableChange = {
  execute: () => void;
  undo?: () => void;
  redo?: () => void;
};

export type StyleValue = string | number;

export type StyleProperties = {
  [k: string]: StyleValue;
};

export type Properties = {
  [k: string]: any;
};

export type CellStateStyles = {
  absoluteArcSize: number;
  align: AlignValue;
  arcSize: number;
  aspect: string;
  autosize: boolean;
  backgroundColor: ColorValue;
  backgroundOutline: number;
  bendable: boolean;
  cloneable: boolean;
  curved: boolean;
  dashed: boolean;
  dashPattern: string;
  defaultEdge: CellStateStyles;
  defaultVertex: CellStateStyles;
  deletable: boolean;
  direction: DirectionValue;
  edge: string;
  editable: boolean;
  endArrow: ArrowType;
  endFill: boolean;
  endSize: number;
  entryX: number;
  entryY: number;
  exitX: number;
  exitY: number;
  fillColor: ColorValue;
  fillOpacity: number;
  fixDash: boolean;
  flipH: boolean;
  flipV: boolean;
  foldable: boolean;
  fontColor: ColorValue;
  fontFamily: string;
  fontSize: number;
  fontStyle: number;
  glass: boolean;
  gradientColor: ColorValue;
  gradientDirection: DirectionValue;
  horizontal: boolean;
  image: string;
  imageAlign: AlignValue;
  imageAspect: boolean;
  imageBackground: ColorValue;
  imageBorder: ColorValue;
  imageHeight: number;
  imageWidth: number;
  indicatorColor: ColorValue;
  indicatorHeight: number;
  indicatorImage: string;
  indicatorShape: Shape;
  indicatorWidth: number;
  labelBorderColor: ColorValue;
  labelPosition: AlignValue;
  loop: Function;
  margin: number;
  movable: boolean;
  noEdgeStyle: boolean;
  opacity: number;
  overflow: OverflowValue;
  perimeter: Function | string | null;
  perimeterSpacing: number;
  pointerEvents: boolean;
  resizeable: boolean;
  resizeHeight: boolean;
  resizeWidth: boolean;
  rotatable: boolean;
  rotation: number;
  rounded: boolean;
  routingCenterX: number;
  routingCenterY: number;
  separatorColor: ColorValue;
  shadow: boolean;
  shape: ShapeValue;
  sourcePerimeterSpacing: number;
  sourcePort: string;
  spacing: number;
  spacingBottom: number;
  spacingLeft: number;
  spacingRight: number;
  spacingTop: number;
  startArrow: ArrowType;
  startFill: boolean;
  startSize: number;
  strokeColor: ColorValue;
  strokeOpacity: number;
  strokeWidth: number;
  swimlaneFillColor: ColorValue;
  swimlaneLine: boolean;
  targetPerimeterSpacing: number;
  targetPort: string;
  textDirection: TextDirectionValue;
  textOpacity: number;
  verticalAlign: VAlignValue;
  verticalLabelPosition: VAlignValue;
  whiteSpace: WhiteSpaceValue;
};

export type ColorValue = string;
export type DirectionValue = 'north' | 'south' | 'east' | 'west';
export type TextDirectionValue = '' | 'ltr' | 'rtl' | 'auto';
export type AlignValue = 'left' | 'center' | 'right';
export type VAlignValue = 'top' | 'middle' | 'bottom';
export type OverflowValue = 'fill' | 'width' | 'auto' | 'hidden' | 'scroll' | 'visible';
export type WhiteSpaceValue = 'normal' | 'wrap' | 'nowrap' | 'pre';
export type ArrowType =
  | 'none'
  | 'classic'
  | 'classicThin'
  | 'block'
  | 'blockThin'
  | 'open'
  | 'openThin'
  | 'oval'
  | 'diamond'
  | 'diamondThin';
export type ShapeValue =
  | 'rectangle'
  | 'ellipse'
  | 'doubleEllipse'
  | 'rhombus'
  | 'line'
  | 'image'
  | 'arrow'
  | 'arrowConnector'
  | 'label'
  | 'cylinder'
  | 'swimlane'
  | 'connector'
  | 'actor'
  | 'cloud'
  | 'triangle'
  | 'hexagon';

export type CanvasState = {
  dx: number;
  dy: number;
  scale: number;
  alpha: number;
  fillAlpha: number;
  strokeAlpha: number;
  fillColor: ColorValue;
  gradientFillAlpha: number;
  gradientColor: ColorValue;
  gradientAlpha: number;
  gradientDirection: DirectionValue;
  strokeColor: ColorValue;
  strokeWidth: number;
  dashed: boolean;
  dashPattern: string;
  fixDash: boolean;
  lineCap: string;
  lineJoin: string;
  miterLimit: number;
  fontColor: ColorValue;
  fontBackgroundColor: ColorValue;
  fontBorderColor: ColorValue;
  fontSize: number;
  fontFamily: string;
  fontStyle: number;
  shadow: boolean;
  shadowColor: ColorValue;
  shadowAlpha: number;
  shadowDx: number;
  shadowDy: number;
  rotation: number;
  rotationCx: number;
  rotationCy: number;
  transform: string | null;
};

export interface Gradient extends SVGLinearGradientElement {
  mxRefCount: number;
}

export type GradientMap = {
  [k: string]: Gradient;
};

export interface GraphPlugin {
  onInit: (graph: Graph) => void;
  onDestroy: () => void;
}

// Events

export type Listener = {
  name: string;
  f: EventListener;
};

export type ListenerTarget = {
  mxListenerList?: Listener[];
};

export type Listenable = (Node | Window) & ListenerTarget;

export type GestureEvent = Event &
  MouseEvent & {
    scale?: number;
    pointerId?: number;
  };

export type EventCache = GestureEvent[];

export interface CellHandle {
  state: CellState;
  cursor: string;
  image: ImageBox | null;
  shape: Shape | null;
  setVisible: (v: boolean) => void;
}
