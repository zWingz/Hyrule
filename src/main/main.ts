import { BrowserWindow, app } from 'electron'
import * as isDev from 'electron-is-dev'
import { setWebcontent, logger } from './logger'
import { setWin } from './global'
import { registerAuthListener, registerStreamProtocol } from './register'
import * as Consola from 'consola'
import { getCacheWindowSize, setCacheWindowSize } from './store';
if (isDev) {
  (Consola as any).wrapAll()
  logger('Electron running in development')

  // try {
  //   require('electron-reloader')(module)
  // } catch (err) {}
  const Debug = require('electron-debug')
  Debug({ showDevTools: true })
} else {
  logger('Electron running in production')
}

const webPreferences = {
  nodeIntegration: true
}
let win: BrowserWindow
const cacheSize = getCacheWindowSize()
function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    ...cacheSize,
    minHeight: 750,
    minWidth: 1080,
    webPreferences,
    show: false,
    backgroundColor: '#2e2c29'
  })
  setWin(win)
  // 然后加载 app 的 index.html.
  if (isDev) {
    win.loadURL('http://localhost:8989/')
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))
    // win.webContents.openDevTools()
  } else {
    win.loadFile(`${__dirname}/../renderer/index.html`)
  }
  setWebcontent(win.webContents)
  win.once('ready-to-show', () => {
    win.show()
  })
  win.on('resize', () => {
    const { width, height } = win.getBounds()
    setCacheWindowSize({ width, height })
  })
  win.on('close', () => {
    win = null
  })
  registerAuthListener(win)
  registerStreamProtocol()
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  app.quit()
})
