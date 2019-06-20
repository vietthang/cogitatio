import { Constructor } from './object'
import { SchemaLike } from './schema'

const reflectMap = new WeakMap<Constructor, any>()

export function reflectClass<T>(
  ctor: Constructor<T>,
): { [key in keyof T]: SchemaLike } | undefined {
  return reflectMap.get(ctor)
}

export function decorateClass<T, Key extends keyof T>(
  ctor: Constructor<T>,
  key: Key,
  schema: SchemaLike,
) {
  reflectMap.set(ctor, {
    ...(reflectClass(ctor) || {}),
    [key]: schema,
  })
}
