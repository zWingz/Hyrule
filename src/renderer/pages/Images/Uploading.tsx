import React from 'react'
import { octo } from '../../utils/octokit'
import { readAsBase64 } from './helper'
import { Image } from '@zzwing/react-image';
import { Progress } from '../../component/Progress';

interface Prop {
  file: File
  path: string
  observer: IntersectionObserver
}

interface State {
  progress: number
  loading: boolean
  src: string
}

export class Uploading extends React.PureComponent<Prop, State> {
  state = {
    progress: 0,
    loading: true,
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
        filename: `${Date.now()}.${file.name.split('.').pop()}`
        // filename: file.name
      },
      arg => {
        console.log(arg)
      }
    )
  }
  render() {
    const { src } = this.state
    return (
      src && (
        <div className='album-images-item uploading'>
          <Progress />
          <Image src={src} width={150} height={120} objectFit='cover' observer={this.props.observer}/>
        </div>
      )
    )
  }
}
