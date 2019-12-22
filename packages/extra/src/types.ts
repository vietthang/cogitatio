import {
  Constructor,
  Context,
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
  success,
  TaggedUnionSchema,
  TupleSchema,
  Validation,
} from '@cogitatio/core'
import * as Joi from '@hapi/joi'

function identity<T>(_: Context, value: T) {
  return value
}

function joiToDecode(
  schema: Joi.Schema,
): (context: Context, input: any) => any {
  return (context, value) => {
    const { error, value: validatedValue } = schema.validate(value)
    if (error) {
      return context.failure({ message: error.message, value })
    }
    return success(validatedValue)
  }
}

// Email

export type Email = string & { email: true }

// @internal
export const decodeEmail = joiToDecode(Joi.string().email())

export const Email = Refine<Email, typeof String>(String, identity, decodeEmail)

// Port

export type Port = bigint & { port: true }

// @internal
export const decodePort = (
  context: Context,
  value: bigint,
): Validation<Port> => {
  if (value < BigInt(0) || value > BigInt(65535)) {
    return context.failure({
      message: 'invalid port number',
      value,
      rule: 'port',
    })
  }
  return success(value as Port)
}

export const Port = Refine<Port, typeof BigInt>(BigInt, identity, decodePort)

// Ip

export type Ip = string & { ip: true }

// @internal
export const decodeIp = joiToDecode(Joi.string().ip())

export const Ip = Refine<Ip, typeof String>(String, identity, decodeIp)

// Hostname

export type Hostname = string & { hostname: true }

// @internal
export const decodeHostname = joiToDecode(Joi.string().hostname())

export const Hostname = Refine<Hostname, typeof String>(
  String,
  identity,
  decodeHostname,
)

// Uuid

export type Uuid = string & { uuid: true }

// @internal
export const decodeUuid = joiToDecode(Joi.string().uuid())

export const Uuid = Refine<Uuid, typeof String>(String, identity, decodeUuid)
