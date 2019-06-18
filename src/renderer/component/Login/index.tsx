import React from 'react'
import { Icon } from 'antd'
import './style.less'
type Prop = {
  requestLogin: () => void
}
export const Login = React.memo(function(p: Prop) {
  return (
    <div className='login-container'>
      <div className='login-github flex flex-column'>
        <div className='github-icon flex-center'>
          <Icon type='github' />
        </div>
        <button className='login-button' onClick={p.requestLogin}>
          Login in with github
        </button>
      </div>
    </div>
  )
})
