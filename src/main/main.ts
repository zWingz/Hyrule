import { BrowserWindow, app, ipcMain, protocol } from 'electron'
import * as isDev from 'electron-is-dev'
import Debug from 'electron-debug'
import { setWebcontent, logger } from './logger'
import { GITHUB_APP } from './config'
import * as qs from 'qs'
import fetch from 'node-fetch'
import { porxy } from './proxy';
import { Writable, Readable } from 'stream'
import * as Store from 'electron-store'
import { createReadStream } from 'fs';
const store = new Store()
// import * as Reload from 'electron-reload'
// Reload(__dirname, {
//   electron: require(`${__dirname}/../../node_modules/electron`),


// })
let _token = store.get('token')
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
  // protocol.registerHttpProtocol('github', (request, callback) => {
  protocol.registerStreamProtocol('github', (request, callback) => {
    const { url } = request
    const [,src] = url.split('//')
    // /repos/:owner/:repo/git/blobs/:sha
    const [owner, repo, sha] = src.split('/')
    console.log(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`);
    fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`, {
      headers: {
        'Authorization': `token ${_token}`,
    'content-type': 'application/json'
      }
    })
    .then(async (res) => {
      const data = await res.json() as any
      const buf = Buffer.from(data.content, 'base64');
      console.log(buf);
      const read = new Readable()
      read.push(buf)
      read.push(null)
      callback({
        statusCode: res.status,
        data: read,
        headers: {
          'content-type': "image/jpg"
        },
      })
    })
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
      'Content-Type': 'application/x-www-form-urlencoded'
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
