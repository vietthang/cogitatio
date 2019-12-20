import {
  Refine,
  RefineConstructor,
  resolveSchema,
  SchemaLike,
} from '@cogitatio/core'
import { memoized } from './utils'

export interface Cursor<S extends SchemaLike> {
  readonly cursorValue: string
  readonly schema: S
}

class CursorImpl<S extends SchemaLike> implements Cursor<S> {
  constructor(public readonly cursorValue: string, public readonly schema: S) {}

  public toString() {
    return this.cursorValue
  }

  public toJSON() {
    return this.toString()
  }
}

export type CursorConstructor = <S extends SchemaLike>(
  schemaLike: S,
) => RefineConstructor<Cursor<S>, string>

export const Cursor = memoized(<S extends SchemaLike>(schemaLike: S) => {
  return Refine<Cursor<S>, typeof String>(
    String,
    cursor => cursor.cursorValue,
    value => {
      return new CursorImpl(value, schemaLike)
    },
  )
}, resolveSchema) as CursorConstructor
