import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface IListSchema<T extends unknown = unknown> extends IBaseSchema {
  type: SchemaType.List
  childSchema: Schema
  _: T
}

export type ResolveList<S extends IListSchema> = S extends IListSchema<infer T>
  ? T[]
  : never

export type ListDecorator<S extends IListSchema> = <
  T extends ResolveList<S> extends T[Key]
    ? (T[Key] extends ResolveList<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function List<S extends SchemaLike>(
  childSchema: S,
): IListSchema<Resolve<S>> {
  return {
    type: SchemaType.List,
    childSchema: resolveSchema(childSchema),
    get _(): any {
      return undefined
    },
  } as IListSchema<Resolve<S>>
}
