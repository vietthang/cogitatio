import { Any, Encoder, JsonValue, Resolve, TaggedUnion } from '@cogitatio/core'
import { JSON_CODEC_SYMBOL } from '@cogitatio/nestjs-validation'
import { DynamicModule, Global, Module } from '@nestjs/common'
import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ValueProvider,
} from '@nestjs/common/interfaces'
import { AwsPushAdapter } from './aws/aws.push.adapter'
import {
  HttpPushAdapter,
  HttpPushAdapterOptions,
} from './http/http.push.adapter'
import { NullPushAdapter } from './null.push.adapter'
import { PushAdapter } from './push.adapter'
import { PushController } from './push.controller'

export const PushAdapterOptions = TaggedUnion({
  aws: Any,
  http: HttpPushAdapterOptions,
})

export type PushAdapterOptions = Resolve<typeof PushAdapterOptions>

export declare type Provider<T = any> =
  | Omit<ClassProvider<T>, 'provide'>
  | Omit<ValueProvider<T>, 'provide'>
  | Omit<FactoryProvider<T>, 'provide'>
  | Omit<ExistingProvider<T>, 'provide'>

export interface ForRootOptions {
  readonly adapter: Provider<PushAdapterOptions | PushAdapter | undefined>
  readonly withControllers?: boolean
}

@Global()
@Module({})
export class PushModule {
  public static forRoot(options: ForRootOptions): DynamicModule {
    return {
      module: PushModule,
      providers: [
        {
          provide: '__nestjs_messenger_push_options',
          ...options.adapter,
        },
        {
          provide: PushAdapter,
          useFactory: (
            jsonEncoder: Encoder<JsonValue>,
            adapter: PushAdapter | PushAdapterOptions | undefined,
          ): PushAdapter => {
            if (!adapter) {
              return new NullPushAdapter()
            }

            if (adapter instanceof PushAdapter) {
              return adapter
            }

            switch (adapter.type) {
              case 'aws':
                return new AwsPushAdapter(jsonEncoder)
              case 'http':
                return new HttpPushAdapter(jsonEncoder, adapter.http)
            }
          },
          inject: [JSON_CODEC_SYMBOL, '__nestjs_messenger_push_options'],
        },
      ],
      controllers: options.withControllers ? [PushController] : [],
      exports: [PushAdapter],
    }
  }
}
