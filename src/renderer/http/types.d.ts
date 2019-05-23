type Methdos = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestParams {
  url?: string
  body?: any
  method?: Methdos
  params?: {
    [k: string]: string | number | boolean
  }
}

export type AbortToken = (abort: (msg?: string) => void) => void

export interface XhrRequestParams extends RequestParams {
  onProgress?: (pro: number) => void
  abortToken?: AbortToken
  getHeader?: boolean
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
  mode: string
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
  onProgress?: XhrRequestParams['onProgress']
}

/**
 * Name	Type	Description
path	string	The file referenced in the tree.
mode	string	The file mode; one of 100644 for file (blob), 100755 for executable (blob), 040000 for subdirectory (tree), 160000 for submodule (commit), or 120000 for a blob that specifies the path of a symlink.
type	string	Either blob, tree, or commit.
sha	string	The SHA1 checksum ID of the object in the tree. Also called tree.sha.

Note: Use either tree.sha or content to specify the contents of the entry. Using both tree.sha and content will return an error.
content	string	The content you want this file to have. GitHub will write this blob out and use that SHA for this entry. Use either this, or tree.sha.

Note: Use either tree.sha or content to specify the contents of the entry. Using both tree.sha and content will return an error.
 */
export namespace CreateTreeParams {
  type Tree = {
    path: string
    type: 'blob' | 'tree'
    sha?: string
    content?: string
  }[]
  type Return = {
    sha: string
    tree: {
      path: string
      mode: string
      type: 'blob' | 'tree'
      size: 132
      sha: '7c258a9869f33c1e1e1f74fbb32f07c86cb5a75b'
    }[]
  }
}

export type GetIssuesParams = {
  page?: number
  pageSize?: number
}
