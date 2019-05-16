import dayjs from 'dayjs'
import React from 'react'
import ReactDOM from 'react-dom'
import { ModalProps } from 'antd/lib/modal'
export function getNow() {
  return dayjs().format('YYYY-MM-DD hh:mm:ss')
}

export function pick<T = PlainObj>(obj: T, keys: Array<keyof T>) {
  const ret = {} as any
  keys.forEach(each => {
    ret[each] = obj[each]
  })
  return ret as { [k in keyof T]: T[k] }
}

export function pickArray<T = PlainObj>(array: T[], keys: Array<keyof T>) {
  return array.map(each => pick(each, keys))
}

export function readAsBase64(file): Promise<string> {
  return new Promise((res, rej) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      res(fileReader.result as string)
    }
    fileReader.onerror = rej
    fileReader.readAsDataURL(file) // 将文件转成base64
  })
}

export interface OpenModalProp extends ModalProps {
  onConfirm: (...arg) => void
  [k: string]: any
}

export function openModal<T>(
  Modal: React.ComponentClass<T & ModalProps> | React.SFC<T & ModalProps>,
  props: OpenModalProp
) {
  let _div = document.createElement('div')
  document.body.appendChild(_div)
  const { onConfirm, onCancel, ...rst } = props
  let visible = true
  function cancel(e) {
    visible = false
    onCancel && onCancel(e)
    render()
  }
  function afterClosed() {
    const unmountResult = ReactDOM.unmountComponentAtNode(_div)
    if (unmountResult) {
      document.body.removeChild(_div)
    }
  }
  const onOk = e => {
    onConfirm && onConfirm(e)
    cancel(e)
  }
  const render = () => {
    ReactDOM.render(
      <Modal
        {...rst as ModalProps & T}
        visible={visible}
        onCancel={cancel}
        afterClosed={afterClosed}
        onConfirm={onOk}
      />,
      _div
    )
  }
  render()
}
