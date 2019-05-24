import React from 'react'
import * as monaco from 'monaco-editor'
type Prop = {
  content: string
  onChange: (arg: string) => void
}

export class Editor extends React.PureComponent<Prop> {
  editor: monaco.editor.IStandaloneCodeEditor
  componentDidMount() {
    const { content } = this.props
    this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
      value: content,
      language: 'markdown',
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      lineNumbers: 'off',
      roundedSelection: false,
      theme: 'vs-dark'
    })
    // this.editor.layout()
    this.editor.onDidChangeModelContent((e) => {
      const value = this.editor.getValue()
      console.log(value);
      this.props.onChange(value)
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
