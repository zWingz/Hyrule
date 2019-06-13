import { createContext } from 'react'
import { GitIssue } from 'src/renderer/http/types'

export const IssuesContext = createContext<GitIssue[]>([])
const { Provider, Consumer } = IssuesContext
export { Provider, Consumer }

export const UploadRepoContext = createContext<string>('')
