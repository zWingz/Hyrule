import React, { useContext, useState, useLayoutEffect } from 'react'
import { GitIssue } from 'src/renderer/http/types'
import { Preview } from '../Preview'
import { IssuesContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { Icon, Button, Empty } from 'antd'
import cls from 'classnames'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
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
  const mid = selected || issues[0]

  const onClick = issue => {
    _lastSelected = issue
    setSelected(issue)
  }
  useLayoutEffect(() => {
    _lastSelected = null
    setSelected(null)
  }, [issues])
  return (
    <div className='issues-list-wrapper'>
      <div className='issues-list'>
        <div className='issues-item create'>
          <Link to={`${p.match.url}/create`} className='issues-item-title flex align-center'>
            新增文章
            <Icon type='plus-circle' style={{ marginLeft: 'auto' }} />
          </Link>
        </div>
        {!!issues.length ? issues.map(each => (
          <div
            key={each.id}
            className={cls('issues-item', {
              active: each.id === mid.id
            })}
            onClick={() => onClick(each)}>
            <time className='issues-item-time'>
              {dayjs(each.created_at).format('YYYY-MM-DD hh:mm')}
            </time>
            <div className='issues-item-title'>{each.title}</div>
          </div>
        )) : <Empty  image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
      </div>
      {mid && (
        <div className='issues-preview'>
          <div className='issue-title flex align-center'>
            {mid.title}
            <Link className='ml10' to={`${p.match.url}/${mid.number}`}>
              <Icon type='form' />
            </Link>
          </div>
          <Preview content={mid.body} />
        </div>
      )}
    </div>
  )
}
