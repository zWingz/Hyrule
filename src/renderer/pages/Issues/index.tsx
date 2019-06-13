import React, { PureComponent } from 'react'
import { IssuesKit } from 'src/renderer/utils/issuesKit'
import { GitRepo, GitIssue } from 'src/renderer/http/types'
import { RepoWrapper } from 'src/renderer/component/RepoWrapper'
import './style.less'
import { IssuesEditor } from './Editor'
import { IssuesList } from './List'
import { Route, Switch, RouteComponentProps } from 'react-router'
import { Provider, UploadRepoContext } from './Context'
import {
  getCacheIssues,
  setCacheIssues,
  getCacheRepos,
  getCacheDefUploadRepo,
  setCacheDefUploadRepo,
  store
} from 'src/renderer/utils/store'
import { Spin, Select, Icon } from 'antd'
import { ImagesPageBase } from '../Images'
import { empty } from 'src/renderer/utils/helper'
import { ImageKit } from 'src/renderer/utils/imageKit'
import cls from 'classnames'

const { Option } = Select
type Prop = RouteComponentProps<{ repo: string }> & {
  repo: GitRepo
}
type State = {
  issues: GitIssue[]
  loading: boolean
  imagesRepo: GitRepo[]
  uploadRepo: string
  showImage: boolean
}

let cache: GitRepo = null

class IssuesPageBase extends PureComponent<Prop, State> {
  state: State = {
    issues: [],
    loading: true,
    imagesRepo: getCacheRepos('images'),
    uploadRepo: getCacheDefUploadRepo(),
    showImage: false
  }
  removeStoreListeners: () => void = empty
  get uploadRepoInfo(): GitRepo {
    const { uploadRepo, imagesRepo } = this.state
    if (cache && cache.name === uploadRepo) {
      return cache
    }
    const repo = imagesRepo.filter(each => each.name === uploadRepo)[0]
    cache = repo
    console.log(repo)
    return repo
  }
  constructor(p: Prop) {
    super(p)
    this.state.issues = getCacheIssues(this.props.repo.name)
  }
  onRepoSelectChange = (v: string) => {
    setCacheDefUploadRepo(v)
    ImageKit.setRepo(v)
    this.setState({
      uploadRepo: v
    })
  }
  onShowImageChange = () => {
    this.setState(p => ({
      showImage: !p.showImage
    }))
  }
  async componentDidMount() {
    this.init()
    ImageKit.setRepo(this.state.uploadRepo)
    this.removeStoreListeners = store.onDidChange(
      'repos.images',
      (val: GitRepo[]) => {
        let { uploadRepo } = this.state
        const exist = val.filter(each => each.name === uploadRepo)[0]
        if (!exist) {
          uploadRepo = val[0] ? val[0].name : ''
        }
        this.setState({
          imagesRepo: val,
          uploadRepo
        })
        ImageKit.setRepo(uploadRepo)
      }
    )
  }
  componentWillUnmount() {
    this.removeStoreListeners()
  }
  getIssues = async () => {
    this.setState({
      loading: true
    })
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
  init() {
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
    const CreateEditorPage = p => (
      <IssuesEditor onUpdate={this.getIssues} {...p} />
    )
    const CreateIssuesListPage = p => (
      <IssuesList onUpdate={this.getIssues} {...p} />
    )
    const {
      match: { url }
    } = this.props
    const { imagesRepo, uploadRepo, showImage } = this.state
    const condition = uploadRepo && showImage
    return (
      <>
        <div
          className='page-container'
          onClick={showImage ? this.onShowImageChange : empty}>
          <div className='flex'>
            <div className='page-title mr-auto'>{this.props.repo.name}</div>
            {uploadRepo && (
              <div className='flex-center'>
                <Icon
                  type='menu-fold'
                  className='mr10'
                  onClick={this.onShowImageChange}
                  style={{ fontSize: '22px' }}
                />
                <Select
                  placeholder='Select'
                  value={uploadRepo}
                  style={{ minWidth: '120px' }}
                  onChange={this.onRepoSelectChange}>
                  {imagesRepo.map(each => (
                    <Option key={each.name} value={each.name}>
                      {each.name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          {loading && (
            <Spin delay={250} className='spin-loading absolute-full' />
          )}
          <Provider value={issues}>
            <UploadRepoContext.Provider value={uploadRepo}>
              <Switch>
                <Route path={`${url}/create`} render={CreateEditorPage} />
                <Route path={`${url}/:number`} render={CreateEditorPage} />
                <Route path={`${url}`} render={CreateIssuesListPage} />
              </Switch>
            </UploadRepoContext.Provider>
          </Provider>
        </div>
        {uploadRepo && (
          <ImagesPageBase
            className={cls('issues-images', {
              hidden: !condition
            })}
            repo={this.uploadRepoInfo}
          />
        )}
      </>
    )
  }
}

export const IssuesPage = RepoWrapper(IssuesPageBase)
