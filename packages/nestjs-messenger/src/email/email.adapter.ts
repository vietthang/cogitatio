import { SendEmailPayload, SendEmailResponse } from './dto'

export abstract class EmailAdapter {
  public abstract sendMessage(
    payload: SendEmailPayload,
  ): Promise<SendEmailResponse>
}
