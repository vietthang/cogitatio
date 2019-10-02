import { BaseSchema, SchemaType } from './common'
import { Resolve, Schema, SchemaLike, resolveSchema } from './schema'

export interface RefineSchema<
  T extends unknown = unknown,
  B extends unknown = unknown
> extends BaseSchema<T & B> {
  readonly type: SchemaType.Brand
  readonly childSchema: Schema
  readonly brand: B
}

export function Refine<S extends SchemaLike, B extends unknown = unknown>(
  childSchema: S,
  brand: B,
): RefineSchema<Resolve<S>, B> {
  return {
    type: SchemaType.Brand,
    childSchema: resolveSchema(childSchema),
    brand,
  } as RefineSchema<Resolve<S>, B>
}
