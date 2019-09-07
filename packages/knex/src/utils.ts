export type ArgsMapper<T extends any[], U> = (...args: T) => U

export type ParamsOf<T> = T extends (...args: infer P) => any ? P : never

const contextMap = new WeakMap<object, Map<string, any>>()

let nextId = 0
const objectIdMap = new WeakMap<object, string>()

export function objectSerializer(o: object): string {
  const cached = objectIdMap.get(o)
  if (cached !== undefined) {
    return cached
  }
  const id = (nextId++).toString()
  objectIdMap.set(o, id)
  return id
}

export function memoize<T>(
  fn: T,
  contextMapper: ArgsMapper<ParamsOf<T>, object> = () => global,
  keyMapper: ArgsMapper<ParamsOf<T>, string> = () => '',
): T {
  return (((...args: ParamsOf<T>): any => {
    const context = contextMapper(...args)
    let memoizeMap = contextMap.get(context)
    if (!memoizeMap) {
      memoizeMap = new Map()
      contextMap.set(context, memoizeMap)
    }

    const memoizeKey = keyMapper(...args)
    if (memoizeMap.has(memoizeKey)) {
      return memoizeMap.get(memoizeKey)
    }

    const value = (fn as any)(...args)
    memoizeMap.set(memoizeKey, value)
    return value
  }) as any) as T
}
