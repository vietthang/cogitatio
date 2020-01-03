import { SendEmailPayload, SendEmailResponse } from './dto'
import { EmailAdapter } from './email.adapter'

export class NullEmailAdapter extends EmailAdapter {
  public sendMessage(_: SendEmailPayload): Promise<SendEmailResponse> {
    throw new Error('Method not implemented.')
  }
}
