import React, { PureComponent } from 'react'
import cls from 'classnames'
import { IssuesKit } from 'src/renderer/utils/issuesKit'
import { GitRepo, GitIssue } from 'src/renderer/http/types'
import { RepoWrapper } from 'src/renderer/component/RepoWrapper'
import './style.less'
import { IssuesEditor } from './Editor'
import { IssuesList } from './List'
import { Route, Switch, RouteChildrenProps } from 'react-router'
import { Provider } from './Context'
import { getCacheIssues, setCacheIssues } from 'src/renderer/utils/store'

type Prop = RouteChildrenProps & {
  repo: GitRepo
}
type State = {
  issues: GitIssue[]
}
class IssuesPageBase extends PureComponent<Prop, State> {
  state: State = {
    issues: getCacheIssues()
  }
  async componentDidMount() {
    this.getIssues()
  }

  async getIssues() {
    const issues = await IssuesKit.getIssues()
    setCacheIssues(issues)
    this.setState({
      issues
    })
  }
  render() {
    const { issues } = this.state
    const {
      match: { url }
    } = this.props
    return (
      <div className='page-container '>
        <div className='page-title'>{this.props.repo.name}</div>
        <Provider value={issues}>
          <Switch>
            <Route path={`${url}/:number`} component={IssuesEditor} />
            <Route path={`${url}`} component={IssuesList} />
          </Switch>
        </Provider>
      </div>
    )
  }
}

export const IssuesPage = RepoWrapper(IssuesPageBase)
