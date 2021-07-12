/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 * Type definitions from the typed-mxgraph project
 */

import mxClient from '../../../../mxClient';
import {
  ABSOLUTE_LINE_HEIGHT,
  ALIGN_BOTTOM,
  ALIGN_CENTER,
  ALIGN_MIDDLE,
  ALIGN_RIGHT,
  DEFAULT_FONTFAMILY,
  DEFAULT_FONTSIZE,
  DEFAULT_FONTSTYLE,
  DEFAULT_TEXT_DIRECTION,
  DIALECT_STRICTHTML,
  FONT_BOLD,
  FONT_ITALIC,
  FONT_STRIKETHROUGH,
  FONT_UNDERLINE,
  LINE_HEIGHT,
  NONE,
  TEXT_DIRECTION_AUTO,
  TEXT_DIRECTION_LTR,
  TEXT_DIRECTION_RTL,
  WORD_WRAP,
} from '../../../../util/Constants';
import utils, {
  getAlignmentAsPoint,
  getBoundingBox,
  getValue,
} from '../../../../util/Utils';
import Point from '../../Point';
import mxSvgCanvas2D from '../../../../util/canvas/mxSvgCanvas2D';
import Shape from '../Shape';
import Rectangle from '../../Rectangle';
import CellState from '../../../cell/datatypes/CellState';
import { htmlEntities, replaceTrailingNewlines, trim } from '../../../../util/StringUtils';
import { isNode } from '../../../../util/DomUtils';

/**
 * Extends mxShape to implement a text shape.
 * To change vertical text from bottom to top to top to bottom,
 * the following code can be used:
 * @example
 * ```javascript
 * mxText.prototype.verticalTextRotation = 90;
 * ```
 * @class TextShape
 * @extends {Shape}
 */
class TextShape extends Shape {
  constructor(
    value: string,
    bounds: Rectangle,
    align: string = ALIGN_CENTER,
    valign: string | null = ALIGN_MIDDLE,
    color: string = 'black',
    family: string = DEFAULT_FONTFAMILY,
    size: number = DEFAULT_FONTSIZE,
    fontStyle: number = DEFAULT_FONTSTYLE,
    spacing: number = 2,
    spacingTop: number = 0,
    spacingRight: number = 0,
    spacingBottom: number = 0,
    spacingLeft: number = 0,
    horizontal: boolean = true,
    background: string | null = null,
    border: string | null = null,
    wrap: boolean = false,
    clipped: boolean = false,
    overflow: string = 'visible',
    labelPadding: number = 0,
    textDirection: string = DEFAULT_TEXT_DIRECTION
  ) {
    super();
    valign = valign != null ? valign : ALIGN_MIDDLE;

    this.value = value;
    this.bounds = bounds;
    this.color = color;
    this.align = align;
    this.valign = valign;
    this.family = family;
    this.size = size;
    this.fontStyle = fontStyle;
    this.spacing = parseInt(String(spacing || 2));
    this.spacingTop = parseInt(String(spacing || 2)) + parseInt(String(spacingTop || 0));
    this.spacingRight =
      parseInt(String(spacing || 2)) + parseInt(String(spacingRight || 0));
    this.spacingBottom =
      parseInt(String(spacing || 2)) + parseInt(String(spacingBottom || 0));
    this.spacingLeft =
      parseInt(String(spacing || 2)) + parseInt(String(spacingLeft || 0));
    this.horizontal = horizontal;
    this.background = background;
    this.border = border;
    this.wrap = wrap;
    this.clipped = clipped;
    this.overflow = overflow;
    this.labelPadding = labelPadding;
    this.textDirection = textDirection;
    this.rotation = 0;
    this.updateMargin();
  }

  // TODO: Document me!
  value: string | HTMLElement | SVGGElement | null;
  bounds: Rectangle;
  align: string = ALIGN_CENTER;
  valign: string = ALIGN_MIDDLE;
  color: string = 'black';
  family: string = DEFAULT_FONTFAMILY;
  size: number = DEFAULT_FONTSIZE;
  fontStyle: number = DEFAULT_FONTSTYLE;
  spacing: number = 2;
  spacingTop: number = 0;
  spacingRight: number = 0;
  spacingBottom: number = 0;
  spacingLeft: number = 0;
  horizontal: boolean = true;
  background: string | null = null;
  border: string | null = null;
  wrap: boolean = false;
  clipped: boolean = false;
  overflow: string = 'visible';
  labelPadding: number = 0;
  textDirection: string = DEFAULT_TEXT_DIRECTION;
  margin: Point | null = null;
  unrotatedBoundingBox: Rectangle | null = null;
  flipH: boolean = false;
  flipV: boolean = false;

