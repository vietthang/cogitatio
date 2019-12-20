import { BaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface RefineSchema<I = any, O = any> extends BaseSchema<I> {
  readonly type: SchemaType.Refinement
  readonly baseSchema: Schema
  encode: (value: I) => O
  decode: (value: O) => I
}

export interface RefineConstructor<I = any, O = any> {
  (value: O): I
  schema: RefineSchema<I, O>
}

export function Refine<I, S extends SchemaLike>(
  baseSchema: S,
  encode: (value: I) => Resolve<S>,
  decode: (value: Resolve<S>) => I,
): RefineConstructor<I, Resolve<S>> {
  type O = Resolve<S>

  return Object.assign(
    (value: O) => {
      return decode(value)
    },
    {
      schema: {
        type: SchemaType.Refinement,
        baseSchema: resolveSchema(baseSchema),
        encode,
        decode,
      } as RefineSchema<I, O>,
    },
  )
}
