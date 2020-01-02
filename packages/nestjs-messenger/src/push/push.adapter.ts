import { List, Optional, Property } from '@cogitatio/core'
import { AndroidConfig } from './android.dto'
import { ApnsConfig } from './ios.dto'

export class MessagePayload {
  @Property(String)
  public title!: string

  @Property(String)
  public body!: string

  @Property(Optional(AndroidConfig))
  public android?: AndroidConfig

  @Property(Optional(ApnsConfig))
  public apns?: ApnsConfig
}

export class SendNotificationPayload {
  @Property(List(String))
  public tokens!: string[]

  @Property(MessagePayload)
  public message!: MessagePayload
}

export abstract class PushAdapter {
  public abstract sendMessage(payload: SendNotificationPayload): Promise<void>
}