  /**
   * Variable: baseSpacingTop
   *
   * Specifies the spacing to be added to the top spacing. Default is 0. Use the
   * value 5 here to get the same label positions as in mxGraph 1.x.
   */
  baseSpacingTop: number = 0;

  /**
   * Variable: baseSpacingBottom
   *
   * Specifies the spacing to be added to the bottom spacing. Default is 0. Use the
   * value 1 here to get the same label positions as in mxGraph 1.x.
   */
  baseSpacingBottom: number = 0;

  /**
   * Variable: baseSpacingLeft
   *
   * Specifies the spacing to be added to the left spacing. Default is 0.
   */
  baseSpacingLeft: number = 0;

  /**
   * Variable: baseSpacingRight
   *
   * Specifies the spacing to be added to the right spacing. Default is 0.
   */
  baseSpacingRight: number = 0;

  /**
   * Variable: replaceLinefeeds
   *
   * Specifies if linefeeds in HTML labels should be replaced with BR tags.
   * Default is true.
   */
  replaceLinefeeds: boolean = true;

  /**
   * Variable: verticalTextRotation
   *
   * Rotation for vertical text. Default is -90 (bottom to top).
   */
  verticalTextRotation: number = -90;

  /**
   * Variable: ignoreClippedStringSize
   *
   * Specifies if the string size should be measured in <updateBoundingBox> if
   * the label is clipped and the label position is center and middle. If this is
   * true, then the bounding box will be set to <bounds>. Default is true.
   * <ignoreStringSize> has precedence over this switch.
   */
  ignoreClippedStringSize: boolean = true;

  /**
   * Variable: ignoreStringSize
   *
   * Specifies if the actual string size should be measured. If disabled the
   * boundingBox will not ignore the actual size of the string, otherwise
   * <bounds> will be used instead. Default is false.
   */
  ignoreStringSize: boolean = false;

  /**
   * Variable: lastValue
   *
   * Contains the last rendered text value. Used for caching.
   */
  lastValue: string | HTMLElement | SVGGElement | null = null;

  /**
   * Variable: cacheEnabled
   *
   * Specifies if caching for HTML labels should be enabled. Default is true.
   */
  cacheEnabled: boolean = true;

  /**
   * Function: getSvgScreenOffset
   *
   * Disables offset in IE9 for crisper image output.
   */
  getSvgScreenOffset(): number {
    return 0;
  }

  /**
   * Function: checkBounds
   *
   * Returns true if the bounds are not null and all of its variables are numeric.
   */
  checkBounds(): boolean {
    return (
      !isNaN(this.scale) &&
      isFinite(this.scale) &&
      this.scale > 0 &&
      this.bounds != null &&
      !isNaN(this.bounds.x) &&
      !isNaN(this.bounds.y) &&
      !isNaN(this.bounds.width) &&
      !isNaN(this.bounds.height)
    );
  }

  /**
   * Function: paint
   *
   * Generic rendering code.
   */
  paint(c: mxSvgCanvas2D, update: boolean = false): void {
    // Scale is passed-through to canvas
    const s = this.scale;
    const x = this.bounds.x / s;
    const y = this.bounds.y / s;
    const w = this.bounds.width / s;
    const h = this.bounds.height / s;

    this.updateTransform(c, x, y, w, h);
    this.configureCanvas(c, x, y, w, h);

    if (update) {
      c.updateText(
        x,
        y,
        w,
        h,
        this.align,
        this.valign,
        this.wrap,
        this.overflow,
        this.clipped,
        this.getTextRotation(),
        this.node
      );
    } else {
      // Checks if text contains HTML markup
      const realHtml = isNode(this.value) || this.dialect === DIALECT_STRICTHTML;

      // Always renders labels as HTML in VML
      const fmt = realHtml ? 'html' : '';
      let val = this.value as string;

      if (!realHtml && fmt === 'html') {
        // @ts-ignore
        val = htmlEntities(val, false);
      }

      if (fmt === 'html' && !isNode(this.value)) {
        val = replaceTrailingNewlines(val, '<div><br></div>');
      }

      // Handles trailing newlines to make sure they are visible in rendering output
      val =
        !isNode(this.value) && this.replaceLinefeeds && fmt === 'html'
          ? (<string>val).replace(/\n/g, '<br/>')
          : val;

      let dir: string | null = this.textDirection;

      if (dir === TEXT_DIRECTION_AUTO && !realHtml) {
        dir = this.getAutoDirection();
      }

      if (dir !== TEXT_DIRECTION_LTR && dir !== TEXT_DIRECTION_RTL) {
        dir = null;
      }

      c.text(
        x,
        y,
        w,
        h,
        val,
        this.align,
        this.valign,
        this.wrap,
        fmt,
        this.overflow,
        this.clipped,
        this.getTextRotation(),
        dir
      );
    }
  }

