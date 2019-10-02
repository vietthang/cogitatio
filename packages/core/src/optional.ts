import { BaseSchema, SchemaType } from './common'
import { Resolve, Schema, SchemaLike, resolveSchema } from './schema'

export interface OptionalSchema<T extends unknown = unknown>
  extends BaseSchema<T | undefined> {
  type: SchemaType.Optional
  childSchema: Schema
}

export function Optional<S extends SchemaLike>(
  childSchema: S,
): OptionalSchema<Resolve<S>> {
  return {
    type: SchemaType.Optional,
    childSchema: resolveSchema(childSchema),
  } as OptionalSchema<Resolve<S>>
}
