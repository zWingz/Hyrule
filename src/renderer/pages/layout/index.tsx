import React, { PureComponent } from 'react'
import './style.less'
import { Sidebar } from './Sidebar'
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom'
import { ImagesPage } from '../Images'
import { IssuesPage } from '../Issues'
export class LayoutComponent extends PureComponent<RouteComponentProps> {
  render() {
    return (
      <div className='main flex'>
        <Sidebar />
        <div className='route-container flex-grow'>
          <Switch>
            <Route path='/images/:repo' component={ImagesPage}/>
            <Route path='/issues/:repo' component={IssuesPage}/>
            <Route render={() => <div>Not Found</div>} />
          </Switch>
        </div>
      </div>
    )
  }
}

export const Layout = withRouter(LayoutComponent)
