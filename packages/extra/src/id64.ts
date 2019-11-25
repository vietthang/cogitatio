import { Refine, RefineConstructor } from '@cogitatio/core'

export interface Id64Refinement<T> {
  id64: T
}

export type Id64<T = any> = string & Id64Refinement<T>

const MAX_INTEGER_64 = BigInt(2) ** BigInt(64) - BigInt(1)

// @internal
export function refineId64(input: string): string {
  const bigIntValue = BigInt(input)
  if (bigIntValue > BigInt(0) && bigIntValue < MAX_INTEGER_64) {
    return bigIntValue.toString()
  }
  throw new Error('invalid id64')
}

export function Id64<T>(): RefineConstructor<string, Id64Refinement<T>> {
  return Refine<Id64Refinement<T>>()(String, refineId64)
}
