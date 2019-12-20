import {
  Refine,
  RefineConstructor,
  resolveSchema,
  SchemaLike,
} from '@cogitatio/core'
import { memoized } from './utils'

export interface Id64<S extends SchemaLike> {
  readonly idValue: bigint
  readonly schema: S
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
) => RefineConstructor<Id64<S>, string>

export const Id64 = memoized(<S extends SchemaLike>(schema: S) => {
  return Refine<Id64<S>, typeof String>(
    String,
    id => id.idValue.toString(10),
    value => {
      const bigintValue = BigInt(value)
      if (bigintValue > BigInt(0) && bigintValue < MAX_INTEGER_64) {
        return new Id64Impl(bigintValue, schema)
      }
      throw new Error('id64 is out of int64 range')
    },
  )
}, resolveSchema) as Id64Constructor
