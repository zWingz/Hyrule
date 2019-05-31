import { Http } from '../http'
import { getNow, clone } from './helper'
import join from 'url-join'
import { Cache } from './cache'
import { XhrRequestParams, GitFile, AbortToken } from '../http/types'
import { Queue } from 'lite-queue'

export type ImgType = {
  name: string
  url?: string
  sha: string
}

export type DirType = {
  [k: string]: string
}

export type DataJsonType = {
  images: ImgType[]
  dir: DirType
  sha: string
}

type UploadImageType = {
  filename: string
  base64: string
}

const DEFAULT_DATA_JSON: DataJsonType = {
  dir: {},
  images: [],
  sha: 'master'
}

const queue = new Queue()

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

class Octo {
  http = new Http()
  setRepo(arg: string) {
    this.http.setRepo(arg)
  }
  getRootPath() {
    return this.http.getTree('master')
  }
  async getTree(
    pathName: string = '',
    pathSha: string = 'master',
    abortToken?: AbortToken
  ): Promise<DataJsonType> {
    const c = cache.get(pathName)
    if (c) {
      return c
    }
    let ret = {
      dir: {},
      images: [],
      sha: pathSha
    }
    if (pathSha) {
      const data = await this.http.getTree(pathSha, abortToken)
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
        images,
        sha: pathSha
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

  async uploadImage(
    path: string,
    img: UploadImageType,
    onProgress?: XhrRequestParams['onProgress']
  ) {
    const { filename } = img
    const d = await queue.exec<GitFile>(() => {
      // const d = await this.http.createFile({
      return this.http.createFile({
        path: join(path, filename),
        message: `Upload ${filename} by Zelda - ${getNow()}`,
        content: img.base64,
        onProgress
      })
    })
    if (d) {
      const dataJson = cache.get(path)
      dataJson.images.unshift({
        name: filename,
        sha: d.sha
      })
      return {
        url: this.parseUrl(path, filename),
        sha: d.sha,
        filename
      }
    }
    throw d
  }
  async removeFile(path, arg: { name: string; sha: string }) {
    const { name, sha } = arg
    await queue.exec(() => {
      // const d = await this.http.createFile({
      return this.http.deleteFile({
        path: join(path, name),
        message: `Deleted ${name} by Zelda - ${getNow()}`,
        sha: sha
      })
    })
    cache.delImg(path, arg)
  }
  getUser() {
    return this.http.getUser()
  }
  parseUrl(path, fileName): string {
    const { repo, owner } = this.http
    return join(
      `https://raw.githubusercontent.com/`,
      owner,
      repo,
      'master',
      path,
      fileName
    )
  }
  // async batchDelete(path, remove: string[]) {
  //   const { images, dir, sha } = cache.get(path)
  //   const tree: CreateTreeParams.Tree = []
  //   Object.keys(dir).forEach(each => {
  //     const dirSha = dir[each]
  //     tree.push({
  //       path: each,
  //       sha: dirSha,
  //       type: 'tree'
  //     })
  //   })
  //   images
  //     .filter(each => !remove.includes(each.name))
  //     .forEach(each => {
  //       tree.push({
  //         path: each.name,
  //         sha: each.sha,
  //         type: 'blob'
  //       })
  //     })
  //   await this.http.createTree(tree, sha)
  // }
  clearCache() {
    cache.clear()
  }
}

const octo = new Octo()
export { octo as ImageKit }
