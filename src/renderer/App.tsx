import React, { PureComponent } from 'react'
import { hot } from 'react-hot-loader/root'
import { ipcRenderer } from 'electron'
import Animate from 'rc-animate'
import {
  store,
  getCacheUser,
  setCacheUser,
  getCacheToken,
  setCacheToken
} from './utils/store'
import http from './http'
import { Provider } from './context/UserContext'
import { HashRouter } from 'react-router-dom'
import { Layout } from './pages/layout'
import { Spin, Icon } from 'antd'
import './utils/logger'
import './style/index.less'
const antIcon = <Icon type='loading' style={{ fontSize: 32 }} spin />
Spin.setDefaultIndicator(antIcon)

const cacheUser = getCacheUser()

class App extends PureComponent {
  state = {
    ...cacheUser,
    loaded: false
  }
  componentDidMount() {
    const token = getCacheToken()
    ipcRenderer.on('set-access-token', async (e, t) => {
      this.valid(t)
    })
    if (token) {
      this.valid(token)
    } else {
      ipcRenderer.send('open-auth-window')
    }
  }
  async valid(t) {
    setCacheToken(t)
    http.setToken(t)
    const user = await http.getUser()
    setCacheUser(user)
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
        <Animate transitionName='fade'>
          {!loaded && (
            <div className='page-loader'>
              <div className='page-loader-inner' />
            </div>
          )}
        </Animate>
      </Provider>
    )
  }
}

function isHot() {
  return isProduction ? App : hot(App)
}

export default isHot()
