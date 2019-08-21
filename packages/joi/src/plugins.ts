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
