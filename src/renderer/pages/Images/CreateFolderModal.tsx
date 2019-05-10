import React, { useState } from 'react'
import { Modal, Input } from 'antd'

interface Prop {
  visible: boolean
  onConfirm: (value: string) => void
  onCancel: () => void
  afterClosed: () => void
}

export function CreateFolderModal(prop: Prop) {
  const { visible, onConfirm, onCancel, afterClosed } = prop
  const [value, setValue] = useState('')
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
  }
  function onOk() {
    onConfirm(value)
  }
  return (
    <Modal
      title='Create Folder'
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={afterClosed}>
      <Input value={value} onChange={onChange} placeholder='输入文件夹名称' />
      <div className='create-folder-tips'>
        <div>提示:</div>
        <div>1. 上传了图片后文件夹才生效</div>
        <div>2. 无法修改文件夹名称</div>
        <div>3. 若文件夹无图片, 会自动删除</div>
      </div>
    </Modal>
  )
}
