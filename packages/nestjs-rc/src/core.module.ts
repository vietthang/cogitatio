import { Decoder, Resolve, SchemaLike } from '@cogitatio/core'
import { DECODER_SYMBOL } from '@cogitatio/nestjs-validation'
import { DynamicModule, Global } from '@nestjs/common'
import rc from 'rc'
import {
  CONFIG_DECODER_SYMBOL,
  CONFIG_SYMBOL,
  registeredProviders,
} from './common'

export interface CoreModuleOptions<S extends SchemaLike> {
  name: string
  schema: S
  defaultConfig?: Resolve<S>
  decoder?: Decoder<unknown>
}

@Global()
export class CoreModule {
  public static forRoot<S extends SchemaLike>({
    name,
    schema,
    defaultConfig,
    decoder,
  }: CoreModuleOptions<S>): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: CONFIG_DECODER_SYMBOL,
          useFactory(injectedDecoder?: Decoder<unknown>) {
            const theDecoder = decoder || injectedDecoder
            if (!theDecoder) {
              throw new Error('can not find decoder')
            }
            return theDecoder
          },
          inject: [DECODER_SYMBOL],
        },
        {
          provide: CONFIG_SYMBOL,
          useFactory(decoder: Decoder<unknown>) {
            const raw = rc(name, defaultConfig)

            return decoder.decode(schema, raw)
          },
          inject: [CONFIG_DECODER_SYMBOL],
        },
        ...registeredProviders,
      ],
      exports: [
        CONFIG_SYMBOL,
        CONFIG_DECODER_SYMBOL,
        ...registeredProviders.map(provider => provider.provide),
      ],
    }
  }
}
