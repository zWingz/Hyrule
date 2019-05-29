import * as Store from 'electron-store'
import { GitRepo, GitIssue, GitUser } from '../http/types'
const store = new Store()

export function getCacheRepos(type: 'all' | 'issues' | 'images') {
  return (store.get(`repos.${type}`) as GitRepo[]) || []
}
export function setCacheRepos(
  type: 'all' | 'issues' | 'images',
  value: GitRepo[]
) {
  store.set(`repos.${type}`, value)
}

export function getCacheIssues(repo) {
  return (store.get(`issues.${repo}`) as GitIssue[]) || []
}

export function setCacheIssues(repo, value: GitIssue[]) {
  store.set(`issues.${repo}`, value)
}

export function getCacheUser() {
  return store.get('user') as GitUser
}
export function setCacheUser(user: GitUser) {
  store.set('user', user)
}

export function getCacheToken(): string {
  return store.get('token') as string
}

export function setCacheToken(token) {
  store.set('token', token)
}

export { store }
