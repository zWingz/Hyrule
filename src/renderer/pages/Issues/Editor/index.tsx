import React, { useContext } from 'react'
import { GitIssue } from 'src/renderer/http/types'
import { Editor } from './Editor'
import { Preview } from '../Preview'
import { IssuesContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { pick } from 'src/renderer/utils/helper'
import { Icon } from 'antd'
import { Link } from 'react-router-dom';

type Prop = RouteComponentProps<{
  number: string
}>

type State = GitIssue

export class IssuesEditor extends React.PureComponent<Prop, State> {
  static contextType = IssuesContext
  context: GitIssue[]
  constructor(p: Prop, context: GitIssue[]) {
    super(p)
    const { number: num } = p.match.params
    const issue = context.filter(each => each.number === +num)[0]
    this.state = pick(issue, [
      'body',
      'title',
      'created_at',
      'id',
      'labels',
      'number'
    ])
  }

  render() {
    const { body, title } = this.state
    return (
      <div className='issues-editor'>
        <div className='issue-title'>
          <Link className='mr10' to={this.props.match.url.split('/').slice(0, -1).join('/')}>
            <Icon type='left-circle' />
          </Link>
          {title}
        </div>
        <div className='issues-editor-content'>
          <Editor content={body} />
          <Preview content={body} />
        </div>
      </div>
    )
  }
}
