import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface ITupleSchema<
  Args extends [unknown, ...unknown[]] = [unknown, ...unknown[]]
> extends IBaseSchema {
  type: SchemaType.Tuple
  childSchemas: Schema[]
  _: Args
}

export type ResolveTuple<
  S extends ITupleSchema<[unknown, ...unknown[]]>
> = S extends ITupleSchema<infer Args> ? Args : never

export type TupleDecorator<S extends ITupleSchema> = <
  T extends ResolveTuple<S> extends T[Key]
    ? (T[Key] extends ResolveTuple<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function Tuple<SS extends [SchemaLike, ...SchemaLike[]]>(
  ...childSchemas: SS
): ITupleSchema<{ [key in keyof SS]: Resolve<SS[key]> }> {
  return {
    type: SchemaType.Tuple,
    childSchemas: childSchemas.map(resolveSchema),
  } as ITupleSchema<{ [key in keyof SS]: Resolve<SS[key]> }>
}
