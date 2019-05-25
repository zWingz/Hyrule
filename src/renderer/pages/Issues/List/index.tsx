import React, { useContext, useState } from 'react'
import { GitIssue } from 'src/renderer/http/types'
import { Preview } from '../Preview'
import { IssuesContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { Icon } from 'antd'
import cls from 'classnames'
import { Link } from 'react-router-dom'

type Prop = RouteComponentProps

let _lastSelected: GitIssue = null

export function IssuesList(p: Prop) {
  const issues = useContext(IssuesContext)
  const [selected, setSelected] = useState<GitIssue>(() => {
    const first = issues[0]
    if (!_lastSelected) return first
    const filter = issues.filter(each => each.id === _lastSelected.id)[0]
    return filter || first
  })
  const onClick = issue => {
    _lastSelected = issue
    setSelected(issue)
  }
  return (
    <div className='issues-list-wrapper'>
      <div className='issues-list'>
        {issues.map(each => (
          <div
            key={each.id}
            className={cls('issues-item', {
              active: each.id === selected.id
            })}
            onClick={() => onClick(each)}>
            <div className='issues-item-title'>{each.title}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className='issues-preview'>
          <div className='issue-title flex align-center'>
            {selected.title}
            <Link className='ml10' to={`${p.match.url}/${selected.number}`}>
              <Icon type='form' />
            </Link>
          </div>
          <Preview content={selected.body} />
        </div>
      )}
    </div>
  )
}
