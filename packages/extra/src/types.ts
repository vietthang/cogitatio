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

export const Email = Refine<{ email: true }>()(String, refineEmail)

export type Email = Resolve<typeof Email>

// Port

// @internal
export const refinePort = (value: bigint) => {
  if (value < BigInt(0) || value > BigInt(65535)) {
    throw new Error('invalid port number')
  }
  return value
}

export const Port = Refine<{ port: true }>()(BigInt, refinePort)

export type Port = Resolve<typeof Port>

// Ip

// @internal
export const refineIp = joiSchemaToValidator(Joi.string().ip())

export const Ip = Refine<{ ip: true }>()(String, refineIp)

export type Ip = Resolve<typeof Ip>

// Hostname

// @internal
export const refineHostname = joiSchemaToValidator(Joi.string().hostname())

export const Hostname = Refine<{ hostname: true }>()(String, refineHostname)

export type Hostname = Resolve<typeof Hostname>

// Uuid

// @internal
export const refineUuid = joiSchemaToValidator(Joi.string().uuid())

export const Uuid = Refine<{ uuid: true }>()(String, refineUuid)

export type Uuid = Resolve<typeof Uuid>
