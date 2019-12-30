import { Decoder, JsonCodec, JsonValue } from '@cogitatio/core'
import { DynamicModule, Global } from '@nestjs/common'
import { JSON_CODEC_SYMBOL, registeredProviders } from './common'

export interface CoreModuleOptions {
  decoder?: Decoder<JsonValue>
}

async function makeDefaultDecoder(): Promise<Decoder<JsonValue>> {
  return new JsonCodec()
}

@Global()
export class CoreModule {
  public static forRoot({ decoder }: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: JSON_CODEC_SYMBOL,
          useFactory() {
            return decoder || makeDefaultDecoder()
          },
        },
        ...registeredProviders,
      ],
      exports: [
        JSON_CODEC_SYMBOL,
        ...registeredProviders.map(provider => provider.provide),
      ],
    }
  }
}
