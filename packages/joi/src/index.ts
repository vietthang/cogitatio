import * as Joi from '@hapi/joi'

export * from './decoder'

export const commonJoi: Joi.Root = Joi.defaults(schema => {
  if (schema.schemaType === 'array') {
    schema = (schema as Joi.ArraySchema).single()
  }
  return schema.empty(Joi.only(null, ''))
})
