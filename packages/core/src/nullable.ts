import { BaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface NullableSchema<T extends unknown = unknown>
  extends BaseSchema<T | null> {
  type: SchemaType.Nullable
  childSchema: Schema
}

export function Nullable<S extends SchemaLike>(
  childSchema: S,
): NullableSchema<Resolve<S>> {
  return {
    type: SchemaType.Nullable,
    childSchema: resolveSchema(childSchema),
  } as NullableSchema<Resolve<S>>
}
