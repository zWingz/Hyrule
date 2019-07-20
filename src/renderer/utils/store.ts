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

export function getCacheDefUploadRepo() {
  return store.get('defUploadRep') as string || undefined
}

export function setCacheDefUploadRepo(repo) {
  store.set('defUploadRep', repo)
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

type DraftIssue = {
  title?: string,
  body: string
}

export function getCacheDraftIssue(repo: string, id: number | 'create'): DraftIssue | null {
  return store.get(`draft.${repo}.${id}`) as DraftIssue
}

export function setCacheDraftIssue(repo: string, id: number | 'create', draft: DraftIssue) {
  store.set(`draft.${repo}.${id}`, draft)
}
export function deleteCacheDraftIssues(repo: string, id: number | 'create') {
  store.delete(`draft.${repo}.${id}`)
}
export { store }
