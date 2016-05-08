var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: "source-map",
  entry: path.resolve(__dirname, 'scripts/upload.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'final.js'
  },

  resolve: {
    modulesDirectories: ['node_modules', 'scripts'],
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [
      { test: /\.js[x]?$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.(png|jpg)$/, loader: 'file-loader?name=images/[name].[ext]' },
      { test: /\.woff$/, loader: 'file-loader?name=fonts/[name].[ext]' }
    ]
  },

  // This plugin moves all the CSS into a separate stylesheet
  plugins: [
    new ExtractTextPlugin('app.css'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};
