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
