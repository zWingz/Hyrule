import React from 'react'
import { hot } from 'react-hot-loader/root'
import electron from 'electron'
import './logger'
const ipcRenderer = electron.ipcRenderer
console.log(ipcRenderer);

const App = () => (
  <div>test</div>

)

function isHot() {
  return isProduction ? App : hot(App)
}

export default isHot()
