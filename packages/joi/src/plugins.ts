import { SchemaType } from '@cogitatio/core'
import * as Joi from '@hapi/joi'
import { JoiDecoderPlugin } from './decoder'

export const emptyPlugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.defaults(schema => {
      return schema.empty(Joi.any().valid(null, ''))
    }),
}

export const singleArrayPlugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.defaults(schema => {
      if (schema.type === 'array') {
        return (schema as Joi.ArraySchema).single()
      }
      return schema
    }),
}

export const bigIntPlugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.extend({
      type: 'bigint',
      messages: {
        base: '!!"{{value}}" is not a bigint',
      },
      coerce(value, helpers) {
        try {
          return { value: BigInt(value) }
        } catch (err) {
          return helpers.error('bigint.base', { value })
        }
      },
    }),
  resolveSchema(joi, schema) {
    if (schema.type === SchemaType.Primitive && schema.native === BigInt) {
      return (joi as any).bigint()
    }
    return undefined
  },
}

export const regexPlugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.extend({
      type: 'regex',
      messages: {
        base: '!!"{{value}}" is not a regex',
      },
      coerce(value, helpers) {
        if (value instanceof RegExp) {
          return { value }
        }

        try {
          return { value: RegExp(value) }
        } catch (err) {
          return helpers.error('regex.base', { value })
        }
      },
    }),
  resolveSchema(joi, schema) {
    if (schema.type === SchemaType.Primitive && schema.native === RegExp) {
      return (joi as any).regex()
    }
    return undefined
  },
}

export const phonePlugin: JoiDecoderPlugin = {
  transformJoi: joi => joi.extend(require('joi-phone-number')),
  resolveSchema(_joi, schema, resolveSchema) {
    if (schema.type === SchemaType.Brand && (schema.brand as any).phone) {
      return (resolveSchema(schema.childSchema) as any).phoneNumber(
        (schema.brand as any).phone,
      )
    }
    return undefined
  },
}

const MAX_INTEGER_64 = BigInt(2) ** BigInt(64) - BigInt(1)

export const id64Plugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.extend({
      type: 'id64',
      messages: {
        base: '!!"{{value}}" is not a id64',
      },
      coerce(value, helpers) {
        try {
          const bi = BigInt(value)
          if (bi > 0 && bi <= MAX_INTEGER_64) {
            return { value: bi.toString() }
          }
          return helpers.error('id64.base', { value })
        } catch (err) {
          return helpers.error('id64.base', { value })
        }
      },
    }),
  resolveSchema(joi, schema) {
    if (schema.type === SchemaType.Primitive && schema.native === BigInt) {
      return (joi as any).bigint()
    }
    return undefined
  },
}

function isJoiStringSchema(schema: Joi.Schema): schema is Joi.StringSchema {
  return schema.type === 'string'
}

function isJoiNumberSchema(schema: Joi.Schema): schema is Joi.NumberSchema {
  return schema.type === 'number'
}

function isJoiObjectSchema(schema: Joi.Schema): schema is Joi.ObjectSchema {
  return schema.type === 'object'
}

function isJoiArraySchema(schema: Joi.Schema): schema is Joi.ArraySchema {
  return schema.type === 'array'
}

function guardResolve<T extends Joi.AnySchema, U>(
  schema: Joi.Schema,
  guard: (s: Joi.Schema) => s is T,
  resolve: (s: T) => U,
) {
  if (!guard(schema)) {
    throw new Error('invalid')
  }
  return resolve(schema)
}

export const commonTypesPlugin: JoiDecoderPlugin = {
  resolveSchema(_joi, schema, resolveSchema) {
    if (schema.type !== SchemaType.Brand) {
      return undefined
    }

    return Object.entries(schema.brand as {}).reduce(
      (joiSchema, [key, value]) => {
        switch (key) {
          case 'email':
            return value
              ? guardResolve(joiSchema, isJoiStringSchema, s => s.email())
              : joiSchema

          case 'uri':
            return value
              ? guardResolve(joiSchema, isJoiStringSchema, s => s.uri())
              : joiSchema

          case 'integer':
            return value
              ? guardResolve(joiSchema, isJoiNumberSchema, s => s.integer())
              : joiSchema

          case 'port':
            return value
              ? guardResolve(joiSchema, isJoiNumberSchema, s => s.port())
              : joiSchema

          case 'ip':
            return value
              ? guardResolve(joiSchema, isJoiStringSchema, s => s.ip())
              : joiSchema

          case 'hostname':
            return value
              ? guardResolve(joiSchema, isJoiStringSchema, s => s.hostname())
              : joiSchema

          case 'uuid':
            return value
              ? guardResolve(joiSchema, isJoiStringSchema, s => s.uuid())
              : joiSchema

          case 'min':
            return guardResolve(joiSchema, isJoiNumberSchema, s =>
              s.min(value as number),
            )

          case 'max':
            return guardResolve(joiSchema, isJoiNumberSchema, s =>
              s.max(value as number),
            )

          case 'minLength':
            return guardResolve(joiSchema, isJoiStringSchema, s =>
              s.min(value as number),
            )

          case 'maxLength':
            return guardResolve(joiSchema, isJoiStringSchema, s =>
              s.max(value as number),
            )

          case 'minItems':
            return guardResolve(joiSchema, isJoiArraySchema, s =>
              s.min(value as number),
            )

          case 'maxItems':
            return guardResolve(joiSchema, isJoiArraySchema, s =>
              s.max(value as number),
            )

          case 'uniqueItems':
            return guardResolve(joiSchema, isJoiArraySchema, s => s.unique())

          case 'default':
            return joiSchema.optional().default(value)

          case 'id64':
            return guardResolve(joiSchema, isJoiStringSchema, s =>
              s.regex(/^\d+$/),
            )

          default:
            throw new Error('unhandled refinement')
        }
      },
      resolveSchema(schema.childSchema),
    )
  },
}
