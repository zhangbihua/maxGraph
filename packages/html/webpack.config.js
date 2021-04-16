const path = require('path');
const {merge} = require('webpack-merge');
const base = require('../../webpack.config');

module.exports = merge(base, {
  resolve: {
    alias: {
      '@mxgraph/core': path.resolve(__dirname, '../core')
    }
  }
});