import React, { PureComponent } from 'react'
import { IssuesKit } from 'src/renderer/utils/issuesKit'
import { GitRepo, GitIssue } from 'src/renderer/http/types'
import { RepoWrapper } from 'src/renderer/component/RepoWrapper'
import './style.less'
import { IssuesEditor } from './Editor'
import { IssuesList } from './List'
import { Route, Switch, RouteComponentProps } from 'react-router'
import { Provider } from './Context'
import { getCacheIssues, setCacheIssues } from 'src/renderer/utils/store'
import { Spin } from 'antd'

type Prop = RouteComponentProps<{repo: string}> & {
  repo: GitRepo
}
type State = {
  issues: GitIssue[]
  loading: boolean
}
class IssuesPageBase extends PureComponent<Prop, State> {
  state: State = {
    issues: [],
    loading: true
  }
  constructor(p: Prop) {
    super(p)
    this.state.issues = getCacheIssues(this.props.repo.name)
  }
  async componentDidMount() {
    this.init()
  }

   getIssues = async () => {
    this.setState(({
      loading: true
    }))
    const issues = await IssuesKit.getIssues()
    setCacheIssues(this.props.repo.name, issues)
    this.setState({
      issues,
      loading: false
    })
  }
  componentDidUpdate(prevProps: Prop, prevState) {
    if (prevProps.repo !== this.props.repo) {
      this.init()
    }
  }
  init () {
    this.setState({
      issues: []
    })
    this.getIssues()
  }
  onCloseIssue = (issue: GitIssue) => {
    IssuesKit.closeIssue(issue)
    this.getIssues()
  }
  render() {
    const { issues, loading } = this.state
    const CreateEditorPage = (p) => <IssuesEditor onUpdate={this.getIssues} {...p}/>
    const CreateIssuesListPage = p => <IssuesList onUpdate={this.getIssues} {...p}/>
    const {
      match: { url }
    } = this.props
    return (
      <div className='page-container '>
        <div className='page-title'>{this.props.repo.name}</div>
        {loading && <Spin
          delay={250}
          className='spin-loading absolute-full'
        />}
        <Provider value={issues}>
          <Switch>
            <Route path={`${url}/create`} render={CreateEditorPage} />
            <Route path={`${url}/:number`} render={CreateEditorPage} />
            <Route path={`${url}`} render={CreateIssuesListPage} />
          </Switch>
        </Provider>
      </div>
    )
  }
}

export const IssuesPage = RepoWrapper(IssuesPageBase)
