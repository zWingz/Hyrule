type Methdos = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestParams {
  url?: string
    body?: any
    method?: Methdos
}

interface CreateIssueParams {
  title: string
  body: string
  labels?: string[]
}

interface GitIssue {
  id: number
  number: number
  html_url: string
  title: string
  body: string
  labels: {
    id: number
    name: string
    description: string
    color: string
  }[]
  created_at: string
  updated_at: string
}

interface GitRepo {
  name: string
  id: string
  description: string
}

interface GitTree {
  path: string
  sha: string
  type: string
}

interface GitFile {
  name: string
  sha: string
  path: string
}

interface GitBlob {
  content: string
  encoding: string
  sha: string
  size: number
}
interface GitUser {
  username: string
  avatar: string
}

interface DeleteFileParams {
  path: string
    message: string
    sha: string
}

interface CreateFileParams {
  path: string
    content: string
    message: string
}
