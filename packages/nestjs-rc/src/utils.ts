import { Type } from '@nestjs/common'

let currentId = 0
const objectIdMap = new WeakMap<object, string>()

export function nextId(): string {
  return (currentId++).toString()
}

export function objectSerializer(o: object): string {
  const cached = objectIdMap.get(o)

  if (cached !== undefined) {
    return cached
  }
  const id = nextId()

  objectIdMap.set(o, id)

  return id
}

export function namedClass(base: Type<any>, name: string): Type<unknown> {
  const m = {
    [name]: class extends base {},
  }
  return m[name]
}

export function generateNamedClass(
  base: Type<any>,
  prefix: string = '',
): Type<unknown> {
  return namedClass(base, `${prefix}${nextId()}`)
}
