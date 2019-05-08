import React, { PureComponent } from 'react'
import { hot } from 'react-hot-loader/root'
import { ipcRenderer } from 'electron'
import { store } from './utils/store'
import http from './http'
import './utils/logger'
import './style.less'
import { Provider } from './context/UserContext'
import { HashRouter } from 'react-router-dom'
import { Layout } from './pages/layout'

function click() {
  ipcRenderer.send('open-auth-window')
}

class App extends PureComponent {
  state = {
    avatar: '',
    owner: '',
    loaded: false
  }
  componentDidMount() {
    const token = store.get('token')
    this.valid(token)
    ipcRenderer.on('set-access-token', async (e, t) => {
      this.valid(t)
    })
  }
  async valid(t) {
    store.set('token', t)
    http.setToken(t)
    const user = await http.getUser()
    this.setState({
      ...user,
      loaded: true
    })
  }
  render() {
    const { avatar, owner, loaded } = this.state
    return (
      <Provider value={{ avatar, owner }}>
        <HashRouter>{loaded && <Layout />}</HashRouter>
      </Provider>
    )
  }
}

function isHot() {
  return isProduction ? App : hot(App)
}

export default isHot()
