import React from 'react'
import { Icon, Button, Select, message, Tooltip } from 'antd'
import * as monaco from 'monaco-editor'
import { GitIssue, GitRepo } from 'src/renderer/http/types'
import { Editor } from './Editor'
import { Preview } from '../Preview'
import { IssuesContext, UploadRepoContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { pick } from 'src/renderer/utils/helper'
import { IssuesKit } from 'src/renderer/utils/issuesKit'
import {
  setCacheDraftIssue,
  getCacheDraftIssue,
  deleteCacheDraftIssues
} from 'src/renderer/utils/store'
type Prop = RouteComponentProps<{
  number: string
}> & {
  onUpdate: () => void
  onUpload: () => void
}

enum MODE_ENMU {
  eidtor,
  preview,
  both
}

type State = Partial<
  Pick<GitIssue, 'body' | 'title' | 'created_at' | 'labels' | 'id'>
> & {
  scrollLine: number
  mode: MODE_ENMU
  syncing: boolean
  // imagesRepo: GitRepo[]
  // uploadRepo: string
  draft: boolean
}

const TooltipProp = {
  mouseEnterDelay: 0.5
}

export class IssuesEditor extends React.PureComponent<Prop, State> {
  static contextType = IssuesContext
  context: GitIssue[]
  editor: monaco.editor.IStandaloneCodeEditor
  state: State = {
    scrollLine: 0,
    mode: MODE_ENMU.both,
    syncing: false,
    id: null,
    body: '',
    title: '',
    created_at: '',
    labels: [],
    draft: false
  }
  isCreate: boolean = false
  constructor(p: Prop, context: GitIssue[]) {
    super(p)
    const { number: num } = p.match.params
    this.isCreate = !num
    if (num) {
      const issue = context.filter(each => each.number === +num)[0]
      if (issue) {
        Object.assign(
          this.state,
          pick(issue, ['body', 'title', 'created_at', 'labels', 'id'])
        )
      }
    }
    const draft = getCacheDraftIssue(
      IssuesKit.http.repo,
      this.isCreate ? 'create' : this.state.id
    )
    if (draft) {
      this.state.title = draft.title
      this.state.body = draft.body
    }
  }
  onChangeState(key: keyof State, val) {
    let draft = this.state.draft
    if (key === 'body') {
      draft = true
    }
    this.setState({
      [key]: val,
      draft
    } as State)
  }
  onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      title: e.target.value,
      draft: true
    })
  }
  goBack = () => {
    this.props.history.goBack()
  }
  getEditor = ins => {
    this.editor = ins
  }
  getActiveMod = expect => {
    return this.state.mode === expect ? 'primary' : 'default'
  }
  onSaveDraft = () => {
    if (!this.state.draft) {
      return
    }
    const { title, body, id } = this.state
    setCacheDraftIssue(IssuesKit.http.repo, this.isCreate ? 'create' : id, {
      title,
      body
    })
    this.setState({
      draft: false
    })
    message.success('Save draft succeed')
  }
  onSync = async () => {
    this.setState({
      syncing: true
    })
    const { number: num } = this.props.match.params
    const { title, body, labels = [] } = this.state
    const { id, number: newNum } = await IssuesKit.saveIssues(
      {
        title,
        body,
        labels: labels.map(each => each.name)
      },
      num ? +num : false
    )
    if(this.isCreate) {
      this.props.history.replace(`./${newNum}`)
    }
    this.setState({
      syncing: false,
      draft: false,
      id
    })
    deleteCacheDraftIssues(IssuesKit.http.repo, this.isCreate ? 'create' : id)
    this.isCreate = false
    this.props.onUpdate()
    message.success('Sync succeed')
  }
  render() {
    const { body, title, scrollLine, mode, syncing, draft } = this.state
    return (
      <div className='issues-editor'>
        <div className='issues-editor-title flex align-center'>
          <Icon
            type='left'
            className='flex-center mr10 issues-editor-goback'
            onClick={this.goBack}
          />
          <input
            value={title}
            onChange={this.onChangeTitle}
            placeholder='Title'
          />
        </div>
        <div className='flex'>
          <Button.Group className='mr10'>
            <Tooltip {...TooltipProp} title='Show Editor'>
              <Button
                type={this.getActiveMod(MODE_ENMU.eidtor)}
                onClick={this.onChangeState.bind(
                  this,
                  'mode',
                  MODE_ENMU.eidtor
                )}>
                <Icon type='pic-left' />
              </Button>
            </Tooltip>
            <Tooltip {...TooltipProp} title='Show Both'>
              <Button
                type={this.getActiveMod(MODE_ENMU.both)}
                onClick={this.onChangeState.bind(this, 'mode', MODE_ENMU.both)}>
                <Icon type='pic-center' />
              </Button>
            </Tooltip>
            <Tooltip {...TooltipProp} title='Show Preview'>
              <Button
                type={this.getActiveMod(MODE_ENMU.preview)}
                onClick={this.onChangeState.bind(
                  this,
                  'mode',
                  MODE_ENMU.preview
                )}>
                <Icon type='pic-right' />
              </Button>
            </Tooltip>
          </Button.Group>
          <Button.Group>
            <Tooltip {...TooltipProp} title='Save draft to local'>
              <Button
                // type='primary'
                // shape='circle'
                onClick={this.onSaveDraft}>
                <Icon type={draft ? 'save' : 'check'} />
              </Button>
            </Tooltip>
            <Tooltip {...TooltipProp} title='Save to github'>
              <Button onClick={this.onSync}>
                <Icon type='sync' spin={syncing} />
              </Button>
            </Tooltip>
          </Button.Group>
        </div>
        <div className='issues-editor-content'>
          {mode !== MODE_ENMU.preview && (
            <UploadRepoContext.Consumer>
              {uploadRepo => (
                <Editor
                  onUpload={this.props.onUpload}
                  onSave={this.onSaveDraft}
                  getEditor={this.getEditor}
                  content={body}
                  uploadRepo={uploadRepo}
                  onChange={this.onChangeState.bind(this, 'body')}
                  onScroll={this.onChangeState.bind(this, 'scrollLine')}
                />
              )}
            </UploadRepoContext.Consumer>
          )}
          {mode !== MODE_ENMU.eidtor && (
            <Preview content={body} scrollLine={scrollLine} />
          )}
        </div>
      </div>
    )
  }
}
