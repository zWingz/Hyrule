import React, { PureComponent } from 'react'
import { Icon, Button, Upload, message as Message, Spin, Empty } from 'antd'
import { RouteComponentProps } from 'react-router'
import cls from 'classnames'
import join from 'url-join'
import { octo, ImgType, DirType } from '../../utils/octokit'
import { AlbumPath } from './Path'
import { Folder } from './Folder'
import './style.less'
import { CreateFolderModal } from './CreateFolderModal'
import { createObserver, iImageProp } from '@zzwing/react-image'
import { Image } from './Image'
import { store, getCacheRepos } from '../../utils/store'
import http from '../../http'
import { Uploading, UploadingFile } from './Uploading'
import { openModal, debounce } from '../../utils/helper'
import { AlbumItem } from './AlbumItem'
interface RouteProp {
  repo: string
}

type Prop = RouteComponentProps<RouteProp>

type ImgOrFile = (ImgType | UploadingFile) & {
  checked: boolean
}

type State = {
  pathArr: string[]
  images: ImgOrFile[]
  dir: DirType
  loading: boolean
  isPrivate: boolean
  checkedToggle: boolean
  dragover: boolean
  // error: string
  // modalShow: boolean
  // newPathName: string
  // edit: boolean
}

const { Dragger } = Upload

function getRepo(prop: Prop) {
  return prop.match.params.repo
}

export class ImagesPage extends PureComponent<Prop, State> {
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
  state: State = {
    pathArr: [],
    images: [],
    dir: {},
    loading: true,
    isPrivate: false,
    checkedToggle: false,
    dragover: false
    // modalShow: false,
    // newPathName: '',
    // edit: false
  }
  _observer: IntersectionObserver
  nameKeys: string[] = []
  imgCommon: Partial<iImageProp> = {
    width: 200,
    height: 150,
    objectFit: 'cover',
    observer: null
  }
  onDragToggle = (val, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      dragover: val
    })
  }
  componentDidUpdate(prevProps: Prop, prevState) {
    const repo = getRepo(this.props)
    if (getRepo(prevProps) !== repo) {
      this.init()
    }
  }
  componentDidMount() {
    this.init()
    this._observer = createObserver(document.querySelector('.album-images'))
    this.imgCommon.observer = this._observer
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
      this.setState({ loading: true, images: [], dir: {} })
    }
    try {
      const dataJson = await octo.getTree(this.path, sha)
      const { images, dir } = dataJson
      this.setState({
        // images: [],
        images: images.map(each => ({
          ...this.parse(each),
          checked: false
        })),
        dir,
        loading: false
      })
      this.nameKeys = images.map(each => each.name)
    } catch (e) {
      console.error(e)
      this.setState({
        // error: e.message,
        loading: false
      })
    }
  }
  uploader = async event => {
    const { file } = event as { file: UploadingFile['file'] }
    if (!file) {
      return
    }
    const [name, ext] = file.name.split('.')
    let alter = file.name
    let indx = 1
    while (this.nameKeys.indexOf(alter) !== -1) {
      alter = `${name}_${indx}.${ext}`
      indx++
    }
    file.alter = alter
    this.setState(prev => {
      return {
        images: [
          {
            file,
            checked: false,
            sha: '',
            url: '',
            name: alter
          } as ImgOrFile
        ].concat(prev.images)
      }
    })
    this.nameKeys.push(alter)
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
    openModal(CreateFolderModal, {
      onConfirm: this.createFolder
    })
  }
  deleteSingleFile = async (arg: ImgOrFile) => {
    await octo.removeFile(this.path, arg)
    this.setState({
      images: this.state.images.filter(each => each.name !== arg.name)
    })
  }
  toggle = async () => {
    const { checkedToggle, images } = this.state
    if (checkedToggle) {
      const remove = images.filter(each => each.checked).map(each => each.name)
      console.log(remove)
      // octo.batchDelete(this.path, remove)
    }
    this.setState({
      checkedToggle: !checkedToggle
    })
  }
  onChecked(idx: number) {
    const { images, checkedToggle } = this.state
    if (!checkedToggle) return
    const item = images[idx]
    item.checked = !item.checked
    this.setState({
      images: [...images]
    })
  }
  onDrop: React.DragEventHandler = e => {
    this.onDragToggle(false, e)
    if (e.type === 'dragover') {
      return
    }
    const files: File[] = Array.prototype.slice
      .call(e.dataTransfer.files)
      .filter(file => /^image/.test(file.type))
    if (!files.length) return
    files.forEach(file => {
      this.uploader({
        file
      })
    })
  }
  renderItem(item: ImgOrFile, idx: number) {
    const {
      imgCommon,
      state: { checkedToggle, isPrivate }
    } = this
    const onClick = this.onChecked.bind(this, idx)
    const className = cls('album-images-item', {
      checked: checkedToggle && item.checked
    })
    const props = {
      onClick,
      isPrivate,
      item,
      preview: !checkedToggle,
      className,
      onDelete: this.deleteSingleFile,
      path: this.path,
      ...imgCommon
    }
    return <AlbumItem {...props} key={item.name} />
  }

  render() {
    const { images, pathArr, dir, loading, dragover } = this.state
    const keys = Object.keys(dir)
    const empty = !images.length
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
            multiple
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
        <div
          className={cls('album-images', {
            dragover
          })}
          onDrop={this.onDrop}
          onDragOver={this.onDragToggle.bind(this, true)}
          onDragLeave={this.onDragToggle.bind(this, false)}>
          <Spin
            spinning={loading}
            delay={500}
            className='album-images-loading'
          />
          {!empty ? (
            images.map((each: ImgOrFile, idx) => this.renderItem(each, idx))
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