  /**
   * Function: redraw
   *
   * Renders the text using the given DOM nodes.
   */
  redraw(): void {
    if (
      this.visible &&
      this.checkBounds() &&
      this.cacheEnabled &&
      this.lastValue === this.value &&
      (isNode(this.value) || this.dialect === DIALECT_STRICTHTML)
    ) {
      // @ts-ignore
      if (this.node.nodeName === 'DIV') {
        this.redrawHtmlShape();
        this.updateBoundingBox();
      } else {
        const canvas = this.createCanvas();

        // Specifies if events should be handled
        canvas.pointerEvents = this.pointerEvents;

        this.paint(canvas, true);
        this.destroyCanvas(canvas);
        this.updateBoundingBox();
      }
    } else {
      super.redraw();

      if (isNode(this.value) || this.dialect === DIALECT_STRICTHTML) {
        this.lastValue = this.value;
      } else {
        this.lastValue = null;
      }
    }
  }

  /**
   * Function: resetStyles
   *
   * Resets all styles.
   */
  resetStyles(): void {
    super.resetStyles();

    this.color = 'black';
    this.align = ALIGN_CENTER;
    this.valign = ALIGN_MIDDLE;
    this.family = DEFAULT_FONTFAMILY;
    this.size = DEFAULT_FONTSIZE;
    this.fontStyle = DEFAULT_FONTSTYLE;
    this.spacing = 2;
    this.spacingTop = 2;
    this.spacingRight = 2;
    this.spacingBottom = 2;
    this.spacingLeft = 2;
    this.horizontal = true;
    this.background = null;
    this.border = null;
    this.textDirection = DEFAULT_TEXT_DIRECTION;
    this.margin = null;
  }

  /**
   * Function: apply
   *
   * Extends mxShape to update the text styles.
   *
   * Parameters:
   *
   * state - <mxCellState> of the corresponding cell.
   */
  apply(state: CellState): void {
    const old = this.spacing;
    super.apply(state);

    if (this.style != null) {
      this.fontStyle = this.style.fontStyle || this.fontStyle;
      this.family = getValue(this.style, 'fontFamily', this.family);
      this.size = getValue(this.style, 'fontSize', this.size);
      this.color = getValue(this.style, 'fontColor', this.color);
      this.align = getValue(this.style, 'align', this.align);
      this.valign = getValue(this.style, 'verticalAlign', this.valign);
      this.spacing = parseInt(getValue(this.style, 'spacing', this.spacing));
      this.spacingTop =
        parseInt(getValue(this.style, 'spacingTop', this.spacingTop - old)) +
        this.spacing;
      this.spacingRight =
        parseInt(getValue(this.style, 'spacingRight', this.spacingRight - old)) +
        this.spacing;
      this.spacingBottom =
        parseInt(getValue(this.style, 'spacingBottom', this.spacingBottom - old)) +
        this.spacing;
      this.spacingLeft =
        parseInt(getValue(this.style, 'spacingLeft', this.spacingLeft - old)) +
        this.spacing;
      this.horizontal = getValue(this.style, 'horizontal', this.horizontal);
      this.background = getValue(this.style, 'backgroundColor', this.background);
      this.border = getValue(this.style, 'labelBorderColor', this.border);
      this.textDirection = getValue(this.style, 'textDirection', DEFAULT_TEXT_DIRECTION);
      this.opacity = getValue(this.style, 'textOpacity', 100);
      this.updateMargin();
    }

    this.flipV = false;
    this.flipH = false;
  }

