import React, { PureComponent } from 'react'
import './style.less'
import { Sidebar } from './Sidebar'
import { Route, Switch } from 'react-router-dom'
import { ImagesPage } from '../Images';

export class Layout extends PureComponent {
  render() {
    return (
      <div className='main flex'>
        <Sidebar />
        <div className='main-container flex-grow'>
          <Switch>
            <Route path='/images/:repo' component={ImagesPage}/>
            <Route render={() => <div>Not Found</div>} />
          </Switch>
        </div>
      </div>
    )
  }
}
