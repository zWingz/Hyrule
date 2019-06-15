import { createContext } from 'react'

export interface UserCtx {
  avatar: string
  owner: string,
  logout: () => void
}

const Ctx = createContext<UserCtx>({
  avatar: '',
  owner: '',
  logout: null
})
const { Provider, Consumer } = Ctx
export default Ctx
export { Provider, Consumer }
