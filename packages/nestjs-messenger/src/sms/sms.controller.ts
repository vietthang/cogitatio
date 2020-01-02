import { Controller, Post } from '@nestjs/common'
import { SendSmsPayload, SmsAdapter } from './sms.adapter'

@Controller()
export class SmsController {
  constructor(private readonly smsAdapter: SmsAdapter) {}

  @Post('/smses')
  public async sendMessage(payload: SendSmsPayload): Promise<void> {
    await this.smsAdapter.sendSms(payload)
  }
}
