import React, { PureComponent } from 'react'
import { RouteComponentProps } from 'react-router'

interface RouteProp {
  repo: string
}

type Prop = RouteComponentProps<RouteProp>

export class IssuesPage extends PureComponent<Prop, {}> {
  render() {
    return (
      <div className='page-container issues-container'>
        <div className='page-title'>{this.props.match.params.repo}</div>
      </div>
    )
  }
}