  /**
   * Function: getAutoDirection
   *
   * Used to determine the automatic text direction. Returns
   * <mxConstants.TEXT_DIRECTION_LTR> or <mxConstants.TEXT_DIRECTION_RTL>
   * depending on the contents of <value>. This is not invoked for HTML, wrapped
   * content or if <value> is a DOM node.
   */
  getAutoDirection(): string {
    // Looks for strong (directional) characters
    const tmp = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(
      <string>this.value
    );

    // Returns the direction defined by the character
    return tmp != null && tmp.length > 0 && tmp[0] > 'z'
      ? TEXT_DIRECTION_RTL
      : TEXT_DIRECTION_LTR;
  }

  /**
   * Function: getContentNode
   *
   * Returns the node that contains the rendered input.
   */
  getContentNode() {
    let result = this.node;

    if (result != null) {
      // Rendered with no foreignObject
      if (result.ownerSVGElement == null) {
        // @ts-ignore
        result = this.node.firstChild.firstChild;
      } else {
        // Innermost DIV that contains the actual content
        // @ts-ignore
        result = result.firstChild.firstChild.firstChild.firstChild.firstChild;
      }
    }
    return result;
  }

  /**
   * Function: updateBoundingBox
   *
   * Updates the <boundingBox> for this shape using the given node and position.
   */
  updateBoundingBox(): void {
    let { node } = this;
    this.boundingBox = this.bounds.clone();
    const rot = this.getTextRotation();

    const h =
      this.style != null ? getValue(this.style, 'labelPosition', ALIGN_CENTER) : null;
    const v =
      this.style != null
        ? getValue(this.style, 'verticalLabelPosition', ALIGN_MIDDLE)
        : null;

    if (
      !this.ignoreStringSize &&
      node != null &&
      this.overflow !== 'fill' &&
      (!this.clipped ||
        !this.ignoreClippedStringSize ||
        h !== ALIGN_CENTER ||
        v !== ALIGN_MIDDLE)
    ) {
      let ow = null;
      let oh = null;

      if (
        node.firstChild != null &&
        node.firstChild.firstChild != null &&
        node.firstChild.firstChild.nodeName === 'foreignObject'
      ) {
        // Uses second inner DIV for font metrics
        // @ts-ignore
        node = node.firstChild.firstChild.firstChild.firstChild;
        // @ts-ignore
        oh = node.offsetHeight * this.scale;

        if (this.overflow === 'width') {
          // @ts-ignore
          ow = this.boundingBox.width;
        } else {
          // @ts-ignore
          ow = node.offsetWidth * this.scale;
        }
      } else {
        try {
          const b = node.getBBox();

          // Workaround for bounding box of empty string
          if (typeof this.value === 'string' && trim(this.value)?.length == 0) {
            this.boundingBox = null;
          } else if (b.width === 0 && b.height === 0) {
            this.boundingBox = null;
          } else {
            this.boundingBox = new Rectangle(b.x, b.y, b.width, b.height);
          }

          return;
        } catch (e) {
          // Ignores NS_ERROR_FAILURE in FF if container display is none.
        }
      }

      if (ow != null && oh != null) {
        this.boundingBox = new Rectangle(this.bounds.x, this.bounds.y, ow, oh);
      }
    }

    if (this.boundingBox != null) {
      const margin = <Rectangle>this.margin;

      if (rot !== 0) {
        // Accounts for pre-rotated x and y
        const bbox = <Rectangle>(
          getBoundingBox(
            new Rectangle(
              margin.x * this.boundingBox.width,
              margin.y * this.boundingBox.height,
              this.boundingBox.width,
              this.boundingBox.height
            ),
            rot,
            new Point(0, 0)
          )
        );

        this.unrotatedBoundingBox = Rectangle.fromRectangle(this.boundingBox);
        this.unrotatedBoundingBox.x += margin.x * this.unrotatedBoundingBox.width;
        this.unrotatedBoundingBox.y += margin.y * this.unrotatedBoundingBox.height;

        this.boundingBox.x += bbox.x;
        this.boundingBox.y += bbox.y;
        this.boundingBox.width = bbox.width;
        this.boundingBox.height = bbox.height;
      } else {
        this.boundingBox.x += margin.x * this.boundingBox.width;
        this.boundingBox.y += margin.y * this.boundingBox.height;
        this.unrotatedBoundingBox = null;
      }
    }
  }

