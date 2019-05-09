import React, { PureComponent } from 'react'
import './style.less'
import { Sidebar } from './Sidebar'

export class Layout extends PureComponent {
  render() {
    return (
      <div className='main'>
        <Sidebar />
      </div>
    )
  }
}
