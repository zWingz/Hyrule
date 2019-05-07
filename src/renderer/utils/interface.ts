export interface RestConfig {
  repo: string,
  branch?: string,
  token: string,
}


export interface Config extends RestConfig {
  customUrl?: string
  isPrivate?: boolean
}

export type ImgType = {
  name: string;
  url?: string;
  sha: string
}
