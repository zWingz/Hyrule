/* eslint-disable */
const utils = require('./utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./base.conf')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 直接将manifest写入到html中
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// webpack内置的不支持压缩es6,所以使用最原始的plugin压缩
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: [utils.styleLoader(true)]
  },
  output: {
    path: path.resolve(__dirname, '../dist/renderer'),
    publicPath: '.',
    filename: 'assets/js/[name].js',
    chunkFilename: 'assets/js/[name].js',
    sourceMapFilename: '[file].map'
  },
  devtool: false,
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending futher investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
          discardComments: { removeAll: true },
          parser: require('postcss-safe-parser')
        }, // 删除注释
        canPrint: true
      })
    ],
    /**
     *
     * 通过判断splitChunks.chunks的值来确定哪些模块会提取公共模块，该配置一共有三个选项，initial、async、 all。
     * 默认为async，表示只会提取异步加载模块的公共代码
     * initial表示只会提取初始入口模块的公共代码
     * all表示同时提取前两者的代码。
     */
    splitChunks: {
      chunks: "initial",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      // name: false,
      name: false,
      cacheGroups: {
        component: {
          name: 'component',
          // chunks: 'initial',
          chunks: "all",
          minChunks: 1,
          priority: 10,
          enforce: true,
          reuseExistingChunk: true,
          test: /\/component\//
        },
        vendor: {
          name: 'vendor',
          // chunks: 'initial',
          chunks: "all",
          priority: 20,
          reuseExistingChunk: false,
          // enforce: true,
          test: /node_modules/
        }
      }
    }
  },
  plugins: [
    // 定义变量
    new webpack.DefinePlugin({
      'isProduction': true
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    // hash管理
    new webpack.HashedModuleIdsPlugin(),
    // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../static'),
    //     to: config.build.assetsSubDirectory,
    //     ignore: ['.*']
    //   }
    // ]),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ]
})
module.exports = webpackConfig
