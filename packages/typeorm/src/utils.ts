export function groupBy<T>(values: T[], grouper: (value: T) => string): T[][] {
  const m = new Map<string, T[]>()
  for (const value of values) {
    const key = grouper(value)
    const mappedValues = m.get(key) || []
    m.set(key, [...mappedValues, value])
  }
  return Array.from(m.values())
}

let nextId = 0
const objectIdMap = new WeakMap<object, string>()

export function objectId(o: object): string {
  const cached = objectIdMap.get(o)
  if (cached !== undefined) {
    return cached
  }
  const id = (nextId++).toString()
  objectIdMap.set(o, id)
  return id
}

export type Transformer<Ins extends any[], Out> = (...input: Ins) => Out

export function memoized<Ins extends any[], Out>(
  transformer: Transformer<Ins, Out>,
  cacheKeyFn?: Transformer<Ins, object>,
): Transformer<Ins, Out> {
  const cache = new WeakMap<object, Out>()

  return (...ins: Ins) => {
    if (!cacheKeyFn) {
      // no cache key provided, just return new value each time
      return transformer(...ins)
    }
    const key = cacheKeyFn(...ins)
    const cachedOut = cache.get(key)
    if (cachedOut !== undefined) {
      return cachedOut
    }
    const out = transformer(...ins)
    cache.set(key, out)
    return out
  }
}
