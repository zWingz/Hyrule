import React, { useCallback, useState, useEffect } from 'react'
import { ImgOrFile } from './AlbumItem'
import { Button, Spin, Empty } from 'antd'
import { UploadingFile } from './Uploading'
import cls from 'classnames'
interface Prop {
  data: ImgOrFile[]
  visible: boolean
  onChecked: (arg: ImgOrFile) => void
  onDelete: (arg: ImgOrFile) => Promise<any>
  // onDelete
}

export function DeleteQueue(prop: Prop) {
  const { data, visible, onChecked } = prop
  const [deleting, setDeleting] = useState(false)
  const onClick = useCallback(
    (item: ImgOrFile) => {
      onChecked(item)
    },
    [data]
  )
  const onDelete = useCallback(() => {
    setDeleting(true)
    const { length } = data
    let count = 0
    data.forEach(each => {
      prop.onDelete(each).finally(() => {
        count++
        if (count === length) {
          setDeleting(false)
        }
      })
    })
  }, [data])
  return (
    <div className={cls('album-delete flex', { visible })}>
      {data.length ? (
        <div className='album-delete-queue flex-grow'>
          {data.map(each => {
            const url = (each as UploadingFile).blobUrl || each.url
            return (
              <div key={each.name} onClick={() => onClick(each)}>
                <img src={url} className='album-delete-item' />
              </div>
            )
          })}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='请选择需要删除的图片' style={{flexGrow: 1}}/>
      )}
      <div className='album-delete-icon flex-center'>
        <Button
          shape='circle'
          type='danger'
          icon='delete'
          disabled={deleting}
          onClick={onDelete}
        />
      </div>
      <Spin
        spinning={deleting}
        className='absolute-full'
        style={{ paddingTop: '60px' }}
      />
    </div>
  )
}
