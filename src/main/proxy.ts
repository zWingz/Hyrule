import fetch from 'node-fetch'
import { Readable } from 'stream'
export function porxy(url, options) {
  return fetch(url, options)
    .then(r => r.blob())
    .catch(e => {
      console.error('proxy error', e)
    })
}

export function getImageByApi(
  url: string,
  _token: string,
  callback: (
    stream?: (NodeJS.ReadableStream) | (Electron.StreamProtocolResponse)
  ) => void
) {
  const [, src] = url.split('//')
  if(!src) return
  const [owner, repo, sha, name] = src.split('/')
  const [, ext] = name.split('.')
  fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`, {
    headers: {
      Authorization: `token ${_token}`,
      'content-type': 'application/json'
    }
  }).then(async res => {
    const data = (await res.json()) as any
    const buf = Buffer.from(data.content, 'base64')
    const read = new Readable()
    read.push(buf)
    read.push(null)
    res.headers
    callback({
      statusCode: res.status,
      data: read,
      headers: {
        'Content-Length': data.size,
        'Content-Type': `image/${ext}`,
        'Cache-Control:': 'public',
        'Accept-Ranges': 'bytes',
        Status: res.headers.get('Status'),
        Date: res.headers.get('date'),
        Etag: res.headers.get('etag'),
        'Last-Modified': res.headers.get('Last-Modified')
      }
    })
  })
}

/**
 * 通过GET: raw.githubusercontent.com获取图片
 * 但是该方法太慢, 理由不知
 *
 * @export
 * @param {} url
 * @param {*} _token
 * @param {*} callback
 */
export function getImageByRaw(
  url: string,
  _token: string,
  callback: (
    stream?: (NodeJS.ReadableStream) | (Electron.StreamProtocolResponse)
  ) => void
) {
  const [, src] = url.split('//')
  // /repos/:owner/:repo/git/blobs/:sha
  const [owner, repo, , name] = src.split('/')
  fetch(
    `https://${_token}@raw.githubusercontent.com/${owner}/${repo}/master/${name}`,
    {
      headers: {
        Authorization: `token ${_token}`
      }
    }
  ).then(res => {
    // 直接返回reabable
    // 但是太慢了, 不知道为何
    callback({
      headers: res.headers.raw(),
      data: res.body,
      statusCode: res.status
    })
  })
}
