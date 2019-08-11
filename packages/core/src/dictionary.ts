import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface Dictionary<T extends unknown> {
  [key: string]: T
}

export interface IDictionarySchema<T extends unknown = unknown>
  extends IBaseSchema<Dictionary<T>> {
  type: SchemaType.Dictionary
  childSchema: Schema
}

export function Dictionary<S extends SchemaLike>(
  childSchema: S,
): IDictionarySchema<Resolve<S>> {
  return {
    type: SchemaType.Dictionary,
    childSchema: resolveSchema(childSchema),
  } as IDictionarySchema<Resolve<S>>
}
