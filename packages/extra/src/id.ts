import { Constructor, IRefineSchema, Refine } from '@cogitatio/core'

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

export interface IdRefinement<T> {
  id: Constructor<T>
}

export const Id = cache(
  <T>(ctor: Constructor<T>): IRefineSchema<string, IdRefinement<T>> => {
    return Refine(String, { id: ctor })
  },
)

export type Id<T> = string & IdRefinement<T>
