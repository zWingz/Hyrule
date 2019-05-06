import { BrowserWindow, app, ipcMain } from 'electron'
import { join } from 'path'
import { setWebcontent, logger } from './logger';
// import * as Reload from 'electron-reload'
// Reload(__dirname, {
//   electron: require(`${__dirname}/../../node_modules/electron`),

// })
try {
	require('electron-reloader')(module);
} catch (err) {}

let win: BrowserWindow
function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1080,
    height: 750,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // 然后加载 app 的 index.html.
  win.loadURL('http://localhost:8989/')
  win.webContents.openDevTools()
  setWebcontent(win.webContents)
  win.on('close', () => {
    win = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  app.quit()
})
