import React, { PureComponent } from 'react'
import { Image as ReactImage, createObserver, iImageProp } from '@zzwing/react-image'
import { ipcRenderer } from 'electron'
import http from '../../http';

interface Prop extends iImageProp{
  isPrivate: boolean,
  sha?: string
  name: string
}

interface State {
  url: string
}

const b64toBlob = async (b64Data, contentType='application/octet-stream') => {
  const url = `data:${contentType};base64,${b64Data}`;
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

export class Image extends PureComponent<Prop, State> {
  state = {
    url: ''
  }
  async componentDidMount() {
    const {src,isPrivate, sha, name } = this.props
    let url = src
    if(sha) {
      const { content } = await http.getBlob(sha)
      const [, ext] = name.split('.')
      const blob = await b64toBlob(content, `image/${ext}`)
      url = URL.createObjectURL(blob)
      console.log('getPrivate', url);
    }
    this.setState({url})
  }
  
  render() {
    const { url} = this.state
    return <ReactImage {...this.props} src={url}></ReactImage>
  }
}
