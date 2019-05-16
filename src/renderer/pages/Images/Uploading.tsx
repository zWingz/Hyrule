import React from 'react'
import { octo } from '../../utils/octokit'
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
    let base64 = await readAsBase64(file)
    base64 = base64.split(',').pop()
    const { sha } = await octo.uploadImage(
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
    const { className } = this.props
    return (
      src && (
        <div className={'rel' + className}>
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
