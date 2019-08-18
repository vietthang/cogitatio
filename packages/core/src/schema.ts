import { IAnySchema } from './any'
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
import { ITaggedUnionSchema } from './taggedUnion'
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
  | ITaggedUnionSchema
  | IAnySchema

export type SchemaLike = Schema | PrimitiveConstructor | Constructor

export type Thunk<T> = T | (() => T)

export type Resolve<S> = S extends PrimitiveConstructor
  ? ResolvePrimitiveFromConstructor<S>
  : S extends Constructor<infer T>
  ? T
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

  return schema
}
