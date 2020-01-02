import { Controller, Post } from '@nestjs/common'
import { PushAdapter, SendNotificationPayload } from './push.adapter'

@Controller()
export class PushController {
  constructor(private readonly pushAdapter: PushAdapter) {}

  @Post('/notifications')
  public async sendMessage(payload: SendNotificationPayload): Promise<void> {
    await this.pushAdapter.sendMessage(payload)
  }
}
