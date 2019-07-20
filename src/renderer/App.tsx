import React, { PureComponent } from 'react'
import { hot } from 'react-hot-loader/root'
import { ipcRenderer } from 'electron'
import Animate from 'rc-animate'
import {
  getCacheUser,
  setCacheUser,
  getCacheToken,
  setCacheToken,
  store
} from './utils/store'
import { Provider } from './context/UserContext'
import { HashRouter } from 'react-router-dom'
import { Layout } from './pages/layout'
import { Spin, Icon } from 'antd'
import './utils/logger'
import './style/index.less'
import { DefaultHttpIns, Http } from './http'
import { GitUser } from './http/types'
import { Login } from './component/Login';
import { AuthError } from './http/Error';

type State = {
  loaded: boolean
  isLogin: boolean
} & GitUser

const antIcon = <Icon type='loading' style={{ fontSize: 32 }} spin />
Spin.setDefaultIndicator(antIcon)

const cacheUser = getCacheUser()
const token = getCacheToken()

class App extends PureComponent<{}, State> {
  state: State = {
    ...cacheUser,
    loaded: false,
    // isLogin: false,
    isLogin: !!token
  }
  componentDidMount() {
    ipcRenderer.on('set-access-token', async (e, t) => {
      this.setState({
        isLogin: true
      })
      this.valid(t)
    })
    if (token) {
      this.valid(token)
    } else {
      this.login()
    }
  }
  async valid(t) {
    setCacheToken(t)
    Http.setToken(t)
    try {
      const user = await DefaultHttpIns.getUser()
      setCacheUser(user)
      this.setState({
        ...user,
        loaded: true,
        isLogin: true
      })
    } catch(e) {
      if(e instanceof AuthError) {
        this.login()
        return
      }
      throw e
    }
  }
  login() {
    ipcRenderer.send('open-auth-window')
  }
  logout = () => {
    this.setState({
      loaded: false,
      isLogin: false
    })
    store.clear()
  }
  render() {
    const { avatar, owner, loaded, isLogin } = this.state
    const { logout } = this
    return isLogin ? (
      <Provider value={{ avatar, owner, logout }}>
        <HashRouter>{loaded && <Layout />}</HashRouter>
        <Animate transitionName='fade'>
          {!loaded && (
            <div className='page-loader'>
              <div className='page-loader-inner' />
            </div>
          )}
        </Animate>
      </Provider>
    ) : <Login requestLogin={this.login}/>
  }
}

function isHot() {
  return isProduction ? App : hot(App)
}

export default isHot()
