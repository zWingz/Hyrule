import { createContext } from 'react'

export interface UserCtx {
  avatar: string
  owner: string
}

const Ctx = createContext<UserCtx>({
  avatar: '',
  owner: ''
})
const { Provider, Consumer } = Ctx
export default Ctx
export { Provider, Consumer }
