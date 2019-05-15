import React from 'react'
import { octo } from '../../utils/octokit'
import { readAsBase64 } from './helper'
import { Image, iImageProp } from '@zzwing/react-image'
import { Progress } from '../../component/Progress'
import omit from 'omit.js'

export interface AlterFile extends File {
  alter?: string
}

interface Prop extends Omit<iImageProp, 'src'> {
  file: AlterFile
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
  url: string
  async componentDidMount() {
    const { file, path } = this.props
    if (!file) return
    const src = URL.createObjectURL(file)
    this.setState({
      src
    })
    let base64 = await readAsBase64(file)
    base64 = base64.split(',').pop()
    await octo.uploadImage(
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
    setTimeout(() => {
      this.setState({
        uploading: false
      })
    }, 100)
  }
  render() {
    const { src, progress, uploading } = this.state
    const imgProp = omit(this.props, ['file', 'path', 'children', 'className'])
    const { className } = this.props
    return (
      src && (
        <div className={'uploading ' + className}>
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
