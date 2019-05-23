import React from 'react'
import * as monaco from 'monaco-editor'

export class Editor extends React.PureComponent {
  componentDidMount() {
    monaco.editor.create(document.getElementById('monaco-editor'), {
      value: '## Hello world',
      language: 'markdown',
      minimap: {
        enabled: false
      },
      lineNumbers: 'off',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      theme: 'vs-dark'
    })
  }
  render() {
    return <div id='monaco-editor' className='monaco-editor' />
  }
}
