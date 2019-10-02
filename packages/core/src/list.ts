import { BaseSchema, SchemaType } from './common'
import { Resolve, Schema, SchemaLike, resolveSchema } from './schema'

export interface ListSchema<T extends unknown = unknown>
  extends BaseSchema<T[]> {
  type: SchemaType.List
  childSchema: Schema
}

export function List<S extends SchemaLike>(
  childSchema: S,
): ListSchema<Resolve<S>> {
  return {
    type: SchemaType.List,
    childSchema: resolveSchema(childSchema),
  } as ListSchema<Resolve<S>>
}
