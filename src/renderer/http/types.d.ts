type Methdos = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestParams {
  url?: string
  body?: any
  method?: Methdos
  params?: {
    [k: string]: string | number | boolean
  }
}

export interface CreateIssueParams {
  title: string
  body: string
  labels?: string[]
}

export interface GitIssue {
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

export interface GitRepo {
  name: string
  id: string
  private: boolean
  description: string
}

export interface GitTree {
  path: string
  sha: string
  type: string
}

export interface GitFile {
  name: string
  sha: string
  path: string
}

export interface GitBlob {
  content: string
  encoding: string
  sha: string
  size: number
}
export interface GitUser {
  owner: string
  avatar: string
}

export interface DeleteFileParams {
  path: string
  message: string
  sha: string
}

export interface CreateFileParams {
  path: string
  content: string
  message: string
}
