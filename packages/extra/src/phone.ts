import {
  Constructor,
  IDictionarySchema,
  IEnumSchema,
  IListSchema,
  INullableSchema,
  IObjectSchema,
  IOptionalSchema,
  IPrimitiveSchema,
  IRefineSchema,
  ITaggedUnionSchema,
  ITupleSchema,
  PrimitiveConstructor,
  Refine,
  Resolve,
  SchemaLike,
} from '@cogitatio/core'

export enum PhoneFormat {
  e164 = 'e164',
  international = 'international',
  national = 'national',
  rfc3966 = 'rfc3966',
}

export interface PhoneRefinement<
  C extends string,
  F extends PhoneFormat | undefined
> {
  phone: {
    defaultCountry: C
    format: F
  }
}

export function Phone(): IRefineSchema<string, PhoneRefinement<'US', undefined>>

export function Phone<C extends string>(
  defaultCountry: C,
): IRefineSchema<string, PhoneRefinement<C, undefined>>

export function Phone<C extends string, F extends PhoneFormat>(
  defaultCountry: C,
  format: F,
): IRefineSchema<string, PhoneRefinement<C, F>>

export function Phone(defaultCountry: string = 'US', format?: PhoneFormat) {
  return Refine(String, {
    phone: {
      defaultCountry,
      format,
    },
  })
}

export type Phone<
  C extends string = 'US',
  F extends PhoneFormat | undefined = undefined
> = string & PhoneRefinement<C, F>
