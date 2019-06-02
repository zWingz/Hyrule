import React, { useContext } from 'react'
import { Icon, Button, Select, message } from 'antd'
import * as monaco from 'monaco-editor'
import { GitIssue, GitRepo } from 'src/renderer/http/types'
import { Editor } from './Editor'
import { Preview } from '../Preview'
import { IssuesContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { pick } from 'src/renderer/utils/helper'
import { IssuesKit } from 'src/renderer/utils/issuesKit'
import { getCacheRepos, store, getCacheDefUploadRepo, setCacheDefUploadRepo } from 'src/renderer/utils/store'
const { Option } = Select
type Prop = RouteComponentProps<{
  number: string
}> & {
  onUpdate: () => void
}

enum MODE_ENMU {
  eidtor,
  preview,
  both
}

type State = Pick<GitIssue, 'body' | 'title' | 'created_at' | 'labels'> & {
  scrollLine: number
  mode: MODE_ENMU
  syncing: boolean
  imagesRepo: GitRepo[]
  uploadRepo: string
}

export class IssuesEditor extends React.PureComponent<Prop, State> {
  static contextType = IssuesContext
  context: GitIssue[]
  editor: monaco.editor.IStandaloneCodeEditor
  state: State = {
    scrollLine: 0,
    mode: MODE_ENMU.both,
    syncing: false,
    body: '',
    title: '',
    created_at: '',
    labels: [],
    imagesRepo: getCacheRepos('images'),
    uploadRepo: getCacheDefUploadRepo()
  }
  isCreate: boolean = false
  constructor(p: Prop, context: GitIssue[]) {
    super(p)
    const { number: num } = p.match.params
    this.isCreate === !!num
    if (num) {
      const issue = context.filter(each => each.number === +num)[0]
      if (issue) {
        Object.assign(
          this.state,
          pick(issue, ['body', 'title', 'created_at', 'labels'])
        )
      }
    }
  }
  removeStoreListeners: () => void = function() {}
  onRepoSelectChange = (v) => {
    setCacheDefUploadRepo(v)
    this.setState({
      uploadRepo: v
    })
  }
  onChangeState(key: keyof State, val) {
    this.setState({
      [key]: val
    } as State)
  }
  onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      title: e.target.value
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
  onSync = async () => {
    this.setState({
      syncing: true
    })
    const { number: num } = this.props.match.params
    const { title, body, labels = [] } = this.state
    await IssuesKit.saveIssues(
      {
        title,
        body,
        labels: labels.map(each => each.name)
      },
      num ? +num : false
    )
    this.setState({
      syncing: false
    })
    this.props.onUpdate()
    message.success('保存成功')
  }
  componentDidMount() {
    this.removeStoreListeners = store.onDidChange(
      'repos.images',
      (val: GitRepo[]) => {
        let { uploadRepo } = this.state
        const exist = val.filter(each => each.name === uploadRepo)[0]
        if(!exist) {
          uploadRepo = val[0] ? val[0].name : ''
        }
        this.setState({
          imagesRepo: val,
          uploadRepo
        })
      }
    )
  }
  componentWillUnmount() {
    this.removeStoreListeners()
  }
  render() {
    const { body, title, scrollLine, mode, syncing, imagesRepo, uploadRepo } = this.state
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
            placeholder='请输入标题'
          />
        </div>
        <div className='flex'>
          <Button.Group className='mr10'>
            <Button
              title='显示编辑器'
              type={this.getActiveMod(MODE_ENMU.eidtor)}
              onClick={this.onChangeState.bind(this, 'mode', MODE_ENMU.eidtor)}>
              <Icon type='pic-left' />
            </Button>
            <Button
              title='显示全部'
              type={this.getActiveMod(MODE_ENMU.both)}
              onClick={this.onChangeState.bind(this, 'mode', MODE_ENMU.both)}>
              <Icon type='pic-center' />
            </Button>
            <Button
              title='显示预览'
              type={this.getActiveMod(MODE_ENMU.preview)}
              onClick={this.onChangeState.bind(
                this,
                'mode',
                MODE_ENMU.preview
              )}>
              <Icon type='pic-right' />
            </Button>
          </Button.Group>
          <Button className='mr10' onClick={this.onSync}>
            <Icon type='sync' spin={syncing} />
            同步
          </Button>
          <Select value={uploadRepo} style={{width: '120px'}} onChange={this.onRepoSelectChange}>
            {imagesRepo.map(each => (
              <Option key={each.name} value={each.name}>
                {each.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className='issues-editor-content'>
          {mode !== MODE_ENMU.preview && (
            <Editor
              getEditor={this.getEditor}
              content={body}
              uploadRepo={uploadRepo}
              onChange={this.onChangeState.bind(this, 'body')}
              onScroll={this.onChangeState.bind(this, 'scrollLine')}
            />
          )}
          {mode !== MODE_ENMU.eidtor && (
            <Preview content={body} scrollLine={scrollLine} />
          )}
        </div>
      </div>
    )
  }
}
