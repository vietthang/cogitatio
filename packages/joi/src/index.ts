import { Email, Hostname, Integer, Ip, Port, Uri, Uuid } from '@cogitatio/extra'
import Joi, { ArraySchema } from '@hapi/joi'
import { SchemaResolver } from './decoder'

export * from './decoder'
export * from './decorators'

export const commonJoi = Joi.defaults(schema => {
  if (schema.schemaType === 'array') {
    schema = (schema as ArraySchema).single()
  }
  return schema.empty(Joi.only(null, ''))
})

export const wellKnownBrandResolvers: SchemaResolver[] = [
  schema => {
    switch (schema) {
      case Email:
        return Joi.string().email()
      case Uri:
        return Joi.string().uri()
      case Integer:
        return Joi.number().integer()
      case Port:
        return Joi.number().port()
      case Ip:
        return Joi.string().ip()
      case Hostname:
        return Joi.string().hostname()
      case Uuid:
        return Joi.string().guid()
      default:
        return undefined
    }
  },
]
