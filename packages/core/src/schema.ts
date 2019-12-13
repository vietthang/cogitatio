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
import { RefineConstructor, RefineSchema } from './refine'
import { TaggedUnionSchema } from './taggedUnion'
import { TupleSchema } from './tuple'

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
  Schema | PrimitiveConstructor | RefineConstructor | Constructor
>

export type Resolve<S> = S extends PrimitiveConstructor
  ? ResolvePrimitiveFromConstructor<S>
  : S extends Constructor<infer T>
  ? T
  : S extends RefineConstructor
  ? S['schema']['_']
  : S extends Schema
  ? S['_']
  : never

function isClass(fn: unknown): fn is Constructor {
  if (typeof fn !== 'function') {
    return false
  }

  if (/^class[\s{]/.test(fn.toString())) {
    return true
  }

  return false
}

function isRefineSchema(fn: any): fn is RefineConstructor {
  return fn.schema !== undefined
}

export function resolveSchema(schema: SchemaLike): Schema {
  if (isPrimitiveConstructor(schema)) {
    return { type: SchemaType.Primitive, native: schema } as PrimitiveSchema
  }

  if (typeof schema === 'function') {
    if (isClass(schema)) {
      return {
        type: SchemaType.Object,
        fields: () =>
          Object.fromEntries(
            Object.entries(reflectClass(schema)).map(([key, resolver]) => [
              key,
              resolver(),
            ]),
          ),
      } as ObjectSchema
    }

    if (isRefineSchema(schema)) {
      return schema.schema
    }

    return resolveSchema(schema())
  }

  return schema
}
