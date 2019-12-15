import { Decoder } from '@cogitatio/core'
import { DynamicModule, Global } from '@nestjs/common'
import { DECODER_SYMBOL, registeredProviders } from './common'

export interface CoreModuleOptions {
  decoder?: Decoder<unknown>
}

async function makeDefaultDecoder(): Promise<Decoder<unknown>> {
  // import dynamically to allow "@cogitatio/joi" stay in peerDependencies and not included if not required
  const { JoiDecoder } = await import('@cogitatio/joi')

  return new JoiDecoder()
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
