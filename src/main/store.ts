import * as Store from 'electron-store'
const store = new Store()

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
