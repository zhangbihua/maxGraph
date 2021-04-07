class ExampleBase {
  props: object;

  constructor(props: object) {
    this.props = props;
  }

  appendToElement(element: HTMLElement): HTMLElement {
    const html: string = this.getHTML();
    const cont: HTMLElement =
        document.createElement('div');
    cont.innerHTML = html;
    this.afterHTMLSet()
    element.appendChild(cont);
    return cont;
  }

  getHTML(): void {
    throw new Error("Not implemented");
  }

  afterHTMLSet(): void {
    throw new Error("Not implemented");
  }
}

export default ExampleBase;
