import { pick, pickArray } from '../utils/helper'
import {
  RequestParams,
  GitBlob,
  GitFile,
  GitIssue,
  GitRepo,
  GitTree,
  GitUser,
  CreateFileParams,
  CreateIssueParams,
  DeleteFileParams,
  XhrRequestParams,
  AbortToken,
  GetIssuesParams
} from './types'
import qs from 'qs'
import join from 'url-join'
import { AbortError } from './Error'

export class Http {
  static token = ''
  static owner = ''
  static setToken(token: string) {
    this.token = token
  }
  base = 'https://api.github.com'
  repo: string = ''
  get owner() {
    return Http.owner
  }
  setRepo(repo: string) {
    this.repo = repo
  }
  parseUrl(url: string, params = {}) {
    const map = {
      repo: this.repo,
      owner: Http.owner,
      ...params
    }
    return url.replace(/(:\w+)/g, (match, $1) => {
      return map[$1.slice(1)]
    })
  }
  /**
   * 封装github api
   *
   * @param {{
   *     url?: string
   *     data?: any
   *     method?: Methdos
   *   }} [{
   *     url = '',
   *     data = {},
   *     method = 'GET'
   *   }={}]
   * @returns
   * @memberof Rest
   */
  // request({ url = '', body, params, method = 'GET' }: RequestParams) {
  //   return fetch(
  //     join(this.base, url, params ? `?${qs.stringify(params)}` : ''),
  //     {
  //       headers: this.headers,
  //       method,
  //       body: body && JSON.stringify(body)
  //     }
  //   ).then(async res => {
  //     const { status } = res
  //     const data = await res.json()
  //     if (status === 401) {
  //       throw new Error('登录验证出错了, 请修改后重试!')
  //     } else if (status >= 300) {
  //       throw new Error((data as any).message)
  //     }
  //     return data
  //   })
  // }
  xhr({
    url,
    body,
    method = 'GET',
    params,
    onProgress,
    abortToken,
    getHeader
  }: XhrRequestParams): Promise<any> {
    const retry = () => {
      const ret = new Promise((res, rej) => {
        let _abort = ''
        const xhr = new XMLHttpRequest()
        xhr.open(
          method,
          join(this.base, url, params ? `?${qs.stringify(params)}` : '')
        )
        xhr.responseType = 'json'
        if (Http.token) {
          xhr.setRequestHeader('Authorization', `token ${Http.token}`)
        }
        xhr.setRequestHeader('content-type', 'application/json')
        if (onprogress && xhr.upload) {
          xhr.upload.onprogress = function(event) {
            if (event.total > 0) {
              const percentComplete = (event.loaded / event.total) * 100
              onProgress(percentComplete)
            }
          }
        }
        xhr.onreadystatechange = function() {
          const { readyState, status, response } = xhr
          if (_abort) {
            rej(new AbortError(_abort))
            return
          }
          if (readyState !== 4) {
            return
          }
          if (status === 401) {
            rej(new Error('登录验证出错了, 请修改后重试!'))
          } else if (status === 409) {
            res(retry())
          } else if (status >= 300) {
            rej(new Error((response as any).message))
          } else {
            if (getHeader) {
              res({
                headers: xhr.getAllResponseHeaders(),
                response
              })
            } else {
              res(response)
            }
          }
        }
        xhr.send(body && JSON.stringify(body))
        if (abortToken) {
          abortToken((msg: string = 'xhr abort') => {
            if (xhr.readyState !== 4) {
              _abort = msg
              xhr.abort()
            }
          })
        }
      })
      return ret
    }
    return retry()
  }
  /**
   * 获取用户信息接口
   *
   * @returns
   * @memberof Rest
   */
  async getUser() {
    const url = `user`
    const data = await this.xhr({ url })
    const { login: owner, avatar_url: avatar } = data
    Http.owner = owner
    return {
      owner,
      avatar
    } as GitUser
  }
  async getRepos() {
    const url = '/user/repos'
    const data: GitRepo[] = await this.xhr({
      url,
      params: {
        type: 'owner',
        sort: 'updated'
      }
    })
    return pickArray(data, ['name', 'id', 'description', 'private'])
  }
  async getIssues({ page = 2, pageSize = 10 }: GetIssuesParams = {}) {
    const url = this.parseUrl(`/repos/:owner/:repo/issues`)
    return this.xhr({
      url
      // params: {
      // per_page: pageSize,
      // page
      // },
      // getHeader: true
    })
  }
  async createIssue(body: CreateIssueParams) {
    const url = this.parseUrl('/repos/:owner/:repo/issues')
    const data: GitIssue = await this.xhr({ url, method: 'POST', body })
    return data
  }
  async editIssue(num: number, body: CreateIssueParams) {
    const url = this.parseUrl('/repos/:owner/:repo/issues/:issue_number', {
      issue_number: num
    })
    const data: GitIssue = await this.xhr({ url, method: 'PATCH', body })
    return data
  }
  async closeIssue(num) {
    const url = this.parseUrl('/repos/:owner/:repo/issues/:issue_number', {
      issue_number: num
    })
    const data: GitIssue = await this.xhr({
      url,
      method: 'PATCH',
      body: { state: 'closed' }
    })
    return data
  }
  /**
   * 获取tree接口
   *
   * @param {string} sha
   * @returns {Promise<{ path: string; sha: string; type: string }[]>}
   * @memberof Rest
   */
  getTree(sha: string, abortToken?: AbortToken): Promise<GitTree[]> {
    const url = this.parseUrl(
      `/repos/:owner/:repo/git/trees/:sha` +
        // no-cache when sha === master
        (sha === 'master' ? '?nocache=' + Date.now() : ''),
      { sha }
    )
    return this.xhr({
      url,
      abortToken
    }).then(d => d.tree)
  }
  /**
   * 获取文件blob接口
   *
   * @param {string} sha
   * @returns {Promise<{
   *     content: string
   *     encoding: string
   *     sha: string
   *     size: number
   *   }>}
   * @memberof Rest
   */
  getBlob(sha: string): Promise<GitBlob> {
    const url = this.parseUrl('/repos/:owner/:repo/git/blobs/:sha', { sha })
    return this.xhr({ url })
  }
  /**
   * 创建文件接口
   *
   * @param {{
   *     path: string
   *     content: string
   *     message: string
   *   }} {
   *     path,
   *     content,
   *     message
   *   }
   * @memberof Rest
   */
  async createFile({ path, content, message, onProgress }: CreateFileParams) {
    const url = this.parseUrl(`/repos/:owner/:repo/contents/:path`, { path })
    const data = await this.xhr({
      url,
      method: 'PUT',
      body: {
        content,
        message
      },
      onProgress
    })
    return pick(data.content, ['name', 'path', 'sha']) as GitFile
  }

