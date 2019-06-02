import React, { PureComponent } from 'react'
import UserContext, { UserCtx } from '../../../context/UserContext'
import { DefaultHttpIns } from '../../../http'
import { GitRepo } from '../../../http/types'
import './style.less'
import { Icon } from 'antd'
import { RepoSelectModal } from './RepoSelectModal'
import { getCacheRepos, setCacheRepos } from '../../../utils/store'
import { NavLink } from 'react-router-dom'
import { openModal } from 'src/renderer/utils/helper'

const TYPE_IMG = 'images'
const TYPE_ISSUES = 'issues'

interface State {
  repos: GitRepo[]
  issues: GitRepo[]
  images: GitRepo[]
  visible: boolean
}

export class Sidebar extends PureComponent<{}, State, UserCtx> {
  static contextType = UserContext
  state: State = {
    repos: getCacheRepos('all'),
    issues: getCacheRepos('issues'),
    images: getCacheRepos('images'),
    visible: false
  }
  async componentDidMount() {
    const repos = await DefaultHttpIns.getRepos()
    setCacheRepos('all', repos)
    this.setState({
      repos
    })
  }
  openSelectRepo = type => {
    const { repos, images, issues } = this.state
    const isImg = type === TYPE_IMG
    openModal(RepoSelectModal, {
      onConfirm: this.onSelectedRepos.bind(this, type),
      repos,
      value: isImg ? images : issues,
      disabled: !isImg ? images : issues
    })
  }
  // closeModal = () => {
  //   this.setState({
  //     visible: false
  //   })
  // }
  onSelectedRepos = (type, value) => {
    setCacheRepos(type, value)
    this.setState({
      [type]: value,
      visible: false
    } as State)
  }
  render() {
    const { avatar, owner } = this.context
    // const { visible, repos, selectType, issues, images } = this.state
    return (
      <div className='sidebar'>
        <div className='user-info'>
          <img src={avatar} className='user-avatar' />
          <span className='user-name'>{owner}</span>
        </div>
        <div className='repo'>
          {['images', 'issues'].map(each => (
            <div className={`repo-group`} key={each}>
              <div className='repo-type'>{each}</div>
              <ul className='repo-list'>
                {this.state[each].map((repo: GitRepo) => (
                  <li className='repo-list-item' key={repo.id}>
                    <NavLink
                      to={{
                        pathname: `/${each}/${repo.name}`,
                        search: repo.private ? 'private' : ''
                      }}
                      activeClassName='nav-active'>
                      {repo.name}
                    </NavLink>
                  </li>
                ))}
                <li
                  className='repo-add'
                  onClick={() => this.openSelectRepo(each)}>
                  Edit
                </li>
              </ul>
            </div>
          ))}
        </div>
        {/* <RepoSelectModal
          visible={visible}
          onConfirm={this.onSelectedRepos}
          repos={repos}
          onCancel={this.closeModal}
          value={selectType === TYPE_IMG ? images : issues}
          disabled={selectType !== TYPE_IMG ? images : issues}
        /> */}
      </div>
    )
  }
}
