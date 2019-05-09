import React, { PureComponent } from 'react'
import UserContext, { UserCtx } from '../../../context/UserContext'
import http from '../../../http'
import { GitRepo } from '../../../http/types'
import './style.less'
import { Icon } from 'antd'
import { RepoSelectModal } from './RepoSelectModal'
import { getCacheRepos, store, setCacheRepos } from '../../../utils/store'
import { NavLink } from 'react-router-dom';

const TYPE_IMG = 'images'
const TYPE_ISSUES = 'issues'

interface State {
  repos: GitRepo[]
  issues: GitRepo[]
  images: GitRepo[]
  visible: boolean
  selectType: typeof TYPE_IMG | typeof TYPE_ISSUES
}

export class Sidebar extends PureComponent<{}, State, UserCtx> {
  static contextType = UserContext
  state: State = {
    repos: getCacheRepos('all'),
    issues: getCacheRepos('issues'),
    images: getCacheRepos('images'),
    visible: false,
    selectType: TYPE_ISSUES
  }
  async componentDidMount() {
    const repos = await http.getRepos()
    setCacheRepos('all', repos)
    this.setState({
      repos
    })
  }
  openSelectRepo = type => {
    this.setState({
      visible: true,
      selectType: type
    })
  }
  closeModal = () => {
    this.setState({
      visible: false
    })
  }
  onSelectedRepos = value => {
    const { selectType } = this.state
    setCacheRepos(selectType, value)
    this.setState({
      [selectType]: value,
      visible: false
    } as State)
  }
  render() {
    const { avatar, owner } = this.context
    const { visible, repos, selectType, issues, images } = this.state
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
              <ul className='repo-list'>
                {this.state[each].map((repo: GitRepo) => (
                  <li className='repo-list-item' key={repo.id}>
                    <NavLink to={`/images/${repo.name}`} activeClassName='nav-active'>
                      {repo.name}
                    </NavLink>
                  </li>
                ))}
                <li
                  className='repo-add'
                  onClick={() => this.openSelectRepo(each)}>
                  添加
                </li>
              </ul>
            </div>
          ))}
        </div>
        <RepoSelectModal
          visible={visible}
          onConfirm={this.onSelectedRepos}
          repos={repos}
          onCancel={this.closeModal}
          value={selectType === TYPE_IMG ? images : issues}
          disabled={selectType !== TYPE_IMG ? images : issues}
        />
      </div>
    )
  }
}
