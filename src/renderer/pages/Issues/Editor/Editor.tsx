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
const ImgReg = /(png|jpg|jpeg|gif)/i
export class Editor extends React.Component<Prop> {
  editor: monaco.editor.IStandaloneCodeEditor
  onScroll = debounce(e => {
    if (!this._isMounted) return
    const { scrollHeight, scrollTop } = e
    let v = 0
    if (scrollHeight) {
      v = scrollTop / LINE_HEIGHT
    }
    this.props.onScroll(Math.round(v))
  }, 0)
  onChange = debounce(e => {
    if (!this._isMounted) return
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
    window.addEventListener(
      'paste',
      (e: ClipboardEvent) => {
        if (this.editor.hasTextFocus()) {
          const startSelection = this.editor.getSelection()
          let { files } = e.clipboardData
          const { length } = files
          // use setTimeout to get endSelection
          setTimeout(() => {
            const endSelectrion = this.editor.getSelection()
            for (let i = 0; i < length; i++) {
              const file = files[i]
              if (ImgReg.test(file.type)) {
                // copy img url to editor
                this.editor.executeEdits(
                  '',
                  [
                    {
                      range: new monaco.Range(
                        startSelection.startLineNumber,
                        startSelection.startColumn,
                        endSelectrion.endLineNumber,
                        endSelectrion.endColumn
                      ),
                      text: `![](Uploading...)`
                    }
                  ],
                  [endSelectrion]
                )
                // let {endLineNumber, endColumn} = this.editor.getSelection()
                // this.editor.setPosition({lineNumber: endLineNumber, column: endColumn})
              }
            }
          })
        }
      },
      true
    )
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
    return <div id='monaco-editor' className='markdown-editor monaco-editor' />
  }
}
