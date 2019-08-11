import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface INullableSchema<T extends unknown = unknown>
  extends IBaseSchema<T | null> {
  type: SchemaType.Nullable
  childSchema: Schema
}

export function Nullable<S extends SchemaLike>(
  childSchema: S,
): INullableSchema<Resolve<S>> {
  return {
    type: SchemaType.Nullable,
    childSchema: resolveSchema(childSchema),
  } as INullableSchema<Resolve<S>>
}
