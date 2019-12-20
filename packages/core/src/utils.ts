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
