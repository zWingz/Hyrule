const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
// 资源路径
exports.styleLoader = function(production) {
  const use = [
    'css-loader',
    'postcss-loader',
    'less-loader',
    {
      loader: 'style-resources-loader',
      options: {
        patterns: path.resolve(__dirname, '../src/renderer/style/variable.less'),
      }
    }
  ]
  if (production) {
    use.unshift(MiniCssExtractPlugin.loader)
  } else {
    use.unshift('style-loader')
  }
  return {
    test: /\.(less|css)$/,
    use
  }
}
