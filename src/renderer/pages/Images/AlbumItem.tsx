import React, { useState, useCallback, useMemo } from 'react'
import cls from 'classnames'
import { ImgType, ImageKit } from 'src/renderer/utils/imageKit'
import { UploadingFileType, Uploading } from './Uploading'
import { Image } from './Image'
import { Icon, message } from 'antd'
import { clipboard } from 'electron'

export type ImgOrFileType = (ImgType | UploadingFileType) & {
  checked: boolean
}

interface Prop {
  item: ImgOrFileType
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
    message.success('Copy Succeed')
  }, ['item'])
  let jsx
  if ((item as UploadingFileType).file) {
    const f: UploadingFileType = item as UploadingFileType
    jsx = <Uploading {...rst} uploading={f} path={path} />
  } else {
    const f: ImgType = item
    jsx = (
      <Image
        {...rst}
        src={f.url}
        sha={f.sha}
        repo={`${ImageKit.http.owner}/${ImageKit.http.repo}`}
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
