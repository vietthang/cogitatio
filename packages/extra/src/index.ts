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

export interface EmailRefinement {
  email: true
}

export const Email: IRefineSchema<string, EmailRefinement> = Refine(String, {
  email: true,
})

export type Email = Resolve<typeof Email>

export interface UriRefinement {
  uri: true
}

export const Uri: IRefineSchema<string, UriRefinement> = Refine(String, {
  uri: true,
})

export type Uri = Resolve<typeof Uri>

export interface IntegerRefinement {
  integer: true
}

export const Integer: IRefineSchema<number, IntegerRefinement> = Refine(
  Number,
  {
    integer: true,
  },
)

export type Integer = Resolve<typeof Integer>

export interface PortRefinement {
  port: true
}

export const Port: IRefineSchema<Integer, PortRefinement> = Refine(Integer, {
  port: true,
})

export type Port = Resolve<typeof Port>

export interface IpRefinement {
  ip: true
}

export const Ip: IRefineSchema<string, IpRefinement> = Refine(String, {
  ip: true,
})

export type Ip = Resolve<typeof Ip>

export interface HostnameRefinement {
  hostname: true
}

export const Hostname: IRefineSchema<string, HostnameRefinement> = Refine(
  String,
  { hostname: true },
)

export type Hostname = Resolve<typeof Hostname>

export interface UuidRefinement {
  uuid: true
}

export const Uuid: IRefineSchema<string, UuidRefinement> = Refine(String, {
  uuid: true,
})

export type Uuid = Resolve<typeof Uuid>

export interface MinRefinement<T extends number> {
  min: T
}

export const Min = <T extends number>(min: T) => <
  S extends SchemaLike & (Resolve<S> extends number ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MinRefinement<T>> => {
  return Refine(schema, { min })
}

export interface MaxRefinement<T extends number> {
  max: T
}

export const Max = <T extends number>(max: T) => <
  S extends SchemaLike & (Resolve<S> extends number ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MaxRefinement<T>> => {
  return Refine(schema, { max })
}

export interface MinLengthRefinement<T extends number> {
  minLength: T
}

export const MinLength = <T extends number>(minLength: T) => <
  S extends SchemaLike & (Resolve<S> extends string ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MinLengthRefinement<T>> => {
  return Refine(schema, { minLength })
}

export interface MaxLengthRefinement<T extends number> {
  maxLength: T
}

export const MaxLength = <T extends number>(maxLength: T) => <
  S extends SchemaLike & (Resolve<S> extends string ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MaxLengthRefinement<T>> => {
  return Refine(schema, { maxLength })
}

export interface MinItemsRefinement<T extends number> {
  minItems: T
}

export const MinItems = <T extends number>(minItems: T) => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MinItemsRefinement<T>> => {
  return Refine(schema, { minItems })
}

export interface MaxItemsRefinement<T extends number> {
  maxItems: T
}

export const MaxItems = <T extends number>(maxItems: T) => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MaxItemsRefinement<T>> => {
  return Refine(schema, { maxItems })
}

export interface UniqueItemsRefinement {
  uniqueItems: true
}

export const UniqueItems = () => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, UniqueItemsRefinement> => {
  return Refine(schema, { uniqueItems: true })
}

export const Default = (defaultValue: unknown) => <S extends SchemaLike>(
  schema: S,
): IRefineSchema<Resolve<S>, unknown> => {
  return Refine(schema, { default: defaultValue })
}

export { IEncoder, IDecoder, ICodec } from './codec'

export { Id64 } from './id'

export * from './phone'
