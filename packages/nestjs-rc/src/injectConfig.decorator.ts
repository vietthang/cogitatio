import { SchemaLike } from '@cogitatio/core'
import { Inject } from '@nestjs/common'
import { registerProvider } from './common'
import { objectSerializer } from './utils'

const PREFIX = '___RC'

export function InjectConfig<S extends SchemaLike>(
  schema: S,
  ...keys: string[]
) {
  const provide = [PREFIX, objectSerializer(schema), ...keys].join('__')
  registerProvider(provide, schema, ...keys)
  return Inject(provide)
}
