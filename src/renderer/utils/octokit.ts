import http from '../http'
import { getNow } from './helper'
import join from 'url-join'
import { Cache } from './cache';
import { XhrRequestParams } from '../http/types';

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
class ImageCache extends Cache<DataJsonType> {
  addImg(path: string, img: ImgType) {
    this.get(path).images.push(img)
  }
  delImg(path: string, img: ImgType) {
    const cac = this.get(path)
    cac.images = cac.images.filter(each => each.sha !== img.sha)
  }
}
const cache = new ImageCache()

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
    cache.set(pathName, ret)
    return ret
  }

  createPath(absolute: string, pathName: string) {
    const parent = cache.get(absolute)
    parent.dir[pathName] = ''
    cache.set(join(absolute, pathName), clone(DEFAULT_DATA_JSON))
  }

  async uploadImage(path: string, img: UploadImageType, onProgress?: XhrRequestParams['onProgress']) {
    const { filename } = img
    const d = await http.createFile({
      path: join(path, filename),
      message: `Upload ${filename} by Koopa - ${getNow()}`,
      content: img.base64,
      onProgress
    })
    if (d) {
      const dataJson = cache.get(path)
      dataJson.images.unshift({
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
  parseUrl(path, fileName): string {
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
