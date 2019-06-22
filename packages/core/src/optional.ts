import { IBaseSchema, SchemaType } from './common'
import { Property } from './property'
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
): IOptionalSchema<Resolve<S>> &
  OptionalDecorator<IOptionalSchema<Resolve<S>>> {
  const schema: IOptionalSchema<Resolve<S>> = {
    type: SchemaType.Optional,
    childSchema: resolveSchema(childSchema),
    get _(): any {
      return undefined
    },
  }
  return Object.assign((target: any, key: any) => {
    Property(schema)(target, key)
  }, schema)
}
