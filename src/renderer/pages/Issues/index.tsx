import React, { PureComponent } from 'react'
import cls from 'classnames'
import { IssuesKit } from 'src/renderer/utils/issuesKit'
import { GitRepo, GitIssue } from 'src/renderer/http/types'
import { RepoWrapper } from 'src/renderer/component/RepoWrapper'
import './style.less'
import { IssuesEditor } from './Editor'
type Prop = {
  repo: GitRepo
}
type State = {
  issues: GitIssue[],
  selected: GitIssue
}
class IssuesPageBase extends PureComponent<Prop, State> {
  state: State = {
    issues: [],
    selected: null
  }
  async componentDidMount() {
    this.getIssues()
  }

  async getIssues() {
    const issues = await IssuesKit.getIssues()
    this.setState(
      {
        issues
      },
      () => {
        console.log(this.state.issues)
      }
    )
  }
  selectIssue = (issue: GitIssue) => {
    this.setState({
      selected: issue
    })
  }
  render() {
    const { issues, selected } = this.state
    return (
      <div className='page-container '>
        <div className='page-title'>{this.props.repo.name}</div>
        <div className='flex flex-grow mt20 issues-container'>
          <div className='issues-list'>
            {issues.map(each => (
              <div key={each.id} onClick={this.selectIssue.bind(this, each)} className={cls('issues-item', { active: selected === each})}>
                <div className='issues-item-title'>{each.title}</div>
              </div>
            ))}
          </div>
          {
            !!selected && <IssuesEditor issue={selected}/>
          }
        </div>
      </div>
    )
  }
}

export const IssuesPage = RepoWrapper(IssuesPageBase)
