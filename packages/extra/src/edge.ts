import {
  Property,
  Refine,
  RefineConstructor,
  Resolve,
  resolveSchema,
  SchemaLike,
  success,
} from '@cogitatio/core'
import { Cursor } from './cursor'
import { memoized } from './utils'

export interface Edge<S extends SchemaLike> {
  readonly cursor: Cursor<S>
  readonly node: Resolve<S>
}

export type EdgeConstructor = <S extends SchemaLike>(
  schemaLike: S,
) => RefineConstructor<Edge<S>, Edge<S>>

export const Edge = memoized(<S extends SchemaLike>(schema: S) => {
  class EdgeLocal {
    public readonly cursor!: Cursor<S>
    public readonly node!: Resolve<S>
  }
  Property(Cursor(schema))(EdgeLocal as any, 'cursor')
  Property(schema)(EdgeLocal as any, 'node')

  return Refine<Edge<S>, typeof EdgeLocal>(
    EdgeLocal,
    (_, v) => v,
    (_, v) => success(v),
  )
}, resolveSchema) as EdgeConstructor