  /**
   * 删除文件接口
   *
   * @param {{
   *     path: string
   *     message: string
   *     sha: string
   *   }} {
   *     path,
   *     message,
   *     sha
   *   }
   * @returns
   * @memberof Rest
   */
  deleteFile({ path, message, sha }: DeleteFileParams) {
    const url = this.parseUrl(`/repos/:owner/:repo/contents/:path`, { path })
    return this.xhr({
      url,
      method: 'DELETE',
      body: {
        message,
        sha
      }
    })
  }
  // async createTree(
  //   t: CreateTreeParams.Tree,
  //   sha
  // ): Promise<CreateTreeParams.Return> {
  //   // /repos/:owner/:repo/git/trees
  //   const url = this.parseUrl('/repos/:owner/:repo/git/trees')
  //   const tree = t.map(each => ({
  //     ...each,
  //     path: each.path,
  //     mode: each.type === 'blob' ? '100644' : '040000'
  //   }))
  //   const res = await this.xhr({
  //     url,
  //     method: 'POST',
  //     body: {
  //       tree,
  //       base_tree: sha
  //     }
  //   })
  //   // await this.createCommit(res.sha, base)
  //   return res
  // }
  // createCommit(sha, parent) {
  //   const url = this.parseUrl('/repos/:owner/:repo/git/commits')
  //   return this.xhr({
  //     url,
  //     method: 'POST',
  //     body: {
  //       message: `Deleted multi-file by Zelda - ${getNow()}`,
  //       tree: sha
  //     }
  //   })
  // }
}

export const DefaultHttpIns = new Http()
