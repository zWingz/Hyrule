import { Http } from '../http'
import { GetIssuesParams, CreateIssueParams, GitIssue } from '../http/types'
import { Cache } from './cache'

class IssuesCache extends Cache<GitIssue[]> {
  addIssues(repo: string, issue: GitIssue) {
    const cache = this.get(repo)
    if (cache) {
      cache.unshift(issue)
    } else {
      this.set(repo, [issue])
    }
  }
  removeIssue(repo: string, issue: GitIssue) {
    const cache = this.get(repo)
    const index = cache.findIndex(each => each.id === issue.id)
    cache.splice(index, 1)
  }
  updateIssue(repo, issue: GitIssue) {
    const cache = this.get(repo)
    const item = cache.filter(each => each.id === issue.id)
    Object.assign(item, issue)
  }
}

const _cache = new IssuesCache()

class Octo {
  http = new Http()
  setRepo(repo) {
    this.http.setRepo(repo)
  }
  async getIssues(arg?: GetIssuesParams) {
    const { repo } = this.http
    if (_cache.has(repo)) {
      return _cache.get(repo)
    }
    const issues = await this.http.getIssues(arg)
    _cache.set(repo, issues)
    return issues
  }
  async saveIssues(issue: CreateIssueParams, num?: number | false) {
    let data
    if (num) {
      data = await this.http.editIssue(num, issue)
      _cache.updateIssue(this.http.repo, data)
    } else {
      data = await this.http.createIssue(issue)
      _cache.addIssues(this.http.repo, data)
    }
    return data
  }
  async closeIssue(issue: GitIssue) {
    _cache.removeIssue(this.http.repo, issue)
    return this.http.closeIssue(issue.number)
  }
}

const IssuesKit = new Octo()
export { IssuesKit }
