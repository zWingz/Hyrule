import React, { PureComponent } from 'react'
import UserContext, { UserCtx } from '../../context/UserContext'
import http from '../../http';
import { GitRepo } from '../../http/types';

interface State {
  repos: GitRepo[]
}

export class Sidebar extends PureComponent<{}, State, UserCtx> {
  static contextType = UserContext
  state: State = {
    repos: []
  }
  async componentDidMount() {
    const repos = await http.getRepos()
    this.setState({
      repos
    })
  }

  render() {
    const { avatar, owner } = this.context

    return (
      <div className='sidebar'>
        <div className='user-info'>
          <img src={avatar} className='user-avatar' />
          <span className='user-name'>{owner}</span>
        </div>
        <div className='repo'>
          {['issues', 'images'].map(each => (
            <div className={`repo-group`} key={each}>
              <div className='repo-type'>{each}</div>
              <div className='repo-add'>添加</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
