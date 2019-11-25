import { BaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface RefineSchema<
  T extends unknown = unknown,
  B extends unknown = unknown
> extends BaseSchema<T & B> {
  readonly type: SchemaType.Refinement
  readonly childSchema: Schema
  readonly refineFunction: (value: T) => T
}

export interface RefineConstructor<T = any, B = any> {
  (value: T): T & B
  refineSchema: RefineSchema<T, B>
}

export function Refine<B extends unknown>() {
  return <S extends SchemaLike>(
    childSchema: S,
    refineFunction: (value: Resolve<S>) => Resolve<S>,
  ): RefineConstructor<Resolve<S>, B> => {
    return Object.assign(
      (value: Resolve<S>) => {
        return value
      },
      {
        refineSchema: {
          type: SchemaType.Refinement,
          childSchema: resolveSchema(childSchema),
          refineFunction,
        } as RefineSchema<Resolve<S>, B>,
      },
    )
  }
}
