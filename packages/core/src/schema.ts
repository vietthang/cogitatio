import { IBrandSchema, ResolveBrand } from './brand'
import { SchemaType } from './common'
import { IDictionarySchema, ResolveDictionary } from './dictionary'
import { IEnumSchema, ResolveEnum } from './enum'
import { IListSchema, ResolveList } from './list'
import { INullableSchema, ResolveNullable } from './nullable'
import { Constructor, IObjectSchema, ResolveObject } from './object'
import { IOptionalSchema, ResolveOptional } from './optional'
import {
  IPrimitiveSchema,
  isPrimitiveConstructor,
  PrimitiveConstructor,
  ResolvePrimitive,
} from './primitive'
import { ITupleSchema, ResolveTuple } from './tuple'

export type Schema =
  | IPrimitiveSchema
  | IEnumSchema
  | IOptionalSchema
  | INullableSchema
  | IListSchema
  | IDictionarySchema
  | ITupleSchema
  | IObjectSchema
  | IBrandSchema

export type SchemaLike = Schema | PrimitiveConstructor | Constructor

export type Resolve<S> = S extends PrimitiveConstructor
  ? ResolvePrimitive<IPrimitiveSchema<S>>
  : S extends Constructor<infer T>
  ? ResolveObject<IObjectSchema<T>>
  : S extends IPrimitiveSchema
  ? ResolvePrimitive<S>
  : S extends IEnumSchema
  ? ResolveEnum<S>
  : S extends IOptionalSchema
  ? ResolveOptional<S>
  : S extends INullableSchema
  ? ResolveNullable<S>
  : S extends IListSchema
  ? ResolveList<S>
  : S extends IDictionarySchema
  ? ResolveDictionary<S>
  : S extends ITupleSchema
  ? ResolveTuple<S>
  : S extends IObjectSchema
  ? ResolveObject<S>
  : S extends IBrandSchema
  ? ResolveBrand<S>
  : never

export function resolveSchema(schemaLike: SchemaLike): Schema {
  return isPrimitiveConstructor(schemaLike)
    ? { type: SchemaType.Primitive, native: schemaLike }
    : typeof schemaLike === 'function'
    ? { type: SchemaType.Object, resolver: () => schemaLike }
    : schemaLike
}
