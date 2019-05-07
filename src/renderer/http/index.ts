import join from 'url-join'
import { RestConfig } from '../utils/interface'
import { pick, pickArray } from '../utils/helper'

class Rest {
  base = 'https://api.github.com'
  headers = {}
  token: string = ''
  repo: string = ''
  owner: string = ''
  constructor({ token }: RestConfig) {
    this.token = token
    this.headers = {
      Authorization: `token ${token}`,
      'content-type': 'application/json'
    }
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
  setRepo(repo) {
    this.repo = repo
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
  request({ url = '', body = {}, method = 'GET' }: RequestParams) {
    return fetch(join(this.base, url), {
      headers: this.headers,
      method,
      body
    })
      .then(res => res.json())
      .then(res => {
        const { statusCode, data } = res
        if (statusCode === 401) {
          throw new Error('Token验证出错了, 请修改后重试!')
        } else if (statusCode >= 300) {
          throw new Error(data.message)
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
    const { login: username, avatar_url: avatar } = data
    this.owner = username
    return {
      username,
      avatar
    } as GitUser
  }
  async getRepos() {
    const url = '/user/repos'
    const data: GitRepo[] = await this.request({
      url,
      body: {
        type: 'owner',
        sort: 'updated'
      }
    })
    return pickArray(data, ['name', 'id', 'description'])
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
    const url = this.parseUrl('/repos/:repo/git/blobs/:sha', { sha })
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

export { Rest }
