import {
  Refine,
  RefineConstructor,
  resolveSchema,
  SchemaLike,
  success,
} from '@cogitatio/core'
import { Uint64 } from './integers'
import { memoized } from './utils'

export interface Id64<S extends SchemaLike> {
  readonly idValue: Uint64
  readonly schema: S
  toString(): string
}

class Id64Impl<S extends SchemaLike> implements Id64<S> {
  constructor(public readonly idValue: Uint64, public readonly schema: S) {}

  public toString() {
    return this.idValue.toString(10)
  }

  public toJSON() {
    return this.toString()
  }
}

export type Id64Constructor = <S extends SchemaLike>(
  schemaLike: S,
) => RefineConstructor<Id64<S>, Uint64>

export const Id64 = memoized(<S extends SchemaLike>(schema: S) => {
  return Refine<Id64<S>, typeof Uint64>(
    Uint64,
    (_, id) => id.idValue,
    (_, value) => {
      return success(new Id64Impl(value, schema))
    },
  )
}, resolveSchema) as Id64Constructor
