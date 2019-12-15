import { Type } from '@nestjs/common'

let currentId = 0

export function nextId(): string {
  return (currentId++).toString()
}

export function namedClass<C extends Type<{}>>(base: C, name: string): C {
  const m = {
    [name]: class extends base {},
  }
  return m[name]
}

export function generateNamedClass<C extends Type<{}>>(
  base: C,
  prefix: string = '',
): C {
  return namedClass(base, `${prefix}${nextId()}`)
}
