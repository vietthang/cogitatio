import { Constructor } from './object'
import { Schema } from './schema'

const reflectMap = new WeakMap<Constructor, any>()

export function reflectClass(
  ctor: Constructor,
): { [key: string]: () => Schema } {
  return reflectMap.get(ctor)
}

export function decorateClass<
  T extends object = object,
  Key extends keyof T = keyof T
>(ctor: Constructor<T>, key: Key, schema: () => Schema) {
  reflectMap.set(ctor, {
    ...(reflectClass(ctor) || {}),
    [key]: schema,
  })
}
