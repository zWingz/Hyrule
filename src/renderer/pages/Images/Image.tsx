import React from 'react'
import { Image as ReactImage, iImageProp } from '@zzwing/react-image'

interface Prop extends iImageProp {
  isPrivate: boolean
  sha?: string
  repo: string
}

export function Image(p: Prop) {
  const { src, sha, repo, isPrivate } = p
  let url = src
  if (isPrivate) {
    const name = src.split('/').pop()
    url = `github://${repo}/${sha}/${name}`
  }
  return <ReactImage {...p} src={url} />
}
