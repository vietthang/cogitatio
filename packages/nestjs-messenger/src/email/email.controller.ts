import { Controller, Post } from '@nestjs/common'
import { SendEmailPayload, SendEmailResponse } from './dto'
import { EmailAdapter } from './email.adapter'

@Controller()
export class EmailController {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  @Post('/emails')
  public async sendEmail(
    payload: SendEmailPayload,
  ): Promise<SendEmailResponse> {
    return this.emailAdapter.sendMessage(payload)
  }
}