  /**
   * Function: getShapeRotation
   *
   * Returns 0 to avoid using rotation in the canvas via updateTransform.
   */
  getShapeRotation(): number {
    return 0;
  }

  /**
   * Function: getTextRotation
   *
   * Returns the rotation for the text label of the corresponding shape.
   */
  getTextRotation(): number {
    return this.state != null && this.state.shape != null
      ? this.state.shape.getTextRotation()
      : 0;
  }

  /**
   * Function: isPaintBoundsInverted
   *
   * Inverts the bounds if <mxShape.isBoundsInverted> returns true or if the
   * horizontal style is false.
   */
  isPaintBoundsInverted(): boolean {
    return (
      !this.horizontal &&
      this.state != null &&
      // @ts-ignore
      this.state.cell.isVertex()
    );
  }

  /**
   * Function: configureCanvas
   *
   * Sets the state of the canvas for drawing the shape.
   */
  configureCanvas(c: mxSvgCanvas2D, x: number, y: number, w: number, h: number): void {
    super.configureCanvas(c, x, y, w, h);

    c.setFontColor(this.color);
    c.setFontBackgroundColor(this.background);
    c.setFontBorderColor(this.border);
    c.setFontFamily(this.family);
    c.setFontSize(this.size);
    c.setFontStyle(this.fontStyle);
  }

  /**
   * Function: getHtmlValue
   *
   * Private helper function to create SVG elements
   */
  getHtmlValue() {
    let val = this.value as string;

    if (this.dialect !== DIALECT_STRICTHTML) {
      // @ts-ignore
      val = htmlEntities(val, false);
    }

    // Handles trailing newlines to make sure they are visible in rendering output
    val = replaceTrailingNewlines(val, '<div><br></div>');
    val = this.replaceLinefeeds ? val.replace(/\n/g, '<br/>') : val;

    return val;
  }

  /**
   * Function: getTextCss
   *
   * Private helper function to create SVG elements
   */
  getTextCss() {
    const lh = ABSOLUTE_LINE_HEIGHT ? `${this.size * LINE_HEIGHT}px` : LINE_HEIGHT;

    let css =
      `display: inline-block; font-size: ${this.size}px; ` +
      `font-family: ${this.family}; color: ${
        this.color
      }; line-height: ${lh}; pointer-events: ${this.pointerEvents ? 'all' : 'none'}; `;

    if ((this.fontStyle & FONT_BOLD) === FONT_BOLD) {
      css += 'font-weight: bold; ';
    }

    if ((this.fontStyle & FONT_ITALIC) === FONT_ITALIC) {
      css += 'font-style: italic; ';
    }

    const deco = [];

    if ((this.fontStyle & FONT_UNDERLINE) === FONT_UNDERLINE) {
      deco.push('underline');
    }

    if ((this.fontStyle & FONT_STRIKETHROUGH) === FONT_STRIKETHROUGH) {
      deco.push('line-through');
    }

    if (deco.length > 0) {
      css += `text-decoration: ${deco.join(' ')}; `;
    }

    return css;
  }

