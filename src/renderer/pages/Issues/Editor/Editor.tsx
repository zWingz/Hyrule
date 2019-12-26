import React from 'react'
import * as monaco from 'monaco-editor'
import { debounce, readAsBase64 } from 'src/renderer/utils/helper'
import { ImageKit } from 'src/renderer/utils/imageKit'
import { message } from 'antd'
type Prop = {
  content: string
  onChange: (arg: string) => void
  onScroll: (line: number) => void
  uploadRepo: string
  getEditor: (ins: monaco.editor.IStandaloneCodeEditor) => void
  onSave: () => void
  onUpload: () => void
}
const LINE_HEIGHT = 18
const IMG_REGEXP = /(png|jpg|jpeg|gif)/i
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

  /**
   * window paste listeners
   * used to upload img to repo
   *
   * @memberof Editor
   */
  onPaste = (e: ClipboardEvent) => {
    const { editor } = this
    if (editor.hasTextFocus()) {
      const startSelection = editor.getSelection()
      let { files } = e.clipboardData
      const { length } = files
      const file = files[length - 1]
      if(!file) return
      if(!this.props.uploadRepo) {
        message.error('Please select a repo to upload!')
        return
      }
      const createRange = (end: monaco.Selection) => new monaco.Range(
        startSelection.startLineNumber,
        startSelection.startColumn,
        end.endLineNumber,
        end.endColumn
      )
      // use setTimeout to get endSelection
      setTimeout(async () => {
        let endSelection = editor.getSelection()
        if (IMG_REGEXP.test(file.type)) {
          let range = createRange(endSelection)
          // generate fileName
          const fileName = `${Date.now()}.${file.type.split('/').pop()}`
          // copy img url to editor
          editor.executeEdits(
            '',
            [
              {
                range,
                text: `![](Uploading...)`
              }
            ]
          )
          // get new range
          range = createRange(editor.getSelection())
          // reset position
          // this.editor.setPosition({lineNumber: range.endLineNumber, column: range.endColumn})
          // set the upload repo
          ImageKit.setRepo(this.props.uploadRepo)
          // read base64
          let base64 = await readAsBase64(file)
          // upload img
          const { sha, url } = await ImageKit.uploadImage(
            '',
            {
              base64,
              filename: fileName
              // filename: file.name
            }
          )
          // copy img url to editor
          editor.executeEdits(
            '',
            [
              {
                range,
                text: `![](${url})`
              }
            ]
          )
          editor.setPosition(editor.getPosition())
          this.props.onUpload()
        }
      })
    }
  }
  initEditor() {
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
        wordWrap: 'bounded',
        lineNumbers: 'off',
        roundedSelection: false,
        // scrollBeyondLastLine: false,
        theme: 'vs-dark',
      }
    )
    // this.editor.layout()
    const KM = monaco.KeyMod
    const KC = monaco.KeyCode
    // tslint:disable-next-line
    this.editor.addCommand(KM.CtrlCmd | KC.KEY_S, this.props.onSave)
    this.editor.onDidChangeModelContent(this.onChange)
    this.editor.onDidScrollChange(this.onScroll)
    this.props.getEditor(this.editor)
  }
  componentDidMount() {
    this._isMounted = true
    this.initEditor()
    window.addEventListener('paste', this.onPaste, true)
  }
  componentWillUnmount() {
    this._isMounted = false
    window.removeEventListener('paste', this.onPaste)
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
