import { BrowserWindow, app } from 'electron'
import * as isDev from 'electron-is-dev'
import Debug from 'electron-debug'
import { setWebcontent } from './logger'
import { setWin } from './global'
import { registerAuthListener, registerStreamProtocol } from './register'
if (isDev) {
  console.log('Running in development')
  // try {
  //   require('electron-reloader')(module)
  // } catch (err) {}
  Debug({ showDevTools: true })
} else {
  console.log('Running in production')
}

const webPreferences = {
  nodeIntegration: true
}
let win: BrowserWindow
function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1080,
    height: 750,
    webPreferences
  })
  setWin(win)
  // 然后加载 app 的 index.html.
  win.loadURL('http://localhost:8989/')
  win.webContents.openDevTools()
  setWebcontent(win.webContents)
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
