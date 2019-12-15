import { Decoder, Resolve, SchemaLike } from '@cogitatio/core'
import { Abstract, FactoryProvider, Type } from '@nestjs/common/interfaces'

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
      return decoder.decode(
        schema,
        keys.reduce((prev, key) => {
          if (prev === undefined || prev === null) {
            return prev
          }
          return config[key]
        }, config),
      )
    },
    inject: [CONFIG_SYMBOL, CONFIG_DECODER_SYMBOL],
  }
  registeredProviders.push(provider)
  return provider
}
