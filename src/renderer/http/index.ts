import join from 'url-join'
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
  DeleteFileParams
} from './types'
import qs from 'qs'
import { Cache } from '../utils/cache'

class Rest {
  base = 'https://api.github.com'
  headers = {
    'content-type': 'application/json'
  } as any
  token: string = ''
  repo: string = ''
  owner: string = ''
  setToken(token: string) {
    this.headers.Authorization = `token ${token}`
    this.token = token
  }
  setRepo(repo: string) {
    this.repo = repo
  }
  parseUrl(url: string, params = {}) {
    const map = {
      repo: this.repo,
      owner: this.owner,
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
  request({ url = '', body, params, method = 'GET' }: RequestParams) {
    return fetch(
      join(this.base, url, params ? `?${qs.stringify(params)}` : ''),
      {
        headers: this.headers,
        method,
        body: body && JSON.stringify(body)
      }
    ).then(res => {
      const { status } = res
      const data = res.json()
      if (status === 401) {
        throw new Error('登录验证出错了, 请修改后重试!')
      } else if (status >= 300) {
        throw new Error((data as any).message)
      }
      return data
    })
  }
  /**
   * 获取用户信息接口
   *
   * @returns
   * @memberof Rest
   */
  async getUser() {
    const url = `user`
    const data = await this.request({ url })
    const { login: owner, avatar_url: avatar } = data
    this.owner = owner
    return {
      owner,
      avatar
    } as GitUser
  }
  async getRepos() {
    const url = '/user/repos'
    const data: GitRepo[] = await this.request({
      url,
      params: {
        type: 'owner',
        sort: 'updated'
      }
    })
    return pickArray(data, ['name', 'id', 'description', 'private'])
  }
  async getIssues() {
    const url = this.parseUrl(`/repos/:owner/:repo/issues`)
    const data: GitIssue[] = await this.request({ url })
    return pickArray(data, [
      'id',
      'number',
      'html_url',
      'title',
      'body',
      'labels',
      'created_at',
      'updated_at'
    ])
  }
  async createIssue(body: CreateIssueParams) {
    const url = this.parseUrl('/repos/:owner/:repo/issues')
    const data: GitIssue = await this.request({ url, method: 'POST', body })
    return data
  }
  async editIssue(num: number, body: CreateIssueParams) {
    const url = this.parseUrl('/repos/:owner/:repo/issues/:issue_number', {
      issues_number: num
    })
    const data: GitIssue = await this.request({ url, method: 'PATCH', body })
    return data
  }
  /**
   * 获取tree接口
   *
   * @param {string} sha
   * @returns {Promise<{ path: string; sha: string; type: string }[]>}
   * @memberof Rest
   */
  getTree(sha: string): Promise<GitTree[]> {
    const url = this.parseUrl(`/repos/:owner/:repo/git/trees/:sha`, { sha })
    return this.request({ url }).then(d => d.tree)
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
    return this.request({ url })
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
  async createFile({ path, content, message }: CreateFileParams) {
    const url = this.parseUrl(`/repos/:owner/:repo/contents/:path`, { path })
    const data = await this.request({
      url,
      method: 'PUT',
      body: {
        content,
        message
      }
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
    return this.request({
      url,
      method: 'DELETE',
      body: {
        message,
        sha
      }
    })
  }
}

export default new Rest()
