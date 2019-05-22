import React, { useState, useCallback, useMemo } from 'react'
import cls from 'classnames'
import { ImgType } from 'src/renderer/utils/imageKit'
import { UploadingFile, Uploading } from './Uploading'
import { Image } from './Image'
import http from 'src/renderer/http'
import { Icon, message } from 'antd'
import { clipboard } from 'electron'

export type ImgOrFile = (ImgType | UploadingFile) & {
  checked: boolean
}

interface Prop {
  item: ImgOrFile
  isPrivate: boolean
  onClick: () => void
  onDelete: (arg) => void
  className: string
  path: string
}

export function AlbumItem(props: Prop) {
  const { item, onDelete: propDelete, className, path, ...rst } = props
  const [deleting, setDeleting] = useState(false)
  const onDelete = () => {
    if (deleting) return
    setDeleting(true)
    propDelete(item)
  }
  const onCopy = useCallback(() => {
    clipboard.writeText(`![](${item.url})`)
    message.success('复制成功')
  }, ['item'])
  let jsx
  if ((item as UploadingFile).file) {
    const f: UploadingFile = item as UploadingFile
    jsx = <Uploading {...rst} uploading={f} path={path} />
  } else {
    const f: ImgType = item
    jsx = (
      <Image
        {...rst}
        src={f.url}
        sha={f.sha}
        repo={`${http.owner}/${http.repo}`}
      />
    )
  }
  return (
    <div className={className + (deleting ? ' blur' : '')}>
      <div className='album-images-action'>
        <Icon type='copy' className='mr5' onClick={onCopy} />
        <Icon type='delete' onClick={onDelete} />
      </div>
      {jsx}
    </div>
  )
}
