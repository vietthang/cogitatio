import { SchemaType } from './common'
import { Constructor, ObjectSchema, ObjectSchemaField } from './object'

const reflectMap = new WeakMap<Constructor, ObjectSchema<any>>()

export function reflectClass<T>(ctor: Constructor<T>): ObjectSchema<T> {
  const schema = reflectMap.get(ctor)
  if (!schema) {
    throw new Error('no metadata for class')
  }
  return schema
}

export function decorateProperty<T extends {} = {}>(
  ctor: Constructor<T>,
  field: ObjectSchemaField,
) {
  const objectSchema: ObjectSchema<any> = reflectMap.get(ctor) || {
    _: undefined as any,
    type: SchemaType.Object,
    ctor,
    fields: [],
  }
  reflectMap.set(ctor, {
    ...objectSchema,
    fields: objectSchema.fields.concat(field),
  })
}
