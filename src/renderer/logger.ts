import { ipcRenderer } from 'electron'
ipcRenderer.addListener('logger', (event, ...arg) => {
  // tslint:disable-next-line
  console.log(...arg);
})