  /**
   * Function: redrawHtmlShape
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  redrawHtmlShape(): void {
    const w = Math.max(0, Math.round(this.bounds.width / this.scale));
    const h = Math.max(0, Math.round(this.bounds.height / this.scale));
    const flex =
      `position: absolute; left: ${Math.round(this.bounds.x)}px; ` +
      `top: ${Math.round(this.bounds.y)}px; pointer-events: none; `;
    const block = this.getTextCss();
    const margin = <Point>this.margin;
    const node = <SVGGElement>this.node;

    mxSvgCanvas2D.createCss(
      w + 2,
      h,
      this.align,
      this.valign,
      this.wrap,
      this.overflow,
      this.clipped,
      this.background != null ? htmlEntities(this.background, true) : null,
      this.border != null ? htmlEntities(this.border, true) : null,
      flex,
      block,
      this.scale,
      (
        dx: number,
        dy: number,
        flex: string,
        item: string,
        block: string,
        ofl: string
      ) => {
        const r = this.getTextRotation();
        let tr =
          (this.scale !== 1 ? `scale(${this.scale}) ` : '') +
          (r !== 0 ? `rotate(${r}deg) ` : '') +
          (margin.x !== 0 || margin.y !== 0
            ? `translate(${margin.x * 100}%,${margin.y * 100}%)`
            : '');

        if (tr !== '') {
          tr = `transform-origin: 0 0; transform: ${tr}; `;
        }

        if (ofl === '') {
          flex += item;
          item = `display:inline-block; min-width: 100%; ${tr}`;
        } else {
          item += tr;

          if (mxClient.IS_SF) {
            item += '-webkit-clip-path: content-box;';
          }
        }

        if (<number>this.opacity < 100) {
          block += `opacity: ${<number>this.opacity / 100}; `;
        }

        node.setAttribute('style', flex);

        const html = isNode(this.value)
          ? // @ts-ignore
            this.value.outerHTML
          : this.getHtmlValue();

        if (node.firstChild == null) {
          node.innerHTML = `<div><div>${html}</div></div>`;
        }

        // @ts-ignore
        node.firstChild.firstChild.setAttribute('style', block);
        // @ts-ignore
        node.firstChild.setAttribute('style', item);
      }
    );
  }

  /**
   * Function: setInnerHtml
   *
   * Sets the inner HTML of the given element to the <value>.
   */
  updateInnerHtml(elt: HTMLElement): void {
    if (isNode(this.value)) {
      // @ts-ignore
      elt.innerHTML = this.value.outerHTML;
    } else {
      let val = this.value as string;

      if (this.dialect !== DIALECT_STRICTHTML) {
        // LATER: Can be cached in updateValue
        val = htmlEntities(<string>val, false);
      }

      // Handles trailing newlines to make sure they are visible in rendering output
      val = replaceTrailingNewlines(val, '<div>&nbsp;</div>');
      val = this.replaceLinefeeds ? val.replace(/\n/g, '<br/>') : val;
      val = `<div style="display:inline-block;_display:inline;">${val}</div>`;

      elt.innerHTML = val;
    }
  }

