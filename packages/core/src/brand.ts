import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface IBrandSchema<
  T extends unknown = unknown,
  B extends symbol = symbol,
  V extends unknown = unknown
> extends IBaseSchema {
  readonly type: SchemaType.Brand
  readonly childSchema: Schema
  readonly brand: B
  readonly value: V
  readonly _: T
}

export type ResolveBrand<S extends IBrandSchema> = S extends IBrandSchema<
  infer T,
  infer B,
  infer V
>
  ? T & { [key in B]: V }
  : never

export type BrandDecorator<S extends IBrandSchema> = <
  T extends ResolveBrand<S> extends T[Key]
    ? (T[Key] extends ResolveBrand<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function Brand<
  S extends SchemaLike,
  B extends symbol,
  V extends unknown = true
>(
  childSchema: S,
  brand: B,
  value: V = true as V,
): IBrandSchema<Resolve<S>, B, V> {
  return {
    type: SchemaType.Brand,
    childSchema: resolveSchema(childSchema),
    brand,
    value,
  } as IBrandSchema<Resolve<S>, B, V>
}
