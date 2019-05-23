import React from 'react'
import { GitIssue } from 'src/renderer/http/types'
import { Editor } from './Editor'
type Prop = {
  issue: GitIssue
}

export class IssuesEditor extends React.PureComponent<Prop> {
  render() {
    const { issue } = this.props
    return (
      <div className='issues-editor'>
        <div className='issues-editor-title'>{issue.title}</div>
        <div className='flex'>
          <Editor />
        </div>
      </div>
    )
  }
}
