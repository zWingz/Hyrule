const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// 资源路径
exports.styleLoader = function(production) {
  const use = ['css-loader', 'postcss-loader', 'less-loader']
  if(production) {
    use.unshift(MiniCssExtractPlugin.loader)
  } else {
      use.unshift('style-loader')
  }
  return {
    test: /\.(less|css)$/,
    use
  }
}
