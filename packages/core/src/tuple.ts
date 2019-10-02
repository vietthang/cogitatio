import { BaseSchema, SchemaType } from './common'
import { Resolve, Schema, SchemaLike, resolveSchema } from './schema'

export interface TupleSchema<
  Args extends [unknown, ...unknown[]] = [unknown, ...unknown[]]
> extends BaseSchema<Args> {
  readonly type: SchemaType.Tuple
  readonly childSchemas: Schema[]
}

export function Tuple<SS extends [SchemaLike, ...SchemaLike[]]>(
  ...childSchemas: SS
): TupleSchema<{ [key in keyof SS]: Resolve<SS[key]> }> {
  return {
    type: SchemaType.Tuple,
    childSchemas: childSchemas.map(resolveSchema),
  } as TupleSchema<{ [key in keyof SS]: Resolve<SS[key]> }>
}
