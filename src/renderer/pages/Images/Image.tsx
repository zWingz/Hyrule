import React, { PureComponent } from 'react'
import {
  Image as ReactImage,
  createObserver,
  iImageProp
} from '@zzwing/react-image'
import { ipcRenderer } from 'electron'
import http from '../../http'
import { Cache } from '../../utils/cache';

interface Prop extends iImageProp {
  isPrivate: boolean
  sha?: string
  name: string
}

interface State {
  url: string
  loaded: boolean
}

const b64toBlob = async (b64Data, contentType = 'application/octet-stream') => {
  const url = `data:${contentType};base64,${b64Data}`
  const response = await fetch(url)
  const blob = await response.blob()
  return blob
}

const cache = new Cache<string>()

export class Image extends PureComponent<Prop, State> {
  state = {
    url: '',
    loaded: true
  }
  _isMounted = false
  constructor(p: Prop) {
    super(p)
    this.state.loaded = cache.has(p.sha) || !p.isPrivate
  }
  async componentDidMount() {
    this._isMounted = true
    const { src, isPrivate, sha, name } = this.props
    const has = cache.has(sha)
    let url = src
    let {loaded} = this.state
    if(has) {
      url = cache.get(sha)
    } else if (isPrivate) {
      if(cache.has(sha)) {
        url = cache.get(sha)
      } else {
        const { content } = await http.getBlob(sha)
        const [, ext] = name.split('.')
        try {
          const blob = await b64toBlob(content, `image/${ext}`)
          url = URL.createObjectURL(blob)
          cache.set(sha, url)
        } catch (e) {
          url = ''
        }
      }
      loaded = true
    }
    if (!this._isMounted) {
      return
    }
    this.setState({ url, loaded })
  }
  componentWillUnmount() {
    this._isMounted = false
  }
  render() {
    const { url, loaded } = this.state
    return loaded ? (
      <ReactImage {...this.props} src={url} />
    ) : (
      <div className='private-iamge-placeholder' />
    )
  }
}
