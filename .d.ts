declare module "*.svg" {
  const content: any;
  export default content;
}

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare const isProduction: boolean

// type Readonly<T> = {
//   readonly [P in keyof T]: T[P];
// }
// type Partial<T> = {
//   [P in keyof T]?: T[P];
// }
