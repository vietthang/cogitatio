import { List, Optional, Property } from '@cogitatio/core'
import { PhoneNumber } from '@cogitatio/extra'

export class SendSmsPayload {
  @Property(Optional(String))
  public senderId?: string

  @Property(List(PhoneNumber))
  public recipients!: PhoneNumber[]

  @Property(String)
  public content!: string
}

export abstract class SmsAdapter {
  public abstract async sendSms(payload: SendSmsPayload): Promise<void>
}
