import { protocol } from 'electron'
import { getImageByApi } from '../proxy'
import { getToken } from '../global'

export function registerStreamProtocol() {
  protocol.registerStreamProtocol('github', (req, callback) => {
    const { url } = req
    getImageByApi(url, getToken(), callback)
  })
}
