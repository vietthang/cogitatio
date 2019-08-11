import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface IRefineSchema<
  T extends unknown = unknown,
  B extends unknown = unknown
> extends IBaseSchema<T & B> {
  readonly type: SchemaType.Brand
  readonly childSchema: Schema
  readonly brand: B
}

export function Refine<S extends SchemaLike, B extends unknown = unknown>(
  childSchema: S,
  brand: B,
): IRefineSchema<Resolve<S>, B> {
  return {
    type: SchemaType.Brand,
    childSchema: resolveSchema(childSchema),
    brand,
  } as IRefineSchema<Resolve<S>, B>
}
