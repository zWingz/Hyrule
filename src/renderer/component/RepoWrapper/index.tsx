import React, { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { getCacheRepos } from 'src/renderer/utils/store'
import { Http } from 'src/renderer/http'
import { GitRepo } from 'src/renderer/http/types'
import { IssuesKit } from 'src/renderer/utils/issuesKit';
import { ImageKit } from 'src/renderer/utils/imageKit';

interface RouteProp {
  repo: string
}

type Prop = RouteComponentProps<RouteProp>

type withProp<T> = T & Prop

export function RepoWrapper<P = any>(
  Page: React.ComponentType<P & { repo: GitRepo }>
): React.SFC<withProp<P>> {
  // return class RouterHookWrapped extends React.PureComponent<withProp<P>, S> {
  //   componentDidUpdate(prevProps: Prop) {
  //     const repo = getRepo(this.props)
  //     if (getRepo(prevProps) !== repo) {
  //       this.init()
  //     }
  //   }
  //   componentDidMount() {
  //     this.init()
  //   }
  //   init() {
  //     const name = getRepo(this.props)
  //     const repo = getCacheRepos('all').filter(each => each.name === name)[0]
  //     if (repo) {
  //       http.setRepo(name)
  //     }
  //   }
  //   render() {
  //     return <Page {...this.props} />
  //   }
  // }
  return function RouterHookWrapped(p: withProp<P>) {
    const { repo } = p.match.params
    const repoInfo = getCacheRepos('all').filter(each => each.name === repo)[0]
    if (repoInfo) {
      if(/issues/.test(p.match.path)) {
        IssuesKit.setRepo(repo)
      } else {
        ImageKit.setRepo(repo)
      }
    }
    return <Page {...p} repo={repoInfo} />
  }
}
