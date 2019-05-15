import * as Store from 'electron-store'
import { BrowserWindow } from 'electron'
const store = new Store()

let _token: string = store.get('token') as string
let _win: BrowserWindow

export function getToken() {
  return _token
}

export function setToken(token: string) {
  store.set('token', token)
  _token = token
}

export function getWin() {
  return _win
}

export function setWin(win: BrowserWindow) {
  _win = win
}
