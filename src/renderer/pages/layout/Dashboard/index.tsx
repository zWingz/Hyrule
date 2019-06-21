import React from 'react'
import Hyrule from '../../../assets/Hyrule.png'
import './style.less'
export function Dashboard(p) {
  return (
    <div className='flex-grow dashboard'>
      <img className='logo' src={Hyrule} alt='' />
      {/* <div className='page-title'>Please select a repo</div> */}
    </div>
  )
}
