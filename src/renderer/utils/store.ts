import * as Store from 'electron-store'
import { GitRepo } from '../http/types'
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

export { store }
