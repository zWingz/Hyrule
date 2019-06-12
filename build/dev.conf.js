const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const utils = require('./utils')
const baseWebpackConfig = require('./base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin')
const typescriptFormatter = require('react-dev-utils/typescriptFormatter')

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  entry: [
    require.resolve('react-dev-utils/webpackHotDevClient'),
    './src/renderer/index'
  ],
  module: {
    rules: [utils.styleLoader(false)]
  },
  devtool: 'cheap-module-source-map',
  optimization: {
    noEmitOnErrors: true,
    runtimeChunk: true
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  plugins: [
    // new webpack.NamedModulesPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      isProduction: false
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true
    }),
    new WatchMissingNodeModulesPlugin(path.resolve('node_modules')),
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      async: true,
      silent: false,
      formatter: typescriptFormatter,
      tsconfig: 'tsconfig.web.json'
    }),
    new ForkTsCheckerNotifierWebpackPlugin({
      title: 'webpack Hyrule',
      excludeWarnings: false,
      skipSuccessful: true,
      skipFirstNotification: true
    })
  ]
})
