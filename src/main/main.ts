import { BrowserWindow, app, ipcMain } from 'electron'
import * as isDev from 'electron-is-dev'
import Debug from 'electron-debug'
import { setWebcontent, logger } from './logger'
import { GITHUB_APP } from './config'
import * as qs from 'qs'
import * as fetch from 'node-fetch'
// import * as Reload from 'electron-reload'
// Reload(__dirname, {
//   electron: require(`${__dirname}/../../node_modules/electron`),

// })
if (isDev) {
  console.log('Running in development')
  try {
    require('electron-reloader')(module)
  } catch (err) {}
  Debug({ showDevTools: true })
} else {
  console.log('Running in production')
}

const webPreferences = {
  nodeIntegration: true
}
let win: BrowserWindow
let authWindow: BrowserWindow
function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1080,
    height: 750,
    webPreferences
  })
  // 然后加载 app 的 index.html.
  win.loadURL('http://localhost:8989/')
  win.webContents.openDevTools()
  setWebcontent(win.webContents)
  win.on('close', () => {
    win = null
  })
  registerAuthListener()
}

function registerAuthListener() {
  ipcMain.on('open-auth-window', () => {
    authWindow = new BrowserWindow({
      parent: win,
      width: 400,
      height: 600,
      show: false,
      webPreferences
    })
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${
      GITHUB_APP.CLIENT_ID
    }&scope=${GITHUB_APP.scope}`
    const options = { extraHeaders: 'pragma: no-cache\n' }
    authWindow.loadURL(authUrl, options)
    authWindow.webContents.on('will-redirect', handleOauth)
    authWindow.webContents.on('will-navigate', handleOauth)
    authWindow.show()
  })
}

function handleOauth(event, url) {
  const reg = /code=([\d\w]+)/
  if (!reg.test(url)) {
    return
  }
  event.preventDefault()
  const code = url.match(reg)[1]
  const authUrl = 'https://github.com/login/oauth/access_token'
  fetch(authUrl, {
    method: 'POST',
    body: qs.stringify({
      code,
      client_id: GITHUB_APP.CLIENT_ID,
      client_secret: GITHUB_APP.SECRET
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(res => res.json())
    .then(r => {
      if (code) {
        // Close the browser if code found or error
        win.webContents.send('set-access-token', r.access_token)
        // authWindow.webContents.session.clearStorageData()
        authWindow.destroy()
      }
    })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  app.quit()
})
