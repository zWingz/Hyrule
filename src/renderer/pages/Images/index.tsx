import React, { PureComponent } from 'react'
import {
  Icon,
  Button,
  Upload,
  message as Message,
  Spin,
  Empty,
  Switch
} from 'antd'
import { RouteComponentProps } from 'react-router'
import cls from 'classnames'
import join from 'url-join'
import { createObserver, iImageProp } from '@zzwing/react-image'
import { ImageKit, ImgType, DirType } from '../../utils/imageKit'
import { AlbumPath } from './Path'
import { Folder } from './Folder'
import './style.less'
import { CreateFolderModal } from './CreateFolderModal'
import { getCacheRepos } from '../../utils/store'
import { UploadingFile } from './Uploading'
import { openModal } from '../../utils/helper'
import { AlbumItem, ImgOrFile } from './AlbumItem'
import { DeleteQueue } from './DeleteQueue'
import { AbortError } from 'src/renderer/http/Error'
import { RepoWrapper } from 'src/renderer/component/RepoWrapper'
import { GitRepo } from 'src/renderer/http/types'
interface RouteProp {
  repo: string
}

// type Prop = RouteComponentProps<RouteProp>
type Prop = {
  repo: GitRepo
}

type State = {
  pathArr: string[]
  images: ImgOrFile[]
  dir: DirType
  loading: boolean
  checkedToggle: boolean
  dragover: boolean
  // error: string
  // modalShow: boolean
  // newPathName: string
  // edit: boolean
}

// function getRepo(prop: Prop) {
//   return prop.match.params.repo
// }

let abortToken = null

class ImagesPageBase extends PureComponent<Prop, State> {
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
  get deleteQueue() {
    return this.state.images.filter(each => each.checked)
  }
  onDragToggle = (val, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      dragover: val
    })
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
      url: ImageKit.parseUrl(this.path, img.name)
    }
  }
  /**
   * 获取当前路径图片列表
   *
   * @param {string} [sha]
   * @memberof Index
   */
  async getImage(sha?: string) {
    if (abortToken) {
      abortToken()
    }
    if (!this.state.loading) {
      this.setState({ loading: true, images: [], dir: {} })
    }
    try {
      const dataJson = await ImageKit.getTree(this.path, sha, abort => {
        abortToken = abort
      })
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
      if (e instanceof AbortError) return
      console.error(e)
      this.setState({
        // error: e.message,
        loading: false
      })
    }
    abortToken = null
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
            // sha: '',
            // url: '',
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
    ImageKit.createPath(this.path, name)
    this.enterFolder(name)
  }
  openCreateFolder = () => {
    openModal(CreateFolderModal, {
      onConfirm: this.createFolder
    })
  }
  deleteSingleFile = async (arg: ImgOrFile) => {
    await ImageKit.removeFile(this.path, arg)
    this.setState({
      images: this.state.images.filter(each => each.name !== arg.name)
    })
  }
  toggle = async () => {
    const { checkedToggle } = this.state
    this.setState({
      checkedToggle: !checkedToggle
    })
  }
  onChecked = (item: ImgOrFile) => {
    const { checkedToggle } = this.state
    if (!checkedToggle) return
    item.checked = !item.checked
    this.setState({
      images: [...this.state.images]
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

  renderItem(item: ImgOrFile) {
    const {
      imgCommon,
      state: { checkedToggle }
    } = this
    const { private: isPrivate } = this.props.repo
    const onClick = this.onChecked.bind(this, item)
    const className = cls('album-images-item', {
      blur: checkedToggle && item.checked
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
  init() {
    // const name = getRepo(this.props)
    const { repo } = this.props
    // const repo = getCacheRepos('all').filter(each => each.name === name)[0]
    // if (repo) {
    ImageKit.clearCache()
    //   ImageKit.setRepo(name)
    // }
    this.setState(
      {
        pathArr: [],
        loading: true,
        images: [],
        dir: {}
      },
      () => {
        this.getImage()
      }
    )
  }
  componentDidUpdate(prevProps: Prop, prevState) {
    if (prevProps.repo !== this.props.repo) {
      this.init()
    }
  }
  componentDidMount() {
    this.init()
    this._observer = createObserver(document.querySelector('.album-images'))
    this.imgCommon.observer = this._observer
  }
  componentWillUnmount() {
    this._observer.disconnect()
  }
  render() {
    const {
      images,
      pathArr,
      dir,
      loading,
      dragover,
      checkedToggle
    } = this.state
    const { repo } = this.props
    const keys = Object.keys(dir)
    const empty = !images.length
    return (
      <div className='page-container album-container'>
        <div className='album-title flex align-center'>
          <div className='flex-grow'>
            <div className='page-title'>{repo.name}</div>
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
        <div className='flex'>
          <AlbumPath path={pathArr} onBack={this.onBackPath} />
          <Switch
            className='ml10'
            checked={checkedToggle}
            checkedChildren='取消'
            unCheckedChildren='编辑'
            onChange={this.toggle}
          />
        </div>
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
            dragover,
            slide: checkedToggle
          })}
          onDrop={this.onDrop}
          onDragOver={this.onDragToggle.bind(this, true)}
          onDragLeave={this.onDragToggle.bind(this, false)}>
          <Spin
            spinning={loading}
            delay={250}
            className='album-images-loading absolute-full'
          />
          {!empty ? (
            images.map((each: ImgOrFile) => this.renderItem(each))
          ) : !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ flexGrow: 1 }}
            />
          ) : null}
        </div>
        <DeleteQueue
          visible={checkedToggle}
          data={this.deleteQueue}
          onChecked={this.onChecked}
          onDelete={this.deleteSingleFile}
        />
      </div>
    )
  }
}

export const ImagesPage = RepoWrapper(ImagesPageBase)
