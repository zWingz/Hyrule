var path = require('path')
var utils = require('./utils')
const { CheckerPlugin } = require('awesome-typescript-loader')
module.exports = {
  entry: './src/renderer/index',
  target: 'electron-renderer',
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.less', '.css'], // 当require找不到模块添加后缀
    modules: [path.join(__dirname, '../src'), 'node_modules'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      'src': '@',
      assets: '@/assets',
      components: '@/components',
      js: '@/js',
      sass: '@/sass',
      router: '@/router',
      view: '@/view',
      http: '@/http',
      store: '@/store'
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          },
          {
            loader: 'awesome-typescript-loader',
            options: {
              useCache: true,
              reportFiles: [
                "src/**/*.{ts,tsx}"
              ],
              configFileName: "tsconfig.web.json",
              forceIsolatedModules: true
            }
          }
        ],
        include: path.resolve(__dirname, '../'),
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
        options: {
          removeSVGTagAttrs: false
        }
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'assets/img/[name].[hash:7].[ext]'
            }
          }
        ],
        exclude: path.resolve(__dirname, '../src/assets/svg')
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'assets/fonts/[name].[hash:7].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [new CheckerPlugin()],
  node: {
    Buffer: false
  }
}
