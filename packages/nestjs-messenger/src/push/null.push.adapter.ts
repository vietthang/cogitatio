import { PushAdapter, SendNotificationPayload } from './push.adapter'

export class NullPushAdapter extends PushAdapter {
  public sendMessage(_: SendNotificationPayload): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
