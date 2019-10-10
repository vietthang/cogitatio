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

export function objectSerializer(o: object): string {
  const cached = objectIdMap.get(o)
  if (cached !== undefined) {
    return cached
  }
  const id = (nextId++).toString()
  objectIdMap.set(o, id)
  return id
}

export interface Left<T> {
  __either: 'Left'
  value: T
}

export interface Right<T> {
  __either: 'Right'
  value: T
}

export type Either<L, R> = Left<L> | Right<R>

export function left<L>(value: L): Left<L> {
  return { __either: 'Left', value }
}

export function right<R>(value: R): Right<R> {
  return { __either: 'Right', value }
}
