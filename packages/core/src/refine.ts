import { either } from 'fp-ts'
import { Context, Validation, ValidationError } from './codec'
import { BaseSchema, SchemaType } from './common'
import { ContextImpl } from './json/context-impl'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface RefineSchema<I = any, O = any> extends BaseSchema<I> {
  readonly type: SchemaType.Refinement
  readonly baseSchema: Schema
  encode: (context: Context, value: I) => O
  decode: (context: Context, value: O) => Validation<I>
}

export interface RefineConstructor<I = any, O = any> {
  (value: O): I
  schema: RefineSchema<I, O>
}

export function Refine<I, S extends SchemaLike>(
  baseSchema: S,
  encode: (context: Context, value: I) => Resolve<S>,
  decode: (context: Context, value: Resolve<S>) => Validation<I>,
): RefineConstructor<I, Resolve<S>> {
  type O = Resolve<S>

  return Object.assign(
    (value: O) => {
      const context = new ContextImpl()
      return either.getOrElse<ValidationError[], I>(e => {
        throw e
      })(decode(context, value))
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
