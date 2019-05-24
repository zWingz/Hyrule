import React, { useContext, useState } from 'react'
import { GitIssue } from 'src/renderer/http/types'
import { Preview } from '../Preview'
import { IssuesContext } from '../Context'
import { RouteComponentProps } from 'react-router'
import { Icon } from 'antd'
import cls from 'classnames'
import { Link } from 'react-router-dom'

type Prop = RouteComponentProps

export function IssuesList(p: Prop) {
  const issues = useContext(IssuesContext)
  const [selected, setSelected] = useState<GitIssue>(null)
  return (
    <div className='issues-list-wrapper'>
      <div className='issues-list'>
        {issues.map(each => (
          <div
            key={each.id}
            className={cls('issues-item', {
              active: each === selected
            })}
            onClick={() => setSelected(each)}>
            <div className='issues-item-title'>{each.title}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className='issues-preview'>
          <div className='issue-title flex'>
            {selected.title}
            <Link to={`${p.match.url}/${selected.number}`} style={{marginLeft: 'auto'}}>
              <Icon type='form' />
            </Link>
          </div>
          <Preview content={selected.body} />
        </div>
      )}
    </div>
  )
}
