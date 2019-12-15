import { SchemaLike } from '@cogitatio/core'
import { PipeTransform, Type } from '@nestjs/common'
import { registerProvider } from './common'

export function Validation(schemaLike?: SchemaLike): Type<PipeTransform> {
  const { useClass: clazz } = registerProvider(schemaLike)

  return clazz
}
