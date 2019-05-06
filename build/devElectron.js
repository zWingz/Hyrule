const webpack = require('webpack')
const { CheckerPlugin } = require('awesome-typescript-loader')
const { resolve } = require('path')
const compiler = webpack({
  mode: 'development',
  entry: './src/main/main',
  target: 'electron-main',
  output: {
    path: resolve('./dist/main'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              useCache: true,
              reportFiles: ['src/main/*.ts'],
              configFileName: 'tsconfig.electron.json',
              forceIsolatedModules: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),
  ],
  watch: true
})

compiler.watch({}, (err, stats) => {
  // 在这里打印 watch/build 结果...
  console.log(stats)
})
