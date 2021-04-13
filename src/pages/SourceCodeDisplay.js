import { Component } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-handlebars.min';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-javascript.min';

// Adapted from
// https://betterstack.dev/blog/code-highlighting-in-react-using-prismjs/

export class SourceCodeDisplay extends Component {
  /**
   *
   * @param code
   * @param plugins
   * @param language
   */
  constructor({ code, plugins, language, theme, style }) {
    if (plugins == null) {
      plugins = ['line-numbers', 'show-language'];
    }
    super({ code, plugins, language, theme, style });
  }

  render() {
    // TODO: Support theme!!!
    return (
      <>
        <pre
          className={this.props.plugins ? this.props.plugins.join(' ') : ''}
          style={this.props.style}
        >
          <code
            ref={el => {
              this.el = el;
            }}
            className={`language-${this.props.language}`}
          >
            {(this.props.code || '').trim()}
          </code>
        </pre>
      </>
    );
  }

  componentDidMount() {
    if (this.el) {
      Prism.highlightElement(this.el);
    }
  }

  componentDidUpdate() {
    if (this.el) {
      Prism.highlightElement(this.el);
    }
  }
}

export default SourceCodeDisplay;
