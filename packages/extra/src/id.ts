import { Brand, Constructor } from '@anzenjs/core'

type Transformer<T, U> = (value: T) => U

function cache<T extends object, U>(
  transfomer: Transformer<T, U>,
): Transformer<T, U> {
  const resultCache = new WeakMap<T, U>()
  return (value: T): U => {
    if (resultCache.has(value)) {
      return resultCache.get(value)!
    }
    const result = transfomer(value)
    resultCache.set(value, result)
    return result
  }
}

export const idSymbol = Symbol()

export const Id = cache(<T>(ctor: Constructor<T>) => {
  return Brand(String, idSymbol, ctor)
})

export type Id<T> = string & { [idSymbol]: Constructor<T> }
