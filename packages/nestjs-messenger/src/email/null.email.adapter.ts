import { SendEmailPayload } from './dto'
import { EmailAdapter } from './email.adapter'

export class NullEmailAdapter extends EmailAdapter {
  public sendMessage(_: SendEmailPayload): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
