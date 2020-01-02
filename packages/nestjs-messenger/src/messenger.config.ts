import { Optional, Property } from '@cogitatio/core'
import { EmailAdapterOptions } from './email/email.module'
import { PushAdapterOptions } from './push/push.module'
import { SmsAdapterOptions } from './sms/sms.module'

export class MessengerConfig {
  @Property(Optional(EmailAdapterOptions))
  public email?: EmailAdapterOptions

  @Property(Optional(PushAdapterOptions))
  public push?: PushAdapterOptions

  @Property(Optional(SmsAdapterOptions))
  public sms?: SmsAdapterOptions
}
