import { BrandDecorator, IBrandSchema } from './brand'
import { DictionaryDecorator, IDictionarySchema } from './dictionary'
import { EnumDecorator, IEnumSchema } from './enum'
import { IListSchema, ListDecorator } from './list'
import { decorateClass } from './metadata'
import { INullableSchema, NullableDecorator } from './nullable'
import { Constructor, IObjectSchema, ObjectDecorator } from './object'
import { IOptionalSchema, OptionalDecorator } from './optional'
import {
  IPrimitiveSchema,
  PrimitiveConstructor,
  PrimitiveDecorator,
} from './primitive'
import { SchemaLike } from './schema'
import { ITupleSchema, TupleDecorator } from './tuple'

export function Property<S extends PrimitiveConstructor>(
  schema: S,
): PrimitiveDecorator<IPrimitiveSchema<S>>

export function Property<S extends IPrimitiveSchema>(
  schema: S,
): PrimitiveDecorator<S>

export function Property<S extends IEnumSchema>(schema: S): EnumDecorator<S>

export function Property<S extends IOptionalSchema>(
  schema: S,
): OptionalDecorator<S>

export function Property<S extends INullableSchema>(
  schema: S,
): NullableDecorator<S>

export function Property<S extends IListSchema>(schema: S): ListDecorator<S>

export function Property<S extends IDictionarySchema>(
  schema: S,
): DictionaryDecorator<S>

export function Property<S extends ITupleSchema>(schema: S): TupleDecorator<S>

export function Property<S extends IObjectSchema>(schema: S): ObjectDecorator<S>

export function Property<T extends {}>(
  schema: Constructor<T>,
): ObjectDecorator<IObjectSchema<T>>

export function Property<S extends IBrandSchema>(schema: S): BrandDecorator<S>

export function Property(schema: SchemaLike): any {
  return <T extends object>(target: T, key: keyof T) => {
    decorateClass<T, keyof T>(target.constructor as any, key, schema)
  }
}
