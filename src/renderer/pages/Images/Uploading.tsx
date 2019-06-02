import React from 'react'
import { ImageKit } from '../../utils/imageKit'
import { Image, iImageProp } from '@zzwing/react-image'
import { Progress } from '../../component/Progress'
import omit from 'omit.js'
import { readAsBase64 } from 'src/renderer/utils/helper'

interface AlterFile extends File {
  alter?: string
}

export type UploadingFile = {
  file: AlterFile
  name: string
  sha: string
  url: string
  blobUrl: string
}
interface Prop extends Omit<iImageProp, 'src' | 'onDelete'> {
  uploading: UploadingFile
  path: string
}

interface State {
  progress: number
  uploading: boolean
  src: string
}

export class Uploading extends React.PureComponent<Prop, State> {
  state = {
    progress: 0,
    uploading: true,
    src: ''
  }
  sha: string
  async componentDidMount() {
    const { uploading, path } = this.props
    const { file } = uploading
    if (!file) return
    const src = URL.createObjectURL(file)
    this.setState({
      src
    })
    uploading.blobUrl = src
    const base64 = await readAsBase64(file)
    const { sha, url } = await ImageKit.uploadImage(
      path,
      {
        base64,
        filename: file.alter
        // filename: file.name
      },
      arg => {
        this.setState({
          progress: Math.ceil(Math.min(arg, 99))
        })
      }
    )
    // set sha to file
    // not effect
    uploading.sha = sha
    uploading.url = url
    this.setState({
      uploading: false
    })
  }
  render() {
    const { src, progress, uploading } = this.state
    const imgProp = omit(this.props, [
      'uploading',
      'path',
      'children',
      'className'
    ])
    return (
      src && (
        <div className='rel'>
          {uploading && (
            <div className='uploading-progress flex-center absolute-full'>
              <Progress percentage={progress} />
            </div>
          )}
          <Image {...imgProp} src={src} />
        </div>
      )
    )
  }
}
