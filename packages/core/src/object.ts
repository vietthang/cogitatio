import { BaseSchema, SchemaType } from './common'
import { SchemaLike } from './schema'

export type Constructor<T extends {} = {}> = new (...args: any[]) => T

export interface ObjectSchemaField {
  key: string
  externalKey: string
  schema: SchemaLike
}

export interface ObjectSchema<T extends {} = {}> extends BaseSchema<T> {
  type: SchemaType.Object
  ctor: Constructor<T>
  fields: ObjectSchemaField[]
}
