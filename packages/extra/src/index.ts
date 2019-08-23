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

export const Email: IRefineSchema<string, { email: true }> = Refine(String, {
  email: true,
})

export type Email = Resolve<typeof Email>

export const Uri: IRefineSchema<string, { uri: true }> = Refine(String, {
  uri: true,
})

export type Uri = Resolve<typeof Uri>

export const Integer: IRefineSchema<number, { integer: true }> = Refine(
  Number,
  {
    integer: true,
  },
)

export type Integer = Resolve<typeof Integer>

export const Port: IRefineSchema<Integer, { port: true }> = Refine(Integer, {
  port: true,
})

export type Port = Resolve<typeof Port>

export const Ip: IRefineSchema<string, { ip: true }> = Refine(String, {
  ip: true,
})

export type Ip = Resolve<typeof Ip>

export const Hostname: IRefineSchema<string, { hostname: true }> = Refine(
  String,
  { hostname: true },
)

export type Hostname = Resolve<typeof Hostname>

export const Uuid: IRefineSchema<string, { uuid: true }> = Refine(String, {
  uuid: true,
})

export type Uuid = Resolve<typeof Uuid>

export interface Min<T extends number> {
  min: T
}

export const Min = <T extends number>(min: T) => <
  S extends SchemaLike & (Resolve<S> extends number ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, Min<T>> => {
  return Refine(schema, { min })
}

export interface Max<T extends number> {
  max: T
}

export const Max = <T extends number>(max: T) => <
  S extends SchemaLike & (Resolve<S> extends number ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, Max<T>> => {
  return Refine(schema, { max })
}

export interface MinLength<T extends number> {
  minLength: T
}

export const MinLength = <T extends number>(minLength: T) => <
  S extends SchemaLike & (Resolve<S> extends string ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MinLength<T>> => {
  return Refine(schema, { minLength })
}

export interface MaxLength<T extends number> {
  maxLength: T
}

export const MaxLength = <T extends number>(maxLength: T) => <
  S extends SchemaLike & (Resolve<S> extends string ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MaxLength<T>> => {
  return Refine(schema, { maxLength })
}

export interface MinItems<T extends number> {
  minItems: T
}

export const MinItems = <T extends number>(minItems: T) => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MinItems<T>> => {
  return Refine(schema, { minItems })
}

export interface MaxItems<T extends number> {
  maxItems: T
}

export const MaxItems = <T extends number>(maxItems: T) => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, MaxItems<T>> => {
  return Refine(schema, { maxItems })
}

export interface UniqueItems {
  uniqueItems: true
}

export const UniqueItems = () => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): IRefineSchema<Resolve<S>, UniqueItems> => {
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
