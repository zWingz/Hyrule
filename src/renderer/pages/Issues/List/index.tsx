import React, { useContext, useState, useLayoutEffect, useCallback } from 'react'
import { GitIssue } from 'src/renderer/http/types'
import { Preview } from '../Preview'
import { IssuesContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { Icon, Button, Empty, message, Popconfirm } from 'antd'
import cls from 'classnames'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { IssuesKit } from 'src/renderer/utils/issuesKit'
type Prop = RouteComponentProps & {
  onUpdate: () => void
}

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
  const onCloseIssue = async issue => {
    await IssuesKit.closeIssue(issue)
    message.success('Succeed to close issue')
    clear()
    p.onUpdate()
  }
  const clear = useCallback(() => {
    _lastSelected = null
    setSelected(null)
  }, [])
  useLayoutEffect(() => {
    clear()
  }, [issues])
  return (
    <div className='issues-list-wrapper'>
      <div className='issues-list'>
        <div className='issues-item create'>
          <Link
            to={`${p.match.url}/create`}
            className='issues-item-title flex align-center'>
            Create New
            <Icon type='plus-circle' style={{ marginLeft: 'auto' }} />
          </Link>
        </div>
        {!!issues.length ? (
          issues.map(each => (
            <div
              key={each.id}
              className={cls('issues-item flex align-center', {
                active: each.id === mid.id
              })}
              onClick={() => onClick(each)}>
              <div className='flex-grow'>
                <time className='issues-item-time'>
                  {dayjs(each.created_at).format('YYYY-MM-DD hh:mm')}
                </time>
                <div className='issues-item-title'>{each.title}</div>
              </div>
              <Popconfirm
                className='issues-item-close'
                title='Are you sure close this issue?'
                onConfirm={() => onCloseIssue(each)}
                okText='Yes'
                cancelText='No'>
                <Icon type='close-circle' />
              </Popconfirm>
            </div>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
      {mid && (
        <div className='issue-preview'>
          <div className='issue-preview-title flex align-center'>
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
