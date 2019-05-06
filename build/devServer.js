// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
// require('../config/env');

const fs = require('fs')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware')

const {
  choosePort,
  createCompiler,
  prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils')
const config = require('./dev.conf')
const useYarn = fs.existsSync('yarn.lock')
// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8989
const HOST = process.env.HOST || '0.0.0.0'

choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return
    }
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const appName = require('../package.json').name
    const urls = prepareUrls(protocol, HOST, port)
    const compiler = createCompiler({webpack, config, appName, urls, useYarn})
    const devServer = new WebpackDevServer(compiler, {
      hot: true,
      host: HOST,
      port: port,
      quiet: true,
      compress: true,
      historyApiFallback: true,
      overlay: false,
      before(app, server) {
        app.use(evalSourceMapMiddleware(server))
        app.use(errorOverlayMiddleware())
      }
    })

    // Launch WebpackDevServer.
    devServer.listen(port, HOST, err => {
      if (err) {
        return console.log(err)
      }
      clearConsole()
      console.log(chalk.cyan('Starting the development server...\n'))
    })
    ;['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close()
        process.exit()
      })
    })
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
