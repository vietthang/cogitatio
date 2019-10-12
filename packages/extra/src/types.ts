import {
  Constructor,
  DictionarySchema,
  EnumSchema,
  ListSchema,
  NullableSchema,
  ObjectSchema,
  OptionalSchema,
  PrimitiveConstructor,
  PrimitiveSchema,
  Refine,
  RefineSchema,
  Resolve,
  SchemaLike,
  TaggedUnionSchema,
  TupleSchema,
} from '@cogitatio/core'

export const Email = Refine(String, {
  email: true as const,
})

export type Email = Resolve<typeof Email>

export const Uri = Refine(String, {
  uri: true,
})

export type Uri = Resolve<typeof Uri>

export const Integer = Refine(Number, {
  integer: true,
})

export type Integer = Resolve<typeof Integer>

export const Port = Refine(Integer, {
  port: true,
})

export type Port = Resolve<typeof Port>

export const Ip = Refine(String, {
  ip: true as const,
})

export type Ip = Resolve<typeof Ip>

export const Hostname = Refine(String, { hostname: true })

export type Hostname = Resolve<typeof Hostname>

export const Uuid = Refine(String, {
  uuid: true as const,
})

export type Uuid = Resolve<typeof Uuid>

export interface Min<T extends number> {
  min: T
}

export const Min = <T extends number>(min: T) => <
  S extends SchemaLike & (Resolve<S> extends number ? unknown : never)
>(
  schema: S,
): RefineSchema<Resolve<S>, Min<T>> => {
  return Refine(schema, { min })
}

export interface Max<T extends number> {
  max: T
}

export const Max = <T extends number>(max: T) => <
  S extends SchemaLike & (Resolve<S> extends number ? unknown : never)
>(
  schema: S,
): RefineSchema<Resolve<S>, Max<T>> => {
  return Refine(schema, { max })
}

export interface MinLength<T extends number> {
  minLength: T
}

export const MinLength = <T extends number>(minLength: T) => <
  S extends SchemaLike & (Resolve<S> extends string ? unknown : never)
>(
  schema: S,
): RefineSchema<Resolve<S>, MinLength<T>> => {
  return Refine(schema, { minLength })
}

export interface MaxLength<T extends number> {
  maxLength: T
}

export const MaxLength = <T extends number>(maxLength: T) => <
  S extends SchemaLike & (Resolve<S> extends string ? unknown : never)
>(
  schema: S,
): RefineSchema<Resolve<S>, MaxLength<T>> => {
  return Refine(schema, { maxLength })
}

export interface MinItems<T extends number> {
  minItems: T
}

export const MinItems = <T extends number>(minItems: T) => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): RefineSchema<Resolve<S>, MinItems<T>> => {
  return Refine(schema, { minItems })
}

export interface MaxItems<T extends number> {
  maxItems: T
}

export const MaxItems = <T extends number>(maxItems: T) => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): RefineSchema<Resolve<S>, MaxItems<T>> => {
  return Refine(schema, { maxItems })
}

export interface UniqueItems {
  uniqueItems: true
}

export const UniqueItems = () => <
  S extends SchemaLike & (Resolve<S> extends unknown[] ? unknown : never)
>(
  schema: S,
): RefineSchema<Resolve<S>, UniqueItems> => {
  return Refine(schema, { uniqueItems: true })
}

export const Default = (defaultValue: unknown) => <S extends SchemaLike>(
  schema: S,
): RefineSchema<Resolve<S>, unknown> => {
  return Refine(schema, { default: defaultValue })
}
