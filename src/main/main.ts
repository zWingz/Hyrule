const { BrowserWindow, app } = require('electron')
const { join } = require('path')
const Reload = require('electron-reload')
Reload(__dirname, {
  electron: join(__dirname, '../../', 'node_modules', '.bin', 'electron')
})

function createWindow() {
  let win
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 800,
    height: 999,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // 然后加载 app 的 index.html.
  win.loadURL('http://localhost:8989/')
  win.webContents.openDevTools()
  win.webContents.send('main-process-messages', 'main-process-messages show')
}

app.on('ready', createWindow)
