import React from 'react'
import { hot } from 'react-hot-loader/root'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer
ipcRenderer.on('main-process-messages', function(event, message){
    alert(message)
})
const App = () => (
  <div>dfs</div>
)

function isHot() {
  return isProduction ? App : hot(App)
}

export default isHot()
