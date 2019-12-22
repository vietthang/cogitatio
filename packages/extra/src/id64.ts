import {
  Refine,
  RefineConstructor,
  resolveSchema,
  SchemaLike,
  success,
} from '@cogitatio/core'
import { memoized } from './utils'

export interface Id64<S extends SchemaLike> {
  readonly idValue: bigint
  readonly schema: S
  toString(): string
}

class Id64Impl<S extends SchemaLike> implements Id64<S> {
  constructor(public readonly idValue: bigint, public readonly schema: S) {}

  public toString() {
    return this.idValue.toString(10)
  }

  public toJSON() {
    return this.toString()
  }
}

const MAX_INTEGER_64 = BigInt(2) ** BigInt(64) - BigInt(1)

export type Id64Constructor = <S extends SchemaLike>(
  schemaLike: S,
) => RefineConstructor<Id64<S>, bigint>

export const Id64 = memoized(<S extends SchemaLike>(schema: S) => {
  return Refine<Id64<S>, typeof BigInt>(
    BigInt,
    (_, id) => id.idValue,
    (context, value) => {
      if (value > BigInt(0) && value < MAX_INTEGER_64) {
        return success(new Id64Impl(value, schema))
      }
      return context.failure({
        message: 'id64 is out of int64 range',
        value,
        rule: 'int64',
      })
    },
  )
}, resolveSchema) as Id64Constructor
