import { Any, Encoder, JsonValue, Resolve, TaggedUnion } from '@cogitatio/core'
import { JSON_CODEC_SYMBOL } from '@cogitatio/nestjs-validation'
import { DynamicModule, Global, Module } from '@nestjs/common'
import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ValueProvider,
} from '@nestjs/common/interfaces'
import { AwsSmsAdapter } from './aws/aws.sms.adapter'
import { HttpSmsAdapter, HttpSmsAdapterOptions } from './http/http.sms.adapter'
import { NullSmsAdapter } from './null.sms.adapter'
import { SmsAdapter } from './sms.adapter'
import { SmsController } from './sms.controller'

export const SmsAdapterOptions = TaggedUnion({
  aws: Any,
  http: HttpSmsAdapterOptions,
})

export type SmsAdapterOptions = Resolve<typeof SmsAdapterOptions>

export declare type Provider<T = any> =
  | Omit<ClassProvider<T>, 'provide'>
  | Omit<ValueProvider<T>, 'provide'>
  | Omit<FactoryProvider<T>, 'provide'>
  | Omit<ExistingProvider<T>, 'provide'>

export interface ForRootOptions {
  readonly adapter: Provider<SmsAdapterOptions | SmsAdapter | undefined>
  readonly withControllers?: boolean
}

@Global()
@Module({})
export class SmsModule {
  public static forRoot(options: ForRootOptions): DynamicModule {
    return {
      module: SmsModule,
      providers: [
        {
          provide: '__nestjs_messenger_sms_options',
          ...options.adapter,
        },
        {
          provide: SmsAdapter,
          useFactory: (
            jsonEncoder: Encoder<JsonValue>,
            adapter: SmsAdapter | SmsAdapterOptions | undefined,
          ): SmsAdapter => {
            if (!adapter) {
              return new NullSmsAdapter()
            }

            if (adapter instanceof SmsAdapter) {
              return adapter
            }

            switch (adapter.type) {
              case 'aws':
                return new AwsSmsAdapter()
              case 'http':
                return new HttpSmsAdapter(jsonEncoder, adapter.http)
            }
          },
          inject: [JSON_CODEC_SYMBOL, '__nestjs_messenger_sms_options'],
        },
      ],
      controllers: options.withControllers ? [SmsController] : [],
      exports: [SmsAdapter],
    }
  }
}
