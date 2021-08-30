const path = require('path');

module.exports = {
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            rootMode: 'upward',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      core: path.resolve(__dirname, 'packages/core/src'),
    },
    extensions: ['.ts', '.js', '.css'],
  },
};
