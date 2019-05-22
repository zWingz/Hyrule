import React, { PureComponent } from 'react'
import { RouteComponentProps } from 'react-router'
import { IssuesKit } from 'src/renderer/utils/issuesKit';

interface RouteProp {
  repo: string
}

type Prop = RouteComponentProps<RouteProp>

export class IssuesPage extends PureComponent<Prop, {}> {
  componentDidMount() {
    IssuesKit.getIssues()
  }
  render() {
    return (
      <div className='page-container issues-container'>
        <div className='page-title'>{this.props.match.params.repo}</div>
      </div>
    )
  }
}
