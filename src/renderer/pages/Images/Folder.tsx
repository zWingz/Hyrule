import React, { PureComponent, useCallback } from 'react'
import { Icon } from 'antd'
interface Prop {
  name: string
  sha: string
  onEnter: (name: string, sha: string) => void
}

export function Folder(prop: Prop) {
  const onClick = useCallback(() => {
    const { name, sha } = prop
    prop.onEnter(name, sha)
  }, ['name', 'sha'])
  return (
    <div className='album-folder-item flex align-center' onClick={onClick}>
      <Icon type='folder' className='album-folder-icon mr5'/>
      {prop.name}
    </div>
  )
}
