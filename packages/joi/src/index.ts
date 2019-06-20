import {
  emailSchema,
  hostnameSchema,
  integerSchema,
  ipSchema,
  portSchema,
  uriSchema,
  uuidSchema,
} from '@anzenjs/extra'
import Joi, { ArraySchema } from 'joi'
import { SchemaResolver } from './decoder'

export * from './decoder'

export const defaultJoi = Joi.defaults(schema => {
  if (schema.schemaType === 'array') {
    schema = (schema as ArraySchema).single()
  }
  return schema.empty(Joi.only(null, ''))
})

export const wellKnownBrandResolvers: SchemaResolver[] = [
  schema => {
    switch (schema) {
      case emailSchema:
        return Joi.string().email()
      case uriSchema:
        return Joi.string().uri()
      case integerSchema:
        return Joi.number().integer()
      case portSchema:
        return Joi.number().port()
      case ipSchema:
        return Joi.string().ip()
      case hostnameSchema:
        return Joi.string().hostname()
      case uuidSchema:
        return Joi.string().guid()
      default:
        return undefined
    }
  },
]
