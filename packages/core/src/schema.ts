import { IRefineSchema } from './brand'
import { SchemaType } from './common'
import { IDictionarySchema } from './dictionary'
import { IEnumSchema } from './enum'
import { IListSchema } from './list'
import { reflectClass } from './metadata'
import { INullableSchema } from './nullable'
import { Constructor, IObjectSchema } from './object'
import { IOptionalSchema } from './optional'
import {
  IPrimitiveSchema,
  isPrimitiveConstructor,
  PrimitiveConstructor,
  ResolvePrimitiveFromConstructor,
} from './primitive'
import { ITupleSchema } from './tuple'

export type Schema =
  | IPrimitiveSchema
  | IEnumSchema
  | IOptionalSchema
  | INullableSchema
  | IListSchema
  | IDictionarySchema
  | ITupleSchema
  | IObjectSchema
  | IRefineSchema

export type SchemaLike =
  | Schema
  | PrimitiveConstructor
  | Constructor
  | ({ [key: string]: SchemaLike })
  | ({
      [key: number]: SchemaLike
      length: number
      [Symbol.iterator](): IterableIterator<SchemaLike>
    })

export type Thunk<T> = T | (() => T)

// tslint:disable-next-line
type keyofObject = keyof Object

export type Resolve<S> = S extends PrimitiveConstructor
  ? ResolvePrimitiveFromConstructor<S>
  : S extends Constructor<infer T>
  ? T
  : S extends { [key: string]: SchemaLike }
  ? { [key in Exclude<keyof S, keyofObject>]: Resolve<S[key]> }
  : S extends ({
      [key: number]: SchemaLike
      length: number
      [Symbol.iterator](): IterableIterator<SchemaLike>
    })
  ? { [key in keyof S]: Resolve<S[key]> }
  : S extends Schema
  ? S['_']
  : never

export function resolveSchema(schema: SchemaLike): Schema {
  if (isPrimitiveConstructor(schema)) {
    return { type: SchemaType.Primitive, native: schema } as IPrimitiveSchema
  }

  if (typeof schema === 'function') {
    return {
      type: SchemaType.Object,
      fields: () =>
        Object.fromEntries(
          Object.entries(reflectClass(schema)).map(([key, resolver]) => [
            key,
            resolver(),
          ]),
        ),
    } as IObjectSchema
  }

  if (Array.isArray(schema)) {
    if (schema.length !== 1) {
      throw new Error('only 1-element array is supported')
    }
    return {
      type: SchemaType.List,
      childSchema: resolveSchema(schema[0]),
    } as IListSchema
  }

  if (Object.values(SchemaType).includes((schema as Schema).type)) {
    return schema as Schema
  }

  return {
    type: SchemaType.Object,
    fields: () =>
      Object.fromEntries(
        Object.entries(schema).map(([key, value]) => [
          key,
          resolveSchema(value),
        ]),
      ),
  } as IObjectSchema
}
