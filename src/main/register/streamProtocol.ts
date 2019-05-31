import { protocol } from 'electron'
import { getImageByApi } from '../proxy'
import { getToken } from '../store'

export function registerStreamProtocol() {
  protocol.registerStreamProtocol('github', (req, callback) => {
    const { url } = req
    getImageByApi(url, getToken(), callback)
  })
}
