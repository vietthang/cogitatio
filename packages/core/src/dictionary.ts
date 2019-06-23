import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface Dictionary<T extends unknown> {
  [key: string]: T
}

export interface IDictionarySchema<T extends unknown = unknown>
  extends IBaseSchema {
  type: SchemaType.Dictionary
  childSchema: Schema
  _: T
}

export type ResolveDictionary<
  S extends IDictionarySchema
> = S extends IDictionarySchema<infer T> ? Dictionary<T> : never

export type DictionaryDecorator<S extends IDictionarySchema> = <
  T extends ResolveDictionary<S> extends T[Key]
    ? (T[Key] extends ResolveDictionary<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function Dictionary<S extends SchemaLike>(
  childSchema: S,
): IDictionarySchema<Resolve<S>> {
  return {
    type: SchemaType.Dictionary,
    childSchema: resolveSchema(childSchema),
  } as IDictionarySchema<Resolve<S>>
}
