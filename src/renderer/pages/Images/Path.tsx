import React from 'react'
import { Icon } from 'antd'
import cls from 'classnames'
interface Prop {
  path: string[]
  onBack: (path: string) => void
}

function Split() {
  return <span className='album-path-split'>/</span>
}

export function AlbumPath(props: Prop) {
  const { path, onBack } = props
  const active = path.length - 1
  return (
    <div className='album-path-wrapper'>
      <Icon type='home' onClick={() => onBack('')} /> <Split />
      {path.map((each, idx) => (
        <div key={each} className='flex'>
          <div
            className={cls('album-path-item', { active: idx === active })}
            onClick={() => onBack(each)}>
            {each}
          </div>
          <Split />
        </div>
      ))}
    </div>
  )
}
