import * as Store from 'electron-store'
const store = new Store()
let _token: string = store.get('token') as string

type WindowSize = {
  width: number
  height: number
}

export function getCacheWindowSize() {
  return store.get('window.size') as WindowSize || {
    width: 1080,
    height: 750
  }
}

export function setCacheWindowSize(size: WindowSize) {
  store.set('window.size', size)
}


export function getToken() {
  return _token
}

export function setToken(token: string) {
  store.set('token', token)
  _token = token
}