  /**
   * Function: updateValue
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  updateValue(): void {
    const node = <SVGGElement>this.node;

    if (isNode(this.value)) {
      node.innerHTML = '';
      node.appendChild(<HTMLElement | SVGGElement>this.value);
    } else {
      let val = this.value as string;

      if (this.dialect !== DIALECT_STRICTHTML) {
        val = htmlEntities(<string>val, false);
      }

      // Handles trailing newlines to make sure they are visible in rendering output
      val = replaceTrailingNewlines(val, '<div><br></div>');
      val = this.replaceLinefeeds ? val.replace(/\n/g, '<br/>') : val;
      const bg =
        this.background != null && this.background !== NONE ? this.background : null;
      const bd = this.border != null && this.border !== NONE ? this.border : null;

      if (this.overflow === 'fill' || this.overflow === 'width') {
        if (bg != null) {
          node.style.backgroundColor = bg;
        }

        if (bd != null) {
          node.style.border = `1px solid ${bd}`;
        }
      } else {
        let css = '';

        if (bg != null) {
          css += `background-color:${htmlEntities(bg, true)};`;
        }

        if (bd != null) {
          css += `border:1px solid ${htmlEntities(bd, true)};`;
        }

        // Wrapper DIV for background, zoom needed for inline in quirks
        // and to measure wrapped font sizes in all browsers
        // FIXME: Background size in quirks mode for wrapped text
        const lh = ABSOLUTE_LINE_HEIGHT ? `${this.size * LINE_HEIGHT}px` : LINE_HEIGHT;
        val =
          `<div style="zoom:1;${css}display:inline-block;_display:inline;text-decoration:inherit;` +
          `padding-bottom:1px;padding-right:1px;line-height:${lh}">${val}</div>`;
      }

      node.innerHTML = val;

      // Sets text direction
      const divs = node.getElementsByTagName('div');

      if (divs.length > 0) {
        let dir = this.textDirection;

        if (dir === TEXT_DIRECTION_AUTO && this.dialect !== DIALECT_STRICTHTML) {
          dir = this.getAutoDirection();
        }

        if (dir === TEXT_DIRECTION_LTR || dir === TEXT_DIRECTION_RTL) {
          divs[divs.length - 1].setAttribute('dir', dir);
        } else {
          divs[divs.length - 1].removeAttribute('dir');
        }
      }
    }
  }

  /**
   * Function: updateFont
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  updateFont(node: HTMLElement | SVGGElement): void {
    const { style } = node;

    // @ts-ignore
    style.lineHeight = ABSOLUTE_LINE_HEIGHT
      ? `${this.size * LINE_HEIGHT}px`
      : LINE_HEIGHT;
    style.fontSize = `${this.size}px`;
    style.fontFamily = this.family;
    style.verticalAlign = 'top';
    style.color = this.color;

    if ((this.fontStyle & FONT_BOLD) === FONT_BOLD) {
      style.fontWeight = 'bold';
    } else {
      style.fontWeight = '';
    }

    if ((this.fontStyle & FONT_ITALIC) === FONT_ITALIC) {
      style.fontStyle = 'italic';
    } else {
      style.fontStyle = '';
    }

    const txtDecor = [];

    if ((this.fontStyle & FONT_UNDERLINE) === FONT_UNDERLINE) {
      txtDecor.push('underline');
    }

    if ((this.fontStyle & FONT_STRIKETHROUGH) === FONT_STRIKETHROUGH) {
      txtDecor.push('line-through');
    }

    style.textDecoration = txtDecor.join(' ');

    if (this.align === ALIGN_CENTER) {
      style.textAlign = 'center';
    } else if (this.align === ALIGN_RIGHT) {
      style.textAlign = 'right';
    } else {
      style.textAlign = 'left';
    }
  }

  /**
   * Function: updateSize
   *
   * Updates the HTML node(s) to reflect the latest bounds and scale.
   */
  updateSize(node: HTMLElement, enableWrap: boolean = false): void {
    const w = Math.max(0, Math.round(this.bounds.width / this.scale));
    const h = Math.max(0, Math.round(this.bounds.height / this.scale));
    const { style } = node;

    // NOTE: Do not use maxWidth here because wrapping will
    // go wrong if the cell is outside of the viewable area
    if (this.clipped) {
      style.overflow = 'hidden';

      style.maxHeight = `${h}px`;
      style.maxWidth = `${w}px`;
    } else if (this.overflow === 'fill') {
      style.width = `${w + 1}px`;
      style.height = `${h + 1}px`;
      style.overflow = 'hidden';
    } else if (this.overflow === 'width') {
      style.width = `${w + 1}px`;
      style.maxHeight = `${h + 1}px`;
      style.overflow = 'hidden';
    }

    if (this.wrap && w > 0) {
      style.wordWrap = WORD_WRAP;
      style.whiteSpace = 'normal';
      style.width = `${w}px`;

      if (enableWrap && this.overflow !== 'fill' && this.overflow !== 'width') {
        let sizeDiv = node;

        if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName === 'DIV') {
          // @ts-ignore
          sizeDiv = sizeDiv.firstChild;

          if (node.style.wordWrap === 'break-word') {
            sizeDiv.style.width = '100%';
          }
        }

        let tmp = sizeDiv.offsetWidth;

        // Workaround for text measuring in hidden containers
        if (tmp === 0) {
          const prev = <HTMLElement>node.parentNode;
          node.style.visibility = 'hidden';
          document.body.appendChild(node);
          tmp = sizeDiv.offsetWidth;
          node.style.visibility = '';
          prev.appendChild(node);
        }

        tmp += 3;

        if (this.clipped) {
          tmp = Math.min(tmp, w);
        }

        style.width = `${tmp}px`;
      }
    } else {
      style.whiteSpace = 'nowrap';
    }
  }

  /**
   * Function: getMargin
   *
   * Returns the spacing as an <mxPoint>.
   */
  updateMargin(): void {
    this.margin = getAlignmentAsPoint(this.align, this.valign);
  }

  /**
   * Function: getSpacing
   *
   * Returns the spacing as an <mxPoint>.
   */
  getSpacing(): Point {
    let dx = 0;
    let dy = 0;

    if (this.align === ALIGN_CENTER) {
      dx = (this.spacingLeft - this.spacingRight) / 2;
    } else if (this.align === ALIGN_RIGHT) {
      dx = -this.spacingRight - this.baseSpacingRight;
    } else {
      dx = this.spacingLeft + this.baseSpacingLeft;
    }

    if (this.valign === ALIGN_MIDDLE) {
      dy = (this.spacingTop - this.spacingBottom) / 2;
    } else if (this.valign === ALIGN_BOTTOM) {
      dy = -this.spacingBottom - this.baseSpacingBottom;
    } else {
      dy = this.spacingTop + this.baseSpacingTop;
    }

    return new Point(dx, dy);
  }
}

export default TextShape;
