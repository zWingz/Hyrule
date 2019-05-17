import React, { useCallback, useState, useEffect } from 'react'
import { ImgOrFile } from './AlbumItem'
import { Button, Spin } from 'antd'
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
  console.log('render', data)
  const onClick = useCallback(
    (item: ImgOrFile) => {
      onChecked(item)
    },
    [data]
  )
  const onDelete = useCallback(() => {
    setDeleting(true)
    const { length } = data
    console.log(data)
    let count = 0
    data.forEach(each => {
      console.log('each', each, length)
      prop.onDelete(each).then(() => {
        count++
        if (count === length) {
          setDeleting(false)
        }
      })
    })
  }, [data])
  return (
    <div className={cls('album-delete rel flex', { visible })}>
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
