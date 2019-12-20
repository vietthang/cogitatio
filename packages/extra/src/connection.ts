import {
  Any,
  Refine,
  RefineConstructor,
  resolveSchema,
  SchemaLike,
} from '@cogitatio/core'
import { Cursor } from './cursor'
import { Edge } from './edge'
import { memoized } from './utils'

export interface ConnectionArgs<S extends SchemaLike, Q> {
  first?: bigint
  after?: Cursor<S>
  last?: bigint
  before?: Cursor<S>
  offset?: bigint
  query?: Q
}

export interface Connection<S extends SchemaLike, Q> {
  edges(args: ConnectionArgs<S, Q>): Promise<Array<Edge<S>>>
  hasNextPage(args: ConnectionArgs<S, Q>): Promise<boolean>
  hasPreviousPage(args: ConnectionArgs<S, Q>): Promise<boolean>
  total(args: ConnectionArgs<S, Q>): Promise<bigint>
}

export type ConnectionConstructor = <S extends SchemaLike, Q>(
  schemaLike: S,
) => RefineConstructor<Connection<S, Q>, Connection<S, Q>>

export const Connection = memoized(<S extends SchemaLike, Q>(_: S) => {
  return Refine<Connection<S, Q>, any>(
    Any,
    value => value,
    value => value,
  )
}, resolveSchema) as ConnectionConstructor
