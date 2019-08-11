import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface IOptionalSchema<T extends unknown = unknown>
  extends IBaseSchema<T | undefined> {
  type: SchemaType.Optional
  childSchema: Schema
}

export function Optional<S extends SchemaLike>(
  childSchema: S,
): IOptionalSchema<Resolve<S>> {
  return {
    type: SchemaType.Optional,
    childSchema: resolveSchema(childSchema),
  } as IOptionalSchema<Resolve<S>>
}
