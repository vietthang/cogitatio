import { Decoder, JsonCodec } from '@cogitatio/core'
import { DynamicModule, Global } from '@nestjs/common'
import { DECODER_SYMBOL, registeredProviders } from './common'

export interface CoreModuleOptions {
  decoder?: Decoder<unknown>
}

async function makeDefaultDecoder(): Promise<Decoder<unknown>> {
  return new JsonCodec()
}

@Global()
export class CoreModule {
  public static forRoot({ decoder }: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: DECODER_SYMBOL,
          useFactory() {
            return decoder || makeDefaultDecoder()
          },
        },
        ...registeredProviders,
      ],
      exports: [
        DECODER_SYMBOL,
        ...registeredProviders.map(provider => provider.provide),
      ],
    }
  }
}
