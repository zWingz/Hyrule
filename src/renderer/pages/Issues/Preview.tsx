import React, { useLayoutEffect, useCallback } from 'react'
import { parseMd } from 'src/renderer/utils/markdown'
import './markdown.less'
import { shell } from 'electron'
type Prop = {
  content: string
  scrollLine?: number
}

let dom = null

function getDom(): HTMLDivElement {
  if (dom) return dom
  return document.getElementById('markdown-preview') as HTMLDivElement
}

let _div: HTMLDivElement = null
function calcHeight(content: string, lineNumber) {
  const split = content.split(/[\n]/)
  const hide = split.slice(0, lineNumber).join('\n')
  if(!_div) {
    _div = document.createElement('div')
    _div.classList.add('markdown-preview')
    _div.classList.add('hidden')
    document.body.append(_div)
  }
  _div.setAttribute('style', `width: ${getDom().clientWidth}`)
  _div.innerHTML = parseMd(hide)
  // fixed padding 40
  return _div.clientHeight - 40
}

export function Preview(p: Prop) {
  const { scrollLine, content } = p
  useLayoutEffect(() => {
    let c = 0
    if (scrollLine >= 0) {
      c = calcHeight(content, scrollLine)
    }
    getDom().scrollTo({
      top: c
    })
  }, [scrollLine])
  const onClick = useCallback<React.MouseEventHandler>((e) => {
    const { target } = e
    const { tagName } = target as HTMLElement
    if(tagName !== 'A') return
    const { href } = target as HTMLAnchorElement
    shell.openExternal(href)
  }, [])
  return (
    <div id='markdown-preview' className='markdown-preview' onClick={onClick}>
      <div dangerouslySetInnerHTML={{ __html: parseMd(content) }} />
    </div>
  )
}
