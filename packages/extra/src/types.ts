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
import * as Joi from '@hapi/joi'

function identity<T>(value: T) {
  return value
}

function joiSchemaToValidator(schema: Joi.Schema): (input: any) => any {
  return input => {
    const { error, value } = schema.validate(input)
    if (error) {
      throw error
    }
    return value
  }
}

// Email

// @internal
export const refineEmail = joiSchemaToValidator(Joi.string().email())

export type Email = string & { email: true }

export const Email = Refine<Email, typeof String>(String, identity, refineEmail)

// Port

// @internal
export const refinePort = (value: bigint) => {
  if (value < BigInt(0) || value > BigInt(65535)) {
    throw new Error('invalid port number')
  }
  return value
}

export type Port = bigint & { port: true }

export const Port = Refine<Port, typeof BigInt>(
  BigInt,
  identity,
  refinePort as any,
)

// Ip

// @internal
export const refineIp = joiSchemaToValidator(Joi.string().ip())

export type Ip = string & { ip: true }

export const Ip = Refine<Ip, typeof String>(String, identity, refineIp)

// Hostname

// @internal
export const refineHostname = joiSchemaToValidator(Joi.string().hostname())

export type Hostname = string & { hostname: true }

export const Hostname = Refine<Hostname, typeof String>(
  String,
  identity,
  refineHostname,
)

// Uuid

// @internal
export const refineUuid = joiSchemaToValidator(Joi.string().uuid())

export type Uuid = string & { uuid: true }

export const Uuid = Refine<Uuid, typeof String>(String, identity, refineUuid)
