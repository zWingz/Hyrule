declare module '*.svg' {
  const content: any
  export default content
}
declare module '*.png' {
  const content: any
  export default content
}

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

declare const isProduction: boolean

declare type PlainObj = {
  [k: string]: any
}

declare module '*.json' {
  const content: any
  export default content
}
