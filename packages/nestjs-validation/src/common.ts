import {
  Decoder,
  JsonValue,
  resolveSchema,
  SchemaLike,
  ValidationError,
} from '@cogitatio/core'
import { badRequest } from '@cogitatio/errors'
import { Inject, Injectable } from '@nestjs/common'
import {
  ArgumentMetadata,
  ClassProvider,
  PipeTransform,
} from '@nestjs/common/interfaces'
import { either } from 'fp-ts'
import { generateNamedClass } from './utils'

export const JSON_CODEC_SYMBOL = '___nestjs_utils_Decoder'

export const registeredProviders: Array<ClassProvider<PipeTransform>> = []

export function registerProvider<S extends SchemaLike>(
  schemaLike?: S,
): ClassProvider<PipeTransform> {
  @Injectable()
  class Pipe implements PipeTransform<JsonValue, unknown> {
    constructor(
      @Inject(JSON_CODEC_SYMBOL)
      private readonly decoder: Decoder<JsonValue>,
    ) {}

    public transform(value: JsonValue, metadata: ArgumentMetadata): unknown {
      const schema = schemaLike ? resolveSchema(schemaLike) : metadata.metatype

      if (!schema || schema === Object) {
        throw new Error('can not find schema')
      }

      const validation = this.decoder.decode(schema, value)

      return either.getOrElse<ValidationError[], unknown>(errors => {
        throw badRequest({ extra: errors })
      })(validation)
    }
  }

  const clazz = generateNamedClass(Pipe, '___VALIDATION')

  const provider: ClassProvider<PipeTransform> = {
    provide: clazz,
    useClass: clazz,
  }
  registeredProviders.push(provider)

  return provider
}
