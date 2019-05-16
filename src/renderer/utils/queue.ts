export class Queue {
  private _queue: { fnc: Function; res: Function; rej: Function }[] = []
  private _doing = false
  private _do() {
    this._doing = true
    const item = this._queue.shift()
    console.log('do next', item);
    if (item) {
      const { fnc, res, rej} = item
      const result = fnc()
      if (result && result.then) {
        result.then(
          r => {
            this._do()
            res(r)
          },
          e => {
            this._do()
            rej(e)
          }
        )
      } else {
        res(result)
        this._do()
      }
    } else {
      this._doing = false
    }
  }
  constructor() {
    this._do = this._do.bind(this)
  }
  public exec(fnc: Function): Promise<any> {
    return new Promise((res, rej) => {
      this._queue.push({
        fnc,
        res,
        rej
      })
      if (this._doing) {
        return
      }
      this._do()
    })
  }
}
