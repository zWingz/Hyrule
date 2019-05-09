import http from '../http'
import { getNow } from './helper'
import join from 'url-join'

export type ImgType = {
  name: string
  url?: string
  sha: string
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export type DirType = {
  [k: string]: string
}

export type DataJsonType = {
  images: ImgType[]
  dir: DirType
}

type UploadImageType = {
  filename: string
  base64: string
}

const DEFAULT_DATA_JSON: DataJsonType = {
  dir: {},
  images: []
}

/**
 * 缓存
 * 主要来存储访问过的tree, 避免重复获取数据
 *
 * @class Cache
 */
class Cache {
  path: {
    [k: string]: DataJsonType
  } = {}
  create(path: string, data: DataJsonType) {
    this.path[path] = data
  }
  addImg(path: string, img: ImgType) {
    this.path[path].images.push(img)
  }
  delImg(path: string, img: ImgType) {
    const cac = this.path[path]
    cac.images = cac.images.filter(each => each.sha !== img.sha)
  }
  get(path: string) {
    const ret = this.path[path]
    return ret
  }
  clear() {
    this.path = {}
  }
}
const cache = new Cache()

const ImageRegExg = /\.(jpg|jpeg|png)$/

export class Octo {
  getRootPath(): Promise<{ path: string; sha: string }[]> {
    return http.getTree('master')
  }
  setRepo(arg: string) {
    http.setRepo(arg)
  }
  async getTree(
    pathName: string = '',
    pathSha: string = 'master'
  ): Promise<DataJsonType> {
    const c = cache.get(pathName)
    if (c) {
      return c
    }
    let ret = {
      dir: {},
      images: []
    }
    if (pathSha) {
      const data = await http.getTree(pathSha)
      const dir = {}
      const images = []
      data.forEach(each => {
        const { path, type, sha } = each
        if (type === 'tree') {
          dir[path] = sha
        } else if (ImageRegExg.test(path)) {
          images.push({
            name: path,
            sha
          })
        }
      })
      ret = {
        dir,
        images
      }
    }
    cache.create(pathName, ret)
    return ret
  }

  createPath(absolute: string, pathName: string) {
    const parent = cache.get(absolute)
    parent.dir[pathName] = ''
    cache.create(join(absolute, pathName), clone(DEFAULT_DATA_JSON))
  }

  async uploadImage(path: string, img: UploadImageType) {
    const { filename } = img
    const d = await http.createFile({
      path: join(path, filename),
      message: `Upload ${filename} by Koopa - ${getNow()}`,
      content: img.base64
    })
    if (d) {
      const dataJson = cache.get(path)
      dataJson.images.push({
        name: filename,
        sha: d.sha
      })
      return {
        imgUrl: this.parseUrl(path, filename),
        sha: d.sha,
        filename
      }
    }
    throw d
  }
  async removeFile(path, img: ImgType) {
    await http.deleteFile({
      path: join(path, img.name),
      message: `Deleted ${img.name} by Koopa - ${getNow()}`,
      sha: img.sha
    })
    cache.delImg(path, img)
  }
  getUser() {
    return http.getUser()
  }
  parseUrl(path, fileName) {
    const { repo, owner } = http
    return join(
      `https://raw.githubusercontent.com/`,
      owner,
      repo,
      'master',
      path,
      fileName
    )
  }
  clearCache() {
    cache.clear()
  }
}

const octo = new Octo()
export { octo }
