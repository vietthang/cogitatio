import { BaseSchema, SchemaType } from './common'
import { Resolve, Schema, SchemaLike, resolveSchema } from './schema'

export interface Dictionary<T extends unknown> {
  [key: string]: T
}

export interface DictionarySchema<T extends unknown = unknown>
  extends BaseSchema<Dictionary<T>> {
  type: SchemaType.Dictionary
  childSchema: Schema
}

export function Dictionary<S extends SchemaLike>(
  childSchema: S,
): DictionarySchema<Resolve<S>> {
  return {
    type: SchemaType.Dictionary,
    childSchema: resolveSchema(childSchema),
  } as DictionarySchema<Resolve<S>>
}
