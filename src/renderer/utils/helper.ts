import dayjs from 'dayjs'
export function getNow () {
  return dayjs().format('YYYY-MM-DD hh:mm:ss')
}

export function pick<T = PlainObj>(obj: T, keys: Array<keyof T>) {
  const ret = {} as any
  keys.forEach(each => {
    ret[each] = obj[each]
  })
  return ret as { [k in keyof T]: T[k] }
}

export function pickArray<T = PlainObj>(array: T[], keys: Array<keyof T>) {
  return array.map(each => pick(each, keys))
}
