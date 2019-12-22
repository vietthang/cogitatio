import { Decoder, Resolve, SchemaLike, ValidationError } from '@cogitatio/core'
import { internal } from '@cogitatio/errors'
import { Abstract, FactoryProvider, Type } from '@nestjs/common/interfaces'
import { either } from 'fp-ts'

export const CONFIG_SYMBOL = '___nestjs_utils_Config'

export const CONFIG_DECODER_SYMBOL = '___nestjs_utils_ConfigDecoder'

export const registeredProviders: FactoryProvider[] = []

export function registerProvider<S extends SchemaLike>(
  provide: string | symbol | Type<Resolve<S>> | Abstract<Resolve<S>>,
  schema: S,
  ...keys: string[]
): FactoryProvider {
  const provider = {
    provide,
    useFactory(config: any, decoder: Decoder<unknown>) {
      const raw = keys.reduce((prev, key) => {
        if (prev === undefined || prev === null) {
          return prev
        }
        return config[key]
      }, config)
      const validation = decoder.decode(schema, raw)

      return either.getOrElse<ValidationError[], Resolve<S>>(errors => {
        throw internal({ extra: errors })
      })(validation)
    },
    inject: [CONFIG_SYMBOL, CONFIG_DECODER_SYMBOL],
  }
  registeredProviders.push(provider)
  return provider
}
