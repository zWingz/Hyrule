import React from 'react'
import * as monaco from 'monaco-editor'
type Prop = {
  content: string
  onChange: (arg: string) => void
  onScroll: (line: number) => void
}
const LINE_HEIGHT = 18
export class Editor extends React.Component<Prop> {
  editor: monaco.editor.IStandaloneCodeEditor
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
        lineNumbers: 'off',
        roundedSelection: false,
        // scrollBeyondLastLine: false,
        theme: 'vs-dark'
      }
    )
    // this.editor.layout()
    this.editor.onDidChangeModelContent(e => {
      const value = this.editor.getValue()
      this.props.onChange(value)
    })
    this.editor.onDidScrollChange(e => {
      const { scrollHeight, scrollTop } = e
      let v = 0
      if (scrollHeight) {
        v = scrollTop / LINE_HEIGHT
      }
      this.props.onScroll(Math.round(v))
    })
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
