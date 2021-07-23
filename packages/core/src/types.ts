import type Cell from './view/cell/datatypes/Cell';

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
  backgroundColor: ColorValue;
  backgroundOutline: number;
  curved: boolean;
  dashed: boolean;
  dashPattern: string;
  direction: DirectionValue;
  endArrow: ArrowType;
  endFill: boolean;
  endSize: number;
  fillColor: ColorValue;
  fillOpacity: number;
  fixDash: boolean;
  flipH: boolean;
  flipV: boolean;
  fontColor: ColorValue;
  fontFamily: string;
  fontSize: number;
  fontStyle: number;
  glass: boolean;
  gradientColor: ColorValue;
  gradientDirection: DirectionValue;
  horizontal: boolean;
  imageAlign: AlignValue;
  imageAspect: boolean;
  imageBackground: ColorValue;
  imageBorder: ColorValue;
  imageHeight: number;
  imageWidth: number;
  indicatorWidth: number;
  indicatorHeight: number;
  labelBorderColor: ColorValue;
  labelPosition: AlignValue;
  margin: number;
  opacity: number;
  pointerEvents: boolean;
  rotation: number;
  rounded: boolean;
  separatorColor: ColorValue;
  shadow: boolean;
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
  textDirection: TextDirectionValue;
  textOpacity: number;
  verticalAlign: VAlignValue;
  verticalLabelPosition: VAlignValue;
};

export type ColorValue = string;
export type DirectionValue = 'north' | 'south' | 'east' | 'west';
export type TextDirectionValue = '' | 'ltr' | 'rtl' | 'auto';
export type AlignValue = 'left' | 'center' | 'right';
export type VAlignValue = 'top' | 'middle' | 'bottom';
export type OverflowValue = 'fill' | 'width' | 'auto' | 'hidden' | 'scroll' | 'visible';
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
