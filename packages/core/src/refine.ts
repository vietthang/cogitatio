import { internal } from '@cogitatio/errors'
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
  refineSchema: RefineSchema<I, O>
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
      const validation = decode(context, value)

      return either.getOrElse<ValidationError[], I>(errors => {
        throw internal({ extra: errors })
      })(validation)
    },
    {
      refineSchema: {
        type: SchemaType.Refinement,
        baseSchema: resolveSchema(baseSchema),
        encode,
        decode,
      } as RefineSchema<I, O>,
    },
  )
}

export function isRefineConstructor(
  fn: any,
): fn is RefineConstructor<any, any> {
  return fn.refineSchema !== undefined
}
