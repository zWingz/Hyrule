import { ipcMain, WebContents } from 'electron'

let _webContent: WebContents = null
export function logger(...args) {
  if(_webContent) {
    _webContent.send('logger', ...args)
  }
}

export function setWebcontent(webContent) {
  _webContent = webContent
}
