const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    plop: './plop.js',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].bundle.js',
    publicPath: 'build',
    library: 'Plop'
  },
  devServer: {
    contentBase: path.resolve(__dirname, './assets')
  },
}
