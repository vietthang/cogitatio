import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface INullableSchema<T extends unknown = unknown>
  extends IBaseSchema {
  type: SchemaType.Nullable
  childSchema: Schema
  _: T
}

export type ResolveNullable<
  S extends INullableSchema
> = S extends INullableSchema<infer T> ? T | null : never

export type NullableDecorator<S extends INullableSchema> = <
  T extends ResolveNullable<S> extends T[Key]
    ? (T[Key] extends ResolveNullable<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function Nullable<S extends SchemaLike>(
  childSchema: S,
): INullableSchema<Resolve<S>> {
  return {
    type: SchemaType.Nullable,
    childSchema: resolveSchema(childSchema),
  } as INullableSchema<Resolve<S>>
}
