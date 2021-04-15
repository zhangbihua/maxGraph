module.exports = {
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            rootMode: 'upward'
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss']
  }
}