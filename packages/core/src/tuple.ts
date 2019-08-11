import { IBaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface ITupleSchema<
  Args extends [unknown, ...unknown[]] = [unknown, ...unknown[]]
> extends IBaseSchema<Args> {
  readonly type: SchemaType.Tuple
  readonly childSchemas: Schema[]
}

export function Tuple<SS extends [SchemaLike, ...SchemaLike[]]>(
  ...childSchemas: SS
): ITupleSchema<{ [key in keyof SS]: Resolve<SS[key]> }> {
  return {
    type: SchemaType.Tuple,
    childSchemas: childSchemas.map(resolveSchema),
  } as ITupleSchema<{ [key in keyof SS]: Resolve<SS[key]> }>
}
