import { Decoder, resolveSchema, SchemaLike } from '@cogitatio/core'
import { Inject, Injectable } from '@nestjs/common'
import {
  ArgumentMetadata,
  ClassProvider,
  PipeTransform,
} from '@nestjs/common/interfaces'
import { generateNamedClass } from './utils'

export const DECODER_SYMBOL = '___nestjs_utils_Decoder'

export const registeredProviders: Array<ClassProvider<PipeTransform>> = []

export function registerProvider<S extends SchemaLike>(
  schemaLike?: S,
): ClassProvider<PipeTransform> {
  @Injectable()
  class Pipe implements PipeTransform<unknown, unknown> {
    constructor(
      @Inject(DECODER_SYMBOL)
      private readonly decoder: Decoder<unknown>,
    ) {}

    public transform(value: unknown, metadata: ArgumentMetadata): unknown {
      const schema = schemaLike ? resolveSchema(schemaLike) : metadata.metatype

      if (!schema || schema === Object) {
        throw new Error('can not find schema')
      }

      return this.decoder.decode(schema, value)
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
