import { Controller, Post } from '@nestjs/common'
import { SendEmailPayload } from './dto'
import { EmailAdapter } from './email.adapter'

@Controller()
export class EmailController {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  @Post('/emails')
  public async sendEmail(payload: SendEmailPayload): Promise<void> {
    await this.emailAdapter.sendMessage(payload)
  }
}
