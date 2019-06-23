import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface IOptionalSchema<T extends unknown = unknown>
  extends IBaseSchema {
  type: SchemaType.Optional
  childSchema: Schema
  _: T
}

export type ResolveOptional<
  S extends IOptionalSchema
> = S extends IOptionalSchema<infer T> ? T | undefined : never

export type OptionalDecorator<S extends IOptionalSchema> = <
  T extends ResolveOptional<S> extends T[Key]
    ? (T[Key] extends ResolveOptional<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function Optional<S extends SchemaLike>(
  childSchema: S,
): IOptionalSchema<Resolve<S>> {
  return {
    type: SchemaType.Optional,
    childSchema: resolveSchema(childSchema),
  } as IOptionalSchema<Resolve<S>>
}
