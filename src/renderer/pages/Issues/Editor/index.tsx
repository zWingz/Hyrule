import React, { useContext } from 'react'
import { GitIssue } from 'src/renderer/http/types'
import { Editor } from './Editor'
import { Preview } from '../Preview'
import { IssuesContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { pick } from 'src/renderer/utils/helper'
import { Icon } from 'antd'

type Prop = RouteComponentProps<{
  number: string
}>

type State = GitIssue & {
  scrollLine: number
}

export class IssuesEditor extends React.PureComponent<Prop, State> {
  static contextType = IssuesContext
  context: GitIssue[]
  backUrl: string = ''
  constructor(p: Prop, context: GitIssue[]) {
    super(p)
    const { number: num } = p.match.params
    const issue = context.filter(each => each.number === +num)[0]
    this.state = Object.assign(
      pick(issue, ['body', 'title', 'created_at', 'id', 'labels', 'number']),
      {
        scrollLine: 0
      }
    )
    this.backUrl = this.props.match.url
      .split('/')
      .slice(0, -1)
      .join('/')
  }
  onChange = v => {
    this.setState({
      body: v
    })
  }
  onScroll = v => {
    this.setState({
      scrollLine: v
    })
  }
  onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      title: e.target.value
    })
  }
  goBack = () => {
    this.props.history.goBack()
  }
  render() {
    const { body, title, scrollLine } = this.state
    return (
      <div className='issues-editor'>
        <div className='editor-title flex align-center'>
          <Icon
            type='left'
            className='flex-center mr10'
            onClick={this.goBack}
          />
          <input value={title} onChange={this.onChangeTitle} />
        </div>
        <div className='issues-editor-content'>
          <Editor
            content={body}
            onChange={this.onChange}
            onScroll={this.onScroll}
          />
          <Preview content={body} scrollLine={scrollLine} />
        </div>
      </div>
    )
  }
}
