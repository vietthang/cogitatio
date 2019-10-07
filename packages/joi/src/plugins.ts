import { SchemaType } from '@cogitatio/core'
import * as Joi from '@hapi/joi'
import { JoiDecoderPlugin } from './decoder'

export const emptyPlugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.defaults(schema => {
      return schema.empty(Joi.any().only(null, ''))
    }),
}

export const singleArrayPlugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.defaults(schema => {
      if (schema.schemaType === 'array') {
        return (schema as Joi.ArraySchema).single()
      }
      return schema
    }),
}

export const bigIntPlugin: JoiDecoderPlugin = {
  transformJoi: joi =>
    joi.extend({
      name: 'bigint',
      language: {
        base: '!!"{{value}}" is not a bigint',
      },
      coerce(value, state, prefs) {
        // tslint:disable-next-line
        if (typeof value === 'bigint') {
          return value
        }

        if (!prefs.convert) {
          return this.createError('bigint.base', { value }, state, prefs)
        }

        try {
          return BigInt(value)
        } catch (err) {
          return this.createError('bigint.base', { value }, state, prefs)
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
      name: 'regex',
      language: {
        base: '!!"{{value}}" is not a regex',
      },
      coerce(value, state, prefs) {
        if (value instanceof RegExp) {
          return value
        }

        if (!prefs.convert) {
          return this.createError('regex.base', { value }, state, prefs)
        }

        try {
          return RegExp(value)
        } catch (err) {
          return this.createError('regex.base', { value }, state, prefs)
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

function isJoiStringSchema(schema: Joi.Schema): schema is Joi.StringSchema {
  return schema.schemaType === 'string'
}

function isJoiNumberSchema(schema: Joi.Schema): schema is Joi.NumberSchema {
  return schema.schemaType === 'number'
}

function isJoiObjectSchema(schema: Joi.Schema): schema is Joi.ObjectSchema {
  return schema.schemaType === 'object'
}

function isJoiArraySchema(schema: Joi.Schema): schema is Joi.ArraySchema {
  return schema.schemaType === 'array'
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
