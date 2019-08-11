import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface IListSchema<T extends unknown = unknown>
  extends IBaseSchema<T[]> {
  type: SchemaType.List
  childSchema: Schema
}

export function List<S extends SchemaLike>(
  childSchema: S,
): IListSchema<Resolve<S>> {
  return {
    type: SchemaType.List,
    childSchema: resolveSchema(childSchema),
  } as IListSchema<Resolve<S>>
}
