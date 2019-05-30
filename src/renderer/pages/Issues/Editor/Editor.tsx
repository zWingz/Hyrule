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
    if(!this._isMounted) return
    const { scrollHeight, scrollTop } = e
    let v = 0
    if (scrollHeight) {
      v = scrollTop / LINE_HEIGHT
    }
    this.props.onScroll(Math.round(v))
  }, 0)
  onChange = debounce((e) => {
    if(!this._isMounted) return
    const value = this.editor.getValue()
      this.props.onChange(value)
  }, 0)
  _isMounted = false
  componentDidMount() {
    this._isMounted = true
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
      window.addEventListener('paste', (e: ClipboardEvent) => {
        console.log('paste');
        if (this.editor.hasTextFocus()) {
          let selection = this.editor.getSelection()
          let items = e.clipboardData.items
          for (let i = 0; i < items.length; i++) {
            let matches = items[i].type.match(/^image\/(png|jpg|jpeg|gif)$/i)
            if (matches) {
              var blob = items[i].getAsFile()
              console.log(blob);
              // this.editor.executeEdits("", [
              //   {
              //     range: new monaco.Range(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn),
              //     text: `![图片](///12312)`
              //   }
              // ])
              // let {endLineNumber, endColumn} = this.editor.getSelection()
              // this.editor.setPosition({lineNumber: endLineNumber, column: endColumn})
            }
          }
        }
      })
  }
  componentWillUnmount() {
    this._isMounted = false
    setTimeout(() => {
      this.editor.dispose()
    }, 0)
  }
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return false
  }
  render() {
    return (
      <div id='monaco-editor' className='markdown-editor monaco-editor' />
    )
  }
}
