import React from 'react'
import * as monaco from 'monaco-editor'
import { debounce } from 'src/renderer/utils/helper'
type Prop = {
  content: string
  onChange: (arg: string) => void
  onScroll: (line: number) => void
  getEditor: (ins: monaco.editor.IStandaloneCodeEditor) => void
}
const LINE_HEIGHT = 18
export class Editor extends React.Component<Prop> {
  editor: monaco.editor.IStandaloneCodeEditor
  onScroll = debounce(e => {
    const { scrollHeight, scrollTop } = e
    let v = 0
    if (scrollHeight) {
      v = scrollTop / LINE_HEIGHT
    }
    this.props.onScroll(Math.round(v))
  }, 0)
  onChange = debounce((e) => {
    const value = this.editor.getValue()
      this.props.onChange(value)
  }, 0)
  componentDidMount() {
    const { content } = this.props
    this.editor = monaco.editor.create(
      document.getElementById('monaco-editor'),
      {
        value: content,
        language: 'markdown',
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        wordWrap: 'wordWrapColumn',
        lineNumbers: 'off',
        roundedSelection: false,
        // scrollBeyondLastLine: false,
        theme: 'vs-dark'
      }
    )
    // this.editor.layout()
    this.editor.onDidChangeModelContent(this.onChange)
    this.editor.onDidScrollChange(this.onScroll)
    this.props.getEditor(this.editor)
  }
  componentWillUnmount() {
    this.editor.dispose()
  }
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return false
  }
  render() {
    return (
      <div className='markdown-editor'>
        <div id='monaco-editor' className='monaco-editor' />
      </div>
    )
  }
}
