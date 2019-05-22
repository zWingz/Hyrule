import React from 'react'
import { Image as ReactImage, iImageProp } from '@zzwing/react-image'

interface Prop extends iImageProp {
  isPrivate: boolean
  sha?: string
  repo: string
}

/**
 * use isPrivate prop to load image
 * render once
 *
 * @param {Prop} p
 * @returns
 */
export const Image = React.memo(function (p: Prop) {
  const { src, sha, repo, isPrivate } = p
  let url = src
  if(!src) return null
  if (isPrivate) {
    const name = src.split('/').pop()
    url = `github://${repo}/${sha}/${name}`
  }
  return <ReactImage {...p} src={url} />
}, () => true)
