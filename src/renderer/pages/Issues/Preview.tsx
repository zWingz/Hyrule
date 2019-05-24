import React from 'react'
import { parseMd } from 'src/renderer/utils/markdown'
import './markdown.less'
type Prop = {
  content: string
}
export function Preview(p: Prop) {
  return (
    <div className='markdown-preview'>
      <div dangerouslySetInnerHTML={{ __html: parseMd(p.content) }} />
    </div>
  )
}
