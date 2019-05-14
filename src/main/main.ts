import { BrowserWindow, app, ipcMain, protocol } from 'electron'
import * as isDev from 'electron-is-dev'
import Debug from 'electron-debug'
import { setWebcontent, logger } from './logger'
import { GITHUB_APP } from './config'
import * as qs from 'qs'
import fetch from 'node-fetch'
import { porxy, getImageByApi } from './proxy'
import { Writable, Readable } from 'stream'
import * as Store from 'electron-store'
import { createReadStream } from 'fs'
import * as request from 'request'
const store = new Store()
// import * as Reload from 'electron-reload'
// Reload(__dirname, {
//   electron: require(`${__dirname}/../../node_modules/electron`),

// })
let _token: string = store.get('token') as string
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
  registerProxyListener()
  registerStreamProtocol()
}

function registerStreamProtocol() {
  protocol.registerStreamProtocol('github', (req, callback) => {
    const { url } = req
    getImageByApi(url, _token, callback)
    // callback({
    //   url,
    //   method: 'get'
    // })
  })
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

function registerProxyListener() {
  ipcMain.on('proxy', async (event, url, options, callback) => {
    const data = await porxy(url, options)
    callback(data)
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://github.com/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    }
  })
    .then(res => res.json())
    .then(r => {
      if (code) {
        _token = r.access_token
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
