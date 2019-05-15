import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { Button, Upload, message as Message, Spin, Empty } from 'antd'
import { RouteComponentProps } from 'react-router'
import join from 'url-join'
import { octo, ImgType, DirType } from '../../utils/octokit'
import { AlbumPath } from './Path'
import { Folder } from './Folder'
import { readAsBase64 } from './helper'
import './style.less'
import { CreateFolderModal } from './CreateFolderModal'
import { createObserver } from '@zzwing/react-image'
import { Image } from './Image'
import { store, getCacheRepos } from '../../utils/store'
import http from '../../http'
import { Uploading } from './Uploading'
import { Progress } from '../../component/Progress';
interface RouteProp {
  repo: string
}
type Prop = RouteComponentProps<RouteProp>
type State = {
  pathArr: string[]
  images: ImgType[]
  uploading: File[]
  dir: DirType
  loading: boolean
  isPrivate: boolean
  // error: string
  // modalShow: boolean
  // newPathName: string
  // edit: boolean
}

function getRepo(prop: Prop) {
  return prop.match.params.repo
}

export class ImagesPage extends PureComponent<Prop, State> {
  state: State = {
    pathArr: [],
    images: [],
    dir: {},
    loading: true,
    uploading: [],
    isPrivate: false
    // modalShow: false,
    // newPathName: '',
    // edit: false
  }
  _observer: IntersectionObserver
  componentDidUpdate(prevProps: Prop, prevState) {
    const repo = getRepo(this.props)
    if (getRepo(prevProps) !== repo) {
      this.init()
    }
  }
  componentDidMount() {
    this.init()
    this._observer = createObserver(document.querySelector('.album-images'))
  }
  init() {
    const name = getRepo(this.props)
    const repo = getCacheRepos('all').filter(each => each.name === name)[0]
    if (repo) {
      octo.clearCache()
      octo.setRepo(name)
      this.setState({
        pathArr: [],
        isPrivate: repo.private
      })
      this.getImage()
    }
  }
  /**
   * 获取拼接后的path
   *
   * @readonly
   * @memberof Index
   */
  get path() {
    const { pathArr: path } = this.state
    if (!path.length) return ''
    return join(...this.state.pathArr)
  }

  /**
   * 根据图片名称以及路径, 设置图片的url
   *
   * @param {ImgType} img
   * @returns {ImgType}
   * @memberof Index
   */
  parse(img: ImgType): ImgType {
    return {
      ...img,
      url: octo.parseUrl(this.path, img.name)
    }
  }
  /**
   * 获取当前路径图片列表
   *
   * @param {string} [sha]
   * @memberof Index
   */
  async getImage(sha?: string) {
    if (!this.state.loading) {
      this.setState({ loading: true, images: [], dir: {}, uploading: [] })
    }
    try {
      const dataJson = await octo.getTree(this.path, sha)
      const { images, dir } = dataJson
      this.setState({
        // images: [],
        images: images.map(each => this.parse(each)),
        dir,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        // error: e.message,
        loading: false
      })
    }
  }
  uploader = async event => {
    const { file } = event as { file: File }
    if (!file) {
      return
    }
    this.setState({
      uploading: this.state.uploading.concat([file])
    })
    // const ext = file.name.split('.').pop()
    // let base64 = await readAsBase64(file)
    // base64 = base64.split(',').pop()
    // await octo
    //   .uploadImage(this.path, {
    //     base64,
    //     filename: `${new Date().getTime()}.${ext}`
    //   })
    //   .catch(e => {
    //     Message.error(`Upload error ${e.message}`)
    //   })
    // this.getImage()
  }
  /**
   * 回到某个目录
   * 一般都会有缓存, 直接从缓存中获取数据
   *
   * @memberof Index
   */
  onBackPath = (path: string) => {
    const { pathArr } = this.state
    let target = []
    if (path) {
      const index = pathArr.indexOf(path)
      if (index === pathArr.length - 1) return
      target = pathArr.slice(0, index + 1)
    }
    this.setState(
      {
        pathArr: target
      },
      () => {
        this.getImage()
      }
    )
  }
  /**
   * 进入目录
   * 并根据目录sha获取数据
   *
   * @memberof Index
   */
  enterFolder = (name: string, sha?: string) => {
    const { pathArr } = this.state
    this.setState(
      {
        pathArr: pathArr.concat(name)
      },
      () => {
        this.getImage(sha)
      }
    )
  }
  createFolder = (name: string) => {
    const { dir } = this.state
    if (name in dir) {
      Message.error('文件夹已存在')
      return
    }
    octo.createPath(this.path, name)
    this.enterFolder(name)
  }
  openCreateFolder = () => {
    let _div = document.createElement('div')
    document.body.appendChild(_div)
    let visible = true
    function onCancel() {
      visible = false
      render()
    }
    function afterClosed() {
      const unmountResult = ReactDOM.unmountComponentAtNode(_div)
      if (unmountResult) {
        document.body.removeChild(_div)
      }
    }
    const onConfirm = name => {
      this.createFolder(name)
      onCancel()
    }
    const render = () => {
      ReactDOM.render(
        <CreateFolderModal
          visible={visible}
          onCancel={onCancel}
          onConfirm={onConfirm}
          afterClosed={afterClosed}
        />,
        _div
      )
    }
    render()
  }
  render() {
    const { images, pathArr, dir, loading, isPrivate, uploading } = this.state
    const keys = Object.keys(dir)
    const empty = !(uploading.length || images.length)
    return (
      <div className='album-container'>
        <div className='album-title flex align-center'>
          <div className='flex-grow'>
            <div className='album-title-text'>
              {this.props.match.params.repo}
            </div>
          </div>
          <Button
            icon='folder-add'
            className='mr10'
            onClick={this.openCreateFolder}>
            Create Folder
          </Button>
          <Upload
            showUploadList={false}
            accept='image/*'
            customRequest={this.uploader}>
            <Button icon='upload'>Upload Image</Button>
          </Upload>
        </div>
        <AlbumPath path={pathArr} onBack={this.onBackPath} />
        {!!keys.length && (
          <>
            <div className='album-type'>文件夹</div>
            <div className='album-folder'>
              {keys.map(name => {
                const sha = dir[name]
                return (
                  <Folder
                    key={name}
                    name={name}
                    sha={sha}
                    onEnter={this.enterFolder}
                  />
                )
              })}
            </div>
          </>
        )}
        <div className='album-type'>图片</div>
        <div className='album-images'>
          <Spin
            spinning={loading}
            delay={500}
            className='album-images-loading'
          />
          {!empty ? (
            <>
              {uploading.map(each => (
                <Uploading
                  file={each}
                  key={each.name}
                  path={this.path}
                  observer={this._observer}
                />
              ))}
              {images.map(each => (
                <Progress key={each.sha}/>
                // <Image
                //   isPrivate={isPrivate}
                //   className='album-images-item'
                //   width={150}
                //   height={120}
                //   objectFit='cover'
                //   key={each.name}
                //   src={each.url}
                //   sha={each.sha}
                //   repo={`${http.owner}/${http.repo}`}
                //   observer={this._observer}
                // />
              ))}
            </>
          ) : !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ flexGrow: 1 }}
            />
          ) : null}
        </div>
      </div>
    )
  }
}
