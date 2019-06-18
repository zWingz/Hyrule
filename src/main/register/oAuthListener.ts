import { ipcMain, BrowserWindow } from 'electron'
import * as qs from 'qs'
import { GITHUB_APP } from '../config'
import { getWin } from '../global'
import { default as fetch } from 'node-fetch'
import { setToken } from '../store'
let authWindow: BrowserWindow
export function registerAuthListener(win: BrowserWindow) {
  ipcMain.on('open-auth-window', () => {
    authWindow = new BrowserWindow({
      parent: win,
      width: 400,
      height: 600,
      show: false,
      webPreferences: { nodeIntegration: true }
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://github.com/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    }
  })
    .then(res => res.json())
    .then(r => {
      if (code) {
        const { access_token } = r
        setToken(access_token)
        // Close the browser if code found or error
        getWin().webContents.send('set-access-token', access_token)
        authWindow.webContents.session.clearStorageData()
        authWindow.destroy()
      }
    })
}
