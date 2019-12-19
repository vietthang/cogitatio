import { SchemaType } from './common'
import { Constructor, ObjectSchema } from './object'
import { Schema } from './schema'

const reflectMap = new WeakMap<Constructor, ObjectSchema<any>>()

export function reflectClass<T>(ctor: Constructor<T>): ObjectSchema<T> {
  const schema = reflectMap.get(ctor)
  if (!schema) {
    throw new Error('no metadata for class')
  }
  return schema
}

export function decorateProperty<
  T extends {} = {},
  Key extends keyof T = keyof T
>(ctor: Constructor<T>, key: Key, resolveSchema: () => Schema) {
  const schema =
    reflectMap.get(ctor) ||
    ({ type: SchemaType.Object, fields: {} } as ObjectSchema<any>)
  reflectMap.set(ctor, {
    ...schema,
    fields: {
      ...schema.fields,
      [key]: resolveSchema,
    } as any,
  })
}

export function decorateClass<T>(ctor: Constructor, schema: ObjectSchema<T>) {
  reflectMap.set(ctor, schema)
}
