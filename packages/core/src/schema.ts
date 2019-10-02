import { AnySchema } from './any'
import { RefineSchema } from './brand'
import { SchemaType } from './common'
import { DictionarySchema } from './dictionary'
import { EnumSchema } from './enum'
import { ListSchema } from './list'
import { reflectClass } from './metadata'
import { NullableSchema } from './nullable'
import { Constructor, ObjectSchema } from './object'
import { OptionalSchema } from './optional'
import {
  PrimitiveConstructor,
  PrimitiveSchema,
  ResolvePrimitiveFromConstructor,
  isPrimitiveConstructor,
} from './primitive'
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

export type SchemaLike = Thunk<Schema | PrimitiveConstructor | Constructor>

export type ObjectSchemaLike<T> = Thunk<ObjectSchema<T> | Constructor<T>>

export type Resolve<S> = S extends PrimitiveConstructor
  ? ResolvePrimitiveFromConstructor<S>
  : S extends Constructor<infer T>
  ? T
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

    return resolveSchema(schema())
  }

  return schema
}
