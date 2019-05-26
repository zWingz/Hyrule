import http from '../http'
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
  async getIssues(arg?: GetIssuesParams) {
    const { repo } = http
    if (_cache.has(repo)) {
      return _cache.get(repo)
    }
    const issues = await http.getIssues(arg)
    _cache.set(repo, issues)
    return issues
  }
  async saveIssues(issue: CreateIssueParams, num?: number | false) {
    let data
    if (num) {
      data = await http.editIssue(num, issue)
      _cache.updateIssue(http.repo, data)
    } else {
      data = await http.createIssue(issue)
      _cache.addIssues(http.repo, data)
    }
    return data
  }
}

const IssuesKit = new Octo()
export { IssuesKit }
