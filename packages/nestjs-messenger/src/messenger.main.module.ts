import { Module } from '@nestjs/common'
import { EmailModule } from './email/email.module'
import { MessengerConfig } from './messenger.config'
import { PushModule } from './push/push.module'
import { SmsModule } from './sms/sms.module'

@Module({
  imports: [
    import('@cogitatio/nestjs-rc').then(({ RcModule }) =>
      RcModule.forRoot({ name: 'messenger', schema: MessengerConfig }),
    ),
    EmailModule.forRoot({
      adapter: {
        useFactory: (config: MessengerConfig) => {
          return config.email
        },
        inject: [MessengerConfig],
      },
      withControllers: true,
    }),
    SmsModule.forRoot({
      adapter: {
        useFactory: (config: MessengerConfig) => {
          return config.sms
        },
        inject: [MessengerConfig],
      },
      withControllers: true,
    }),
    PushModule.forRoot({
      adapter: {
        useFactory: (config: MessengerConfig) => {
          return config.push
        },
        inject: [MessengerConfig],
      },
      withControllers: true,
    }),
  ],
})
export class MessengerMainModule {}
