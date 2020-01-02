import { Any, Encoder, JsonValue, Resolve, TaggedUnion } from '@cogitatio/core'
import { JSON_CODEC_SYMBOL } from '@cogitatio/nestjs-validation'
import { DynamicModule, Global, Module } from '@nestjs/common'
import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ValueProvider,
} from '@nestjs/common/interfaces'
import { AwsEmailAdapter } from './aws/aws.email.adapter'
import { EmailAdapter } from './email.adapter'
import { EmailController } from './email.controller'
import {
  HttpEmailAdapter,
  HttpEmailAdapterOptions,
} from './http/http.email.adapter'
import { NullEmailAdapter } from './null.email.adapter'
import {
  SmtpEmailAdapter,
  SmtpEmailAdapterOptions,
} from './smtp/smtp.email.adapter'

export const EmailAdapterOptions = TaggedUnion({
  smtp: SmtpEmailAdapterOptions,
  aws: Any,
  http: HttpEmailAdapterOptions,
})

export type EmailAdapterOptions = Resolve<typeof EmailAdapterOptions>

export declare type Provider<T = any> =
  | Omit<ClassProvider<T>, 'provide'>
  | Omit<ValueProvider<T>, 'provide'>
  | Omit<FactoryProvider<T>, 'provide'>
  | Omit<ExistingProvider<T>, 'provide'>

export interface ForRootOptions {
  readonly adapter: Provider<EmailAdapterOptions | EmailAdapter | undefined>
  readonly withControllers?: boolean
}

@Global()
@Module({})
export class EmailModule {
  public static forRoot(options: ForRootOptions): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        {
          provide: '__nestjs_messenger_options',
          ...options.adapter,
        },
        {
          provide: EmailAdapter,
          useFactory: (
            jsonEncoder: Encoder<JsonValue>,
            adapter: EmailAdapter | EmailAdapterOptions | undefined,
          ): EmailAdapter => {
            if (!adapter) {
              return new NullEmailAdapter()
            }

            if (adapter instanceof EmailAdapter) {
              return adapter
            }

            switch (adapter.type) {
              case 'aws':
                return new AwsEmailAdapter()
              case 'smtp':
                return new SmtpEmailAdapter(adapter.smtp)
              case 'http':
                return new HttpEmailAdapter(jsonEncoder, adapter.http)
            }
          },
          inject: [JSON_CODEC_SYMBOL, '__nestjs_messenger_options'],
        },
      ],
      controllers: options.withControllers ? [EmailController] : [],
      exports: [EmailAdapter],
    }
  }
}
