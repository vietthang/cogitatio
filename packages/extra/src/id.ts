import { IRefineSchema, Refine } from '@cogitatio/core'

export interface Id64Refinement<T> {
  id64: T
}

export const Id64 = <T>(): IRefineSchema<string, Id64Refinement<T>> => {
  return Refine(String, { id64: null as any })
}

export type Id64<T> = string & Id64Refinement<T>
