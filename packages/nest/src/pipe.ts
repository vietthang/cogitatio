import { resolveSchema, SchemaLike } from '@cogitatio/core'
import { IDecoder } from '@cogitatio/extra'
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common'
import { memoize, objectSerializer } from './utils'

// @internal
export const decoderSymbol = Symbol('Decoder')

// @internal
export const pipeClasses = new Map()

export const CogitatioPipe = memoize(
  (schemaLike?: SchemaLike): Type<PipeTransform> => {
    @Injectable()
    class Pipe implements PipeTransform<any, any> {
      constructor(
        @Inject(decoderSymbol)
        private readonly decoder: IDecoder<unknown>,
      ) {}

      public transform(value: any, metadata: ArgumentMetadata) {
        const schema = schemaLike
          ? resolveSchema(schemaLike)
          : metadata.metatype
        if (!schema || schema === Object) {
          throw new Error('can not find schema')
        }
        return this.decoder.decode(schema, value)
      }
    }

    pipeClasses.set(objectSerializer(Pipe), Pipe)

    return Pipe
  },
  () => global,
  schema => {
    if (!schema) {
      return ''
    }
    return objectSerializer(resolveSchema(schema))
  },
)
