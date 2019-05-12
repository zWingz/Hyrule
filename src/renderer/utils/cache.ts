
/**
 * 缓存
 * 主要来存储访问过的tree, 避免重复获取数据
 *
 * @class Cache
 */
export class Cache<T> {
  _cache: {
    [k: string]: T
  } = {}
  set(key: string, data: T) {
    this._cache[key] = data
  }
  get(key: string) {
    const ret = this._cache[key]
    return ret
  }
  has(key: string) {
    return key in this._cache
  }
  clear() {
    this._cache = {}
  }
}
