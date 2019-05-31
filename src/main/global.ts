import { BrowserWindow } from 'electron'

let _win: BrowserWindow

export function getWin() {
  return _win
}

export function setWin(win: BrowserWindow) {
  _win = win
}
