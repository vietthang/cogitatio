import { AnySchema } from './any'
import { SchemaType } from './common'
import { DictionarySchema } from './dictionary'
import { EnumSchema } from './enum'
import { ListSchema } from './list'
import { reflectClass } from './metadata'
import { NullableSchema } from './nullable'
import { Constructor, ObjectSchema } from './object'
import { OptionalSchema } from './optional'
import {
  isPrimitiveConstructor,
  PrimitiveConstructor,
  PrimitiveSchema,
  ResolvePrimitiveFromConstructor,
} from './primitive'
import { isRefineConstructor, RefineConstructor, RefineSchema } from './refine'
import {
  isTaggedUnionConstructor,
  TaggedUnionConstructor,
  TaggedUnionSchema,
} from './tagged-union'
import { TupleSchema } from './tuple'
import { memoized, Transformer } from './utils'

export type Schema =
  | PrimitiveSchema
  | EnumSchema
  | OptionalSchema
  | NullableSchema
  | ListSchema
  | DictionarySchema
  | TupleSchema
  | ObjectSchema
  | RefineSchema
  | TaggedUnionSchema
  | AnySchema

export type Thunk<T> = T | (() => T)

export type SchemaLike = Thunk<
  | Schema
  | PrimitiveConstructor
  | RefineConstructor
  | TaggedUnionConstructor
  | Constructor
>

export type Resolve<S> = S extends PrimitiveConstructor
  ? ResolvePrimitiveFromConstructor<S>
  : S extends Constructor<infer T>
  ? T
  : S extends RefineConstructor
  ? S['refineSchema']['_']
  : S extends TaggedUnionConstructor
  ? S['taggedUnionSchema']['_']
  : S extends Schema
  ? S['_']
  : never

function isClass(fn: unknown): fn is Constructor {
  if (typeof fn !== 'function') {
    return false
  }

  return !!fn.prototype
}

export const resolveSchema: Transformer<[any], Schema> = memoized(
  schema => {
    if (isPrimitiveConstructor(schema)) {
      return { type: SchemaType.Primitive, native: schema } as PrimitiveSchema
    }

    if (typeof schema === 'function') {
      if (isClass(schema)) {
        return reflectClass(schema)
      }

      if (isRefineConstructor(schema)) {
        return schema.refineSchema
      }

      if (isTaggedUnionConstructor(schema)) {
        return schema.taggedUnionSchema
      }

      return resolveSchema(schema())
    }

    return schema
  },
  schema => {
    if (isPrimitiveConstructor(schema)) {
      return schema
    }

    if (typeof schema === 'function') {
      if (isRefineConstructor(schema)) {
        return schema
      }

      if (isTaggedUnionConstructor(schema)) {
        return schema
      }

      if (isClass(schema)) {
        return schema
      }

      return schema()
    }

    return schema
  },
)
