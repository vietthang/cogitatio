import { Refine } from '@cogitatio/core'

export interface Id64Refinement<T> {
  id64: T
}

export const Id64 = Refine(String, { id64: true as any })

export type Id64<T = any> = string & Id64Refinement<T>
