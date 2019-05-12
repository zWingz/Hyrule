import * as fetch from 'node-fetch'

export function porxy(url, options) {
  return fetch(url, options).then(r => r.blob()).catch(e => {
    console.error('proxy error', e)
  })
}
