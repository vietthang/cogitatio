import { IBaseSchema, SchemaType } from './common'
import { Property } from './property'
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
): IListSchema<Resolve<S>> & ListDecorator<IListSchema<Resolve<S>>> {
  const schema: IListSchema<Resolve<S>> = {
    type: SchemaType.List,
    childSchema: resolveSchema(childSchema),
    get _(): any {
      throw new Error('')
    },
  }
  return Object.assign((target: any, key: any) => {
    Property(schema)(target, key)
  }, schema)
}
